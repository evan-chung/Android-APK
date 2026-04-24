# LoRaTool v5.0 完整技術文檔

## 📱 版本資訊

| 項目 | 內容 |
|------|------|
| **APP 名稱** | LoRaTool |
| **當前版本** | v5.0 |
| **包名** | com.loratoolapp |
| **密碼** | cloudtek |
| **建置日期** | 2026-04-04 |
| **框架** | React Native 0.84.1 |
| **BLE 庫** | react-native-ble-plx |

---

## ✅ 已實現功能（14/14）

| # | 功能名稱 | 狀態 | 頁面 | 程式碼位置 |
|---|----------|------|------|------------|
| 1 | BLE 掃描（10秒計時、MOKO識別） | ✅ | Scan | `ScanScreen.startScan()` |
| 2 | BLE 連線管理 | ✅ | Connect | `ConnectScreen.doConnect()` |
| 3 | 密碼認證（cloudtek） | ✅ | Connect | `pwdCmd()` |
| 4 | 50個 GATT 參數讀寫 | ✅ | Control | `COMMANDS` + `sendCmd()` |
| 5 | TX/RX HEX 日誌 | ✅ | Control | `addLog()` |
| 6 | GPS 定位顯示 | ✅ | Control | `Geolocation.getCurrentPosition()` |
| 7 | 設備儲存 | ✅ | Devices | `AsyncStorage` |
| 8 | 操作歷史記錄 | ✅ | History | `AsyncStorage` |
| 9 | LoRaWAN 參考表 | ✅ | Settings | `refRegions`, `refModes`, `refPos` |
| 10 | 進度條顯示 | ⏳ | Control | 需加入 ProgressBar |
| 11 | Global State | ⏳ | 全域 | 需 Zustand |
| 12 | Alert 系統 | ⏳ | Alert | 需獨立頁面 |
| 13 | Cloud 儀表板 | ⏳ | Dashboard | 需新增 |
| 14 | 主題切換 | ⏳ | Settings | 亮色系 Web 已完成 |

---

## 📊 APK 歷史版本比較

| 版本 | 日期 | 大小 | 主題 | Tabs | 狀態 |
|------|------|------|------|------|------|
| **v1.0** | 早期測試 | ~30 MB | 深色 | 4 | 基礎 BLE |
| **v3.0-debug** | 2026-04-02 | 41.2 MB | 深色 | 4 | Debug build |
| **v3.0-release** | 2026-04-02 | 22.7 MB | 深色 | 4 | Release |
| **v5.0.1** | 2026-04-04 | 22.2 MB | 深色 | 5 | GPS 修復版 |

---

## 🔧 BLE 協議詳解

### Service UUID
```
0000AA00-0000-1000-8000-00805F9B34FB
```

### Characteristic UUIDs

| 用途 | UUID | 權限 |
|------|------|------|
| 密碼寫入 | 0000AA00 | Write |
| 密碼通知 | 0000AA01 | Notify |
| 參數讀寫 | 0000AA02 | Read/Write |
| 數據通知 | 0000AA04 | Notify |

### 協議格式

```
PWD寫入:  ED 01 01 [LEN] [password]
參數寫入: ED 01 [KEY] [LEN] [DATA]
參數讀取: ED 00 [KEY] 00
響應格式: ED [01/00] [KEY] [LEN] [DATA]
```

---

## 📋 50 個 GATT 命令鍵

### System (5)
- `0x10` KEY_CLOSE - 關機
- `0x11` KEY_REBOOT - 重啟
- `0x12` KEY_RESET - 恢復出廠
- `0x15` KEY_CHIP_MAC - MAC 地址
- `0x19` KEY_BATTERY - 電量

### Mode (12)
- `0x1B` KEY_DEVICE_MODE - 設備模式（0=Stdby 1=Periodic 2=Timing 3=Motion）
- `0x1C` KEY_SHUTDOWN_PAYLOAD - 關機 payload
- `0x1E` KEY_LOW_POWER_PAYLOAD - 低電量 payload
- `0x1F` KEY_LOW_POWER_PCT - 低電量百分比
- `0x20` KEY_HEARTBEAT_INT - 心跳間隔
- `0x2B` KEY_AUTO_POWER_ON - 自動開機
- `0x40` KEY_PERIODIC_POS - 定位策略
- `0x41` KEY_PERIODIC_INT - 報告間隔
- `0x42` KEY_TIME_POS - 時間定位
- `0x44` KEY_MOTION_EVENT - 運動事件
- `0x47` KEY_MOTION_TRIP_INT - 運動間隔
- `0x49` KEY_MOTION_END_TO - 運動結束超時

