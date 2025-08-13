
/**
 * @file extension.ts
 * The main entry point for the README previewer VS Code extension
 */

import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';


const markdownParser = new MarkdownIt();


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

				// Dispose watcher when the panel is closed
				panel.onDidDispose(() => {
					watcher.dispose();
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

/**
 * Updates the content of the webview panel
 * 
 * @param panel The webview panel to update
 * @param content The content to set in the webview
 */
const updateWebViewContent = async (panel: vscode.WebviewPanel, content: string) => {
	try {
		const htmlContent = markdownParser.render(content);
		panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>README Preview</title>
			</head>
			<body>
				${htmlContent}
			</body>
			</html>
		`;
	} catch (error) {
		vscode.window.showErrorMessage('Error updating webview content!');
	}

};