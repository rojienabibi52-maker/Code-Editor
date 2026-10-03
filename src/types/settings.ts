export type ThemeMode = 'dark' | 'light' | 'amoled' | 'ocean' | 'purple' | 'forest' | 'custom';
export type WorkspaceMode = 'code-only' | 'code-preview' | 'preview-only';

export interface ThemeColors {
  id: ThemeMode;
  name: string;
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  editorBg: string;
  editorGutterBg: string;
  editorCurrentLine: string;
  editorSelection: string;
  editorLineNumber: string;
  editorLineNumberActive: string;
}

export interface SyntaxColorPalette {
  keyword: string;
  function: string;
  classType: string;
  variable: string;
  string: string;
  number: string;
  comment: string;
  operator: string;
  property: string;
  tag: string;
  attribute: string;
  bracket: string;
  annotation: string;
  colorSwatch: string;
}

export interface AppSettings {
  theme: ThemeMode;
  customBgColor: string;
  customSurfaceColor: string;
  customTextColor: string;
  customAccentColor: string;
  fontSize: number;
  fontFamily: string;
  lineNumbers: boolean;
  indentGuides: boolean;
  codingKeyboard: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  confirmDelete: boolean;
  wordWrap: boolean;
  currentLineHighlight: boolean;
  tabSize: number;
  formatOnSave: boolean;
  soundEffects: boolean;
  viewMode: 'auto' | 'phone' | 'tablet' | 'desktop';
  desktopSplit: 'code-only' | 'code-preview';
  phoneSubTab: 'code' | 'preview';

  // Phase 2 Settings
  syntaxHighlighting: boolean;
  autocomplete: boolean;
  codeSuggestions: boolean;
  errorDetection: boolean;
  quickFix: boolean;
  codeFormatting: boolean;
  codeFolding: boolean;
  bracketMatching: boolean;
  autoClosingBrackets: boolean;
  autoClosingQuotes: boolean;
  workspaceMode: WorkspaceMode;
  previewAutoRefresh: boolean;
  previewDevice: 'phone' | 'tablet';
  previewOrientation: 'portrait' | 'landscape';
  autoSaveBeforeBuild: boolean;
  keepBuildHistory: boolean;
  cleanBuild: boolean;
  networkSimulateOffline: boolean;
}
