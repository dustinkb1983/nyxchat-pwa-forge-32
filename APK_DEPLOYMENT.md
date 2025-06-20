
# NyxChat APK Deployment Guide

## Prerequisites
- Node.js 18+ installed
- Git installed
- Android Studio (for Android deployment)
- Xcode (for iOS deployment, macOS only)

## Step 1: Export and Setup Project

1. **Export to GitHub**: Click "Export to GitHub" button in Lovable
2. **Clone locally**: `git clone <your-repo-url>`
3. **Install dependencies**: `npm install`
4. **Build the project**: `npm run build`

## Step 2: Initialize Capacitor

```bash
# Initialize Capacitor (already configured)
npx cap init

# Add platforms
npx cap add android
npx cap add ios  # Optional, for iOS

# Update native platforms
npx cap update android
npx cap update ios  # If using iOS
```

## Step 3: Sync and Build

```bash
# Sync web assets to native platforms
npx cap sync

# Open in Android Studio
npx cap open android

# Or run directly on device/emulator
npx cap run android
```

## Step 4: APK Configuration

### Android-specific settings:
- **Package Name**: `app.lovable.705a603fa5c34df18a9388e9e5623602`
- **App Name**: `NyxChat`
- **Version Code**: 1
- **Version Name**: 1.0.0
- **Target SDK**: 34 (Android 14)
- **Min SDK**: 24 (Android 7.0)

### Permissions (automatically configured):
- INTERNET
- ACCESS_NETWORK_STATE
- WRITE_EXTERNAL_STORAGE (for file uploads)

## Step 5: Build APK

### Debug APK:
```bash
cd android
./gradlew assembleDebug
```

### Release APK:
```bash
cd android
./gradlew assembleRelease
```

## Step 6: Alternative - PWABuilder

1. Visit [PWABuilder.com](https://www.pwabuilder.com/)
2. Enter your deployed app URL
3. Click "Build My PWA"
4. Download the Android package
5. Install on device

## Troubleshooting

### Common Issues:
1. **White screen on launch**: Ensure service worker is registered
2. **Input focus issues**: Check viewport meta tags
3. **Back button**: Handled by Capacitor automatically
4. **Keyboard overlay**: Configured in capacitor.config.ts

### Performance Tips:
- App uses offline-first caching
- Images are optimized for mobile
- Touch targets meet 44px minimum
- Haptic feedback is optimized

## Testing Checklist

- [ ] App launches without errors
- [ ] Touch interactions work properly
- [ ] Keyboard input functions correctly
- [ ] Scroll behavior is smooth
- [ ] Offline functionality works
- [ ] Back button navigation
- [ ] App icons display correctly
- [ ] Splash screen appears
- [ ] Memory manager opens/closes
- [ ] PWA install prompt works

## Production Notes

- Remove development server URL from capacitor.config.ts
- Update to production build settings
- Test on multiple Android versions
- Verify app store compliance
- Consider code signing for distribution

For issues, refer to the [Capacitor documentation](https://capacitorjs.com/docs).
