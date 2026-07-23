$ErrorActionPreference = "Stop"

$BackupDir = Join-Path $PSScriptRoot "..\backups"
if (-Not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$DateStr = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDir "apotek_db_$DateStr.sql"

Write-Host "Mulai backup database ke $BackupFile..."
docker exec apotek-postgres pg_dump -U apotek_user apotek_db > $BackupFile

if ($?) {
    Write-Host "Backup berhasil!" -ForegroundColor Green
} else {
    Write-Host "Backup gagal!" -ForegroundColor Red
}
