# PowerShell script to run the backend server
Set-Location "$PSScriptRoot"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting SOAR Platform Backend API (FastAPI)" -ForegroundColor Cyan
Write-Host "  URL:  http://localhost:8000" -ForegroundColor Green
Write-Host "  Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

$venvDir = if (Test-Path "$PSScriptRoot\.venv") { "$PSScriptRoot\.venv" } else { "$PSScriptRoot\venv" }
Set-Location "$PSScriptRoot\server"
& "$venvDir\Scripts\uvicorn.exe" main:app --host 0.0.0.0 --port 8000 --reload
