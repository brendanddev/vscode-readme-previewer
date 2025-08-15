
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

    // Define theme colors
    const colors = {
        bg: userBg || (isDark ? '#0d1117' : '#ffffff'),
        text: userText || (isDark ? '#c9d1d9' : '#24292f'),
        bgSecondary: isDark ? '#161b22' : '#f6f8fa',
        border: isDark ? '#30363d' : '#d0d7de',
        accent: isDark ? '#58a6ff' : '#0969da',
        accentHover: isDark ? '#79c0ff' : '#1a7f37',
        muted: isDark ? '#8b949e' : '#656d76',
        success: isDark ? '#3fb950' : '#1a7f37',
        warning: isDark ? '#d29922' : '#9a6700',
        error: isDark ? '#f85149' : '#cf222e',
        codeBg: isDark ? '#21262d' : '#f6f8fa',
        tableHeader: isDark ? '#21262d' : '#f6f8fa',
        tableRowAlt: isDark ? '#161b22' : '#ffffff',
        shadow: isDark ? 'rgba(1, 4, 9, 0.3)' : 'rgba(140, 149, 159, 0.15)',
        shadowHover: isDark ? 'rgba(1, 4, 9, 0.5)' : 'rgba(140, 149, 159, 0.25)'
    };

    return `
        .markdown-body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            word-wrap: break-word;
            color: ${colors.text};
            background: ${colors.bg};
            padding: 24px;
            max-width: 100%;
            box-sizing: border-box;
        }

        .markdown-body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgSecondary} 100%);
            z-index: -1;
        }

        /* Headings */
        .markdown-body h1,
        .markdown-body h2,
        .markdown-body h3,
        .markdown-body h4,
        .markdown-body h5,
        .markdown-body h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: ${colors.text};
            position: relative;
            transition: all 0.2s ease;
        }

        .markdown-body h1 {
            font-size: 2em;
            border-bottom: 2px solid ${colors.border};
            padding-bottom: 8px;
            margin-bottom: 24px;
        }

        .markdown-body h1::before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, ${colors.accent}, ${colors.success});
            border-radius: 1px;
        }

        .markdown-body h2 {
            font-size: 1.5em;
            border-bottom: 1px solid ${colors.border};
            padding-bottom: 6px;
        }

        .markdown-body h3 {
            font-size: 1.25em;
        }

        .markdown-body h4 {
            font-size: 1em;
        }

        .markdown-body h5 {
            font-size: 0.875em;
        }

        .markdown-body h6 {
            font-size: 0.85em;
            color: ${colors.muted};
        }

        .markdown-body h1:hover,
        .markdown-body h2:hover,
        .markdown-body h3:hover {
            transform: translateX(4px);
        }

        /* Paragraphs */
        .markdown-body p {
            margin-bottom: 16px;
            line-height: 1.7;
        }

        /* Links */
        .markdown-body a {
            color: ${colors.accent};
            text-decoration: none;
            border-bottom: 1px solid transparent;
            transition: all 0.2s ease;
            position: relative;
        }

        .markdown-body a:hover {
            color: ${colors.accentHover};
            border-bottom-color: ${colors.accentHover};
            transform: translateY(-1px);
        }

        .markdown-body a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: ${colors.accentHover};
            transition: width 0.3s ease;
        }

        .markdown-body a:hover::after {
            width: 100%;
        }

        /* Lists */
        .markdown-body ul,
        .markdown-body ol {
            margin-bottom: 16px;
            padding-left: 24px;
        }

        .markdown-body li {
            margin-bottom: 8px;
            line-height: 1.6;
        }

        .markdown-body ul li {
            list-style-type: none;
            position: relative;
        }

        .markdown-body ul li::before {
            content: '•';
            color: ${colors.accent};
            font-weight: bold;
            position: absolute;
            left: -20px;
            top: 0;
        }

        .markdown-body ol li {
            counter-increment: list-counter;
        }

        .markdown-body ol li::marker {
            color: ${colors.accent};
            font-weight: 600;
        }

        /* Code blocks */
        .markdown-body pre {
            background: ${colors.codeBg};
            border: 1px solid ${colors.border};
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            overflow-x: auto;
            box-shadow: 0 2px 8px ${colors.shadow};
            transition: all 0.3s ease;
            position: relative;
        }

        .markdown-body pre:hover {
            box-shadow: 0 4px 16px ${colors.shadowHover};
            transform: translateY(-2px);
        }

        .markdown-body pre::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, ${colors.accent}, ${colors.success}, ${colors.warning});
            border-radius: 8px 8px 0 0;
        }

        .markdown-body code {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.875em;
            background: ${colors.codeBg};
            padding: 2px 6px;
            border-radius: 4px;
            color: ${colors.text};
            border: 1px solid ${colors.border};
        }

        .markdown-body pre code {
            background: transparent;
            padding: 0;
            border: none;
            color: inherit;
        }

        /* Blockquotes */
        .markdown-body blockquote {
            margin: 16px 0;
            padding: 16px 20px;
            border-left: 4px solid ${colors.accent};
            background: ${colors.bgSecondary};
            border-radius: 0 8px 8px 0;
            box-shadow: 0 2px 8px ${colors.shadow};
            position: relative;
            transition: all 0.3s ease;
        }

        .markdown-body blockquote:hover {
            transform: translateX(4px);
            box-shadow: 0 4px 16px ${colors.shadowHover};
        }

        .markdown-body blockquote::before {
            content: '"';
            position: absolute;
            top: 8px;
            left: 8px;
            font-size: 2em;
            color: ${colors.accent};
            opacity: 0.3;
        }

        .markdown-body blockquote p {
            margin: 0;
            color: ${colors.muted};
            font-style: italic;
        }

        /* Tables */
        .markdown-body table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px ${colors.shadow};
            transition: all 0.3s ease;
        }

        .markdown-body table:hover {
            box-shadow: 0 4px 16px ${colors.shadowHover};
        }

        .markdown-body th {
            background: ${colors.tableHeader};
            color: ${colors.text};
            font-weight: 600;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 2px solid ${colors.border};
            position: relative;
        }

        .markdown-body th::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, ${colors.accent}, ${colors.success});
        }

        .markdown-body td {
            padding: 12px 16px;
            border-bottom: 1px solid ${colors.border};
            transition: background-color 0.2s ease;
        }

        .markdown-body tr:nth-child(even) {
            background: ${colors.tableRowAlt};
        }

        .markdown-body tr:hover {
            background: ${isDark ? '#1f6feb20' : '#0969da10'};
        }

        .markdown-body tr:hover td {
            transform: scale(1.01);
        }

        /* Images */
        .markdown-body img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 16px ${colors.shadow};
            transition: all 0.3s ease;
        }

        .markdown-body img:hover {
            transform: scale(1.02);
            box-shadow: 0 8px 24px ${colors.shadowHover};
        }

        /* Horizontal rules */
        .markdown-body hr {
            height: 2px;
            background: linear-gradient(90deg, transparent, ${colors.accent}, transparent);
            border: none;
            margin: 32px 0;
            border-radius: 1px;
        }

        /* Task lists */
        .markdown-body input[type="checkbox"] {
            margin-right: 8px;
            transform: scale(1.2);
            accent-color: ${colors.accent};
        }

        /* Definition lists */
        .markdown-body dl {
            margin: 16px 0;
        }

        .markdown-body dt {
            font-weight: 600;
            color: ${colors.accent};
            margin-top: 16px;
        }

        .markdown-body dd {
            margin-left: 20px;
            margin-bottom: 8px;
            color: ${colors.muted};
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .markdown-body {
                padding: 16px;
                font-size: 14px;
            }
            
            .markdown-body h1 {
                font-size: 1.75em;
            }
            
            .markdown-body h2 {
                font-size: 1.5em;
            }
            
            .markdown-body pre {
                padding: 12px;
            }
            
            .markdown-body table {
                font-size: 14px;
            }
            
            .markdown-body th,
            .markdown-body td {
                padding: 8px 12px;
            }
        }

        /* Focus styles for accessibility */
        .markdown-body a:focus,
        .markdown-body button:focus {
            outline: 2px solid ${colors.accent};
            outline-offset: 2px;
        }

        /* Print styles */
        @media print {
            .markdown-body {
                background: white !important;
                color: black !important;
                box-shadow: none !important;
            }
            
            .markdown-body pre,
            .markdown-body blockquote,
            .markdown-body table {
                box-shadow: none !important;
                border: 1px solid #ccc !important;
            }
        }
    `;
};
