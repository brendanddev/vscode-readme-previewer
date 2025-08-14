
/**
 * @file colorPicker.ts
 * Handles the interactive color picker webview for the README previewer extension
 */

import * as vscode from 'vscode';

let colorPickerPanel: vscode.WebviewPanel | undefined;
let colorPickerStatusBarItem: vscode.StatusBarItem | undefined;

/**
 * Creates and shows the color picker webview
 */
export function showColorPicker(): void {
	// If color picker panel already exists, show it
	if (colorPickerPanel) {
		colorPickerPanel.reveal();
		return;
	}

	// Create color picker webview panel
	colorPickerPanel = vscode.window.createWebviewPanel(
		'colorPicker',
		'README Preview Color Picker',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	// Get current configuration
	const config = vscode.workspace.getConfiguration('readmePreviewer');
	const currentBgColor = (config.get('backgroundColor') as string) || '';
	const currentTextColor = (config.get('textColor') as string) || '';

	// Set webview content
	colorPickerPanel.webview.html = getColorPickerWebviewContent(
		colorPickerPanel.webview,
		currentBgColor,
		currentTextColor
	);

	// Handle messages from webview
	colorPickerPanel.webview.onDidReceiveMessage(
		async (message) => {
			switch (message.command) {
				case 'updateColors':
					// Update configuration
					await config.update('backgroundColor', message.backgroundColor, vscode.ConfigurationTarget.Global);
					await config.update('textColor', message.textColor, vscode.ConfigurationTarget.Global);

					// Notify that colors have changed (will be handled by the main extension)
					vscode.commands.executeCommand('vscode-readme-previewer.refreshPreview');
					break;
			}
		}
	);
	// Clean up when panel is disposed
	colorPickerPanel.onDidDispose(() => {
		colorPickerPanel = undefined;
	});
}

/**
 * Creates the status bar item for the color picker
 */
export function createStatusBarItem(context: vscode.ExtensionContext): void {
	colorPickerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
	colorPickerStatusBarItem.command = 'vscode-readme-previewer.colorPicker';
	colorPickerStatusBarItem.text = "🎨 Colors";
	colorPickerStatusBarItem.tooltip = "Open README Preview Color Picker";
	colorPickerStatusBarItem.show();
	context.subscriptions.push(colorPickerStatusBarItem);
}

/**
 * Shows a quick color picker popup when README preview is opened
 */
export function showQuickColorPopup(): void {
	const config = vscode.workspace.getConfiguration('readmePreviewer');
	const currentBgColor = (config.get('backgroundColor') as string) || '';
	const currentTextColor = (config.get('textColor') as string) || '';

	vscode.window.showInformationMessage(
		`README Preview opened! ${currentBgColor || currentTextColor ? 'Custom colors active.' : 'Using VS Code theme colors.'} Click the paintbrush icon in the status bar to customize colors.`,
		'Open Color Picker'
	).then(selection => {
		if (selection === 'Open Color Picker') {
			showColorPicker();
		}
	});
}

/**
 * Generates the HTML content for the color picker webview
 */
function getColorPickerWebviewContent(
	webview: vscode.Webview,
	currentBgColor: string,
	currentTextColor: string
): string {
	const nonce = getNonce();

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
	<title>README Preview Color Picker</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
			padding: 20px;
			background-color: var(--vscode-editor-background);
			color: var(--vscode-editor-foreground);
			margin: 0;
		}
		.container {
			max-width: 500px;
			margin: 0 auto;
		}
		.color-section {
			margin-bottom: 24px;
			padding: 16px;
			background-color: var(--vscode-editor-inactiveSelectionBackground);
			border-radius: 8px;
		}
		.color-section h3 {
			margin-top: 0;
			margin-bottom: 12px;
			color: var(--vscode-editor-foreground);
		}
		.color-input-group {
			display: flex;
			align-items: center;
			gap: 12px;
			margin-bottom: 8px;
		}
		.color-input {
			width: 50px;
			height: 40px;
			border: 2px solid var(--vscode-input-border);
			border-radius: 4px;
			cursor: pointer;
			background: none;
		}
		.color-input:hover {
			border-color: var(--vscode-focusBorder);
		}
		.hex-input {
			flex: 1;
			padding: 8px 12px;
			border: 1px solid var(--vscode-input-border);
			border-radius: 4px;
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			font-family: 'Consolas', 'Monaco', monospace;
		}
		.hex-input:focus {
			outline: none;
			border-color: var(--vscode-focusBorder);
		}
		.preview-box {
			width: 100%;
			height: 100px;
			border: 2px solid var(--vscode-input-border);
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-top: 16px;
			transition: all 0.2s ease;
		}
		.preview-text {
			font-size: 16px;
			font-weight: 500;
		}
		.reset-button {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			border: none;
			padding: 8px 16px;
			border-radius: 4px;
			cursor: pointer;
			font-size: 14px;
		}
		.reset-button:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
		.info-text {
			font-size: 12px;
			color: var(--vscode-descriptionForeground);
			margin-top: 8px;
		}
	</style>
</head>
<body>
	<div class="container">
		<h2>README Preview Color Picker</h2>
		<p>Choose colors for your README preview. Changes are applied immediately and saved automatically.</p>
		
		<div class="color-section">
			<h3>Background Color</h3>
			<div class="color-input-group">
				<input type="color" id="bgColorPicker" class="color-input" value="${currentBgColor || '#ffffff'}">
				<input type="text" id="bgHexInput" class="hex-input" placeholder="#ffffff" value="${currentBgColor || ''}" maxlength="7">
			</div>
			<div class="info-text">Leave empty to use VS Code theme background</div>
		</div>

		<div class="color-section">
			<h3>Text Color</h3>
			<div class="color-input-group">
				<input type="color" id="textColorPicker" class="color-input" value="${currentTextColor || '#000000'}">
				<input type="text" id="textHexInput" class="hex-input" placeholder="#000000" value="${currentTextColor || ''}" maxlength="7">
			</div>
			<div class="info-text">Leave empty to use VS Code theme text color</div>
		</div>

		<div class="color-section">
			<h3>Live Preview</h3>
			<div id="previewBox" class="preview-box" style="background-color: ${currentBgColor || 'var(--vscode-editor-background)'}; color: ${currentTextColor || 'var(--vscode-editor-foreground)'};">
				<div class="preview-text">Sample README Text</div>
			</div>
		</div>

		<button id="resetButton" class="reset-button">Reset to Default</button>
	</div>

	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		
		let bgColor = '${currentBgColor || ''}';
		let textColor = '${currentTextColor || ''}';
		
		// Background color picker
		const bgColorPicker = document.getElementById('bgColorPicker');
		const bgHexInput = document.getElementById('bgHexInput');
		
		// Text color picker
		const textColorPicker = document.getElementById('textColorPicker');
		const textHexInput = document.getElementById('textHexInput');
		
		// Preview elements
		const previewBox = document.getElementById('previewBox');
		const resetButton = document.getElementById('resetButton');
		
		function updatePreview() {
			previewBox.style.backgroundColor = bgColor || 'var(--vscode-editor-background)';
			previewBox.style.color = textColor || 'var(--vscode-editor-foreground)';
		}
		
		function updateColors() {
			// Send message to extension
			vscode.postMessage({
				command: 'updateColors',
				backgroundColor: bgColor,
				textColor: textColor
			});
			
			// Update preview
			updatePreview();
		}
		
		function validateHexColor(hex) {
			return /^#[0-9A-F]{6}$/i.test(hex);
		}
		
		// Background color events
		bgColorPicker.addEventListener('input', (e) => {
			bgColor = e.target.value;
			bgHexInput.value = bgColor;
			updateColors();
		});
		
		bgHexInput.addEventListener('input', (e) => {
			const value = e.target.value;
			if (value === '' || validateHexColor(value)) {
				bgColor = value;
				bgColorPicker.value = value || '#ffffff';
				updateColors();
			}
		});
		
		// Text color events
		textColorPicker.addEventListener('input', (e) => {
			textColor = e.target.value;
			textHexInput.value = textColor;
			updateColors();
		});
		
		textHexInput.addEventListener('input', (e) => {
			const value = e.target.value;
			if (value === '' || validateHexColor(value)) {
				textColor = value;
				textColorPicker.value = value || '#000000';
				updateColors();
			}
		});
		
		// Reset button
		resetButton.addEventListener('click', () => {
			bgColor = '';
			textColor = '';
			bgColorPicker.value = '#ffffff';
			bgHexInput.value = '';
			textColorPicker.value = '#000000';
			textHexInput.value = '';
			updateColors();
		});
		
		// Initialize preview
		updatePreview();
	</script>
</body>
</html>`;
}

/**
 * Generates a nonce for CSP
 */
function getNonce(): string {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
} 