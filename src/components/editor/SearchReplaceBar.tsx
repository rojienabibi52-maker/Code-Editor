import React, { useState } from 'react';
import { Search, Replace, ChevronUp, ChevronDown, X, CaseSensitive } from 'lucide-react';
import { Button3D } from '../common/Button3D';

interface SearchReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  onFind: (query: string, caseSensitive: boolean) => void;
  onReplace: (search: string, replaceWith: string, replaceAll: boolean) => void;
  onNavigateMatch: (direction: 'next' | 'prev') => void;
  matchCount: number;
  currentMatchIndex: number;
}

export const SearchReplaceBar: React.FC<SearchReplaceBarProps> = ({
  isOpen,
  onClose,
  onFind,
  onReplace,
  onNavigateMatch,
  matchCount,
  currentMatchIndex,
}) => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [showReplace, setShowReplace] = useState(false);

  if (!isOpen) return null;

  const handleQueryChange = (val: string) => {
    setQuery(val);
    onFind(val, caseSensitive);
  };

  const toggleCase = () => {
    const next = !caseSensitive;
    setCaseSensitive(next);
    onFind(query, next);
  };

  return (
    <div
      className="p-2 border-b bg-neutral-900/95 border-neutral-800 backdrop-blur-md shadow-md text-xs space-y-2 select-none animate-in slide-in-from-top-1 duration-150"
    >
      {/* Search Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-2.5 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onNavigateMatch(e.shiftKey ? 'prev' : 'next');
              if (e.key === 'Escape') onClose();
            }}
            placeholder="Find in file..."
            autoFocus
            className="w-full pl-8 pr-16 py-1.5 rounded-md bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-blue-500"
          />
          <div className="absolute right-2 top-2 text-[10px] text-neutral-400 font-mono">
            {query ? (matchCount > 0 ? `${currentMatchIndex + 1}/${matchCount}` : 'No match') : ''}
          </div>
        </div>

        <button
          onClick={toggleCase}
          className={`p-1.5 rounded border transition-colors ${
            caseSensitive
              ? 'bg-blue-600/30 border-blue-500 text-blue-300'
              : 'border-neutral-700 text-neutral-400 hover:text-white'
          }`}
          title="Match Case"
        >
          <CaseSensitive size={14} />
        </button>

        <button
          onClick={() => onNavigateMatch('prev')}
          disabled={matchCount === 0}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40"
          title="Previous Match"
        >
          <ChevronUp size={15} />
        </button>

        <button
          onClick={() => onNavigateMatch('next')}
          disabled={matchCount === 0}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white disabled:opacity-40"
          title="Next Match"
        >
          <ChevronDown size={15} />
        </button>

        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`px-2 py-1 rounded text-[11px] font-medium border ${
            showReplace
              ? 'bg-neutral-800 border-neutral-600 text-blue-400'
              : 'border-neutral-700 text-neutral-400 hover:text-white'
          }`}
        >
          Replace
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white"
          title="Close Find"
        >
          <X size={14} />
        </button>
      </div>

      {/* Replace Input Row */}
      {showReplace && (
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-800">
          <div className="relative flex-1">
            <Replace size={13} className="absolute left-2.5 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              placeholder="Replace with..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-neutral-950 border border-neutral-700 text-white placeholder-neutral-500 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button3D
            variant="surface"
            size="sm"
            onClick={() => onReplace(query, replaceText, false)}
            disabled={!query || matchCount === 0}
          >
            Replace
          </Button3D>

          <Button3D
            variant="surface"
            size="sm"
            onClick={() => onReplace(query, replaceText, true)}
            disabled={!query || matchCount === 0}
          >
            All
          </Button3D>
        </div>
      )}
    </div>
  );
};
