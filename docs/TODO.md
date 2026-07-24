# StudioLite — Project TODO / Progress

> **Master tracking file** — Last updated: 2026-07-24  
> **Architecture:** [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)  
> **Implementation Plan:** [`docs/IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)  
> **Design System:** [`GraphicChart.md`](../GraphicChart.md)

---

## Legend

| Symbol | Meaning                                |
| ------ | -------------------------------------- |
| `[ ]`  | Todo — not started                     |
| `[~]`  | In Progress — actively being worked on |
| `[x]`  | Done — completed and verified          |
| `[-]`  | Blocked — waiting on another task      |
| `[!]`  | Issue — needs attention                |

---

## Phase 1: Project Scaffolding

**Goal:** Initialize Tauri v2 + React project with all tooling configured.

- [ ] **1.1** Initialize Tauri v2 + React + Vite project (`npm create tauri-app`)
- [ ] **1.2** Install frontend dependencies (zustand, tauri plugins, lucide-react, react-markdown, etc.)
- [ ] **1.3** Configure TailwindCSS with design tokens from GraphicChart.md
- [ ] **1.4** Configure Tauri v2 permissions (capabilities/default.json)
- [ ] **1.5** Create full folder structure (frontend + Rust modules)
- [ ] **1.6** Create Logo.tsx component from Asset/Logo.svg
- [ ] **1.7** Initial Git commit

**Verification:** `npm run tauri dev` opens a window with TailwindCSS styles applied.

---

## Phase 2: Tauri Backend Foundation

**Goal:** Establish Rust backend with config management, filesystem ops, and system info.

- [ ] **2.1** Implement AppConfig struct (serde Serialize/Deserialize)
- [ ] **2.2** Implement save/load config commands (`get_app_config`, `save_app_config`)
- [ ] **2.3** Implement filesystem commands (`list_model_directories`, `add_model_directory`, `scan_gguf_files`)
- [ ] **2.4** Implement system info command (`get_system_info` with RAM/CPU/GPU)
- [ ] **2.5** Add Rust dependencies to Cargo.toml (reqwest, sysinfo, tokio, uuid)
- [ ] **2.6** Register all commands in main.rs / lib.rs
- [ ] **2.7** Verify with `cargo check` — no errors

**Verification:** `cargo check` passes. Frontend can call `invoke('get_system_info')` and receive data.

---

## Phase 3: Provider Abstraction Layer

**Goal:** Implement IProvider interface and all provider adapters.

### Types & Base

- [ ] **3.1** Define all provider types in `src/types/provider.ts`
- [ ] **3.2** Define ProviderError class with typed error codes
- [ ] **3.3** Implement BaseProvider abstract class with AbortController management

### Remote Providers

- [ ] **3.4** Implement OpenRouterProvider (chat + model listing + streaming)
- [ ] **3.5** Implement OpenAIProvider (chat + vision + image generation + streaming)
- [ ] **3.6** Implement HuggingFaceProvider (Inference API + streaming)

### Local Providers

- [ ] **3.7** Implement OllamaProvider (HTTP localhost + streaming)
- [ ] **3.8** Implement GGUFProvider (Tauri IPC + event-based streaming)

### Registry

- [ ] **3.9** Implement ProviderRegistry (singleton, factory, lifecycle management)
- [ ] **3.10** Write unit tests for each provider (mocked HTTP/Tauri IPC)

**Verification:** Each provider can list models and stream a chat response. ProviderRegistry returns correct provider by ID.

---

## Phase 4: Chat UI & Streaming

**Goal:** Build complete chat interface with real-time streaming.

### State Management

- [ ] **4.1** Implement Zustand chatStore (messages, streaming, abort)
- [ ] **4.2** Implement `useStreaming` hook (AsyncGenerator consumer)

### Layout

- [ ] **4.3** Build AppShell layout (sidebar | chat | settings)
- [ ] **4.4** Build Sidebar (conversation history, new chat, model browser toggle)
- [ ] **4.5** Build Header (Logo, model selector, provider indicator, settings button)
- [ ] **4.6** Build StatusBar (active provider, model, connection status)

### Chat Components

- [ ] **4.7** Build ChatView (orchestrates message list + input)
- [ ] **4.8** Build MessageList (scrollable, auto-scroll, virtualized)
- [ ] **4.9** Build MessageBubble (renders text/code/images)
- [ ] **4.10** Build MessageInput (textarea, send, image upload, code insertion)
- [ ] **4.11** Build StreamingText (real-time token renderer with cursor)
- [ ] **4.12** Build CodeBlock (syntax highlighting, copy button)
- [ ] **4.13** Build ImageDisplay (renders images, lightbox on click)

### Markdown

- [ ] **4.14** Configure react-markdown with rehype-highlight
- [ ] **4.15** Support GitHub-flavored Markdown (tables, task lists, code fences)

### Testing

- [ ] **4.16** Manual test: send message with each provider type
- [ ] **4.17** Test abort during streaming
- [ ] **4.18** Test image upload and display

**Verification:** User can type a message, see streaming response, abort mid-stream, upload images.

---

## Phase 5: Model Management

**Goal:** Implement model listing, selection, and local model management.

- [ ] **5.1** Implement Zustand modelStore (models list, selection, loading)
- [ ] **5.2** Build model selector dropdown in Header (grouped by provider, capability badges)
- [ ] **5.3** Build LocalModelList component (GGUF files, size, quantization)
- [ ] **5.4** Implement Rust `list_gguf_models` command (scan directories for \*.gguf)
- [ ] **5.5** Implement Rust `get_model_info` command (parse GGUF header metadata)
- [ ] **5.6** Test model switching mid-conversation

**Verification:** All provider models appear in selector. Local GGUF files detected and parsed.

---

## Phase 6: Hugging Face Hub Integration

**Goal:** Browse and download models from Hugging Face Hub.

### HF Hub API

- [ ] **6.1** Implement HF Hub API client (`src/services/huggingface.ts`)
- [ ] **6.2** Implement model search (query + GGUF filter)
- [ ] **6.3** Implement model details + file listing

### UI

- [ ] **6.4** Build ModelBrowser (search bar, results grid, pagination)
- [ ] **6.5** Build ModelCard (details, quantization options, download button)

### Download Manager (Rust)

- [ ] **6.6** Implement download manager with reqwest (resume, progress events)
- [ ] **6.7** Implement Rust commands: `download_model`, `pause_download`, `cancel_download`
- [ ] **6.8** Implement Zustand downloadStore (queue, progress, Tauri event listeners)
- [ ] **6.9** Build ModelDownloader UI (progress bars, speed, ETA, pause/cancel)

### Testing

- [ ] **6.10** Test search + browse flow
- [ ] **6.11** Test download with progress updates
- [ ] **6.12** Test pause/resume/cancel

**Verification:** User can search HF Hub, see quantization options, download a model with progress tracking.

---

## Phase 7: Settings & Persistence

**Goal:** Implement settings UI, provider configuration, and persistent storage.

### Stores

- [ ] **7.1** Implement Zustand settingsStore (theme, font, preferences)
- [ ] **7.2** Implement Zustand providerStore (provider configs, active provider)

### Settings UI

- [ ] **7.3** Build SettingsPanel (tabs: General, Providers, Models, About)
- [ ] **7.4** Build ProviderConfig form (API key, base URL, test connection)
- [ ] **7.5** Build AppearanceSettings (theme, font size, font family)
- [ ] **7.6** Build ModelPathConfig (add/remove GGUF directories)

### Persistence

- [ ] **7.7** Configure tauri-plugin-store for settings/providers/conversations
- [ ] **7.8** Implement theme switch hook (useTheme, dark class toggle)
- [ ] **7.9** Load settings on app startup, save on change (debounced)

### Testing

- [ ] **7.10** Test theme persistence across restart
- [ ] **7.11** Test provider config save + validation
- [ ] **7.12** Test model directory add/remove

**Verification:** Settings persist across app restarts. Provider API keys are stored securely.

---

## Phase 8: Polish, Testing & Distribution

**Goal:** Final testing, performance optimization, and build for distribution.

### Error Handling

- [ ] **8.1** Audit all error paths (network, auth, model load, OOM)
- [ ] **8.2** Ensure user-friendly error messages with actionable steps
- [ ] **8.3** Implement Toast notification system for non-blocking errors

### Performance

- [ ] **8.4** Virtualize message list for large conversations
- [ ] **8.5** Add React.memo to heavy components (MessageBubble, CodeBlock)
- [ ] **8.6** Debounce HF Hub search (300ms)
- [ ] **8.7** Lazy-load settings panel

### Security

- [ ] **8.8** Verify API keys never appear in logs/errors
- [ ] **8.9** Verify CSP in tauri.conf.json
- [ ] **8.10** Verify path traversal protection in Rust commands
- [ ] **8.11** Verify Markdown/input sanitization

### Build & Distribution

- [ ] **8.12** Configure tauri.conf.json (app name, version, icons, window)
- [ ] **8.13** Generate app icons from Asset/Logo.svg
- [ ] **8.14** Build for Windows (MSI/NSIS)
- [ ] **8.15** Build for macOS (DMG)
- [ ] **8.16** Build for Linux (AppImage/deb)

### CI/CD (Optional)

- [ ] **8.17** Set up GitHub Actions (cargo check + tsc on PR)
- [ ] **8.18** Auto-build on tag push, upload to Releases

### Documentation

- [ ] **8.19** Update README.md with features, screenshots, setup guide
- [ ] **8.20** Write provider configuration guide

**Verification:** `cargo check` + `tsc --noEmit` pass. App builds for all target platforms.

---

## Quick Reference: File Creation Order

When starting implementation, create files in this order within each phase:

```
Phase 1:
  src-tauri/capabilities/default.json
  tailwind.config.ts
  src/index.css
  src/components/shared/Logo.tsx

Phase 2:
  src-tauri/src/config/app_config.rs
  src-tauri/src/commands/file.rs
  src-tauri/src/commands/system.rs
  src-tauri/src/commands/model.rs
  src-tauri/src/main.rs (update)

Phase 3:
  src/types/provider.ts
  src/providers/BaseProvider.ts
  src/providers/OpenRouterProvider.ts
  src/providers/OpenAIProvider.ts
  src/providers/HuggingFaceProvider.ts
  src/providers/OllamaProvider.ts
  src/providers/GGUFProvider.ts
  src/providers/ProviderRegistry.ts

Phase 4:
  src/stores/chatStore.ts
  src/hooks/useStreaming.ts
  src/components/layout/AppShell.tsx
  src/components/layout/Sidebar.tsx
  src/components/layout/Header.tsx
  src/components/layout/StatusBar.tsx
  src/components/chat/ChatView.tsx
  src/components/chat/MessageList.tsx
  src/components/chat/MessageBubble.tsx
  src/components/chat/MessageInput.tsx
  src/components/chat/StreamingText.tsx
  src/components/chat/CodeBlock.tsx
  src/components/chat/ImageDisplay.tsx

Phase 5:
  src/stores/modelStore.ts
  src-tauri/src/commands/model.rs (update)

Phase 6:
  src/services/huggingface.ts
  src-tauri/src/download/manager.rs
  src-tauri/src/commands/download.rs
  src/stores/downloadStore.ts
  src/components/model/ModelBrowser.tsx
  src/components/model/ModelCard.tsx
  src/components/model/ModelDownloader.tsx

Phase 7:
  src/stores/settingsStore.ts
  src/stores/providerStore.ts
  src/hooks/useTheme.ts
  src/components/settings/SettingsPanel.tsx
  src/components/settings/ProviderConfig.tsx
  src/components/settings/AppearanceSettings.tsx
  src/components/settings/ModelPathConfig.tsx
```

---

## Current Sprint

<!-- Update this section as work progresses -->

| Task                  | Assignee | Status | Notes       |
| --------------------- | -------- | ------ | ----------- |
| Phase 1: Scaffolding  | —        | `[ ]`  | Not started |
| Phase 2: Rust Backend | —        | `[ ]`  | Not started |
| Phase 3: Providers    | —        | `[ ]`  | Not started |
| Phase 4: Chat UI      | —        | `[ ]`  | Not started |
| Phase 5: Models       | —        | `[ ]`  | Not started |
| Phase 6: HF Hub       | —        | `[ ]`  | Not started |
| Phase 7: Settings     | —        | `[ ]`  | Not started |
| Phase 8: Polish       | —        | `[ ]`  | Not started |

---

## Known Issues / Blockers

<!-- Log issues here as they arise -->

| #   | Issue    | Phase | Status | Workaround |
| --- | -------- | ----- | ------ | ---------- |
| —   | None yet | —     | —      | —          |
