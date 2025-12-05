# Eye-Tracking Communication System

A web-based assistive communication application that uses eye tracking to enable text input and navigation through gaze control.

Inspired by the [Look to Speak](https://experiments.withgoogle.com/look-to-speak) app by Google.

## Features

- **Three-Signal Communication**: Navigate and select using three gaze directions (Left, Right, Up)
- **Real-time Eye Tracking**: Uses MediaPipe Face Mesh for accurate eye tracking
- **Customizable Settings**: Adjust sensitivity, thresholds, and timing parameters
- **Visual Feedback**: Live camera preview and eye visualization
- **Letter Selection**: Efficient text input through gaze-controlled menus
- **Word Suggestions**: Smart text prediction to speed up typing
- **Search Functionality**: Find and insert words or phrases
- **Audio Feedback**: Optional sound notifications on detection

## Requirements

- Modern web browser with webcam support (Chrome, Edge, Firefox)
- Webcam/camera access
- Internet connection (for MediaPipe CDN resources)

## Getting Started

1. Open `index.html` in a web browser
2. Grant camera permissions when prompted
3. Wait for "🎯 Initializing..." to complete
4. Begin using eye movements to interact:
   - **Look Left**: Select from left column and continue
   - **Look Right**: Select from right column and continue
   - **Look Up**: Access special menu

## Settings

Click the ⚙️ Settings button to customize:

- **Vertical Threshold**: Sensitivity for looking up (0.1 = easy, 0.8 = hard)
- **Horizontal Threshold**: Sensitivity for left/right (0.1 = easy, 0.5 = hard)
- **Hold Duration**: How long to maintain gaze (100-2000ms)
- **Stability Frames**: Required frame consistency (2-10 frames)
- **Smoothing Factor**: Reduce jitter (0.1 = responsive, 0.9 = smooth)
- **Head Compensation**: Filter head movements (0 = off, 1.0 = max)

### Display Options
- Toggle eye visualization
- Enable/disable sound feedback

Press 'O' key to log current eye tracking values to console for debugging.

## File Structure

```
v4/
├── index.html              # Main HTML structure
├── styles.css              # Main styles
├── settings-panel.css      # Settings panel styles
├── config.js              # Configuration constants
├── database.js            # Letter and word data
├── suggestions.js         # Text prediction logic
├── storage.js             # Local storage utilities
├── menus.js               # Menu generation and navigation
├── search.js              # Search functionality
├── actions.js             # Text actions and operations
├── eyetracking.js         # Eye tracking core logic
├── settings.js            # Settings panel controls
└── main.js                # Application initialization
```

## Technologies Used

- **MediaPipe Face Mesh**: Face and eye landmark detection
- **JavaScript**: Core application logic
- **HTML5 Canvas**: Eye visualization
- **CSS3**: Responsive UI design
- **Local Storage**: Settings persistence

## Usage Tips

1. **Calibration**: Adjust settings based on your lighting and camera setup
2. **Positioning**: Sit at a comfortable distance with your face clearly visible
3. **Lighting**: Ensure adequate, even lighting on your face
4. **Stability**: Try to keep your head relatively still for best results
5. **Practice**: Spend time getting comfortable with the gaze directions

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (may require experimental features enabled)

## Privacy

All processing happens locally in your browser. No video or eye tracking data is sent to external servers.

## License

[Add your license information here]

## Credits

Built with [MediaPipe](https://mediapipe.dev/) by Google
