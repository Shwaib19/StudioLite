# Plan de Correction — UI/UX & Logique Fonctionnelle

## Problèmes Identifiés

### 1. Settings Panel — Layout cassé

- **Overlapping** : `ProviderConfig` n'a pas assez d'espace entre le nom/type et les boutons Configure/Remove
- **Colonne trop étroite** : `max-w-lg` (32rem/512px) sur le conteneur principal laisse 70% de l'écran vide
- **Texte compressé** : Le message "No directories configured..." dans `ModelPathConfig` est dans un conteneur sans largeur définie
- **Pas de cartes/sections visuelles** : Les sections (`<section>`) n'ont pas de fond ni de bordure, tout se fond

### 2. ModelBrowser — Pas de pagination, pas de détails, pas de téléchargement

- **Tous les modèles chargés d'un coup** : Aucune pagination, charge la liste entière
- **Pas de filtres** : Aucun champ de recherche ou filtre par provider/capability
- **Pas de vue détail** : Cliquer sur un modèle le sélectionne immédiatement sans montrer les détails
- **Pas de téléchargement** : Aucun bouton pour télécharger un modèle depuis le HF Hub
- **Pas de lancement local** : Aucune option pour lancer un modèle GGUF local

### 3. Rust Warnings

- `DownloadTask` fields unused, `Paused` variant unused, `get_download_status` unused
- `InferencePayload` struct unused

---

## Plan d'Action

### Task 1: Settings Panel — Refonte complète du layout

**Fichiers à modifier :**

- `src/components/settings/SettingsPanel.tsx`
- `src/components/settings/ProviderConfig.tsx`
- `src/components/settings/ModelPathConfig.tsx`

**Changements :**

1. Supprimer `max-w-lg` → utiliser `max-w-2xl` (672px) ou `w-full max-w-3xl`
2. Ajouter des cartes visuelles pour chaque section : `bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-4`
3. Dans `ProviderConfig` : ajouter `flex-col items-start` sur le conteneur, déplacer les boutons sous le nom avec un margin-top
4. Dans `ModelPathConfig` : ajouter `w-full` sur le conteneur du message vide
5. Ajouter un padding global plus large : `p-6` au lieu de `p-4`

### Task 2: ModelBrowser — Pagination, Filtres, Vue Détail

**Fichiers à modifier :**

- `src/stores/modelStore.ts` — Ajouter pagination + filtres
- `src/components/model/ModelBrowser.tsx` — Refonte complète
- `src/components/model/ModelCard.tsx` — Améliorer avec bouton détail

**Changements :**

1. **Store** : Ajouter `page`, `pageSize`, `searchQuery`, `providerFilter`, `capabilityFilter`, `totalCount`
2. **Pagination** : Afficher 12 modèles par page avec navigation page suivante/précédente
3. **Filtres** : Barre de recherche textuelle + dropdown provider + dropdown capability
4. **Vue détail** : Au clic sur un modèle, ouvrir un modal/panneau latéral avec infos complètes + boutons d'action
5. **Bouton "Select Model"** : Au lieu de sélectionner au clic, avoir un bouton explicite

### Task 3: ModelBrowser — Téléchargement & Lancement Local

**Fichiers à modifier :**

- `src/components/model/ModelBrowser.tsx` — Ajouter boutons d'action
- `src/components/model/ModelCard.tsx` — Ajouter bouton Download + Run
- `src/services/huggingface.ts` — Déjà prêt avec `getDownloadUrl()`
- `src/stores/downloadStore.ts` — Déjà prêt

**Changements :**

1. **Bouton Download** : Dans la vue détail, si le modèle vient du HF Hub, afficher un bouton "Download" qui appelle `downloadModel()` via Tauri
2. **Bouton Run Local** : Si le modèle est un GGUF local, afficher un bouton "Run" qui sélectionne le modèle et bascule vers la vue chat
3. **Indicateur** : Afficher un badge "Downloaded" / "Remote" / "Local" sur chaque carte

### Task 4: Rust Warnings — Nettoyage

**Fichiers à modifier :**

- `src-tauri/src/download/mod.rs` — Supprimer `get_download_status`, ajouter `#[allow(dead_code)]` ou supprimer les champs inutilisés
- `src-tauri/src/inference/mod.rs` — Ajouter `#[allow(dead_code)]`

**Changements :**

1. Ajouter `#[allow(dead_code)]` sur `DownloadTask` et `DownloadStatus`
2. Supprimer la fonction `get_download_status` (non utilisée)
3. Ajouter `#[allow(dead_code)]` sur `InferencePayload`

---

## Ordre d'exécution

```
Task 1: Settings Layout Fix
  │
  ▼
Task 2: ModelBrowser Pagination + Filters + Detail
  │
  ▼
Task 3: Download + Run buttons
  │
  ▼
Task 4: Rust warnings cleanup
  │
  ▼
Commit + Push
```
