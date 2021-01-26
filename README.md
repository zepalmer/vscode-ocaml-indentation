# ocaml-indentation

`ocaml-indentation` is a simple Visual Studio Code extension which makes a "formatter" available for `.ml` and `.mli` files.  This formatter simply passes the contents of the file through `ocp-indent` (run with a working directory equal to that of the file) and replaces the editor buffer with the result.

Other extensions (such as OCaml Formatter) use fancier tools such as `ocamlformat` rather than `ocp-indent`.  Such tools are more invasive and heavy-handed and not appropriate for e.g. teaching novice OCaml students.  This extension makes available a lighter-weight alternative.

Note that Visual Studio Code allows multiple extensions to provide formatters for the same file type.  To use this extension by default, open the command palette (e.g. Ctrl+Shift+P) and type "format".  If there is more than one formatter, you will be provided an option "Format Document With"; you can then choose to change the default formatter which is used when the "Format Document" command is issued.

## Requirements

You must have `ocp-indent` installed to use this plugin.  By default, the plugin searches for `ocp-indent` using your `PATH` environment variable and so no configuration is needed.  If you prefer, you may set the path of the `ocp-indent` binary in your extension settings.

## Extension Settings

* `ocaml-indentation.ocp-indent-path`: A string containing a user-set path to `ocp-indent` (or empty string to search `PATH`).
