
/**
 * @file theme.ts
 * Handles the theme related operations for the README previewer extension
 */

import * as vscode from 'vscode';
import { ReadmePreviewerConfig, CONFIG_SECTION } from './types';

/**
 * Generates CSS for the webview based on the current VS Code theme
 * 
 * @returns {string} The CSS string to apply to the webview
 */
export const getThemeCSS = (): string => {

    // Get configuration from settings
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION) as unknown as ReadmePreviewerConfig;
    const userBg = config.backgroundColor || '';
    const userText = config.textColor || '';
    const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

    // Return CSS string based on the theme and user settings
    // Fallback to default colors if user settings are not defined
	return `
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 16px;
            background-color: ${userBg || (isDark ? '#1e1e1e' : '#ffffff')};
            color: ${userText || (isDark ? '#d4d4d4' : '#000000')};
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
