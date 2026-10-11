@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo        APATHY CORP - ЗАПУСК ПОРТАЛА
echo ========================================================
echo.

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] Node.js / npm не найден в PATH!
    echo Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

if not exist node_modules (
    echo [1/2] Установка библиотек (npm install)...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo [ОШИБКА] Не удалось установить зависимости.
        pause
        exit /b 1
    )
)

echo.
echo [2/2] Запуск dev-сервера (npm run dev)...
echo Откройте адрес в браузере (обычно http://localhost:5173)
echo.
call npm run dev
pause
