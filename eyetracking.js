// =============================================================================
// MEDIAPIPE EYE TRACKING IMPLEMENTATION (BLEND SHAPES)
// =============================================================================

// Configuration object (will be loaded from config.js)
// Note: This is a reference - actual config is in config.js
// Global variables are declared in main.js

// Import MediaPipe Vision Tasks
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision;

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
        this.faceLandmarker = null;
        this.videoElement = null;
        this.isActive = false;
        this.callback = null;
        this.runningMode = "VIDEO";
        this.lastVideoTime = -1;
        this.webcamRunning = false;

        // Smoothed blend shape values
        this.smoothedBlendShapes = {
            eyeLookUpLeft: 0,
            eyeLookUpRight: 0,
            eyeLookDownLeft: 0,
            eyeLookDownRight: 0,
            eyeLookInLeft: 0,
            eyeLookInRight: 0,
            eyeLookOutLeft: 0,
            eyeLookOutRight: 0
        };

        // Canvas for visualization
        this.canvas = null;
        this.ctx = null;
        this.drawingUtils = null;

        // Dragging state
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
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

            console.log('[EYE] Camera stream obtained');

            this.videoElement.srcObject = stream;
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.muted = true;

            // Initialize visualization canvas
            this.canvas = document.getElementById('eyeVisualization');
            if (!this.canvas) {
                console.error('[EYE] eyeVisualization canvas not found!');
                throw new Error('Canvas element not found');
            }
            this.ctx = this.canvas.getContext('2d');
            this.canvas.style.display = 'block';
            this.canvas.style.position = 'absolute';
            this.canvas.style.cursor = 'move';
            console.log('[EYE] Canvas initialized:', this.canvas.width, 'x', this.canvas.height);

            // Add dragging event listeners
            this.setupDragging();

            console.log('[EYE] Initializing MediaPipe Face Landmarker...');

            // Create Face Landmarker with blend shapes enabled
            const filesetResolver = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );

            this.faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                    delegate: "GPU"
                },
                outputFaceBlendshapes: true,
                runningMode: this.runningMode,
                numFaces: 1
            });

            // Wait for video to be ready (with timeout)
            console.log('[EYE] Waiting for video to load...');
            await Promise.race([
                new Promise((resolve) => {
                    this.videoElement.addEventListener('loadeddata', resolve, { once: true });
                }),
                new Promise((resolve) => setTimeout(resolve, 3000)) // 3 second timeout
            ]);

            console.log('[EYE] Video loaded (or timeout), starting playback...');

            // Start video playback
            try {
                await this.videoElement.play();
                console.log('[EYE] Video playback started successfully');
            } catch (playError) {
                console.warn('[EYE] Video autoplay failed:', playError);
                // Try to play on user interaction
                document.addEventListener('click', async () => {
                    try {
                        await this.videoElement.play();
                        console.log('[EYE] Video started after user interaction');
                    } catch (e) {
                        console.error('[EYE] Failed to start video:', e);
                    }
                }, { once: true });
            }

            this.drawingUtils = new DrawingUtils(this.ctx);
            console.log('[EYE] DrawingUtils initialized');

            console.log('[EYE] Eye tracking initialized successfully');
            const gazeIndicator = document.getElementById('gazeIndicator');
            if (gazeIndicator) {
                gazeIndicator.textContent = '✓ Eye Tracking Active';
                gazeIndicator.classList.add('active');
            }

            return true;
        } catch (error) {
            console.error('[EYE] Initialization error:', error);
            const gazeIndicator = document.getElementById('gazeIndicator');
            if (gazeIndicator) {
                gazeIndicator.textContent = '❌ Camera Error - Using Keyboard';
                gazeIndicator.classList.add('error');
            }
            return false;
        }
    }

    setupDragging() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            this.dragOffsetX = e.clientX - rect.left;
            this.dragOffsetY = e.clientY - rect.top;
            this.canvas.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const newLeft = e.clientX - this.dragOffsetX;
            const newTop = e.clientY - this.dragOffsetY;

            this.canvas.style.left = `${newLeft}px`;
            this.canvas.style.top = `${newTop}px`;
        });

        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = 'move';
            }
        });

        // Touch support for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.dragOffsetX = touch.clientX - rect.left;
            this.dragOffsetY = touch.clientY - rect.top;
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();

            const touch = e.touches[0];
            const newLeft = touch.clientX - this.dragOffsetX;
            const newTop = touch.clientY - this.dragOffsetY;

            this.canvas.style.left = `${newLeft}px`;
            this.canvas.style.top = `${newTop}px`;
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    async predictWebcam() {
        if (!this.webcamRunning || !this.videoElement) {
            console.log('[EYE] Prediction loop stopped: webcamRunning=', this.webcamRunning, 'videoElement=', !!this.videoElement);
            return;
        }

        const startTimeMs = performance.now();

        // Only process if video time has changed
        if (this.lastVideoTime !== this.videoElement.currentTime) {
            this.lastVideoTime = this.videoElement.currentTime;
            try {
                const results = this.faceLandmarker.detectForVideo(this.videoElement, startTimeMs);
                this.processResults(results);
            } catch (detectError) {
                console.error('[EYE] Detection error:', detectError);
            }
        }

        // Continue prediction loop
        window.requestAnimationFrame(() => this.predictWebcam());
    }

    processResults(results) {
        if (!results.faceBlendshapes || results.faceBlendshapes.length === 0) {
            if (this.callback) {
                this.callback(null);
            }
            this.clearCanvas();
            return;
        }

        const blendShapes = results.faceBlendshapes[0].categories;
        const direction = this.calculateEyeDirection(blendShapes);

        // Draw visualization (with error handling)
        try {
            this.drawVisualization(results, blendShapes);
        } catch (drawError) {
            console.error('[EYE] Draw error:', drawError);
        }

        if (this.callback) {
            this.callback(direction);
        }
    }

    calculateEyeDirection(blendShapes) {
        // Extract the 8 eye blend shape values
        const getBlendShapeValue = (name) => {
            const shape = blendShapes.find(s => s.categoryName === name || s.displayName === name);
            return shape ? shape.score : 0;
        };

        const eyeLookUpLeft = getBlendShapeValue('eyeLookUpLeft');
        const eyeLookUpRight = getBlendShapeValue('eyeLookUpRight');
        const eyeLookDownLeft = getBlendShapeValue('eyeLookDownLeft');
        const eyeLookDownRight = getBlendShapeValue('eyeLookDownRight');
        const eyeLookInLeft = getBlendShapeValue('eyeLookInLeft');
        const eyeLookInRight = getBlendShapeValue('eyeLookInRight');
        const eyeLookOutLeft = getBlendShapeValue('eyeLookOutLeft');
        const eyeLookOutRight = getBlendShapeValue('eyeLookOutRight');

        // Apply smoothing to reduce jitter
        const alpha = EYE_DETECTION_CONFIG.SMOOTHING_FACTOR;
        this.smoothedBlendShapes.eyeLookUpLeft = alpha * eyeLookUpLeft + (1 - alpha) * this.smoothedBlendShapes.eyeLookUpLeft;
        this.smoothedBlendShapes.eyeLookUpRight = alpha * eyeLookUpRight + (1 - alpha) * this.smoothedBlendShapes.eyeLookUpRight;
        this.smoothedBlendShapes.eyeLookDownLeft = alpha * eyeLookDownLeft + (1 - alpha) * this.smoothedBlendShapes.eyeLookDownLeft;
        this.smoothedBlendShapes.eyeLookDownRight = alpha * eyeLookDownRight + (1 - alpha) * this.smoothedBlendShapes.eyeLookDownRight;
        this.smoothedBlendShapes.eyeLookInLeft = alpha * eyeLookInLeft + (1 - alpha) * this.smoothedBlendShapes.eyeLookInLeft;
        this.smoothedBlendShapes.eyeLookInRight = alpha * eyeLookInRight + (1 - alpha) * this.smoothedBlendShapes.eyeLookInRight;
        this.smoothedBlendShapes.eyeLookOutLeft = alpha * eyeLookOutLeft + (1 - alpha) * this.smoothedBlendShapes.eyeLookOutLeft;
        this.smoothedBlendShapes.eyeLookOutRight = alpha * eyeLookOutRight + (1 - alpha) * this.smoothedBlendShapes.eyeLookOutRight;

        // Combine both eyes into directional pairs
        const up_score = (this.smoothedBlendShapes.eyeLookUpLeft + this.smoothedBlendShapes.eyeLookUpRight) / 2;
        const down_score = (this.smoothedBlendShapes.eyeLookDownLeft + this.smoothedBlendShapes.eyeLookDownRight) / 2;
        // Reverted to original logic:
        const left_score = (this.smoothedBlendShapes.eyeLookOutLeft + this.smoothedBlendShapes.eyeLookInRight) / 2;  // looking LEFT
        const right_score = (this.smoothedBlendShapes.eyeLookInLeft + this.smoothedBlendShapes.eyeLookOutRight) / 2; // looking RIGHT

        if (EYE_DETECTION_CONFIG.DEBUG_MODE) {
            console.log(`[EYE] UP: ${up_score.toFixed(3)}, DOWN: ${down_score.toFixed(3)}, LEFT: ${left_score.toFixed(3)}, RIGHT: ${right_score.toFixed(3)}`);
        }

        // Determine direction based on thresholds
        if (up_score > EYE_DETECTION_CONFIG.UP_THRESHOLD) {
            return 'up';
        } else if (down_score > EYE_DETECTION_CONFIG.DOWN_THRESHOLD) {
            return 'down';
        } else if (left_score > EYE_DETECTION_CONFIG.LEFT_THRESHOLD) {
            return 'left';
        } else if (right_score > EYE_DETECTION_CONFIG.RIGHT_THRESHOLD) {
            return 'right';
        }

        return null;
    }

    onDirectionDetected(callback) {
        this.callback = callback;
    }

    clearCanvas() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawVisualization(results, blendShapes) {
        if (!this.ctx || !this.videoElement) {
            console.warn('[EYE] Cannot draw: context or video missing');
            return;
        }

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw video frame
        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;

        if (videoWidth > 0 && videoHeight > 0) {
            // Calculate aspect ratio scaling
            const videoAspect = videoWidth / videoHeight;
            const canvasAspect = width / height;

            let drawWidth, drawHeight, drawX, drawY;
            if (videoAspect > canvasAspect) {
                drawHeight = height;
                drawWidth = height * videoAspect;
                drawX = (width - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = width;
                drawHeight = width / videoAspect;
                drawX = 0;
                drawY = (height - drawHeight) / 2;
            }

            ctx.drawImage(this.videoElement, drawX, drawY, drawWidth, drawHeight);

            // Draw face landmarks if available
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                const landmarks = results.faceLandmarks[0];

                // Save context and apply scaling for landmarks
                ctx.save();
                ctx.translate(drawX, drawY);
                ctx.scale(drawWidth, drawHeight);

                // Draw eyes using DrawingUtils
                this.drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
                    { color: "#FF3030", lineWidth: 1 }
                );
                this.drawingUtils.drawConnectors(
                    landmarks,
                    FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
                    { color: "#30FF30", lineWidth: 1 }
                );

                ctx.restore();
            }
        }

        // Draw blend shape values
        this.drawBlendShapeValues(blendShapes, 10, 30);
    }

    drawBlendShapeValues(blendShapes, x, y) {
        const ctx = this.ctx;

        // Extract eye blend shape values
        const getBlendShapeValue = (name) => {
            const shape = blendShapes.find(s => s.categoryName === name || s.displayName === name);
            return shape ? shape.score : 0;
        };

        const values = {
            'Up Left': getBlendShapeValue('eyeLookUpLeft'),
            'Up Right': getBlendShapeValue('eyeLookUpRight'),
            'Down Left': getBlendShapeValue('eyeLookDownLeft'),
            'Down Right': getBlendShapeValue('eyeLookDownRight'),
            'In Left': getBlendShapeValue('eyeLookInLeft'),
            'In Right': getBlendShapeValue('eyeLookInRight'),
            'Out Left': getBlendShapeValue('eyeLookOutLeft'),
            'Out Right': getBlendShapeValue('eyeLookOutRight')
        };

        // Calculate directional scores
        const up_score = (values['Up Left'] + values['Up Right']) / 2;
        const down_score = (values['Down Left'] + values['Down Right']) / 2;
        // Match the logic from calculateEyeDirection (reverted to original)
        const left_score = (values['Out Left'] + values['In Right']) / 2;
        const right_score = (values['In Left'] + values['Out Right']) / 2;

        // Save context and apply horizontal flip for text
        ctx.save();
        ctx.scale(-1, 1);
        const flippedX = -x - 200; // Adjust x position for flipped coordinates

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(flippedX + 55, y - 20, 140, 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';

        let lineY = y;
        const textX = flippedX + 60; // Align text with the rectangle
        ctx.fillText(`UP:    ${up_score.toFixed(3)}`, textX, lineY);
        lineY += 15;
        ctx.fillText(`DOWN:  ${down_score.toFixed(3)}`, textX, lineY);
        lineY += 15;
        ctx.fillText(`LEFT:  ${left_score.toFixed(3)}`, textX, lineY);
        lineY += 15;
        ctx.fillText(`RIGHT: ${right_score.toFixed(3)}`, textX, lineY);
        lineY += 20;

        // Draw threshold indicators
        ctx.fillStyle = '#ffff00';
        ctx.font = '11px monospace';
        ctx.fillText(`Thresholds:`, textX, lineY);
        lineY += 15;
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`U:${EYE_DETECTION_CONFIG.UP_THRESHOLD.toFixed(2)} D:${EYE_DETECTION_CONFIG.DOWN_THRESHOLD.toFixed(2)}`, textX, lineY);
        lineY += 12;
        ctx.fillText(`L:${EYE_DETECTION_CONFIG.LEFT_THRESHOLD.toFixed(2)} R:${EYE_DETECTION_CONFIG.RIGHT_THRESHOLD.toFixed(2)}`, textX, lineY);

        ctx.restore();
    }

    start() {
        console.log('[EYE] Starting prediction loop...');
        this.isActive = true;
        this.webcamRunning = true;
        this.predictWebcam();
    }

    stop() {
        this.isActive = false;
        this.webcamRunning = false;
        if (this.videoElement && this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// =============================================================================
// DIRECTION HANDLING WITH STABILITY CHECK
// =============================================================================

function handleDirectionDetection(direction) {
    let gazeIndicator = document.getElementById('gazeIndicator');

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
        if (gazeIndicator) gazeIndicator.textContent = '👁️ Eye Tracking Active';
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
    gazeIndicator = document.getElementById('gazeIndicator');
    if (gazeIndicator) gazeIndicator.textContent = `${directionEmoji[direction]} Hold position...`;

    // Start hold timer
    directionHoldTimer = setTimeout(() => {
        console.log(`[EYE] Action triggered: ${direction.toUpperCase()}`);
        executeDirectionAction(direction);
        currentDirection = null;
        lastStableDirection = null;
        directionStabilityCounter = 0;
        gazeIndicator = document.getElementById('gazeIndicator');
        if (gazeIndicator) {
            gazeIndicator.textContent = '✓ Action executed!';
            setTimeout(() => {
                gazeIndicator.textContent = '👁️ Eye Tracking Active';
            }, 500);
        }
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

// Make functions available globally
window.EyeDirectionTracker = EyeDirectionTracker;
window.initializeEyeTracking = initializeEyeTracking;
window.handleDirectionDetection = handleDirectionDetection;
window.executeDirectionAction = executeDirectionAction;
