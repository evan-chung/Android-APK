# LoRaTool APP 需求確認與狀態報告

## 一、原始需求文檔 (loratoolapp.pdf)

### 功能對比總表 (14項)

| 序號 | 功能項目 | 我們要求 | MKLoRa有 | 當前狀態 | 差距 |
|------|----------|----------|----------|----------|------|
| 1 | BLE設備掃描 | 必須 | 有 | 假數據 | 完全重做 |
| 2 | BLE連接/斷開 | 必須 | 有 | 未實現 | 需實現 |
| 3 | 讀取設備信息 | 必須 | 有 | 未實現 | 需實現 |
| 4 | LoRa參數配置 | 必須 | 有 | 假功能 | 需實現 |
| 5 | 數據發送 | 必須 | 有 | 假功能 | 需實現 |
| 6 | 數據接收 | 必須 | 有 | 未實現 | 需實現 |
| 7 | RSSI/SNR監控 | 必須 | 有 | 假數據 | 需實現 |
| 8 | 設備歷史記錄 | 必須 | 有 | 本地可用 | 需整合 |
| 9 | GPS定位 | 必須 | 部分 | 假座標 | 需實現 |
| 10 | 多設備管理 | 必須 | 有 | 未實現 | 需實現 |
| 11 | OTA固件升級 | 可選 | 有 | 未實現 | 可選 |
| 12 | 雲端同步 | 可選 | 無 | 假功能 | 我們額外 |
| 13 | 客戶/工程模式 | 必須 | 無 | UI有,功能假 | 需實現 |
| 14 | 傳輸模式切換 | 必須 | 部分 | 假功能 | 需實現 |

### 工作階段規劃

| 階段 | 工作項目 | 工作天 |
|------|----------|--------|
| 第一階段 | BLE掃描+連接 | 4-6天 |
| 第二階段 | GPS+定位 | 1天 |
| 第三階段 | LoRa參數讀寫 | 2-3天 |
| 第三階段 | 數據收發+監控 | 2-3天 |
| 第四階段 | UI優化 | 2-3天 |
| 第四階段 | 錯誤處理 | 1-2天 |
| 第五階段 | 多設備管理 | 2-3天 |
| 第五階段 | 上架準備 | 1-2天 |
| **總計** | **14-22個工作天** | **2-3週** |

---

## 二、當前 v3.0 APP 狀態

### 技術棧
- **框架**: React Native 0.84.1
- **BLE庫**: react-native-ble-plx 3.5.1
- **導航**: @react-navigation/native 7.2.2
- **BLE密碼**: `cloudtek`
- **Service UUID**: `0000AA00-0000-1000-8000-00805F9B34FB`

### 已實現功能
| 功能 | 狀態 | 說明 |
|------|------|------|
| BLE掃描 | ✅ | 使用 react-native-ble-plx 真實掃描 |
| BLE連接 | ✅ | 密碼認證流程完成 |
| 讀取設備信息 | ✅ | 49個 KEY 參數讀取 |
| LoRa參數配置 | ✅ | 參數寫入功能 |
| 數據接收 | ✅ | BLE RX 特徵監聽 |
| RSSI顯示 | ✅ | 掃描時顯示真實 RSSI |
| 底部導航 | ✅ | 3個 Tab: Scan/Control/Settings |

### APK 版本比較

| 版本 | 檔案 | 大小 | 狀態 | 問題 |
|------|------|------|------|------|
| v2.0 | LoRaTool_v2.0.apk | 22.11 MB | ✅ 正常 | - |
| v3.0 Release | LoRaTool-v3.0.apk | 22.7 MB | ✅ 正常 | - |
| v3.0 Debug | LoRaTool-v3.0-debug.apk | 43.2 MB | ❌ 閃退 | 缺少 JS Bundle |

### Debug APK 閃退原因
```
Debug APK 不包含 JS Bundle，需要連線 Metro Dev Server
Release APK 內嵌 assets/index.android.bundle (1.5 MB)，可離線運行
```

---

## 三、UI 圖標尺寸現狀

### 底部 Tab 圖標 (3個)
```tsx
<Tab.Screen name="Scan" options={{tabBarIcon:({color})=>
  <Text style={{fontSize:22,color}}>[*]</Text>}}/>
<Tab.Screen name="Control" options={{tabBarIcon:({color})=>
  <Text style={{fontSize:22,color}}>[C]</Text>}}/>
<Tab.Screen name="Settings" options={{tabBarIcon:({color})=>
  <Text style={{fontSize:22,color}}>[S]</Text>}}/>
```

### 控制畫面按鈕
- **Read All 按鈕**: paddingVertical:12, fontSize:14
- **Disconnect 按鈕**: 同上
- **Set 按鈕**: paddingHorizontal:12, paddingVertical:6, fontSize:12
- **EXEC 按鈕**: 同上

---

## 四、與 MKLoRa APP 功能對比

### MKLoRa 有而我們需要實現的功能
1. **多設備管理** - 同時連接多個設備
2. **設備歷史記錄** - 本地存儲查詢歷史
3. **OTA升級** - 檢查固件版本、下載升級

### MKLoRa 沒有但我們有的功能
1. **雲端同步** - 數據上傳到雲端
2. **客戶/工程模式** - UI 已存在，功能待實現

---

## 五、建議下一步

### 優先級排序
1. **P0 - 必須**: BLE掃描、連接、讀寫參數 (已實現)
2. **P1 - 重要**: 多設備管理、歷史記錄
3. **P2 - 可選**: OTA升級、雲端同步

### UI 改進建議
如需放大圖標，可調整：
- 底部 Tab 圖標: fontSize 22 → 26
- Set/EXEC 按鈕: fontSize 12 → 14, paddingVertical 6 → 10
- Read All 按鈕: paddingVertical 12 → 14

---

## 檔案位置

| 項目 | 路徑 |
|------|------|
| 需求文檔 | `C:\Users\user\.qclaw\workspace\issue\loratoolapp.pdf` |
| v3.0 APP | `C:\Users\user\.qclaw\workspace\LoRaToolApp2\App.tsx` |
| Release APK | `C:\Users\user\.qclaw\workspace\LoRaToolApp2\android\app\build\outputs\apk\release\app-release.apk` |
| Debug APK | `C:\Users\user\.qclaw\workspace\LoRaToolApp2\android\app\build\outputs\apk\debug\app-debug.apk` |
| Bug 報告 | `C:\Users\user\.qclaw\workspace\issue\bug\` |

---

*報告生成時間: 2026-04-02 14:30 GMT+8*