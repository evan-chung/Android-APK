# CloudTek SaaS UI – Figma 最終設計稿（可直接交付設計/開發）

---

# 1. 設計風格（Light SaaS）

風格定位：
- 現代 SaaS（類似 Stripe / Vercel / Notion）
- 清爽、專業、可商業銷售

---

# 2. Design Tokens（設計系統）

## 🎨 Colors

Primary: #2563EB
Primary Hover: #1D4ED8

Success: #16A34A
Warning: #F59E0B
Danger: #DC2626

Text Primary: #0F172A
Text Secondary: #64748B

Background: #F1F5F9
Card: #FFFFFF
Border: #E2E8F0

---

## 🔤 Typography

Font: Inter / Noto Sans

Title: 24px / Bold
Section: 18px / SemiBold
Body: 14px / Regular
Label: 12px / Medium

---

## 📐 Spacing

Section Gap: 24px
Card Gap: 16px
Padding: 16~24px

---

# 3. Layout（整體結構）

## 左側 Sidebar

- Dashboard
- Devices
- Map
- Alerts
- Analytics
- Settings

---

## 上方 Header

- Logo（CloudTek）
- 搜尋
- 使用者

---

# 4. Dashboard（首頁）

## KPI Cards

[Devices]
120
+12% ↑

[Online]
98 ●

[Alerts]
3 🔴

[Data Usage]
2.4MB

---

## Chart

- 折線圖（Data / RSSI / Battery）

---

## Device List

Device A   ● Online
RSSI -95   Battery 78%

---

# 5. Device Detail（核心頁面）

👉 單頁完成（重要）

---

## 上方資訊

Device A
● Online
Last seen: 3s ago

---

## 狀態卡片

RSSI: -98 dBm
SNR: 7
Battery: 80%

---

## LoRa 設定

傳輸模式：
(●) 標準
( ) 省電
( ) 即時

進階 ▼
DR: 3
ADR: ON
Retry: 1

[Apply] [Reset]

---

## Console（工程核心）

[HEX] [ASCII] [Filter: All/TX/RX]

TX:
[ 01 03 FF ] [Send]

RX:
12:01 RX 01 03 FF AA [Copy]
12:02 TX ACK         [Copy]

[Clear]

---

# 6. Map（GPS）

- Device marker
- 軌跡線
- 點擊顯示 Device Info

---

# 7. Alerts

🔴 Critical
🟡 Warning
🔵 Info

Device A - RSSI Low
Time: 12:01

---

# 8. Analytics

- 折線圖
- 時間範圍（1h / 24h / 7d）

---

# 9. Component 規範

## Button

Primary（藍）
Secondary（灰）
Danger（紅）

---

## Card

- 圓角 16px
- shadow: sm
- padding: 16px

---

## Status

Online: 綠點
Offline: 灰
Alert: 紅

---

# 10. 動效（加分）

- KPI 數字動畫
- Online 綠點 pulse
- Console auto scroll

---

# 11. 開發建議

Frontend：React + Tailwind
Chart：Recharts
Map：Mapbox

---

# END

