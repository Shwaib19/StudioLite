import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Logo from "./components/shared/Logo";
import "./index.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-bg text-neutral-900 dark:text-dark-text font-body">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card">
        <Logo className="w-8 h-8" />
        <h1 className="font-heading text-lg font-semibold">StudioLite</h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-center max-w-md">
          <h2 className="font-heading text-2xl font-bold mb-2">
            Welcome to StudioLite
          </h2>
          <p className="text-neutral-600 dark:text-dark-text-secondary">
            Your lightweight desktop AI model orchestrator.
          </p>
        </div>

        {/* Greeting demo */}
        <div className="flex gap-2">
          <input
            className="px-3 py-2 rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
            onClick={greet}
            type="button"
          >
            Greet
          </button>
        </div>
        <p className="text-sm text-neutral-600 dark:text-dark-text-secondary">
          {greetMsg}
        </p>
      </main>
    </div>
  );
}

export default App;
