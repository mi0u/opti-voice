# Eye Tracking Calibration System

## Overview
A comprehensive calibration system has been added to automatically configure eye tracking thresholds based on individual user's eye movements.

## Features

### 🎯 Automatic First-Time Calibration
- When the app starts and no settings exist in localStorage, the calibration screen automatically appears
- Guides users through calibrating all four directions (UP, DOWN, LEFT, RIGHT)
- All instructions are displayed in Greek for better user experience

### 📊 How Calibration Works

1. **User is presented with a button** for each direction (e.g., "Έναρξη Βαθμονόμησης ΠΑΝΩ")

2. **Instructions display** telling the user what to do:
   - Greek text explains that when they see the arrow, they should look in that direction
   - They must hold their gaze until they hear a beep sound

3. **Calibration sequence**:
   - User clicks the button
   - System waits 2 seconds (preparation time)
   - Arrow appears showing the direction
   - System collects blend shape values for 1.5 seconds (~45 frames)
   - Calculates the mean of all collected values
   - Sets threshold at **80% of the mean value**
   - Plays a beep sound to confirm
   - Shows the calculated threshold on screen

4. **Process repeats** for all 4 directions in order:
   - UP (ΠΑΝΩ) ↑
   - DOWN (ΚΑΤΩ) ↓
   - LEFT (ΑΡΙΣΤΕΡΑ) ←
   - RIGHT (ΔΕΞΙΑ) →

5. **Completion**:
   - Calibrated values are saved to EYE_DETECTION_CONFIG
   - Settings are automatically saved to localStorage
   - Settings panel UI updates to reflect new thresholds
   - Calibration screen hides and app starts normally

### 🔄 Re-calibration
Users can re-calibrate at any time:
- Open the Settings panel (⚙️ Settings button)
- Click the "Re-calibrate Thresholds" button
- Follow the same calibration process

### 🧪 Testing the Calibration

#### First Time (No localStorage)
1. Clear your browser's localStorage:
   ```javascript
   // In browser console:
   localStorage.removeItem('eyeTrackingSettings');
   ```
2. Refresh the page
3. You should see the calibration screen immediately after camera initialization

#### Manual Re-calibration
1. Open the app normally
2. Click "⚙️ Settings"
3. Scroll down and click "Re-calibrate Thresholds"
4. Confirm the dialog
5. Follow the calibration steps

## File Changes

### New Files
- **calibration.css** - Styling for the calibration screen

### Modified Files
- **index.html** - Added calibration screen HTML, linked calibration.css, added recalibrate button
- **eyetracking.js** - Added `EyeTrackingCalibration` class, modified `EyeDirectionTracker` to store blend shapes, added `initializeEyeTrackingWithCalibration()`
- **settings.js** - Exported global functions, added recalibrate button handler
- **main.js** - Changed initialization to use `initializeEyeTrackingWithCalibration()`

## Technical Details

### Calibration Algorithm
```
For each direction:
1. Collect relevant blend shape values for 1.5 seconds
2. Calculate mean = average of all collected values
3. Set threshold = mean × 0.8
```

### Blend Shapes Used
- **UP**: `eyeLookUpLeft`, `eyeLookUpRight`
- **DOWN**: `eyeLookDownLeft`, `eyeLookDownRight`
- **LEFT**: `eyeLookOutLeft`, `eyeLookInRight`
- **RIGHT**: `eyeLookInLeft`, `eyeLookOutRight`

### Data Flow
```
App Start
    ↓
Check localStorage for 'eyeTrackingSettings'
    ↓
    ├─ EXISTS → Load settings, start normally
    │
    └─ MISSING → Initialize eye tracker
                     ↓
                 Show calibration screen
                     ↓
                 User calibrates each direction
                     ↓
                 Calculate thresholds (80% of mean)
                     ↓
                 Save to localStorage
                     ↓
                 Update UI
                     ↓
                 Hide calibration, start app
```

## User Experience (Greek Interface)

### Calibration Titles
- Main title: "Βαθμονόμηση Eye Tracking"
- Welcome: "Καλώς ήρθατε! Πρέπει να βαθμονομήσουμε το σύστημα."

### Button Labels
- "Έναρξη Βαθμονόμησης ΠΑΝΩ" (Start UP calibration)
- "Έναρξη Βαθμονόμησης ΚΑΤΩ" (Start DOWN calibration)
- "Έναρξη Βαθμονόμησης ΑΡΙΣΤΕΡΑ" (Start LEFT calibration)
- "Έναρξη Βαθμονόμησης ΔΕΞΙΑ" (Start RIGHT calibration)

### Status Messages
- "Προετοιμασία..." (Preparing...)
- "Κοιτάξτε [DIRECTION]!" (Look [DIRECTION]!)
- "✓ Ολοκληρώθηκε!" (Completed!)
- "✓ Βαθμονόμηση Ολοκληρώθηκε!" (Calibration Complete!)

## Troubleshooting

### Calibration doesn't start
- Make sure camera permissions are granted
- Check browser console for errors
- Verify MediaPipe is loading correctly

### No samples collected
- Ensure you're looking in the correct direction
- Make sure lighting is adequate for face detection
- Try looking more extremely in the indicated direction

### Thresholds seem too sensitive/insensitive
- Use the Settings panel to manually adjust individual thresholds
- Or click "Re-calibrate Thresholds" to try again

## Browser Compatibility
- Requires modern browser with WebRTC support
- Tested on Chrome, Edge
- MediaPipe Vision Tasks v0.10.3
