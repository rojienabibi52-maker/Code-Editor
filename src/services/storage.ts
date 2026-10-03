import { Project, TrashItem } from '../types/project';
import { AppSettings } from '../types/settings';
import { BuildConfiguration } from '../types/build';
import { PROJECT_TEMPLATES } from '../constants/templates';

const STORAGE_KEYS = {
  PROJECTS: 'coding_ide_projects_v1',
  ACTIVE_PROJECT_ID: 'coding_ide_active_proj_id_v1',
  TRASH: 'coding_ide_trash_v1',
  SETTINGS: 'coding_ide_settings_v1',
  BUILD_CONFIGS: 'coding_ide_build_configs_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  customBgColor: '#121214',
  customSurfaceColor: '#1c1c20',
  customTextColor: '#f3f4f6',
  customAccentColor: '#3b82f6',
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Menlo, monospace',
  lineNumbers: true,
  indentGuides: true,
  codingKeyboard: true,
  autoSave: true,
  autoSaveDelay: 1200,
  confirmDelete: true,
  wordWrap: false,
  currentLineHighlight: true,
  tabSize: 4,
  formatOnSave: true,
  soundEffects: false,
  viewMode: 'auto',
  desktopSplit: 'code-preview',
  phoneSubTab: 'code',

  // Phase 2 Settings
  syntaxHighlighting: true,
  autocomplete: true,
  codeSuggestions: true,
  errorDetection: true,
  quickFix: true,
  codeFormatting: true,
  codeFolding: true,
  bracketMatching: true,
  autoClosingBrackets: true,
  autoClosingQuotes: true,
  workspaceMode: 'code-preview',
  previewAutoRefresh: true,
  previewDevice: 'phone',
  previewOrientation: 'portrait',
  autoSaveBeforeBuild: true,
  keepBuildHistory: true,
  cleanBuild: false,
  networkSimulateOffline: false,
};

export function createInitialSeedProject(): Project {
  const projectId = 'proj-seed-android';
  const projectName = 'MyAndroidApp';
  const template = PROJECT_TEMPLATES.android;
  const { files, folders } = template.generate(projectId, projectName);

  return {
    id: projectId,
    name: projectName,
    description: 'Android App with Jetpack Compose Material 3',
    type: 'android',
    packageName: 'com.codingide.app',
    version: '1.0.0',
    versionCode: 1,
    createdAt: Date.now() - 3600000,
    modifiedAt: Date.now(),
    rootDirectory: projectName,
    files,
    folders,
    activeFileId: 'file-main-kt',
    openFileIds: ['file-main-kt', 'file-manifest', 'file-build-gradle'],
    appConfig: {
      appName: projectName,
      packageName: 'com.codingide.app',
      versionName: '1.0.0',
      versionCode: 1,
      logoAssetId: 'file-logo-svg',
      logoDataUrl: null,
      splashAssetId: 'file-logo-svg',
      splashDataUrl: null,
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
    },
  };
}

export const StorageService = {
  createInitialSeedProject,

  getProjects(): Record<string, Project> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (!data) {
        const seed = createInitialSeedProject();
        const initial: Record<string, Project> = { [seed.id]: seed };
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initial));
        return initial;
      }
      const parsed: Record<string, Project> = JSON.parse(data);
      // Ensure seed project or any android project has rich file tree if empty/sparse
      Object.values(parsed).forEach(p => {
        if (p.type === 'android' && Object.keys(p.files).length < 6) {
          const fresh = PROJECT_TEMPLATES.android.generate(p.id, p.name);
          p.files = { ...fresh.files, ...p.files };
          p.folders = { ...fresh.folders, ...p.folders };
        }
      });
      return parsed;
    } catch (e) {
      console.error('Failed to read projects from storage', e);
      const seed = createInitialSeedProject();
      return { [seed.id]: seed };
    }
  },

  saveProjects(projects: Record<string, Project>) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to storage', e);
    }
  },

  getActiveProjectId(): string {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
      if (id) return id;
      const projects = this.getProjects();
      const firstId = Object.keys(projects)[0] || 'proj-seed-android';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, firstId);
      return firstId;
    } catch {
      return 'proj-seed-android';
    }
  },

  setActiveProjectId(id: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    } catch (e) {
      console.error('Failed to set active project id', e);
    }
  },

  getTrash(): TrashItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRASH);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTrash(trash: TrashItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trash));
    } catch (e) {
      console.error('Failed to save trash', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getBuildConfig(projectId: string): BuildConfiguration | null {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.BUILD_CONFIGS);
      if (!all) return null;
      const map = JSON.parse(all);
      return map[projectId] || null;
    } catch {
      return null;
    }
  },

  saveBuildConfig(projectId: string, config: BuildConfiguration) {
    try {
      const all = localStorage.getItem(STORAGE_KEYS.BUILD_CONFIGS);
      const map = all ? JSON.parse(all) : {};
      map[projectId] = config;
      localStorage.setItem(STORAGE_KEYS.BUILD_CONFIGS, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save build configuration', e);
    }
  },
};
