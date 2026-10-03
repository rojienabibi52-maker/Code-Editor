import { FileItem, Project } from '../types/project';
import { DiagnosticItem } from '../types/editor';

interface KnownImport {
  symbol: string;
  statement: string;
}

const KOTLIN_KNOWN_IMPORTS: KnownImport[] = [
  { symbol: 'remember', statement: 'import androidx.compose.runtime.remember' },
  { symbol: 'mutableStateOf', statement: 'import androidx.compose.runtime.mutableStateOf' },
  { symbol: 'getValue', statement: 'import androidx.compose.runtime.getValue' },
  { symbol: 'setValue', statement: 'import androidx.compose.runtime.setValue' },
  { symbol: 'Modifier', statement: 'import androidx.compose.ui.Modifier' },
  { symbol: 'dp', statement: 'import androidx.compose.ui.unit.dp' },
  { symbol: 'sp', statement: 'import androidx.compose.ui.unit.sp' },
  { symbol: 'Color', statement: 'import androidx.compose.ui.graphics.Color' },
  { symbol: 'Column', statement: 'import androidx.compose.foundation.layout.Column' },
  { symbol: 'Row', statement: 'import androidx.compose.foundation.layout.Row' },
  { symbol: 'Box', statement: 'import androidx.compose.foundation.layout.Box' },
  { symbol: 'Spacer', statement: 'import androidx.compose.foundation.layout.Spacer' },
  { symbol: 'Text', statement: 'import androidx.compose.material3.Text' },
  { symbol: 'Button', statement: 'import androidx.compose.material3.Button' },
  { symbol: 'Card', statement: 'import androidx.compose.material3.Card' },
  { symbol: 'Surface', statement: 'import androidx.compose.material3.Surface' },
  { symbol: 'MaterialTheme', statement: 'import androidx.compose.material3.MaterialTheme' },
  { symbol: 'Composable', statement: 'import androidx.compose.runtime.Composable' },
];

