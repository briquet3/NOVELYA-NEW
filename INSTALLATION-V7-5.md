# Novelya V7.5 — chapitres programmés et pagination

Base : V7.4 (elle-même construite sur V7.3). Vous pouvez installer directement cette V7.5 à la place de votre V7.3 ; **ne pas installer V7.4 séparément**.

## Correctifs
- Affichage des nouveaux chapitres programmés dans « Sorties à venir », avec date et compte à rebours (correctif V7.4 inclus).
- Nettoyage des espaces et lignes vides au début et à la fin du chapitre lors de la pagination.
- Suppression des segments de page sans texte et recalcul du total de pages.
- Navigation arrière entre chapitres attend la fin de la pagination avant de choisir la dernière page.
- Modes clair jaune miel et sombre de V7.3 conservés.

## Installation
1. Faire une sauvegarde du dépôt GitHub.
2. Décompresser le ZIP, déposer les fichiers à la racine du dépôt (pas dans un sous-dossier).
3. Attendre Render « Live », puis recharger avec Ctrl+F5.
4. Tester un chapitre terminé, les dernières pages, les marque-pages et une sortie programmée.

Aucun nouveau SQL ajouté pour V7.5. Les règles Supabase doivent permettre de consulter les métadonnées des chapitres futurs sans en exposer le contenu.
