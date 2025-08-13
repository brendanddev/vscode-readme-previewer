
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
		console.log('Congratulations, your extension "vscode-readme-previewer" is now active!');

		const disposable = vscode.commands.registerCommand('vscode-readme-previewer.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from vscode-readme-previewer!');
		});

		context.subscriptions.push(disposable);
}


/**
 * Deactivates the extension
 */
export function deactivate() {}