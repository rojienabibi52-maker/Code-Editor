import React, { useEffect, useRef } from 'react';
import { Component, FunctionSquare, Variable, Box, Tag, FileCode } from 'lucide-react';
import { AutocompleteItem } from '../../types/editor';

interface AutocompletePopoverProps {
  items: AutocompleteItem[];
  selectedIndex: number;
  onSelect: (item: AutocompleteItem) => void;
  position: { top: number; left: number };
  onClose: () => void;
}

function getKindIcon(kind: AutocompleteItem['kind']) {
  switch (kind) {
    case 'component':
      return <Component size={13} className="text-violet-400 shrink-0" />;
    case 'function':
      return <FunctionSquare size={13} className="text-blue-400 shrink-0" />;
    case 'class':
      return <Box size={13} className="text-emerald-400 shrink-0" />;
    case 'property':
      return <Tag size={13} className="text-amber-400 shrink-0" />;
    case 'variable':
      return <Variable size={13} className="text-orange-400 shrink-0" />;
    default:
      return <FileCode size={13} className="text-sky-400 shrink-0" />;
  }
}

export const AutocompletePopover: React.FC<AutocompletePopoverProps> = ({
  items,
  selectedIndex,
  onSelect,
  position,
  onClose,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll selected item into view
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (items.length === 0) return null;

  return (
    <div
      ref={listRef}
      className="fixed z-50 w-72 max-h-56 overflow-y-auto rounded-xl bg-neutral-900/95 border border-neutral-700 shadow-2xl p-1 text-xs select-none backdrop-blur-md animate-in fade-in duration-100 font-mono"
      style={{
        top: `${Math.min(window.innerHeight - 240, Math.max(10, position.top))}px`,
        left: `${Math.min(window.innerWidth - 300, Math.max(10, position.left))}px`,
        boxShadow: '0 15px 35px -5px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      <div className="px-2 py-1 text-[10px] text-neutral-400 font-sans font-semibold border-b border-neutral-800 flex items-center justify-between">
        <span>Smart Suggestions</span>
        <span className="text-[9px] text-blue-400">Tab / Enter to insert</span>
      </div>

      {items.map((item, idx) => {
        const isSelected = idx === selectedIndex;
        return (
          <div
            key={item.label + idx}
            onMouseDown={e => {
              e.preventDefault();
              onSelect(item);
            }}
            className={`px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {getKindIcon(item.kind)}
              <span className="truncate">{item.label}</span>
            </div>
            <span
              className={`text-[10px] truncate max-w-[110px] font-sans ${
                isSelected ? 'text-blue-100' : 'text-neutral-400'
              }`}
            >
              {item.detail}
            </span>
          </div>
        );
      })}
    </div>
  );
};
