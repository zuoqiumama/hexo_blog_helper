// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function isHexoProject(uri: vscode.Uri): boolean {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    return workspaceFolder !== undefined && workspaceFolder.uri.fsPath.toLowerCase().includes("hexo");
}


async function updateFrontMatter(document: vscode.TextDocument): Promise<void> {
    let editor = vscode.window.activeTextEditor;
    if (!editor || !isHexoProject(document.uri)) {
        return;
    }

    const text = document.getText();
    const frontMatterRegex = /^---[\s\S]+?---/;
    const frontMatterMatch = text.match(frontMatterRegex);
    const now = new Date();
    const formattedNow = formatDate(now);

    let frontMatter: string;

    if (frontMatterMatch) {
        frontMatter = frontMatterMatch[0];
        frontMatter = updateFrontMatterContent(frontMatter, formattedNow);
    } else {
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
        } else {
            editBuilder.insert(new vscode.Position(0, 0), frontMatter);
        }
    });
}

function updateFrontMatterContent(frontMatter: string, formattedNow: string): string {
    if (frontMatter.includes('updated:')) {
        return frontMatter.replace(/updated:\s*.*/, `updated: ${formattedNow}`);
    } else {
        return frontMatter.replace(/(date:\s*[^\n]+)/, `$1\nupdated: ${formattedNow}`);
    }
}




function formatDate(date: Date): string {
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

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.workspace.onDidSaveTextDocument((document) => {
		if (document.languageId === 'markdown'){
			updateFrontMatter(document);
		}

    });

    context.subscriptions.push(disposable);
}
// This method is called when your extension is deactivated
export function deactivate() {}
