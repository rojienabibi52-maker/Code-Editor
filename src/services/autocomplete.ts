import { FileItem, Project } from '../types/project';
import { AutocompleteItem, LogicSuggestion, SymbolItem } from '../types/editor';

const COMPOSE_COMPONENTS: AutocompleteItem[] = [
  {
    label: 'Text',
    kind: 'component',
    detail: 'Composable (text: String, modifier: Modifier, color: Color)',
    insertText: 'Text(\n    text = "$1",\n    style = MaterialTheme.typography.bodyLarge\n)',
    documentation: 'Displays text and provides accessibility information.',
  },
  {
    label: 'Button',
    kind: 'component',
    detail: 'Composable (onClick: () -> Unit, modifier: Modifier)',
    insertText: 'Button(\n    onClick = { $1 },\n    modifier = Modifier.fillMaxWidth()\n) {\n    Text("$2")\n}',
    documentation: 'Material 3 filled button with elevation and ripple.',
  },
  {
    label: 'Column',
    kind: 'component',
    detail: 'Composable (modifier: Modifier, verticalArrangement, horizontalAlignment)',
    insertText: 'Column(\n    modifier = Modifier.fillMaxSize().padding(16.dp),\n    verticalArrangement = Arrangement.spacedBy(8.dp)\n) {\n    $1\n}',
    documentation: 'A layout composable that places its children in a vertical sequence.',
  },
  {
    label: 'Row',
    kind: 'component',
    detail: 'Composable (modifier: Modifier, horizontalArrangement, verticalAlignment)',
    insertText: 'Row(\n    modifier = Modifier.fillMaxWidth(),\n    horizontalArrangement = Arrangement.SpaceBetween\n) {\n    $1\n}',
    documentation: 'A layout composable that places its children in a horizontal sequence.',
  },
  {
    label: 'Card',
    kind: 'component',
    detail: 'Composable (modifier: Modifier, colors: CardColors)',
    insertText: 'Card(\n    modifier = Modifier.fillMaxWidth(),\n    colors = CardDefaults.cardColors()\n) {\n    Column(modifier = Modifier.padding(16.dp)) {\n        $1\n    }\n}',
    documentation: 'Material 3 surface container with rounded corners and elevation.',
  },
  {
    label: 'Spacer',
    kind: 'component',
    detail: 'Composable (modifier: Modifier)',
    insertText: 'Spacer(modifier = Modifier.height(16.dp))',
    documentation: 'Component that represents an empty space with size specified in modifier.',
  },
  {
    label: 'TextField',
    kind: 'component',
    detail: 'Composable (value: String, onValueChange: (String) -> Unit)',
    insertText: 'TextField(\n    value = text,\n    onValueChange = { text = it },\n    label = { Text("$1") },\n    modifier = Modifier.fillMaxWidth()\n)',
    documentation: 'Material 3 text input field with animated floating label.',
  },
  {
    label: 'remember',
    kind: 'function',
    detail: 'remember { mutableStateOf(initialValue) }',
    insertText: 'var state by remember { mutableStateOf($1) }',
    documentation: 'Remember the value produced by calculation across recompositions.',
  },
];

const COMPOSE_MODIFIERS: AutocompleteItem[] = [
  { label: 'fillMaxSize', kind: 'property', detail: 'Modifier.fillMaxSize()', insertText: 'fillMaxSize()' },
  { label: 'fillMaxWidth', kind: 'property', detail: 'Modifier.fillMaxWidth()', insertText: 'fillMaxWidth()' },
  { label: 'fillMaxHeight', kind: 'property', detail: 'Modifier.fillMaxHeight()', insertText: 'fillMaxHeight()' },
  { label: 'padding', kind: 'property', detail: 'Modifier.padding(all: Dp)', insertText: 'padding(16.dp)' },
  { label: 'background', kind: 'property', detail: 'Modifier.background(color: Color)', insertText: 'background(MaterialTheme.colorScheme.surface)' },
  { label: 'clickable', kind: 'property', detail: 'Modifier.clickable { ... }', insertText: 'clickable { $1 }' },
  { label: 'wrapContentSize', kind: 'property', detail: 'Modifier.wrapContentSize()', insertText: 'wrapContentSize()' },
];

