@echo off
cd /d "%~dp0"
echo ============================================================
echo   Starting SOAR Platform Backend API (FastAPI)
echo   Docs: http://localhost:8000/docs
echo ============================================================
set "VENV_DIR=venv"
if exist ".venv" set "VENV_DIR=.venv"
call "%VENV_DIR%\Scripts\activate.bat"
cd server
..\%VENV_DIR%\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
pause
