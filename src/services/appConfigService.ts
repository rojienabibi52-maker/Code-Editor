import { Project, AppConfig, FileItem, ProjectType } from '../types/project';

export interface ProjectSizeBreakdown {
  sourceBytes: number;
  sourceText: string;
  assetsBytes: number;
  assetsText: string;
  buildOutputsBytes: number;
  buildOutputsText: string;
  totalBytes: number;
  totalText: string;
}

export interface PackageValidationResult {
  valid: boolean;
  message: string;
}

export interface NameValidationResult {
  valid: boolean;
  message: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  suggested: string;
  reason: string;
  patch: Partial<AppConfig>;
}

export const AppConfigService = {
  // Format bytes to human readable format
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  },

  // Calculate actual project size breakdown
  calculateProjectSizes(project: Project, buildOutputBytes = 0): ProjectSizeBreakdown {
    let sourceBytes = 0;
    let assetsBytes = 0;

    Object.values(project.files).forEach(file => {
      if (file.isAsset || file.assetDataUrl) {
        if (file.assetDataUrl) {
          // Approx base64 binary size
          const comma = file.assetDataUrl.indexOf(',');
          const b64 = comma > -1 ? file.assetDataUrl.slice(comma + 1) : file.assetDataUrl;
          assetsBytes += Math.round((b64.length * 3) / 4);
        } else {
          assetsBytes += file.size || (file.content ? file.content.length : 0);
        }
      } else {
        sourceBytes += file.content ? file.content.length : (file.size || 0);
      }
    });

    const totalBytes = sourceBytes + assetsBytes + buildOutputBytes;

    return {
      sourceBytes,
      sourceText: this.formatBytes(sourceBytes),
      assetsBytes,
      assetsText: this.formatBytes(assetsBytes),
      buildOutputsBytes: buildOutputBytes,
      buildOutputsText: this.formatBytes(buildOutputBytes),
      totalBytes,
      totalText: this.formatBytes(totalBytes),
    };
  },

  // Validate App Name
  validateAppName(name: string): NameValidationResult {
    const trimmed = name.trim();
    if (!trimmed) {
      return { valid: false, message: 'App Name cannot be empty.' };
    }
    if (trimmed.length > 50) {
      return { valid: false, message: 'App Name is excessively long (maximum 50 characters).' };
    }
    if (/[<>{}\\\/|?*]/.test(trimmed)) {
      return { valid: false, message: 'App Name contains unsupported characters (<, >, /, \\, etc).' };
    }
    return { valid: true, message: 'App Name is valid.' };
  },

  // Validate Package / Application ID
  validatePackageName(pkg: string): PackageValidationResult {
    const trimmed = pkg.trim();
    if (!trimmed) {
      return { valid: false, message: 'Application ID cannot be empty.' };
    }
    if (/\s/.test(trimmed)) {
      return { valid: false, message: 'Application ID must not contain spaces.' };
    }
    const segments = trimmed.split('.');
    if (segments.length < 2) {
      return { valid: false, message: 'Application ID must have at least two segments (e.g. com.example.app).' };
    }
    const segmentRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    for (const seg of segments) {
      if (!segmentRegex.test(seg)) {
        return {
          valid: false,
          message: `Segment "${seg}" is invalid. Each segment must start with a letter and contain only alphanumeric characters and underscores.`,
        };
      }
    }
    return { valid: true, message: 'Valid Application ID syntax.' };
  },

  // Validate Version
  validateVersion(versionName: string, versionCode: number): { valid: boolean; message: string } {
    if (!versionName.trim()) {
      return { valid: false, message: 'Version Name cannot be empty.' };
    }
    if (!/^\d+(\.\d+)*(-[a-zA-Z0-9]+)?$/.test(versionName.trim())) {
      return { valid: false, message: 'Version Name should follow semantic format (e.g. 1.0.0).' };
    }
    if (!Number.isInteger(versionCode) || versionCode < 1) {
      return { valid: false, message: 'Version Code must be a positive whole integer (e.g. 1, 2).' };
    }
    return { valid: true, message: 'Version parameters are valid.' };
  },

  // Default app configuration factory
  getDefaultConfig(project: Project): AppConfig {
    const existing = project.appConfig;
    if (existing) return existing;

    const files = Object.values(project.files);
    const logoFile = files.find(f => f.name.includes('logo') || f.name.includes('icon') || f.path.includes('images'));

    return {
      appName: project.name || 'My App',
      packageName: project.packageName || 'com.codingide.app',
      versionName: project.version || '1.0.0',
      versionCode: project.versionCode || 1,
      logoAssetId: logoFile?.id || null,
      logoDataUrl: logoFile?.assetDataUrl || null,
      splashAssetId: logoFile?.id || null,
      splashDataUrl: logoFile?.assetDataUrl || null,
      splashBackground: '#121214',
      splashLogoPosition: 'center',
      splashScale: 1,
      splashDurationMs: 2000,
      orientation: 'portrait',
      videoPreset: '9:16',
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      buildVariant: 'release',
      enableSplash: true,
      enableAutoSave: true,
      enableLivePreview: true,
      enableBuildValidation: true,
    };
  },

  // Analyze project and return Recommended Settings
  getRecommendedSettings(project: Project): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];
    const files = Object.values(project.files);

    const hasGame = files.some(
      f => f.content.toLowerCase().includes('canvas') || f.content.toLowerCase().includes('game') || f.content.toLowerCase().includes('opengl')
    );
    const hasVideo = files.some(
      f => f.name.endsWith('.mp4') || f.content.toLowerCase().includes('videoplayer') || f.content.toLowerCase().includes('exoplayer')
    );

    if (hasGame) {
      recommendations.push({
        id: 'rec-game-landscape',
        title: 'Landscape Orientation',
        suggested: 'Landscape orientation for gaming engine',
        reason: 'Detected interactive game canvas / rendering loop in project sources.',
        patch: { orientation: 'landscape', videoPreset: '16:9' },
      });
    }

    if (hasVideo) {
      recommendations.push({
        id: 'rec-video-preset',
        title: 'Video Stream Media Preset',
        suggested: '9:16 vertical short-form video ratio',
        reason: 'Detected multimedia video assets and media player surface.',
        patch: { videoPreset: '9:16' },
      });
    }

    // Modern SDK standard recommendation
    recommendations.push({
      id: 'rec-sdk-android14',
      title: 'Android 14 (API 34) Toolchain',
      suggested: 'Target SDK 34 with AndroidX Compose 2024 BOM',
      reason: 'Ensures Google Play Store 2026 compliance and modern gesture navigation.',
      patch: { targetSdk: 34, compileSdk: 34, minSdk: 24 },
    });

    return recommendations;
  },

  // Auto-configure analysis
  autoConfigureProject(project: Project): { config: AppConfig; checks: string[] } {
    const checks: string[] = [];
    const files = Object.values(project.files);

    checks.push(`Detected project architecture: ${project.type.toUpperCase()}`);

    // Check AndroidManifest
    const manifest = files.find(f => f.name === 'AndroidManifest.xml');
    let pkg = project.packageName || 'com.codingide.app';
    let appName = project.name;
    let orient: 'portrait' | 'landscape' | 'both' = 'portrait';

    if (manifest) {
      checks.push('AndroidManifest.xml detected & validated');
      const pkgMatch = manifest.content.match(/package="([^"]+)"/);
      if (pkgMatch) pkg = pkgMatch[1];

      const labelMatch = manifest.content.match(/android:label="([^"]+)"/);
      if (labelMatch && !labelMatch[1].startsWith('@string/')) {
        appName = labelMatch[1];
      }

      const orientMatch = manifest.content.match(/android:screenOrientation="([^"]+)"/);
      if (orientMatch) {
        orient = orientMatch[1] === 'landscape' ? 'landscape' : orientMatch[1] === 'unspecified' ? 'both' : 'portrait';
      }
    }

    // Check strings.xml
    const strings = files.find(f => f.name === 'strings.xml');
    if (strings) {
      const match = strings.content.match(/<string name="app_name">([^<]+)<\/string>/);
      if (match) appName = match[1];
      checks.push(`Resource string app_name extracted: "${appName}"`);
    }

    // Check logo
    const logoFile = files.find(f => f.name.includes('logo') || f.name.includes('icon'));
    if (logoFile) {
      checks.push(`App launcher icon detected: ${logoFile.name}`);
    } else {
      checks.push('Default vector launcher icon will be synthesized');
    }

    const config: AppConfig = {
      appName,
      packageName: pkg,
      versionName: project.version || '1.0.0',
      versionCode: project.versionCode || 1,
      logoAssetId: logoFile?.id || null,
      logoDataUrl: logoFile?.assetDataUrl || null,
      splashAssetId: logoFile?.id || null,
      splashDataUrl: logoFile?.assetDataUrl || null,
      splashBackground: '#121214',
      splashLogoPosition: 'center',
      splashScale: 1,
      splashDurationMs: 2000,
      orientation: orient,
      videoPreset: '9:16',
      minSdk: 24,
      targetSdk: 34,
      compileSdk: 34,
      buildVariant: 'release',
      enableSplash: true,
      enableAutoSave: true,
      enableLivePreview: true,
      enableBuildValidation: true,
    };

    return { config, checks };
  },

  // Safely apply AppConfig across project files
  applyAppConfigToProject(project: Project, config: AppConfig): Project {
    const updatedFiles = { ...project.files };
    const oldPkg = project.packageName || 'com.codingide.app';
    const newPkg = config.packageName.trim();
    const pkgChanged = oldPkg !== newPkg;

    // 1. Update AndroidManifest.xml
    const manifestFile = Object.values(updatedFiles).find(f => f.name === 'AndroidManifest.xml');
    if (manifestFile) {
      let content = manifestFile.content;
      content = content.replace(/package="[^"]+"/, `package="${newPkg}"`);
      const orientValue = config.orientation === 'both' ? 'unspecified' : config.orientation;
      if (content.includes('android:screenOrientation=')) {
        content = content.replace(/android:screenOrientation="[^"]+"/, `android:screenOrientation="${orientValue}"`);
      } else {
        content = content.replace(/<activity/, `<activity\n            android:screenOrientation="${orientValue}"`);
      }
      content = content.replace(/android:label="[^"]+"/, `android:label="${config.appName}"`);
      updatedFiles[manifestFile.id] = {
        ...manifestFile,
        content,
        modifiedAt: Date.now(),
      };
    }

    // 2. Update build.gradle or build.gradle.kts
    const gradleFile = Object.values(updatedFiles).find(
      f => f.name === 'build.gradle' || f.name === 'build.gradle.kts'
    );
    if (gradleFile) {
      let content = gradleFile.content;
      content = content.replace(/namespace\s*[=']\s*["'][^"']+["']/, `namespace '${newPkg}'`);
      content = content.replace(/applicationId\s*[=']\s*["'][^"']+["']/, `applicationId '${newPkg}'`);
      content = content.replace(/versionCode\s*[=']?\s*\d+/, `versionCode ${config.versionCode}`);
      content = content.replace(/versionName\s*[=']\s*["'][^"']+["']/, `versionName "${config.versionName}"`);
      content = content.replace(/compileSdk\s*[=']?\s*\d+/, `compileSdk ${config.compileSdk}`);
      content = content.replace(/targetSdk\s*[=']?\s*\d+/, `targetSdk ${config.targetSdk}`);
      content = content.replace(/minSdk\s*[=']?\s*\d+/, `minSdk ${config.minSdk}`);
      updatedFiles[gradleFile.id] = {
        ...gradleFile,
        content,
        modifiedAt: Date.now(),
      };
    }

    // 3. Update strings.xml
    const stringsFile = Object.values(updatedFiles).find(f => f.name === 'strings.xml');
    if (stringsFile) {
      let content = stringsFile.content;
      if (content.includes('<string name="app_name">')) {
        content = content.replace(
          /<string name="app_name">[^<]+<\/string>/,
          `<string name="app_name">${config.appName}</string>`
        );
      } else {
        content = content.replace(
          /<resources>/,
          `<resources>\n    <string name="app_name">${config.appName}</string>`
        );
      }
      updatedFiles[stringsFile.id] = {
        ...stringsFile,
        content,
        modifiedAt: Date.now(),
      };
    }

    // 4. Update package declaration in Kotlin/Java files if package changed
    if (pkgChanged) {
      Object.values(updatedFiles).forEach(f => {
        if ((f.extension === 'kt' || f.extension === 'java') && f.content.includes(`package ${oldPkg}`)) {
          updatedFiles[f.id] = {
            ...f,
            content: f.content.replace(`package ${oldPkg}`, `package ${newPkg}`),
            modifiedAt: Date.now(),
          };
        }
      });
    }

    // 5. Update colors.xml for Splash Background
    const colorsFile = Object.values(updatedFiles).find(f => f.name === 'colors.xml');
    const splashColor = config.splashBackground || '#121214';
    if (colorsFile) {
      let content = colorsFile.content;
      if (content.includes('<color name="splash_background">')) {
        content = content.replace(
          /<color name="splash_background">[^<]+<\/color>/,
          `<color name="splash_background">${splashColor}</color>`
        );
      } else {
        content = content.replace(
          /<resources>/,
          `<resources>\n    <color name="splash_background">${splashColor}</color>`
        );
      }
      updatedFiles[colorsFile.id] = {
        ...colorsFile,
        content,
        modifiedAt: Date.now(),
      };
    } else {
      // Create colors.xml in res/values/
      const colorsId = 'file-colors-' + Date.now();
      updatedFiles[colorsId] = {
        id: colorsId,
        name: 'colors.xml',
        path: 'app/src/main/res/values/colors.xml',
        extension: 'xml',
        content: `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="splash_background">${splashColor}</color>\n    <color name="primary">#2563EB</color>\n</resources>`,
        parentFolderId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };
    }

    return {
      ...project,
      name: config.appName,
      packageName: newPkg,
      version: config.versionName,
      versionCode: config.versionCode,
      appConfig: config,
      files: updatedFiles,
      modifiedAt: Date.now(),
    };
  },
};
