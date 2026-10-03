import JSZip from 'jszip';
import { Project, ProjectType, FileItem, FolderItem } from '../types/project';

export interface ZipValidationResult {
  valid: boolean;
  projectName: string;
  detectedType: ProjectType;
  fileCount: number;
  folderCount: number;
  filesList: string[];
  manifest?: any;
  error?: string;
}

export const ZipImportService = {
  // Validate and inspect a ZIP file before extracting
  async inspectZip(file: File): Promise<ZipValidationResult> {
    try {
      const zip = await JSZip.loadAsync(file);
      const filesList: string[] = [];
      let detectedType: ProjectType = 'android';
      let manifest: any = null;

      let fileCount = 0;
      let folderCount = 0;

      zip.forEach((relativePath, entry) => {
        // Prevent path traversal security vulnerability
        if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
          throw new Error('Unsafe path traversal detected in ZIP archive.');
        }

        filesList.push(relativePath);
        if (entry.dir) {
          folderCount++;
        } else {
          fileCount++;
        }

        // Check for project manifest or type signals
        if (relativePath.endsWith('.codingide.json')) {
          // Will parse later
        } else if (relativePath.endsWith('build.gradle.kts') || relativePath.endsWith('AndroidManifest.xml') || relativePath.endsWith('.kt')) {
          detectedType = 'android';
        } else if (relativePath.endsWith('package.json') && relativePath.includes('react')) {
          detectedType = 'react';
        } else if (relativePath.endsWith('pubspec.yaml')) {
          detectedType = 'flutter';
        } else if (relativePath.endsWith('index.html')) {
          detectedType = 'web';
        }
      });

      // Try reading .codingide.json if available
      const manifestEntry = zip.file('.codingide.json') || Object.values(zip.files).find(f => f.name.endsWith('.codingide.json'));
      if (manifestEntry) {
        try {
          const text = await manifestEntry.async('text');
          manifest = JSON.parse(text);
          if (manifest.type) detectedType = manifest.type;
        } catch {
          // ignore
        }
      }

      const defaultName = manifest?.name || file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '') || 'ImportedProject';

      return {
        valid: true,
        projectName: defaultName,
        detectedType,
        fileCount,
        folderCount,
        filesList,
        manifest,
      };
    } catch (err: any) {
      return {
        valid: false,
        projectName: 'Corrupt',
        detectedType: 'empty',
        fileCount: 0,
        folderCount: 0,
        filesList: [],
        error: err.message || 'Invalid or corrupted ZIP file',
      };
    }
  },

  // Extract ZIP into a real Project data structure
  async extractZipToProject(
    file: File,
    projectName: string,
    targetType?: ProjectType
  ): Promise<Project> {
    const zip = await JSZip.loadAsync(file);
    const projectId = 'proj-zip-' + Date.now();
    const now = Date.now();

    const folders: Record<string, FolderItem> = {};
    const files: Record<string, FileItem> = {};

    let detectedType: ProjectType = targetType || 'android';
    let packageName = 'com.codingide.imported';

    // Helper map of normalized path to folder ID
    const pathToFolderId: Record<string, string> = {};

    // First pass: identify and create folders
    const entries = Object.keys(zip.files);

    for (const rawPath of entries) {
      // Normalize path
      let cleanPath = rawPath.replace(/^[./\\]+/, '').replace(/[/\\]+$/, '');
      if (!cleanPath) continue;

      // Skip root folder if archive has single wrapper folder
      const segments = cleanPath.split(/[/\\]/);
      const isDir = zip.files[rawPath].dir;

      // Build folder hierarchy
      let accumulated = '';
      let parentId: string | null = null;

      const folderSegments = isDir ? segments : segments.slice(0, -1);

      for (let i = 0; i < folderSegments.length; i++) {
        const seg = folderSegments[i];
        accumulated = accumulated ? `${accumulated}/${seg}` : seg;

        if (!pathToFolderId[accumulated]) {
          const folderId = 'f-zip-' + Math.random().toString(36).substr(2, 6);
          pathToFolderId[accumulated] = folderId;

          folders[folderId] = {
            id: folderId,
            name: seg,
            path: accumulated,
            parentFolderId: parentId,
            createdAt: now,
            modifiedAt: now,
            isOpen: i < 2, // open first 2 levels
          };
        }
        parentId = pathToFolderId[accumulated];
      }

      // If it's a file, extract content
      if (!isDir) {
        const fileName = segments[segments.length - 1];
        if (fileName === '.codingide.json') continue; // internal manifest

        const fileParts = fileName.split('.');
        const ext = fileParts.length > 1 ? fileParts.pop()!.toLowerCase() : '';
        const isAsset = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'mp3', 'wav', 'mp4'].includes(ext);

        let content = '';
        let assetDataUrl: string | undefined;

        if (isAsset && ext !== 'svg') {
          // Read as base64
          const b64 = await zip.files[rawPath].async('base64');
          const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';
          assetDataUrl = `data:${mime};base64,${b64}`;
        } else {
          content = await zip.files[rawPath].async('text');
        }

        const fileId = 'file-zip-' + Math.random().toString(36).substr(2, 6);
        const parentFolderId = segments.length > 1 ? pathToFolderId[segments.slice(0, -1).join('/')] || null : null;

        files[fileId] = {
          id: fileId,
          name: fileName,
          path: cleanPath,
          extension: ext,
          content,
          parentFolderId,
          createdAt: now,
          modifiedAt: now,
          isAsset,
          assetDataUrl,
          size: content.length || (assetDataUrl ? assetDataUrl.length : 0),
        };

        // Check if AndroidManifest gives package
        if (fileName === 'AndroidManifest.xml' && content) {
          const pkgMatch = content.match(/package="([^"]+)"/);
          if (pkgMatch) packageName = pkgMatch[1];
        }
      }
    }

    const firstFileId = Object.keys(files)[0] || null;

    return {
      id: projectId,
      name: projectName.trim(),
      description: `Imported project archive (${Object.keys(files).length} files)`,
      type: detectedType,
      packageName,
      version: '1.0.0',
      createdAt: now,
      modifiedAt: now,
      rootDirectory: projectName.trim(),
      files,
      folders,
      activeFileId: firstFileId,
      openFileIds: firstFileId ? [firstFileId] : [],
    };
  },
};
