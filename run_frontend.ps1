# PowerShell script to run the frontend Vite dev server
Set-Location "$PSScriptRoot\frontend"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting SOAR Platform Frontend (Vite + React)" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:5173" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

& npm.cmd run dev
