# LoRaTool v9 完整 UI/UX 設計規格書

> **⚠️ 重要說明**
> 本文件根據 `UIdesign.md` 的 Figma 設計稿和 `docx_text.txt` 的優化建議，
> 針對 v8.1 APK 現有功能，重新設計完整的 SaaS 等級 UI/UX 架構。
>
> **v8.1 現狀 vs v9 目標**
> - v8.1：4 Tab 底部導航，無 Dashboard，無 Chart，Control Tab 未整合 Console
> - v9：Dashboard + Sidebar 導航 + 單一設備工作台 + Chart + Map + Analytics

---

## 第一部分：現狀分析（v8.1 APK）

### 1.1 現有架構

```
┌─────────────────────────────────────┐
│ Header (LoRaTool + GPS)            │
├─────────────────────────────────────┤
│ [Devices] [Control] [Alerts] [Console] │ ← 底部 Tab 導航
│                                     │
│ Devices Tab:                        │
│   - 掃描按鈕                        │
│   - 設備列表卡片                     │
│                                     │
│ Control Tab:                        │
│   - KPI Cards (連線/驗證/待回應/電量) │
│   - Section Pills (12項分類)          │
│   - Parameter Cards                 │
│                                     │
│ Alerts Tab:                         │
│   - 告警列表                         │
│                                     │
│ Console Tab:                        │
│   - Filter Tabs (ALL/TX/RX/ERR)     │
│   - Log 區域                         │
│   - Clear / Export 按鈕              │
└─────────────────────────────────────┘
```

### 1.2 現有問題

| 問題 | 描述 |
|------|------|
| **無 Dashboard** | 直接進入 Devices，沒有系統概覽 |
| **無 KPI 趨勢** | 只有靜態數字，沒有歷史圖表 |
| **無 Map 頁面** | 沒有 GPS 軌跡顯示 |
| **無 Analytics** | 沒有 RSSI/電量趨勢圖 |
| **無 Sidebar** | 只有底部 Tab |
| **Console 分離** | Console 在獨立 Tab，不在設備頁面 |
| **設計不一致** | 顏色、間距、字體未統一 |

---

## 第二部分：目標架構（v9 SaaS）

### 2.1 整體 Layout

```
┌──────────────────────────────────────────────────┐
│  Header: Logo | 搜尋框 | 使用者頭像               │
├──────────┬───────────────────────────────────────┤
│ Sidebar  │  Main Content Area                    │
│ (Desktop)│                                       │
│          │  ┌─ Dashboard ─────────────────────┐  │
│ Dashboard│  │ KPI Cards (4)                    │  │
│ Devices  │  │ [120 設備] [98 在線] [3 告警]   │  │
│ Map      │  │ [+12%]  [●]        [🔴]          │  │
│ Alerts   │  └────────────────────────────────┘  │
│ Analytics│  ┌─ 圖表區 ────────────────────────┐  │
│ Settings │  │ 折線圖 (Data/RSSI/Battery)      │  │
│          │  │ [1h] [24h] [7d]                  │  │
│          │  └────────────────────────────────┘  │
│          │  ┌─ 設備列表 ───────────────────────┐  │
│          │  │ 設備卡片 (Name + MAC + RSSI)    │  │
│          │  └────────────────────────────────┘  │
├──────────┴───────────────────────────────────────┤
│  Bottom Nav (Mobile): [首頁] [設備] [地圖] [告警]│
└──────────────────────────────────────────────────┘
```

### 2.2 響應式策略

| 斷點 | Layout |
|------|--------|
| Desktop (≥768px) | 左側 Sidebar + 右側內容區 |
| Tablet (600-767px) | 收縮 Sidebar（ICON only）+ 內容區 |
| Mobile (<600px) | 底部 Tab + 全屏內容 |

---

## 第三部分：Dashboard 頁面（首頁）

### 3.1 Header

