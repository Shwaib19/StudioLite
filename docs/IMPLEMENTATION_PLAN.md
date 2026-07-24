# StudioLite — Implementation Plan

> **Version:** 1.0.0  
> **Prerequisites:** Node.js 18+, Rust stable, Tauri v2 CLI  
> **Design System:** [`GraphicChart.md`](../GraphicChart.md)  
> **Architecture:** [`ARCHITECTURE.md`](ARCHITECTURE.md)  
> **Tracking:** [`TODO.md`](TODO.md)

---

## Implementation Phases

This plan is divided into **8 sequential phases**. Each phase builds on the previous one. **Do not skip phases** — each phase produces a testable, shippable increment.

```
Phase 1: Project Scaffolding
     │
     ▼
Phase 2: Tauri Backend Foundation
     │
     ▼
Phase 3: Provider Abstraction Layer
     │
     ▼
Phase 4: Chat UI & Streaming
     │
     ▼
Phase 5: Model Management
     │
     ▼
Phase 6: Hugging Face Hub Integration
     │
     ▼
Phase 7: Settings & Persistence
     │
     ▼
Phase 8: Polish, Testing & Distribution
```

---

## Phase 1: Project Scaffolding

**Goal:** Initialize the Tauri v2 + React project with all tooling configured.

### Steps

#### 1.1 Initialize Tauri v2 + React + Vite

```bash
npm create tauri-app@latest StudioLite -- --template react-ts
```

- This creates the Vite React frontend + `src-tauri/` Rust backend.
- Verify with `npm run tauri dev` that the default window opens.

#### 1.2 Install Frontend Dependencies

```bash
npm install zustand                    # State management
npm install @tauri-apps/api            # Tauri IPC (v2)
npm install @tauri-apps/plugin-fs      # Filesystem plugin
npm install @tauri-apps/plugin-http    # HTTP plugin
npm install @tauri-apps/plugin-shell   # Shell plugin
npm install @tauri-apps/plugin-dialog  # File dialog plugin
npm install @tauri-apps/plugin-store   # Persistent store plugin
npm install lucide-react               # Icons
npm install react-markdown             # Markdown rendering
npm install rehype-highlight           # Code syntax highlighting
npm install uuid                       # ID generation
npm install -D @types/uuid             # TypeScript types
```

#### 1.3 Configure TailwindCSS with Design System

- Install TailwindCSS v3 with PostCSS.
- Configure `tailwind.config.ts` with the design tokens from [`GraphicChart.md`](../GraphicChart.md) (colors, fonts, spacing, shadows, border radius).
- Add `@tailwind` directives to `src/index.css`.
- Import Google Fonts (Sora + Inter) in `index.html`.

#### 1.4 Configure Tauri v2 Permissions

- Create `src-tauri/capabilities/default.json` with all required permissions (fs, http, shell, dialog, store).
- Add Tauri plugins to `src-tauri/Cargo.toml`.

#### 1.5 Create Folder Structure

