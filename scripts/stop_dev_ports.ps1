$ports = @(5000, 5173, 5174, 5175, 5176)

Write-Host "Stopping processes on common WriteLens ports..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) {
        Write-Host "Port $port: no listener"
        continue
    }

    $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        try {
            $proc = Get-Process -Id $pid -ErrorAction Stop
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Stopped PID $pid ($($proc.ProcessName)) on port $port" -ForegroundColor Yellow
        } catch {
            Write-Host "Could not stop PID $pid on port $port: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "Done." -ForegroundColor Green
