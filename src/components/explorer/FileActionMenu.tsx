import React, { useEffect, useRef } from 'react';
import {
  Edit2,
  FilePlus,
  FolderPlus,
  Copy,
  Scissors,
  ClipboardPaste,
  CopyPlus,
  Download,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types/project';
import { useIDE } from '../../context/IDEContext';

interface FileActionMenuProps {
  item: FileItem | FolderItem;
  type: 'file' | 'folder';
  anchorRect: DOMRect | null;
  onClose: () => void;
  onRename: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onDelete: () => void;
}

export const FileActionMenu: React.FC<FileActionMenuProps> = ({
  item,
  type,
  anchorRect,
  onClose,
  onRename,
  onNewFile,
  onNewFolder,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    copyItem,
    pasteItem,
    duplicateFile,
    downloadFile,
    downloadFolder,
    shareFile,
    clipboard,
    themeColors,
  } = useIDE();

  // Close on outside click
  useEffect(() => {
    const handleDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleDown);
    return () => window.removeEventListener('mousedown', handleDown);
  }, [onClose]);

  // Position calculation
  let top = 100;
  let left = 100;
  if (anchorRect) {
    top = Math.min(window.innerHeight - 340, Math.max(10, anchorRect.bottom + 4));
    left = Math.min(window.innerWidth - 220, Math.max(10, anchorRect.left - 80));
  }

  const handleCopy = () => {
    copyItem(item.id, type, 'copy');
    onClose();
  };

  const handleCut = () => {
    copyItem(item.id, type, 'cut');
    onClose();
  };

  const handlePaste = () => {
    const targetFolderId = type === 'folder' ? item.id : (item as FileItem).parentFolderId;
    pasteItem(targetFolderId);
    onClose();
  };

  const handleDuplicate = () => {
    if (type === 'file') {
      duplicateFile(item.id);
    }
    onClose();
  };

  const handleDownload = () => {
    if (type === 'file') {
      downloadFile(item.id);
    } else {
      downloadFolder(item.id);
    }
    onClose();
  };

  const handleShare = () => {
    if (type === 'file') {
      shareFile(item.id);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-52 py-1.5 rounded-xl border shadow-2xl backdrop-blur-md text-xs animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
        boxShadow: '0 15px 35px -5px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      <div className="px-3 py-1.5 border-b flex items-center justify-between text-neutral-400 font-semibold" style={{ borderColor: themeColors.border }}>
        <span className="truncate max-w-[140px] text-[11px] text-neutral-300">{item.name}</span>
        <button onClick={onClose} className="p-0.5 hover:text-white rounded">
          <X size={13} />
        </button>
      </div>

      <div className="py-1">
        <button
          onClick={() => {
            onRename();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Edit2 size={14} className="text-blue-400 shrink-0" />
          <span>Rename</span>
        </button>

        <button
          onClick={() => {
            onNewFile();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <FilePlus size={14} className="text-emerald-400 shrink-0" />
          <span>New File</span>
        </button>

        <button
          onClick={() => {
            onNewFolder();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <FolderPlus size={14} className="text-amber-400 shrink-0" />
          <span>New Folder</span>
        </button>

        <div className="my-1 border-t" style={{ borderColor: themeColors.border }} />

        <button
          onClick={handleCopy}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Copy size={14} className="text-neutral-400 shrink-0" />
          <span>Copy</span>
        </button>

        <button
          onClick={handleCut}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Scissors size={14} className="text-neutral-400 shrink-0" />
          <span>Cut</span>
        </button>

        <button
          onClick={handlePaste}
          disabled={!clipboard}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-40"
        >
          <ClipboardPaste size={14} className="text-neutral-400 shrink-0" />
          <span>Paste {clipboard ? `(${clipboard.operation})` : ''}</span>
        </button>

        {type === 'file' && (
          <button
            onClick={handleDuplicate}
            className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <CopyPlus size={14} className="text-neutral-400 shrink-0" />
            <span>Duplicate</span>
          </button>
        )}

        <div className="my-1 border-t" style={{ borderColor: themeColors.border }} />

        <button
          onClick={handleDownload}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Download size={14} className="text-sky-400 shrink-0" />
          <span>{type === 'file' ? 'Download' : 'Download Folder'}</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-neutral-200 hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <Share2 size={14} className="text-sky-400 shrink-0" />
          <span>Share</span>
        </button>

        <div className="my-1 border-t" style={{ borderColor: themeColors.border }} />

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-3 py-1.5 flex items-center gap-2.5 text-left text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors font-medium"
        >
          <Trash2 size={14} className="shrink-0" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
