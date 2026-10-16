# PowerShell script to run the Hardhat Local Blockchain Node and deploy the DecisionAuditLedger contract
Set-Location "$PSScriptRoot\blockchain"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Starting Hardhat Local Blockchain Node (EVM)" -ForegroundColor Cyan
Write-Host "  RPC URL:  http://127.0.0.1:8545" -ForegroundColor Green
Write-Host "  Chain ID: 31337" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# Start hardhat node in background job or direct process
$nodeProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx hardhat node" -PassThru

Write-Host "Waiting for Hardhat node to initialize on port 8545..." -ForegroundColor Yellow
$connected = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:8545" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ErrorAction Stop
        if ($response.result) {
            $connected = $true
            break
        }
    } catch {
        # Keep waiting
    }
}

if ($connected) {
    Write-Host "Hardhat node is ONLINE! Deploying DecisionAuditLedger..." -ForegroundColor Green
    & cmd.exe /c npx hardhat run scripts/deploy.js --network localhost
    Write-Host "`nBlockchain node is running. Press Ctrl+C in this window to stop." -ForegroundColor Cyan
    # Keep the script active waiting on the node process
    $nodeProcess.WaitForExit()
} else {
    Write-Host "Failed to connect to Hardhat node within 30 seconds." -ForegroundColor Red
}
