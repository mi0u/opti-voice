// =============================================================================
// EYE DETECTION SENSITIVITY CONFIGURATION
// =============================================================================
const EYE_DETECTION_CONFIG = {
    // Horizontal threshold: how far iris must be from eye center (0.0 to 1.0)
    // Higher = requires more extreme eye movement
    HORIZONTAL_THRESHOLD: 0.18,  // 0.4-0.5 recommended for "looking off screen"

    // Vertical threshold: how far iris must be above eye center (0.0 to 1.0)
    // Higher = requires looking further up - INCREASED for stricter detection
    VERTICAL_THRESHOLD: 0.18,    // 0.4-0.6 recommended - must look significantly UP

    // Hold duration in milliseconds before action triggers
    HOLD_DURATION: 500,          // 700-1000 recommended

    // Minimum consecutive frames direction must be stable
    STABILITY_FRAMES: 5,         // Increased from 3 to 5 for more stability

    // Smoothing factor for iris position (0.0 to 1.0)
    // Higher = more smoothing, less jittery
    SMOOTHING_FACTOR: 0.8,       // 0.5-0.7 recommended

    // Head movement compensation factor (0.0 to 1.0)
    // Lower = less aggressive head movement filtering (we want pure iris movement)
    HEAD_COMPENSATION: 0.3,      // Reduced from 0.7 - minimal compensation

    // Debug mode - shows iris position values in console
    DEBUG_MODE: false,

    // Sound notification when direction is detected
    SOUND_ENABLED: true
};

// Default configuration for reset functionality
const DEFAULT_CONFIG = {
    HORIZONTAL_THRESHOLD: 0.18,
    VERTICAL_THRESHOLD: 0.18,
    HOLD_DURATION: 500,
    STABILITY_FRAMES: 5,
    SMOOTHING_FACTOR: 0.8,
    HEAD_COMPENSATION: 0.3,
    DEBUG_MODE: false,
    SOUND_ENABLED: true
};
