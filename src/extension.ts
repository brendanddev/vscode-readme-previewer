
/**
 * @file extension.ts
 * The main entry point for the README previewer VS Code extension
 */

import * as vscode from 'vscode';

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
	const previewReadMeDisposable = vscode.commands.registerCommand('vscode-readme-previewer.previewReadMe', async () => {
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

			// Set the HTML content of the webview panel
			panel.webview.html = `<html><body>${markdownString}</body></html>`;

		} catch (error) {
			vscode.window.showErrorMessage('Could not find or open README.md!');
		}
	});

	// Push both commands to subscriptions
	context.subscriptions.push(helloWorldDisposable, previewReadMeDisposable);
}

/**
 * Deactivates the extension
 */
export function deactivate() {}