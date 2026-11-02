# Novelya V7.4 — Sorties à venir des chapitres

- Les chapitres dont `publish_at` est dans le futur apparaissent dans « Sorties à venir » pour les histoires déjà publiées.
- Affichage du titre de l’histoire, du titre du chapitre, de la date/heure et d’un compte à rebours.
- Le lecteur public ne charge toujours que les chapitres déjà publiés.
- Après l’heure de sortie, l’actualisation automatique (toutes les 30 secondes) retire l’annonce et rend le chapitre lisible.
- Mode clair jaune miel et ancien mode sombre V7.3 conservés.

## Installer
Décompresser puis envoyer les fichiers à la racine du dépôt GitHub. Attendre le déploiement Render et recharger avec Ctrl+F5.

**Aucun nouveau SQL nécessaire**, sous réserve que la politique Supabase existante autorise déjà la lecture des métadonnées des chapitres futurs (`title`, `publish_at`) : si une politique RLS masque entièrement ces lignes aux visiteurs, elles ne pourront pas apparaître publiquement sans une adaptation SQL sécurisée.
