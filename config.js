// =============================================================================
// EYE DETECTION SENSITIVITY CONFIGURATION
// =============================================================================
const EYE_DETECTION_CONFIG = {
    // Eye direction thresholds (0.0 to 1.0)
    // Higher = requires more extreme eye movement
    UP_THRESHOLD: 0.35,       // Looking up
    DOWN_THRESHOLD: 0.6,     // Looking down
    LEFT_THRESHOLD: 0.6,     // Looking left
    RIGHT_THRESHOLD: 0.6,    // Looking right

    // Hold duration in milliseconds before action triggers
    HOLD_DURATION: 500,          // 700-1000 recommended

    // Minimum consecutive frames direction must be stable
    STABILITY_FRAMES: 5,         // Increased from 3 to 5 for more stability

    // Smoothing factor for blend shape values (0.0 to 1.0)
    // Higher = more smoothing, less jittery
    SMOOTHING_FACTOR: 0.8,       // 0.5-0.7 recommended

    // Debug mode - shows blend shape values in console
    DEBUG_MODE: false,

    // Sound notification when direction is detected
    SOUND_ENABLED: true
};

// Default configuration for reset functionality
const DEFAULT_CONFIG = {
    UP_THRESHOLD: 0.35,
    DOWN_THRESHOLD: 0.6,
    LEFT_THRESHOLD: 0.6,
    RIGHT_THRESHOLD: 0.6,
    HOLD_DURATION: 500,
    STABILITY_FRAMES: 5,
    SMOOTHING_FACTOR: 0.8,
    DEBUG_MODE: false,
    SOUND_ENABLED: true
};