export const DiagnosticsService = {
  analyzeFile(file: FileItem, project: Project): DiagnosticItem[] {
    const diagnostics: DiagnosticItem[] = [];
    if (!file || !file.content) return diagnostics;

    const lines = file.content.split('\n');
    const ext = file.extension.toLowerCase();

    // 1. Bracket Matching Check
    const bracketStack: { char: string; line: number; col: number }[] = [];
    const openBrackets: Record<string, string> = { '{': '}', '(': ')', '[': ']' };
    const closeBrackets: Record<string, string> = { '}': '{', ')': '(', ']': '[' };

    lines.forEach((line, lineIdx) => {
      let inString = false;
      let quoteChar = '';

      for (let colIdx = 0; colIdx < line.length; colIdx++) {
        const char = line[colIdx];
        const prevChar = colIdx > 0 ? line[colIdx - 1] : '';

        // Ignore inside strings
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            quoteChar = char;
          } else if (quoteChar === char) {
            inString = false;
          }
          continue;
        }

        if (inString) continue;

        // Ignore comments
        if (char === '/' && line[colIdx + 1] === '/') break;

        if (openBrackets[char]) {
          bracketStack.push({ char, line: lineIdx + 1, col: colIdx + 1 });
        } else if (closeBrackets[char]) {
          if (bracketStack.length === 0) {
            diagnostics.push({
              id: `diag-unmatched-${lineIdx}-${colIdx}`,
              fileId: file.id,
              line: lineIdx + 1,
              column: colIdx + 1,
              severity: 'error',
              message: `Unmatched closing bracket '${char}'`,
              explanation: `A closing '${char}' was found without a matching opening bracket.`,
              suggestedFix: `Remove or fix bracket '${char}'`,
              fixAction: 'close_bracket',
            });
          } else {
            const last = bracketStack.pop()!;
            if (openBrackets[last.char] !== char) {
              diagnostics.push({
                id: `diag-mismatch-${lineIdx}-${colIdx}`,
                fileId: file.id,
                line: lineIdx + 1,
                column: colIdx + 1,
                severity: 'error',
                message: `Mismatched bracket: expected '${openBrackets[last.char]}' but found '${char}'`,
                explanation: `Bracket pair opened with '${last.char}' on line ${last.line} was closed with '${char}'.`,
                suggestedFix: `Change '${char}' to '${openBrackets[last.char]}'`,
              });
            }
          }
        }
      }
    });

    // Any unclosed brackets left?
    bracketStack.forEach(b => {
      diagnostics.push({
        id: `diag-unclosed-${b.line}-${b.col}`,
        fileId: file.id,
        line: b.line,
        column: b.col,
        severity: 'error',
        message: `Unclosed bracket '${b.char}'`,
        explanation: `The opening bracket '${b.char}' on line ${b.line} is never closed.`,
        suggestedFix: `Add closing '${openBrackets[b.char]}'`,
        fixAction: 'close_bracket',
        fixData: openBrackets[b.char],
      });
    });

    // 2. Language-Specific Checks
    if (ext === 'kt' || ext === 'kts') {
      // Check package header for Kotlin
      const hasPackage = lines.some(l => l.trim().startsWith('package '));
      if (!hasPackage && ext === 'kt' && !file.name.includes('build.gradle')) {
        diagnostics.push({
          id: `diag-no-pkg-${file.id}`,
          fileId: file.id,
          line: 1,
          column: 1,
          severity: 'warning',
          message: 'Missing package declaration',
          explanation: 'Kotlin source files in Android projects should declare a package matching directory structure.',
          suggestedFix: `Add package declaration: package ${project.packageName || 'com.codingide.app'}`,
          fixAction: 'add_import',
          fixData: `package ${project.packageName || 'com.codingide.app'}\n\n`,
        });
      }

      // Missing imports check
      KOTLIN_KNOWN_IMPORTS.forEach(ki => {
        const regex = new RegExp(`\\b${ki.symbol}\\b`);
        const isUsed = regex.test(file.content);
        const hasImport = file.content.includes(ki.statement) || file.content.includes(`${ki.statement.split('.').slice(0, -1).join('.')}.*`);

        if (isUsed && !hasImport && !file.content.includes(`fun ${ki.symbol}`) && !file.content.includes(`val ${ki.symbol}`)) {
          // Find first line using the symbol
          let foundLine = 1;
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              foundLine = i + 1;
              break;
            }
          }

          diagnostics.push({
            id: `diag-import-${ki.symbol}`,
            fileId: file.id,
            line: foundLine,
            column: 1,
            severity: 'warning',
            message: `Unresolved reference '${ki.symbol}'. Missing import?`,
            explanation: `Symbol '${ki.symbol}' is used but not explicitly imported from AndroidX or Kotlin standard library.`,
            suggestedFix: `Add ${ki.statement}`,
            fixAction: 'add_import',
            fixData: ki.statement,
            symbol: ki.symbol,
          });
        }
      });
    }

    // 3. Color Codes & Swatch Validation
    lines.forEach((line, idx) => {
      // Look for faulty hex colors like #12345 or #GGGGGG
      const hexPattern = /#([a-zA-Z0-9]+)/g;
      let match: RegExpExecArray | null;
      while ((match = hexPattern.exec(line)) !== null) {
        const hex = match[1];
        if (![3, 4, 6, 8].includes(hex.length) || !/^[0-9a-fA-F]+$/.test(hex)) {
          diagnostics.push({
            id: `diag-hex-${idx}-${match.index}`,
            fileId: file.id,
            line: idx + 1,
            column: match.index + 1,
            severity: 'error',
            message: `Invalid hex color value '#${hex}'`,
            explanation: 'Hex colors must be 3, 4, 6, or 8 hexadecimal characters (0-9, A-F).',
            suggestedFix: `Use valid format such as '#${hex.padEnd(6, '0').slice(0, 6)}'`,
            fixAction: 'fix_color',
            fixData: `#${hex.padEnd(6, '0').slice(0, 6)}`,
          });
        }
      }
    });

    // 4. AndroidManifest.xml validation
    if (file.name === 'AndroidManifest.xml') {
      if (!file.content.includes('android:name=".MainActivity"') && !file.content.includes('android:name="MainActivity"')) {
        diagnostics.push({
          id: 'diag-manifest-activity',
          fileId: file.id,
          line: 1,
          column: 1,
          severity: 'error',
          message: 'MainActivity not declared in AndroidManifest.xml',
          explanation: 'Android requires at least one launcher activity defined in the application manifest.',
          suggestedFix: 'Add MainActivity declaration with launcher intent-filter',
        });
      }
      if (!file.content.includes('android.intent.action.MAIN')) {
        diagnostics.push({
          id: 'diag-manifest-main-intent',
          fileId: file.id,
          line: 1,
          column: 1,
          severity: 'warning',
          message: 'No launcher intent filter found',
          explanation: 'The application cannot be launched from the device home screen without an intent-filter action MAIN.',
        });
      }
    }

    return diagnostics;
  },

  applyQuickFix(file: FileItem, diagnostic: DiagnosticItem): string {
    let content = file.content;

    switch (diagnostic.fixAction) {
      case 'add_import': {
        const importText = diagnostic.fixData as string;
        if (!importText) return content;

        if (importText.startsWith('package ')) {
          return importText + content;
        }

        // Insert after package or existing imports
        const lines = content.split('\n');
        let insertIndex = 0;
        let foundPackage = false;

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('package ')) {
            insertIndex = i + 1;
            foundPackage = true;
          } else if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
          }
        }

        if (foundPackage && insertIndex === 1) {
          lines.splice(insertIndex, 0, '', importText);
        } else {
          lines.splice(insertIndex, 0, importText);
        }
        return lines.join('\n');
      }

      case 'close_bracket': {
        const closing = (diagnostic.fixData as string) || '}';
        return content.trimEnd() + '\n' + closing + '\n';
      }

      case 'fix_color': {
        if (diagnostic.fixData) {
          // Replace invalid hex on that line
          const lines = content.split('\n');
          const targetLine = lines[diagnostic.line - 1];
          if (targetLine) {
            lines[diagnostic.line - 1] = targetLine.replace(/#[a-zA-Z0-9]+/, diagnostic.fixData);
            return lines.join('\n');
          }
        }
        return content;
      }

      default:
        return content;
    }
  },
};
