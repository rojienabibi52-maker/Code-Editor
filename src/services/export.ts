import JSZip from 'jszip';
import { Project, FileItem, FolderItem } from '../types/project';
import { BuildEngineService } from './buildEngine';

export const ExportService = {
  // Helper to build full relative path for file
  getFilePath(file: FileItem, folders: Record<string, FolderItem>): string {
    const parts: string[] = [file.name];
    let curr = file.parentFolderId ? folders[file.parentFolderId] : null;
    while (curr) {
      parts.unshift(curr.name);
      curr = curr.parentFolderId ? folders[curr.parentFolderId] : null;
    }
    return parts.join('/');
  },

  // Helper to build full path for folder
  getFolderPath(folder: FolderItem, folders: Record<string, FolderItem>): string {
    const parts: string[] = [folder.name];
    let curr = folder.parentFolderId ? folders[folder.parentFolderId] : null;
    while (curr) {
      parts.unshift(curr.name);
      curr = curr.parentFolderId ? folders[curr.parentFolderId] : null;
    }
    return parts.join('/');
  },

  // Export full project as a valid ZIP
  async exportProjectZip(project: Project): Promise<Blob> {
    const zip = new JSZip();
    const root = zip.folder(project.name) || zip;

    // Add empty folders
    Object.values(project.folders).forEach(f => {
      const p = this.getFolderPath(f, project.folders);
      root.folder(p);
    });

    // Add files
    Object.values(project.files).forEach(f => {
      const p = this.getFilePath(f, project.folders);
      if (f.isAsset && f.assetDataUrl) {
        // Base64 asset
        const commaIdx = f.assetDataUrl.indexOf(',');
        const b64 = commaIdx > -1 ? f.assetDataUrl.slice(commaIdx + 1) : f.assetDataUrl;
        root.file(p, b64, { base64: true });
      } else {
        root.file(p, f.content || '');
      }
    });

    // Add project manifest
    const manifest = {
      name: project.name,
      type: project.type,
      packageName: project.packageName,
      version: project.version,
      exportedAt: new Date().toISOString(),
      generator: 'CODING IDE Phase 1',
    };
    root.file('.codingide.json', JSON.stringify(manifest, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  },

  // Download a single file
  downloadFile(file: FileItem) {
    if (file.isAsset && file.assetDataUrl) {
      if (file.assetDataUrl.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = file.assetDataUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
      try {
        const commaIdx = file.assetDataUrl.indexOf(',');
        if (commaIdx > -1) {
          const mime = file.assetDataUrl.substring(0, commaIdx).match(/:(.*?);/)?.[1] || 'application/octet-stream';
          const bstr = atob(file.assetDataUrl.substring(commaIdx + 1));
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn('Fallback data URL download:', err);
      }
      const a = document.createElement('a');
      a.href = file.assetDataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const blob = new Blob([file.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Download folder subtree as a ZIP
  async downloadFolderZip(folder: FolderItem, project: Project): Promise<void> {
    const zip = new JSZip();
    const folderRoot = zip.folder(folder.name) || zip;

    // Find all subfolder IDs
    const subFolderIds = new Set<string>([folder.id]);
    let added = true;
    while (added) {
      added = false;
      Object.values(project.folders).forEach(f => {
        if (f.parentFolderId && subFolderIds.has(f.parentFolderId) && !subFolderIds.has(f.id)) {
          subFolderIds.add(f.id);
          added = true;
        }
      });
    }

    // Add all files belonging to these folders
    Object.values(project.files).forEach(f => {
      if (f.parentFolderId && subFolderIds.has(f.parentFolderId)) {
        // compute relative path under this folder
        const parts: string[] = [f.name];
        let curr = project.folders[f.parentFolderId];
        while (curr && curr.id !== folder.id) {
          parts.unshift(curr.name);
          curr = curr.parentFolderId ? project.folders[curr.parentFolderId] : (undefined as any);
        }
        const relPath = parts.join('/');
        if (f.isAsset && f.assetDataUrl) {
          const commaIdx = f.assetDataUrl.indexOf(',');
          const b64 = commaIdx > -1 ? f.assetDataUrl.slice(commaIdx + 1) : f.assetDataUrl;
          folderRoot.file(relPath, b64, { base64: true });
        } else {
          folderRoot.file(relPath, f.content || '');
        }
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folder.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Trigger project ZIP download
  async downloadProjectZip(project: Project): Promise<void> {
    const blob = await this.exportProjectZip(project);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export & Download project Android APK directly
  async downloadProjectApk(project: Project, variant: 'debug' | 'release' = 'release'): Promise<{ success: boolean; blob: Blob; fileName: string; dataUrl: string; artifact?: any }> {
    // Build fresh APK using BuildEngineService to ensure latest code is bundled
    const result = await BuildEngineService.executeBuild(project, variant, 'apk', () => {});
    if (result.success && result.blob) {
      const fileName = result.artifact?.fileName || `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${variant}.apk`;
      
      // Convert blob to Data URL
      let dataUrl = '';
      try {
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(result.blob!);
        });
      } catch {
        dataUrl = URL.createObjectURL(result.blob);
      }

      // Trigger download
      const downloadTarget = dataUrl || URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = downloadTarget;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return {
        success: true,
        blob: result.blob,
        fileName,
        dataUrl: dataUrl || downloadTarget,
        artifact: result.artifact,
      };
    } else {
      throw new Error(result.failure?.error || 'Failed to build APK');
    }
  },

  // Export & Download project Android App Bundle (AAB) directly
  async downloadProjectAab(project: Project, variant: 'debug' | 'release' = 'release'): Promise<{ success: boolean; blob: Blob; fileName: string; dataUrl: string; artifact?: any }> {
    const result = await BuildEngineService.executeBuild(project, variant, 'aab', () => {});
    if (result.success && result.blob) {
      const fileName = result.artifact?.fileName || `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${variant}.aab`;
      
      let dataUrl = '';
      try {
        const reader = new FileReader();
        dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(result.blob!);
        });
      } catch {
        dataUrl = URL.createObjectURL(result.blob);
      }

      const downloadTarget = dataUrl || URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = downloadTarget;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return {
        success: true,
        blob: result.blob,
        fileName,
        dataUrl: dataUrl || downloadTarget,
        artifact: result.artifact,
      };
    } else {
      throw new Error(result.failure?.error || 'Failed to build AAB');
    }
  },

  // Share Project
  async shareProject(project: Project): Promise<{ shared: boolean; method: string }> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CODING IDE: ${project.name}`,
          text: `Project: ${project.name} (${project.type}). Created with CODING IDE.`,
          url: window.location.href,
        });
        return { shared: true, method: 'native' };
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          // fallback to clipboard or download
        }
      }
    }

    // Fallback: copy shareable text / JSON link
    const text = `Project: ${project.name} | Type: ${project.type} | Files: ${Object.keys(project.files).length}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return { shared: true, method: 'clipboard' };
    }

    return { shared: false, method: 'none' };
  },
};
