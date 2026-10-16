@echo off
cd /d "%~dp0"
echo ============================================================
echo   Starting SOAR Platform Backend API (FastAPI)
echo   Docs: http://localhost:8000/docs
echo ============================================================
call "venv\Scripts\activate.bat"
cd server
..\venv\Scripts\uvicorn.exe main:app --host 0.0.0.0 --port 8000 --reload
pause
