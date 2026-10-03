export const FormatterService = {
  formatCode(code: string, extension: string, tabSize = 4): string {
    if (!code) return '';
    const lines = code.split('\n');
    const indentChar = ' '.repeat(tabSize);
    let indentLevel = 0;
    const formattedLines: string[] = [];

    const isXml = extension.toLowerCase() === 'xml' || extension.toLowerCase() === 'html';

    for (let i = 0; i < lines.length; i++) {
      let trimmed = lines[i].trim();

      if (!trimmed) {
        formattedLines.push('');
        continue;
      }

      if (isXml) {
        // XML indentation handling
        if (trimmed.startsWith('</') || trimmed.endsWith('/>')) {
          if (trimmed.startsWith('</')) indentLevel = Math.max(0, indentLevel - 1);
          formattedLines.push(indentChar.repeat(indentLevel) + trimmed);
          continue;
        }

        const isOpeningTag = trimmed.startsWith('<') && !trimmed.startsWith('<?') && !trimmed.startsWith('<!') && !trimmed.includes('</');
        formattedLines.push(indentChar.repeat(indentLevel) + trimmed);
        if (isOpeningTag && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
          indentLevel++;
        }
        continue;
      }

      // Bracket-based formatting (Kotlin, Java, TS, JS, Dart)
      // Decrease indent if line starts with closing bracket
      if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // Calculate count of opening and closing brackets in this line
      const openBrackets = (trimmed.match(/[{(\[]/g) || []).length;
      const closeBrackets = (trimmed.match(/[})\]]/g) || []).length;

      formattedLines.push(indentChar.repeat(indentLevel) + trimmed);

      // Adjust indent level for next lines
      const delta = openBrackets - closeBrackets;
      if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
        // Already decreased before pushing
        indentLevel = Math.max(0, indentLevel + openBrackets);
      } else {
        indentLevel = Math.max(0, indentLevel + delta);
      }
    }

    return formattedLines.join('\n');
  },

  formatSelection(code: string, startOffset: number, endOffset: number, ext: string, tabSize = 4): string {
    const selected = code.substring(startOffset, endOffset);
    const formatted = this.formatCode(selected, ext, tabSize);
    return code.substring(0, startOffset) + formatted + code.substring(endOffset);
  },
};
