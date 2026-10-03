import React from 'react';
import {
  Undo2,
  Redo2,
  ArrowLeft,
  ArrowRight,
  ClipboardPaste,
  Indent,
  CheckSquare,
} from 'lucide-react';
import { CODING_SHORTCUT_KEYS, CodingShortcutKey } from '../../constants/shortcuts';
import { useIDE } from '../../context/IDEContext';

interface CodingShortcutBarProps {
  onInsertText: (text: string, isPair?: boolean) => void;
  onSpecialAction: (action: CodingShortcutKey['action']) => void;
}

export const CodingShortcutBar: React.FC<CodingShortcutBarProps> = ({
  onInsertText,
  onSpecialAction,
}) => {
  const { settings, themeColors } = useIDE();

  if (!settings.codingKeyboard) return null;

  return (
    <div
      className="border-t py-1.5 px-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none z-20 backdrop-blur-md"
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
    >
      {/* Quick Action Buttons */}
      <button
        type="button"
        onClick={() => onSpecialAction('undo')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Undo"
      >
        <Undo2 size={14} />
      </button>

      <button
        type="button"
        onClick={() => onSpecialAction('redo')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Redo"
      >
        <Redo2 size={14} />
      </button>

      <button
        type="button"
        onClick={() => onSpecialAction('tab')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Tab (Indent)"
      >
        <Indent size={14} />
      </button>

      <button
        type="button"
        onClick={() => onSpecialAction('paste')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Paste Clipboard"
      >
        <ClipboardPaste size={14} />
      </button>

      <button
        type="button"
        onClick={() => onSpecialAction('select-all')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white font-mono text-[11px]"
        title="Select All"
      >
        ALL
      </button>

      <div className="w-[1px] h-6 bg-neutral-700/60 shrink-0 mx-0.5" />

      {/* Cursor Left / Right */}
      <button
        type="button"
        onClick={() => onSpecialAction('left')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Cursor Left"
      >
        <ArrowLeft size={14} />
      </button>

      <button
        type="button"
        onClick={() => onSpecialAction('right')}
        className="keycap-3d bg-neutral-800 text-neutral-200 hover:text-white"
        title="Cursor Right"
      >
        <ArrowRight size={14} />
      </button>

      <div className="w-[1px] h-6 bg-neutral-700/60 shrink-0 mx-0.5" />

      {/* Symbol Keycaps */}
      {CODING_SHORTCUT_KEYS.filter(k => !k.action).map(key => (
        <button
          key={key.id}
          type="button"
          onClick={() => onInsertText(key.insert, key.pair)}
          className="keycap-3d bg-neutral-900 text-blue-300 hover:text-white hover:bg-neutral-800 active:bg-blue-600/30"
          title={`Insert ${key.label}`}
        >
          {key.label}
        </button>
      ))}
    </div>
  );
};
