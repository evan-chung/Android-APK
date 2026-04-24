# LoRaTool v9.0.2 崩潰修復

## 問題
App 安裝後立即閃退

## 根因分析
從 bugreport 提取的崩潰日誌：
```
04-20 19:51:58 E ReactNativeJS: TypeError: Cannot read property 'getItem' of undefined
04-20 19:51:58 E AndroidRuntime: com.facebook.react.common.JavascriptException: TypeError: Cannot read property 'getItem' of undefined
```

**原因：** `AsyncStorage` 原生模組返回 `undefined`

### 代碼錯誤
```javascript
// 錯誤 ❌ - AsyncStorage 已從 react-native 核心移除
import { ..., AsyncStorage, ... } from 'react-native';

// 正確 ✅
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### 原生註冊缺失
MainApplication.kt 需手動添加 AsyncStoragePackage（因 RN 0.84 autolinking 對不支援 codegen 的套件會失敗）

## 修復內容

### 1. App.tsx (第 13-21 行)
```diff
- import { ..., AsyncStorage, ... } from 'react-native';
+ import { ..., TextInput, ... } from 'react-native';
+ import AsyncStorage from '@react-native-async-storage/async-storage';
```

### 2. MainApplication.kt
```diff
+ import com.reactnativecommunity.asyncstorage.AsyncStoragePackage

  override val reactHost: ReactHost by lazy {
    val packages = PackageList(this).packages.toMutableList()
    packages.add(GeolocationPackage())
    packages.add(BlePlxPackage())
+   packages.add(AsyncStoragePackage())
    ...
  }
```

## 輸出
- **APK:** `C:\Users\user\Desktop\LoRaTool-v9.0.2.apk` (22.96 MB)
- **構建時間:** 2026-04-21 07:12 GMT+8

## 待驗證
- App 是否能正常啟動
- BLE 掃描/連接功能
- GPS 定位功能
- Console 日誌
