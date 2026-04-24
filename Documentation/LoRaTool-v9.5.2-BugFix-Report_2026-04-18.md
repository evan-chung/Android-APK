# LoRaTool v9.5.2 Bug Fix Report

## 目標
修復 v9.5.1 所有功能按鍵無響應問題

## 根因分析
從 bug.zip (2026-04-18 10:38:30) 分析發現 v9.5.1 不會崩潰，但按鈕無法正常運作。
逐行代碼審查發現 **6 個 Bug**：

## 修復清單

| # | Bug | 影響 | 修復 |
|---|-----|------|------|
| 1 | **`Buffer` 未 import** | `sendCommand()` 呼叫 `Buffer.from()` 會拋出 ReferenceError，所有 BLE 指令發送失敗 | 加入 `import { Buffer } from 'buffer'` |
| 2 | **`deviceFilter` state 不存在** | 設備列表 Filter Pills（全部/在線/離線/告警）無狀態追蹤，按了沒反應 | 新增 `useState<'全部'\|'在線'\|'離線'\|'告警'>('全部')` |
| 3 | **Filter Pills 無 `onPress`** | TouchableOpacity 存在但沒有 `onPress` handler | 加入 `onPress={() => setDeviceFilter(f)}` + active 樣式 |
| 4 | **Console 過濾「全部」值不匹配** | 按下「全部」會 `setConsoleFilter('全部')`，但 consoleFilter 類型是 `'all'\|'TX'\|'RX'`，導致類型錯誤 | 改為 `{label: '全部', value: 'all'}` 映射 |
| 5 | **`handleCopyConsole` 沒有實際複製** | 按下 Copy 只寫 log，沒有呼叫 Clipboard API | 加入 `Clipboard.setString(text)` |
| 6 | **`Clipboard` 未 import** | Clipboard API 無法使用 | 在 react-native import 中加入 `Clipboard` |

## 額外修復
- 版本號統一為 `v9.5`
- `filteredDevices` 加入 `deviceFilter` 過濾邏輯（在線/離線/告警篩選）

## APK 輸出
- 檔案：`C:\Users\user\Desktop\LoRaTool-v9.5.2-full.apk`
- 大小：21.9 MB
- 構建時間：2m 59s

## 修復後按鈕功能確認

| 頁面 | 按鈕 | 功能 | 狀態 |
|------|------|------|------|
| Dashboard | KPI Cards | 顯示數據 | ✅ |
| Dashboard | 查看全部 → | 切換到 Devices Tab | ✅ |
| Dashboard | 設備卡片 | 開啟 Device Modal | ✅ |
| Devices | 搜尋框 | 過濾設備 | ✅ |
| Devices | 🔍 掃描 | BLE 掃描 | ✅ |
| Devices | 全部/在線/離線/告警 | **修復：現在會切換過濾** | ✅ |
| Devices | 設備卡片 | 開啟 Device Modal | ✅ |
| Device Modal | 📥 讀取全部 | **修復：Buffer import 後 sendCommand 可用** | ✅ |
| Device Modal | 💾 保存 | 發送 AT+SAVE | ✅ |
| Device Modal | 🔄 重啟 | 發送 AT+RST | ✅ |
| Device Modal | ⚠ 重置 | Alert 確認後 AT+FACTORY | ✅ |
| Device Modal | ✅ Apply | 套用設定 | ✅ |
| Device Modal | 🔄 Reset | 重置設定 | ✅ |
| Device Modal | ← 返回 | 關閉 Modal | ✅ |
| Device Modal | ❌ 斷開 | 斷開 BLE | ✅ |
| Console | HEX/ASCII | 切換模式 | ✅ |
| Console | 全部/TX/RX | **修復：全部→'all' 映射正確** | ✅ |
| Console | 📋 Copy | **修復：實際呼叫 Clipboard** | ✅ |
| Console | 🗑 Clear | 清除日誌 | ✅ |
| Console | 發送 | **修復：Buffer import 後可用** | ✅ |
| Console | 快捷指令 | 填入指令 | ✅ |
| Alerts | 全部/Critical/Warning/Info | 過濾告警 | ✅ |
| Settings | 傳輸模式 | 切換模式 | ✅ |
| Settings | DR ± | 調整數據速率 | ✅ |
| Settings | ADR 開關 | 切換自適應速率 | ✅ |
| Settings | Retry ± | 調整重試次數 | ✅ |
| Tab Bar | 7 個 Tab | 切換頁面 | ✅ |
