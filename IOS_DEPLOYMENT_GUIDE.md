# iOS Deployment Guide for Nightcap

This guide will help you build, test, and deploy the Nightcap app to the Apple App Store.

## Prerequisites

Before you begin, ensure you have:

1. A Mac computer running macOS
2. Xcode 14+ installed from the Mac App Store
3. An Apple Developer Account ($99/year)
4. CocoaPods installed: `sudo gem install cocoapods`
5. Node.js and npm installed

## Step 1: Install Dependencies

```bash
# Install npm dependencies
npm install

# Install iOS pods
cd ios/App
pod install
cd ../..
```

## Step 2: Build the Web App

```bash
npm run build
```

This creates an optimized production build in the `dist` folder with:
- Code splitting for better performance
- Console logs removed for production
- Minified CSS and JavaScript
- Optimized chunks for faster loading

## Step 3: Sync with iOS

```bash
npx cap sync ios
```

This copies your web assets to the iOS project and updates native plugins.

## Step 4: Open in Xcode

```bash
npx cap open ios
```

Or manually open: `ios/App/App.xcworkspace`

**Important:** Always open the `.xcworkspace` file, NOT the `.xcodeproj` file!

## Step 5: Configure Signing & Capabilities

In Xcode:

1. Select the `App` project in the navigator
2. Select the `App` target
3. Go to "Signing & Capabilities" tab
4. Select your Team from the dropdown
5. Xcode will automatically create a provisioning profile

### Bundle Identifier

The app is configured with bundle ID: `com.nightcap.app`

You may need to change this to something unique for your developer account:
1. In Xcode, change the Bundle Identifier under "General" tab
2. Update `capacitor.config.ts` to match:
   ```typescript
   appId: 'com.yourcompany.nightcap'
   ```

## Step 6: App Icons and Launch Screen

### Current Setup

The app currently uses placeholder icons. For App Store submission, you need proper icons.

### Creating App Icons

