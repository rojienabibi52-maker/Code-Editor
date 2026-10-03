import React, { useState, useMemo } from 'react';
import {
  Search,
  FilePlus,
  FolderPlus,
  Trash2,
  Upload,
  FolderTree,
  ChevronDown,
  ChevronUp,
  X,
  Settings,
  Download,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { FileTreeNode } from './FileTreeNode';
import { NewItemModal } from './NewItemModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { TrashModal } from './TrashModal';
import { AssetViewerModal } from './AssetViewerModal';
import { Button3D } from '../common/Button3D';
import { FileItem } from '../../types/project';

interface ProjectExplorerProps {
  onSelectFileToEdit?: (fileId: string) => void;
  onOpenAppConfig?: () => void;
}

export const ProjectExplorer: React.FC<ProjectExplorerProps> = ({
  onSelectFileToEdit,
  onOpenAppConfig,
}) => {
  const {
    activeProject,
    openFile,
    createFile,
    uploadAsset,
    createFolder,
    renameItem,
    deleteItem,
    exportProjectApk,
    trash,
    themeColors,
    addToast,
  } = useIDE();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<'file' | 'folder' | null>(null);
  const [targetParentFolderId, setTargetParentFolderId] = useState<string | null>(null);

  // Rename Dialog State
  const [renameState, setRenameState] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Delete Confirm State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);

  // Trash Modal State
  const [showTrashModal, setShowTrashModal] = useState(false);

  // Asset Viewer State
  const [viewingAsset, setViewingAsset] = useState<FileItem | null>(null);

  // File upload input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter root items
  const rootFolders = useMemo(() => {
    return Object.values(activeProject.folders)
      .filter(f => f.parentFolderId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProject.folders]);

  const rootFiles = useMemo(() => {
    return Object.values(activeProject.files)
      .filter(f => f.parentFolderId === null)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeProject.files]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return Object.values(activeProject.files).filter(
      f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
    );
  }, [activeProject.files, searchQuery]);

  const handleSelectFile = (fileId: string) => {
    openFile(fileId);
    if (onSelectFileToEdit) {
      onSelectFileToEdit(fileId);
    }
  };

  const handleOpenNewFileModal = (parentFolderId: string | null = null) => {
    setTargetParentFolderId(parentFolderId);
    setModalType('file');
  };

  const handleOpenNewFolderModal = (parentFolderId: string | null = null) => {
    setTargetParentFolderId(parentFolderId);
    setModalType('folder');
  };

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    // Ensure assets folder exists
    let assetsFolder = Object.values(activeProject.folders).find(f => f.name === 'assets' && f.parentFolderId === null);
    if (!assetsFolder) {
      assetsFolder = createFolder('assets', null);
    }

    Array.from(uploadedFiles).forEach(file => {
      uploadAsset(file, assetsFolder!.id);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      className="flex flex-col h-full border-r select-none overflow-hidden"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
    >
      {/* Explorer Header */}
      <div className="p-3 border-b shrink-0 space-y-2.5" style={{ borderColor: themeColors.border }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-blue-400" />
            <span className="font-bold text-xs uppercase tracking-wider text-neutral-300">
              Explorer
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
              {Object.keys(activeProject.files).length} files
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenNewFileModal(null)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="New File at Root"
            >
              <FilePlus size={15} />
            </button>
            <button
              onClick={() => handleOpenNewFolderModal(null)}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="New Folder at Root"
            >
              <FolderPlus size={15} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Upload Asset"
            >
              <Upload size={15} />
            </button>
            <button
              onClick={() => exportProjectApk()}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all shrink-0"
              title="Generate APK directly into Project Files & Download"
            >
              <Download size={13} />
              <span>APK</span>
            </button>
            {onOpenAppConfig && (
              <button
                onClick={onOpenAppConfig}
                className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-blue-400 transition-colors"
                title="⚙️ App Configuration"
              >
                <Settings size={15} />
              </button>
            )}
            <button
              onClick={() => setShowTrashModal(true)}
              className="relative p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
              title="Trash Bin"
            >
              <Trash2 size={15} />
              {trash.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-neutral-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Hidden File Input for Assets */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAssetUpload}
        className="hidden"
        multiple
      />

      {/* Explorer Tree Body */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {searchResults ? (
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No matching files found.
              </div>
            ) : (
              searchResults.map(f => (
                <div
                  key={f.id}
                  onClick={() => handleSelectFile(f.id)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 cursor-pointer text-xs transition-colors"
                >
                  <span className="text-neutral-200 font-medium truncate">{f.name}</span>
                  <span className="text-[10px] text-neutral-500 truncate ml-2">{f.path}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div>
            {/* Project Root Label */}
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
              <span className="truncate">{activeProject.name}</span>
              <span className="text-[10px] uppercase text-neutral-500">{activeProject.type}</span>
            </div>

            {/* Root Folders */}
            {rootFolders.map(folder => (
              <FileTreeNode
                key={folder.id}
                itemId={folder.id}
                itemType="folder"
                level={0}
                onSelectFile={handleSelectFile}
                onRequestRename={(id, type, name) => {
                  setRenameState({ id, type, name });
                  setRenameInput(name);
                }}
                onRequestNewFile={handleOpenNewFileModal}
                onRequestNewFolder={handleOpenNewFolderModal}
                onRequestDelete={(id, type, name) => setDeleteTarget({ id, type, name })}
                onOpenAssetViewer={file => setViewingAsset(file)}
              />
            ))}

            {/* Root Files */}
            {rootFiles.map(file => (
              <FileTreeNode
                key={file.id}
                itemId={file.id}
                itemType="file"
                level={0}
                onSelectFile={handleSelectFile}
                onRequestRename={(id, type, name) => {
                  setRenameState({ id, type, name });
                  setRenameInput(name);
                }}
                onRequestNewFile={handleOpenNewFileModal}
                onRequestNewFolder={handleOpenNewFolderModal}
                onRequestDelete={(id, type, name) => setDeleteTarget({ id, type, name })}
                onOpenAssetViewer={file => setViewingAsset(file)}
              />
            ))}
          </div>
        )}
      </div>

      {/* New File / Folder Modal */}
      {modalType && (
        <NewItemModal
          isOpen={true}
          type={modalType}
          parentFolderName={
            targetParentFolderId ? activeProject.folders[targetParentFolderId]?.name : undefined
          }
          onClose={() => setModalType(null)}
          onSubmit={(name, content) => {
            if (modalType === 'file') {
              const newFile = createFile(name, targetParentFolderId, content);
              handleSelectFile(newFile.id);
            } else {
              createFolder(name, targetParentFolderId);
            }
          }}
        />
      )}

      {/* Rename Dialog */}
      {renameState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-100">
              Rename {renameState.type === 'file' ? 'File' : 'Folder'}
            </h3>
            <input
              type="text"
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
            />
            <div className="flex items-center justify-end gap-2">
              <Button3D variant="surface" size="sm" onClick={() => setRenameState(null)}>
                Cancel
              </Button3D>
              <Button3D
                variant="primary"
                size="sm"
                onClick={() => {
                  if (renameInput.trim()) {
                    renameItem(renameState.id, renameState.type, renameInput);
                    setRenameState(null);
                  }
                }}
              >
                Save
              </Button3D>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Safe Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={true}
          title={`Delete ${deleteTarget.type === 'file' ? 'File' : 'Folder'}`}
          itemName={deleteTarget.name}
          itemType={deleteTarget.type}
          onConfirm={() => deleteItem(deleteTarget.id, deleteTarget.type)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Trash Modal */}
      <TrashModal isOpen={showTrashModal} onClose={() => setShowTrashModal(false)} />

      {/* Asset Viewer Modal */}
      <AssetViewerModal file={viewingAsset} onClose={() => setViewingAsset(null)} />
    </div>
  );
};
