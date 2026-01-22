# Скрипт для полной перезагрузки frontend
Write-Host "Очистка кеша Vite..." -ForegroundColor Yellow

# Остановка процесса (если запущен)
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*frontend*"} | Stop-Process -Force

# Удаление кеша
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .cache -ErrorAction SilentlyContinue

Write-Host "Кеш очищен!" -ForegroundColor Green
Write-Host ""
Write-Host "Теперь запустите: npm run dev" -ForegroundColor Cyan
