import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Wifi,
  Battery,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Send,
  Sliders,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Button3D } from '../common/Button3D';

export const PreviewHost: React.FC = () => {
  const { activeProject, activeFile, themeColors, settings, updateSettings, addToast } = useIDE();
  const [interactiveCounter, setInteractiveCounter] = useState(0);
  const [inputText, setInputText] = useState('Mobile Developer');
  const [toggleState, setToggleState] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');

  const device = settings.previewDevice || 'phone';
  const orientation = settings.previewOrientation || 'portrait';
  const autoRefresh = settings.previewAutoRefresh;

  // Auto-refresh when files change if autoRefresh is ON
  useEffect(() => {
    if (autoRefresh) {
      setRefreshKey(prev => prev + 1);
    }
  }, [activeProject.modifiedAt, autoRefresh]);

  // List previewable screens in the current project
  const previewableFiles = useMemo(() => {
    return Object.values(activeProject.files).filter(f =>
      f.name.endsWith('.kt') ||
      f.name.endsWith('.xml') ||
      f.name.endsWith('.html') ||
      f.name.endsWith('.dart') ||
      f.name.endsWith('.tsx') ||
      f.name.endsWith('.jsx')
    );
  }, [activeProject.files]);

  // Resolve target preview file (selected dropdown or active file or MainActivity)
  const targetFile = useMemo(() => {
    if (selectedScreenId && activeProject.files[selectedScreenId]) {
      return activeProject.files[selectedScreenId];
    }
    if (activeFile && (activeFile.name.endsWith('.kt') || activeFile.name.endsWith('.xml') || activeFile.name.endsWith('.html') || activeFile.name.endsWith('.dart'))) {
      return activeFile;
    }
    const mainFile = Object.values(activeProject.files).find(
      f => f.name === 'MainActivity.kt' || f.name === 'index.html' || f.name === 'main.dart' || f.name.endsWith('Screen.kt')
    );
    return mainFile || Object.values(activeProject.files)[0] || null;
  }, [selectedScreenId, activeProject.files, activeFile]);

  // Check if project is web-based or native
  const isWebProject = activeProject.type === 'web' || activeProject.type === 'html_css_js' || activeProject.type === 'react';

  // Extract App Name & Strings from Android strings.xml
  const appStringTitle = useMemo(() => {
    const strFile = Object.values(activeProject.files).find(f => f.name === 'strings.xml');
    if (strFile) {
      const match = strFile.content.match(/<string name="app_name">([^<]+)<\/string>/);
      if (match) return match[1];
    }
    return activeProject.name;
  }, [activeProject]);

  // Extract Colors from colors.xml
  const appColors = useMemo(() => {
    const colorFile = Object.values(activeProject.files).find(f => f.name === 'colors.xml');
    const colors: Record<string, string> = {
      purple_500: '#6200EE',
      purple_700: '#3700B3',
      teal_200: '#03DAC5',
      primary: '#2563eb',
    };
    if (colorFile) {
      const matches = Array.from(colorFile.content.matchAll(/<color name="([^"]+)">([^<]+)<\/color>/g));
      matches.forEach(m => {
        colors[m[1]] = m[2];
      });
    }
    return colors;
  }, [activeProject]);

  // Compose screen UI extractor
  const parsedScreenData = useMemo(() => {
    if (!targetFile) return { title: appStringTitle, subtitle: 'Ready for preview', elements: [] };

    const content = targetFile.content || '';
    const textMatches = Array.from(content.matchAll(/Text\(\s*(?:text\s*=\s*)?"([^"]+)"/g)).map(m => m[1]);
    const buttonMatches = Array.from(content.matchAll(/Button\([^)]*\)\s*\{\s*Text\("([^"]+)"\)/g)).map(m => m[1]);

    // Check XML tags if XML
    const isXml = targetFile.name.endsWith('.xml');
    const xmlTexts = isXml ? Array.from(content.matchAll(/android:text="([^"]+)"/g)).map(m => m[1]) : [];

    const title = textMatches[0] || xmlTexts[0] || (targetFile.name.replace(/\.[a-zA-Z0-9.]+$/, ''));
    const subtitle = textMatches[1] || xmlTexts[1] || 'Interactive Material 3 Surface';
    const buttonLabel = buttonMatches[0] || (isXml ? 'Submit Action' : 'Continue');

    return {
      title,
      subtitle,
      buttonLabel,
      allTexts: textMatches.length > 0 ? textMatches : xmlTexts,
      hasTextField: content.includes('TextField') || content.includes('EditText'),
      hasCard: content.includes('Card') || content.includes('CardView'),
    };
  }, [targetFile, appStringTitle]);

  // Construct iframe source for web projects
  const webPreviewDoc = useMemo(() => {
    if (!isWebProject) return null;
    const indexHtml = Object.values(activeProject.files).find(f => f.name === 'index.html');
    const styleCss = Object.values(activeProject.files).find(f => f.name.endsWith('.css'));
    const scriptJs = Object.values(activeProject.files).find(f => f.name.endsWith('.js') || f.name.endsWith('.ts'));

    let html = indexHtml ? indexHtml.content : `<div style="font-family:system-ui;padding:24px;color:#fff;background:#09090b;height:100%;"><h2>${activeProject.name}</h2><p>Previewing web components...</p></div>`;
    if (styleCss) {
      html = html.replace('</head>', `<style>${styleCss.content}</style></head>`);
    }
    if (scriptJs) {
      html = html.replace('</body>', `<script>${scriptJs.content}</script></body>`);
    }
    return html;
  }, [activeProject, isWebProject, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    addToast('Preview refreshed', 'info');
  };

  const toggleDevice = () => {
    const next = device === 'phone' ? 'tablet' : 'phone';
    updateSettings({ previewDevice: next });
  };

  const toggleOrientation = () => {
    const next = orientation === 'portrait' ? 'landscape' : 'portrait';
    updateSettings({ previewOrientation: next });
  };

  // Dimensions based on device and orientation
  const frameDimensions = useMemo(() => {
    if (device === 'phone') {
      return orientation === 'portrait'
        ? { width: '340px', height: '650px', rounded: 'rounded-[38px]', border: 'border-4' }
        : { width: '650px', height: '340px', rounded: 'rounded-[38px]', border: 'border-4' };
    } else {
      // Tablet dimensions
      return orientation === 'portrait'
        ? { width: '480px', height: '660px', rounded: 'rounded-[32px]', border: 'border-6' }
        : { width: '660px', height: '480px', rounded: 'rounded-[32px]', border: 'border-6' };
    }
  }, [device, orientation]);

  return (
    <div
      className={`flex flex-col h-full overflow-hidden select-none border-l ${
        isFullScreen ? 'fixed inset-0 z-50 border-0' : 'flex-1'
      }`}
      style={{
        backgroundColor: themeColors.background,
        borderColor: themeColors.border,
      }}
    >
      {/* Preview Controls Bar */}
      <div
        className="h-12 border-b flex items-center justify-between px-3 shrink-0"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold shrink-0">
            {device === 'phone' ? <Smartphone size={13} /> : <Tablet size={13} />}
            <span className="capitalize">{device} Preview</span>
          </div>

          {/* Screen / File Selector Dropdown */}
          {previewableFiles.length > 1 && (
            <div className="flex items-center gap-1">
              <select
                value={selectedScreenId || targetFile?.id || ''}
                onChange={e => setSelectedScreenId(e.target.value)}
                className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 text-[11px] focus:outline-none focus:border-blue-500 max-w-[140px] truncate"
                aria-label="Select screen to preview"
              >
                {previewableFiles.map(f => (
                  <option key={f.id} value={f.id} className="bg-neutral-900 text-neutral-200">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className="text-[10px] text-neutral-400 hidden xl:inline font-mono">
            {orientation === 'portrait' ? '1080×2400' : '2400×1080'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={14} />
          </button>

          {/* Auto-Refresh Toggle */}
          <button
            onClick={() => updateSettings({ previewAutoRefresh: !autoRefresh })}
            className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors hidden sm:inline-block ${
              autoRefresh
                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                : 'border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title="Auto Refresh on file edit"
          >
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </button>

          {/* Device Type Toggle (Phone vs Tablet) */}
          <button
            onClick={toggleDevice}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title={`Switch to ${device === 'phone' ? 'Tablet' : 'Phone'}`}
          >
            {device === 'phone' ? <Tablet size={14} /> : <Smartphone size={14} />}
          </button>

          {/* Orientation Toggle */}
          <button
            onClick={toggleOrientation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Rotate Orientation"
          >
            <RotateCcw size={14} />
          </button>

          {/* Zoom controls */}
          <button
            onClick={() => setZoom(prev => Math.max(0.6, prev - 0.1))}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 hidden sm:inline-flex"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-[10px] text-neutral-400 font-mono w-7 text-center hidden sm:inline-block">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 hidden sm:inline-flex"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>

          {/* Full Screen */}
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 relative">
        <div
          className={`transition-all duration-300 ${frameDimensions.rounded} ${frameDimensions.border} p-3 bg-neutral-900 border-neutral-700 shadow-2xl relative flex flex-col overflow-hidden`}
          style={{
            width: frameDimensions.width,
            height: frameDimensions.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Camera Punch Hole */}
          {device === 'phone' && orientation === 'portrait' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-neutral-800 z-30" />
          )}

          {/* Status Bar */}
          <div className="h-6 px-6 flex items-center justify-between text-[11px] text-neutral-300 font-medium z-20 shrink-0 select-none">
            <span>09:41</span>
            <div className="flex items-center gap-2">
              <Wifi size={12} />
              <span className="text-[10px]">5G</span>
              <Battery size={13} />
            </div>
          </div>

          {/* App Screen Content Area */}
          <div className="flex-1 rounded-[22px] bg-neutral-950 overflow-hidden relative flex flex-col border border-neutral-800/80">
            {isWebProject && webPreviewDoc ? (
              <iframe
                key={refreshKey}
                title="Web Project Preview"
                srcDoc={webPreviewDoc}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-modals"
              />
            ) : (
              <div className="w-full h-full flex flex-col bg-neutral-950 text-white overflow-y-auto">
                {/* Simulated Android Material 3 Top App Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                      {activeProject.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-semibold text-xs truncate max-w-[170px]">
                      {appStringTitle}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    Compose M3
                  </span>
                </div>

                {/* App Content Preview with dynamic project data */}
                <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-mono text-blue-400 tracking-wider">
                      {targetFile?.name || 'Active Screen'}
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-neutral-100">
                      {parsedScreenData.title}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {parsedScreenData.subtitle}
                    </p>
                  </div>

                  {/* Dynamic interactive text field preview */}
                  <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 shadow-sm">
                    <label className="block text-[11px] font-medium text-neutral-400">
                      Interactive Compose TextField
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        placeholder="Type text in preview..."
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-white text-xs focus:outline-none focus:border-blue-500 font-sans"
                      />
                    </div>
                    {inputText && (
                      <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                        <span>Live State:</span>
                        <span className="text-blue-400 font-mono font-medium">{inputText}</span>
                      </div>
                    )}
                  </div>

                  {/* Interactive Card & Button Demo */}
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-300 font-medium">Switch Toggle Demo:</span>
                      <button
                        onClick={() => setToggleState(!toggleState)}
                        className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                          toggleState ? 'bg-blue-600' : 'bg-neutral-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            toggleState ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => setInteractiveCounter(c => c + 1)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>{parsedScreenData.buttonLabel}:</span>
                      <span className="px-2 py-0.5 rounded bg-blue-800 font-bold font-mono">
                        {interactiveCounter}
                      </span>
                    </button>
                  </div>

                  {/* App Architecture Tags */}
                  <div className="p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80 space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Package:</span>
                      <span className="text-neutral-300 truncate max-w-[170px]">{activeProject.packageName || 'com.codingide.app'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Target SDK:</span>
                      <span className="text-emerald-400">Android 14 (API 34)</span>
                    </div>
                  </div>

                  {/* Architectural Notice */}
                  <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[10px] text-neutral-400 flex items-start gap-2">
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-neutral-300">Phase 3 Final Live Engine:</span>{' '}
                      Dynamic Android Compose & Layout live rendering runtime.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Android Home Navigation Bar */}
          <div className="h-4 flex items-center justify-center pt-2">
            <div className="w-28 h-1 rounded-full bg-neutral-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
