import React, { useState, useMemo } from 'react';
import { Search, Hash, Box, FunctionSquare, Component, FileCode, Tag, ArrowRight } from 'lucide-react';
import { useIDE } from '../../context/IDEContext';
import { Modal } from '../common/Modal';
import { SymbolItem } from '../../types/editor';
import { SymbolIndexService } from '../../services/symbolIndex';

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: SymbolItem) => void;
  onGoToLine: (line: number) => void;
}

function getSymbolIcon(kind: SymbolItem['kind']) {
  switch (kind) {
    case 'class':
      return <Box size={14} className="text-emerald-400 shrink-0" />;
    case 'function':
      return <FunctionSquare size={14} className="text-blue-400 shrink-0" />;
    case 'component':
      return <Component size={14} className="text-violet-400 shrink-0" />;
    case 'resource':
      return <Tag size={14} className="text-amber-400 shrink-0" />;
    case 'file':
      return <FileCode size={14} className="text-sky-400 shrink-0" />;
    default:
      return <Hash size={14} className="text-neutral-400 shrink-0" />;
  }
}

export const SymbolSearchModal: React.FC<SymbolSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  onGoToLine,
}) => {
  const { projectSymbols } = useIDE();
  const [query, setQuery] = useState('');

  const isLineJump = query.startsWith(':') || /^\d+$/.test(query.trim());

  const filteredSymbols = useMemo(() => {
    if (isLineJump) return [];
    return SymbolIndexService.searchSymbols(projectSymbols, query);
  }, [projectSymbols, query, isLineJump]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isLineJump) {
        const lineNum = parseInt(query.replace(':', '').trim(), 10);
        if (!isNaN(lineNum) && lineNum > 0) {
          onGoToLine(lineNum);
          onClose();
        }
      } else if (filteredSymbols.length > 0) {
        onSelectSymbol(filteredSymbols[0]);
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Go to Symbol / Line"
      subtitle="Search classes, functions, resources, or type ':42' to jump to line"
      icon={<Search size={18} className="text-blue-400" />}
      maxWidth="md"
    >
      <div className="space-y-3 text-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type symbol name or ':number' for line..."
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        {isLineJump ? (
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-center space-y-2">
            <span className="text-neutral-400">Jump to line:</span>
            <div className="text-xl font-mono font-bold text-blue-400">
              Line {query.replace(':', '').trim() || '1'}
            </div>
            <button
              onClick={() => {
                const lineNum = parseInt(query.replace(':', '').trim(), 10);
                if (!isNaN(lineNum)) onGoToLine(lineNum);
                onClose();
              }}
              className="mt-2 px-4 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
            >
              Go to Line
            </button>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {filteredSymbols.length === 0 ? (
              <div className="py-8 text-center text-neutral-500">No matching symbols found.</div>
            ) : (
              filteredSymbols.map((s, idx) => (
                <div
                  key={s.name + s.filePath + s.line + idx}
                  onClick={() => {
                    onSelectSymbol(s);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getSymbolIcon(s.kind)}
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-200 font-mono truncate">{s.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {s.fileName} : line {s.line}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase font-sans">
                    {s.kind}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
