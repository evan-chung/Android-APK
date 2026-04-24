@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     LoRa Tool App - MIUI 安裝修復工具                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set ADB_PATH=C:\Users\user\AppData\Local\Android\Sdk\platform-tools\adb.exe
set APK_PATH=C:\Users\user\Desktop\app-debug.apk

echo 正在檢查 ADB...
if not exist "%ADB_PATH%" (
    echo ❌ ADB 未找到
    echo 請確認 Android SDK platform-tools 已安裝
    pause
    exit /b 1
)
echo ✓ ADB 已找到

echo.
echo 檢查設備連接...
"%ADB_PATH%" devices
echo.

echo ══════════════════════════════════════════════════════════════
echo 選擇安裝方式:
echo.
echo [1] 標準安裝 (常規模式)
echo [2] 強制安裝 (繞過限制) ← 推薦 MIUI 使用
echo [3] 降級安裝 (允許版本降級)
echo [4] 測試包安裝 (debug 簽名)
echo [5] 完全強制安裝 (所有參數)
echo.
set /p choice="請輸入選項 (1-5): "

echo.
echo 開始安裝...
echo.

if "%choice%"=="1" (
    echo 執行: adb install -r app-debug.apk
    "%ADB_PATH%" install -r "%APK_PATH%"
) else if "%choice%"=="2" (
    echo 執行: adb install -r -d app-debug.apk
    "%ADB_PATH%" install -r -d "%APK_PATH%"
) else if "%choice%"=="3" (
    echo 執行: adb install -r -d -g app-debug.apk
    "%ADB_PATH%" install -r -d -g "%APK_PATH%"
) else if "%choice%"=="4" (
    echo 執行: adb install -r -d -t app-debug.apk
    "%ADB_PATH%" install -r -d -t "%APK_PATH%"
) else if "%choice%"=="5" (
    echo 執行: adb install -r -d -t -g --bypass-low-target-sdk-block app-debug.apk
    "%ADB_PATH%" install -r -d -t -g --bypass-low-target-sdk-block "%APK_PATH%"
) else (
    echo 無效選項，使用標準安裝...
    "%ADB_PATH%" install -r "%APK_PATH%"
)

if errorlevel 1 (
    echo.
    echo ══════════════════════════════════════════════════════════════
    echo ❌ 安裝失敗
    echo.
    echo 請嘗試以下操作:
    echo.
    echo 1. 手機上:
    echo    設定 → 更多設定 → 開發者選項
    echo    → 關閉「啟用 MIUI 優化」
    echo    → 重啟手機
    echo.
    echo 2. 清除安裝器緩存:
    echo    設定 → 應用設定 → 應用管理
    echo    → 搜索「應用包管理組件」
    echo    → 清除數據
    echo.
    echo 3. 重新連接 USB 並重試
    echo ══════════════════════════════════════════════════════════════
) else (
    echo.
    echo ══════════════════════════════════════════════════════════════
    echo ✅ 安裝成功！
    echo.
    echo 應用名稱: LoRa Tool
    echo 包名: com.loratoolapp2
    echo.
    echo 現在可以在手機上找到並打開該應用
    echo ══════════════════════════════════════════════════════════════
)

echo.
pause
