# Repository Guidelines

This repository follows specific guidelines to ensure
consistency, maintainability, and collaboration efficiency. All
contributors are expected to adhere to these guidelines when
contributing to the repository.

The project is a Pikchr preview tool for VS Code.

It allows users to preview Pikchr diagrams directly within the
VS Code editor, providing a seamless and efficient workflow for
creating and editing Pikchr diagrams.

The pikchr rendering will be done via the
[pikchr-cmd](https://github.com/zenomt/pikchr-cmd) tool,
which will be invoked by the VS Code extension to generate the
Pikchr diagrams as images that can be displayed within the editor.

The extension will handle the communication between the VS Code
editor and the pikchr-cmd tool, ensuring that the diagrams are
rendered in real-time as users edit their Pikchr code.

The extension will work to preview files ending with `.pikchr`,
as well as rendering Pikchr diagrams embedded within Markdown
files, as specified by VS Code's Markdown preview API.

## Tooling Conventions

* use `pnpm` as the package manager for managing dependencies and scripts.
* follow the project's coding style and linting rules.
* write tests for any new features or bug fixes.
* ensure that all code changes are properly documented.
