
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

				// Update the webview content when the active color theme changes
				const themeListener = vscode.window.onDidChangeActiveColorTheme(() => {
					updateWebViewContent(panel, markdownString);
				});

				// Dispose watcher when the panel is closed
				panel.onDidDispose(() => {
					watcher.dispose();
					themeListener.dispose();
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
		const css = getThemeCSS();

		// Set the HTML content of the webview
		panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>README Preview</title>
				<style>${css}</style>
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

/**
 * Generates CSS for the webview based on the current VS Code theme
 * 
 * @returns {string} The CSS string to apply to the webview
 */
const getThemeCSS = (): string => {
	const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	return `
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
			padding: 16px;
			background-color: ${isDark ? '#1e1e1e' : '#ffffff'};
			color: ${isDark ? '#d4d4d4' : '#000000'};
		}
		pre {
			background-color: ${isDark ? '#252526' : '#f3f3f3'};
			padding: 8px;
			border-radius: 4px;
			overflow-x: auto;
		}
		blockquote {
			border-left: 4px solid ${isDark ? '#555' : '#ccc'};
			padding-left: 8px;
			color: ${isDark ? '#999' : '#555'};
		}
		table {
			border-collapse: collapse;
		}
		th, td {
			border: 1px solid ${isDark ? '#555' : '#ccc'};
			padding: 4px 8px;
		}
	`;
};
