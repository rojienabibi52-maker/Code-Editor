export type ProjectType =
  | 'android'
  | 'web'
  | 'react'
  | 'flutter'
  | 'app_design'
  | 'html_css_js'
  | 'figma'
  | 'empty';

export type AppOrientation = 'portrait' | 'landscape' | 'both';
export type VideoPreset = '9:16' | '16:9' | '1:1' | 'custom';

export interface AppConfig {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  logoAssetId?: string | null;
  logoDataUrl?: string | null;
  splashAssetId?: string | null;
  splashDataUrl?: string | null;
  splashBackground?: string;
  splashLogoPosition?: 'center' | 'top' | 'bottom';
  splashScale?: number;
  splashDurationMs?: number;
  orientation: AppOrientation;
  videoPreset: VideoPreset;
  customWidth?: number;
  customHeight?: number;
  minSdk: number;
  targetSdk: number;
  compileSdk: number;
  buildVariant: 'debug' | 'release';
  enableSplash: boolean;
  enableAutoSave: boolean;
  enableLivePreview: boolean;
  enableBuildValidation: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  extension: string;
  content: string;
  parentFolderId: string | null;
  createdAt: number;
  modifiedAt: number;
  isModified?: boolean;
  size?: number;
  isAsset?: boolean;
  assetType?: 'image' | 'audio' | 'video' | 'doc' | 'other';
  assetDataUrl?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentFolderId: string | null;
  createdAt: number;
  modifiedAt: number;
  isOpen?: boolean;
}

export interface TrashItem {
  id: string;
  projectId: string;
  type: 'file' | 'folder';
  name: string;
  originalParentId: string | null;
  deletedAt: number;
  fileData?: FileItem;
  folderData?: FolderItem;
  nestedFiles?: FileItem[];
  nestedFolders?: FolderItem[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  packageName?: string;
  version?: string;
  versionCode?: number;
  createdAt: number;
  modifiedAt: number;
  rootDirectory: string;
  files: Record<string, FileItem>;
  folders: Record<string, FolderItem>;
  activeFileId: string | null;
  openFileIds: string[];
  appConfig?: AppConfig;
}

export interface ClipboardItem {
  type: 'file' | 'folder' | 'code';
  operation: 'copy' | 'cut';
  sourceFile?: FileItem;
  sourceFolder?: FolderItem;
  nestedFiles?: FileItem[];
  nestedFolders?: FolderItem[];
  codeContent?: string;
}
