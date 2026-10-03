import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Save,
  Search,
  MoreVertical,
  Check,
  RotateCw,
  Copy,
  Scissors,
  ClipboardPaste,
  Download,
  Share2,
  WrapText,
  FileCode2,
  AlignLeft,
  Sparkles,
  SearchCode,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { EditorTabBar } from './EditorTabBar';
import { CodingShortcutBar } from './CodingShortcutBar';
import { SearchReplaceBar } from './SearchReplaceBar';
import { AutocompletePopover } from './AutocompletePopover';
import { LogicSuggestionsBar } from './LogicSuggestionsBar';
import { NLCoderModal } from './NLCoderModal';
import { SymbolSearchModal } from './SymbolSearchModal';
import { DiagnosticDetailsModal } from './DiagnosticDetailsModal';
import { Button3D } from '../common/Button3D';
import { detectColorCode } from '../../services/syntax';
import { AutocompleteService } from '../../services/autocomplete';
import { AutocompleteItem, DiagnosticItem, LogicSuggestion, SymbolItem } from '../../types/editor';

interface CodeEditorProps {
  onBackToExplorer?: () => void;
  onNewFileClick?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  onBackToExplorer,
  onNewFileClick,
}) => {
  const {
    activeFile,
    updateFileContent,
    saveActiveFile,
    saveStatus,
    settings,
    themeColors,
    downloadFile,
    shareFile,
    exportProjectApk,
    addToast,
    updateSettings,
    activeDiagnostics,
    projectSymbols,
    applyQuickFix,
    formatActiveFile,
  } = useIDE();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history
  const historyRef = useRef<{ stack: string[]; pointer: number }>({
    stack: activeFile ? [activeFile.content] : [''],
    pointer: 0,
  });

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1, offset: 0 });
  const [showSearch, setShowSearch] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Phase 2 Modals State
  const [showNLCoder, setShowNLCoder] = useState(false);
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<DiagnosticItem | null>(null);

  // Autocomplete State
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [autocompleteIndex, setAutocompleteIndex] = useState(0);
  const [autocompletePos, setAutocompletePos] = useState({ top: 100, left: 100 });
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Logic Suggestions State
  const [logicSuggestions, setLogicSuggestions] = useState<LogicSuggestion[]>([]);

  // Sync history when switching active file
  useEffect(() => {
    if (activeFile) {
      historyRef.current = {
        stack: [activeFile.content],
        pointer: 0,
      };
      setCursorPos({ line: 1, col: 1, offset: 0 });
      setShowAutocomplete(false);
    }
  }, [activeFile?.id]);

  // Synchronize gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Push to undo stack
  const pushHistory = useCallback((newContent: string) => {
    const { stack, pointer } = historyRef.current;
    const newStack = stack.slice(0, pointer + 1);
    newStack.push(newContent);
    if (newStack.length > 50) newStack.shift();
    historyRef.current = {
      stack: newStack,
      pointer: newStack.length - 1,
    };
  }, []);

  const handleUndo = useCallback(() => {
    const { stack, pointer } = historyRef.current;
    if (pointer > 0 && activeFile) {
      const prev = stack[pointer - 1];
      historyRef.current.pointer = pointer - 1;
      updateFileContent(activeFile.id, prev);
      addToast('Undo', 'info');
    }
  }, [activeFile, updateFileContent, addToast]);

  const handleRedo = useCallback(() => {
    const { stack, pointer } = historyRef.current;
    if (pointer < stack.length - 1 && activeFile) {
      const next = stack[pointer + 1];
      historyRef.current.pointer = pointer + 1;
      updateFileContent(activeFile.id, next);
      addToast('Redo', 'info');
    }
  }, [activeFile, updateFileContent, addToast]);

  // Track cursor position and trigger autocomplete & suggestions
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current || !activeFile) return;
    const offset = textareaRef.current.selectionStart;
    const textBefore = activeFile.content.substring(0, offset);
    const lines = textBefore.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    setCursorPos({ line, col, offset });

    const currentLineText = lines[line - 1] || '';

    // Autocomplete calculation
    if (settings.autocomplete) {
      const suggestions = AutocompleteService.getSuggestions(
        currentLineText,
        col - 1,
        activeFile,
        projectSymbols
      );

      if (suggestions.length > 0) {
        setAutocompleteItems(suggestions);
        setAutocompleteIndex(0);

        // Calculate approximate screen coordinates
        const rect = textareaRef.current.getBoundingClientRect();
        const lineHeight = settings.fontSize * 1.5;
        const charWidth = settings.fontSize * 0.6;
        setAutocompletePos({
          top: rect.top + (line * lineHeight) - textareaRef.current.scrollTop + 24,
          left: rect.left + (col * charWidth) + 40,
        });
        setShowAutocomplete(true);
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }

    // Context-Aware Logic Suggestions
    if (settings.codeSuggestions) {
      const logicList = AutocompleteService.getLogicSuggestions(
        currentLineText,
        activeFile.content,
        line
      );
      setLogicSuggestions(logicList);
    } else {
      setLogicSuggestions([]);
    }
  }, [activeFile, settings.autocomplete, settings.codeSuggestions, settings.fontSize, projectSymbols]);

  // Handle Autocomplete Selection
  const handleSelectAutocomplete = useCallback((item: AutocompleteItem) => {
    if (!activeFile || !textareaRef.current) return;
    const ta = textareaRef.current;
    const offset = ta.selectionStart;
    const beforeCursor = activeFile.content.substring(0, offset);
    const afterCursor = activeFile.content.substring(offset);

    // Replace current partial token
    const tokenMatch = beforeCursor.match(/([A-Za-z0-9_.]+)$/);
    const replaceLen = tokenMatch ? tokenMatch[1].length : 0;
    const textPrefix = beforeCursor.substring(0, beforeCursor.length - replaceLen);

    const insertion = item.insertText.replace(/\$\d+/g, '');
    const newContent = textPrefix + insertion + afterCursor;

    pushHistory(newContent);
    updateFileContent(activeFile.id, newContent);
    setShowAutocomplete(false);

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = textPrefix.length + insertion.length;
      updateCursorPosition();
    }, 10);
  }, [activeFile, pushHistory, updateFileContent, updateCursorPosition]);

  // Insert Logic Suggestion
  const handleApplyLogicSuggestion = useCallback((snippet: string) => {
    if (!activeFile || !textareaRef.current) return;
    const ta = textareaRef.current;
    const offset = ta.selectionStart;
    const before = activeFile.content.substring(0, offset);
    const after = activeFile.content.substring(offset);
    const newContent = before + '\n    ' + snippet + after;

    pushHistory(newContent);
    updateFileContent(activeFile.id, newContent);

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = offset + snippet.length + 5;
      updateCursorPosition();
    }, 10);
  }, [activeFile, pushHistory, updateFileContent, updateCursorPosition]);

  // Keyboard listener inside editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!activeFile || !textareaRef.current) return;
    const ta = textareaRef.current;

    // Autocomplete Navigation with Arrow keys
    if (showAutocomplete && autocompleteItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev + 1) % autocompleteItems.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAutocompleteIndex(prev => (prev - 1 + autocompleteItems.length) % autocompleteItems.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectAutocomplete(autocompleteItems[autocompleteIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }

    // Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveActiveFile();
      return;
    }

    // Ctrl+F or Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setShowSearch(prev => !prev);
      return;
    }

    // Ctrl+G: Go to Line
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      setShowSymbolSearch(true);
      return;
    }

    // Ctrl+Z: Undo / Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) handleRedo();
      else handleUndo();
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      const offset = ta.selectionStart;
      const textBefore = activeFile.content.substring(0, offset);
      const currentLine = textBefore.split('\n').pop() || '';
      const indentMatch = currentLine.match(/^(\s+)/);
      let indent = indentMatch ? indentMatch[1] : '';

      // Extra indent if opened bracket
      if (currentLine.trim().endsWith('{') || currentLine.trim().endsWith(':')) {
        indent += ' '.repeat(settings.tabSize || 4);
      }

      e.preventDefault();
      const after = activeFile.content.substring(ta.selectionEnd);
      const newContent = textBefore + '\n' + indent + after;
      pushHistory(newContent);
      updateFileContent(activeFile.id, newContent);

      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = offset + 1 + indent.length;
        updateCursorPosition();
      }, 0);
      return;
    }

    // Auto Closing Brackets & Quotes
    if (settings.autoClosingBrackets) {
      const pairs: Record<string, string> = {
        '{': '}',
        '(': ')',
        '[': ']',
      };
      if (pairs[e.key]) {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = activeFile.content.substring(start, end);
        const insertion = e.key + selected + pairs[e.key];
        const newContent = activeFile.content.substring(0, start) + insertion + activeFile.content.substring(end);
        pushHistory(newContent);
        updateFileContent(activeFile.id, newContent);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
          updateCursorPosition();
        }, 0);
        return;
      }
    }

    if (settings.autoClosingQuotes && (e.key === '"' || e.key === "'" || e.key === '`')) {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = activeFile.content.substring(start, end);
      const insertion = e.key + selected + e.key;
      const newContent = activeFile.content.substring(0, start) + insertion + activeFile.content.substring(end);
      pushHistory(newContent);
      updateFileContent(activeFile.id, newContent);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 1;
        updateCursorPosition();
      }, 0);
      return;
    }

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize || 4);
      const before = activeFile.content.substring(0, start);
      const after = activeFile.content.substring(end);
      const newContent = before + spaces + after;
      pushHistory(newContent);
      updateFileContent(activeFile.id, newContent);

      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + spaces.length;
        updateCursorPosition();
      }, 0);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!activeFile) return;
    const val = e.target.value;
    pushHistory(val);
    updateFileContent(activeFile.id, val);
    updateCursorPosition();
  };

  // Coding Shortcut Bar insert action
  const handleInsertShortcut = useCallback((textToInsert: string, isPair = false) => {
    if (!activeFile || !textareaRef.current) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = activeFile.content.substring(start, end);

    let insertion = textToInsert;
    let nextCursor = start + textToInsert.length;

    if (isPair) {
      const openChar = textToInsert[0];
      const closeChar = textToInsert[1];
      insertion = openChar + selected + closeChar;
      nextCursor = selected ? start + insertion.length : start + 1;
    }

    const before = activeFile.content.substring(0, start);
    const after = activeFile.content.substring(end);
    const newContent = before + insertion + after;

    pushHistory(newContent);
    updateFileContent(activeFile.id, newContent);

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = nextCursor;
      updateCursorPosition();
    }, 10);
  }, [activeFile, updateFileContent, pushHistory, updateCursorPosition]);

  // Coding Shortcut Bar special action
  const handleSpecialAction = useCallback(async (action: any) => {
    if (!activeFile || !textareaRef.current) return;
    const ta = textareaRef.current;

    switch (action) {
      case 'undo':
        handleUndo();
        break;
      case 'redo':
        handleRedo();
        break;
      case 'tab': {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const spaces = ' '.repeat(settings.tabSize || 4);
        const before = activeFile.content.substring(0, start);
        const after = activeFile.content.substring(end);
        const newContent = before + spaces + after;
        pushHistory(newContent);
        updateFileContent(activeFile.id, newContent);
        setTimeout(() => {
          ta.focus();
          ta.selectionStart = ta.selectionEnd = start + spaces.length;
          updateCursorPosition();
        }, 10);
        break;
      }
      case 'paste': {
        try {
          const clipText = await navigator.clipboard.readText();
          if (clipText) {
            handleInsertShortcut(clipText, false);
          }
        } catch {
          addToast('Clipboard access denied', 'info');
        }
        break;
      }
      case 'left':
        ta.focus();
        ta.selectionStart = Math.max(0, ta.selectionStart - 1);
        ta.selectionEnd = ta.selectionStart;
        updateCursorPosition();
        break;
      case 'right':
        ta.focus();
        ta.selectionStart = Math.min(activeFile.content.length, ta.selectionStart + 1);
        ta.selectionEnd = ta.selectionStart;
        updateCursorPosition();
        break;
      case 'select-all':
        ta.focus();
        ta.select();
        break;
    }
  }, [activeFile, settings.tabSize, handleUndo, handleRedo, handleInsertShortcut, pushHistory, updateFileContent, updateCursorPosition, addToast]);

  // Find & Replace
  const handleFind = useCallback((query: string, caseSensitive: boolean) => {
    if (!query || !activeFile) {
      setMatchCount(0);
      return;
    }
    const flags = caseSensitive ? 'g' : 'gi';
    try {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = activeFile.content.match(regex);
      setMatchCount(matches ? matches.length : 0);
      setCurrentMatchIndex(0);
    } catch {
      setMatchCount(0);
    }
  }, [activeFile]);

  const handleNavigateMatch = useCallback((dir: 'next' | 'prev') => {
    if (matchCount === 0 || !textareaRef.current) return;
    const nextIdx = dir === 'next'
      ? (currentMatchIndex + 1) % matchCount
      : (currentMatchIndex - 1 + matchCount) % matchCount;
    setCurrentMatchIndex(nextIdx);
  }, [matchCount, currentMatchIndex]);

  const handleReplace = useCallback((search: string, replaceWith: string, replaceAll: boolean) => {
    if (!activeFile || !search) return;
    let newContent = activeFile.content;
    if (replaceAll) {
      newContent = newContent.split(search).join(replaceWith);
    } else {
      newContent = newContent.replace(search, replaceWith);
    }
    pushHistory(newContent);
    updateFileContent(activeFile.id, newContent);
    addToast(replaceAll ? 'Replaced all occurrences' : 'Replaced occurrence', 'success');
  }, [activeFile, pushHistory, updateFileContent, addToast]);

  // Jump to specific line number
  const handleGoToLine = (targetLine: number) => {
    if (!activeFile || !textareaRef.current) return;
    const lines = activeFile.content.split('\n');
    let offset = 0;
    for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
      offset += lines[i].length + 1;
    }
    textareaRef.current.focus();
    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = offset;
    updateCursorPosition();
  };

  const handleSelectSymbol = (symbol: SymbolItem) => {
    handleGoToLine(symbol.line);
  };

  // Lines calculation
  const lines = useMemo(() => {
    if (!activeFile) return [''];
    return activeFile.content.split('\n');
  }, [activeFile?.content]);

  // Current line diagnostics
  const currentLineDiagnostic = useMemo(() => {
    return activeDiagnostics.find(d => d.line === cursorPos.line);
  }, [activeDiagnostics, cursorPos.line]);

  // Inline color swatch detector for current line
  const currentLineText = lines[cursorPos.line - 1] || '';
  const detectedColorsInLine = useMemo(() => {
    const tokens = currentLineText.split(/[\s,();]+/);
    const colors: string[] = [];
    tokens.forEach(tok => {
      const c = detectColorCode(tok.replace(/^["']|["']$/g, ''));
      if (c && !colors.includes(c)) colors.push(c);
    });
    return colors;
  }, [currentLineText]);

  if (!activeFile) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none"
        style={{ backgroundColor: themeColors.editorBg }}
      >
        <div className="w-16 h-16 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mb-4 text-blue-400 shadow-xl">
          <FileCode2 size={32} />
        </div>
        <h3 className="text-lg font-bold text-neutral-200 mb-1">No Active File</h3>
        <p className="text-xs text-neutral-400 max-w-sm mb-5">
          Select a file from the Project Explorer or create a new file to start writing code.
        </p>
        <div className="flex items-center gap-2">
          {onBackToExplorer && (
            <Button3D variant="surface" size="md" onClick={onBackToExplorer}>
              Browse Explorer
            </Button3D>
          )}
          {onNewFileClick && (
            <Button3D variant="primary" size="md" onClick={onNewFileClick}>
              Create New File
            </Button3D>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden select-none relative"
      style={{ backgroundColor: themeColors.editorBg }}
    >
      {/* Top Bar for Code Editor (Section 9) */}
      <div
        className="h-12 border-b flex items-center justify-between px-3 shrink-0 gap-2 select-none"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        {/* Left: Back button & File Title */}
        <div className="flex items-center gap-2 min-w-0">
          {onBackToExplorer && (
            <button
              onClick={onBackToExplorer}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Back to Explorer"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="min-w-0 flex items-center gap-2">
            <span className="font-semibold text-xs sm:text-sm text-neutral-100 truncate">
              {activeFile.name}
            </span>
            {activeFile.isModified && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Middle & Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
          {/* Quick Fix Bulb if problem on current line */}
          {currentLineDiagnostic && (
            <button
              onClick={() => setSelectedDiagnostic(currentLineDiagnostic)}
              className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] animate-pulse"
              title="Quick Fix available"
            >
              <Lightbulb size={13} className="text-amber-400" />
              <span className="hidden md:inline">Quick Fix</span>
            </button>
          )}

          {/* Natural Language Coding Command */}
          <Button3D
            variant="surface"
            size="sm"
            icon={<Sparkles size={13} className="text-blue-400" />}
            onClick={() => setShowNLCoder(true)}
            title="Natural Language Coding Command"
          >
            <span className="hidden md:inline">Smart Code</span>
          </Button3D>

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSearch ? 'bg-blue-600/30 text-blue-400' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="Search in file (Ctrl+F)"
          >
            <Search size={15} />
          </button>

          {/* Format Code */}
          <button
            onClick={formatActiveFile}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors hidden min-[380px]:inline-flex"
            title="Format Code"
          >
            <AlignLeft size={15} />
          </button>

          {/* Save Status Dot / Badge */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-neutral-900/60 border border-neutral-800">
            {saveStatus === 'saved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 hidden md:inline">Saved</span>
              </>
            )}
            {saveStatus === 'saving' && (
              <>
                <RotateCw size={10} className="animate-spin text-amber-400" />
                <span className="text-amber-400 hidden md:inline">Saving...</span>
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-amber-300 hidden md:inline">Unsaved</span>
              </>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveActiveFile}
            className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Save file (Ctrl+S)"
          >
            <Save size={15} className={saveStatus === 'unsaved' ? 'text-blue-400' : 'text-neutral-400'} />
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="More Editor Actions"
            >
              <MoreVertical size={15} />
            </button>

            {showMoreMenu && (
              <div
                className="absolute right-0 top-10 w-48 py-1 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-50 text-xs space-y-0.5"
                style={{
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
                }}
              >
                <button
                  onClick={() => {
                    formatActiveFile();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-200 hover:bg-neutral-800 text-left"
                >
                  <AlignLeft size={14} className="text-blue-400" />
                  Format Code
                </button>

                <button
                  onClick={() => {
                    updateSettings({ wordWrap: !settings.wordWrap });
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center justify-between text-neutral-200 hover:bg-neutral-800 text-left"
                >
                  <span className="flex items-center gap-2">
                    <WrapText size={14} className="text-blue-400" />
                    Word Wrap
                  </span>
                  <span className="text-[10px] text-neutral-400">{settings.wordWrap ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeFile.content);
                    addToast('Copied entire file', 'success');
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-200 hover:bg-neutral-800 text-left"
                >
                  <Copy size={14} className="text-emerald-400" />
                  Copy All Text
                </button>

                <button
                  onClick={() => {
                    downloadFile(activeFile.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-200 hover:bg-neutral-800 text-left"
                >
                  <Download size={14} className="text-sky-400" />
                  Download File
                </button>

                <button
                  onClick={() => {
                    shareFile(activeFile.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-neutral-200 hover:bg-neutral-800 text-left"
                >
                  <Share2 size={14} className="text-purple-400" />
                  Share File
                </button>

                <button
                  onClick={() => {
                    exportProjectApk();
                    setShowMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-emerald-300 hover:bg-neutral-800 text-left font-medium border-t border-neutral-800"
                >
                  <Download size={14} className="text-emerald-400" />
                  Export Project APK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi Tabs Bar */}
      <EditorTabBar onNewFileClick={onNewFileClick || (() => {})} />

      {/* Find & Replace Bar */}
      <SearchReplaceBar
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onFind={handleFind}
        onReplace={handleReplace}
        onNavigateMatch={handleNavigateMatch}
        matchCount={matchCount}
        currentMatchIndex={currentMatchIndex}
      />

      {/* Editor Main Canvas: Gutter with diagnostics markers + Editable Textarea */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers Gutter */}
        {settings.lineNumbers && (
          <div
            ref={gutterRef}
            className="w-12 shrink-0 overflow-hidden select-none border-r py-3 text-right pr-2 text-xs font-mono leading-relaxed"
            style={{
              backgroundColor: themeColors.editorGutterBg,
              borderColor: themeColors.border,
              fontSize: `${settings.fontSize}px`,
            }}
          >
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const isCurrent = lineNum === cursorPos.line;
              const lineDiag = activeDiagnostics.find(d => d.line === lineNum);

              return (
                <div
                  key={lineNum}
                  onClick={() => lineDiag && setSelectedDiagnostic(lineDiag)}
                  className={`line-gutter-number leading-relaxed transition-colors flex items-center justify-end gap-1 ${
                    lineDiag ? 'cursor-pointer' : ''
                  }`}
                  style={{
                    color: isCurrent
                      ? themeColors.editorLineNumberActive
                      : themeColors.editorLineNumber,
                    fontWeight: isCurrent ? 'bold' : 'normal',
                  }}
                >
                  {lineDiag && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        lineDiag.severity === 'error' ? 'bg-red-400' : 'bg-amber-400'
                      }`}
                      title={lineDiag.message}
                    />
                  )}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea Workspace */}
        <div className="flex-1 relative h-full overflow-hidden">
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onSelect={updateCursorPosition}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap={settings.wordWrap ? 'soft' : 'off'}
            className="w-full h-full p-3 font-mono leading-relaxed bg-transparent resize-none focus:outline-none selectable-code overflow-auto"
            style={{
              fontSize: `${settings.fontSize}px`,
              color: themeColors.text,
              tabSize: settings.tabSize || 4,
              fontFamily: settings.fontFamily,
              whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
            }}
          />

          {/* Autocomplete Popover */}
          {showAutocomplete && (
            <AutocompletePopover
              items={autocompleteItems}
              selectedIndex={autocompleteIndex}
              onSelect={handleSelectAutocomplete}
              position={autocompletePos}
              onClose={() => setShowAutocomplete(false)}
            />
          )}
        </div>
      </div>

      {/* Context-Aware Logic Suggestions Bar (Section 4) */}
      <LogicSuggestionsBar
        suggestions={logicSuggestions}
        onApply={handleApplyLogicSuggestion}
        onDismiss={() => setLogicSuggestions([])}
      />

      {/* Coding Shortcut Bar (Section 11) */}
      <CodingShortcutBar
        onInsertText={handleInsertShortcut}
        onSpecialAction={handleSpecialAction}
      />

      {/* Editor Status Bar */}
      <div
        className="h-6 border-t px-3 flex items-center justify-between text-[11px] font-mono select-none shrink-0"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          color: themeColors.textMuted,
        }}
      >
        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>{lines.length} lines</span>
          <span>{activeFile.content.length} chars</span>
          {activeDiagnostics.length > 0 && (
            <button
              onClick={() => setSelectedDiagnostic(activeDiagnostics[0])}
              className="flex items-center gap-1 text-red-400 font-semibold cursor-pointer"
            >
              <AlertCircle size={12} />
              <span>{activeDiagnostics.length} problem{activeDiagnostics.length === 1 ? '' : 's'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Color swatch preview for detected color values (Section 12 & 28) */}
          {detectedColorsInLine.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">Color:</span>
              {detectedColorsInLine.map(hex => (
                <div
                  key={hex}
                  className="flex items-center gap-1 px-1 py-0.5 rounded bg-neutral-900 border border-neutral-700"
                  title={`Detected color value: ${hex}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-[10px] text-neutral-300">{hex}</span>
                </div>
              ))}
            </div>
          )}

          <span className="uppercase">{activeFile.extension || 'TXT'}</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Modals */}
      <NLCoderModal isOpen={showNLCoder} onClose={() => setShowNLCoder(false)} />

      <SymbolSearchModal
        isOpen={showSymbolSearch}
        onClose={() => setShowSymbolSearch(false)}
        onSelectSymbol={handleSelectSymbol}
        onGoToLine={handleGoToLine}
      />

      <DiagnosticDetailsModal
        diagnostic={selectedDiagnostic}
        onClose={() => setSelectedDiagnostic(null)}
        onApplyFix={applyQuickFix}
      />
    </div>
  );
};