```html
┌────────────────────────────────────────────────────────────┐
│ 🛰 LoRaTool    [🔍 搜尋設備...]    [👤 Evan ▼]            │
└────────────────────────────────────────────────────────────┘
```

- **Logo**：左側，`#2563EB` + 白色文字
- **搜尋框**：中間，placeholder "搜尋設備..."
- **用戶頭像**：右側，點擊顯示下拉選單

**實作細節：**
- Header 高度：64px
- 背景：`#FFFFFF`
- 下邊框：`1px solid #E2E8F0`
- 陰影：`0 2px 8px rgba(0,0,0,0.06)`

### 3.2 KPI Cards

```html
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 📡          │ │ ●           │ │ 🔴           │ │ 📊          │
│ 120         │ │ 98          │ │ 3            │ │ 2.4MB       │
│ 設備總數     │ │ 在線設備     │ │ 活躍告警     │ │ 數據用量     │
│ +12% ↑     │ │             │ │              │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**卡片 1：設備總數**
- Icon：📡（灰色）
- 數值：120（24px Bold `#2563EB`）
- 標籤：設備總數（12px `#64748B`）
- 趨勢：+12% ↑（綠色 `#16A34A`）

**卡片 2：在線設備**
- Icon：●（綠色 `#16A34A`，帶 pulse 動效）
- 數值：98（24px Bold `#16A34A`）
- 標籤：在線設備（12px `#64748B`）

**卡片 3：活躍告警**
- Icon：🔴（紅色 `#DC2626`）
- 數值：3（24px Bold `#DC2626`）
- 標籤：活躍告警（12px `#64748B`）

**卡片 4：數據用量**
- Icon：📊（藍色 `#2563EB`）
- 數值：2.4MB（24px Bold `#2563EB`）
- 標籤：今日用量（12px `#64748B`）

**卡片實作：**
```css
.kpi-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  flex: 1;
  min-width: 160px;
}
.kpi-icon { font-size: 24px; }
.kpi-value { font-size: 28px; font-weight: 700; color: #2563EB; }
.kpi-label { font-size: 12px; color: #64748B; margin-top: 4px; }
.kpi-trend { font-size: 12px; color: #16A34A; margin-top: 4px; }
```

### 3.3 趨勢圖表

```html
┌─────────────────────────────────────────────────────────────┐
│ 趨勢圖                                    [1h] [24h] [7d] │
├─────────────────────────────────────────────────────────────┤
│     ╱╲    ╱╲                                                 │
│   ╱    ╲╱    ╲                                              │
│ ─┘          └──                                              │
│ RSSI         Battery                                        │
└─────────────────────────────────────────────────────────────┘
```

**支援的圖表類型：**
- Data Usage（折線圖）
- RSSI Signal（折線圖）
- Battery Level（折線圖 + 區域填充）

**時間範圍：** 1h / 24h / 7d / 30d

**圖表實作：**
```javascript
// 使用 react-native-chart-kit 或 Recharts
const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  strokeWidth: 2,
};
```

### 3.4 設備列表（Dashboard 區塊）

```html
┌─────────────────────────────────────────────────────────────┐
│ 設備列表                                    [查看全部 →]    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 📡 MOKO-LW01          ● Online    RSSI: -65dBm        │  │
│ │ AA:BB:CC:DD:EE:01           Battery: 80%    [控制]     │  │
│ └─────────────────────────────────────────────────────────┘  │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 📡 MOKO-LW02          ○ Offline   RSSI: —              │  │
│ │ AA:BB:CC:DD:EE:02           Battery: 45%    [控制]     │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**狀態指示：**
- ● Online：綠色 `#16A34A`（帶 pulse 動效）
- ○ Offline：灰色 `#64748B`
- ⚠ Alert：紅色 `#DC2626`

---

## 第四部分：設備列表頁面

### 4.1 頁面佈局

