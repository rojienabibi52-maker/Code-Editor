import { Project, ProjectType, FileItem, FolderItem } from '../types/project';

interface TemplateDef {
  type: ProjectType;
  name: string;
  tag: string;
  description: string;
  defaultPackage: string;
  generate: (projectId: string, name: string) => { files: Record<string, FileItem>; folders: Record<string, FolderItem> };
}

export const PROJECT_TEMPLATES: Record<ProjectType, TemplateDef> = {
  android: {
    type: 'android',
    name: 'Android App',
    tag: 'Jetpack Compose / Kotlin',
    description: 'Modern Android native project with Jetpack Compose, Kotlin DSL Gradle build script, and Material 3 design system.',
    defaultPackage: 'com.codingide.app',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-app': { id: 'f-app', name: 'app', path: 'app', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-src': { id: 'f-src', name: 'src', path: 'app/src', parentFolderId: 'f-app', createdAt: now, modifiedAt: now, isOpen: true },
        'f-main': { id: 'f-main', name: 'main', path: 'app/src/main', parentFolderId: 'f-src', createdAt: now, modifiedAt: now, isOpen: true },
        'f-java': { id: 'f-java', name: 'java', path: 'app/src/main/java', parentFolderId: 'f-main', createdAt: now, modifiedAt: now, isOpen: true },
        'f-kotlin': { id: 'f-kotlin', name: 'kotlin', path: 'app/src/main/kotlin', parentFolderId: 'f-main', createdAt: now, modifiedAt: now, isOpen: true },
        'f-pkg': { id: 'f-pkg', name: 'com.codingide.app', path: 'app/src/main/kotlin/com/codingide/app', parentFolderId: 'f-kotlin', createdAt: now, modifiedAt: now, isOpen: true },
        'f-ui': { id: 'f-ui', name: 'ui', path: 'app/src/main/kotlin/com/codingide/app/ui', parentFolderId: 'f-pkg', createdAt: now, modifiedAt: now, isOpen: true },
        'f-theme': { id: 'f-theme', name: 'theme', path: 'app/src/main/kotlin/com/codingide/app/ui/theme', parentFolderId: 'f-ui', createdAt: now, modifiedAt: now, isOpen: true },
        'f-res': { id: 'f-res', name: 'res', path: 'app/src/main/res', parentFolderId: 'f-main', createdAt: now, modifiedAt: now, isOpen: true },
        'f-layout': { id: 'f-layout', name: 'layout', path: 'app/src/main/res/layout', parentFolderId: 'f-res', createdAt: now, modifiedAt: now, isOpen: true },
        'f-values': { id: 'f-values', name: 'values', path: 'app/src/main/res/values', parentFolderId: 'f-res', createdAt: now, modifiedAt: now, isOpen: true },
        'f-assets': { id: 'f-assets', name: 'assets', path: 'assets', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-images': { id: 'f-images', name: 'images', path: 'assets/images', parentFolderId: 'f-assets', createdAt: now, modifiedAt: now, isOpen: false },
        'f-audio': { id: 'f-audio', name: 'audio', path: 'assets/audio', parentFolderId: 'f-assets', createdAt: now, modifiedAt: now, isOpen: false },
        'f-video': { id: 'f-video', name: 'video', path: 'assets/video', parentFolderId: 'f-assets', createdAt: now, modifiedAt: now, isOpen: false },
        'f-components': { id: 'f-components', name: 'components', path: 'components', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-screens': { id: 'f-screens', name: 'screens', path: 'screens', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-models': { id: 'f-models', name: 'models', path: 'models', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: false },
        'f-utils': { id: 'f-utils', name: 'utils', path: 'utils', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: false },
      };

      const files: Record<string, FileItem> = {
        'file-main-kt': {
          id: 'file-main-kt',
          name: 'MainActivity.kt',
          path: 'app/src/main/kotlin/com/codingide/app/MainActivity.kt',
          extension: 'kt',
          parentFolderId: 'f-pkg',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.codingide.app.ui.theme.CodingIDETheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CodingIDETheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HomeScreen(appName = "${projectName}")
                }
            }
        }
    }
}

