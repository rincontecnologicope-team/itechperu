param(
  [string]$Url = "https://itechperu-tm.vercel.app",
  [int]$IntervalSec = 8,
  [int]$TimeoutSec = 600
)

$start = Get-Date
$deadline = $start.AddSeconds($TimeoutSec)

Write-Host "Esperando deploy listo en $Url"
Write-Host "Intervalo: ${IntervalSec}s | Timeout: ${TimeoutSec}s"

while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    $statusCode = [int]$response.StatusCode
  } catch {
    if ($_.Exception.Response) {
      $statusCode = [int]$_.Exception.Response.StatusCode
    } else {
      $statusCode = -1
    }
  }

  $elapsed = [int]((Get-Date) - $start).TotalSeconds

  if ($statusCode -eq 200) {
    Write-Host "Deploy listo en ${elapsed}s. Status: 200" -ForegroundColor Green
    [console]::beep(1100, 180)
    Start-Sleep -Milliseconds 120
    [console]::beep(1300, 220)
    Start-Sleep -Milliseconds 120
    [console]::beep(1500, 260)
    exit 0
  }

  if ($statusCode -eq -1) {
    Write-Host "Aun no disponible (${elapsed}s): sin respuesta" -ForegroundColor Yellow
  } else {
    Write-Host "Aun no disponible (${elapsed}s): HTTP $statusCode" -ForegroundColor Yellow
  }

  Start-Sleep -Seconds $IntervalSec
}

Write-Host "Timeout: el deploy no quedo listo en ${TimeoutSec}s." -ForegroundColor Red
[console]::beep(600, 350)
[console]::beep(500, 350)
exit 1
