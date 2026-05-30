import React, { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import api from "../api";

// ── Default starter snippets for each language ─────────────────────────────
const SNIPPETS = {
  python: `# Python starter — feel free to edit!
def greet(name):
    message = f"Hey {name}, you're crushing it today 💪"
    return message

# Try it out
print(greet("Gurjit"))

# A quick fibonacci just for fun
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print("Fib(10):", fib(10))
`,

  java: `// Java starter — build something great!
public class Main {

    public static String greet(String name) {
        return "Hey " + name + ", let's write some Java! ☕";
    }

    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    public static void main(String[] args) {
        System.out.println(greet("Gurjit"));

        // Print first 10 fibonacci numbers
        System.out.print("Fib sequence: ");
        for (int i = 0; i < 10; i++) {
            System.out.print(fibonacci(i) + " ");
        }
        System.out.println();
    }
}
`,

  cpp: `// C++ starter — keep it fast and clean!
#include <iostream>
#include <string>
using namespace std;

string greet(const string& name) {
    return "Hey " + name + ", let's write some C++! ⚡";
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << greet("Gurjit") << endl;

    cout << "Fib sequence: ";
    for (int i = 0; i < 10; i++) {
        cout << fibonacci(i) << " ";
    }
    cout << endl;

    return 0;
}
`,

  javascript: `// JavaScript (Node.js) — fast and flexible!
function greet(name) {
  return \`Hey \${name}, let's build something awesome! 🚀\`;
}

console.log(greet("Gurjit"));

// Array methods showcase
const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = nums.filter(n => n % 2 === 0);
const doubled = evens.map(n => n * 2);

console.log("Evens doubled:", doubled);
console.log("Sum:", doubled.reduce((a, b) => a + b, 0));
`,

  typescript: `// TypeScript — type-safe and elegant!
interface Person {
  name: string;
  role: string;
}

function greet(person: Person): string {
  return \`Hey \${person.name}, you're a great \${person.role}! 🎯\`;
}

const dev: Person = { name: "Gurjit", role: "Full-Stack Developer" };
console.log(greet(dev));

// Generic function
function reverseArray<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

console.log("Reversed:", reverseArray([1, 2, 3, 4, 5]));
`,
};

// ── Language display metadata ──────────────────────────────────────────────
const LANGUAGES = [
  { id: "python",     label: "Python",     icon: "🐍", color: "#3b82f6", monacoId: "python"     },
  { id: "java",       label: "Java",       icon: "☕", color: "#f59e0b", monacoId: "java"       },
  { id: "cpp",        label: "C++",        icon: "⚡", color: "#8b5cf6", monacoId: "cpp"        },
  { id: "javascript", label: "JavaScript", icon: "🟨", color: "#facc15", monacoId: "javascript" },
  { id: "typescript", label: "TypeScript", icon: "🔷", color: "#3178c6", monacoId: "typescript" },
];

// ── Theme options ──────────────────────────────────────────────────────────
const THEMES = [
  { id: "vs-dark", label: "VS Dark",  icon: "🌙" },
  { id: "light",   label: "VS Light", icon: "☀️" },
];

// ── Filename helper ────────────────────────────────────────────────────────
function getFilename(langId) {
  const map = {
    python: "main.py", java: "Main.java", cpp: "main.cpp",
    javascript: "index.js", typescript: "index.ts",
  };
  return map[langId] || "main.txt";
}

// ── Status color helper ───────────────────────────────────────────────────
function getStatusStyle(statusId) {
  if (statusId === 3)  return { color: "#22c55e", label: "Accepted",           icon: "✓" }; // Accepted
  if (statusId === 4)  return { color: "#f59e0b", label: "Wrong Answer",       icon: "✗" };
  if (statusId === 5)  return { color: "#ef4444", label: "Time Limit Exceeded", icon: "⏱" };
  if (statusId === 6)  return { color: "#ef4444", label: "Compilation Error",  icon: "⚠" };
  if (statusId === 7)  return { color: "#ef4444", label: "Runtime Error (SIGSEGV)", icon: "💥" };
  if (statusId === 8)  return { color: "#ef4444", label: "Runtime Error (SIGXFSZ)", icon: "💥" };
  if (statusId === 9)  return { color: "#ef4444", label: "Runtime Error (SIGFPE)",  icon: "💥" };
  if (statusId === 10) return { color: "#ef4444", label: "Runtime Error (SIGABRT)", icon: "💥" };
  if (statusId === 11) return { color: "#ef4444", label: "Runtime Error (NZEC)",    icon: "💥" };
  if (statusId === 12) return { color: "#ef4444", label: "Runtime Error (Other)",   icon: "💥" };
  if (statusId === 13) return { color: "#94a3b8", label: "Internal Error",    icon: "⚙" };
  if (statusId === 14) return { color: "#94a3b8", label: "Exec Format Error", icon: "⚙" };
  return { color: "#94a3b8", label: "Unknown", icon: "?" };
}

export default function CodeEditor({ onRunCode }) {
  const [language, setLanguage] = useState("python");
  const [theme,    setTheme]    = useState("vs-dark");
  const [code,     setCode]     = useState(SNIPPETS["python"]);
  const [fontSize, setFontSize] = useState(14);
  const [copied,   setCopied]   = useState(false);
  const editorRef = useRef(null);

  // ── Execution state ─────────────────────────────────────────────────────
  const [stdin,        setStdin]        = useState("");
  const [output,       setOutput]       = useState(null);
  const [isRunning,    setIsRunning]    = useState(false);
  const [showStdin,    setShowStdin]    = useState(false);
  const [showOutput,   setShowOutput]   = useState(false);

  // Keep editor value when switching languages — load snippet if untouched
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(SNIPPETS[newLang]);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleCopy = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue();
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleReset = () => {
    setCode(SNIPPETS[language]);
  };

  // ── Run Code — calls backend /run-code endpoint ────────────────────────
  const handleRunCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);
    setShowOutput(true);

    try {
      const res = await api.post("/run-code", {
        language,
        code,
        stdin,
      });

      setOutput({
        stdout:         res.data.stdout   || "",
        stderr:         res.data.stderr   || "",
        compile_output: res.data.compile_output || "",
        status:         res.data.status,
        time:           res.data.time,
        memory:         res.data.memory,
        error:          null,
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        "Failed to execute code. Check your connection.";
      setOutput({
        stdout: "", stderr: "", compile_output: "",
        status: { id: 0, description: "Error" },
        time: null, memory: null,
        error: msg,
      });
    } finally {
      setIsRunning(false);
      if (onRunCode) onRunCode();
    }
  }, [isRunning, language, code, stdin, onRunCode]);

  // Ctrl/Cmd + Enter shortcut to run code
  const handleEditorKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  }, [handleRunCode]);

  const currentLang = LANGUAGES.find((l) => l.id === language);
  const isDark = theme === "vs-dark";

  // Build the display output text
  const outputText = output
    ? output.error
      ? output.error
      : [output.compile_output, output.stdout, output.stderr]
          .filter(Boolean)
          .join("\n") || "(No output)"
    : "";

  const statusStyle = output?.status ? getStatusStyle(output.status.id) : null;

  return (
    <div className="code-editor-wrapper animate-fade-in-scale" onKeyDown={handleEditorKeyDown}>
      {/* ── Header bar ── */}
      <div className="editor-header">
        <div className="editor-title">
          <span className="editor-icon">{"</>"}</span>
          <div>
            <h2 className="editor-heading">Code Playground</h2>
            <p className="editor-sub">Write, run &amp; practice interview code</p>
          </div>
        </div>

        {/* Font size control */}
        <div className="font-size-control">
          <button
            className="font-btn"
            onClick={() => setFontSize((s) => Math.max(10, s - 1))}
            title="Decrease font size"
          >
            A-
          </button>
          <span className="font-label">{fontSize}px</span>
          <button
            className="font-btn"
            onClick={() => setFontSize((s) => Math.min(22, s + 1))}
            title="Increase font size"
          >
            A+
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="editor-toolbar">
        {/* Language tabs */}
        <div className="flex gap-1 p-1 bg-[#161b22] border border-[#21262d] rounded-xl">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] ${
                language === lang.id 
                  ? "bg-[#00e5a0] text-[#0d1117] shadow-[0_0_12px_rgba(0,229,160,0.3)]" 
                  : "text-[#8b949e] hover:text-white hover:bg-white/5"
              }`}
              onClick={() => handleLanguageChange(lang.id)}
            >
              <span>{lang.icon}</span>
              <span className="hidden sm:inline">{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Right-side controls */}
        <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-[#21262d] rounded-xl">
          {/* Theme toggle */}
          <div className="flex gap-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] ${
                  theme === t.id 
                    ? "bg-[#21262d] text-white" 
                    : "text-[#8b949e] hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setTheme(t.id)}
                title={t.label}
              >
                <span>{t.icon}</span>
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Stdin toggle */}
          <button
            className={`flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] ${
              showStdin ? "bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/50" : "text-[#8b949e] hover:text-white hover:bg-white/5 border border-transparent"
            }`}
            onClick={() => setShowStdin((v) => !v)}
            title="Toggle standard input"
          >
            ⌨ <span className="hidden lg:inline">stdin</span>
          </button>

          {/* Reset */}
          <button className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-bold text-[#8b949e] hover:text-white hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0]" onClick={handleReset} title="Reset to starter code">
            ↺ <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Copy */}
          <button className="flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-bold text-[#8b949e] hover:text-white hover:bg-white/5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0]" onClick={handleCopy} title="Copy all code">
            {copied ? "✓ Copied!" : "⎘ Copy"}
          </button>

          {/* ── RUN BUTTON ── */}
          <button
            className={`flex items-center justify-center gap-2 min-w-[80px] h-9 px-4 rounded-lg text-sm font-bold text-[#0d1117] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0] shadow-[0_0_12px_rgba(0,229,160,0.2)] ${
              isRunning ? "bg-[#00c58a]" : "bg-[#00e5a0] hover:bg-[#00c58a]"
            }`}
            onClick={handleRunCode}
            disabled={isRunning}
            title="Run code (Ctrl+Enter)"
            id="run-code-button"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>Running…</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Stdin input (collapsible) ── */}
      {showStdin && (
        <div className="stdin-panel animate-slide-down">
          <label className="stdin-label">
            <span className="stdin-label-icon">⌨</span>
            Standard Input (stdin)
          </label>
          <textarea
            className="stdin-textarea"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter input values here, one per line..."
            rows={3}
            spellCheck={false}
          />
        </div>
      )}

      {/* ── Monaco Editor ── */}
      <div className={`editor-body ${isDark ? "editor-dark" : "editor-light"}`}>
        {/* fake traffic-light dots for that IDE vibe */}
        <div className="editor-chrome">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
          <span className="editor-filename">
            {currentLang.icon}{" "}
            {getFilename(currentLang.id)}
          </span>
        </div>

        <Editor
          height="420px"
          language={currentLang.monacoId}
          theme={theme}
          value={code}
          onChange={(val) => setCode(val || "")}
          onMount={handleEditorMount}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
            automaticLayout: true,
            tabSize: 4,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>

      {/* ── Output Console Panel ── */}
      {showOutput && (
        <div className="output-panel animate-slide-down">
          {/* Output header */}
          <div className="output-header">
            <div className="output-header-left">
              <span className="output-terminal-icon">❯_</span>
              <span className="output-title">Output</span>
              {statusStyle && output && !output.error && (
                <span
                  className="output-status-badge"
                  style={{ color: statusStyle.color, borderColor: statusStyle.color + "44" }}
                >
                  {statusStyle.icon} {output.status.description}
                </span>
              )}
            </div>

            <div className="output-header-right">
              {output && !output.error && output.time && (
                <span className="output-metric">
                  <span className="metric-icon">⏱</span>
                  {output.time}s
                </span>
              )}
              {output && !output.error && output.memory && (
                <span className="output-metric">
                  <span className="metric-icon">🧠</span>
                  {(output.memory / 1024).toFixed(1)} MB
                </span>
              )}
              <button
                className="output-close-btn"
                onClick={() => setShowOutput(false)}
                title="Close output"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Output body */}
          <div className="output-body">
            {isRunning ? (
              <div className="output-loading">
                <div className="output-loading-dots">
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                  <span className="loading-dot" />
                </div>
                <span className="output-loading-text">Executing on Judge0 sandbox…</span>
              </div>
            ) : output ? (
              <pre className={`output-text ${output.error || (output.status?.id !== 3 && output.status?.id !== 0) ? "output-text-error" : "output-text-success"}`}>
                {outputText}
              </pre>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Status bar ── */}
      <div className={`editor-statusbar ${isDark ? "statusbar-dark" : "statusbar-light"}`}>
        <span>
          <span style={{ color: currentLang.color }}>{currentLang.icon} {currentLang.label}</span>
        </span>
        <span>{theme === "vs-dark" ? "🌙 Dark" : "☀️ Light"} Theme</span>
        <span className="statusbar-shortcut">Ctrl+Enter to Run</span>
        <span>UTF-8</span>
        <span>{code.split("\n").length} lines</span>
      </div>
    </div>
  );
}