- Create all frontend directories as specified in [`ARCHITECTURE.md`](ARCHITECTURE.md#2-project-structure).
- Create all Rust module files with stub `mod.rs` files.

#### 1.6 Integrate Logo

- Create [`src/components/shared/Logo.tsx`](../src/components/shared/Logo.tsx) that renders the SVG from [`Asset/Logo.svg`](../Asset/Logo.svg) as an inline React component.
- The logo component should accept `className` and `size` props.

#### 1.7 Setup Git Repository

```bash
git init
git add .
git commit -m "chore: initial scaffold with Tauri v2 + React + TailwindCSS"
```

---

## Phase 2: Tauri Backend Foundation

**Goal:** Establish the Rust backend with config management, filesystem operations, and system info.

### Steps

#### 2.1 App Configuration (`src-tauri/src/config/`)

- Implement `AppConfig` struct with serde Serialize/Deserialize.
- Implement `save_config()` and `load_config()` using `tauri-plugin-store` (or a JSON file in app data directory).
- Create `#[tauri::command] get_app_config` and `save_app_config`.

#### 2.2 Filesystem Commands (`src-tauri/src/commands/file.rs`)

- `list_model_directories()`: Read configured model paths.
- `add_model_directory(path)`: Add a new path to config.
- `scan_gguf_files(path)`: Recursively scan a directory for `*.gguf` files.
- `get_file_size(path)`: Get file size in bytes.

#### 2.3 System Info Command (`src-tauri/src/commands/system.rs`)

- `get_system_info()`: Return RAM (total/available), CPU cores, GPU info (via `sysinfo` crate).
- This helps the frontend recommend appropriate models based on available resources.

#### 2.4 Rust Dependencies (`src-tauri/Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-fs = "2"
tauri-plugin-http = "2"
tauri-plugin-shell = "2"
tauri-plugin-dialog = "2"
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["stream"] }
sysinfo = "0.30"
tokio = { version = "1", features = ["full"] }
uuid = { version = "1", features = ["v4"] }
```

#### 2.5 Test Backend Commands

- Build with `cargo check` in `src-tauri/`.
- Verify all commands are registered and return expected data.

---

## Phase 3: Provider Abstraction Layer

**Goal:** Implement the `IProvider` interface and all provider adapters.

### Steps

#### 3.1 Type Definitions (`src/types/provider.ts`)

- Define all types from [`ARCHITECTURE.md` §7.1](ARCHITECTURE.md#71-provider-contract).
- Define `ProviderError` class with typed error codes.

#### 3.2 Base Provider (`src/providers/BaseProvider.ts`)

- Abstract class implementing `IProvider` with:
  - Common `AbortController` management.
  - Shared `validate()` logic (API key presence, URL format).
  - `createAbortableStream()` helper for HTTP streaming.

#### 3.3 OpenRouter Provider (`src/providers/OpenRouterProvider.ts`)

- Endpoint: `https://openrouter.ai/api/v1/chat/completions`.
- Models: fetched from `https://openrouter.ai/api/v1/models`.
- Supports: text, code, vision (via model selection).
- Streaming: SSE via `ReadableStream`.

#### 3.4 OpenAI Provider (`src/providers/OpenAIProvider.ts`)

- Endpoint: `https://api.openai.com/v1/chat/completions` (configurable base URL).
- Models: fetched from `https://api.openai.com/v1/models`.
- Supports: text, code, vision (GPT-4V), image generation (DALL-E).
- Streaming: SSE via `ReadableStream`.
- **Image generation**: Separate `generateImage()` method (not a chat call).

#### 3.5 HuggingFace Provider (`src/providers/HuggingFaceProvider.ts`)

- Endpoint: `https://api-inference.huggingface.co/models/{modelId}`.
- Models: pre-configured list or fetch from HF Hub.
- Streaming: SSE supported for compatible models.
- **Note**: HF Inference API has model-specific endpoints.

#### 3.6 Ollama Provider (`src/providers/OllamaProvider.ts`)

- Endpoint: `http://localhost:11434` (configurable host/port).
- Models: `GET /api/tags`.
- Chat: `POST /api/chat` with `stream: true`.
- Supports: text, code, vision (depending on model).
- Handle connection refused gracefully (Ollama not running).

#### 3.7 GGUF Provider (`src/providers/GGUFProvider.ts`)

- **Does NOT make HTTP calls** — uses Tauri IPC to the Rust backend.
- `listModels()`: calls `invoke('list_gguf_models')`.
- `chat()`: calls `invoke('start_gguf_inference')` and listens for Tauri events.
- `abort()`: calls `invoke('abort_inference')`.

#### 3.8 Provider Registry (`src/providers/ProviderRegistry.ts`)

- Singleton that holds all registered providers.
- `getProvider(id)`: returns provider by ID.
- `getActiveProvider()`: returns currently selected provider.
- `getModelsByCapability(capability)`: filter models across all providers.
- Register all providers at app boot.

#### 3.9 Test Provider Layer

- Write unit tests for each provider with mocked fetch responses.
- Test error handling for each provider type.
- Test abort flow.

