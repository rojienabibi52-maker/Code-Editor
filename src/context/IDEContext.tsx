import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Project, ProjectType, FileItem, FolderItem, TrashItem, ClipboardItem, AppConfig } from '../types/project';
import { AppSettings, ThemeColors, ThemeMode, WorkspaceMode } from '../types/settings';
import { StorageService, DEFAULT_SETTINGS } from '../services/storage';
import { ExportService } from '../services/export';
import { THEME_PRESETS } from '../constants/themes';
import { PROJECT_TEMPLATES } from '../constants/templates';
import { ToastMessage } from '../components/common/Toast';
import { DiagnosticItem, SymbolItem, NLCodePlan } from '../types/editor';
import {
  BuildVariant,
  BuildOutputType,
  BuildStage,
  BuildOutputItem,
  BuildLogItem,
  BuildFailureDetails,
} from '../types/build';
import { DiagnosticsService } from '../services/diagnostics';
import { SymbolIndexService } from '../services/symbolIndex';
import { ProjectCheckerService, ProjectCheckSummary } from '../services/projectChecker';
import { FormatterService } from '../services/formatter';
import { BuildEngineService, BuildProgressEvent } from '../services/buildEngine';
import { ZipImportService } from '../services/zipImport';
import { AppConfigService } from '../services/appConfigService';

export interface BuildRunState {
  isRunning: boolean;
  stage: BuildStage;
  progress: number;
  task: string;
  filesProcessed: number;
  totalFiles: number;
  logs: BuildLogItem[];
  artifact?: BuildOutputItem;
  failure?: BuildFailureDetails;
}

interface IDEContextType {
  projects: Record<string, Project>;
  activeProject: Project;
  activeFile: FileItem | null;
  openFiles: FileItem[];
  trash: TrashItem[];
  settings: AppSettings;
  themeColors: ThemeColors;
  clipboard: ClipboardItem | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  toasts: ToastMessage[];

  // Phase 2 Diagnostics & Intelligence
  activeDiagnostics: DiagnosticItem[];
  projectSymbols: SymbolItem[];
  isOnline: boolean;
  toggleNetworkOffline: () => void;
  runProjectCheck: () => ProjectCheckSummary;
  applyQuickFix: (diagnostic: DiagnosticItem) => void;
  formatActiveFile: () => void;
  formatSelection: (start: number, end: number) => void;
  executeNLPlan: (plan: NLCodePlan) => void;

  // Phase 2 & 3 Real Build Pipeline & Artifact Management
  buildRunState: BuildRunState;
  buildHistory: BuildOutputItem[];
  runBuild: (variant: BuildVariant, outputType: BuildOutputType) => Promise<boolean>;
  cancelBuild: () => void;
  downloadBuildArtifact: (artifact: BuildOutputItem) => void;
  deleteBuildArtifact: (id: string) => void;
  cleanProjectBuildCache: () => Promise<void>;
  clearBuildHistory: () => void;

  // Project Actions
  createProject: (name: string, type: ProjectType, packageName?: string) => Project;
  importProjectFromZip: (file: File) => Promise<Project>;
  openProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  updateProjectConfig: (config: AppConfig) => void;
  exportProjectZip: (id: string) => Promise<void>;
  exportProjectApk: (id?: string) => Promise<void>;
  exportProjectAab: (id?: string) => Promise<void>;
  shareProject: (id: string) => Promise<void>;
  restoreBackupJson: (file: File) => Promise<boolean>;
  exportBackupJson: () => void;

  // File & Folder Actions
  createFile: (name: string, parentFolderId: string | null, content?: string) => FileItem;
  uploadAsset: (file: File, parentFolderId: string | null) => Promise<FileItem>;
  createFolder: (name: string, parentFolderId: string | null) => FolderItem;
  renameItem: (id: string, type: 'file' | 'folder', newName: string) => boolean;
  deleteItem: (id: string, type: 'file' | 'folder') => void;
  restoreTrashItem: (trashId: string) => void;
  emptyTrash: () => void;
  copyItem: (id: string, type: 'file' | 'folder', op: 'copy' | 'cut') => void;
  pasteItem: (targetFolderId: string | null) => void;
  duplicateFile: (fileId: string) => void;
  downloadFile: (fileId: string) => void;
  downloadFolder: (folderId: string) => void;
  shareFile: (fileId: string) => void;

  // Editor Actions
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  saveActiveFile: () => void;
  toggleFolder: (folderId: string) => void;

  // Settings & Theme
  updateSettings: (partial: Partial<AppSettings>) => void;
  switchTheme: (theme: ThemeMode) => void;
  setCustomBgColor: (color: string) => void;
  toggleDarkLightQuick: () => void;

