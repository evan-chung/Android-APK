# LoRaTool v8.1 最終設計規格書

> 基於：v8.1 APK 實現 + Figma 設計稿 + UX 優化建議
> 日期：2026-04-15
> 版本：v8.1 Final Design Spec

---

## 一、設計風格定位

**風格**：現代 SaaS（Stripe / Vercel / Notion 等級）  
**定位**：專業、清爽、可商業銷售的 LoRaWAN 設備管理工具  
**核心原則**：
- 單一設備工作台（所有操作在一個畫面完成）
- 清晰的視覺層級（Level 1-4）
- 統一的設計語言

---

## 二、Design Tokens（設計系統）

### 🎨 Colors（SaaS 等級色板）

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#2563EB` | 主按鈕、連結、強調 |
| **Primary Hover** | `#1D4ED8` | 主按鈕 Hover |
| **Success** | `#16A34A` | 成功、連線中、GPS定位 |
| **Warning** | `#F59E0B` | 警告、待處理 |
| **Danger** | `#DC2626` | 錯誤、斷線、刪除 |
| **Text Primary** | `#0F172A` | 主要文字 |
| **Text Secondary** | `#64748B` | 次要文字、說明 |
| **Background** | `#F1F5F9` | 頁面背景 |
| **Card** | `#FFFFFF` | 卡片背景 |
| **Border** | `#E2E8F0` | 邊框、分隔線 |

### 🔤 Typography（字體層級）

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **H1 (Page Title)** | 24px | Bold (700) | 頁面標題（LoRaTool） |
| **H2 (Section)** | 18px | SemiBold (600) | 區塊標題（Devices / Control） |
| **H3 (Card Title)** | 16px | SemiBold (600) | 卡片標題 |
| **Body** | 14px | Regular (400) | 內文、參數值 |
| **Label** | 12px | Medium (500) | 標籤、小字說明 |
| **Caption** | 11px | Regular (400) | 時間戳、ID |

### 📐 Spacing（間距系統）

| Token | Value | Usage |
|-------|-------|-------|
| **Section Gap** | 24px | 大區塊間距 |
| **Card Gap** | 16px | 卡片間距 |
| **Card Padding** | 16~24px | 卡片內距 |
| **Element Gap** | 12px | 元素間距 |
| **Inner Padding** | 8~12px | 按鈕、輸入框內距 |

---

## 三、Layout（整體結構）

### 底部導航欄（Bottom Navigation）

```
┌─────────────────────────────────────────────┐
│  📱 Devices    ⚙️ Control    🔔 Alerts    💻 Console  │
│   (26px)       (26px)        (26px)       (30px✓)   │
│   Devices      Control       Alerts       Console   │
└─────────────────────────────────────────────┘
```

**規格**：
- 高度：56px + 32px（底部安全區）
- 背景：`#FFFFFF`
- 上邊框：`1px solid #E2E8F0`
- 陰影：`0 -2px 8px rgba(0,0,0,0.08)`
- ICON：26px（未選中）/ 30px（選中）
- Label：9px，選中時 `#2563EB` + Bold
- 選中背景：`#F0F4FF`（圓角 12px）

### Header（頂部欄）

```
┌─────────────────────────────────────────────┐
│ LoRaTool          v8.1              [GPS狀態] │
│ MOKO LoRaWAN Device Manager    📍 25.0331,  │
│                                 121.5654    │
└─────────────────────────────────────────────┘
```

**規格**：
- 背景：`#24292E`（深色）
- 標題：`20px / Bold / #FFFFFF`
- 副標題：`12px / Regular / #8B949E`
- GPS 標籤（右上角）：
  - 成功：`background:#DCFCE7; color:#16A34A`
  - 失敗：`background:#FEE2E2; color:#DC2626`
  - 等待：`background:#F3F4F6; color:#64748B`

---

## 四、頁面規格

### 4.1 Devices Tab（設備列表）

**結構**：
```
Header（含 GPS）
  └── 掃描按鈕（Primary）
  └── 掃描狀態文字
Device List（Card 列表）
  └── 設備卡片（名稱 + MAC + RSSI + 操作按鈕）
Bottom Nav
```

**設備卡片規格**：
- 圓角：`12px`
- 背景：`#FFFFFF`
- 邊框：`1px solid #E2E8F0`
- 陰影：`0 1px 3px rgba(0,0,0,0.04)`
- 內距：`14px`
- 名稱：`16px / Bold / #0F172A`
- MAC：`11px / Regular / #64748B`
- RSSI：`11px / Regular / #64748B`

**按鈕**：
- 連接：`background:#2563EB; color:#FFF`（Primary）
- 刪除：`background:#DC2626; color:#FFF`（Danger）

---

### 4.2 Control Tab（單一設備工作台）⭐ 核心頁面

