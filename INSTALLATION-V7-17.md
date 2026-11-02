# NOVELYA V7.17 — installation

Cette version est construite à partir de **NOVELYA-V7-16 (2)(1).zip**.

## Étapes obligatoires (dans cet ordre)

1. **Sauvegarde** ta base Supabase et ton dépôt GitHub avant toute modification.
2. Dans **Supabase → SQL Editor → New query**, colle **tout le fichier `MIGRATION-V7-17-COMPTES-BLACKLIST.sql`** puis clique sur **Run**. Ce script ne doit être exécuté qu'après les migrations antérieures (notamment V7 auteurs/modération, V6.8 rôles/marque-pages). Le script peut remettre en attente des histoires déjà publiques contenant un terme blacklisté : vérifie la file de modération.
3. Sur **GitHub**, remplace les fichiers du site par ceux du ZIP (à la racine du dépôt). **Ne supprime pas `config.js`** ni ses paramètres existants si ton site utilise des paramètres propres.
4. Dans **Render**, attends le déploiement `Live` (ou lance un déploiement manuel si l'auto-deploy est désactivé). Actualise le navigateur avec **Ctrl+F5**.

## Fonctions

- **Supprimer un compte** : dans le profil, bouton de suppression avec double confirmation ; dans l'administration, gestion d'un membre puis suppression. Seul le propriétaire déclaré dans `site_owner` peut supprimer un autre compte. Le compte propriétaire est protégé. Les comptes administrateurs doivent être rétrogradés avant suppression. La suppression enlève aussi les histoires de ce compte et leurs chapitres.
- **Ajouter des chapitres** : Profil / Mes histoires → Chapitres → remplir le formulaire → Enregistrer. La liste de chapitres et le formulaire sont conservés, avec navigation améliorée et bouton Annuler.
- **Blacklist** : gestion des termes depuis le panneau admin ; contrôles en base sur les histoires et chapitres créés ou modifiés. Les contenus suspects passent en `pending` et apparaissent dans « Histoires à examiner ». Seul un admin peut approuver. Les termes usuels exclus à la demande ne sont pas ajoutés.
- **Marque-page** : bouton de suppression dans le lecteur lorsqu'un marque-page existe, et bouton Retirer dans « Lectures en cours ». Une confirmation est demandée avant suppression.

## Limites / précautions

- Le système déclenche une **alerte dans le panneau admin**, pas un e-mail ni une notification push.
- La blacklist détecte des termes et expressions ; elle peut produire des faux positifs et ne remplace pas une modération humaine.
- La suppression d'un compte est **irréversible** et peut nécessiter un ajustement si ta base a des tables personnalisées supplémentaires qui référencent `auth.users`.
- Les fonctionnalités Supabase ne peuvent pas être vérifiées en conditions réelles sans accès à ton projet : teste avec un compte de test avant d'ouvrir la publication aux visiteurs.
