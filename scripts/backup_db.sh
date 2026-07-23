#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKUP_DIR="$DIR/../backups"

mkdir -p "$BACKUP_DIR"

DATE_STR=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/apotek_db_$DATE_STR.sql"

echo "Mulai backup database ke $BACKUP_FILE..."
docker exec apotek-postgres pg_dump -U apotek_user apotek_db > "$BACKUP_FILE"
echo "Backup berhasil!"
