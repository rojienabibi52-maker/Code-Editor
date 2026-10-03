import React from 'react';
import { Home, FolderGit2, Plus, Code2, Settings } from 'lucide-react';
import { useIDE } from '../../context/IDEContext';

interface BottomNavProps {
  activeTab: 'home' | 'projects' | 'create' | 'editor' | 'settings';
  onChangeTab: (tab: 'home' | 'projects' | 'create' | 'editor' | 'settings') => void;
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenCreateModal,
}) => {
  const { themeColors, activeFile } = useIDE();

  return (
    <nav
      className="md:hidden h-14 border-t grid grid-cols-5 items-stretch px-1 z-40 shrink-0 select-none touch-manipulation w-full max-w-full overflow-hidden"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
    >
      {/* 1. Home / Project Explorer */}
      <button
        type="button"
        onClick={() => onChangeTab('home')}
        className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'home' ? 'text-blue-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="Home Explorer"
      >
        <Home size={18} />
        <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
      </button>

      {/* 2. Projects */}
      <button
        type="button"
        onClick={() => onChangeTab('projects')}
        className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'projects' ? 'text-blue-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="Projects List"
      >
        <FolderGit2 size={18} />
        <span className="text-[10px] mt-0.5 tracking-tight">Projects</span>
      </button>

      {/* 3. Center Create Plus Button (Isolated hitbox, no overlapping neighbor bounds) */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="w-10 h-10 rounded-full bg-gradient-to-b from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-lg border border-blue-300/40 active:scale-90 transition-transform cursor-pointer"
          style={{
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
          title="Create New Project or File"
          aria-label="Create New Project"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* 4. Code Editor */}
      <button
        type="button"
        onClick={() => onChangeTab('editor')}
        className={`flex flex-col items-center justify-center py-1 transition-colors relative active:scale-95 ${
          activeTab === 'editor' ? 'text-blue-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="Code Editor"
      >
        <Code2 size={18} />
        <span className="text-[10px] mt-0.5 tracking-tight">Editor</span>
        {activeFile && (
          <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-500" />
        )}
      </button>

      {/* 5. Settings */}
      <button
        type="button"
        onClick={() => onChangeTab('settings')}
        className={`flex flex-col items-center justify-center py-1 transition-colors active:scale-95 ${
          activeTab === 'settings' ? 'text-blue-500 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
        aria-label="IDE Settings"
      >
        <Settings size={18} />
        <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
      </button>
    </nav>
  );
};
