export interface CursorPosition {
  line: number;
  column: number;
  offset: number;
}

export interface SelectionRange {
  start: number;
  end: number;
}

export interface UndoItem {
  content: string;
  cursorOffset: number;
  timestamp: number;
}

export interface FileEditorState {
  fileId: string;
  cursorOffset: number;
  scrollTop: number;
  undoStack: UndoItem[];
  redoStack: UndoItem[];
}

export interface SearchOptions {
  query: string;
  replaceQuery: string;
  caseSensitive: boolean;
  matchCount: number;
  currentIndex: number;
  isOpen: boolean;
}

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface DiagnosticItem {
  id: string;
  fileId: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  severity: DiagnosticSeverity;
  message: string;
  explanation: string;
  suggestedFix?: string;
  fixAction?: 'add_import' | 'close_bracket' | 'fix_color' | 'format_code' | 'remove_unused' | 'create_function' | 'custom';
  fixData?: any;
  symbol?: string;
}

export interface AutocompleteItem {
  label: string;
  kind: 'keyword' | 'function' | 'class' | 'variable' | 'property' | 'snippet' | 'component';
  detail: string;
  insertText: string;
  documentation?: string;
  cursorMove?: number;
}

export interface LogicSuggestion {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  category: 'action' | 'import' | 'state' | 'navigation' | 'ui';
}

export interface NLCodeChange {
  type: 'create' | 'modify';
  path: string;
  fileId?: string;
  description: string;
  newContent: string;
}

export interface NLCodePlan {
  userPrompt: string;
  summary: string;
  changes: NLCodeChange[];
}

export interface SymbolItem {
  name: string;
  kind: 'class' | 'function' | 'variable' | 'interface' | 'component' | 'resource' | 'file';
  fileId: string;
  fileName: string;
  filePath: string;
  line: number;
  signature?: string;
}