---

## Phase 4: Chat UI & Streaming

**Goal:** Build the complete chat interface with real-time streaming.

### Steps

#### 4.1 Zustand Chat Store (`src/stores/chatStore.ts`)

- State: `messages[]`, `activeConversationId`, `isStreaming`, `error`.
- Actions: `sendMessage()`, `appendChunk()`, `abortResponse()`, `clearConversation()`.
- `sendMessage()` implementation:
  1. Append user message to `messages`.
  2. Get active provider from `providerStore`.
  3. Create assistant message placeholder.
  4. Call `provider.chat()` as async generator.
  5. Iterate chunks, calling `appendChunk()` for each.
  6. Handle `done` and `error` chunk types.

#### 4.2 Layout Components (`src/components/layout/`)

- **`AppShell`**: Main 3-column layout (sidebar | chat | settings).
- **`Sidebar`**: Conversation history, new chat button, model browser toggle.
- **`Header`**: Logo (from [`Logo.tsx`](../src/components/shared/Logo.tsx)), model selector dropdown, provider indicator, settings button.
- **`StatusBar`**: Active provider, active model, connection status.

#### 4.3 Chat Components (`src/components/chat/`)

- **`ChatView`**: Orchestrates message list + input area. Loads store on mount.
- **`MessageList`**: Scrollable container, auto-scroll to bottom on new messages, virtualized for performance.
- **`MessageBubble`**: Renders message content (text, code, images). Uses `MarkdownRenderer` for text.
- **`MessageInput`**: Textarea with send button. Supports:
  - Enter to send (configurable).
  - Image upload (drag & drop or file picker).
  - Code block insertion.
- **`StreamingText`**: Real-time text renderer with cursor animation during streaming.
- **`CodeBlock`**: Syntax-highlighted code with copy button, language label.
- **`ImageDisplay`**: Renders uploaded or generated images, with lightbox on click.

#### 4.4 Streaming Hook (`src/hooks/useStreaming.ts`)

- Generic hook for consuming `AsyncGenerator<StreamChunk>`.
- Returns `{ text, isStreaming, error, abort }`.
- Used by the chat store internally.

#### 4.5 Markdown Rendering

- Configure `react-markdown` with `rehype-highlight` for syntax highlighting.
- Support GitHub-flavored Markdown (tables, task lists, code fences).
- Render LaTeX if needed (optional, `remark-math` + `rehype-katex`).

#### 4.6 Test Chat UI

- Manual test: Send a message with each provider type.
- Verify streaming text appears token by token.
- Test abort during streaming.
- Test image upload and display.

---

## Phase 5: Model Management

**Goal:** Implement model listing, selection, and local model management.

### Steps

#### 5.1 Zustand Model Store (`src/stores/modelStore.ts`)

- State: `models[]`, `selectedModelId`, `isLoading`.
- Actions: `fetchModels()`, `selectModel()`, `refreshModels()`.
- `fetchModels()` aggregates models from all enabled providers.
- Filter by capability (text, vision, code, image-generation).

#### 5.2 Model Selector (in Header)

- Dropdown showing all available models grouped by provider.
- Show model capability badges (text, vision, code, img-gen).
- Show local/remote indicator.

#### 5.3 Local Model List (`src/components/model/LocalModelList.tsx`)

- Lists GGUF files found in configured directories.
- Shows file size, quantization (parsed from filename), model name.
- Delete model option (moves to trash / confirms delete).

#### 5.4 Rust Backend: GGUF Scanning (`src-tauri/src/commands/model.rs`)

- `list_gguf_models()`: Scan all configured directories for `*.gguf` files.
- `get_model_info(path)`: Parse GGUF header to extract:
  - Model name, architecture, file type (quantization).
  - Context length, embedding length.
  - (Uses `ggml` or `gguf` parsing crate, or `llama.cpp` bindings.)

#### 5.5 Test Model Management

- Verify models from all providers appear in the list.
- Verify local GGUF files are detected and parsed.
- Test model switching mid-conversation.

