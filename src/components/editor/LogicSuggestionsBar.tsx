import React from 'react';
import { Lightbulb, Compass, MessageSquare, PlusCircle, Play, Sparkles, X } from 'lucide-react';
import { LogicSuggestion } from '../../types/editor';

interface LogicSuggestionsBarProps {
  suggestions: LogicSuggestion[];
  onApply: (snippet: string) => void;
  onDismiss: () => void;
}

function getCategoryIcon(cat: LogicSuggestion['category']) {
  switch (cat) {
    case 'navigation':
      return <Compass size={13} className="text-cyan-400 shrink-0" />;
    case 'action':
      return <Play size={13} className="text-emerald-400 shrink-0" />;
    case 'state':
      return <PlusCircle size={13} className="text-amber-400 shrink-0" />;
    default:
      return <Sparkles size={13} className="text-blue-400 shrink-0" />;
  }
}

export const LogicSuggestionsBar: React.FC<LogicSuggestionsBarProps> = ({
  suggestions,
  onApply,
  onDismiss,
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="border-t border-neutral-800 bg-neutral-900/95 p-2 px-3 flex items-center justify-between gap-2 overflow-x-auto select-none backdrop-blur-md text-xs shrink-0">
      <div className="flex items-center gap-1.5 shrink-0 text-neutral-400">
        <Lightbulb size={14} className="text-amber-400" />
        <span className="font-semibold text-[11px] text-neutral-300 hidden sm:inline">Next Logic:</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1">
        {suggestions.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => onApply(s.codeSnippet)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700/80 hover:border-blue-500 hover:bg-neutral-700/80 text-neutral-200 transition-all text-xs shrink-0 font-medium active:scale-95"
            title={s.description}
          >
            {getCategoryIcon(s.category)}
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white shrink-0"
        title="Dismiss suggestions"
      >
        <X size={13} />
      </button>
    </div>
  );
};
