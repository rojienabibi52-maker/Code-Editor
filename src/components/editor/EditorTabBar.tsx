import React from 'react';
import { X, Plus, FileCode2 } from 'lucide-react';
import { useIDE } from '../../context/IDEContext';

interface EditorTabBarProps {
  onNewFileClick: () => void;
}

export const EditorTabBar: React.FC<EditorTabBarProps> = ({ onNewFileClick }) => {
  const { openFiles, activeFile, openFile, closeFile, themeColors } = useIDE();

  if (openFiles.length === 0) return null;

  return (
    <div
      className="h-10 border-b flex items-center overflow-x-auto no-scrollbar shrink-0 select-none px-2 gap-1.5"
      style={{
        backgroundColor: themeColors.editorGutterBg,
        borderColor: themeColors.border,
      }}
    >
      {openFiles.map(file => {
        const isActive = activeFile?.id === file.id;

        return (
          <div
            key={file.id}
            onClick={() => openFile(file.id)}
            className={`group h-8 px-3 rounded-t-lg flex items-center gap-2 cursor-pointer text-xs transition-all shrink-0 border-t border-x ${
              isActive
                ? 'bg-neutral-900 border-neutral-700 text-blue-400 font-semibold shadow-sm'
                : 'bg-neutral-950/60 border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
            }`}
            style={{
              backgroundColor: isActive ? themeColors.editorBg : undefined,
              borderColor: isActive ? themeColors.border : 'transparent',
              color: isActive ? themeColors.accent : undefined,
            }}
          >
            <FileCode2 size={13} className="shrink-0 opacity-80" />
            <span className="truncate max-w-[130px]">{file.name}</span>
            {file.isModified && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            )}
            <button
              onClick={e => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="p-0.5 rounded hover:bg-white/10 text-neutral-400 hover:text-white transition-opacity"
              title="Close Tab"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      <button
        onClick={onNewFileClick}
        className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1 shrink-0"
        title="New File"
      >
        <Plus size={15} />
      </button>
    </div>
  );
};
