import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  FileSpreadsheet,
  Image,
  MoreVertical,
  Circle,
  File,
  Package,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types/project';
import { useIDE } from '../../context/IDEContext';
import { FileActionMenu } from './FileActionMenu';

interface FileTreeNodeProps {
  itemId: string;
  itemType: 'file' | 'folder';
  level: number;
  onSelectFile: (fileId: string) => void;
  onRequestRename: (id: string, type: 'file' | 'folder', currentName: string) => void;
  onRequestNewFile: (parentFolderId: string | null) => void;
  onRequestNewFolder: (parentFolderId: string | null) => void;
  onRequestDelete: (id: string, type: 'file' | 'folder', name: string) => void;
  onOpenAssetViewer: (file: FileItem) => void;
}

// Map extensions to tailored vector icons & colors
function getFileIcon(ext: string, isAsset?: boolean) {
  if (ext === 'apk') {
    return <Package size={15} className="text-emerald-400 shrink-0" />;
  }
  if (ext === 'aab') {
    return <Package size={15} className="text-blue-400 shrink-0" />;
  }
  if (isAsset || ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
    return <Image size={15} className="text-pink-400 shrink-0" />;
  }

  switch (ext) {
    case 'kt':
    case 'kts':
      return <FileCode2 size={15} className="text-violet-400 shrink-0" />;
    case 'java':
      return <FileCode2 size={15} className="text-amber-500 shrink-0" />;
    case 'xml':
      return <FileSpreadsheet size={15} className="text-orange-400 shrink-0" />;
    case 'gradle':
      return <FileCode2 size={15} className="text-sky-400 shrink-0" />;
    case 'ts':
    case 'tsx':
      return <FileCode2 size={15} className="text-blue-400 shrink-0" />;
    case 'js':
    case 'jsx':
      return <FileCode2 size={15} className="text-yellow-400 shrink-0" />;
    case 'html':
      return <FileCode2 size={15} className="text-red-400 shrink-0" />;
    case 'css':
      return <FileCode2 size={15} className="text-cyan-400 shrink-0" />;
    case 'json':
      return <FileJson size={15} className="text-emerald-400 shrink-0" />;
    case 'dart':
      return <FileCode2 size={15} className="text-teal-400 shrink-0" />;
    case 'md':
      return <FileText size={15} className="text-neutral-400 shrink-0" />;
    default:
      return <File size={15} className="text-neutral-400 shrink-0" />;
  }
}

