
/**
 * @file extension.ts
 * The main entry point for the README previewer VS Code extension
 */

import * as vscode from 'vscode';
import { updateWebViewContent } from './previewer';


/**
 * Called when the extension is activated
 * 
 * @param context The extension context provided by VS Code
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Activating extension "vscode-readme-previewer"...');

	// Hello World command
	const helloWorldDisposable = vscode.commands.registerCommand('vscode-readme-previewer.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vscode-readme-previewer!');
	});

	// Preview README command
	const previewReadMeDisposable = vscode.commands.registerCommand(
		'vscode-readme-previewer.previewReadMe', 
		async () => {
			if (!vscode.workspace.workspaceFolders) {
				vscode.window.showErrorMessage('No workspace folder is open. Please open a folder to preview README.md.');
				return;
			}
			
			const readmeUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders![0].uri, 'README.md');	
	
			try {
				// Fetch README.md content from workspace
				const readmeContent = await vscode.workspace.fs.readFile(readmeUri);
				const markdownString = new TextDecoder().decode(readmeContent);

				// Create and show a new webview panel
				const panel = vscode.window.createWebviewPanel(
					'readmePreview',
					'README Preview',
					vscode.ViewColumn.Beside,
					{ enableScripts: true }
				);

				// Set initial content of the webview
				updateWebViewContent(panel, markdownString);

				// Create watcher to watch for changes in README file
				const watcher = vscode.workspace.createFileSystemWatcher(
					new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], 'README.md')
				);

				// Update the webview content when README.md changes
				watcher.onDidChange(async () => {
					const updatedContent = new TextDecoder().decode(await vscode.workspace.fs.readFile(readmeUri));
					updateWebViewContent(panel, updatedContent);
				});

				// Update the webview content when the active color theme changes
				const themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
					updateWebViewContent(panel, markdownString);
				});

				// Update the webview content when user changes settings
				const configListener = vscode.workspace.onDidChangeConfiguration(e => {
					if (e.affectsConfiguration('readmePreviewer')) {
						updateWebViewContent(panel, markdownString);
					}
				});

				// Dispose watcher and listeners when the panel is closed
				panel.onDidDispose(() => {
					watcher.dispose();
					themeListener.dispose();
					configListener.dispose();
				});

			} catch (error) {
				vscode.window.showErrorMessage('Could not find or open README.md!');
			}
		}
	);
	// Push both commands to subscriptions
	context.subscriptions.push(helloWorldDisposable, previewReadMeDisposable);
}

/**
 * Deactivates the extension
 */
export function deactivate() {}