1. Create a 1024x1024px PNG icon for your app
2. Use a tool like [App Icon Generator](https://www.appicon.co/) or [MakeAppIcon](https://makeappicon.com/)
3. This will generate all required sizes
4. In Xcode, select `App/App/Assets.xcassets/AppIcon.appiconset`
5. Drag and drop each icon size into the appropriate slot

### Launch Screen

The app uses a launch screen configured in `ios/App/App/Base.lproj/LaunchScreen.storyboard`. You can customize this in Xcode.

## Step 7: Test on Device

1. Connect your iOS device via USB
2. Select your device in the Xcode toolbar (next to the Run button)
3. Click the Run button (▶️) or press Cmd+R
4. The app will install and launch on your device

### Test These Features:

- ✅ Pull to refresh on cocktail list
- ✅ Bottom tab navigation
- ✅ Haptic feedback on button taps
- ✅ Share cocktails via iOS share sheet
- ✅ Offline mode (turn off WiFi/cellular)
- ✅ Dark mode switching
- ✅ Safe area handling (notch/Dynamic Island)
- ✅ Status bar styling

## Step 8: Build for App Store

### Version and Build Number

1. In Xcode, select the App target
2. Go to General tab
3. Update "Version" (e.g., 1.0.0)
4. Update "Build" number (must increase with each upload)

### Create Archive

1. In Xcode menu: Product > Archive
2. Wait for build to complete
3. The Organizer window will open

### Upload to App Store Connect

1. Click "Distribute App"
2. Select "App Store Connect"
3. Click "Upload"
4. Follow the prompts
5. Wait for processing (can take 5-30 minutes)

## Step 9: App Store Connect Setup

### Create App Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps" > "+" > "New App"
3. Fill in:
   - Platform: iOS
   - Name: Nightcap
   - Primary Language: English
   - Bundle ID: com.nightcap.app (or your custom one)
   - SKU: nightcap-001 (or any unique identifier)

### App Information

**Category:** Food & Drink

**Age Rating:**
- Set to 17+ due to alcohol content
- Select "Unrestricted Web Access" if you have web views

**Description:**
```
Nightcap is your personal cocktail recipe manager. Discover new cocktails,
track your home bar inventory, and find out what drinks you can make with
the ingredients you have on hand.

Features:
• Browse hundreds of classic and modern cocktail recipes
• Track your bar inventory
• See what cocktails you can make
• Generate new cocktail ideas
• Create and share your own recipes
• Beautiful dark mode
• Works offline
```

**Keywords:** cocktail, recipe, drinks, bartender, mixology, bar, alcohol

**Support URL:** Your website or GitHub repo

**Privacy Policy URL:** Required by Apple (create a simple one)

### Screenshots

You need screenshots for:
- 6.7" display (iPhone 15 Pro Max) - 3 required
- 6.5" display (iPhone 11 Pro Max) - 3 required
- 5.5" display (iPhone 8 Plus) - 3 required

**Tip:** Use Xcode Simulator:
1. Open various simulators
2. Navigate through your app
3. Take screenshots (Cmd+S)
4. Upload to App Store Connect

### What's New (Version Notes)

For version 1.0.0:
```
Welcome to Nightcap!

• Browse and search cocktail recipes
• Track your home bar ingredients
• Discover what you can make
• Share recipes with friends
• Beautiful iOS design with haptic feedback
• Works offline
```

## Step 10: Submit for Review

1. Select the build you uploaded
2. Fill in all required fields
3. Complete the Export Compliance questions
   - Usually: No, the app doesn't use encryption (or uses standard encryption)
4. Add Advertising Identifier (IDFA) usage if applicable
5. Click "Submit for Review"

### Review Time

- Initial review: 1-3 days (sometimes longer)
- Updates: Usually 24-48 hours
- You can request expedited review in special cases

## Troubleshooting

### Build Fails in Xcode

1. Clean build folder: Product > Clean Build Folder (Cmd+Shift+K)
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData`
3. Reinstall pods:
   ```bash
   cd ios/App
   pod deintegrate
   pod install
   cd ../..
   ```

### App Crashes on Launch

1. Check Xcode console for error messages
2. Verify all plugins are installed: `npx cap sync ios`
3. Check that .env file has correct Supabase credentials

### Plugins Not Working

```bash
# Rebuild and sync
npm run build
npx cap sync ios
cd ios/App
pod install
cd ../..
```

### App Rejected by Review

Common reasons:
- Missing privacy policy
- Incomplete app information
- Crashes or bugs
- Guideline violations

Fix issues and resubmit. You can respond to reviewer notes in App Store Connect.

## Post-Launch

### Analytics and Monitoring

Consider adding:
- Crash reporting (Sentry, Crashlytics)
- Analytics (Mixpanel, Amplitude)
- User feedback system

### Updating the App

1. Make changes to your code
2. Update version/build number
3. `npm run build`
4. `npx cap sync ios`
5. Archive and upload new build
6. Submit for review

### TestFlight Beta Testing

Before public release, use TestFlight:
1. Upload build to App Store Connect
2. Go to TestFlight tab
3. Add internal testers (up to 100)
4. Add external testers (requires beta review)
5. Get feedback before public launch

## Support Resources

- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

## iOS-Specific Features Implemented

✅ **Native Features:**
- Haptic feedback throughout the app
- iOS share sheet integration
- Status bar styling (dark/light based on theme)
- Splash screen with auto-hide
- Keyboard management
- Safe area insets for notch/Dynamic Island

✅ **UI/UX:**
- Bottom tab navigation (iOS pattern)
- Pull-to-refresh on lists
- Smooth animations and transitions
- Proper touch target sizes (44x44 points minimum)

✅ **Performance:**
- Offline mode with local caching
- Optimized bundle with code splitting
- Fast app launch
- Smooth 60fps animations

✅ **Configuration:**
- Info.plist properly configured
- Capacitor plugins installed
- Dark mode support
- Portrait and landscape orientations

## Next Steps

1. **Generate proper app icons** (1024x1024 master icon)
2. **Create screenshots** for App Store listing
3. **Write privacy policy** and host it online
4. **Set up Apple Developer account** ($99/year)
5. **Test on real devices** thoroughly
6. **Submit for review** and wait for approval

Good luck with your App Store launch! 🍸
