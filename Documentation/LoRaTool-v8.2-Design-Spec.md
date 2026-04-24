# LoRaTool v8.2 最終設計規格書
> 基於：UIdesign.md + docx_text.txt 優化建議
> 日期：2026-04-15
> 版本：v8.2 Final

---

## 一、執行摘要

本文件整合了 **UIdesign.md** 的 Figma 設計系統和 **docx_text.txt** 的 6 大優化建議，落實到 v8.2 APK 實作中。

**主要變更（相較 v8.1）：**
1. ✅ SaaS 設計系統色彩替換
2. ✅ 單一設備工作台（Control Tab 整合所有操作）
3. ✅ 清晰的視覺層級（Level 1-4）
4. ✅ KPI 色彩與狀態指示
5. ✅ 按鈕優先級（Primary/Secondary/Danger）
6. ✅ Console 增強（Filter + Copy + Auto Scroll）

---

## 二、Design Tokens（已實作）

### 🎨 色彩系統（UIdesign.md SaaS 標準）

| Token | Hex | 使用場景 | 狀態 |
|-------|-----|----------|------|
| `--primary` | `#2563EB` | 主按鈕、連結 | ✅ |
| `--primaryH` | `#1D4ED8` | Primary Hover | ✅ |
| `--success` | `#16A34A` | 成功、在線、GPS OK | ✅ |
| `--warning` | `#F59E0B` | 待處理、警告 | ✅ |
| `--danger` | `#DC2626` | 錯誤、刪除、斷線 | ✅ |
| `--text` | `#0F172A` | 主要文字 | ✅ |
| `--muted` | `#64748B` | 次要文字、標籤 | ✅ |
| `--bg` | `#F1F5F9` | 頁面背景 | ✅ |
| `--card` | `#FFFFFF` | 卡片背景 | ✅ |
| `--border` | `#E2E8F0` | 邊框、分隔線 | ✅ |
| `--logTX` | `#3FB950` | TX 日誌（綠） | ✅ |
| `--logRX` | `#58A6FF` | RX 日誌（藍） | ✅ |
| `--logERR` | `#F85149` | 錯誤日誌（紅） | ✅ |
| `--logINFO` | `#8B949E` | 資訊日誌（灰） | ✅ |

### 🔤 字體層級（docx_text.txt 問題 2）

| 等級 | Size | Weight | 使用場景 | 狀態 |
|------|------|--------|----------|------|
| Level 1 | 24px | Bold (700) | Page Title | ✅ |
| Level 2 | 18px | SemiBold (600) | Section Header | ✅ |
| Level 3 | 16px | SemiBold (600) | Card Title | ✅ |
| Level 4 | 14px | Regular (400) | Body Text | ✅ |
| Caption | 11-12px | Regular | Label, ID, Timestamp | ✅ |

### 📐 間距系統（docx_text.txt 問題 3）

| Token | Value | 使用場景 | 狀態 |
|-------|-------|----------|------|
| Section Gap | 24px | 大區塊間距 | ✅ |
| Card Gap | 16px | 卡片間距 | ✅ |
| Card Padding | 16px | 卡片內距 | ✅ |
| Card Radius | 16px | 卡片圓角 | ✅ |
| Card Shadow | `0 2px 8px rgba(0,0,0,0.06)` | 卡片陰影 | ✅ |

---

## 三、Layout 結構（已實作）

### 底部導航欄

```
┌─────────────────────────────────────────────┐
│  📱 Devices    ⚙️ Control    🔔 Alerts    💻 Console  │
│   (26px→30px✓)  (26px→30px✓) (26px→30px✓) (26px→30px✓)  │
│   Devices      Control       Alerts       Console   │
└─────────────────────────────────────────────┘
```

**實作：** 4 Tabs，ICON 26px → 30px（選中），選中背景 `#F0F4FF`，文字 `#2563EB` Bold

### Header（深色 SaaS）

**實作：** `#0F172A` 深色背景，白色標題，GPS 標籤右上角

### GPS 狀態標籤

| 狀態 | 背景 | 文字 | 範例 |
|------|------|------|------|
| 成功 | `#DCFCE7` | `#16A34A` | 📍 25.0331, 121.5654 |
| 失敗 | `#FEE2E2` | `#DC2626` | 📍 定位失敗 |
| 等待 | `#F3F4F6` | `#64748B` | 📍 定位中... |

---

## 四、頁面規格（已實作）

### 4.1 Devices Tab

- 卡片：16px 圓角，陰影
- 設備名稱：16px Bold
- 按鈕：Primary (藍) 連接 / Danger (紅) 刪除

### 4.2 Control Tab（單一設備工作台）⭐

**整合：** KPI Cards + Section Pills + Parameters + Console（同一頁）

```
┌─────────────────────────────────────────────┐
│ Header（返回 + 斷開連線）                    │
├─────────────────────────────────────────────┤
│ KPI Cards (4欄：連線/驗證/待回應/電量)       │
├─────────────────────────────────────────────┤
│ Section Pills (12項分類)                     │
├─────────────────────────────────────────────┤
│ Parameter Cards (讀/寫/執行按鈕)             │
│ ...                                         │
└─────────────────────────────────────────────┘
```

### 4.3 Console Tab（docx_text.txt 問題 6）

**實作：**
- Filter Tabs：`全部` / `TX 發送` / `RX 接收` / `錯誤`
- Auto Scroll：日誌自動滾動到最新
- Copy：長按單行複製
- Clear：清除日誌按鈕
- Export：導出全部日誌

### 4.4 Alerts Tab

- Alert Card：16px 圓角，左邊框色彩區分（Critical=紅/Warning=黃/Info=藍）

---

## 五、Component 規範（已實作）