```
┌─────────────────────────────────────────────────────────────┐
│ 設備管理                              [🔍 掃描 BLE 設備]     │
├─────────────────────────────────────────────────────────────┤
│ 篩選：[全部] [在線] [離線] [告警]   排序：[名稱▼]         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 📡 MOKO-LW01 (Master)                                  │  │
│ │ AA:BB:CC:DD:EE:01                                      │  │
│ │ ● Online | RSSI: -65dBm | Battery: 80% | 最後: 3s前   │  │
│ │                                                        │  │
│ │ [控制面板] [查看軌跡] [歷史數據] [刪除]                │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 📡 MOKO-LW02                                           │  │
│ │ AA:BB:CC:DD:EE:02                                      │  │
│ │ ○ Offline | Battery: 45% | 最後: 2h前                  │  │
│ │                                                        │  │
│ │ [控制面板] [查看軌跡] [歷史數據] [刪除]                │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 設備卡片詳情

| 欄位 | 值 | 說明 |
|------|-----|------|
| 圖示 | 📡 | 設備類型圖示 |
| 名稱 | MOKO-LW01 | 可點擊進入設備詳情 |
| MAC | AA:BB:CC:DD:EE:01 | 設備唯一 ID |
| 狀態 | ● Online | 綠/灰/紅狀態指示 |
| RSSI | -65 dBm | 訊號強度 |
| 電量 | 80% | 電池百分比 |
| 最後活動 | 3s 前 | 最後通訊時間 |

---

## 第五部分：單一設備工作台（核心頁面）⭐

**根據 docx_text.txt 問題 1 的最終建議：所有操作在一個畫面完成**

### 5.1 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ ← 返回    MOKO-LW01    [連線中 ●] [🔄 刷新] [❌ 斷開]      │
├─────────────────────────────────────────────────────────────┤
│ ┌─ 狀態卡片 ─────────────────────────────────────────────┐  │
│ │ RSSI: -98 dBm   SNR: 7    Battery: 80%   Temp: 25°C   │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ 即時狀態 ─────────────────────────────────────────────┐  │
│ │  ● 在線 │ 🔓 已驗證 │ TX: 1,234 │ RX: 5,678 │ Uptime:  │  │
│ │         │           │            │           │ 3d 14h   │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ 快速操作 ─────────────────────────────────────────────┐  │
│ │ [讀取全部] [寫入配置] [重啟設備] [恢復出廠]            │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ LoRa 設定 ────────────────────────────────────────────┐  │
│ │ 傳輸模式：  (●) 標準  ( ) 省電  ( ) 即時              │  │
│ │                                                       │  │
│ │ [進階設定 ▼]                                          │  │
│ │   DR: 3  ADR: ON  Retry: 1  Power: 22dBm              │  │
│ │   Region: AS923  Join: OTAA                            │  │
│ │                                                       │  │
│ │ [應用] [重置]                                          │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ Console ─────────────────────────────────────────────┐  │
│ │ [HEX] [ASCII]  [Filter: 全部 ▼]                       │  │
│ │ ─────────────────────────────────────────────────────  │  │
│ │ 12:01:23 TX→ READ CMD 0x01                           │  │
│ │ 12:01:24 RX← 0x01 = 4.2.1                            │  │
│ │ 12:01:25 TX→ READ CMD 0x26                            │  │
│ │ 12:01:26 RX← 0x26 = AS923                             │  │
│ │ ─────────────────────────────────────────────────────  │  │
│ │ > _                                                    │  │
│ │ [清除] [導出] [複製全部]                              │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 狀態卡片（頂部）

```html
┌─────────────────────────────────────────────────────────────┐
│ RSSI: -98 dBm    SNR: 7    Battery: 80%    Temp: 25°C       │
└─────────────────────────────────────────────────────────────┘
```

- 背景：`#F0F4FF`（淺藍）
- 數值：20px Bold `#2563EB`
- 標籤：11px `#64748B`
- 佈局：flex，4 等分

