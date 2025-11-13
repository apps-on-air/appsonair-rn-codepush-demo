# React Native CodePush Integration Guide

This project uses **CodePush** (via `@code-push-next/react-native-code-push`) to deliver over-the-air (OTA) updates for JavaScript bundles and assets without needing a full app store release.

---

## Where to Change CodePush Deployment Keys

You must configure these keys in **both Android and iOS** native files.

---

### Android Configuration

#### File:

```
android/app/src/main/res/values/strings.xml
```

#### Example:

```xml
<resources>
    <string name="app_name">MyApp</string>

    <!-- Replace this key with your Android CodePush Deployment Key -->
    <string name="CodePushDeploymentKey">YOUR_ANDROID_CODEPUSH_KEY_HERE</string>
</resources>
```

---

### iOS Configuration

#### File:

```
ios/<YourAppName>/Info.plist
```

#### Example:

```xml
<plist version="1.0">
  <dict>
    ...
    <!-- Replace this key with your iOS CodePush Deployment Key -->
    <key>CodePushDeploymentKey</key>
    <string>YOUR_IOS_CODEPUSH_KEY_HERE</string>
    ...
  </dict>
</plist>
```

---

## 🚀 Running and Syncing CodePush

The `App.tsx` file (in this repo) automatically:

- Checks for updates on app launch.
- Installs updates immediately.
- Allows manual refresh using pull-to-refresh.

---