**設計理念**：所有操作在一個畫面完成（Single Device Workspace）

**結構**：
```
Header（返回 + 斷開連線 + 設備名稱）
KPI Cards（4欄）
  └── 連線狀態 | 認證狀態 | 待回應 | 電量
Section Pills（橫向滾動）
  └── System | Work Mode | LoRaWAN Keys | LoRaWAN Config | Radio | Uplink | Network | Position | SOS | BLE Config | Device | Commands
Parameter Cards（主要內容區）
  └── 參數名稱 + 當前值 + 操作按鈕（讀/寫/執行）
Bottom Nav
```

**KPI Card 規格**：
- 背景：`#F0F4FF`
- 邊框：`1px solid #DDFEBF`
- 圓角：`10px`
- 內距：`14px`
- 數值：`22px / Bold / #2563EB`
- 標籤：`11px / Regular / #64748B`
- 狀態指示：
  - 已連線：`color:#16A34A`
  - 未連線：`color:#DC2626`

**Section Pills 規格**：
- 背景（未選中）：`rgba(255,255,255,0.1)`
- 背景（選中）：`#16A34A`
- 文字（未選中）：`#8B949E`
- 文字（選中）：`#FFFFFF`
- 圓角：`16px`
- 內距：`6px 14px`
- 字體：`12px / SemiBold`

**Parameter Card 規格**：
- 背景：`#FFFFFF`
- 邊框：`1px solid #E2E8F0`
- 左邊框（Pending）：`4px solid #F59E0B`
- 圓角：`12px`
- 內距：`14px`
- 參數名稱：`14px / SemiBold / #0F172A`
- 參數代碼：`10px / Regular / #64748B`
- 當前值：`13px / Regular`
  - 有值：`color:#16A34A`
  - Pending：`color:#F59E0B`
  - 無值：`color:#64748B`

**操作按鈕**：
- 讀取：`background:#64748B; color:#FFF`（Secondary）
- 寫入：`background:#2563EB; color:#FFF`（Primary）
- 執行：`background:#DC2626; color:#FFF`（Danger）

---

### 4.3 Console Tab（工程核心）

**結構**：
```
Header
Filter Tabs：[全部] [TX] [RX] [錯誤]
Log 區域（黑底）
  └── 時間戳 + 類型 + 內容 + [複製]
底部操作區
  └── [清除日誌] [導出]
Bottom Nav
```

**Console Box 規格**：
- 背景：`#1C2128`
- 圓角：`10px`
- 內距：`12px`
- 字體：`monospace / 11px`
- 最大高度：`220px`
- 自動滾動：到底部

**Log 行規格**：
- TX（發送）：`color:#3FB950`（綠色）
- RX（接收）：`color:#58A6FF`（藍色）
- ERR（錯誤）：`color:#F85149`（紅色）
- INFO（資訊）：`color:#8B949E`（灰色）

**Filter Tabs**：
- 未選中：`color:#64748B`
- 選中：`color:#2563EB; border-bottom:2px solid #2563EB`

---

### 4.4 Alerts Tab（告警監控）

**結構**：
```
Header
清除按鈕（Secondary）
Alert Cards 列表
  └── 圖示 + 標題 + 訊息 + 時間
說明文字（底部）
Bottom Nav
```

**Alert Card 規格**：
- 背景：`#FFFFFF`
- 邊框：`1px solid #E2E8F0`
- 左邊框：
  - Critical（紅）：`4px solid #DC2626`
  - Warning（黃）：`4px solid #F59E0B`
  - Info（藍）：`4px solid #2563EB`
- 圓角：`12px`
- 圖示：`22px`
- 標題：`15px / SemiBold / #0F172A`
- 訊息：`12px / Regular / #64748B`
- 時間：`11px / Regular / #64748B`

---

## 五、Component 規範

### 5.1 Button（按鈕優先級）

| 類型 | 背景 | 文字 | 使用場景 |
|------|------|------|----------|
| **Primary** | `#2563EB` | `#FFFFFF` | 主要操作（掃描、寫入、連接） |
| **Secondary** | `#64748B` | `#FFFFFF` | 次要操作（讀取、取消） |
| **Danger** | `#DC2626` | `#FFFFFF` | 危險操作（刪除、重置、斷線） |
| **Ghost** | `transparent` | `#2563EB` | 文字按鈕（返回） |

**規格**：
- 圓角：`8px`
- 內距：`12px 20px`
- 字體：`15px / SemiBold`
- 禁用：`opacity:0.5`

### 5.2 Card（卡片設計）

- 圓角：`12px`（標準）/ `16px`（大卡片）
- 背景：`#FFFFFF`
- 邊框：`1px solid #E2E8F0`
- 陰影：`0 1px 3px rgba(0,0,0,0.04)`
- 內距：`14px`（標準）/ `16~24px`（大卡片）

