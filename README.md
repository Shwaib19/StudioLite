# StudioLite

> Un client desktop léger, rapide et agnostique pour orchestrer vos modèles d'IA locaux et cloud.

**StudioLite** est une alternative open-source et ultra-légère à LM Studio. L'application permet d'interagir aussi bien avec des modèles locaux (via Ollama / GGUF) qu'avec des API distantes (OpenRouter, OpenAI, Hugging Face), le tout au sein d'une interface unifiée supportant le texte, le code et la génération d'images.

---

## Fonctionnalités

- **Ultra léger :** Construit avec Tauri v2 + Rust pour une empreinte RAM et disque minimale.
- **Provider Agnostic :** 5 adapters — OpenRouter, OpenAI, Hugging Face, Ollama, GGUF local.
- **Streaming temps réel :** Affichage token par token via SSE (API distantes) ou events Tauri (GGUF local).
- **Hugging Face Hub :** Parcourir et télécharger des modèles `.gguf` avec gestion de reprise.
- **Multi-modalité :** Chat LLM avec texte, code avec coloration syntaxique, images avec lightbox.
- **Thème dark/light :** Design system complet avec mode sombre natif.
- **Persistance :** Configuration sauvegardée automatiquement via `tauri-plugin-store`.

---

## Stack Technique

| Layer | Technologie |
|-------|-------------|
| Desktop Shell | [Tauri v2](https://tauri.app/) (Rust) |
| Frontend | React 19 + TypeScript + Vite |
| State Management | Zustand (5 stores) |
| Styling | TailwindCSS v4 + Design System |
| Backend (Rust) | reqwest, sysinfo, tokio, serde, tauri-plugin-store |

---

## Architecture

```
StudioLite/
├── Asset/Logo.svg
├── docs/Architecture & plans
├── src/                         # Frontend React
│   ├── components/
│   │   ├── chat/        (7)     # ChatView, MessageBubble, MessageInput, CodeBlock, etc.
│   │   ├── layout/      (4)     # AppShell, Header, Sidebar, StatusBar
│   │   ├── model/       (4)     # ModelBrowser, ModelCard, LocalModelList, ModelDownloader
│   │   ├── settings/    (4)     # SettingsPanel, ProviderConfig, AppearanceSettings, ModelPathConfig
│   │   └── shared/      (3)     # Logo, MarkdownRenderer, Toast
│   ├── hooks/           (5)     # useChat, useModels, useStreaming, useTheme, useDownload
│   ├── stores/          (5)     # chat, model, provider, settings, download
│   ├── providers/       (7)     # 5 adapters + BaseProvider + ProviderRegistry
│   ├── services/        (2)     # tauriCommands, huggingface
│   ├── types/           (4)     # provider, chat, tauri, settings, model
│   └── utils/           (2)     # constants, idGenerator
├── src-tauri/                   # Backend Rust
│   ├── src/
│   │   ├── commands/    (3)     # file, model, system (9 commands)
│   │   ├── config/      (1)     # AppConfig with serde
│   │   ├── download/    (1)     # Download manager with resume
│   │   └── inference/   (1)     # Inference stub
│   └── Cargo.toml
└── GraphicChart.md              # Design system
```

---

## Installation & Développement

### Prérequis
- Node.js 18+
- Rust stable (https://rustup.rs)
- Tauri CLI: `cargo install tauri-cli --version "^2"`

### Quick Start
```bash
git clone https://github.com/Shwaib19/StudioLite.git
cd StudioLite
npm install
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

### Vérification
```bash
npx tsc --noEmit    # TypeScript
cargo check         # Rust
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture complète, interfaces TypeScript, flux de données, permissions Tauri |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | Plan d'implémentation en 8 phases |
| [`docs/TODO.md`](docs/TODO.md) | Suivi de projet avec checklists détaillées |
| [`GraphicChart.md`](GraphicChart.md) | Design system (couleurs, typographie, espacement) |

---

## Progression

| Phase | Status |
|-------|--------|
| Phase 1: Project Scaffolding | ✅ Terminé |
| Phase 2: Tauri Backend Foundation | ✅ Terminé |
| Phase 3: Provider Abstraction Layer | ✅ Terminé |
| Phase 4: Chat UI & Streaming | ✅ Terminé |
| Phase 5: Model Management | ✅ Terminé |
| Phase 6: Hugging Face Hub Integration | ✅ Terminé |
| Phase 7: Settings & Persistence | ✅ Terminé |
| Phase 8: Polish, Testing & Distribution | ✅ Terminé |

### Statistiques du projet
- **Fichiers frontend :** ~40 fichiers TypeScript/React
- **Fichiers backend :** ~12 modules Rust
- **Commandes Tauri :** 12
- **Adapters Provider :** 5
- **Stores Zustand :** 5
- **Zéro erreur TypeScript :** `tsc --noEmit` ✓
- **Zéro erreur Rust :** `cargo check` ✓

---
## First result
<img width="610" height="557" alt="image" src="https://github.com/user-attachments/assets/c81e6ff4-2442-4e41-b896-0ff4e19b0827" />
Very disapointing but it's okay, alot of thing doesn't work properly, it doesn't even work
just gonna find way to improve this

## Licence

MIT License. Voir le fichier [Licence](Licence).
