"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
function isHexoProject(uri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    return workspaceFolder !== undefined && workspaceFolder.uri.fsPath.toLowerCase().includes("hexo");
}
async function updateFrontMatter(document) {
    let editor = vscode.window.activeTextEditor;
    if (!editor || !isHexoProject(document.uri)) {
        return;
    }
    const text = document.getText();
    const frontMatterRegex = /^---[\s\S]+?---/;
    const frontMatterMatch = text.match(frontMatterRegex);
    const now = new Date();
    const formattedNow = formatDate(now);
    let frontMatter;
    if (frontMatterMatch) {
        frontMatter = frontMatterMatch[0];
        frontMatter = updateFrontMatterContent(frontMatter, formattedNow);
    }
    else {
        frontMatter = `---
title: 
date: ${formattedNow}
updated: ${formattedNow}
tags: 
---
`;
    }
    // 检查并填充title
    if (frontMatter.match(/title:\s*$/m)) { // 使用正则表达式匹配空的title
        const title = await vscode.window.showInputBox({ prompt: 'Enter title for the post:' });
        if (title) {
            frontMatter = frontMatter.replace(/title:\s*$/m, `title: ${title}`);
        }
    }
    // 检查并填充tags
    if (frontMatter.match(/tags:\s*$/m)) { // 使用正则表达式匹配空的tags
        const tag = await vscode.window.showQuickPick(['学习日常', '大模型论文', '大模型实践', '数据结构与算法'], { canPickMany: false, placeHolder: 'Select a tag for the post:' });
        if (tag) {
            frontMatter = frontMatter.replace(/tags:\s*$/m, `tags: ${tag}`);
        }
    }
    // Apply updated Front Matter
    await editor.edit(editBuilder => {
        if (frontMatterMatch && typeof frontMatterMatch.index === 'number') {
            const range = new vscode.Range(document.positionAt(0), document.positionAt(frontMatterMatch.index + frontMatterMatch[0].length));
            editBuilder.replace(range, frontMatter);
        }
        else {
            editBuilder.insert(new vscode.Position(0, 0), frontMatter);
        }
    });
}
function updateFrontMatterContent(frontMatter, formattedNow) {
    if (frontMatter.includes('updated:')) {
        return frontMatter.replace(/updated:\s*.*/, `updated: ${formattedNow}`);
    }
    else {
        return frontMatter.replace(/(date:\s*[^\n]+)/, `$1\nupdated: ${formattedNow}`);
    }
}
function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
module.exports = {
    activate,
    deactivate
};
function activate(context) {
    let disposable = vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'markdown') {
            updateFrontMatter(document);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map