@echo off
cd /d "%~dp0\frontend"
echo ============================================================
echo   Starting SOAR Platform Frontend (Vite + React)
echo   Dashboard: http://localhost:5173
echo ============================================================
call npm.cmd run dev
pause
