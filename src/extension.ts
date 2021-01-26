import { execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// A custom exception type indicating that the execution of ocp-indent failed.
class OcpIndentError extends Error {
	constructor(message?: string) {
		super(message);
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

function fileExists(pathname: string): boolean {
	try {
		// We don't care what the stats *are*; we just care that they exist,
		// since that means the file exists.
		fs.statSync(pathname);
		return true;
	} catch (e) {
		return false;
	}
}

// Uses the environment to locate the ocp-indent executable in PATH.  Returns
// the path to that executable.
function findOcpIndent(): string | null {
	if (process.env.PATH == undefined) {
		console.log("Did not find ocp-indent: no PATH environment variable.");
		return null;
	}
	const pathElements = process.env.PATH?.split(path.delimiter);
	for (var i = 0; i < pathElements.length; i++) {
		const pathElement = pathElements[i];
		const candidate = path.resolve(pathElement, "ocp-indent");
		if (fileExists(candidate)) {
			return candidate;
		}
	}
	console.log("Did not find ocp-indent in PATH.");
	return null;
}

// Routine to invoke indentation on a file.  Takes the contents of the file and
// the working directory in which to run the ocp-indent command (which affects
// the .ocp-indent files which are visible).  Returns the content with adjusted
// indentation.
function runOcpIndent(
	content: string,
	working_directory: string
): string {
	const configuration =
		vscode.workspace.getConfiguration("ocaml-indentation");
	let ocpIndentPath = <string>configuration.get("ocp-indent-path");
	if (ocpIndentPath == "" || ocpIndentPath === undefined) {
		const foundPath = findOcpIndent();
		if (foundPath == null) {
			throw new OcpIndentError(
				"Could not find ocp-indent in PATH.  " +
				"Perhaps set explicitly in extension settings?");
		}
		ocpIndentPath = foundPath;
	}
	try {
		const output = execFileSync(
			ocpIndentPath,
			[],
			{ 	input: content,
				cwd: working_directory
			});
		return output.toString();
	} catch (err) {
		console.log(
			`Failed to execute ${ocpIndentPath} (${err.status}): ${err.message}`
			);
		if (!fileExists(ocpIndentPath)) {
			throw new OcpIndentError(
				`ocp-indent binary does not exist: ${ocpIndentPath}`);
		} else {
			throw new OcpIndentError(err.message);
		}
	}
}

// Initialization function for VSCode extension
export function activate(context: vscode.ExtensionContext) {
	console.log("Activating extension: ocaml-indentation");
	vscode.languages.registerDocumentFormattingEditProvider(
		{ scheme: "file", language: "ocaml" },
		{
			provideDocumentFormattingEdits(
				document: vscode.TextDocument
			): vscode.TextEdit[] {
				const documentDir = path.dirname(document.uri.fsPath);
				const documentContents = document.getText();
				try {
					const newContents =
						runOcpIndent(documentContents, documentDir);
					return [vscode.TextEdit.replace(
						new vscode.Range(
							document.positionAt(0),
							document.positionAt(documentContents.length)),
						newContents)];
				} catch (e) {
					const err = `ocp-indent failed: ${e.message}`;
					vscode.window.showErrorMessage(err);
					console.log(err);
					return [];
				}
			}
		});
}

// Tear-down function for VSCode extension
export function deactivate() {
	console.log("Deactivating extension: ocaml-indentation");
}
