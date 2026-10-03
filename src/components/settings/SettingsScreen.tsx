import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Code2,
  Keyboard,
  Shield,
  Save,
  Download,
  Trash2,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sparkles,
  Wifi,
  WifiOff,
  Eye,
  CheckSquare,
  Upload,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Button3D } from '../common/Button3D';
import { THEME_PRESETS } from '../../constants/themes';
import { ThemeMode, WorkspaceMode } from '../../types/settings';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    switchTheme,
    setCustomBgColor,
    toggleDarkLightQuick,
    trash,
    emptyTrash,
    themeColors,
    addToast,
    projects,
    isOnline,
    toggleNetworkOffline,
    clearBuildHistory,
    buildHistory,
    restoreBackupJson,
    exportBackupJson,
  } = useIDE();

  const backupInputRef = React.useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'appearance' | 'editor' | 'workspace' | 'build' | 'storage'>('appearance');

  // Backup Export
  const handleExportBackup = () => {
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
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 select-none"
      style={{ backgroundColor: themeColors.background }}
    >
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
              <Settings className="text-blue-500" size={24} />
              Settings
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure code intelligence, editor environment, workspace modes, and build options
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleNetworkOffline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
              title="Toggle simulated offline mode"
            >
              {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            </button>

            <Button3D
              variant="surface"
              size="sm"
              icon={settings.theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-400" />}
              onClick={toggleDarkLightQuick}
            >
              {settings.theme === 'dark' ? 'Studio Light' : 'Obsidian Dark'}
            </Button3D>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'appearance'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Palette size={14} />
            <span>Appearance & Themes</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            <span>Code Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'workspace'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Workspace & Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('build')}
            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'build'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>Build & Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'storage'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Save size={14} />
            <span>Storage & Backup</span>
          </button>
        </div>

        {/* Tab 1: Appearance & Theme Switcher */}
        {activeTab === 'appearance' && (
          <div className="space-y-4">
            {/* Rapid Dual Tone Switch */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-100">Rapid Dual Tone Switch</h3>
                  <p className="text-xs text-neutral-400">
                    High quality one-tap switch between Obsidian Dark (#121214) and Studio Light (#ffffff)
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  RAPID QUALITY
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Obsidian Dark Card */}
                <button
                  onClick={() => switchTheme('dark')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    settings.theme === 'dark'
                      ? 'border-blue-500 ring-2 ring-blue-500/40'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                  style={{ backgroundColor: '#121214' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-neutral-100">Obsidian Dark</span>
                    {settings.theme === 'dark' && <Check size={16} className="text-blue-400" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span className="w-3 h-3 rounded-full bg-[#121214] border border-neutral-600" />
                    <span>#121214 Background</span>
                  </div>
                </button>

                {/* Studio Light Card */}
                <button
                  onClick={() => switchTheme('light')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    settings.theme === 'light'
                      ? 'border-blue-500 ring-2 ring-blue-500/40'
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                  style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">Studio Light</span>
                    {settings.theme === 'light' && <Check size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-[#ffffff] border border-slate-300" />
                    <span>#FFFFFF Pure White</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Rapid Background Color Customizer */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-neutral-100">Rapid Background Color Customizer</h3>
                  <p className="text-xs text-neutral-400">
                    Instantly tint the IDE workspace to any precise hex tone with adaptive contrast
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {[
                  { name: 'Obsidian', hex: '#121214' },
                  { name: 'Pure Light', hex: '#ffffff' },
                  { name: 'AMOLED', hex: '#000000' },
                  { name: 'Ocean', hex: '#0b1329' },
                  { name: 'Forest', hex: '#091a13' },
                  { name: 'Violet', hex: '#120b1f' },
                  { name: 'Slate', hex: '#0f172a' },
                  { name: 'Zinc', hex: '#18181b' },
                ].map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setCustomBgColor(c.hex)}
                    className="p-2.5 rounded-xl border border-neutral-700 hover:border-neutral-500 flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: c.hex === '#ffffff' ? '#0f172a' : '#f3f4f6' }}
                    >
                      {c.name}
                    </span>
                    <span
                      className="text-[9px] font-mono"
                      style={{ color: c.hex === '#ffffff' ? '#64748b' : '#9ca3af' }}
                    >
                      {c.hex}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <span className="text-neutral-300 font-medium">Custom Color Picker (Native Hex)</span>
                <input
                  type="color"
                  value={settings.customBgColor}
                  onChange={e => setCustomBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border border-neutral-700"
                />
              </div>
            </div>

            {/* Other Presets */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
              <h3 className="font-semibold text-sm text-neutral-100">All Theme Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(THEME_PRESETS) as ThemeMode[]).map(key => {
                  const preset = THEME_PRESETS[key];
                  const isSelected = settings.theme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => switchTheme(key)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-700"
                          style={{ backgroundColor: preset.background }}
                        />
                        <span className="text-xs text-neutral-200">{preset.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Code Editor (Phase 2 Section 38) */}
        {activeTab === 'editor' && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
            {/* Font Size */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Editor Font Size</span>
                <span className="text-neutral-400 text-[11px]">Adjust code typography size ({settings.fontSize}px)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="11"
                  max="22"
                  value={settings.fontSize}
                  onChange={e => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-28 sm:w-40 cursor-pointer accent-blue-600"
                />
                <span className="font-mono text-neutral-300 w-8 text-right">{settings.fontSize}px</span>
              </div>
            </div>

            {/* Smart Autocomplete */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Smart Autocomplete</span>
                <span className="text-neutral-400 text-[11px]">Context-aware symbol and Jetpack Compose completion</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autocomplete}
                onChange={e => updateSettings({ autocomplete: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Context-aware Logic Suggestions */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Logic-based Coding Suggestions</span>
                <span className="text-neutral-400 text-[11px]">Suggest next actions after onClick, modifier, etc.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.codeSuggestions}
                onChange={e => updateSettings({ codeSuggestions: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Error Detection */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Real-time Error Detection</span>
                <span className="text-neutral-400 text-[11px]">Detect bracket mismatches, missing imports, syntax problems</span>
              </div>
              <input
                type="checkbox"
                checked={settings.errorDetection}
                onChange={e => updateSettings({ errorDetection: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Quick Fix */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Quick Fix Assistance</span>
                <span className="text-neutral-400 text-[11px]">One-tap resolutions for missing imports and brackets</span>
              </div>
              <input
                type="checkbox"
                checked={settings.quickFix}
                onChange={e => updateSettings({ quickFix: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Auto-closing brackets */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Auto Closing Brackets</span>
                <span className="text-neutral-400 text-[11px]">Automatically insert closing pair for {'{'}, (, [</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoClosingBrackets}
                onChange={e => updateSettings({ autoClosingBrackets: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Auto-closing quotes */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Auto Closing Quotes</span>
                <span className="text-neutral-400 text-[11px]">Automatically insert closing pair for ", ', `</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoClosingQuotes}
                onChange={e => updateSettings({ autoClosingQuotes: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Line Numbers */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Line Numbers Gutter</span>
                <span className="text-neutral-400 text-[11px]">Show vertical line indices</span>
              </div>
              <input
                type="checkbox"
                checked={settings.lineNumbers}
                onChange={e => updateSettings({ lineNumbers: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Coding Shortcut Bar */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Coding Shortcut Key Bar</span>
                <span className="text-neutral-400 text-[11px]">Tactile 3D symbol keys above keyboard</span>
              </div>
              <input
                type="checkbox"
                checked={settings.codingKeyboard}
                onChange={e => updateSettings({ codingKeyboard: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Auto Save</span>
                <span className="text-neutral-400 text-[11px]">Automatically preserve edits ({settings.autoSaveDelay}ms)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={e => updateSettings({ autoSave: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {/* Word Wrap */}
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-semibold text-neutral-200 block">Word Wrap</span>
                <span className="text-neutral-400 text-[11px]">Wrap long lines to editor viewport</span>
              </div>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={e => updateSettings({ wordWrap: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Workspace & Preview (Section 29) */}
        {activeTab === 'workspace' && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
            <div>
              <label className="font-semibold text-neutral-200 block mb-2">Default Workspace Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'code-only', label: 'Code Only' },
                  { id: 'code-preview', label: 'Code + Preview' },
                  { id: 'preview-only', label: 'Preview Only' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateSettings({ workspaceMode: opt.id as WorkspaceMode })}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      settings.workspaceMode === opt.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Live Preview Auto-Refresh</span>
                <span className="text-neutral-400 text-[11px]">Automatically re-render preview when source code changes</span>
              </div>
              <input
                type="checkbox"
                checked={settings.previewAutoRefresh}
                onChange={e => updateSettings({ previewAutoRefresh: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Build & Pipeline (Section 38) */}
        {activeTab === 'build' && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Auto-Save Before Build</span>
                <span className="text-neutral-400 text-[11px]">Automatically save all open buffers before triggering build</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSaveBeforeBuild}
                onChange={e => updateSettings({ autoSaveBeforeBuild: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Keep Build History</span>
                <span className="text-neutral-400 text-[11px]">Retain previous APK and AAB build records and checksums</span>
              </div>
              <input
                type="checkbox"
                checked={settings.keepBuildHistory}
                onChange={e => updateSettings({ keepBuildHistory: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-neutral-800">
              <div>
                <span className="font-semibold text-neutral-200 block">Simulate Offline Mode</span>
                <span className="text-neutral-400 text-[11px]">Test offline APK building and local repository caching</span>
              </div>
              <input
                type="checkbox"
                checked={settings.networkSimulateOffline}
                onChange={e => updateSettings({ networkSimulateOffline: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
            </div>

            {buildHistory.length > 0 && (
              <div className="pt-2">
                <Button3D variant="surface" size="sm" onClick={clearBuildHistory}>
                  Clear Build History ({buildHistory.length})
                </Button3D>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Storage & Backup */}
        {activeTab === 'storage' && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 text-xs">
            <div>
              <h3 className="font-semibold text-sm text-neutral-100 mb-1">Local Storage Persistence</h3>
              <p className="text-neutral-400 text-[11px]">
                All projects, source code, folders, and settings are saved locally without external server dependencies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-neutral-800">
              <input
                type="file"
                ref={backupInputRef}
                accept=".json"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await restoreBackupJson(file);
                    if (backupInputRef.current) backupInputRef.current.value = '';
                  }
                }}
              />

              <Button3D
                variant="primary"
                size="md"
                icon={<Download size={14} />}
                onClick={handleExportBackup}
              >
                Export Complete IDE Backup (JSON)
              </Button3D>

              <Button3D
                variant="surface"
                size="md"
                icon={<Upload size={14} />}
                onClick={() => backupInputRef.current?.click()}
              >
                Restore Backup (JSON)
              </Button3D>

              {trash.length > 0 && (
                <Button3D
                  variant="danger"
                  size="md"
                  icon={<Trash2 size={14} />}
                  onClick={() => {
                    if (window.confirm('Empty all items from trash?')) {
                      emptyTrash();
                    }
                  }}
                >
                  Empty Trash ({trash.length})
                </Button3D>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
