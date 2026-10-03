import { Project, FileItem } from '../types/project';
import { SymbolItem } from '../types/editor';

export const SymbolIndexService = {
  buildProjectIndex(project: Project): SymbolItem[] {
    const symbols: SymbolItem[] = [];

    // Add file entries
    Object.values(project.files).forEach(f => {
      symbols.push({
        name: f.name,
        kind: 'file',
        fileId: f.id,
        fileName: f.name,
        filePath: f.path,
        line: 1,
      });

      // Extract symbols from file content
      const fileSymbols = this.extractSymbolsFromFile(f);
      symbols.push(...fileSymbols);
    });

    return symbols;
  },

  extractSymbolsFromFile(file: FileItem): SymbolItem[] {
    const symbols: SymbolItem[] = [];
    if (!file.content) return symbols;

    const lines = file.content.split('\n');
    const ext = file.extension.toLowerCase();

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      if (ext === 'kt' || ext === 'kts' || ext === 'java') {
        // Classes & Interfaces
        const classMatch = trimmed.match(/\b(class|interface|object|enum class)\s+([A-Za-z0-9_]+)/);
        if (classMatch) {
          symbols.push({
            name: classMatch[2],
            kind: classMatch[1] === 'interface' ? 'interface' : 'class',
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: lineNum,
            signature: trimmed,
          });
        }

        // Functions / Composables
        const funMatch = trimmed.match(/\bfun\s+(?:<[^>]+>\s+)?(?:[A-Za-z0-9_]+\.)?([A-Za-z0-9_]+)\s*\(/);
        if (funMatch) {
          symbols.push({
            name: funMatch[1],
            kind: trimmed.includes('@Composable') || lines[Math.max(0, idx - 1)]?.includes('@Composable') ? 'component' : 'function',
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: lineNum,
            signature: trimmed.split('{')[0].trim(),
          });
        }

        // Val / Var properties
        const valMatch = trimmed.match(/\b(val|var)\s+([A-Za-z0-9_]+)(?:\s*:\s*([A-Za-z0-9_<>,?\s]+))?/);
        if (valMatch && !trimmed.includes('fun ') && !trimmed.includes('class ')) {
          symbols.push({
            name: valMatch[2],
            kind: 'variable',
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: lineNum,
            signature: valMatch[0],
          });
        }
      } else if (ext === 'tsx' || ext === 'jsx' || ext === 'ts' || ext === 'js') {
        // React components / functions
        const funcMatch = trimmed.match(/\b(?:export\s+)?(?:function|const)\s+([A-Za-z0-9_]+)\s*(?:=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>|\()/);
        if (funcMatch) {
          symbols.push({
            name: funcMatch[1],
            kind: /^[A-Z]/.test(funcMatch[1]) ? 'component' : 'function',
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: lineNum,
            signature: trimmed.split('{')[0].trim(),
          });
        }
      } else if (ext === 'xml') {
        // XML String resources: <string name="app_name">
        const resMatch = trimmed.match(/<(string|color|dimen|drawable)\s+name="([A-Za-z0-9_]+)"/);
        if (resMatch) {
          symbols.push({
            name: `R.${resMatch[1]}.${resMatch[2]}`,
            kind: 'resource',
            fileId: file.id,
            fileName: file.name,
            filePath: file.path,
            line: lineNum,
            signature: trimmed,
          });
        }
      }
    });

    return symbols;
  },

  searchSymbols(symbols: SymbolItem[], query: string): SymbolItem[] {
    if (!query.trim()) return symbols.slice(0, 30);
    const q = query.toLowerCase();
    return symbols
      .filter(s => s.name.toLowerCase().includes(q) || s.filePath.toLowerCase().includes(q))
      .slice(0, 40);
  },

  findDefinition(symbols: SymbolItem[], symbolName: string): SymbolItem | null {
    const clean = symbolName.replace(/^[^\w]+|[^\w]+$/g, '');
    return symbols.find(s => s.name === clean) || null;
  },
};