### BLE (6)
- `0x30` KEY_PWD_ENABLE - 密碼使能
- `0x31` KEY_PASSWORD - 密碼
- `0x32` KEY_ADV_TIMEOUT - 廣播超時
- `0x33` KEY_ADV_TX_POWER - 發射功率
- `0x34` KEY_ADV_NAME - 廣播名稱
- `0x35` KEY_ADV_INT - 廣播間隔

### Position (13)
- `0x7D` KEY_WIFI_DATA_TYPE - WiFi 數據類型
- `0x7F` KEY_WIFI_TIMEOUT - WiFi 超時
- `0x80` KEY_WIFI_BSSID_NUM - WiFi BSSID 數量
- `0x82` KEY_BLE_TIMEOUT - BLE 超時
- `0x83` KEY_BLE_MAC_NUM - BLE MAC 數量
- `0x84` KEY_GPS_MODULE - GPS 模組
- `0x89` KEY_GPS_TIMEOUT - GPS 超時
- `0x8A` KEY_GPS_SAT_THRESH - GPS 衛星閾值
- `0x8B` KEY_GPS_SYSTEM - GPS 系統
- `0x8F` KEY_OFFLINE_LOC - 離線定位
- (待續)

### LoRaWAN (10)
- `0x91` KEY_LORA_REGION - 區域
- `0x92` KEY_LORA_MODE - 模式（1=OTAA 2=ABP）
- `0x93` KEY_DEV_EUI - DevEUI
- `0x94` KEY_APP_EUI - AppEUI
- `0x95` KEY_APP_KEY - AppKey
- `0x96` KEY_DEV_ADDR - DevAddr
- `0x9C` KEY_DUTY_CYCLE - 佔空比
- `0x9D` KEY_ADR_ACK_LIM - ADR 確認限制
- `0x9E` KEY_ADR_ACK_DLY - ADR 確認延遲

### Aux (4)
- `0xB1` KEY_MAN_DOWN_EN - 跌倒檢測使能
- `0xB3` KEY_MAN_DOWN_TO - 跌倒超時
- `0xBA` KEY_SOS_TRIGGER - SOS 觸發
- `0xBB` KEY_SOS_POS - SOS 定位
- `0xBC` KEY_SOS_INT - SOS 間隔

### Storage (2)
- `0xC1` KEY_CLEAR_STORAGE - 清除存儲
- `0xD1` KEY_OUTDOOR_GPS_INT - 戶外 GPS 間隔

---

## 🌐 LoRaWAN 區域代碼

| 值 | 區域 |
|----|------|
| 0 | AS923 |
| 1 | AU915 |
| 2 | CN470 |
| 3 | CN779 |
| 4 | EU433 |
| 5 | EU868 |
| 6 | KR920 |
| 7 | IN865 |
| 8 | US915 |
| 9 | RU864 |

---

## 📡 工作模式

| 值 | 模式 | 說明 |
|----|------|------|
| 0 | Standby | 待機模式 |
| 1 | Periodic | 定期報告模式 |
| 2 | Timing | 定時模式 |
| 3 | Motion | 運動觸發模式 |

---

## 🔌 LoRaWAN Port 對照

| Port | 功能 |
|------|------|
| 1 | 設備信息 |
| 2 | 心跳/定位 |
| 3 | 低電量 |
| 4 | 定位失敗 |
| 5 | 關機/事件 |
| 8 | 定位成功 |
| 10 | 下行確認 |
| 11 | 電量統計 |
| 12 | GPS 極值 |
| 13 | 防拆報警 |

---

## 🛠️ 技術架構

```
┌─────────────────────────────────────┐
│         React Native 0.84          │
├─────────────────────────────────────┤
│  @react-navigation/bottom-tabs     │
│  react-native-ble-plx              │
│  @react-native-async-storage/...   │
│  @react-native-community/geolocation│
│  buffer                            │
└─────────────────────────────────────┘
```

---

## 📝 建置指令

```bash
# Debug build
cd android
./gradlew assembleDebug

# Release build  
./gradlew assembleRelease
```

---

## 📂 輸出檔案

| 類型 | 路徑 |
|------|------|
| APK (Debug) | `android/app/build/outputs/apk/debug/app-debug.apk` |
| APK (Release) | `android/app/build/outputs/apk/release/app-release.apk` |
| Web 版 | `loratool-web/index.html` |

---

*文檔生成時間: 2026-04-04 17:01 GMT+8*