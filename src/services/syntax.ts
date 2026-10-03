import { SyntaxColorPalette } from '../types/settings';

export interface SyntaxToken {
  type:
    | 'keyword'
    | 'function'
    | 'classType'
    | 'variable'
    | 'string'
    | 'number'
    | 'comment'
    | 'operator'
    | 'property'
    | 'tag'
    | 'attribute'
    | 'bracket'
    | 'annotation'
    | 'colorValue'
    | 'plain';
  value: string;
  colorHex?: string; // If it's a color value like 0xFF2196F3 or #2563eb
}

const KOTLIN_KEYWORDS = new Set([
  'package', 'import', 'class', 'interface', 'fun', 'val', 'var', 'if', 'else', 'when',
  'for', 'while', 'do', 'return', 'override', 'public', 'private', 'protected', 'internal',
  'companion', 'object', 'data', 'sealed', 'is', 'in', 'as', 'by', 'suspend', 'null', 'true', 'false',
  'this', 'super', 'new', 'try', 'catch', 'finally', 'throw'
]);

const JS_KEYWORDS = new Set([
  'import', 'export', 'default', 'from', 'const', 'let', 'var', 'function', 'return',
  'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'class', 'extends',
  'new', 'this', 'super', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof',
  'instanceof', 'true', 'false', 'null', 'undefined', 'yield'
]);

const DART_KEYWORDS = new Set([
  'import', 'export', 'library', 'class', 'extends', 'with', 'implements', 'abstract',
  'final', 'const', 'var', 'late', 'dynamic', 'void', 'return', 'if', 'else', 'for',
  'while', 'switch', 'case', 'break', 'new', 'this', 'super', 'async', 'await', 'null', 'true', 'false'
]);

// Color pattern detection: #fff, #ffffff, 0xFF2196F3, 0xff0000, rgb(...), rgba(...)
export function detectColorCode(text: string): string | null {
  const hex6 = /^#([A-Fa-f0-9]{6})$/;
  const hex3 = /^#([A-Fa-f0-9]{3})$/;
  const hex8 = /^#([A-Fa-f0-9]{8})$/;
  const hexDart = /^0x([A-Fa-f0-9]{8})$/i;
  const hexSimple = /^0x([A-Fa-f0-9]{6})$/i;

  if (hex6.test(text) || hex3.test(text)) return text;
  if (hex8.test(text)) return '#' + text.slice(3, 9); // strip alpha for swatch preview
  if (hexDart.test(text)) {
    // 0xFF2196F3 -> #2196F3 (strip 0xFF ARGB alpha)
    return '#' + text.slice(4);
  }
  if (hexSimple.test(text)) {
    return '#' + text.slice(2);
  }
  return null;
}

export function tokenizeCodeLine(line: string, ext: string): SyntaxToken[] {
  if (!line) return [];

  // Comments
  const trimmed = line.trimStart();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('* ') || trimmed.startsWith('#')) {
    return [{ type: 'comment', value: line }];
  }

  // XML / HTML tags line
  if ((ext === 'xml' || ext === 'html') && line.includes('<') && line.includes('>')) {
    // Basic tag breakdown
    const tokens: SyntaxToken[] = [];
    const tagRegex = /(<\/?[a-zA-Z0-9_\.:-]+)|(\s+[a-zA-Z0-9_\.:-]+(?==))|(".*?")|([^<>\s]+)|([<>=\/])/g;
    let match: RegExpExecArray | null;
    let lastIdx = 0;

    while ((match = tagRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        tokens.push({ type: 'plain', value: line.slice(lastIdx, match.index) });
      }
      const val = match[0];
      if (match[1]) {
        tokens.push({ type: 'tag', value: val });
      } else if (match[2]) {
        tokens.push({ type: 'attribute', value: val });
      } else if (match[3]) {
        // Check if string contains color
        const cleanStr = val.replace(/^["']|["']$/g, '');
        const color = detectColorCode(cleanStr);
        tokens.push({ type: color ? 'colorValue' : 'string', value: val, colorHex: color || undefined });
      } else if (match[5]) {
        tokens.push({ type: 'bracket', value: val });
      } else {
        tokens.push({ type: 'plain', value: val });
      }
      lastIdx = tagRegex.lastIndex;
    }
    if (lastIdx < line.length) {
      tokens.push({ type: 'plain', value: line.slice(lastIdx) });
    }
    return tokens.length ? tokens : [{ type: 'plain', value: line }];
  }

  // Standard programming tokenization
  const tokens: SyntaxToken[] = [];
  const tokenRegex = /(@[A-Za-z0-9_]+)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(0x[0-9a-fA-F]+|\b\d+(?:\.\d+)?(?:f|L|dp|sp)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([{}()\[\]])|([+\-*\/%=<>!&|^~?:;.,])|(\s+)|([^\s\w{}()\[\]+\-*\/%=<>!&|^~?:;.,]+)/g;

  let match: RegExpExecArray | null;
  let lastIdx = 0;

  const isKotlin = ext === 'kt' || ext === 'kts' || ext === 'java';
  const isDart = ext === 'dart';
  const keywords = isKotlin ? KOTLIN_KEYWORDS : isDart ? DART_KEYWORDS : JS_KEYWORDS;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({ type: 'plain', value: line.slice(lastIdx, match.index) });
    }
    const val = match[0];

    if (match[1]) {
      // Annotation (@Composable, @Override, etc.)
      tokens.push({ type: 'annotation', value: val });
    } else if (match[2]) {
      // String
      const inner = val.slice(1, -1);
      const color = detectColorCode(inner);
      tokens.push({
        type: color ? 'colorValue' : 'string',
        value: val,
        colorHex: color || undefined,
      });
    } else if (match[3]) {
      // Number or Hex color like 0xFF2196F3
      const color = detectColorCode(val);
      if (color) {
        tokens.push({ type: 'colorValue', value: val, colorHex: color });
      } else {
        tokens.push({ type: 'number', value: val });
      }
    } else if (match[4]) {
      // Identifier: check keyword, class (starts with uppercase), function (followed by '(')
      if (keywords.has(val)) {
        tokens.push({ type: 'keyword', value: val });
      } else if (/^[A-Z][A-Za-z0-9_]*$/.test(val)) {
        tokens.push({ type: 'classType', value: val });
      } else if (line.slice(match.index + val.length).trimStart().startsWith('(')) {
        tokens.push({ type: 'function', value: val });
      } else {
        tokens.push({ type: 'variable', value: val });
      }
    } else if (match[5]) {
      tokens.push({ type: 'bracket', value: val });
    } else if (match[6]) {
      tokens.push({ type: 'operator', value: val });
    } else {
      tokens.push({ type: 'plain', value: val });
    }
    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < line.length) {
    tokens.push({ type: 'plain', value: line.slice(lastIdx) });
  }

  return tokens.length ? tokens : [{ type: 'plain', value: line }];
}

export function getTokenColor(type: SyntaxToken['type'], palette: SyntaxColorPalette): string {
  switch (type) {
    case 'keyword':
      return palette.keyword;
    case 'function':
      return palette.function;
    case 'classType':
      return palette.classType;
    case 'variable':
      return palette.variable;
    case 'string':
      return palette.string;
    case 'number':
      return palette.number;
    case 'comment':
      return palette.comment;
    case 'operator':
      return palette.operator;
    case 'property':
      return palette.property;
    case 'tag':
      return palette.tag;
    case 'attribute':
      return palette.attribute;
    case 'bracket':
      return palette.bracket;
    case 'annotation':
      return palette.annotation;
    case 'colorValue':
      return palette.colorSwatch;
    default:
      return 'inherit';
  }
}
