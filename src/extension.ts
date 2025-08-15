
/**
 * @file extension.ts
 * The main entry point for the README previewer VS Code extension
 */

import * as vscode from 'vscode';
import { updateWebViewContent } from './previewer';
import { COMMANDS, PreviewPanelState, CONFIG_SECTION } from './types';
import { showColorPicker, createStatusBarItem, showQuickColorPopup } from './colorPicker';

// To keep track of the active webview panel and its state
let activePanel: vscode.WebviewPanel | undefined;
let activeReadmeUri: vscode.Uri | undefined;
let styleStatusBarItem: vscode.StatusBarItem | undefined;

/**
 * Called when the extension is activated
 * 
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Activating extension "vscode-readme-previewer"...');

	// Create status bar item for color picker
	createStatusBarItem(context);

	// Create status bar item for style switcher
	createStyleStatusBarItem(context);

	// Hello World command
	const helloWorldDisposable = vscode.commands.registerCommand(COMMANDS.HELLO_WORLD, () => {
        vscode.window.showInformationMessage('Hello World!');
    });

	// Preview README command
	const previewDisposable = vscode.commands.registerCommand(COMMANDS.PREVIEW_README, async () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Open a folder first!');
            return;
        }

        const readmeUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'README.md');

        try {
			// Fetch README.md content from workspace
			const readmeContent = await vscode.workspace.fs.readFile(readmeUri);
            const markdownString = new TextDecoder().decode(readmeContent);

			// Create and show a new webview panel
            const panelState: PreviewPanelState = {
                panel: vscode.window.createWebviewPanel('readmePreview', 'README Preview', vscode.ViewColumn.Beside, { enableScripts: true }),
                readmeUri,
                watcher: vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.workspace.workspaceFolders[0], 'README.md')),
                disposables: []
            };

			// Track the active panel and README URI for live updates
			activePanel = panelState.panel;
			activeReadmeUri = readmeUri;

            // Update content initially
            updateWebViewContent(panelState.panel, markdownString);

            // Show quick color picker popup
            showQuickColorPopup();

            // Watch file changes
            panelState.watcher.onDidChange(async () => {
                const updatedContent = new TextDecoder().decode(await vscode.workspace.fs.readFile(readmeUri));
                updateWebViewContent(panelState.panel, updatedContent);
            });

			// Listen for theme changes
			const themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
				updateWebViewContent(panelState.panel, markdownString);
			});
			panelState.disposables.push(themeListener);

			// Listen for config changes
			const configListener = vscode.workspace.onDidChangeConfiguration(event => {
				if (event.affectsConfiguration('readmePreviewer')) {
					updateWebViewContent(panelState.panel, markdownString);
					updateStyleStatusBarText();
				}
			});
			panelState.disposables.push(configListener);

            // Dispose resources when panel closes
            panelState.panel.onDidDispose(() => {
				activePanel = undefined;
    			activeReadmeUri = undefined;
                panelState.watcher.dispose();
                panelState.disposables.forEach(d => d.dispose());
            });
        } catch (err) {
            vscode.window.showErrorMessage('Could not open README.md!');
        }
    });

	// Color picker command
	const colorPickerDisposable = vscode.commands.registerCommand(COMMANDS.COLOR_PICKER, () => {
		showColorPicker();
	});

	// Switch style command
	const switchStyleDisposable = vscode.commands.registerCommand(COMMANDS.SWITCH_STYLE, async () => {
		const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
		const currentStyle = config.get('style') || 'modern';
		const newStyle = currentStyle === 'modern' ? 'basic' : 'modern';
		
		await config.update('style', newStyle, vscode.ConfigurationTarget.Global);
		
		// Refresh preview if active
		if (activePanel && activeReadmeUri) {
			const readmeContent = await vscode.workspace.fs.readFile(activeReadmeUri);
			const markdownString = new TextDecoder().decode(readmeContent);
			updateWebViewContent(activePanel, markdownString);
		}
		
		updateStyleStatusBarText();
		
		vscode.window.showInformationMessage(`Switched to ${newStyle} style!`);
	});

	// Refresh preview command (called by color picker)
	const refreshPreviewDisposable = vscode.commands.registerCommand(COMMANDS.REFRESH_PREVIEW, async () => {
		if (activePanel && activeReadmeUri) {
			const readmeContent = await vscode.workspace.fs.readFile(activeReadmeUri);
			const markdownString = new TextDecoder().decode(readmeContent);
			updateWebViewContent(activePanel, markdownString);
		}
	});
	
	context.subscriptions.push(helloWorldDisposable, previewDisposable, colorPickerDisposable, switchStyleDisposable, refreshPreviewDisposable);
}

/**
 * Creates the status bar item for the style switcher
 */
function createStyleStatusBarItem(context: vscode.ExtensionContext): void {
	styleStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 150);
	styleStatusBarItem.command = COMMANDS.SWITCH_STYLE;
	updateStyleStatusBarText();
	styleStatusBarItem.show();
	context.subscriptions.push(styleStatusBarItem);
}

/**
 * Updates the style status bar text based on current configuration
 */
function updateStyleStatusBarText(): void {
	if (styleStatusBarItem) {
		const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
		const currentStyle = config.get('style') || 'modern';
		styleStatusBarItem.text = currentStyle === 'modern' ? '🎨 Modern' : '📝 Basic';
		styleStatusBarItem.tooltip = `Current style: ${currentStyle}. Click to switch to ${currentStyle === 'modern' ? 'basic' : 'modern'} style.`;
	}
}

/**
 * Deactivates the extension
 */
export function deactivate() {}