### 5.3 Modal（彈窗）

- 遮罩：`rgba(0,0,0,0.5)`
- 背景：`#FFFFFF`
- 圓角：`16px`
- 內距：`24px`
- 最大寬度：`400px`

### 5.4 Chip（選項標籤）

- 圓角：`16px`
- 邊框：`1px solid`
- 內距：`4px 10px`
- 字體：`12px / Regular`
- 未選中：`border-color:#2563EB; background:#F0F4FF; color:#2563EB`
- 選中：`border-color:#2563EB; background:#2563EB; color:#FFFFFF`

---

## 六、動效規格（加分項）

| 效果 | 實現方式 | 時長 |
|------|----------|------|
| **KPI 數字動畫** | 數字遞增動畫 | 500ms |
| **Online 綠點 pulse** | CSS animation pulse | 2s infinite |
| **Console auto scroll** | scrollTop = scrollHeight | 即時 |
| **Tab 切換** | opacity + translateX | 200ms ease |
| **Button press** | scale(0.98) | 100ms |
| **Card hover** | shadow 加深 | 200ms |

---

## 七、功能確認清單

### ✅ LoRaWAN 功能（v8.1 已實現）

| 功能 | 狀態 | 說明 |
|------|------|------|
| 52+ 個 LoRa 參數 | ✅ | 完整覆蓋 System/Mode/LoRaWAN/Radio/Uplink/Network/Position/SOS/BLE/Device/Commands |
| BLE 掃描 | ✅ | react-native-ble-plx |
| 設備連接 | ✅ | 讀/寫/執行 |
| Console 日誌 | ✅ | TX/RX/ERR 彩色區分 |
| GPS 定位 | ✅ | @react-native-community/geolocation |
| 告警系統 | ✅ | 離線/電量/RSSI |

### ✅ UI 功能（v8.1 已實現）

| 功能 | 狀態 | 說明 |
|------|------|------|
| 底部導航 | ✅ | 4 Tabs，大 ICON |
| GPS 狀態顯示 | ✅ | Header 右上角 |
| 單一設備工作台 | ✅ | Control Tab 整合所有操作 |
| 參數分類 | ✅ | 12 個 Section Pills |
| Pending 狀態 | ✅ | 黃色邊框標記 |
| 深色 Console | ✅ | 工程師友好 |

### 🔄 待優化（未來版本）

| 功能 | 優先級 | 說明 |
|------|--------|------|
| Console Filter | P2 | TX/RX/全部 過濾 |
| Console Copy | P2 | 單行複製按鈕 |
| Console HEX/ASCII 切換 | P2 | 顯示模式 |
| KPI 動畫 | P3 | 數字遞增效果 |
| Online Pulse | P3 | 綠點呼吸效果 |
| Dashboard 圖表 | P3 | 趨勢圖 |
| Map 軌跡 | P3 | GPS 軌跡線 |

---

## 八、開發建議

### 技術棧

| 層級 | 建議方案 |
|------|----------|
| **Frontend** | React Native + TypeScript |
| **UI 組件** | 自定義（無需第三方 UI 庫） |
| **BLE** | react-native-ble-plx |
| **GPS** | @react-native-community/geolocation |
| **儲存** | AsyncStorage |
| **Chart** | react-native-chart-kit（未來） |
| **Map** | react-native-maps（未來） |

### 檔案結構

```
LoRaToolApp2/
├── App.tsx                 # 主入口（已實現）
├── android/
│   └── app/
│       └── src/main/
│           └── java/com/loratoolapp/
│               ├── MainApplication.kt
│               └── gps/
│                   └── GpsPackage.kt    # GPS Native Module
├── package.json
└── ...
```

---

## 九、版本歷程

| 版本 | 日期 | 主要變更 |
|------|------|----------|
| v5.x | 2026-04-07 | 早期版本，多次閃退 |
| v6.x | 2026-04-11 | BLE 功能修復 |
| v7.x | 2026-04-12 | UI 改進，亮色主題 |
| v8.0 | 2026-04-15 | 底部導航、4 Tabs |
| **v8.1** | **2026-04-15** | **閃退修復、GPS 功能、最終設計規格** |

---

## 十、結論

LoRaTool v8.1 已達到**可商業交付**標準：

✅ **功能完整**：52+ LoRa 參數、BLE、GPS、Console  
✅ **UI 專業**：SaaS 等級設計、清晰層級  
✅ **體驗流暢**：單一設備工作台、底部導航  
✅ **穩定可靠**：閃退問題已修復  

**建議**：v8.1 可作為正式發布版本，後續版本專注於：
- P2：Console 增強（Filter/Copy/HEX 切換）
- P3：動效與圖表（KPI 動畫、趨勢圖）
- P3：Map 軌跡功能

---

**文件結束**
