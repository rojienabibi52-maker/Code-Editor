import React, { useState } from 'react';
import { FilePlus, FolderPlus, Sparkles, Filter } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button3D } from '../common/Button3D';

interface NewItemModalProps {
  isOpen: boolean;
  type: 'file' | 'folder';
  parentFolderName?: string;
  onClose: () => void;
  onSubmit: (name: string, content?: string) => void;
}

interface FilePreset {
  label: string;
  ext: string;
  category: 'android' | 'web' | 'config' | 'data' | 'docs';
  defaultName: string;
  snippet: string;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  type,
  parentFolderName,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filePresets: FilePreset[] = [
    // Android / Kotlin / Java
    {
      label: 'Kotlin (.kt)',
      ext: '.kt',
      category: 'android',
      defaultName: 'MainComponent.kt',
      snippet: 'package com.codingide.app\n\nclass MainComponent {\n    fun initialize() {\n    }\n}',
    },
    {
      label: 'Compose Screen (.kt)',
      ext: '.kt',
      category: 'android',
      defaultName: 'HomeScreen.kt',
      snippet: `package com.codingide.app

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Welcome to App Screen",
            style = MaterialTheme.typography.headlineMedium
        )
        Button(onClick = { /* action */ }) {
            Text("Get Started")
        }
    }
}`,
    },
    {
      label: 'Java Class (.java)',
      ext: '.java',
      category: 'android',
      defaultName: 'AppController.java',
      snippet: `package com.codingide.app;

public class AppController {
    public static void main(String[] args) {
        System.out.println("Running in CODING IDE");
    }
}`,
    },
    {
      label: 'XML Layout (.xml)',
      ext: '.xml',
      category: 'android',
      defaultName: 'activity_custom.xml',
      snippet: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp">

    <TextView
        android:id="@+id/titleText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textSize="20sp" />

</LinearLayout>`,
    },
    {
      label: 'Gradle Script (.gradle)',
      ext: '.gradle',
      category: 'config',
      defaultName: 'build.gradle',
      snippet: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.codingide.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.codingide.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}`,
    },
    {
      label: 'Kotlin DSL (.gradle.kts)',
      ext: '.gradle.kts',
      category: 'config',
      defaultName: 'build.gradle.kts',
      snippet: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.codingide.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.codingide.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }
}`,
    },
    {
      label: 'Properties (.properties)',
      ext: '.properties',
      category: 'config',
      defaultName: 'gradle.properties',
      snippet: `# Gradle & Android Build Properties
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`,
    },

    // Web / JS / TS / CSS / HTML
    {
      label: 'HTML5 (.html)',
      ext: '.html',
      category: 'web',
      defaultName: 'index.html',
      snippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application View</title>
</head>
<body>
  <div id="app">
    <h1>Welcome</h1>
  </div>
</body>
</html>`,
    },
    {
      label: 'CSS Stylesheet (.css)',
      ext: '.css',
      category: 'web',
      defaultName: 'styles.css',
      snippet: `:root {
  --primary-color: #2563eb;
  --bg-color: #0f172a;
  --text-color: #f8fafc;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-color);
}`,
    },
    {
      label: 'JavaScript (.js)',
      ext: '.js',
      category: 'web',
      defaultName: 'main.js',
      snippet: `// JavaScript Module
export function initializeApp() {
  console.log("Application initialized");
}

document.addEventListener("DOMContentLoaded", initializeApp);`,
    },
    {
      label: 'TypeScript (.ts)',
      ext: '.ts',
      category: 'web',
      defaultName: 'types.ts',
      snippet: `export interface UserSession {
  id: string;
  displayName: string;
  roles: string[];
  createdAt: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';`,
    },
    {
      label: 'React JSX (.jsx)',
      ext: '.jsx',
      category: 'web',
      defaultName: 'App.jsx',
      snippet: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>React App</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`,
    },
    {
      label: 'React TSX (.tsx)',
      ext: '.tsx',
      category: 'web',
      defaultName: 'Screen.tsx',
      snippet: `import React, { useState } from 'react';

interface Props {
  title?: string;
}

export const Screen: React.FC<Props> = ({ title = 'Dashboard' }) => {
  const [active, setActive] = useState(false);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={() => setActive(!active)}>
        Toggle: {active ? 'On' : 'Off'}
      </button>
    </div>
  );
};`,
    },
    {
      label: 'Flutter Dart (.dart)',
      ext: '.dart',
      category: 'android',
      defaultName: 'widget_page.dart',
      snippet: `import 'package:flutter/material.dart';

