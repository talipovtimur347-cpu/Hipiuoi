@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================================
echo        APATHY CORP - СБОРКА ПРОЕКТА (BUILD)
echo ========================================================
echo.

if not exist node_modules (
    echo Установка зависимостей...
    call npm install --legacy-peer-deps
)

echo Сборка в папку dist...
call npm run build
echo.
echo Сборка завершена! Файлы находятся в папке dist/
pause
