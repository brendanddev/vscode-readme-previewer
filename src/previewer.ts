
/**
 * @file previewer.ts
 * Handles setting and updating the content of the webview panel for README previewer extension
 */

import * as vscode from 'vscode';
import MarkdownIt from 'markdown-it';
import { getThemeCSS } from './theme';

const markdownParser = new MarkdownIt();


/**
 * Updates the content of the webview panel with the rendered Markdown content
 * and custom CSS based on the current VS Code theme
 * 
 * @param panel The webview panel to update
 * @param content The content to set in the webview
 */
export const updateWebViewContent = async (panel: vscode.WebviewPanel, content: string) => {
	try {
        // Render the Markdown content to HTML and get CSS for the current theme
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
				<div class="markdown-body">
					${htmlContent}
				</div>
			</body>
			</html>
		`;
	} catch (error) {
		vscode.window.showErrorMessage('Error updating webview content!');
	}
};
