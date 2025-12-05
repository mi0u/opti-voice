# Eye-Tracking Communication System

A web-based assistive communication application that uses eye tracking to enable text input and navigation through gaze control.

Inspired by the [Look to Speak](https://experiments.withgoogle.com/look-to-speak) app by Google.

## Features

- **Four-Signal Communication**: Navigate and select using four gaze directions (Left, Right, Up, Down) - or use three signals by disabling Down
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
- Internet connection (for MediaPipe CDN resources and web search functionality)

## Getting Started

**Live Demo**: Try the app at [https://mi0u.github.io/opti-voice/](https://mi0u.github.io/opti-voice/)

Or run locally:

1. Open `index.html` in a web browser
2. Grant camera permissions when prompted
3. Wait for "🎯 Initializing..." to complete
4. Begin using eye movements to interact:
   - **Look Left**: Select from left column and continue
   - **Look Right**: Select from right column and continue
   - **Look Up**: Access special menu
   - **Look Down**: Speak current text / Undo in menus (can be disabled by increasing down threshold to maximum)

## Settings

Click the ⚙️ Settings button to customize:

- **Vertical Threshold**: Sensitivity for looking up (0.1 = easy, 0.8 = hard)
- **Horizontal Threshold**: Sensitivity for left/right (0.1 = easy, 0.5 = hard)
- **Hold Duration**: How long to maintain gaze (100-2000ms)
- **Stability Frames**: Required frame consistency (2-10 frames)
- **Smoothing Factor**: Reduce jitter (0.1 = responsive, 0.9 = smooth)

### Display Options
- Toggle eye visualization
- Enable/disable sound feedback

Press 'O' key to log current eye tracking values to console for debugging.

## Technologies Used

- **MediaPipe Face Mesh**: Face and eye landmark detection
- **JavaScript**: Core application logic
- **HTML5 Canvas**: Eye visualization
- **CSS3**: Responsive UI design
- **Local Storage**: Settings persistence

## Usage Tips

1. **Calibration**: Adjust settings based on your lighting and camera setup. Find threshold values that don't require straining your eyes but also don't trigger unintentionally - aim for comfortable, deliberate eye movements
2. **Positioning**: Sit at a comfortable distance with your face clearly visible
3. **Lighting**: Ensure adequate, even lighting on your face
4. **Stability**: Try to keep your head relatively still for best results
5. **Practice**: Spend time getting comfortable with the gaze directions

## Browser Compatibility

Tested on:
- ✅ Chrome on laptop/desktop
- ✅ Chrome on Android

Other browsers may work but have not been tested.

## Privacy

This application runs entirely in your browser with no backend server required. All eye tracking processing happens locally on your device, and settings are saved only to your browser's local storage. No video, eye tracking data, or personal information is ever sent to external servers.

## License

MIT License - Copyright (c) 2025 mi0u

This software is freely available for use, modification, and distribution. See the LICENSE file for full details.

## Credits

Developed by mi0u

Implementation created almost exclusively using GitHub Copilot with Claude Sonnet 4.5

Built with [MediaPipe](https://mediapipe.dev/) by Google
