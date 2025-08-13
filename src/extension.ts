
/**
 * @file extension.ts
 * The main entry point for the README previewer VS Code extension
 */

import * as vscode from 'vscode';
import { updateWebViewContent } from './previewer';
import { COMMANDS, PreviewPanelState } from './types';

// To keep track of the active webview panel and its state
let activePanel: vscode.WebviewPanel | undefined;
let activeReadmeUri: vscode.Uri | undefined;

/**
 * Called when the extension is activated
 * 
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Activating extension "vscode-readme-previewer"...');

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

	// Pick colors command
	const pickColorsDisposable = vscode.commands.registerCommand('vscode-readme-previewer.pickColors', async () => {
		
		// Prompt user for text color
		const text = await vscode.window.showInputBox({
			prompt: 'Pick text color (hex, e.g., #333333)',
			placeHolder: '#000000'
		});
		if (!text) return;

		// Prompt user for background color
		const bg = await vscode.window.showInputBox({
            prompt: 'Pick background color (hex, e.g., #ffcccc)',
            placeHolder: '#ffffff'
        });
        if (!bg) return;

		// Save to workspace configuration
        const config = vscode.workspace.getConfiguration('readmePreviewer');
        await config.update('backgroundColor', bg, vscode.ConfigurationTarget.Global);
        await config.update('textColor', text, vscode.ConfigurationTarget.Global);

		// Find the open preview panel (if any) and update it
        vscode.window.visibleTextEditors.forEach(editor => {
            // you can also track your panelState and updateWebViewContent(panelState.panel, markdownString)
        });

		vscode.window.showInformationMessage(`Theme updated! Background: ${bg}, Text: ${text}`);
	});
	
	context.subscriptions.push(helloWorldDisposable, previewDisposable, pickColorsDisposable);
}


/**
 * Deactivates the extension
 */
export function deactivate() {}