class WidgetPage extends StatelessWidget {
  const WidgetPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Screen')),
      body: const Center(
        child: Text('Built with CODING IDE'),
      ),
    );
  }
}`,
    },

    // Config & Data
    {
      label: 'JSON (.json)',
      ext: '.json',
      category: 'data',
      defaultName: 'config.json',
      snippet: `{\n  "name": "coding-app",\n  "version": "1.0.0",\n  "private": true\n}`,
    },
    {
      label: 'YAML (.yaml)',
      ext: '.yaml',
      category: 'config',
      defaultName: 'pubspec.yaml',
      snippet: `name: my_app
description: "A new Flutter project built in CODING IDE"
version: 1.0.0+1
environment:
  sdk: ">=3.0.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter
`,
    },
    {
      label: 'YML (.yml)',
      ext: '.yml',
      category: 'config',
      defaultName: 'pipeline.yml',
      snippet: `name: Build Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Artifact
        run: echo "Compiling APK..."
`,
    },
    {
      label: 'SVG Vector (.svg)',
      ext: '.svg',
      category: 'data',
      defaultName: 'ic_launcher.svg',
      snippet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="45" fill="#2563eb" />
  <polygon points="40,30 70,50 40,70" fill="#ffffff" />
</svg>`,
    },
    {
      label: 'CSV Data (.csv)',
      ext: '.csv',
      category: 'data',
      defaultName: 'records.csv',
      snippet: `id,name,category,status
1,Alpha,Core,active
2,Beta,Module,pending
3,Gamma,Feature,complete
`,
    },
    {
      label: 'Markdown (.md)',
      ext: '.md',
      category: 'docs',
      defaultName: 'README.md',
      snippet: `# Project Documentation\n\nOverview of this module architecture and usage instructions.\n\n## Features\n- Kotlin Compose UI\n- Clean architecture\n`,
    },
    {
      label: 'Plain Text (.txt)',
      ext: '.txt',
      category: 'docs',
      defaultName: 'notes.txt',
      snippet: `Project Notes\nCreated in CODING IDE.\n`,
    },
  ];

  const filteredPresets = filePresets.filter(
    p => activeCategory === 'all' || p.category === activeCategory
  );

  const applyPreset = (preset: FilePreset) => {
    setSelectedTemplate(preset.label);
    if (!name.trim()) {
      setName(preset.defaultName);
    } else {
      // replace extension
      const baseName = name.replace(/\.[a-zA-Z0-9.]+$/, '');
      setName((baseName || 'NewFile') + preset.ext);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalContent = '';
    const matchedPreset = filePresets.find(p => p.label === selectedTemplate);
    if (matchedPreset) {
      finalContent = matchedPreset.snippet;
    } else {
      // Auto-match snippet by extension if preset was not explicitly clicked
      const extMatch = name.match(/(\.[a-zA-Z0-9.]+)$/);
      if (extMatch) {
        const found = filePresets.find(p => p.ext === extMatch[1].toLowerCase());
        if (found) {
          finalContent = found.snippet;
        }
      }
    }

    onSubmit(name.trim(), finalContent);
    setName('');
    setSelectedTemplate('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'file' ? 'Create New File' : 'Create New Folder'}
      subtitle={parentFolderName ? `Target Location: ${parentFolderName}` : 'Target Location: Project Root'}
      icon={type === 'file' ? <FilePlus size={18} className="text-blue-400" /> : <FolderPlus size={18} className="text-amber-400" />}
      maxWidth="lg"
      footer={
        <>
          <Button3D variant="surface" size="md" onClick={onClose}>
            Cancel
          </Button3D>
          <Button3D
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Create {type === 'file' ? 'File' : 'Folder'}
          </Button3D>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            {type === 'file' ? 'File Name (with extension)' : 'Folder Name'}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={
              type === 'file'
                ? 'e.g. HomeScreen.kt, styles.css, build.gradle.kts, data.json'
                : 'e.g. components, screens, utils, layout'
            }
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
          />
        </div>

        {type === 'file' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-blue-400" />
                Select File Template Preset
              </label>

              {/* Category Pills */}
              <div className="flex items-center gap-1">
                {['all', 'android', 'web', 'config', 'data', 'docs'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded capitalize transition-all ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {filteredPresets.map(preset => {
                const isSelected = selectedTemplate === preset.label;
                return (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`text-left text-xs px-2.5 py-2 rounded-lg border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-medium'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    <span className="font-semibold truncate">{preset.label}</span>
                    <span className="text-[10px] text-neutral-500 font-mono truncate">{preset.defaultName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
