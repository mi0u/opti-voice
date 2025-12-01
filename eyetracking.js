// =============================================================================
// MEDIAPIPE EYE TRACKING IMPLEMENTATION
// =============================================================================

// Configuration object (will be loaded from config.js)
// Note: This is a reference - actual config is in config.js
// Global variables are declared in main.js

// Audio context for direction detection tone
let audioContext = null;

function playDetectionTone() {
    if (!EYE_DETECTION_CONFIG.SOUND_ENABLED) return;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // 800Hz tone
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.error('[AUDIO] Failed to play detection tone:', error);
    }
}

class EyeDirectionTracker {
    constructor() {
        this.faceMesh = null;
        this.camera = null;
        this.videoElement = null;
        this.isActive = false;
        this.callback = null;

        // Smoothed iris positions
        this.smoothedLeftIris = { x: 0, y: 0 };
        this.smoothedRightIris = { x: 0, y: 0 };

        // Canvas for eye visualization
        this.canvas = null;
        this.ctx = null;

        // MediaPipe landmark indices
        this.landmarks = {
            leftEye: {
                outer: 33,
                inner: 133,
                top: 159,
                bottom: 145,
                iris: [468, 469, 470, 471, 472],
                // Full eye contour points (upper and lower eyelid)
                contour: [33, 160, 161, 246, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159]
            },
            rightEye: {
                outer: 362,
                inner: 263,
                top: 386,
                bottom: 374,
                iris: [473, 474, 475, 476, 477],
                // Full eye contour points (upper and lower eyelid)
                contour: [362, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382, 362]
            },
            // Head reference points for movement compensation
            nose: 1,
            forehead: 10,
            chin: 152
        };

        // Previous head position for movement detection
        this.prevHeadY = 0;
        this.smoothedHeadY = 0;
    }

