export interface CodingShortcutKey {
  id: string;
  label: string;
  insert: string;
  pair?: boolean;
  action?: 'tab' | 'undo' | 'redo' | 'paste' | 'left' | 'right' | 'select-all';
}

export const CODING_SHORTCUT_KEYS: CodingShortcutKey[] = [
  { id: 'tab', label: 'Tab', insert: '  ', action: 'tab' },
  { id: 'brace_pair', label: '{ }', insert: '{}', pair: true },
  { id: 'paren_pair', label: '( )', insert: '()', pair: true },
  { id: 'bracket_pair', label: '[ ]', insert: '[]', pair: true },
  { id: 'angle_pair', label: '< >', insert: '<>', pair: true },
  { id: 'quote_double', label: '"', insert: '"' },
  { id: 'quote_single', label: '\'', insert: '\'' },
  { id: 'backtick', label: '`', insert: '`' },
  { id: 'equals', label: '=', insert: '=' },
  { id: 'semicolon', label: ';', insert: ';' },
  { id: 'colon', label: ':', insert: ':' },
  { id: 'slash', label: '/', insert: '/' },
  { id: 'backslash', label: '\\', insert: '\\' },
  { id: 'plus', label: '+', insert: '+' },
  { id: 'minus', label: '-', insert: '-' },
  { id: 'star', label: '*', insert: '*' },
  { id: 'percent', label: '%', insert: '%' },
  { id: 'exclamation', label: '!', insert: '!' },
  { id: 'question', label: '?', insert: '?' },
  { id: 'hash', label: '#', insert: '#' },
  { id: 'at', label: '@', insert: '@' },
  { id: 'ampersand', label: '&', insert: '&' },
  { id: 'pipe', label: '|', insert: '|' },
  { id: 'dollar', label: '$', insert: '$' },
  { id: 'underscore', label: '_', insert: '_' },
  { id: 'arrow_right', label: '->', insert: '->' },
  { id: 'fat_arrow', label: '=>', insert: '=>' },
  { id: 'dot', label: '.', insert: '.' },
  { id: 'comma', label: ',', insert: ',' },
  { id: 'cursor_left', label: '<-', insert: '', action: 'left' },
  { id: 'cursor_right', label: '->', insert: '', action: 'right' },
  { id: 'undo', label: 'Undo', insert: '', action: 'undo' },
  { id: 'redo', label: 'Redo', insert: '', action: 'redo' },
  { id: 'select_all', label: 'All', insert: '', action: 'select-all' },
];