---

## Phase 6: Hugging Face Hub Integration

**Goal:** Browse and download models from Hugging Face Hub.

### Steps

#### 6.1 HF Hub API Client (`src/services/huggingface.ts`)

- Search models: `GET https://huggingface.co/api/models?search={query}&filter=gguf`.
- Get model details: `GET https://huggingface.co/api/models/{modelId}`.
- List files: `GET https://huggingface.co/api/models/{modelId}/tree/main`.
- Filter files to show only `.gguf` files with quantization info.

#### 6.2 Model Browser UI (`src/components/model/ModelBrowser.tsx`)

- Search bar with debounced input.
- Results grid/card view showing:
  - Model name, author, description.
  - Available GGUF quantizations (Q4_K_M, Q5_K_M, etc.).
  - Download count, likes.
- Pagination or infinite scroll.

#### 6.3 Model Card (`src/components/model/ModelCard.tsx`)

- Detailed view of selected model.
- List of available GGUF quantization files with sizes.
- System requirements estimate (RAM needed based on quantization).
- Download button per quantization.

#### 6.4 Download Manager (Rust, `src-tauri/src/download/manager.rs`)

- `download_model(url, destination)`: Download with `reqwest::Client`.
- Resume support via `Range` header.
- Emit `download-progress` Tauri events with bytes/speed/ETA.
- `pause_download(id)`, `cancel_download(id)`, `resume_download(id)`.
- Concurrent download queue (max 2 simultaneous).

#### 6.5 Zustand Download Store (`src/stores/downloadStore.ts`)

- State: `downloads[]` with progress per download.
- Actions: `startDownload()`, `pauseDownload()`, `cancelDownload()`.
- Listen to Tauri `download-progress` events.

#### 6.6 Download UI (`src/components/model/ModelDownloader.tsx`)

- Download queue panel (collapsible sidebar section).
- Each download shows: filename, progress bar, speed, ETA, status.
- Pause/cancel buttons per download.
- Auto-open containing folder on completion.

#### 6.7 Test HF Hub Integration

- Search for a model (e.g., "Mistral 7B GGUF").
- Verify quantization options are listed correctly.
- Start a download and verify progress updates.
- Test pause/resume.
- Test cancel and cleanup.

---

## Phase 7: Settings & Persistence

**Goal:** Implement settings UI, provider configuration, and persistent storage.

### Steps

#### 7.1 Zustand Settings Store (`src/stores/settingsStore.ts`)

- State: `AppSettings` (theme, fontSize, fontFamily, sendOnEnter, etc.).
- Actions: `updateSettings()`, `resetSettings()`, `loadSettings()`.
- `loadSettings()` reads from Tauri persistent store on app boot.
- `updateSettings()` writes to persistent store on change.

#### 7.2 Zustand Provider Store (`src/stores/providerStore.ts`)

- State: `providers[]`, `activeProviderId`.
- Actions: `configureProvider()`, `setActiveProvider()`, `validateProvider()`.
- `configureProvider()` saves API key via `tauri-plugin-store` (OS secure storage).
- `validateProvider()` tests the connection and returns success/failure.

#### 7.3 Settings Panel UI (`src/components/settings/`)

- **`SettingsPanel`**: Modal or page with tabs:
  - **General**: Theme (light/dark/system), font size, send on enter.
  - **Providers**: List of provider configs, add/edit/remove.
  - **Models**: GGUF directory paths, download concurrency.
  - **About**: Version, links, license.
- **`ProviderConfig`**: Form per provider type:
  - API key input (password field type).
  - Base URL override (for OpenAI-compatible APIs).
  - Test connection button.
  - Enable/disable toggle.
- **`AppearanceSettings`**: Theme selector, font size slider, font family.
- **`ModelPathConfig`**: Add/remove GGUF directories, scan now button.

#### 7.4 Theme Switch (`src/hooks/useTheme.ts`)

- Read theme from `settingsStore`.
- On change, toggle `dark` class on `<html>` element.
- TailwindCSS `darkMode: 'class'` configuration.
- Persist theme preference.

