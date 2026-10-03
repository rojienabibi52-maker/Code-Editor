import React, { useState } from 'react';
import {
  Save,
  Check,
  RotateCw,
  Sun,
  Moon,
  Smartphone,
  Monitor,
  Hammer,
  Palette,
  FolderOpen,
  FileCode,
  Wifi,
  WifiOff,
  ShieldCheck,
  Eye,
  Settings,
  Download,
  Package,
  Share2,
  ChevronDown,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Button3D } from '../common/Button3D';
import { WorkspaceMode } from '../../types/settings';

interface TopBarProps {
  onOpenBuildStudio: () => void;
  onOpenAppConfig?: () => void;
  onOpenProjectCheck?: () => void;
  onToggleExplorerDrawer?: () => void;
  activeMainTab: 'home' | 'projects' | 'create' | 'editor' | 'settings';
  setActiveMainTab: (tab: 'home' | 'projects' | 'create' | 'editor' | 'settings') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenBuildStudio,
  onOpenAppConfig,
  onOpenProjectCheck,
  onToggleExplorerDrawer,
  activeMainTab,
  setActiveMainTab,
}) => {
  const {
    activeProject,
    activeFile,
    saveStatus,
    saveActiveFile,
    settings,
    updateSettings,
    toggleDarkLightQuick,
    themeColors,
    setCustomBgColor,
    isOnline,
    toggleNetworkOffline,
    exportProjectZip,
    exportProjectApk,
    exportProjectAab,
    shareProject,
  } = useIDE();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const isDarkMode = settings.theme === 'dark' || settings.theme === 'amoled';

  const handleSetWorkspaceMode = (mode: WorkspaceMode) => {
    updateSettings({
      workspaceMode: mode,
      desktopSplit: mode === 'code-only' ? 'code-only' : 'code-preview',
    });
  };

  return (
    <header
      className="h-13 sm:h-14 border-b flex items-center justify-between px-2 sm:px-4 shrink-0 transition-colors duration-150 select-none relative z-40 w-full max-w-full overflow-visible"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
    >
      {/* Left: Project & Explorer Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
        {/* Mobile Explorer Drawer Toggle */}
        <button
          onClick={onToggleExplorerDrawer}
          className="md:hidden p-1.5 sm:p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 active:scale-95 shrink-0"
          title="Toggle Project Tree"
          aria-label="Toggle Project Tree"
        >
          <FolderOpen size={16} />
        </button>

        <div
          className="flex items-center gap-1.5 cursor-pointer min-w-0"
          onClick={() => setActiveMainTab('projects')}
        >
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white text-[11px] sm:text-xs tracking-wider shadow-md shrink-0 border border-blue-400/30">
            IDE
          </div>
          <div className="hidden min-[480px]:block leading-tight min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm tracking-tight truncate" style={{ color: themeColors.text }}>
                CODING IDE
              </span>
            </div>
            <p className="text-[10px] truncate max-w-[100px] sm:max-w-[160px]" style={{ color: themeColors.textMuted }}>
              {activeProject ? activeProject.name : 'Code. Preview. Build.'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Save / Mobile Code-Preview Toggle */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Save Status Badge (tablet/desktop) */}
        {activeFile && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-900/60 border border-neutral-800 text-[11px]">
            {saveStatus === 'saved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-medium">Saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <RotateCw size={10} className="animate-spin text-amber-400" />
                <span className="text-amber-400 font-medium">Saving...</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-300 font-medium">Unsaved</span>
              </>
            )}
          </div>
        )}

        {/* Save Button */}
        {activeFile && (
          <Button3D
            variant="surface"
            size="sm"
            onClick={saveActiveFile}
            disabled={saveStatus === 'saved'}
            icon={saveStatus === 'saved' ? <Check size={13} className="text-emerald-400" /> : <Save size={13} className="text-blue-400" />}
            title="Save file"
            className="hidden sm:inline-flex"
          >
            <span className="hidden md:inline">Save</span>
          </Button3D>
        )}

        {/* Check Project Button (desktop) */}
        {onOpenProjectCheck && (
          <Button3D
            variant="surface"
            size="sm"
            icon={<ShieldCheck size={13} className="text-emerald-400" />}
            onClick={onOpenProjectCheck}
            title="Check Project"
            className="hidden lg:inline-flex"
          >
            <span className="hidden xl:inline">Check Project</span>
          </Button3D>
        )}

        {/* Workspace Mode Switcher on Desktop */}
        <div className="hidden lg:flex items-center bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => handleSetWorkspaceMode('code-only')}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              settings.workspaceMode === 'code-only'
                ? 'bg-neutral-800 text-blue-400 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode size={12} />
            <span>Code</span>
          </button>
          <button
            onClick={() => handleSetWorkspaceMode('code-preview')}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              settings.workspaceMode === 'code-preview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Monitor size={12} />
            <span>Split</span>
          </button>
          <button
            onClick={() => handleSetWorkspaceMode('preview-only')}
            className={`px-2 py-0.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              settings.workspaceMode === 'preview-only'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>
        </div>

        {/* Phone Code / Preview Tab Toggle (Compact, fits perfectly) */}
        <div className="flex md:hidden items-center bg-neutral-900/90 p-0.5 rounded-lg border border-neutral-800">
          <button
            onClick={() => {
              setActiveMainTab('editor');
              updateSettings({ phoneSubTab: 'code' });
            }}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
              activeMainTab === 'editor' && settings.phoneSubTab === 'code'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400'
            }`}
          >
            CODE
          </button>
          <button
            onClick={() => {
              setActiveMainTab('editor');
              updateSettings({ phoneSubTab: 'preview' });
            }}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
              activeMainTab === 'editor' && settings.phoneSubTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400'
            }`}
          >
            PREVIEW
          </button>
        </div>
      </div>

      {/* Right: Network + Tone + Theme + Build Studio */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Network status */}
        <button
          onClick={toggleNetworkOffline}
          className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-xs font-medium transition-all ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}
          title={isOnline ? 'Online mode' : 'Offline mode'}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="hidden md:inline ml-1">{isOnline ? 'Online' : 'Offline'}</span>
        </button>

        {/* Background Tone Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-1.5 sm:p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 active:scale-95 transition-all"
            title="Rapid Tone Customizer"
          >
            <Palette size={14} />
          </button>

          {showColorPicker && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/10"
                onClick={() => setShowColorPicker(false)}
              />
              <div
                className="absolute right-0 top-12 w-64 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-50 text-xs space-y-2.5"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                <div className="flex items-center justify-between font-semibold text-neutral-200 pb-1.5 border-b border-neutral-800">
                  <span>Background Tone</span>
                  <span className="text-[10px] text-blue-400">High Quality</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Obsidian', color: '#121214' },
                    { label: 'Pure Light', color: '#ffffff' },
                    { label: 'Deep Blue', color: '#0b1329' },
                    { label: 'Charcoal', color: '#18181b' },
                    { label: 'Emerald', color: '#091a13' },
                    { label: 'Violet', color: '#120b1f' },
                    { label: 'Slate', color: '#0f172a' },
                    { label: 'Zinc', color: '#27272a' },
                    { label: 'Onyx', color: '#000000' },
                    { label: 'Snow', color: '#f8fafc' },
                  ].map(item => (
                    <button
                      key={item.color}
                      onClick={() => {
                        setCustomBgColor(item.color);
                        setShowColorPicker(false);
                      }}
                      className="w-full aspect-square rounded-lg border border-neutral-600 transition-transform hover:scale-110 active:scale-95 shadow-inner"
                      style={{ backgroundColor: item.color }}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkLightQuick}
          className="p-1.5 sm:p-2 rounded-lg text-neutral-300 hover:text-white bg-neutral-800/80 border border-neutral-700/60 active:scale-95 transition-all"
          title="Toggle Dark / Light"
        >
          {isDarkMode ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} className="text-blue-400" />}
        </button>

        {/* App Configuration Button */}
        {onOpenAppConfig && (
          <Button3D
            variant="surface"
            size="sm"
            icon={<Settings size={14} className="text-blue-400" />}
            onClick={onOpenAppConfig}
            title="⚙️ App Configuration Center"
          >
            <span className="hidden sm:inline">Config</span>
          </Button3D>
        )}

        {/* Export / Download Menu */}
        <div className="relative">
          <Button3D
            variant="surface"
            size="sm"
            icon={<Download size={14} className="text-emerald-400" />}
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Menu: Download APK, AAB, ZIP"
          >
            <span className="font-semibold text-xs">Export</span>
            <ChevronDown size={11} className="text-neutral-400 ml-0.5" />
          </Button3D>

          {showExportMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/20"
                onClick={() => setShowExportMenu(false)}
              />
              <div
                className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 w-72 sm:w-64 p-2 rounded-xl bg-neutral-950 border border-neutral-700 shadow-2xl z-50 text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  boxShadow: '0 20px 50px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.15)',
                }}
              >
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-800 flex items-center justify-between">
                  <span>Export & Download Menu</span>
                  <span className="text-emerald-400 font-mono font-semibold">Ready</span>
                </div>

              {/* Download APK - Always available for any project */}
              <button
                onClick={() => {
                  exportProjectApk();
                  setShowExportMenu(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer border border-transparent hover:border-emerald-500/30"
              >
                <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all">
                  <Download size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <span>Download APK</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">.apk</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    Generate APK directly in project files & download
                  </div>
                </div>
              </button>

              {/* Download AAB - Always available */}
              <button
                onClick={() => {
                  exportProjectAab();
                  setShowExportMenu(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer border border-transparent hover:border-blue-500/30"
              >
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-105 transition-all">
                  <Package size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <span>Download AAB</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">.aab</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    Google Play Bundle & save in project files
                  </div>
                </div>
              </button>

              {/* Export Project ZIP */}
              <button
                onClick={() => {
                  if (activeProject) exportProjectZip(activeProject.id);
                  setShowExportMenu(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer border border-transparent hover:border-sky-500/30"
              >
                <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 group-hover:scale-105 transition-all">
                  <Download size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                    <span>Export Project ZIP</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">.zip</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">Complete source code & assets archive</div>
                </div>
              </button>

              {/* Share Project */}
              <button
                onClick={() => {
                  if (activeProject) shareProject(activeProject.id);
                  setShowExportMenu(false);
                }}
                className="w-full px-2.5 py-2 rounded-lg text-left text-neutral-200 hover:bg-neutral-800 hover:text-white flex items-center gap-2.5 transition-colors group cursor-pointer border border-transparent hover:border-purple-500/30"
              >
                <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 group-hover:scale-105 transition-all">
                  <Share2 size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-200">Share Project</div>
                  <div className="text-[10px] text-neutral-400 truncate">Native web share / Copy details</div>
                </div>
              </button>
            </div>
          </>
        )}
        </div>

        {/* Build Engine Studio Button */}
        <Button3D
          variant="primary"
          size="sm"
          icon={<Hammer size={14} />}
          onClick={onOpenBuildStudio}
          title="Android App Configuration & Build Studio"
        >
          <span className="hidden sm:inline">Build</span>
        </Button3D>
      </div>
    </header>
  );
};