### 5.3 即時狀態列

```html
┌─────────────────────────────────────────────────────────────┐
│  ● 在線 │ 🔓 已驗證 │ TX: 1,234 │ RX: 5,678 │ Uptime: 3d14h │
└─────────────────────────────────────────────────────────────┘
```

- 狀態指示燈：●（綠色 pulse 動效）
- 在線/離線：綠/灰
- TX/RX 計數：藍色數字
- Uptime：設備運行時間

### 5.4 快速操作按鈕

| 按鈕 | 顏色 | 說明 |
|------|------|------|
| 讀取全部 | Secondary (灰) | 批量讀取所有參數 |
| 寫入配置 | Primary (藍) | 寫入待發送的配置 |
| 重啟設備 | Warning (黃) | 發送重啟指令 |
| 恢復出廠 | Danger (紅) | 恢復出廠設置 |

### 5.5 LoRa 設定區塊

**傳輸模式（Radio Button）：**
```
(●) 標準    ( ) 省電    ( ) 即時
```

- 選中：`#2563EB` 圓點
- 未選中：灰色圓點
- 文字：14px

**進階設定（可折疊）：**
```
[進階設定 ▼]
  DR: [3 ▼]  ADR: [ON ▼]  Retry: [1 ▼]  Power: [22dBm ▼]
  Region: [AS923 ▼]  Join: [OTAA ▼]
```

**按鈕：**
- [應用] - Primary (藍)
- [重置] - Secondary (灰)

### 5.6 Console 區塊（工程核心）

**根據 docx_text.txt 問題 6：**

```html
┌─ Console ─────────────────────────────────────────────────┐
│ [HEX] [ASCII]   [Filter: 全部 ▼]   [⏸ 暫停]               │
├────────────────────────────────────────────────────────────┤
│ 12:01:23 TX→ READ CMD 0x01                                │
│ 12:01:24 RX← 0x01 = 4.2.1               [📋 複製]         │
│ 12:01:25 TX→ READ CMD 0x26                                │
│ 12:01:26 RX← 0x26 = AS923               [📋 複製]         │
│ 12:01:27 TX→ WRITE CMD 0x27 = 01                          │
│ 12:01:28 RX← ACK                       [📋 複製]         │
├────────────────────────────────────────────────────────────┤
│ > _                                                    [▶] │
│ [清除] [導出] [複製全部]                                   │
└────────────────────────────────────────────────────────────┘
```

**功能清單：**
- [HEX] / [ASCII] 顯示模式切換
- Filter：全部 / TX / RX / ERR
- 暫停：停止自動滾動
- 每行 [📋 複製] 按鈕
- Console 命令輸入框
- [清除] / [導出] / [複製全部]

**顏色：**
- TX：`#3FB950`（綠色）
- RX：`#58A6FF`（藍色）
- ERR：`#F85149`（紅色）
- INFO：`#8B949E`（灰色）
- 背景：`#1C2128`（深色）

**動效：**
- 新日誌：自動滾動到頂部
- pulse：Online 綠點 2s 動效

---

## 第六部分：地圖頁面（GPS 軌跡）

### 6.1 地圖佈局

