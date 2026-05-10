import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";

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
};

// ── Language display metadata ──────────────────────────────────────────────
const LANGUAGES = [
  { id: "python", label: "Python",  icon: "🐍", color: "#3b82f6" },
  { id: "java",   label: "Java",    icon: "☕", color: "#f59e0b" },
  { id: "cpp",    label: "C++",     icon: "⚡", color: "#8b5cf6" },
];

// ── Theme options ──────────────────────────────────────────────────────────
const THEMES = [
  { id: "vs-dark", label: "VS Dark",  icon: "🌙" },
  { id: "light",   label: "VS Light", icon: "☀️" },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState("python");
  const [theme,    setTheme]    = useState("vs-dark");
  const [code,     setCode]     = useState(SNIPPETS["python"]);
  const [fontSize, setFontSize] = useState(14);
  const [copied,   setCopied]   = useState(false);
  const editorRef = useRef(null);

  // Keep editor value when switching languages — load snippet if untouched
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setCode(SNIPPETS[newLang]);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    // Focus the editor once it's ready
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

  const currentLang = LANGUAGES.find((l) => l.id === language);
  const isDark = theme === "vs-dark";

  return (
    <div className="code-editor-wrapper animate-fade-in-scale">
      {/* ── Header bar ── */}
      <div className="editor-header">
        <div className="editor-title">
          <span className="editor-icon">{"</>"}</span>
          <div>
            <h2 className="editor-heading">Code Playground</h2>
            <p className="editor-sub">Write, edit &amp; practice interview code</p>
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
        <div className="lang-tabs">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`lang-tab ${language === lang.id ? "lang-tab-active" : ""}`}
              style={language === lang.id ? { borderBottomColor: lang.color, color: lang.color } : {}}
              onClick={() => handleLanguageChange(lang.id)}
            >
              <span>{lang.icon}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Right-side controls */}
        <div className="editor-actions">
          {/* Theme toggle */}
          <div className="theme-toggle">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-btn ${theme === t.id ? "theme-btn-active" : ""}`}
                onClick={() => setTheme(t.id)}
                title={t.label}
              >
                <span>{t.icon}</span>
                <span className="theme-label-text">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Reset */}
          <button className="action-btn reset-btn" onClick={handleReset} title="Reset to starter code">
            ↺ Reset
          </button>

          {/* Copy */}
          <button className="action-btn copy-btn" onClick={handleCopy} title="Copy all code">
            {copied ? "✓ Copied!" : "⎘ Copy"}
          </button>
        </div>
      </div>

      {/* ── Monaco Editor ── */}
      <div className={`editor-body ${isDark ? "editor-dark" : "editor-light"}`}>
        {/* fake traffic-light dots for that IDE vibe */}
        <div className="editor-chrome">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
          <span className="editor-filename">
            {currentLang.icon}{" "}
            {currentLang.id === "cpp" ? "main.cpp" : currentLang.id === "java" ? "Main.java" : "main.py"}
          </span>
        </div>

        <Editor
          height="420px"
          language={language}
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

      {/* ── Status bar ── */}
      <div className={`editor-statusbar ${isDark ? "statusbar-dark" : "statusbar-light"}`}>
        <span>
          <span style={{ color: currentLang.color }}>{currentLang.icon} {currentLang.label}</span>
        </span>
        <span>{theme === "vs-dark" ? "🌙 Dark" : "☀️ Light"} Theme</span>
        <span>UTF-8</span>
        <span>{code.split("\n").length} lines</span>
      </div>
    </div>
  );
}
