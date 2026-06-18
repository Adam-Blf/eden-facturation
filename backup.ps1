# Script de backup local de la base de données Supabase pour Windows

Write-Host "Lancement du backup de la base de données Supabase..."

# Vérifier si Supabase CLI est disponible via npx
try {
    $version = npx supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        if (!(Test-Path "backups")) {
            New-Item -ItemType Directory -Path "backups" | Out-Null
        }
        npx supabase db dump -f "backups/dump_$timestamp.sql"
        Write-Host "Backup terminé : backups/dump_$timestamp.sql" -ForegroundColor Green
    } else {
        Write-Host "Erreur: Supabase CLI introuvable ou erreur lors de l'exécution." -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: Supabase CLI introuvable." -ForegroundColor Red
}