export const AutocompleteService = {
  getSuggestions(
    currentLine: string,
    cursorColumn: number,
    file: FileItem,
    projectSymbols: SymbolItem[]
  ): AutocompleteItem[] {
    const textBefore = currentLine.substring(0, cursorColumn);
    const trimmed = textBefore.trim();
    const ext = file.extension.toLowerCase();

    // Match word at cursor
    const wordMatch = textBefore.match(/([A-Za-z0-9_.]+)$/);
    const currentWord = wordMatch ? wordMatch[1] : '';

    if (!currentWord && !trimmed.endsWith('(') && !trimmed.endsWith('.')) {
      return [];
    }

    const suggestions: AutocompleteItem[] = [];

    // Modifier dot completion (e.g. Modifier. or modifier = Modifier.)
    if (textBefore.includes('Modifier.') || currentWord.startsWith('Modifier.')) {
      const propPart = currentWord.replace('Modifier.', '').toLowerCase();
      return COMPOSE_MODIFIERS.filter(m => m.label.toLowerCase().includes(propPart));
    }

    // Inside function arguments: e.g. Text( or Button(
    if (trimmed.endsWith('(') || trimmed.includes('(')) {
      const matchCall = trimmed.match(/([A-Za-z0-9_]+)\s*\([^)]*$/);
      if (matchCall) {
        const caller = matchCall[1];
        if (caller === 'Text') {
          return [
            { label: 'text', kind: 'property', detail: 'String', insertText: 'text = "$1"' },
            { label: 'style', kind: 'property', detail: 'TextStyle', insertText: 'style = MaterialTheme.typography.bodyLarge' },
            { label: 'color', kind: 'property', detail: 'Color', insertText: 'color = MaterialTheme.colorScheme.primary' },
            { label: 'fontSize', kind: 'property', detail: 'TextUnit', insertText: 'fontSize = 16.sp' },
            { label: 'fontWeight', kind: 'property', detail: 'FontWeight', insertText: 'fontWeight = FontWeight.Bold' },
            { label: 'modifier', kind: 'property', detail: 'Modifier', insertText: 'modifier = Modifier.' },
          ];
        } else if (caller === 'Button') {
          return [
            { label: 'onClick', kind: 'property', detail: '() -> Unit', insertText: 'onClick = { $1 }' },
            { label: 'modifier', kind: 'property', detail: 'Modifier', insertText: 'modifier = Modifier.fillMaxWidth()' },
            { label: 'enabled', kind: 'property', detail: 'Boolean', insertText: 'enabled = true' },
            { label: 'colors', kind: 'property', detail: 'ButtonColors', insertText: 'colors = ButtonDefaults.buttonColors()' },
          ];
        }
      }
    }

    // Match Kotlin Compose components
    if (ext === 'kt' || ext === 'kts') {
      const q = currentWord.toLowerCase();
      COMPOSE_COMPONENTS.forEach(c => {
        if (c.label.toLowerCase().includes(q)) {
          suggestions.push(c);
        }
      });
    }

    // Project Symbol Index suggestions
    const qSymbol = currentWord.toLowerCase();
    projectSymbols.forEach(s => {
      if (s.name.toLowerCase().includes(qSymbol) && !suggestions.some(ex => ex.label === s.name)) {
        suggestions.push({
          label: s.name,
          kind: s.kind === 'function' ? 'function' : s.kind === 'class' ? 'class' : 'variable',
          detail: `${s.kind} in ${s.fileName}`,
          insertText: s.kind === 'function' ? `${s.name}()` : s.name,
        });
      }
    });

    return suggestions.slice(0, 10);
  },

  getLogicSuggestions(
    currentLine: string,
    fileContent: string,
    cursorLine: number
  ): LogicSuggestion[] {
    const trimmed = currentLine.trim();
    const suggestions: LogicSuggestion[] = [];

    // Context 1: inside onClick = { or button action
    if (trimmed.includes('onClick = {') || trimmed.includes('onClick={') || trimmed.endsWith('onClick =')) {
      suggestions.push({
        id: 'logic-nav',
        title: 'Navigate to Screen',
        description: 'Trigger navigation intent or state routing',
        category: 'navigation',
        codeSnippet: '// Navigate to Destination Screen\nnavController.navigate("details_screen")',
      });
      suggestions.push({
        id: 'logic-toast',
        title: 'Show Toast Message',
        description: 'Display interactive feedback banner',
        category: 'action',
        codeSnippet: 'Toast.makeText(context, "Action triggered successfully", Toast.LENGTH_SHORT).show()',
      });
      suggestions.push({
        id: 'logic-counter',
        title: 'Update State Counter',
        description: 'Increment reactive counter variable',
        category: 'state',
        codeSnippet: 'counter++',
      });
      suggestions.push({
        id: 'logic-func',
        title: 'Call Custom Function',
        description: 'Invoke business logic handler',
        category: 'action',
        codeSnippet: 'handleButtonClick()',
      });
    }

    // Context 2: creating Composable function
    if (trimmed.startsWith('@Composable') || (trimmed.startsWith('fun ') && !fileContent.includes('@Composable\n' + trimmed))) {
      suggestions.push({
        id: 'logic-compose-template',
        title: 'Add Standard Screen Scaffold',
        description: 'Insert Scaffold with TopBar and Column content',
        category: 'ui',
        codeSnippet: `@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScreenContent() {
    Scaffold(
        topBar = { TopAppBar(title = { Text("Screen Title") }) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            Text("Content initialized")
        }
    }
}`,
      });
    }

    // Context 3: Modifier configuration
    if (trimmed.includes('Modifier.') && !trimmed.endsWith(')')) {
      suggestions.push({
        id: 'logic-mod-fill',
        title: 'Fill Max Size with Padding',
        description: 'Expand layout to fill parent with standard 16.dp spacing',
        category: 'ui',
        codeSnippet: 'Modifier.fillMaxSize().padding(16.dp)',
      });
    }

    return suggestions;
  },
};
