# StudioLite — Architecture Document

> **Version:** 1.0.0  
> **Stack:** Tauri v2 + React 18 + TypeScript + Vite + TailwindCSS  
> **Design System:** Defined in [`GraphicChart.md`](../GraphicChart.md)  
> **Logo:** [`Asset/Logo.svg`](../Asset/Logo.svg)

---

## Table of Contents

1. [Technical Overview](#1-technical-overview)
2. [Project Structure](#2-project-structure)
3. [Provider Abstraction Layer](#3-provider-abstraction-layer)
4. [State Management (Zustand)](#4-state-management-zustand)
5. [Tauri Backend (Rust)](#5-tauri-backend-rust)
6. [Streaming Architecture](#6-streaming-architecture)
7. [Key TypeScript Interfaces](#7-key-typescript-interfaces)
8. [Tauri v2 Permissions & Capabilities](#8-tauri-v2-permissions--capabilities)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Security Considerations](#10-security-considerations)
11. [Design Token Integration](#11-design-token-integration)

---

## 1. Technical Overview

### 1.1 Goals

StudioLite is an ultra-lightweight desktop alternative to LM Studio. It provides:

- A **unified chat interface** supporting text, code, vision (image analysis), and image generation.
- **Provider-agnostic model access**: remote APIs (OpenRouter, OpenAI, Hugging Face Inference) and local models (Ollama, GGUF files via Rust backend).
- **Hugging Face Hub integration**: browse and download GGUF models directly.
- **Minimal resource footprint**: leveraging Tauri's native Rust backend for heavy lifting, keeping the frontend lean.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Shell (WebView)                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React Frontend (Vite)                 │  │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────────────┐  │  │
│  │  │  Chat   │ │  Model   │ │   Settings Panel   │  │  │
│  │  │  View   │ │  Browser │ │   (Providers,      │  │  │
│  │  │         │ │  Sidebar │ │    Appearance)      │  │  │
│  │  └────┬────┘ └────┬─────┘ └─────────┬─────────┘  │  │
│  │       │           │                 │             │  │
│  │  ┌────▼───────────▼─────────────────▼──────────┐  │  │
│  │  │           Zustand Stores (State)             │  │  │
│  │  │  ChatStore │ ModelStore │ ProviderStore      │  │  │
│  │  │  SettingsStore │ DownloadStore               │  │  │
│  │  └──────────────────────┬───────────────────────┘  │  │
│  │                         │                           │  │
│  │  ┌──────────────────────▼───────────────────────┐  │  │
│  │  │         Provider Adapters (Strategy)          │  │  │
│  │  │  OpenRouter │ OpenAI │ HF │ Ollama │ GGUF     │  │  │
│  │  └──────────────────────┬───────────────────────┘  │  │
│  │                         │                           │  │
│  └─────────────────────────┼───────────────────────────┘  │
│                            │                                │
│                    Tauri IPC Bridge                         │
│  ┌─────────────────────────┼───────────────────────────┐  │
│  │              Tauri Commands (Rust)                   │  │
│  │  ┌──────────┐ ┌──────────────┐ ┌────────────────┐  │  │
│  │  │ GGUF     │ │ Download     │ │ Filesystem     │  │  │
│  │  │ Inference│ │ Manager      │ │ Operations     │  │  │
│  │  └──────────┘ └──────────────┘ └────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Data Flow: Chat Request

```
User types message
       │
       ▼
ChatView → sendMessage() → ChatStore
       │
       ▼
ProviderAdapter.chat(messages, config)
       │
       ├── Remote API: fetch() with ReadableStream
       │       └── Stream chunks → ChatStore → UI update
       │
       ├── Ollama: HTTP POST to localhost:11434
       │       └── Stream chunks → ChatStore → UI update
       │
       └── GGUF (local): invoke Tauri command
               └── Rust inference → Tauri events emit tokens
                       └── ChatStore → UI update
```

---

## 2. Project Structure

```
StudioLite/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
├── postcss.config.js
│
├── Asset/
│   └── Logo.svg                         # Brand logo for UI
│
├── docs/
│   ├── ARCHITECTURE.md                  # This file
│   ├── IMPLEMENTATION_PLAN.md           # Implementation roadmap
│   └── TODO.md                          # Project tracking
│
├── src/                                 # React Frontend
│   ├── main.tsx                         # React entry point
│   ├── App.tsx                          # Root component with router
│   ├── index.css                        # Global styles + Tailwind directives
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Main layout wrapper
│   │   │   ├── Sidebar.tsx              # Left sidebar (model browser)
│   │   │   ├── Header.tsx               # Top bar with logo + model selector
│   │   │   └── StatusBar.tsx            # Bottom status bar (connection, model)
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatView.tsx             # Main chat container
│   │   │   ├── MessageList.tsx          # Virtualized message list
│   │   │   ├── MessageBubble.tsx        # Single message display
│   │   │   ├── MessageInput.tsx         # Text input + file/attachment
│   │   │   ├── CodeBlock.tsx            # Syntax-highlighted code block
│   │   │   ├── ImageDisplay.tsx         # Image display (generated/uploaded)
│   │   │   └── StreamingText.tsx        # Real-time streaming text renderer
│   │   │
│   │   ├── model/
│   │   │   ├── ModelBrowser.tsx         # Hugging Face Hub browser
│   │   │   ├── ModelCard.tsx            # Model info card
│   │   │   ├── ModelDownloader.tsx      # Download progress UI
│   │   │   └── LocalModelList.tsx       # Installed local models
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx        # Settings modal/page
│   │   │   ├── ProviderConfig.tsx       # API key config per provider
│   │   │   ├── AppearanceSettings.tsx   # Theme, font size, etc.
│   │   │   └── ModelPathConfig.tsx      # Local GGUF path configuration
│   │   │
│   │   └── shared/
│   │       ├── Button.tsx               # Base button component
│   │       ├── Dropdown.tsx             # Dropdown/select
│   │       ├── Modal.tsx                # Modal dialog
│   │       ├── Spinner.tsx              # Loading spinner
│   │       ├── Toast.tsx                # Toast notifications
│   │       ├── MarkdownRenderer.tsx     # Markdown rendering
│   │       └── Logo.tsx                 # Inline SVG logo component
│   │
│   ├── hooks/
│   │   ├── useChat.ts                   # Chat logic + streaming
│   │   ├── useModels.ts                 # Model listing + selection
│   │   ├── useProviders.ts              # Provider management
│   │   ├── useStreaming.ts              # Generic streaming hook
│   │   ├── useDownload.ts               # Download progress tracking
│   │   └── useTheme.ts                  # Dark/light theme toggle
│   │
│   ├── stores/
│   │   ├── chatStore.ts                 # Messages, active conversation
│   │   ├── modelStore.ts                # Available/selected models
│   │   ├── providerStore.ts             # Provider configurations
│   │   ├── settingsStore.ts             # App settings (theme, etc.)
│   │   └── downloadStore.ts             # Download queue & progress
│   │
│   ├── providers/
│   │   ├── types.ts                     # Provider interfaces & types
│   │   ├── BaseProvider.ts              # Abstract base provider
│   │   ├── OpenRouterProvider.ts        # OpenRouter API adapter
│   │   ├── OpenAIProvider.ts            # OpenAI API adapter
│   │   ├── HuggingFaceProvider.ts       # Hugging Face Inference adapter
│   │   ├── OllamaProvider.ts            # Ollama local adapter
│   │   ├── GGUFProvider.ts              # Rust-backed GGUF provider
│   │   └── ProviderRegistry.ts          # Provider factory & registry
│   │
│   ├── services/
│   │   ├── huggingface.ts               # Hugging Face Hub API client
│   │   ├── downloadManager.ts           # Download orchestration
│   │   └── tauriCommands.ts             # Wrapper for Tauri invoke calls
│   │
│   ├── types/
│   │   ├── provider.ts                  # Provider TypeScript types
│   │   ├── model.ts                     # Model types
│   │   ├── chat.ts                      # Chat/message types
│   │   ├── settings.ts                  # Settings types
│   │   └── tauri.ts                     # Tauri IPC types
│   │
│   └── utils/
│       ├── idGenerator.ts               # UUID generation
│       ├── formatters.ts                # Text/code formatting
│       ├── validators.ts                # Input validation
│       └── constants.ts                 # App-wide constants
│
├── src-tauri/                           # Tauri v2 Rust Backend
│   ├── Cargo.toml
│   ├── tauri.conf.json                  # Tauri configuration
│   ├── capabilities/
│   │   └── default.json                 # Tauri v2 permissions
│   ├── icons/
│   └── src/
│       ├── main.rs                      # Entry point + app builder
│       ├── lib.rs                       # Library root
│       ├── commands/
│       │   ├── mod.rs
│       │   ├── model.rs                 # Model-related commands
│       │   ├── download.rs              # Download commands
│       │   ├── file.rs                  # Filesystem operations
│       │   └── system.rs                # System info commands
│       ├── inference/
│       │   ├── mod.rs
│       │   ├── gguf.rs                  # GGUF inference engine
│       │   └── context.rs               # Context management
│       ├── download/
│       │   ├── mod.rs
│       │   └── manager.rs               # Download manager with resume
│       └── config/
│           ├── mod.rs
│           └── app_config.rs            # Persistent config (JSON file)
```

---

## 3. Provider Abstraction Layer

### 3.1 Architecture

The provider system uses a **Strategy Pattern** with a common interface. Each provider implements the same contract, enabling the frontend to switch between providers transparently.

```
                  ┌──────────────────────┐
                  │   IProvider (interface)│
                  ├──────────────────────┤
                  │ + listModels()        │
                  │ + chat()              │
                  │ + abort()             │
                  │ + validate()          │
                  └──────┬───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
  ┌────────────┐  ┌────────────┐  ┌────────────┐
  │  Remote    │  │  Ollama    │  │  GGUF      │
  │  Providers │  │  Provider  │  │  Provider  │
  │  (HTTP)    │  │  (HTTP)    │  │  (Rust IPC)│
  └────────────┘  └────────────┘  └────────────┘
```

### 3.2 Provider Categories

| Category     | Providers                        | Transport                   | Streaming              |
| ------------ | -------------------------------- | --------------------------- | ---------------------- |
| Remote API   | OpenRouter, OpenAI, HF Inference | HTTPS (fetch)               | ReadableStream / SSE   |
| Local HTTP   | Ollama                           | HTTP localhost              | SSE streaming          |
| Local Native | GGUF files                       | Tauri IPC (invoke + events) | Tauri events per token |

### 3.3 Provider Registry

The [`ProviderRegistry`](src/providers/ProviderRegistry.ts) acts as a **factory** that:

- Registers all available providers at app startup.
- Returns the active provider based on user selection.
- Manages provider lifecycle (init, validate, abort).

---

## 4. State Management (Zustand)

Zustand is chosen over Redux for its minimal boilerplate and TypeScript-first design. Each store is independent but can cross-reference others via `get()`.

### 4.1 Store Breakdown

| Store                                          | Key State                                         | Key Actions                                                                  |
| ---------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`chatStore`](src/stores/chatStore.ts)         | `messages[]`, `activeConversation`, `isStreaming` | `sendMessage()`, `appendChunk()`, `clearConversation()`, `abortResponse()`   |
| [`modelStore`](src/stores/modelStore.ts)       | `models[]`, `selectedModelId`, `isLoading`        | `fetchModels()`, `selectModel()`, `refreshModels()`                          |
| [`providerStore`](src/stores/providerStore.ts) | `providers[]`, `activeProviderId`                 | `configureProvider()`, `setActiveProvider()`, `validateProvider()`           |
| [`settingsStore`](src/stores/settingsStore.ts) | `theme`, `fontSize`, `apiKeys` (encrypted)        | `updateSettings()`, `resetSettings()`                                        |
| [`downloadStore`](src/stores/downloadStore.ts) | `downloads[]` (queue), `activeDownload`           | `startDownload()`, `pauseDownload()`, `cancelDownload()`, `updateProgress()` |

### 4.2 Store Pattern

```typescript
// Example: chatStore.ts
interface ChatState {
  messages: ChatMessage[];
  activeConversationId: string | null;
  isStreaming: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: MessageContent[]) => Promise<void>;
  appendChunk: (chunk: string) => void;
  abortResponse: () => void;
  clearConversation: () => void;
}
```

---

## 5. Tauri Backend (Rust)

### 5.1 Commands

All Tauri commands are defined in [`src-tauri/src/commands/`](src-tauri/src/commands/). Each command is a Rust function annotated with `#[tauri::command]`.

| Command                  | File                                                | Description                                       |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------- |
| `list_gguf_models`       | [`model.rs`](src-tauri/src/commands/model.rs)       | List local GGUF files from configured directories |
| `get_model_info`         | [`model.rs`](src-tauri/src/commands/model.rs)       | Parse GGUF header metadata                        |
| `start_gguf_inference`   | [`model.rs`](src-tauri/src/commands/model.rs)       | Start inference, returns event channel ID         |
| `abort_inference`        | [`model.rs`](src-tauri/src/commands/model.rs)       | Abort running inference                           |
| `download_model`         | [`download.rs`](src-tauri/src/commands/download.rs) | Start model download from HF Hub                  |
| `pause_download`         | [`download.rs`](src-tauri/src/commands/download.rs) | Pause active download                             |
| `cancel_download`        | [`download.rs`](src-tauri/src/commands/download.rs) | Cancel and clean up download                      |
| `get_download_status`    | [`download.rs`](src-tauri/src/commands/download.rs) | Query download progress                           |
| `list_model_directories` | [`file.rs`](src-tauri/src/commands/file.rs)         | List configured model paths                       |
| `add_model_directory`    | [`file.rs`](src-tauri/src/commands/file.rs)         | Add a new model search path                       |
| `get_system_info`        | [`system.rs`](src-tauri/src/commands/system.rs)     | RAM, GPU info for model selection                 |
| `get_app_config`         | [`system.rs`](src-tauri/src/commands/system.rs)     | Read persisted config                             |
| `save_app_config`        | [`system.rs`](src-tauri/src/commands/system.rs)     | Persist config to disk                            |

### 5.2 GGUF Inference Flow

```
Frontend                     Rust Backend
   │                              │
   │  invoke('start_gguf_inference',
   │    { modelPath, messages })  │
   ├─────────────────────────────►│
   │                              │
   │           ┌──────────────────┴──┐
   │           │  Load GGUF model    │
   │           │  (llama.cpp bindings│
   │           │   or custom C FFI)  │
   │           └──────────────────┬──┘
   │                              │
   │          ◄───── Token event ──┤
   │  (onToken: { token: "Hello" })│
   │          ◄───── Token event ──┤
   │  (onToken: { token: " world" })│
   │          ◄───── Token event ──┤
   │  (onToken: { token: "!" })    │
   │          ◄─── Done event ─────┤
   │  (onDone: { reason: "stop" }) │
   │                              │
   │  invoke('abort_inference')   │
   ├─────────────────────────────►│
   │                              │
```

### 5.3 Download Manager

The download manager in [`src-tauri/src/download/manager.rs`](src-tauri/src/download/manager.rs) handles:

- **HTTP(S) downloads** from Hugging Face Hub with `reqwest`.
- **Resume capability** via `Range` headers.
- **Progress events** emitted to frontend via Tauri events.
- **Concurrent download limit** (configurable, default 2).
- **File integrity** checks (optional SHA256).

---

## 6. Streaming Architecture

### 6.1 Remote API Streaming (OpenRouter, OpenAI, HF)

All remote APIs support SSE (Server-Sent Events) or direct streaming:

```typescript
// ProviderAdapter.chat() returns an AsyncGenerator
async function* chat(
  messages: ChatMessage[],
  config: ChatConfig,
): AsyncGenerator<StreamChunk> {
  const response = await fetch(this.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, stream: true, ...config }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // Parse SSE/JSON lines and yield StreamChunk
    yield { type: "text", content: parsedToken };
  }

  yield { type: "done", content: "" };
}
```

### 6.2 Ollama Streaming

Ollama uses a similar SSE-based streaming API on `http://localhost:11434/api/chat`.

### 6.3 GGUF Streaming (Tauri Events)

The Rust backend emits Tauri events with each generated token:

```rust
// Rust side
app_handle.emit("inference-token", TokenPayload {
    token: generated_text,
    is_final: false,
}).unwrap();
```

```typescript
// Frontend side
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen<InferencePayload>("inference-token", (event) => {
  if (event.payload.is_final) {
    chatStore.getState().finishStreaming();
  } else {
    chatStore.getState().appendChunk(event.payload.token);
  }
});
```

### 6.4 Abort Strategy

Each provider maintains an `AbortController` for HTTP-based providers and a dedicated abort channel for Rust-based inference:

```typescript
abstract class BaseProvider implements IProvider {
  protected abortController: AbortController | null = null;

  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}
```

---

## 7. Key TypeScript Interfaces

### 7.1 Provider Contract

```typescript
// src/types/provider.ts

type ProviderType = "openrouter" | "openai" | "huggingface" | "ollama" | "gguf";
type ModelCapability = "text" | "vision" | "image-generation" | "code";

interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl?: string;
  apiKey?: string; // Stored encrypted in Tauri secure store
  modelPath?: string; // For GGUF local models
  isEnabled: boolean;
  createdAt: number;
}

interface ModelInfo {
  id: string;
  name: string;
  providerId: string;
  capabilities: ModelCapability[];
  size?: number; // File size in bytes (for local)
  quantization?: string; // e.g., "Q4_K_M"
  isLocal: boolean;
  description?: string;
}

interface ChatConfig {
  temperature: number; // 0.0 - 2.0
  maxTokens: number;
  topP: number; // 0.0 - 1.0
  frequencyPenalty: number;
  presencePenalty: number;
  stop?: string[];
}

interface StreamChunk {
  type: "text" | "error" | "done";
  content: string;
  finishReason?: "stop" | "length" | "error" | "abort";
}

interface IProvider {
  readonly id: string;
  readonly type: ProviderType;
  readonly displayName: string;

  listModels(): Promise<ModelInfo[]>;
  chat(
    messages: ChatMessage[],
    config: ChatConfig,
  ): AsyncGenerator<StreamChunk, void, undefined>;
  abort(): void;
  validate(): Promise<boolean>;
}
```

### 7.2 Chat Types

```typescript
// src/types/chat.ts

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: MessageContent[];
  createdAt: number;
  modelId?: string;
  providerId?: string;
  tokensUsed?: number;
  tokensPerSecond?: number;
}

interface MessageContent {
  type: "text" | "image" | "code" | "image-generation";
  value: string;
  language?: string; // For code blocks (e.g., "typescript")
  mimeType?: string; // For images (e.g., "image/png")
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  modelId: string;
  providerId: string;
  systemPrompt?: string;
}
```

### 7.3 Tauri IPC Types

```typescript
// src/types/tauri.ts

interface InferencePayload {
  token: string;
  is_final: boolean;
  finish_reason?: "stop" | "length" | "error";
}

interface DownloadProgressPayload {
  downloadId: string;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number; // bytes per second
  status: "downloading" | "paused" | "completed" | "error";
  error?: string;
}

interface ModelListEntry {
  path: string;
  filename: string;
  size: number;
  quantization?: string;
  modelName?: string;
}
```

### 7.4 Settings Types

```typescript
// src/types/settings.ts

interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: number; // 12-24px
  fontFamily: "inter" | "system";
  sendOnEnter: boolean;
  showTokenCount: boolean;
  maxContextMessages: number;
  modelDirectories: string[]; // Paths to scan for GGUF files
  downloadConcurrency: number;
  defaultModelId?: string;
  defaultProviderId?: string;
}
```

---

## 8. Tauri v2 Permissions & Capabilities

### 8.1 Capability Configuration

File: [`src-tauri/capabilities/default.json`](src-tauri/capabilities/default.json)

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for StudioLite",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-toggle-maximize",
    "core:event:default",
    "core:event:allow-emit",
    "core:event:allow-listen",
    "fs:allow-read",
    "fs:allow-write",
    "fs:allow-exists",
    "fs:allow-mkdir",
    "fs:scope-app-recursive",
    "http:default",
    "http:allow-fetch",
    "shell:allow-open",
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    "store:default"
  ]
}
```

### 8.2 Required Tauri Plugins

| Plugin                | Purpose                               | Cargo Dependency      |
| --------------------- | ------------------------------------- | --------------------- |
| `tauri-plugin-fs`     | Read/write model files, config        | `tauri-plugin-fs`     |
| `tauri-plugin-http`   | API calls from Rust (downloads)       | `tauri-plugin-http`   |
| `tauri-plugin-shell`  | Open external links in browser        | `tauri-plugin-shell`  |
| `tauri-plugin-dialog` | File picker for GGUF paths            | `tauri-plugin-dialog` |
| `tauri-plugin-store`  | Persistent key-value storage (config) | `tauri-plugin-store`  |

---

## 9. Error Handling Strategy

### 9.1 Layered Error Handling

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (Toast + Inline)              │
│  - Non-blocking errors → Toast notification              │
│  - Streaming errors → Inline error in chat               │
│  - Provider validation → Inline form errors              │
├─────────────────────────────────────────────────────────┤
│                  Store Layer (Zustand middleware)         │
│  - Store actions wrap in try/catch                       │
│  - Error state stored per slice                          │
│  - Retry logic for transient failures                    │
├─────────────────────────────────────────────────────────┤
│               Provider Layer (Adapter)                   │
│  - HTTP errors → typed ProviderError                     │
│  - Network errors → retry with exponential backoff       │
│  - Auth errors → ProviderAuthError (prompt re-auth)      │
├─────────────────────────────────────────────────────────┤
│                  Rust Backend Layer                       │
│  - Commands return Result<T, E>                          │
│  - Errors serialized to frontend as JSON                 │
│  - Panic → catch_unwind → graceful error event           │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Error Types

```typescript
// src/types/provider.ts (extended)

class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: ProviderErrorCode,
    public readonly providerId: string,
    public readonly retryable: boolean,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

type ProviderErrorCode =
  | "AUTH_FAILED" // Invalid API key
  | "RATE_LIMITED" // Too many requests
  | "MODEL_NOT_FOUND" // Specified model unavailable
  | "CONTEXT_OVERFLOW" // Context window exceeded
  | "NETWORK_ERROR" // Connection failed
  | "TIMEOUT" // Request timed out
  | "INVALID_RESPONSE" // Malformed response
  | "MODEL_LOAD_FAILED" // GGUF model failed to load
  | "OUT_OF_MEMORY" // System OOM
  | "UNKNOWN"; // Fallback
```

### 9.3 Fallback Strategy

- **Provider fallback**: If a provider returns an error, auto-switch to the next available provider with the same model capability.
- **Model fallback**: If a specific model fails, suggest similar models from the model store.
- **Streaming fallback**: If streaming fails, fall back to non-streaming (single response) mode.

---

## 10. Security Considerations

### 10.1 API Key Management

- API keys are **never stored in plaintext** in the frontend.
- Keys are persisted using `tauri-plugin-store` which writes to the OS secure store (Keychain on macOS, Credential Manager on Windows, Secret Service on Linux).
- Keys are loaded into memory only when the provider is active.
- The frontend never logs or exposes keys in error messages.

### 10.2 Local Model Safety

- GGUF model files are read-only operations; the Rust backend never writes to model files.
- Model paths are validated to prevent path traversal attacks.
- Download destination is restricted to configured model directories.

### 10.3 CORS & CSP

- Remote API calls go through the Rust HTTP plugin (not the browser's fetch), avoiding CORS issues.
- Content Security Policy is configured in `tauri.conf.json` to restrict script sources.

### 10.4 Input Sanitization

- User prompts are sanitized before rendering (Markdown rendered safely).
- Code blocks are rendered with syntax highlighting but without executing scripts.
- Image uploads are validated for type and size (max 20MB).

---

## 11. Design Token Integration

The design system from [`GraphicChart.md`](../GraphicChart.md) is mapped to TailwindCSS:

```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B4CE0", // Deep Indigo
          hover: "#2E3BB8", // Dark Indigo
          light: "#E5E8FC", // Pale Indigo
        },
        secondary: {
          DEFAULT: "#1BA8A0", // Turquoise
          hover: "#158079", // Dark Turquoise
          light: "#DAF3F1", // Pale Turquoise
        },
        accent: {
          coral: "#FF7A45",
          amber: "#FFC145",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F2F4F7",
          200: "#E1E4EA",
          400: "#9AA0AE",
          600: "#5B6070",
          800: "#242730",
          900: "#111318",
        },
        semantic: {
          success: "#2FB870",
          warning: "#F2994A",
          error: "#EB5757",
          info: "#3E9CF0",
        },
        dark: {
          bg: "#0F1115",
          card: "#1A1D24",
          border: "#2A2E38",
          text: "#F2F4F7",
          "text-secondary": "#9AA0AE",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        full: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(17,19,24,0.06)",
        md: "0 4px 12px rgba(17,19,24,0.10)",
        lg: "0 12px 32px rgba(17,19,24,0.16)",
      },
    },
  },
};
```
