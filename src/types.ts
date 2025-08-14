
/**
 * @file types.ts
 * Defines types and interfaces used in the README previewer extension
 */

import * as vscode from 'vscode';

// Configuration section name
export const CONFIG_SECTION = 'readmePreviewer' as const;

/**
 * Interface for the configuration settings of the README previewer extension which 
 * may be user defined in the settings.json file
 */
export interface ReadmePreviewerConfig {
    backgroundColor?: string;
    textColor?: string;
}

/**
 * Theme properties for the webview panel
 */
export interface ThemeConfig {
    isDark: boolean;
    backgroundColor: string;
    textColor: string;
    preBackgroundColor: string;
    borderColor: string;
    mutedTextColor: string;
}

/**
 * State of the webview preview panel
 */
export interface PreviewPanelState {
    panel: vscode.WebviewPanel;
    readmeUri: vscode.Uri;
    watcher: vscode.FileSystemWatcher;
    disposables: vscode.Disposable[];
}


/**
 * Command identifiers for the extension
 */
export const COMMANDS = {
    HELLO_WORLD: 'vscode-readme-previewer.helloWorld',
    PREVIEW_README: 'vscode-readme-previewer.previewReadMe',
    COLOR_PICKER: 'vscode-readme-previewer.colorPicker',
    REFRESH_PREVIEW: 'vscode-readme-previewer.refreshPreview',
} as const;
