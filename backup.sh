#!/bin/bash
# Script de backup local de la base de données Supabase

echo "Lancement du backup de la base de données Supabase..."

# Vérifier si Supabase CLI est installé (globalement ou via npx)
if npx supabase --version > /dev/null 2>&1; then
    mkdir -p backups
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    npx supabase db dump -f backups/dump_$TIMESTAMP.sql
    echo "Backup terminé : backups/dump_$TIMESTAMP.sql"
else
    echo "Erreur: Supabase CLI introuvable."
    exit 1
fi