export const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  itemId,
  itemType,
  level,
  onSelectFile,
  onRequestRename,
  onRequestNewFile,
  onRequestNewFolder,
  onRequestDelete,
  onOpenAssetViewer,
}) => {
  const { activeProject, activeFile, toggleFolder, themeColors } = useIDE();
  const [showMenu, setShowMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  if (itemType === 'file') {
    const file = activeProject.files[itemId];
    if (!file) return null;

    const isActive = activeFile?.id === file.id;

    const handleMenuClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (buttonRef.current) {
        setMenuAnchor(buttonRef.current.getBoundingClientRect());
      }
      setShowMenu(true);
    };

    const handleTouchStart = () => {
      longPressTimerRef.current = setTimeout(() => {
        if (buttonRef.current) {
          setMenuAnchor(buttonRef.current.getBoundingClientRect());
        }
        setShowMenu(true);
      }, 500);
    };

    const handleTouchEnd = () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };

    const handleClick = () => {
      if (file.isAsset) {
        onOpenAssetViewer(file);
      } else {
        onSelectFile(file.id);
      }
    };

    return (
      <>
        <div
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-xs select-none ${
            isActive
              ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
              : 'text-neutral-300 hover:bg-white/5 active:bg-white/10'
          }`}
          style={{ paddingLeft: `${Math.max(8, level * 16 + 8)}px` }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0">{getFileIcon(file.extension, file.isAsset)}</span>
            <span className="truncate">{file.name}</span>
            {file.isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Modified" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              ref={buttonRef}
              onClick={handleMenuClick}
              className="p-1 rounded opacity-70 group-hover:opacity-100 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-opacity"
              title="Actions"
            >
              <MoreVertical size={13} />
            </button>
          </div>
        </div>

        {showMenu && (
          <FileActionMenu
            item={file}
            type="file"
            anchorRect={menuAnchor}
            onClose={() => setShowMenu(false)}
            onRename={() => onRequestRename(file.id, 'file', file.name)}
            onNewFile={() => onRequestNewFile(file.parentFolderId)}
            onNewFolder={() => onRequestNewFolder(file.parentFolderId)}
            onDelete={() => onRequestDelete(file.id, 'file', file.name)}
          />
        )}
      </>
    );
  }

  // Folder Node
  const folder = activeProject.folders[itemId];
  if (!folder) return null;

  const isOpen = !!folder.isOpen;

  // Find direct child folders
  const childFolders = Object.values(activeProject.folders)
    .filter(f => f.parentFolderId === folder.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Find direct child files
  const childFiles = Object.values(activeProject.files)
    .filter(f => f.parentFolderId === folder.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (buttonRef.current) {
      setMenuAnchor(buttonRef.current.getBoundingClientRect());
    }
    setShowMenu(true);
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (buttonRef.current) {
        setMenuAnchor(buttonRef.current.getBoundingClientRect());
      }
      setShowMenu(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
  };

  return (
    <div>
      <div
        onClick={() => toggleFolder(folder.id)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="group flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer text-neutral-300 hover:bg-white/5 active:bg-white/10 transition-colors text-xs select-none"
        style={{ paddingLeft: `${Math.max(8, level * 16 + 8)}px` }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-neutral-400 shrink-0">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="text-amber-400 shrink-0">
            {isOpen ? <FolderOpen size={16} /> : <Folder size={16} />}
          </span>
          <span className="truncate font-medium text-neutral-200">{folder.name}</span>
        </div>

        <button
          ref={buttonRef}
          onClick={handleMenuClick}
          className="p-1 rounded opacity-70 group-hover:opacity-100 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-opacity"
          title="Folder Actions"
        >
          <MoreVertical size={13} />
        </button>
      </div>

      {showMenu && (
        <FileActionMenu
          item={folder}
          type="folder"
          anchorRect={menuAnchor}
          onClose={() => setShowMenu(false)}
          onRename={() => onRequestRename(folder.id, 'folder', folder.name)}
          onNewFile={() => onRequestNewFile(folder.id)}
          onNewFolder={() => onRequestNewFolder(folder.id)}
          onDelete={() => onRequestDelete(folder.id, 'folder', folder.name)}
        />
      )}

      {/* Render children if folder is open */}
      {isOpen && (
        <div className="relative">
          {/* Subfolders */}
          {childFolders.map(cf => (
            <FileTreeNode
              key={cf.id}
              itemId={cf.id}
              itemType="folder"
              level={level + 1}
              onSelectFile={onSelectFile}
              onRequestRename={onRequestRename}
              onRequestNewFile={onRequestNewFile}
              onRequestNewFolder={onRequestNewFolder}
              onRequestDelete={onRequestDelete}
              onOpenAssetViewer={onOpenAssetViewer}
            />
          ))}

          {/* Subfiles */}
          {childFiles.map(cf => (
            <FileTreeNode
              key={cf.id}
              itemId={cf.id}
              itemType="file"
              level={level + 1}
              onSelectFile={onSelectFile}
              onRequestRename={onRequestRename}
              onRequestNewFile={onRequestNewFile}
              onRequestNewFolder={onRequestNewFolder}
              onRequestDelete={onRequestDelete}
              onOpenAssetViewer={onOpenAssetViewer}
            />
          ))}
        </div>
      )}
    </div>
  );
};