### 5.1 Button 優先級（docx_text.txt 問題 5）

| 類型 | 背景 | 使用場景 | 狀態 |
|------|------|----------|------|
| **Primary** | `#2563EB` | 掃描、寫入、連接 | ✅ |
| **Secondary** | `#64748B` | 讀取、取消、清除 | ✅ |
| **Danger** | `#DC2626` | 刪除、斷線、重置 | ✅ |
| **Ghost** | `transparent` | 返回、取消 | ✅ |

### 5.2 KPI Cards

- 背景：`#F0F4FF`
- 邊框：`#BFDBFE`
- 數值：24px Bold，`#2563EB`
- 狀態色彩：
  - Online：`#16A34A`（綠）
  - Offline：`#DC2626`（紅）
  - Pending：`#F59E0B`（黃）

### 5.3 Section Pills

- 未選中：`rgba(255,255,255,0.1)` + 灰色文字
- 選中：`#16A34A`（綠色）+ 白色文字
- 邊框：1px（選中時）

---

## 六、docx_text.txt 優化落實

### ❗ 問題 1：Device 操作分裂 → ✅ 已修復

**之前：** Devices → Config → Console 視覺區塊分離

**現在：** Control Tab 為「單一設備工作台」，所有操作在同一頁完成
- KPI Cards（頂部）
- Section Pills（分類）
- Parameters（中間主體）

### ❗ 問題 2：UI 層級不清 → ✅ 已修復

**之前：** 卡片太像，主次不分

**現在：** 明確的 4 層級設計
- Level 1 (24px Bold)：Page Title
- Level 2 (18px SemiBold)：Section
- Level 3 (16px SemiBold)：Card Title
- Level 4 (14px Regular)：Body Text

### ❗ 問題 3：顏色不夠 SaaS → ✅ 已修復

**之前：** 偏乾淨但沒有品牌感

**現在：** 統一 SaaS 色系
- Primary：`#2563EB`（藍）
- Success：`#16A34A`（綠）
- Danger：`#DC2626`（紅）
- Warning：`#F59E0B`（黃）

### ❗ 問題 4：KPI 不夠有感 → ✅ 已修復

**之前：** 有數字但沒有變化感

**現在：** KPI 有色彩 + 狀態指示
- Online：綠色文字 + Online 標籤
- Offline：紅色文字 + Offline 標籤
- Pending：黃色數字

### ❗ 問題 5：Button 優先級不明 → ✅ 已修復

**之前：** 按鈕看起來都一樣

**現在：** 明確的 Primary/Secondary/Danger 分類

### ❗ 問題 6：Console 還差 5% → ✅ 已修復

**之前：** 缺少 Filter / Copy / Auto Scroll

**現在：** 
- Filter Tabs（全部/TX/RX/錯誤）
- Auto Scroll（新日誌自動到頂部）
- Copy（長按複製單行）
- Clear（清除日誌按鈕）
- Export（導出全部）

---

## 七、功能確認

### ✅ 已實作

| 功能 | UIdesign | docx | APK |
|------|----------|------|-----|
| SaaS 色彩系統 | ✅ | ✅ | ✅ |
| 底部大 ICON 導航 | ✅ | ✅ | ✅ |
| 單一設備工作台 | ✅ | ✅ | ✅ |
| KPI 色彩狀態 | ✅ | ✅ | ✅ |
| 按鈕優先級 | ✅ | ✅ | ✅ |
| Console Filter | ✅ | ✅ | ✅ |
| Console Auto Scroll | ✅ | ✅ | ✅ |
| Console Copy | ✅ | ✅ | ✅ |
| GPS 狀態標籤 | ✅ | ✅ | ✅ |
| 16px 圓角卡片 | ✅ | ✅ | ✅ |
| Card Shadow | ✅ | ✅ | ✅ |
| 清晰的視覺層級 | ✅ | ✅ | ✅ |

### ⏳ 未來優化

| 功能 | 優先級 |
|------|--------|
| KPI 數字動畫 | P3 |
| Online 綠點 pulse 動效 | P3 |
| Dashboard 圖表（Chart） | P3 |
| Map GPS 軌跡線 | P3 |
| Console HEX/ASCII 切換 | P2 |

---

## 八、檔案結構

```
桌面/
├── LoRaTool-v8.2.apk                 # Android APK (23.2 MB)
├── LoRaTool-v8.2-web.html            # Web 預覽
└── LoRaTool-v8.2-Design-Spec.md      # 本文件

專案/
└── LoRaToolApp2/
    └── App.tsx                         # 源碼（已更新 SaaS 設計）
```

---

## 九、版本歷程

| 版本 | 日期 | 主要變更 |
|------|------|----------|
| v5.x | 2026-04-07 | 早期版本，多次閃退 |
| v6.x | 2026-04-11 | BLE 功能修復 |
| v7.x | 2026-04-12 | UI 改進，亮色主題 |
| v8.0 | 2026-04-15 | 底部導航、4 Tabs |
| v8.1 | 2026-04-15 | 閃退修復、GPS 功能 |
| **v8.2** | **2026-04-15** | **SaaS 設計系統 + 全部優化落實** |

---

## 十、結論

LoRaTool v8.2 達到 **SaaS 等級商業交付標準**：

✅ **Design System**：完整的 SaaS 色彩、字體、間距系統  
✅ **UI 優化**：6 大 UX 問題全部落實  
✅ **單一設備工作台**：Control Tab 整合所有操作  
✅ **Console 增強**：Filter + Copy + Auto Scroll + Export  
✅ **按鈕優先級**：Primary / Secondary / Danger 分類清晰  

**v8.2 可作為正式發布版本。**

---

**文件結束**