  // Toasts
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const IDEContext = createContext<IDEContextType | null>(null);

const STORAGE_KEYS = {
  BUILD_HISTORY: 'coding_ide_build_history_v2',
};

export const IDEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Record<string, Project>>(() => StorageService.getProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => StorageService.getActiveProjectId());
  const [trash, setTrash] = useState<TrashItem[]>(() => StorageService.getTrash());
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Online / Offline tracking
  const [browserOnline, setBrowserOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Build History state
  const [buildHistory, setBuildHistory] = useState<BuildOutputItem[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUILD_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Active Build Run State
  const [buildRunState, setBuildRunState] = useState<BuildRunState>({
    isRunning: false,
    stage: 'idle',
    progress: 0,
    task: '',
    filesProcessed: 0,
    totalFiles: 0,
    logs: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to browser network changes
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = browserOnline && !settings.networkSimulateOffline;

  const toggleNetworkOffline = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      networkSimulateOffline: !prev.networkSimulateOffline,
    }));
  }, []);

  // Save build history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUILD_HISTORY, JSON.stringify(buildHistory));
    } catch (e) {
      console.error('Failed to save build history', e);
    }
  }, [buildHistory]);

  // Active Project resolution
  const activeProject = projects[activeProjectId] || Object.values(projects)[0] || StorageService.createInitialSeedProject();

  // Active File resolution
  const activeFile = activeProject.activeFileId && activeProject.files[activeProject.activeFileId]
    ? activeProject.files[activeProject.activeFileId]
    : null;

  // Open Files resolution
  const openFiles = (activeProject.openFileIds || [])
    .map(id => activeProject.files[id])
    .filter(Boolean) as FileItem[];

  // Compute theme colors dynamically
  const themeColors: ThemeColors = useMemo(() => {
    if (settings.theme === 'custom') {
      const bg = settings.customBgColor || '#18181b';
      return {
        ...THEME_PRESETS.custom,
        background: bg,
        surface: settings.customSurfaceColor || '#27272a',
        text: settings.customTextColor || '#fafafa',
        accent: settings.customAccentColor || '#3b82f6',
        editorBg: bg,
      };
    }
    return THEME_PRESETS[settings.theme] || THEME_PRESETS.dark;
  }, [settings.theme, settings.customBgColor, settings.customSurfaceColor, settings.customTextColor, settings.customAccentColor]);

  // Project-wide Symbol Index
  const projectSymbols = useMemo(() => {
    return SymbolIndexService.buildProjectIndex(activeProject);
  }, [activeProject]);

  // Real-time Diagnostics for active file
  const activeDiagnostics = useMemo(() => {
    if (!activeFile || !settings.errorDetection) return [];
    return DiagnosticsService.analyzeFile(activeFile, activeProject);
  }, [activeFile, activeProject, settings.errorDetection]);

  // Persist settings
  useEffect(() => {
    StorageService.saveSettings(settings);
  }, [settings]);

  // Persist trash
  useEffect(() => {
    StorageService.saveTrash(trash);
  }, [trash]);

  const saveProjectsToStorage = useCallback((updatedProjects: Record<string, Project>) => {
    setProjects(updatedProjects);
    StorageService.saveProjects(updatedProjects);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleDarkLightQuick = useCallback(() => {
    const nextTheme: ThemeMode = settings.theme === 'dark' ? 'light' : 'dark';
    setSettings(prev => ({ ...prev, theme: nextTheme }));
    addToast(nextTheme === 'dark' ? 'Obsidian Dark Activated' : 'Studio Light Activated', 'info');
  }, [settings.theme, addToast]);

  const switchTheme = useCallback((theme: ThemeMode) => {
    setSettings(prev => ({ ...prev, theme }));
    addToast(`Theme switched to ${THEME_PRESETS[theme]?.name || theme}`, 'info');
  }, [addToast]);

  const setCustomBgColor = useCallback((color: string) => {
    setSettings(prev => ({
      ...prev,
      theme: 'custom',
      customBgColor: color,
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Quick Fix
  const applyQuickFix = useCallback((diagnostic: DiagnosticItem) => {
    if (!activeFile) return;
    const fixedContent = DiagnosticsService.applyQuickFix(activeFile, diagnostic);
    if (fixedContent !== activeFile.content) {
      const updatedFiles = {
        ...activeProject.files,
        [activeFile.id]: {
          ...activeFile,
          content: fixedContent,
          isModified: true,
          modifiedAt: Date.now(),
        },
      };
      const updatedProj: Project = {
        ...activeProject,
        files: updatedFiles,
        modifiedAt: Date.now(),
      };
      saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
      addToast(`Applied fix: ${diagnostic.suggestedFix || 'Resolved issue'}`, 'success');
    }
  }, [activeFile, activeProject, projects, saveProjectsToStorage, addToast]);

  // Code Formatter
  const formatActiveFile = useCallback(() => {
    if (!activeFile) return;
    const formatted = FormatterService.formatCode(activeFile.content, activeFile.extension, settings.tabSize || 4);
    if (formatted !== activeFile.content) {
      const updatedFiles = {
        ...activeProject.files,
        [activeFile.id]: {
          ...activeFile,
          content: formatted,
          isModified: true,
          modifiedAt: Date.now(),
        },
      };
      const updatedProj: Project = {
        ...activeProject,
        files: updatedFiles,
        modifiedAt: Date.now(),
      };
      saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
      addToast('File formatted', 'success');
    } else {
      addToast('Code is already formatted', 'info');
    }
  }, [activeFile, activeProject, settings.tabSize, projects, saveProjectsToStorage, addToast]);

  const formatSelection = useCallback((start: number, end: number) => {
    if (!activeFile) return;
    const formatted = FormatterService.formatSelection(activeFile.content, start, end, activeFile.extension, settings.tabSize || 4);
    const updatedFiles = {
      ...activeProject.files,
      [activeFile.id]: {
        ...activeFile,
        content: formatted,
        isModified: true,
        modifiedAt: Date.now(),
      },
    };
    const updatedProj: Project = {
      ...activeProject,
      files: updatedFiles,
      modifiedAt: Date.now(),
    };
    saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
    addToast('Selection formatted', 'success');
  }, [activeFile, activeProject, settings.tabSize, projects, saveProjectsToStorage, addToast]);

  // Natural Language Plan Execution
  const executeNLPlan = useCallback((plan: NLCodePlan) => {
    let currentProj = { ...activeProject };
    const updatedFiles = { ...currentProj.files };
    const openIds = [...currentProj.openFileIds];
    let lastCreatedFileId: string | null = null;

    plan.changes.forEach(change => {
      const fileName = change.path.split(/[/|\\]/).pop() || 'GeneratedFile.kt';
      const parts = fileName.split('.');
      const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

      const id = 'file-nl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      lastCreatedFileId = id;

      updatedFiles[id] = {
        id,
        name: fileName,
        path: change.path,
        extension: ext,
        content: change.newContent,
        parentFolderId: null,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };

      if (!openIds.includes(id)) {
        openIds.push(id);
      }
    });

    const updatedProj: Project = {
      ...currentProj,
      files: updatedFiles,
      openFileIds: openIds,
      activeFileId: lastCreatedFileId || currentProj.activeFileId,
      modifiedAt: Date.now(),
    };

    saveProjectsToStorage({ ...projects, [currentProj.id]: updatedProj });
    addToast(`Applied changes: ${plan.summary}`, 'success');
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  // Project Check Runner
  const runProjectCheck = useCallback((): ProjectCheckSummary => {
    return ProjectCheckerService.validateAndroidProject(activeProject, isOnline);
  }, [activeProject, isOnline]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    const current = activeProject.files[fileId];
    if (!current) return;

    setSaveStatus('unsaved');

    const updatedFiles = {
      ...activeProject.files,
      [fileId]: {
        ...current,
        content,
        isModified: true,
        modifiedAt: Date.now(),
      },
    };

    const updatedProj: Project = {
      ...activeProject,
      files: updatedFiles,
      modifiedAt: Date.now(),
    };

    setProjects(prev => ({ ...prev, [activeProject.id]: updatedProj }));

    // Auto Save trigger
    if (settings.autoSave) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        setSaveStatus('saving');
        StorageService.saveProjects({ ...projects, [activeProject.id]: updatedProj });
        setTimeout(() => {
          setSaveStatus('saved');
        }, 300);
      }, settings.autoSaveDelay);
    }
  }, [activeProject, projects, settings.autoSave, settings.autoSaveDelay]);

  const saveActiveFile = useCallback(() => {
    if (!activeFile) return;
    setSaveStatus('saving');
    const updatedFiles = {
      ...activeProject.files,
      [activeFile.id]: {
        ...activeFile,
        isModified: false,
        modifiedAt: Date.now(),
      },
    };
    const updatedProj: Project = {
      ...activeProject,
      files: updatedFiles,
      modifiedAt: Date.now(),
    };
    saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
    setTimeout(() => {
      setSaveStatus('saved');
      addToast(`Saved ${activeFile.name}`, 'success');
    }, 200);
  }, [activeFile, activeProject, projects, saveProjectsToStorage, addToast]);

  // Real Build Execution
  const runBuild = useCallback(async (variant: BuildVariant, outputType: BuildOutputType): Promise<boolean> => {
    if (buildRunState.isRunning) {
      addToast('A build is already in progress', 'info');
      return false;
    }

    // Auto-save before build
    if (settings.autoSaveBeforeBuild && activeFile && activeFile.isModified) {
      saveActiveFile();
    }

    abortControllerRef.current = new AbortController();

    setBuildRunState({
      isRunning: true,
      stage: 'precheck',
      progress: 0,
      task: 'Initializing build pipeline...',
      filesProcessed: 0,
      totalFiles: Object.keys(activeProject.files).length,
      logs: [],
    });

    addToast(`Starting ${outputType.toUpperCase()} (${variant}) Build...`, 'info');

    const result = await BuildEngineService.executeBuild(
      activeProject,
      variant,
      outputType,
      (ev: BuildProgressEvent) => {
        setBuildRunState(prev => ({
          ...prev,
          stage: ev.stage,
          progress: ev.progress,
          task: ev.task,
          filesProcessed: ev.filesProcessed,
          totalFiles: ev.totalFiles,
          logs: [...prev.logs, ev.log],
        }));
      },
      abortControllerRef.current.signal
    );

    if (result.success && result.artifact && result.blob) {
      // Store blob URL
      const url = URL.createObjectURL(result.blob);
      result.artifact.downloadDataUrl = url;

      // Convert blob to DataURL so it is saved directly into project files
      let dataUrl = '';
      try {
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve(url);
          reader.readAsDataURL(result.blob!);
        });
      } catch {
        dataUrl = url;
      }

      // Ensure 'build/outputs/apk/variant' or 'build/outputs/bundle/variant' folder structure in project
      const updatedFolders = { ...activeProject.folders };
      let buildFolder = Object.values(updatedFolders).find(f => f.name === 'build' && f.parentFolderId === null);
      if (!buildFolder) {
        const bid = 'folder-build-' + Date.now();
        buildFolder = {
          id: bid,
          name: 'build',
          path: 'build',
          parentFolderId: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[bid] = buildFolder;
      }

      let outputsFolder = Object.values(updatedFolders).find(f => f.name === 'outputs' && f.parentFolderId === buildFolder!.id);
      if (!outputsFolder) {
        const oid = 'folder-outputs-' + Date.now();
        outputsFolder = {
          id: oid,
          name: 'outputs',
          path: 'build/outputs',
          parentFolderId: buildFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[oid] = outputsFolder;
      }

      const subName = outputType === 'apk' ? 'apk' : 'bundle';
      let typeFolder = Object.values(updatedFolders).find(f => f.name === subName && f.parentFolderId === outputsFolder!.id);
      if (!typeFolder) {
        const tid = `folder-${subName}-` + Date.now();
        typeFolder = {
          id: tid,
          name: subName,
          path: `build/outputs/${subName}`,
          parentFolderId: outputsFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[tid] = typeFolder;
      }

      let variantFolder = Object.values(updatedFolders).find(f => f.name === variant && f.parentFolderId === typeFolder!.id);
      if (!variantFolder) {
        const vid = `folder-${variant}-` + Date.now();
        variantFolder = {
          id: vid,
          name: variant,
          path: `build/outputs/${subName}/${variant}`,
          parentFolderId: typeFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[vid] = variantFolder;
      }

      // Check if file already exists in project.files
      const existingFileEntry = Object.values(activeProject.files).find(
        f => f.name === result.artifact!.fileName
      );
      const fileId = existingFileEntry ? existingFileEntry.id : ('file-artifact-' + Date.now());

      const artifactFile: FileItem = {
        id: fileId,
        name: result.artifact.fileName,
        path: `build/outputs/${subName}/${variant}/${result.artifact.fileName}`,
        extension: outputType,
        content: `// Compiled Android ${outputType.toUpperCase()} Binary Archive\n// Artifact: ${result.artifact.fileName}\n// Size: ${result.artifact.fileSizeText}\n// SHA-256 Checksum: ${result.artifact.checksumSha256}\n// Generated: ${new Date().toLocaleString()}`,
        parentFolderId: variantFolder.id,
        createdAt: existingFileEntry?.createdAt || Date.now(),
        modifiedAt: Date.now(),
        isAsset: true,
        assetType: 'other',
        assetDataUrl: dataUrl || url,
        size: result.artifact.fileSizeBytes,
      };

      const updatedProj: Project = {
        ...activeProject,
        folders: updatedFolders,
        files: {
          ...activeProject.files,
          [fileId]: artifactFile,
        },
        modifiedAt: Date.now(),
      };

      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: updatedProj,
      });

      setBuildRunState(prev => ({
        ...prev,
        isRunning: false,
        stage: 'complete',
        progress: 100,
        task: 'Build Successful',
        artifact: result.artifact,
      }));

      // Add to build history
      if (settings.keepBuildHistory) {
        setBuildHistory(prev => [result.artifact!, ...prev.slice(0, 19)]);
      }

      addToast(`Build Successful: ${result.artifact.fileName} generated in project files`, 'success');
      return true;
    } else {
      setBuildRunState(prev => ({
        ...prev,
        isRunning: false,
        stage: 'failed',
        failure: result.failure,
      }));
      addToast(`Build Failed: ${result.failure?.error || 'Execution error'}`, 'error');
      return false;
    }
  }, [buildRunState.isRunning, settings.autoSaveBeforeBuild, settings.keepBuildHistory, activeFile, saveActiveFile, activeProject, addToast]);

  const cancelBuild = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setBuildRunState(prev => ({
        ...prev,
        isRunning: false,
        stage: 'failed',
        task: 'Build Cancelled by user',
      }));
      addToast('Build cancelled', 'info');
    }
  }, [addToast]);

  const downloadBuildArtifact = useCallback((artifact: BuildOutputItem) => {
    if (artifact.downloadDataUrl) {
      const a = document.createElement('a');
      a.href = artifact.downloadDataUrl;
      a.download = artifact.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast(`Downloading ${artifact.fileName}`, 'success');
    } else {
      addToast('Artifact is no longer in memory. Rebuild to generate fresh file.', 'info');
    }
  }, [addToast]);

  const clearBuildHistory = useCallback(() => {
    setBuildHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.BUILD_HISTORY);
    } catch {}
    addToast('Build history cleared', 'info');
  }, [addToast]);

  const deleteBuildArtifact = useCallback((id: string) => {
    setBuildHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.BUILD_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast('Build artifact deleted', 'info');
  }, [addToast]);

  const cleanProjectBuildCache = useCallback(async () => {
    setBuildRunState({
      isRunning: false,
      stage: 'idle',
      progress: 0,
      task: '',
      filesProcessed: 0,
      totalFiles: 0,
      logs: [],
    });
    setBuildHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.BUILD_HISTORY);
    } catch {}
    addToast('Project build cache cleaned & intermediate artifacts purged', 'success');
  }, [addToast]);

  // Project Actions
  const createProject = useCallback((name: string, type: ProjectType, packageName?: string): Project => {
    const id = 'proj-' + Date.now();
    const template = PROJECT_TEMPLATES[type] || PROJECT_TEMPLATES.android;
    const { files, folders } = template.generate(id, name.trim());

    const firstFileId = Object.keys(files)[0] || null;

    const newProject: Project = {
      id,
      name: name.trim(),
      type,
      packageName: packageName || template.defaultPackage,
      version: '1.0.0',
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      rootDirectory: name.trim(),
      files,
      folders,
      activeFileId: firstFileId,
      openFileIds: firstFileId ? [firstFileId] : [],
    };

    const updated = { ...projects, [id]: newProject };
    saveProjectsToStorage(updated);
    setActiveProjectId(id);
    StorageService.setActiveProjectId(id);
    addToast(`Project created: ${name}`, 'success');
    return newProject;
  }, [projects, saveProjectsToStorage, addToast]);

  const openProject = useCallback((id: string) => {
    if (!projects[id]) return;
    setActiveProjectId(id);
    StorageService.setActiveProjectId(id);
    addToast(`Opened ${projects[id].name}`, 'info');
  }, [projects, addToast]);

  const deleteProject = useCallback((id: string) => {
    const target = projects[id];
    if (!target) return;

    const remaining = { ...projects };
    delete remaining[id];

    const remainingIds = Object.keys(remaining);
    let nextId = activeProjectId;
    if (id === activeProjectId) {
      if (remainingIds.length > 0) {
        nextId = remainingIds[0];
      } else {
        const seed = StorageService.createInitialSeedProject();
        remaining[seed.id] = seed;
        nextId = seed.id;
      }
    }

    saveProjectsToStorage(remaining);
    setActiveProjectId(nextId);
    StorageService.setActiveProjectId(nextId);
    addToast(`Deleted project ${target.name}`, 'info');
  }, [projects, activeProjectId, saveProjectsToStorage, addToast]);

  const duplicateProject = useCallback((id: string) => {
    const source = projects[id];
    if (!source) return;

    const newId = 'proj-' + Date.now();
    const newName = `${source.name} Copy`;
    const clonedFiles: Record<string, FileItem> = {};
    const clonedFolders: Record<string, FolderItem> = {};

    Object.values(source.folders).forEach(f => {
      clonedFolders[f.id] = { ...f, createdAt: Date.now(), modifiedAt: Date.now() };
    });
    Object.values(source.files).forEach(f => {
      clonedFiles[f.id] = { ...f, createdAt: Date.now(), modifiedAt: Date.now() };
    });

    const duplicated: Project = {
      ...source,
      id: newId,
      name: newName,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      files: clonedFiles,
      folders: clonedFolders,
    };

    const updated = { ...projects, [newId]: duplicated };
    saveProjectsToStorage(updated);
    addToast(`Duplicated: ${newName}`, 'success');
  }, [projects, saveProjectsToStorage, addToast]);

  const renameProject = useCallback((id: string, newName: string) => {
    if (!projects[id] || !newName.trim()) return;
    const updated = {
      ...projects,
      [id]: {
        ...projects[id],
        name: newName.trim(),
        modifiedAt: Date.now(),
      },
    };
    saveProjectsToStorage(updated);
    addToast(`Renamed project to ${newName.trim()}`, 'success');
  }, [projects, saveProjectsToStorage, addToast]);

  const updateProjectConfig = useCallback((cfg: AppConfig) => {
    if (!activeProject) return;
    const updatedProj = AppConfigService.applyAppConfigToProject(activeProject, cfg);
    const updated = {
      ...projects,
      [activeProject.id]: updatedProj,
    };
    saveProjectsToStorage(updated);
    addToast('App Configuration saved & synchronized across project files', 'success');
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const exportProjectZip = useCallback(async (id: string) => {
    const proj = projects[id];
    if (!proj) return;
    try {
      addToast('Preparing Project ZIP...', 'info');
      await ExportService.downloadProjectZip(proj);
      addToast(`Exported ${proj.name}.zip`, 'success');
    } catch (e) {
      console.error(e);
      addToast('ZIP Export failed', 'error');
    }
  }, [projects, addToast]);

  const exportProjectApk = useCallback(async (id?: string) => {
    const targetId = id || activeProjectId;
    const proj = projects[targetId];
    if (!proj) return;
    try {
      addToast(`Building & generating APK into ${proj.name} project files...`, 'info');
      const exportRes = await ExportService.downloadProjectApk(proj, 'release');
      
      // Ensure folder structure in project: build -> outputs -> apk -> release
      const updatedFolders = { ...proj.folders };
      let buildFolder = Object.values(updatedFolders).find(f => f.name === 'build' && f.parentFolderId === null);
      if (!buildFolder) {
        const bid = 'folder-build-' + Date.now();
        buildFolder = {
          id: bid,
          name: 'build',
          path: 'build',
          parentFolderId: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[bid] = buildFolder;
      } else {
        updatedFolders[buildFolder.id] = { ...buildFolder, isOpen: true };
      }

      let outputsFolder = Object.values(updatedFolders).find(f => f.name === 'outputs' && f.parentFolderId === buildFolder!.id);
      if (!outputsFolder) {
        const oid = 'folder-outputs-' + Date.now();
        outputsFolder = {
          id: oid,
          name: 'outputs',
          path: 'build/outputs',
          parentFolderId: buildFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[oid] = outputsFolder;
      } else {
        updatedFolders[outputsFolder.id] = { ...outputsFolder, isOpen: true };
      }

      let apkFolder = Object.values(updatedFolders).find(f => f.name === 'apk' && f.parentFolderId === outputsFolder!.id);
      if (!apkFolder) {
        const tid = 'folder-apk-' + Date.now();
        apkFolder = {
          id: tid,
          name: 'apk',
          path: 'build/outputs/apk',
          parentFolderId: outputsFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[tid] = apkFolder;
      } else {
        updatedFolders[apkFolder.id] = { ...apkFolder, isOpen: true };
      }

      let releaseFolder = Object.values(updatedFolders).find(f => f.name === 'release' && f.parentFolderId === apkFolder!.id);
      if (!releaseFolder) {
        const vid = 'folder-release-' + Date.now();
        releaseFolder = {
          id: vid,
          name: 'release',
          path: 'build/outputs/apk/release',
          parentFolderId: apkFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[vid] = releaseFolder;
      } else {
        updatedFolders[releaseFolder.id] = { ...releaseFolder, isOpen: true };
      }

      // Check if existing file in project files
      const existingFileEntry = Object.values(proj.files).find(
        f => f.name === exportRes.fileName || f.path === `build/outputs/apk/release/${exportRes.fileName}`
      );
      const fileId = existingFileEntry ? existingFileEntry.id : ('file-apk-' + Date.now());

      const artifactFile: FileItem = {
        id: fileId,
        name: exportRes.fileName,
        path: `build/outputs/apk/release/${exportRes.fileName}`,
        extension: 'apk',
        content: `// Compiled Android APK Binary Archive\n// Artifact: ${exportRes.fileName}\n// Size: ${exportRes.artifact?.fileSizeText || ''}\n// SHA-256 Checksum: ${exportRes.artifact?.checksumSha256 || ''}\n// Generated: ${new Date().toLocaleString()}`,
        parentFolderId: releaseFolder.id,
        createdAt: existingFileEntry?.createdAt || Date.now(),
        modifiedAt: Date.now(),
        isAsset: true,
        assetType: 'other',
        assetDataUrl: exportRes.dataUrl,
        size: exportRes.artifact?.fileSizeBytes || exportRes.blob.size,
      };

      const updatedProj: Project = {
        ...proj,
        folders: updatedFolders,
        files: {
          ...proj.files,
          [fileId]: artifactFile,
        },
        modifiedAt: Date.now(),
      };

      const updatedProjects = {
        ...projects,
        [proj.id]: updatedProj,
      };

      saveProjectsToStorage(updatedProjects);

      if (exportRes.artifact) {
        const itemWithUrl = { ...exportRes.artifact, downloadDataUrl: exportRes.dataUrl };
        setBuildHistory(prev => [itemWithUrl, ...prev.filter(x => x.id !== exportRes.artifact.id).slice(0, 19)]);
      }

      addToast(`APK generated directly in project files: build/outputs/apk/release/${exportRes.fileName}`, 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'APK Export failed', 'error');
    }
  }, [projects, activeProjectId, saveProjectsToStorage, addToast]);

  const exportProjectAab = useCallback(async (id?: string) => {
    const targetId = id || activeProjectId;
    const proj = projects[targetId];
    if (!proj) return;
    try {
      addToast(`Building & generating AAB bundle into ${proj.name} project files...`, 'info');
      const exportRes = await ExportService.downloadProjectAab(proj, 'release');

      const updatedFolders = { ...proj.folders };
      let buildFolder = Object.values(updatedFolders).find(f => f.name === 'build' && f.parentFolderId === null);
      if (!buildFolder) {
        const bid = 'folder-build-' + Date.now();
        buildFolder = {
          id: bid,
          name: 'build',
          path: 'build',
          parentFolderId: null,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[bid] = buildFolder;
      } else {
        updatedFolders[buildFolder.id] = { ...buildFolder, isOpen: true };
      }

      let outputsFolder = Object.values(updatedFolders).find(f => f.name === 'outputs' && f.parentFolderId === buildFolder!.id);
      if (!outputsFolder) {
        const oid = 'folder-outputs-' + Date.now();
        outputsFolder = {
          id: oid,
          name: 'outputs',
          path: 'build/outputs',
          parentFolderId: buildFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[oid] = outputsFolder;
      } else {
        updatedFolders[outputsFolder.id] = { ...outputsFolder, isOpen: true };
      }

      let bundleFolder = Object.values(updatedFolders).find(f => f.name === 'bundle' && f.parentFolderId === outputsFolder!.id);
      if (!bundleFolder) {
        const tid = 'folder-bundle-' + Date.now();
        bundleFolder = {
          id: tid,
          name: 'bundle',
          path: 'build/outputs/bundle',
          parentFolderId: outputsFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[tid] = bundleFolder;
      } else {
        updatedFolders[bundleFolder.id] = { ...bundleFolder, isOpen: true };
      }

      let releaseFolder = Object.values(updatedFolders).find(f => f.name === 'release' && f.parentFolderId === bundleFolder!.id);
      if (!releaseFolder) {
        const vid = 'folder-release-' + Date.now();
        releaseFolder = {
          id: vid,
          name: 'release',
          path: 'build/outputs/bundle/release',
          parentFolderId: bundleFolder.id,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          isOpen: true,
        };
        updatedFolders[vid] = releaseFolder;
      } else {
        updatedFolders[releaseFolder.id] = { ...releaseFolder, isOpen: true };
      }

      const existingFileEntry = Object.values(proj.files).find(
        f => f.name === exportRes.fileName || f.path === `build/outputs/bundle/release/${exportRes.fileName}`
      );
      const fileId = existingFileEntry ? existingFileEntry.id : ('file-aab-' + Date.now());

      const artifactFile: FileItem = {
        id: fileId,
        name: exportRes.fileName,
        path: `build/outputs/bundle/release/${exportRes.fileName}`,
        extension: 'aab',
        content: `// Compiled Android App Bundle (AAB)\n// Artifact: ${exportRes.fileName}\n// Size: ${exportRes.artifact?.fileSizeText || ''}\n// SHA-256 Checksum: ${exportRes.artifact?.checksumSha256 || ''}\n// Generated: ${new Date().toLocaleString()}`,
        parentFolderId: releaseFolder.id,
        createdAt: existingFileEntry?.createdAt || Date.now(),
        modifiedAt: Date.now(),
        isAsset: true,
        assetType: 'other',
        assetDataUrl: exportRes.dataUrl,
        size: exportRes.artifact?.fileSizeBytes || exportRes.blob.size,
      };

      const updatedProj: Project = {
        ...proj,
        folders: updatedFolders,
        files: {
          ...proj.files,
          [fileId]: artifactFile,
        },
        modifiedAt: Date.now(),
      };

      const updatedProjects = {
        ...projects,
        [proj.id]: updatedProj,
      };

      saveProjectsToStorage(updatedProjects);

      if (exportRes.artifact) {
        const itemWithUrl = { ...exportRes.artifact, downloadDataUrl: exportRes.dataUrl };
        setBuildHistory(prev => [itemWithUrl, ...prev.filter(x => x.id !== exportRes.artifact.id).slice(0, 19)]);
      }

      addToast(`AAB generated directly in project files: build/outputs/bundle/release/${exportRes.fileName}`, 'success');
    } catch (e: any) {
      console.error(e);
      addToast(e.message || 'AAB Export failed', 'error');
    }
  }, [projects, activeProjectId, saveProjectsToStorage, addToast]);

  const shareProject = useCallback(async (id: string) => {
    const proj = projects[id];
    if (!proj) return;
    const res = await ExportService.shareProject(proj);
    if (res.shared) {
      addToast(res.method === 'clipboard' ? 'Project details copied to clipboard' : 'Shared project', 'success');
    } else {
      addToast('Sharing unavailable on this device', 'info');
    }
  }, [projects, addToast]);

  const importProjectFromZip = useCallback(async (file: File): Promise<Project> => {
    try {
      addToast(`Analyzing ${file.name}...`, 'info');
      const inspection = await ZipImportService.inspectZip(file);
      if (!inspection.valid) {
        throw new Error(inspection.error || 'Failed to inspect ZIP archive');
      }

      const newProject = await ZipImportService.extractZipToProject(
        file,
        inspection.projectName,
        inspection.detectedType
      );

      const updated = { ...projects, [newProject.id]: newProject };
      saveProjectsToStorage(updated);
      setActiveProjectId(newProject.id);
      StorageService.setActiveProjectId(newProject.id);

      addToast(`Imported ${newProject.name} (${inspection.fileCount} files)`, 'success');
      return newProject;
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'ZIP import failed', 'error');
      throw err;
    }
  }, [projects, saveProjectsToStorage, addToast]);

  const restoreBackupJson = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.projects || typeof data.projects !== 'object') {
        throw new Error('Invalid backup file: missing projects map');
      }

      setProjects(data.projects);
      StorageService.saveProjects(data.projects);

      if (data.settings) {
        setSettings(data.settings);
        StorageService.saveSettings(data.settings);
      }

      if (Array.isArray(data.trash)) {
        setTrash(data.trash);
        StorageService.saveTrash(data.trash);
      }

      const firstProjId = Object.keys(data.projects)[0];
      if (firstProjId) {
        setActiveProjectId(firstProjId);
        StorageService.setActiveProjectId(firstProjId);
      }

      addToast(`Backup restored: ${Object.keys(data.projects).length} projects recovered`, 'success');
      return true;
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Backup restore failed', 'error');
      return false;
    }
  }, [addToast]);

  const exportBackupJson = useCallback(() => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      projects,
      settings,
      trash,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coding-ide-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Backup JSON exported successfully', 'success');
  }, [projects, settings, trash, addToast]);

  // File & Folder Actions
  const createFile = useCallback((name: string, parentFolderId: string | null, initialContent = ''): FileItem => {
    const trimmedName = name.trim();
    const parts = trimmedName.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

    const id = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const parentFolder = parentFolderId ? activeProject.folders[parentFolderId] : null;
    const path = parentFolder ? `${parentFolder.path}/${trimmedName}` : trimmedName;

    const newFile: FileItem = {
      id,
      name: trimmedName,
      path,
      extension: ext,
      content: initialContent,
      parentFolderId,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    const updatedFiles = { ...activeProject.files, [id]: newFile };
    const openIds = activeProject.openFileIds.includes(id)
      ? activeProject.openFileIds
      : [...activeProject.openFileIds, id];

    const updatedProj: Project = {
      ...activeProject,
      files: updatedFiles,
      activeFileId: id,
      openFileIds: openIds,
      modifiedAt: Date.now(),
    };

    saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
    addToast(`Created file: ${trimmedName}`, 'success');
    return newFile;
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const uploadAsset = useCallback(async (file: File, parentFolderId: string | null): Promise<FileItem> => {
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const isVideo = file.type.startsWith('video/');
    const isDoc = file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text');

    const assetType = isImage ? 'image' : isAudio ? 'audio' : isVideo ? 'video' : isDoc ? 'doc' : 'other';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const id = 'asset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        const parentFolder = parentFolderId ? activeProject.folders[parentFolderId] : null;
        const path = parentFolder ? `${parentFolder.path}/${file.name}` : file.name;
        const parts = file.name.split('.');
        const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';

        const newAssetFile: FileItem = {
          id,
          name: file.name,
          path,
          extension: ext,
          content: '',
          parentFolderId,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          size: file.size,
          isAsset: true,
          assetType,
          assetDataUrl: dataUrl,
        };

        const updatedFiles = { ...activeProject.files, [id]: newAssetFile };
        const updatedProj: Project = {
          ...activeProject,
          files: updatedFiles,
          modifiedAt: Date.now(),
        };

        saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
        addToast(`Uploaded asset: ${file.name}`, 'success');
        resolve(newAssetFile);
      };
      reader.onerror = () => {
        addToast(`Failed to upload ${file.name}`, 'error');
        reject(new Error('Failed to read asset file'));
      };
      reader.readAsDataURL(file);
    });
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const createFolder = useCallback((name: string, parentFolderId: string | null): FolderItem => {
    const trimmedName = name.trim();
    const id = 'folder-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const parentFolder = parentFolderId ? activeProject.folders[parentFolderId] : null;
    const path = parentFolder ? `${parentFolder.path}/${trimmedName}` : trimmedName;

    const newFolder: FolderItem = {
      id,
      name: trimmedName,
      path,
      parentFolderId,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      isOpen: true,
    };

    const updatedFolders = { ...activeProject.folders, [id]: newFolder };
    const updatedProj: Project = {
      ...activeProject,
      folders: updatedFolders,
      modifiedAt: Date.now(),
    };

    saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
    addToast(`Created folder: ${trimmedName}`, 'success');
    return newFolder;
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const toggleFolder = useCallback((folderId: string) => {
    const f = activeProject.folders[folderId];
    if (!f) return;
    const updatedFolders = {
      ...activeProject.folders,
      [folderId]: { ...f, isOpen: !f.isOpen },
    };
    const updatedProj: Project = {
      ...activeProject,
      folders: updatedFolders,
    };
    saveProjectsToStorage({ ...projects, [activeProject.id]: updatedProj });
  }, [activeProject, projects, saveProjectsToStorage]);

  const renameItem = useCallback((id: string, type: 'file' | 'folder', newName: string): boolean => {
    const cleanName = newName.trim();
    if (!cleanName) return false;

    if (type === 'file') {
      const file = activeProject.files[id];
      if (!file) return false;
      const parts = cleanName.split('.');
      const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : '';
      const updatedFiles = {
        ...activeProject.files,
        [id]: {
          ...file,
          name: cleanName,
          extension: ext,
          modifiedAt: Date.now(),
        },
      };
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: { ...activeProject, files: updatedFiles, modifiedAt: Date.now() },
      });
      addToast(`Renamed to ${cleanName}`, 'success');
      return true;
    } else {
      const folder = activeProject.folders[id];
      if (!folder) return false;
      const updatedFolders = {
        ...activeProject.folders,
        [id]: {
          ...folder,
          name: cleanName,
          modifiedAt: Date.now(),
        },
      };
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: { ...activeProject, folders: updatedFolders, modifiedAt: Date.now() },
      });
      addToast(`Renamed folder to ${cleanName}`, 'success');
      return true;
    }
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  // Safe delete with Trash support
  const deleteItem = useCallback((id: string, type: 'file' | 'folder') => {
    const trashId = 'trash-' + Date.now();

    if (type === 'file') {
      const file = activeProject.files[id];
      if (!file) return;

      const updatedFiles = { ...activeProject.files };
      delete updatedFiles[id];

      const openIds = activeProject.openFileIds.filter(fId => fId !== id);
      const nextActiveId = activeProject.activeFileId === id
        ? openIds[0] || Object.keys(updatedFiles)[0] || null
        : activeProject.activeFileId;

      const trashItem: TrashItem = {
        id: trashId,
        projectId: activeProject.id,
        type: 'file',
        name: file.name,
        originalParentId: file.parentFolderId,
        deletedAt: Date.now(),
        fileData: file,
      };

      setTrash(prev => [trashItem, ...prev]);
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: {
          ...activeProject,
          files: updatedFiles,
          openFileIds: openIds,
          activeFileId: nextActiveId,
          modifiedAt: Date.now(),
        },
      });
      addToast(`Moved ${file.name} to Trash`, 'info');
    } else {
      const folder = activeProject.folders[id];
      if (!folder) return;

      const subFolderIds = new Set<string>([id]);
      let added = true;
      while (added) {
        added = false;
        Object.values(activeProject.folders).forEach(f => {
          if (f.parentFolderId && subFolderIds.has(f.parentFolderId) && !subFolderIds.has(f.id)) {
            subFolderIds.add(f.id);
            added = true;
          }
        });
      }

      const nestedFiles: FileItem[] = [];
      const updatedFiles = { ...activeProject.files };
      Object.values(activeProject.files).forEach(f => {
        if (f.parentFolderId && subFolderIds.has(f.parentFolderId)) {
          nestedFiles.push(f);
          delete updatedFiles[f.id];
        }
      });

      const nestedFolders: FolderItem[] = [];
      const updatedFolders = { ...activeProject.folders };
      subFolderIds.forEach(fId => {
        if (updatedFolders[fId]) {
          nestedFolders.push(updatedFolders[fId]);
          delete updatedFolders[fId];
        }
      });

      const openIds = activeProject.openFileIds.filter(fId => !nestedFiles.some(nf => nf.id === fId));
      const nextActiveId = openIds.includes(activeProject.activeFileId || '')
        ? activeProject.activeFileId
        : openIds[0] || Object.keys(updatedFiles)[0] || null;

      const trashItem: TrashItem = {
        id: trashId,
        projectId: activeProject.id,
        type: 'folder',
        name: folder.name,
        originalParentId: folder.parentFolderId,
        deletedAt: Date.now(),
        folderData: folder,
        nestedFiles,
        nestedFolders,
      };

      setTrash(prev => [trashItem, ...prev]);
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: {
          ...activeProject,
          folders: updatedFolders,
          files: updatedFiles,
          openFileIds: openIds,
          activeFileId: nextActiveId,
          modifiedAt: Date.now(),
        },
      });
      addToast(`Moved folder ${folder.name} to Trash`, 'info');
    }
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const restoreTrashItem = useCallback((trashId: string) => {
    const item = trash.find(t => t.id === trashId);
    if (!item) return;

    const proj = projects[item.projectId] || activeProject;

    if (item.type === 'file' && item.fileData) {
      const restoredFiles = { ...proj.files, [item.fileData.id]: item.fileData };
      const updatedProj: Project = { ...proj, files: restoredFiles, modifiedAt: Date.now() };
      saveProjectsToStorage({ ...projects, [proj.id]: updatedProj });
    } else if (item.type === 'folder' && item.folderData) {
      const restoredFolders = { ...proj.folders, [item.folderData.id]: item.folderData };
      item.nestedFolders?.forEach(nf => {
        restoredFolders[nf.id] = nf;
      });
      const restoredFiles = { ...proj.files };
      item.nestedFiles?.forEach(nf => {
        restoredFiles[nf.id] = nf;
      });
      const updatedProj: Project = {
        ...proj,
        folders: restoredFolders,
        files: restoredFiles,
        modifiedAt: Date.now(),
      };
      saveProjectsToStorage({ ...projects, [proj.id]: updatedProj });
    }

    setTrash(prev => prev.filter(t => t.id !== trashId));
    addToast(`Restored ${item.name}`, 'success');
  }, [trash, projects, activeProject, saveProjectsToStorage, addToast]);

  const emptyTrash = useCallback(() => {
    setTrash([]);
    StorageService.saveTrash([]);
    addToast('Trash emptied permanently', 'info');
  }, [addToast]);

  const copyItem = useCallback((id: string, type: 'file' | 'folder', op: 'copy' | 'cut') => {
    if (type === 'file') {
      const file = activeProject.files[id];
      if (!file) return;
      setClipboard({ type: 'file', operation: op, sourceFile: file });
      addToast(op === 'cut' ? `Cut file: ${file.name}` : `File copied: ${file.name}`, 'info');
    } else {
      const folder = activeProject.folders[id];
      if (!folder) return;
      setClipboard({ type: 'folder', operation: op, sourceFolder: folder });
      addToast(op === 'cut' ? `Cut folder: ${folder.name}` : `Folder copied: ${folder.name}`, 'info');
    }
  }, [activeProject, addToast]);

  const pasteItem = useCallback((targetFolderId: string | null) => {
    if (!clipboard) {
      addToast('Clipboard is empty', 'info');
      return;
    }

    if (clipboard.type === 'file' && clipboard.sourceFile) {
      const src = clipboard.sourceFile;
      const newId = clipboard.operation === 'cut' ? src.id : 'file-' + Date.now();
      const newName = clipboard.operation === 'copy' ? `Copy_of_${src.name}` : src.name;

      const pastedFile: FileItem = {
        ...src,
        id: newId,
        name: newName,
        parentFolderId: targetFolderId,
        modifiedAt: Date.now(),
      };

      const updatedFiles = { ...activeProject.files, [newId]: pastedFile };
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: { ...activeProject, files: updatedFiles, modifiedAt: Date.now() },
      });

      if (clipboard.operation === 'cut') setClipboard(null);
      addToast(`Pasted ${pastedFile.name}`, 'success');
    } else if (clipboard.type === 'folder' && clipboard.sourceFolder) {
      const src = clipboard.sourceFolder;
      const newId = clipboard.operation === 'cut' ? src.id : 'folder-' + Date.now();
      const newName = clipboard.operation === 'copy' ? `Copy_of_${src.name}` : src.name;

      const pastedFolder: FolderItem = {
        ...src,
        id: newId,
        name: newName,
        parentFolderId: targetFolderId,
        modifiedAt: Date.now(),
      };

      const updatedFolders = { ...activeProject.folders, [newId]: pastedFolder };
      saveProjectsToStorage({
        ...projects,
        [activeProject.id]: { ...activeProject, folders: updatedFolders, modifiedAt: Date.now() },
      });

      if (clipboard.operation === 'cut') setClipboard(null);
      addToast(`Pasted folder ${pastedFolder.name}`, 'success');
    }
  }, [clipboard, activeProject, projects, saveProjectsToStorage, addToast]);

  const duplicateFile = useCallback((fileId: string) => {
    const src = activeProject.files[fileId];
    if (!src) return;

    const parts = src.name.split('.');
    const ext = parts.length > 1 ? parts.pop() : '';
    const base = parts.join('.');
    const newName = `${base}_copy.${ext}`;
    const newId = 'file-' + Date.now();

    const duplicated: FileItem = {
      ...src,
      id: newId,
      name: newName,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };

    const updatedFiles = { ...activeProject.files, [newId]: duplicated };
    saveProjectsToStorage({
      ...projects,
      [activeProject.id]: { ...activeProject, files: updatedFiles, modifiedAt: Date.now() },
    });
    addToast(`Duplicated: ${newName}`, 'success');
  }, [activeProject, projects, saveProjectsToStorage, addToast]);

  const downloadFile = useCallback((fileId: string) => {
    const f = activeProject.files[fileId];
    if (!f) return;
    ExportService.downloadFile(f);
    addToast(`Downloaded ${f.name}`, 'success');
  }, [activeProject, addToast]);

  const downloadFolder = useCallback(async (folderId: string) => {
    const f = activeProject.folders[folderId];
    if (!f) return;
    try {
      addToast(`Archiving folder ${f.name}...`, 'info');
      await ExportService.downloadFolderZip(f, activeProject);
      addToast(`Downloaded ${f.name}.zip`, 'success');
    } catch {
      addToast('Folder download failed', 'error');
    }
  }, [activeProject, addToast]);

  const shareFile = useCallback((fileId: string) => {
    const f = activeProject.files[fileId];
    if (!f) return;
    if (navigator.share) {
      navigator.share({
        title: f.name,
        text: f.content,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(f.content || '');
      addToast(`Copied ${f.name} code to clipboard`, 'success');
    }
  }, [activeProject, addToast]);

  // Editor Actions
  const openFile = useCallback((fileId: string) => {
    if (!activeProject.files[fileId]) return;

    const openIds = activeProject.openFileIds.includes(fileId)
      ? activeProject.openFileIds
      : [...activeProject.openFileIds, fileId];

    const updated: Project = {
      ...activeProject,
      activeFileId: fileId,
      openFileIds: openIds,
    };

    saveProjectsToStorage({ ...projects, [activeProject.id]: updated });
  }, [activeProject, projects, saveProjectsToStorage]);

  const closeFile = useCallback((fileId: string) => {
    const remainingOpenIds = activeProject.openFileIds.filter(id => id !== fileId);
    let nextActiveId = activeProject.activeFileId;

    if (activeProject.activeFileId === fileId) {
      nextActiveId = remainingOpenIds[remainingOpenIds.length - 1] || null;
    }

    const updated: Project = {
      ...activeProject,
      activeFileId: nextActiveId,
      openFileIds: remainingOpenIds,
    };

    saveProjectsToStorage({ ...projects, [activeProject.id]: updated });
  }, [activeProject, projects, saveProjectsToStorage]);

  return (
    <IDEContext.Provider
      value={{
        projects,
        activeProject,
        activeFile,
        openFiles,
        trash,
        settings,
        themeColors,
        clipboard,
        saveStatus,
        toasts,
        activeDiagnostics,
        projectSymbols,
        isOnline,
        toggleNetworkOffline,
        runProjectCheck,
        applyQuickFix,
        formatActiveFile,
        formatSelection,
        executeNLPlan,
        buildRunState,
        buildHistory,
        runBuild,
        cancelBuild,
        downloadBuildArtifact,
        deleteBuildArtifact,
        cleanProjectBuildCache,
        clearBuildHistory,
        createProject,
        importProjectFromZip,
        openProject,
        deleteProject,
        duplicateProject,
        renameProject,
        updateProjectConfig,
        exportProjectZip,
        exportProjectApk,
        exportProjectAab,
        shareProject,
        restoreBackupJson,
        exportBackupJson,
        createFile,
        uploadAsset,
        createFolder,
        renameItem,
        deleteItem,
        restoreTrashItem,
        emptyTrash,
        copyItem,
        pasteItem,
        duplicateFile,
        downloadFile,
        downloadFolder,
        shareFile,
        openFile,
        closeFile,
        updateFileContent,
        saveActiveFile,
        toggleFolder,
        updateSettings,
        switchTheme,
        setCustomBgColor,
        toggleDarkLightQuick,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </IDEContext.Provider>
  );
};

export const useIDE = () => {
  const context = useContext(IDEContext);
  if (!context) {
    throw new Error('useIDE must be used within an IDEProvider');
  }
  return context;
};