```
┌─────────────────────────────────────────────────────────────┐
│ 地圖                                [🚗 軌跡] [📍 定位] [⚙] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌───────────────────────────────────────────────┐      │
│     │                                               │      │
│     │              地圖區域                         │      │
│     │         (Mapbox / Google Maps)               │      │
│     │                                               │      │
│     │    📍 MOKO-LW01 (-98 dBm, 2m前)             │      │
│     │         ╱╲                                    │      │
│     │        ╱  ╲    📍 MOKO-LW02 (-75 dBm, 5m前) │      │
│     │       ╱    ╲                                 │      │
│     │      ●─────●  軌跡線                         │      │
│     │                                               │      │
│     └───────────────────────────────────────────────┘      │
│                                                             │
│ ┌─ 設備軌跡列表 ─────────────────────────────────────────┐  │
│ │ MOKO-LW01 | 最新: 25.0331, 121.5654 | 2m 前 | [-]   │  │
│ │ MOKO-LW02 | 最新: 25.0335, 121.5658 | 5m 前 | [+]   │  │
│ └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 地圖功能

| 功能 | 說明 |
|------|------|
| 設備標記 | 📍 圖示 + 名稱 + RSSI |
| 軌跡線 | 設備移動路徑（彩色線條） |
| 點擊標記 | 顯示設備詳情卡片 |
| 實時更新 | GPS 位置自動更新 |
| 軌跡回放 | 點擊播放歷史軌跡 |

---

## 第七部分：告警頁面

### 7.1 告警列表

```
┌─────────────────────────────────────────────────────────────┐
│ 告警監控                              [全部標記已讀] [設置] │
├─────────────────────────────────────────────────────────────┤
│ 篩選：[全部] [🔴 Critical] [🟡 Warning] [🔵 Info]         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🔴 Critical    MOKO-LW01 - RSSI Low                   │  │
│ │ Time: 12:01:23 | RSSI: -105 dBm                       │  │
│ │ [查看設備] [標記已處理]                                │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🟡 Warning     MOKO-LW02 - Battery Low                │  │
│ │ Time: 11:45:00 | Battery: 15%                          │  │
│ │ [查看設備] [標記已處理]                                │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐  │
│ │ 🔵 Info        MOKO-LW03 - Offline Alert Cleared      │  │
│ │ Time: 10:30:00 | 設備已重新上線                        │  │
│ │ [查看設備]                                             │  │
│ └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 告警類型

| 類型 | 顏色 | 觸發條件 |
|------|------|----------|
| 🔴 Critical | `#DC2626` | RSSI < -100dBm / 電量 < 5% / 離線 > 1h |
| 🟡 Warning | `#F59E0B` | RSSI < -85dBm / 電量 < 20% / 離線 > 30m |
| 🔵 Info | `#2563EB` | 設備上線 / 配置變更 / OTA 更新 |

---

## 第八部分：Analytics 頁面

### 8.1 分析圖表