#### 7.5 Persistent Storage

- Use `tauri-plugin-store` for:
  - `settings.json`: App settings.
  - `providers.json`: Provider configurations (API keys encrypted).
  - `conversations.json`: Chat history (optional, future).
- Load config on app startup.
- Save on changes (debounced for settings).

#### 7.6 Test Settings

- Change theme and verify persistence across app restart.
- Configure a provider with API key and verify it works.
- Test connection validation with invalid API key.
- Add/remove model directories.

---

## Phase 8: Polish, Testing & Distribution

**Goal:** Final testing, performance optimization, and build for distribution.

### Steps

#### 8.1 Error Handling Audit

- Walk through every error path:
  - Network failures → Toast notification.
  - API auth errors → Prompt to re-enter key.
  - Model load failures → Inline error + suggestion.
  - OOM scenarios → Warning before loading large models.
- Ensure all errors are user-friendly and actionable.

#### 8.2 Performance Optimization

- **Message list virtualization**: Use `react-window` or `@tanstack/virtual` for large conversations.
- **Memoization**: `React.memo` on `MessageBubble`, `CodeBlock`.
- **Debounced search**: HF Hub search with 300ms debounce.
- **Lazy loading**: Settings panel loaded on demand.
- **Rust optimizations**: `--release` build, model caching.

#### 8.3 Security Audit

- Verify API keys never appear in logs or error messages.
- Verify CSP in `tauri.conf.json`.
- Verify file path traversal protection in Rust commands.
- Verify input sanitization for Markdown rendering.

#### 8.4 Build Configuration

- `tauri.conf.json`:
  - App name, version, identifier.
  - Window size, min size, title.
  - Icon paths (generate from [`Asset/Logo.svg`](../Asset/Logo.svg)).
  - Security: CSP, dev URLs.
- Windows: MSI or NSIS installer.
- macOS: DMG.
- Linux: AppImage or deb.

#### 8.5 CI/CD Pipeline (Optional)

- GitHub Actions workflow:
  - `cargo check` + `tsc --noEmit` on PR.
  - Build for Windows/macOS/Linux on tag.
  - Upload artifacts to GitHub Releases.

#### 8.6 Documentation

- `README.md` update with:
  - Features, screenshots, installation instructions.
  - Development setup guide.
  - Provider configuration guide.
- API documentation for providers (if library mode).

---

## Dependencies Map

```
Phase 1: Scaffolding
  └── Required by: All phases

Phase 2: Rust Backend
  └── Required by: Phase 5 (GGUF scanning), Phase 6 (downloads)

Phase 3: Provider Layer
  ├── Required by: Phase 4 (chat)
  └── Required by: Phase 5 (model listing)

Phase 4: Chat UI
  └── Final feature, no dependencies from later phases

Phase 5: Model Management
  └── Required by: Phase 6 (HF Hub — model browser uses model store)

Phase 6: HF Hub Integration
  └── Independent feature, depends on Phase 2 (downloads)

Phase 7: Settings
  └── Can be developed in parallel with Phases 4-6

Phase 8: Polish
  └── After all features are complete
```

---

## Risk Mitigation

| Risk                            | Impact | Mitigation                                                                 |
| ------------------------------- | ------ | -------------------------------------------------------------------------- |
| GGUF parsing in Rust is complex | High   | Use `candle` or `llama-cpp-rs` crate; start with basic metadata parsing    |
| Streaming memory leaks          | Medium | Clean up event listeners on unmount; abort controller on component unmount |
| API key security                | High   | Use `tauri-plugin-store` with OS secure storage; never log keys            |
| Large model download UX         | Medium | Show ETA, allow pause/resume, support resume on app restart                |
| Ollama not running              | Low    | Graceful error + suggestion to start Ollama                                |
| CORS issues with remote APIs    | None   | HTTP calls go through Rust backend, not browser fetch                      |
| Tauri v2 API changes            | Medium | Pin Tauri version, follow migration guides                                 |