@Composable
fun HomeScreen(appName: String) {
    var counter by remember { mutableStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to $appName",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Engineered with CODING IDE Mobile Architecture.",
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { counter++ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Interactive Tap Count: $counter")
        }
    }
}
`,
        },
        'file-main-java': {
          id: 'file-main-java',
          name: 'MainActivity.java',
          path: 'app/src/main/java/MainActivity.java',
          extension: 'java',
          parentFolderId: 'f-java',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app;

public class MainActivity {
    public static void main(String[] args) {
        System.out.println("Starting ${projectName}...");
    }
}
`,
        },
        'file-theme-color': {
          id: 'file-theme-color',
          name: 'Color.kt',
          path: 'app/src/main/kotlin/com/codingide/app/ui/theme/Color.kt',
          extension: 'kt',
          parentFolderId: 'f-theme',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.ui.theme

import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)
`,
        },
        'file-theme-kt': {
          id: 'file-theme-kt',
          name: 'Theme.kt',
          path: 'app/src/main/kotlin/com/codingide/app/ui/theme/Theme.kt',
          extension: 'kt',
          parentFolderId: 'f-theme',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable

@Composable
fun CodingIDETheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(primary = Purple80),
        content = content
    )
}
`,
        },
        'file-activity-main-xml': {
          id: 'file-activity-main-xml',
          name: 'activity_main.xml',
          path: 'app/src/main/res/layout/activity_main.xml',
          extension: 'xml',
          parentFolderId: 'f-layout',
          createdAt: now,
          modifiedAt: now,
          content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="20dp">

    <TextView
        android:id="@+id/appTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/app_name"
        android:textSize="22sp"
        android:textStyle="bold" />

    <Button
        android:id="@+id/actionBtn"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:text="Launch Application" />

</LinearLayout>`,
        },
        'file-manifest': {
          id: 'file-manifest',
          name: 'AndroidManifest.xml',
          path: 'app/src/main/AndroidManifest.xml',
          extension: 'xml',
          parentFolderId: 'f-main',
          createdAt: now,
          modifiedAt: now,
          content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.codingide.app">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${projectName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CodingIDE">
        <activity
            android:name=".MainActivity"
            android:screenOrientation="portrait"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
        },
        'file-build-gradle': {
          id: 'file-build-gradle',
          name: 'build.gradle',
          path: 'app/build.gradle',
          extension: 'gradle',
          parentFolderId: 'f-app',
          createdAt: now,
          modifiedAt: now,
          content: `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.codingide.app'
    compileSdk 34

    defaultConfig {
        applicationId 'com.codingide.app'
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
    buildFeatures {
        compose true
    }
    composeOptions {
        kotlinCompilerExtensionVersion '1.5.8'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-compose:1.8.2'
    implementation platform('androidx.compose:compose-bom:2024.02.00')
    implementation 'androidx.compose.ui:ui'
    implementation 'androidx.compose.material3:material3'
}
`,
        },
        'file-proguard': {
          id: 'file-proguard',
          name: 'proguard-rules.pro',
          path: 'app/proguard-rules.pro',
          extension: 'pro',
          parentFolderId: 'f-app',
          createdAt: now,
          modifiedAt: now,
          content: `# Proguard Rules for ${projectName}
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.annotation.Keep <methods>;
}
`,
        },
        'file-strings-xml': {
          id: 'file-strings-xml',
          name: 'strings.xml',
          path: 'app/src/main/res/values/strings.xml',
          extension: 'xml',
          parentFolderId: 'f-values',
          createdAt: now,
          modifiedAt: now,
          content: `<resources>
    <string name="app_name">${projectName}</string>
    <string name="welcome_message">Code. Preview. Build.</string>
</resources>`,
        },
        'file-colors-xml': {
          id: 'file-colors-xml',
          name: 'colors.xml',
          path: 'app/src/main/res/values/colors.xml',
          extension: 'xml',
          parentFolderId: 'f-values',
          createdAt: now,
          modifiedAt: now,
          content: `<resources>
    <color name="purple_500">#6200EE</color>
    <color name="purple_700">#3700B3</color>
    <color name="teal_200">#03DAC5</color>
    <color name="primary">#2563eb</color>
</resources>`,
        },
        'file-logo-svg': {
          id: 'file-logo-svg',
          name: 'logo.svg',
          path: 'assets/images/logo.svg',
          extension: 'svg',
          parentFolderId: 'f-images',
          createdAt: now,
          modifiedAt: now,
          isAsset: true,
          assetType: 'image',
          content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="46" fill="#2563eb"/>
  <polygon points="35,28 75,50 35,72" fill="#ffffff"/>
</svg>`,
        },
        'file-audio-welcome': {
          id: 'file-audio-welcome',
          name: 'welcome.mp3',
          path: 'assets/audio/welcome.mp3',
          extension: 'mp3',
          parentFolderId: 'f-audio',
          createdAt: now,
          modifiedAt: now,
          isAsset: true,
          assetType: 'audio',
          content: '',
        },
        'file-video-intro': {
          id: 'file-video-intro',
          name: 'intro.mp4',
          path: 'assets/video/intro.mp4',
          extension: 'mp4',
          parentFolderId: 'f-video',
          createdAt: now,
          modifiedAt: now,
          isAsset: true,
          assetType: 'video',
          content: '',
        },
        'file-component-button': {
          id: 'file-component-button',
          name: 'AppButton.kt',
          path: 'components/AppButton.kt',
          extension: 'kt',
          parentFolderId: 'f-components',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.components

import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

@Composable
fun AppButton(label: String, onClick: () -> Unit) {
    Button(onClick = onClick) {
        Text(label)
    }
}
`,
        },
        'file-screen-home': {
          id: 'file-screen-home',
          name: 'HomeScreen.kt',
          path: 'screens/HomeScreen.kt',
          extension: 'kt',
          parentFolderId: 'f-screens',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun MainHomeScreen() {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Primary Dashboard View")
    }
}
`,
        },
        'file-screen-login': {
          id: 'file-screen-login',
          name: 'LoginScreen.kt',
          path: 'screens/LoginScreen.kt',
          extension: 'kt',
          parentFolderId: 'f-screens',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit = {}) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(24.dp)) {
        Text("Login to Account", style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(20.dp))
        Button(onClick = onLoginSuccess, modifier = Modifier.fillMaxWidth()) {
            Text("Sign In")
        }
    }
}
`,
        },
        'file-model-user': {
          id: 'file-model-user',
          name: 'User.kt',
          path: 'models/User.kt',
          extension: 'kt',
          parentFolderId: 'f-models',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.models

data class User(
    val id: String,
    val name: String,
    val email: String,
    val isVerified: Boolean = false
)
`,
        },
        'file-utils-network': {
          id: 'file-utils-network',
          name: 'NetworkUtils.kt',
          path: 'utils/NetworkUtils.kt',
          extension: 'kt',
          parentFolderId: 'f-utils',
          createdAt: now,
          modifiedAt: now,
          content: `package com.codingide.app.utils

object NetworkUtils {
    fun isNetworkAvailable(): Boolean {
        return true
    }
}
`,
        },
        'file-settings-gradle': {
          id: 'file-settings-gradle',
          name: 'settings.gradle',
          path: 'settings.gradle',
          extension: 'gradle',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "${projectName}"
include ':app'
`,
        },
        'file-readme': {
          id: 'file-readme',
          name: 'README.md',
          path: 'README.md',
          extension: 'md',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `# ${projectName}

Built with CODING IDE — Mobile-first Professional Development IDE.

## Directory Structure
- \`app/src/main/kotlin/\`: Jetpack Compose UI & MainActivity.kt
- \`app/src/main/java/\`: Java class sources
- \`app/src/main/res/\`: Layouts, colors.xml & strings.xml
- \`assets/\`: Images, Audio & Video media
- \`components/\`: Reusable UI components
- \`screens/\`: App screens (HomeScreen, LoginScreen)
- \`models/\`: Data models
- \`utils/\`: Utilities and helpers
`,
        },
      };

      return { files, folders };
    },
  },

  web: {
    type: 'web',
    name: 'Web App',
    tag: 'HTML5 / CSS3 / ESNext',
    description: 'Clean modern standard web application with instant browser preview support.',
    defaultPackage: 'web.app',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-assets': { id: 'f-assets', name: 'assets', path: 'assets', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: false },
        'f-css': { id: 'f-css', name: 'css', path: 'css', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: false },
        'f-js': { id: 'f-js', name: 'js', path: 'js', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: false },
      };

      const files: Record<string, FileItem> = {
        'file-index': {
          id: 'file-index',
          name: 'index.html',
          path: 'index.html',
          extension: 'html',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName}</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="logo-badge">PRO</div>
      <h1>${projectName}</h1>
      <p class="tagline">Code. Preview. Build.</p>
    </header>

    <main class="main-card">
      <div class="stat-row">
        <span class="status-indicator">Online</span>
        <span id="timestamp">Ready</span>
      </div>
      <p>This web application was constructed inside CODING IDE mobile suite.</p>
      <button id="actionBtn" class="action-btn">Trigger Interactive Action</button>
      <div id="outputLog" class="output-log">Click above to log actions</div>
    </main>
  </div>

  <script src="js/script.js"></script>
</body>
</html>`,
        },
        'file-css': {
          id: 'file-css',
          name: 'style.css',
          path: 'css/style.css',
          extension: 'css',
          parentFolderId: 'f-css',
          createdAt: now,
          modifiedAt: now,
          content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.app-container {
  width: 100%;
  max-width: 480px;
}

.app-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-badge {
  display: inline-block;
  background: #2563eb;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 8px;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.tagline {
  color: #94a3b8;
  font-size: 14px;
  margin-top: 4px;
}

.main-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 13px;
  color: #38bdf8;
}

.status-indicator::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  margin-right: 6px;
}

.action-btn {
  display: block;
  width: 100%;
  margin-top: 18px;
  padding: 12px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
}

.action-btn:hover {
  background: #2563eb;
}

.output-log {
  margin-top: 14px;
  padding: 10px 14px;
  background: #090d16;
  border: 1px solid #1e293b;
  border-radius: 6px;
  font-size: 12px;
  font-family: monospace;
  color: #a3e635;
}
`,
        },
        'file-js': {
          id: 'file-js',
          name: 'script.js',
          path: 'js/script.js',
          extension: 'js',
          parentFolderId: 'f-js',
          createdAt: now,
          modifiedAt: now,
          content: `// ${projectName} Execution Engine
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('actionBtn');
  const log = document.getElementById('outputLog');
  const timestamp = document.getElementById('timestamp');

  let clickCount = 0;
  timestamp.textContent = new Date().toLocaleTimeString();

  btn.addEventListener('click', () => {
    clickCount++;
    log.textContent = \`Event recorded #\${clickCount} at \${new Date().toLocaleTimeString()}\`;
  });
});
`,
        },
        'file-readme': {
          id: 'file-readme',
          name: 'README.md',
          path: 'README.md',
          extension: 'md',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `# ${projectName}\nStandard Web Application.\nSupports live rendering in CODING IDE Live Preview.`,
        },
      };

      return { files, folders };
    },
  },

  react: {
    type: 'react',
    name: 'React',
    tag: 'TypeScript / Vite / Tailwind',
    description: 'Modern component-based React SPA with TypeScript support.',
    defaultPackage: 'com.codingide.react',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-src': { id: 'f-src', name: 'src', path: 'src', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-comp': { id: 'f-comp', name: 'components', path: 'src/components', parentFolderId: 'f-src', createdAt: now, modifiedAt: now, isOpen: true },
      };

      const files: Record<string, FileItem> = {
        'file-app': {
          id: 'file-app',
          name: 'App.tsx',
          path: 'src/App.tsx',
          extension: 'tsx',
          parentFolderId: 'f-src',
          createdAt: now,
          modifiedAt: now,
          content: `import React, { useState } from 'react';
import { Card } from './components/Card';

export default function App() {
  const [likes, setLikes] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">${projectName}</h1>
        <p className="text-slate-400 text-sm">React 19 + TypeScript Native Foundation</p>
      </header>
      <Card
        title="Interactive Component"
        description="Structured for CODING IDE Phase 1 architecture."
        likes={likes}
        onLike={() => setLikes(c => c + 1)}
      />
    </div>
  );
}
`,
        },
        'file-card': {
          id: 'file-card',
          name: 'Card.tsx',
          path: 'src/components/Card.tsx',
          extension: 'tsx',
          parentFolderId: 'f-comp',
          createdAt: now,
          modifiedAt: now,
          content: `import React from 'react';

interface CardProps {
  title: string;
  description: string;
  likes: number;
  onLike: () => void;
}

export const Card: React.FC<CardProps> = ({ title, description, likes, onLike }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-sky-400">{title}</h3>
      <p className="text-slate-300 text-sm mt-2">{description}</p>
      <button
        onClick={onLike}
        className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg text-white font-medium text-sm transition"
      >
        Increment: {likes}
      </button>
    </div>
  );
};
`,
        },
        'file-pkg': {
          id: 'file-pkg',
          name: 'package.json',
          path: 'package.json',
          extension: 'json',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: JSON.stringify({
            name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            version: '1.0.0',
            private: true,
            dependencies: {
              react: '^19.0.0',
              'react-dom': '^19.0.0',
            },
          }, null, 2),
        },
      };

      return { files, folders };
    },
  },

  flutter: {
    type: 'flutter',
    name: 'Flutter',
    tag: 'Dart / Cross-Platform',
    description: 'Flutter project structure with Dart widgets and material design.',
    defaultPackage: 'com.codingide.flutter',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-lib': { id: 'f-lib', name: 'lib', path: 'lib', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-screens': { id: 'f-screens', name: 'screens', path: 'lib/screens', parentFolderId: 'f-lib', createdAt: now, modifiedAt: now, isOpen: false },
      };

      const files: Record<string, FileItem> = {
        'file-main': {
          id: 'file-main',
          name: 'main.dart',
          path: 'lib/main.dart',
          extension: 'dart',
          parentFolderId: 'f-lib',
          createdAt: now,
          modifiedAt: now,
          content: `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${projectName}',
      theme: ThemeData.dark(),
      home: const MyHomePage(title: '${projectName}'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text('Button presses:'),
            Text('\$_counter', style: Theme.of(context).textTheme.headlineMedium),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
`,
        },
        'file-pubspec': {
          id: 'file-pubspec',
          name: 'pubspec.yaml',
          path: 'pubspec.yaml',
          extension: 'yaml',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `name: ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
description: A Flutter project created inside CODING IDE.
version: 1.0.0+1
environment:
  sdk: '>=3.0.0 <4.0.0'
dependencies:
  flutter:
    sdk: flutter
`,
        },
      };

      return { files, folders };
    },
  },

  app_design: {
    type: 'app_design',
    name: 'App Design',
    tag: 'UI Tokens / Specs',
    description: 'Design system specifications, color tokens, layout hierarchy, and component wireframes.',
    defaultPackage: 'design.tokens',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-tokens': { id: 'f-tokens', name: 'tokens', path: 'tokens', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
        'f-specs': { id: 'f-specs', name: 'specs', path: 'specs', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
      };

      const files: Record<string, FileItem> = {
        'file-tokens': {
          id: 'file-tokens',
          name: 'tokens.json',
          path: 'tokens/tokens.json',
          extension: 'json',
          parentFolderId: 'f-tokens',
          createdAt: now,
          modifiedAt: now,
          content: JSON.stringify({
            projectName,
            colors: {
              primary: '#2563eb',
              surface: '#1e293b',
              background: '#0f172a',
              accent: '#38bdf8',
              error: '#ef4444',
            },
            typography: {
              headingFont: 'Inter, sans-serif',
              codeFont: 'JetBrains Mono, monospace',
            },
            spacing: {
              xs: '4px',
              sm: '8px',
              md: '16px',
              lg: '24px',
              xl: '32px',
            },
          }, null, 2),
        },
        'file-spec': {
          id: 'file-spec',
          name: 'wireframe.xml',
          path: 'specs/wireframe.xml',
          extension: 'xml',
          parentFolderId: 'f-specs',
          createdAt: now,
          modifiedAt: now,
          content: `<Screen name="HomeScreen" orientation="portrait">
    <TopAppBar title="${projectName}" elevation="4dp" />
    <Container padding="16dp">
        <Header text="Dashboard Overview" />
        <Card title="Quick Stats" status="active" />
        <ActionGrid columns="2" />
    </Container>
</Screen>`,
        },
      };

      return { files, folders };
    },
  },

  html_css_js: {
    type: 'html_css_js',
    name: 'HTML / CSS / JS',
    tag: 'Vanilla Starter',
    description: 'Minimal pure web structure with index.html, style.css, and app.js.',
    defaultPackage: 'html.css.js',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {};
      const files: Record<string, FileItem> = {
        'file-html': {
          id: 'file-html',
          name: 'index.html',
          path: 'index.html',
          extension: 'html',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>${projectName}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>${projectName}</h1>\n  <p>Vanilla Web Template in CODING IDE</p>\n  <script src="app.js"></script>\n</body>\n</html>`,
        },
        'file-css': {
          id: 'file-css',
          name: 'style.css',
          path: 'style.css',
          extension: 'css',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }`,
        },
        'file-js': {
          id: 'file-js',
          name: 'app.js',
          path: 'app.js',
          extension: 'js',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `console.log('${projectName} initialized');`,
        },
      };
      return { files, folders };
    },
  },

  figma: {
    type: 'figma',
    name: 'Figma Project',
    tag: 'Design to Code',
    description: 'Component architecture with layout models mapped from Figma design tokens.',
    defaultPackage: 'figma.import',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {
        'f-components': { id: 'f-components', name: 'components', path: 'components', parentFolderId: null, createdAt: now, modifiedAt: now, isOpen: true },
      };
      const files: Record<string, FileItem> = {
        'file-figma': {
          id: 'file-figma',
          name: 'figma-schema.json',
          path: 'components/figma-schema.json',
          extension: 'json',
          parentFolderId: 'f-components',
          createdAt: now,
          modifiedAt: now,
          content: JSON.stringify({
            figmaDocument: projectName,
            frames: [
              { name: 'Onboarding', width: 375, height: 812, layers: 12 },
              { name: 'Dashboard', width: 375, height: 812, layers: 28 },
            ],
          }, null, 2),
        },
      };
      return { files, folders };
    },
  },

  empty: {
    type: 'empty',
    name: 'Empty Project',
    tag: 'Blank Workspace',
    description: 'Fresh clean project workspace with only a README.md file.',
    defaultPackage: 'empty.project',
    generate: (projectId: string, projectName: string) => {
      const now = Date.now();
      const folders: Record<string, FolderItem> = {};
      const files: Record<string, FileItem> = {
        'file-readme': {
          id: 'file-readme',
          name: 'README.md',
          path: 'README.md',
          extension: 'md',
          parentFolderId: null,
          createdAt: now,
          modifiedAt: now,
          content: `# ${projectName}\n\nEmpty workspace created in CODING IDE.\nAdd files and folders using the Project Explorer.`,
        },
      };
      return { files, folders };
    },
  },
};