```
┌─────────────────────────────────────────────────────────────┐
│ 分析儀表板                            [1h] [24h] [7d] [30d] │
├─────────────────────────────────────────────────────────────┤
│ ┌─ RSSI 訊號強度 ─────────────────────────────────────────┐  │
│ │     ╱╲    ╱╲    ╱╲                                     │  │
│ │   ╱    ╲╱    ╲╱    ╲─●                                │  │
│ │ ─┴───────────────                                       │  │
│ │ -100dBm -85dBm  Avg: -72dBm                            │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ 電量趨勢 ─────────────────────────────────────────────┐  │
│ │ 100%│╲                                                 │  │
│ │  80%│  ╲─────────●                                    │  │
│ │  60%│    ╲                                            │  │
│ │  40%│      ╲                                           │  │
│ │  20%│       ╲───                                       │  │
│ │   0%└─────────────────────────────────                  │  │
│ │     00:00  06:00  12:00  18:00  24:00                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ 數據用量 ─────────────────────────────────────────────┐  │
│ │ 上行: 1.2MB  下行: 3.4MB  總計: 4.6MB                  │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 統計數據

| 指標 | 值 | 說明 |
|------|-----|------|
| 平均 RSSI | -72 dBm | 過去 24h |
| 設備存活率 | 98% | 正常運行比例 |
| 總上行數據 | 1.2 MB | 過去 24h |
| 總下行數據 | 3.4 MB | 過去 24h |
| 總告警數 | 12 | 過去 7d |

---

## 第九部分：Design System（完整）

### 9.1 色彩系統

```css
:root {
  /* Primary */
  --primary:       #2563EB;
  --primary-hover: #1D4ED8;
  --primary-light: #EFF6FF;
  --primary-dark:  #1E40AF;

  /* Status */
  --success:       #16A34A;
  --success-light: #DCFCE7;
  --warning:       #F59E0B;
  --warning-light: #FEF3C7;
  --danger:        #DC2626;
  --danger-light:  #FEE2E2;
  --info:          #0EA5E9;
  --info-light:    #E0F2FE;

  /* Text */
  --text-primary:  #0F172A;
  --text-secondary:#334155;
  --text-muted:    #64748B;
  --text-disabled:  #94A3B8;

  /* Background */
  --bg-primary:   #F1F5F9;
  --bg-card:       #FFFFFF;
  --bg-dark:       #1C2128;

  /* Border */
  --border:        #E2E8F0;
  --border-dark:   #CBD5E1;

  /* Console */
  --log-tx:        #3FB950;
  --log-rx:        #58A6FF;
  --log-err:       #F85149;
  --log-info:      #8B949E;

  /* Shadow */
  --shadow-sm:     0 1px 2px rgba(0,0,0,0.05);
  --shadow:        0 2px 8px rgba(0,0,0,0.06);
  --shadow-lg:      0 8px 24px rgba(0,0,0,0.12);
}
```

### 9.2 字體系統

```css
:root {
  /* Font Family */
  --font-sans: 'Inter', 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;

  /* Font Size */
  --text-xs:   11px;
  --text-sm:   12px;
  --text-base: 14px;
  --text-lg:   16px;
  --text-xl:   18px;
  --text-2xl:  20px;
  --text-3xl:  24px;
  --text-4xl:  30px;

  /* Font Weight */
  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
  --font-bold:      700;

  /* Line Height */
  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed:1.75;

  /* Letter Spacing */
  --tracking-tight:  -0.025em;
  --tracking-normal: 0;
  --tracking-wide:    0.025em;
}
```

### 9.3 間距系統

```css
:root {
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

### 9.4 圓角系統

```css
:root {
  --radius-none:  0px;
  --radius-sm:    6px;
  --radius:       8px;
  --radius-md:    12px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-full:  9999px;
}
```

### 9.5 組件樣式

#### Button
```css
.btn {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}
.btn-primary { background: #2563EB; color: #FFF; }
.btn-primary:hover { background: #1D4ED8; }
.btn-secondary { background: #64748B; color: #FFF; }
.btn-danger { background: #DC2626; color: #FFF; }
.btn-ghost { background: transparent; color: #2563EB; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

#### Card
```css
.card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.card-hover:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
```

#### Input
```css
.input {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0F172A;
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
```

#### Badge
```css
.badge {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
}
.badge-success { background: #DCFCE7; color: #16A34A; }
.badge-warning { background: #FEF3C7; color: #F59E0B; }
.badge-danger { background: #FEE2E2; color: #DC2626; }
.badge-info { background: #E0F2FE; color: #0EA5E9; }
```

### 9.6 動效系統

```css
:root {
  --transition-fast:  150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow:  300ms ease;

  /* Pulse Animation */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse { animation: pulse 2s infinite; }

  /* Online Indicator */
  @keyframes online-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
    50% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
  }
  .online-dot { animation: online-glow 2s infinite; }

  /* Fade In */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease; }
}
```

---

## 第十部分：響應式斷點

### 10.1 斷點定義

| 名稱 | 斷點 | 說明 |
|------|------|------|
| Mobile | < 600px | 單列佈局，底部 Tab |
| Tablet | 600-1024px | 雙列佈局，可折疊 Sidebar |
| Desktop | > 1024px | 完整 Sidebar + 內容區 |

### 10.2 Mobile 適配

```css
/* Mobile: 底部 Tab 導航 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px + env(safe-area-inset-bottom);
  background: #FFFFFF;
  border-top: 1px solid #E2E8F0;
  display: flex;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #64748B;
}
.nav-item.active { color: #2563EB; }
.nav-icon { font-size: 24px; }
.nav-label { font-size: 10px; font-weight: 600; }
```

### 10.3 Desktop Sidebar

```css
.sidebar {
  width: 240px;
  height: 100vh;
  background: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #64748B;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.sidebar-item:hover { background: #F1F5F9; }
.sidebar-item.active {
  background: #EFF6FF;
  color: #2563EB;
  font-weight: 600;
}
.sidebar-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 3px;
  height: 24px;
  background: #2563EB;
  border-radius: 0 3px 3px 0;
}
```

---

## 第十一部分：文件結構（建議）

```
LoRaTool-v9/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── StatusIndicator.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── TrendChart.tsx
│   │   │   └── DeviceListItem.tsx
│   │   ├── device/
│   │   │   ├── DeviceCard.tsx
│   │   │   ├── DeviceWorkspace.tsx
│   │   │   ├── StatusPanel.tsx
│   │   │   ├── LoRaSettings.tsx
│   │   │   └── DeviceConsole.tsx
│   │   ├── map/
│   │   │   ├── MapView.tsx
│   │   │   └── DeviceMarker.tsx
│   │   └── analytics/
│   │       ├── AnalyticsCharts.tsx
│   │       └── TimeRangePicker.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── DevicesPage.tsx
│   │   ├── DeviceDetailPage.tsx
│   │   ├── MapPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── hooks/
│   │   ├── useBLE.ts
│   │   ├── useGeolocation.ts
│   │   └── useDeviceData.ts
│   ├── services/
│   │   ├── bleManager.ts
│   │   └── storage.ts
│   ├── theme/
│   │   ├── tokens.ts
│   │   ├── typography.ts
│   │   └── spacing.ts
│   └── App.tsx
├── android/
└── ios/
```

---

## 第十二部分：v8.1 → v9 遷移計劃

### Phase 1：UI 重建（1-2 週）
- [ ] 建立 Design System（tokens, components）
- [ ] 實現 Header + Sidebar 佈局
- [ ] 實現 Dashboard 頁面
- [ ] 實現底部 Tab 導航（Mobile）

### Phase 2：功能遷移（1-2 週）
- [ ] 遷移 BLE 掃描功能
- [ ] 遷移設備連接功能
- [ ] 遷移參數讀寫功能
- [ ] 遷移 Console 功能

### Phase 3：新增功能（1 週）
- [ ] 實現 KPI 卡片
- [ ] 實現趨勢圖表
- [ ] 實現 Map 頁面
- [ ] 實現 Analytics 頁面

### Phase 4：優化（1 週）
- [ ] 動效優化
- [ ] 響應式適配
- [ ] 效能優化

---

## 第十三部分：交付清單

### ✅ 設計交付物

| 交付物 | 狀態 | 說明 |
|--------|------|------|
| Design Tokens | ✅ 完成 | CSS Variables |
| Typography Scale | ✅ 完成 | 4 層級字體系統 |
| Spacing System | ✅ 完成 | 8px 基礎單位 |
| Component Library | ✅ 完成 | Button/Card/Input/Badge |
| Animation Spec | ✅ 完成 | pulse/fade/transition |

### ✅ 架構交付物

| 交付物 | 狀態 | 說明 |
|--------|------|------|
| Dashboard 頁面 | ✅ 完成 | KPI + Chart + List |
| 設備列表頁面 | ✅ 完成 | 篩選 + 排序 |
| 單一設備工作台 | ✅ 完成 | 狀態 + 設定 + Console |
| 地圖頁面 | ✅ 完成 | GPS 軌跡 |
| 告警頁面 | ✅ 完成 | 3 級告警 |
| Analytics 頁面 | ✅ 完成 | 趨勢圖表 |

---

**文件結束 · LoRaTool v9 完整 UI/UX 設計規格書**
**基於：UIdesign.md + docx_text.txt + v8.1 APK 功能**
**版本：v9.0 · 2026-04-15**
