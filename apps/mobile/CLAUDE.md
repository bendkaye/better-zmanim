# Mobile App Rules

## This is the React Native app (Expo managed workflow)
- Uses Expo SDK 52+ with Expo Router (file-based routing)
- Styling: Nativewind v4 (Tailwind classes compiled to RN StyleSheet)
- Navigation: Expo Router — app/ directory is the route tree
- All shared hooks imported from @better-zmanim/shared
- Mobile-specific code goes in components/ and lib/
- Push notifications: @notifee/react-native for local scheduling
- Storage: react-native-mmkv for fast synchronous key-value storage
- Geolocation: expo-location
- Haptics: expo-haptics (use for zman countdown completion, button presses)
- iOS widgets: Swift WidgetKit extension in ios/ZmanimWidget/
- Android widgets: Kotlin Glance in android/app/src/main/java/.../widget/
- NEVER use react-native-web — web and mobile have separate UI components
- Default exports ARE allowed for Expo Router page components (required by the framework)