    async initialize() {
        try {
            console.log('[EYE] Requesting camera access...');

            this.videoElement = document.createElement('video');
            this.videoElement.style.display = 'none';
            document.body.appendChild(this.videoElement);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: 1280,
                    height: 720,
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = stream;
            videoPreview.srcObject = stream;
            videoPreview.style.display = 'block';

            // Initialize eye visualization canvas
            this.canvas = document.getElementById('eyeVisualization');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.display = 'block';

            console.log('[EYE] Initializing MediaPipe Face Mesh...');

            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => this.processResults(results));

            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.faceMesh.send({ image: this.videoElement });
                },
                width: 1280,
                height: 720
            });

            await this.camera.start();

            console.log('[EYE] Eye tracking initialized successfully');
            gazeIndicator.textContent = '✓ Eye Tracking Active';
            gazeIndicator.classList.add('active');

            return true;
        } catch (error) {
            console.error('[EYE] Initialization error:', error);
            gazeIndicator.textContent = '❌ Camera Error - Using Keyboard';
            gazeIndicator.classList.add('error');
            return false;
        }
    }

    processResults(results) {
        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
            if (this.callback) {
                this.callback(null);
            }
            this.clearCanvas();
            return;
        }

        const landmarks = results.multiFaceLandmarks[0];
        const direction = this.calculateEyeDirection(landmarks);

        // Draw eye visualization
        this.drawEyeVisualization(landmarks);

        if (this.callback) {
            this.callback(direction);
        }
    }

    calculateEyeDirection(landmarks) {
        // Get eye corner and iris positions for both eyes
        const leftEyeData = this.getEyeMetrics(landmarks, this.landmarks.leftEye);
        const rightEyeData = this.getEyeMetrics(landmarks, this.landmarks.rightEye);

        if (!leftEyeData || !rightEyeData) {
            return null;
        }

        // Apply smoothing to reduce jitter
        const alpha = EYE_DETECTION_CONFIG.SMOOTHING_FACTOR;
        this.smoothedLeftIris.x = alpha * leftEyeData.irisX + (1 - alpha) * this.smoothedLeftIris.x;
        this.smoothedLeftIris.y = alpha * leftEyeData.irisY + (1 - alpha) * this.smoothedLeftIris.y;
        this.smoothedRightIris.x = alpha * rightEyeData.irisX + (1 - alpha) * this.smoothedRightIris.x;
        this.smoothedRightIris.y = alpha * rightEyeData.irisY + (1 - alpha) * this.smoothedRightIris.y;

        // Calculate normalized iris positions relative to eye boundaries
        const leftNormalized = this.normalizeIrisPosition(
            this.smoothedLeftIris,
            leftEyeData.outer,
            leftEyeData.inner,
            leftEyeData.top,
            leftEyeData.bottom,
            leftEyeData.eyeHeight,
            leftEyeData.irisBottomRatio
        );

        const rightNormalized = this.normalizeIrisPosition(
            this.smoothedRightIris,
            rightEyeData.outer,
            rightEyeData.inner,
            rightEyeData.top,
            rightEyeData.bottom,
            rightEyeData.eyeHeight,
            rightEyeData.irisBottomRatio
        );

        // Average both eyes for horizontal
        let avgHorizontal = (leftNormalized.horizontal + rightNormalized.horizontal) / 2;

        // For vertical, BOTH eyes must agree they're looking up
        // We take the LESS negative value (the one looking up less)
        // This means both eyes must be looking up significantly
        let avgVertical = Math.max(leftNormalized.vertical, rightNormalized.vertical);

        // Optional minimal head compensation
        const nose = landmarks[this.landmarks.nose];
        const forehead = landmarks[this.landmarks.forehead];
        const chin = landmarks[this.landmarks.chin];
        const headPitch = (nose.y - forehead.y) / (chin.y - forehead.y);

        if (this.smoothedHeadY === undefined) {
            this.smoothedHeadY = headPitch;
        }
        this.smoothedHeadY = alpha * headPitch + (1 - alpha) * this.smoothedHeadY;

        const headCompensation = EYE_DETECTION_CONFIG.HEAD_COMPENSATION;
        const headDeviation = (this.smoothedHeadY - 0.5);

        // Very light compensation
        avgVertical = avgVertical - (headDeviation * headCompensation);

        // Calculate average iris-to-bottom-eyelid ratio (primary up detection metric)
        const avgIrisBottomRatio = (leftNormalized.irisBottomRatio + rightNormalized.irisBottomRatio) / 2;

        // Calculate average eye openness
        const avgEyeOpenness = (leftNormalized.eyeOpenness + rightNormalized.eyeOpenness) / 2;

        // For reference eye openness (calibration baseline)
        // We'll use a moving average approach - store typical openness
        if (!this.baselineEyeOpenness) {
            this.baselineEyeOpenness = avgEyeOpenness;
        } else {
            // Slowly adapt baseline (very slow to avoid drift)
            this.baselineEyeOpenness = 0.99 * this.baselineEyeOpenness + 0.01 * avgEyeOpenness;
        }

        // Calculate eye openness ratio (current / baseline)
        const eyeOpennessRatio = avgEyeOpenness / (this.baselineEyeOpenness > 0 ? this.baselineEyeOpenness : 1);

        if (EYE_DETECTION_CONFIG.DEBUG_MODE) {
            console.log(`[EYE] H: ${avgHorizontal.toFixed(3)}, V: ${avgVertical.toFixed(3)}, IrisBottom: ${avgIrisBottomRatio.toFixed(3)}, EyeOpen: ${eyeOpennessRatio.toFixed(3)} (L:${leftNormalized.vertical.toFixed(3)}, R:${rightNormalized.vertical.toFixed(3)})`);
        }

        // Determine direction based on thresholds
        const absHorizontal = Math.abs(avgHorizontal);

        // UP detection: NEW IMPROVED ALGORITHM
        // Primary: Check iris distance from bottom eyelid
        // When looking up, iris moves away from bottom eyelid
        // Threshold: irisBottomRatio > 0.65 means iris is in upper portion of eye
        //
        // Secondary: Consider eye openness
        // When looking up, eyes often open wider (ratio > 0.9)
        // But this is optional - some people don't open eyes wider
        //
        // Also require minimal horizontal movement
        const irisBottomThreshold = 0.65;  // Iris should be in upper 35% of eye
        const minEyeOpennessRatio = 0.85;   // Eye should be reasonably open

        if (avgIrisBottomRatio > irisBottomThreshold &&
            absHorizontal < EYE_DETECTION_CONFIG.HORIZONTAL_THRESHOLD * 0.9 &&
            eyeOpennessRatio > minEyeOpennessRatio &&
            leftNormalized.irisBottomRatio > irisBottomThreshold * 0.9 &&
            rightNormalized.irisBottomRatio > irisBottomThreshold * 0.9) {
            return 'up';
        }

        // Horizontal checks - REVERSED for mirrored camera
        if (avgHorizontal > EYE_DETECTION_CONFIG.HORIZONTAL_THRESHOLD) {
            return 'left';
        } else if (avgHorizontal < -EYE_DETECTION_CONFIG.HORIZONTAL_THRESHOLD) {
            return 'right';
        }

        return null;
    }

    getEyeMetrics(landmarks, eyeIndices) {
        try {
            const outer = landmarks[eyeIndices.outer];
            const inner = landmarks[eyeIndices.inner];
            const top = landmarks[eyeIndices.top];
            const bottom = landmarks[eyeIndices.bottom];

            // Calculate iris center from 5 iris landmarks
            let irisX = 0, irisY = 0;
            for (let idx of eyeIndices.iris) {
                irisX += landmarks[idx].x;
                irisY += landmarks[idx].y;
            }
            irisX /= eyeIndices.iris.length;
            irisY /= eyeIndices.iris.length;

            // Calculate eye openness (vertical distance between top and bottom)
            const eyeHeight = Math.abs(top.y - bottom.y);

            // Calculate distance from iris to bottom eyelid (key for up detection)
            // When looking up, iris moves away from bottom eyelid
            const irisToBottomDistance = Math.abs(bottom.y - irisY);

            // Normalized ratio: how far is iris from bottom relative to eye height
            // Higher values = iris is further from bottom = looking up
            const irisBottomRatio = irisToBottomDistance / (eyeHeight > 0 ? eyeHeight : 1);

            return {
                outer: outer,
                inner: inner,
                top: top,
                bottom: bottom,
                irisX: irisX,
                irisY: irisY,
                eyeHeight: eyeHeight,
                irisBottomRatio: irisBottomRatio
            };
        } catch (error) {
            return null;
        }
    }

    normalizeIrisPosition(iris, outer, inner, top, bottom, eyeHeight, irisBottomRatio) {
        // Calculate eye dimensions
        const eyeWidth = Math.abs(outer.x - inner.x);
        const eyeCenterX = (outer.x + inner.x) / 2;
        const eyeCenterY = (top.y + bottom.y) / 2;

        // Calculate normalized position (-1 to 1 scale)
        // Horizontal: Negative = left, Positive = right (in camera view)
        const horizontalOffset = (iris.x - eyeCenterX) / (eyeWidth / 2);

        // Vertical: When looking UP, iris.y DECREASES (moves toward top of frame)
        // So: (iris.y - eyeCenterY) will be NEGATIVE when looking up
        // We keep it as is so negative = up, positive = down
        const verticalOffset = (iris.y - eyeCenterY) / (eyeHeight / 2);

        return {
            horizontal: horizontalOffset,
            vertical: verticalOffset,
            eyeOpenness: eyeHeight,
            irisBottomRatio: irisBottomRatio
        };
    }

    onDirectionDetected(callback) {
        this.callback = callback;
    }

    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawEyeVisualization(landmarks) {
        if (!this.ctx || !this.videoElement) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;

        // Get all corner points to find the true outermost positions
        const leftEyeOuter = landmarks[this.landmarks.leftEye.outer];   // Point 33
        const leftEyeInner = landmarks[this.landmarks.leftEye.inner];   // Point 133
        const rightEyeOuter = landmarks[this.landmarks.rightEye.outer]; // Point 362
        const rightEyeInner = landmarks[this.landmarks.rightEye.inner]; // Point 263

        // Find the actual leftmost and rightmost points from all four corners
        const leftmost = Math.min(leftEyeOuter.x, leftEyeInner.x, rightEyeOuter.x, rightEyeInner.x);
        const rightmost = Math.max(leftEyeOuter.x, leftEyeInner.x, rightEyeOuter.x, rightEyeInner.x);

        // Get vertical extent from all eye contour points
        let minY = 1, maxY = 0;
        for (let idx of this.landmarks.leftEye.contour.concat(this.landmarks.rightEye.contour)) {
            minY = Math.min(minY, landmarks[idx].y);
            maxY = Math.max(maxY, landmarks[idx].y);
        }

        // Calculate horizontal distance between the true outermost corners
        const eyeDistance = rightmost - leftmost;

        // Center between the outermost corners
        const eyesCenterX = (leftmost + rightmost) / 2;
        const eyesCenterY = (minY + maxY) / 2;        // Use a fixed crop size based on eye distance with padding
        const horizontalPadding = 0.4; // 40% padding on each side horizontally
        const verticalPadding = 0.8; // 80% padding vertically to show eyebrows and more

        const cropWidth = eyeDistance * (1 + horizontalPadding * 2);
        const cropHeight = cropWidth / 2; // Fixed aspect ratio (2:1)

        // Calculate crop region in normalized coordinates
        const cropMinX = Math.max(0, eyesCenterX - cropWidth / 2);
        const cropMinY = Math.max(0, eyesCenterY - cropHeight / 2);
        const cropMaxX = Math.min(1, eyesCenterX + cropWidth / 2);
        const cropMaxY = Math.min(1, eyesCenterY + cropHeight / 2);

        const finalCropWidth = cropMaxX - cropMinX;
        const finalCropHeight = cropMaxY - cropMinY;

        // Draw cropped video (just the eye region)
        const srcX = cropMinX * videoWidth;
        const srcY = cropMinY * videoHeight;
        const srcWidth = finalCropWidth * videoWidth;
        const srcHeight = finalCropHeight * videoHeight;

        // Scale to fill canvas while maintaining aspect ratio
        const cropAspect = srcWidth / srcHeight;
        const canvasAspect = width / height;

        let drawWidth, drawHeight, drawX, drawY;
        if (cropAspect > canvasAspect) {
            // Crop is wider - fit to height
            drawHeight = height;
            drawWidth = height * cropAspect;
            drawX = (width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Crop is taller - fit to width
            drawWidth = width;
            drawHeight = width / cropAspect;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
        }

        ctx.drawImage(this.videoElement, srcX, srcY, srcWidth, srcHeight, drawX, drawY, drawWidth, drawHeight);

        // Helper function to convert landmark to canvas coordinates
        const toCanvas = (landmark) => {
            // Map normalized landmark to position within the cropped region
            const relX = (landmark.x - cropMinX) / finalCropWidth;
            const relY = (landmark.y - cropMinY) / finalCropHeight;
            return {
                x: drawX + relX * drawWidth,
                y: drawY + relY * drawHeight
            };
        };

        // Draw both eyes with shared coordinate system (labels swapped because canvas is mirrored)
        this.drawEyeRegion(ctx, landmarks, this.landmarks.leftEye, toCanvas, 'Right Eye', 50, 30);
        this.drawEyeRegion(ctx, landmarks, this.landmarks.rightEye, toCanvas, 'Left Eye', 350, 30);
    }

    drawEyeRegion(ctx, landmarks, eyeIndices, toCanvas, label, labelX, labelY) {
        // Draw eye contour (full eyelid shape)
        if (eyeIndices.contour) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.beginPath();

            const firstPoint = toCanvas(landmarks[eyeIndices.contour[0]]);
            ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < eyeIndices.contour.length; i++) {
                const point = toCanvas(landmarks[eyeIndices.contour[i]]);
                ctx.lineTo(point.x, point.y);
            }
            ctx.closePath();
            ctx.stroke();

            // Draw contour points
            ctx.fillStyle = '#00ff00';
            for (let idx of eyeIndices.contour) {
                const point = toCanvas(landmarks[idx]);
                ctx.beginPath();
                ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
        }

        // Draw the 4 main boundary points (larger)
        const outer = landmarks[eyeIndices.outer];
        const inner = landmarks[eyeIndices.inner];
        const top = landmarks[eyeIndices.top];
        const bottom = landmarks[eyeIndices.bottom];

        const outerPos = toCanvas(outer);
        const innerPos = toCanvas(inner);
        const topPos = toCanvas(top);
        const bottomPos = toCanvas(bottom);

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(outerPos.x, outerPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(innerPos.x, innerPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(topPos.x, topPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bottomPos.x, bottomPos.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        // Calculate iris center
        let irisX = 0, irisY = 0;
        for (let idx of eyeIndices.iris) {
            irisX += landmarks[idx].x;
            irisY += landmarks[idx].y;
        }
        irisX /= eyeIndices.iris.length;
        irisY /= eyeIndices.iris.length;

        // Draw all 5 iris landmarks as small points
        ctx.fillStyle = '#ff8800';
        for (let idx of eyeIndices.iris) {
            const irisPoint = toCanvas(landmarks[idx]);
            ctx.beginPath();
            ctx.arc(irisPoint.x, irisPoint.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Draw iris center
        const irisPos = toCanvas({ x: irisX, y: irisY });
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(irisPos.x, irisPos.y, 8, 0, 2 * Math.PI);
        ctx.fill();

        // Draw iris outline
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(irisPos.x, irisPos.y, 12, 0, 2 * Math.PI);
        ctx.stroke();

        // Draw label (counter-flip the text since canvas is mirrored)
        ctx.save();
        ctx.translate(labelX, labelY);
        ctx.scale(-1, 1);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }    start() {
        this.isActive = true;
    }

    stop() {
        this.isActive = false;
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// =============================================================================
// DIRECTION HANDLING WITH STABILITY CHECK
// =============================================================================

function handleDirectionDetection(direction) {
    // No direction detected
    if (!direction) {
        // If we're currently holding a direction (timer is running), be more tolerant
        // Don't immediately cancel - allow brief interruptions
        if (directionHoldTimer && currentDirection) {
            // Keep the timer running, just don't update the counter
            return;
        }

        // Otherwise, reset everything
        if (directionHoldTimer) {
            clearTimeout(directionHoldTimer);
            directionHoldTimer = null;
        }
        currentDirection = null;
        lastStableDirection = null;
        directionStabilityCounter = 0;
        gazeIndicator.textContent = '👁️ Eye Tracking Active';
        return;
    }

    // Check if direction is stable across frames
    if (direction === lastStableDirection) {
        directionStabilityCounter++;
    } else {
        lastStableDirection = direction;
        directionStabilityCounter = 1;
    }

    // Not stable enough yet
    if (directionStabilityCounter < EYE_DETECTION_CONFIG.STABILITY_FRAMES) {
        return;
    }

    // Direction is now stable, check if it's a new direction
    if (direction === currentDirection) {
        return; // Already holding this direction
    }

    // New stable direction detected
    console.log(`[EYE] Stable direction: ${direction.toUpperCase()}`);
    currentDirection = direction;

    // Play detection tone
    playDetectionTone();

    // Clear previous timer
    if (directionHoldTimer) {
        clearTimeout(directionHoldTimer);
    }

    // Update indicator
    const directionEmoji = {
        'left': '⬅️',
        'right': '➡️',
        'up': '⬆️'
    };
    gazeIndicator.textContent = `${directionEmoji[direction]} Hold position...`;

    // Start hold timer
    directionHoldTimer = setTimeout(() => {
        console.log(`[EYE] Action triggered: ${direction.toUpperCase()}`);
        executeDirectionAction(direction);
        currentDirection = null;
        lastStableDirection = null;
        directionStabilityCounter = 0;
        gazeIndicator.textContent = '✓ Action executed!';
        setTimeout(() => {
            gazeIndicator.textContent = '👁️ Eye Tracking Active';
        }, 500);
    }, EYE_DETECTION_CONFIG.HOLD_DURATION);
}

function executeDirectionAction(direction) {
    console.log(`[EYE] executeDirectionAction: ${direction}`);
    if (direction === 'left') {
        selectColumn('left');
    } else if (direction === 'right') {
        selectColumn('right');
    } else if (direction === 'up') {
        toggleSpecialMenu();
    }
}

// Initialize eye tracking
async function initializeEyeTracking() {
    console.log('[EYE] Starting eye tracking initialization...');
    eyeTracker = new EyeDirectionTracker();
    const success = await eyeTracker.initialize();

    if (success) {
        eyeTracker.onDirectionDetected(handleDirectionDetection);
        eyeTracker.start();
        isEyeTrackingActive = true;
        console.log('[EYE] Eye tracking is now active');
    } else {
        isEyeTrackingActive = false;
        console.log('[EYE] Falling back to keyboard controls');
    }
}
