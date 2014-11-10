# BabelFrog Changelog

## [0.0.7](https://github.com/dergachev/babelfrog/compare/v0.0.6...v0.0.7) (November 10, 2014)

BUGFIXES:

- e2851fc Switch to HTTPS://translate.google.com

## [0.0.6](https://github.com/dergachev/babelfrog/compare/v0.0.5...v0.0.6) (July 21, 2014)

BUGFIXES:

- fc6c10d Fix bug in BabelFrog.expandToWordBoundary;
- 9a2b78c Fixed errors in BabelFrog.expandToWordBoundary

IMPROVEMENTS:

- 3be2274 Pressing escape dismisses tooltip.
- 5234a55 Clicking expands tooltip to presents linguee links.
- 22dde98 Refactored BabelFrog.activate and BabelFrog.eventListener
- 44f0b93 Added TODO: consider opening up settings page on install
- faf7383 Changed context menu text to 'Translate with BabelFrog'

## [0.0.5](https://github.com/dergachev/babelfrog/compare/v0.0.4...v0.0.5) (July 2, 2014)

BUGFIXES:

- 9a9b55d Prevent vocalization of two phrases at once
- 5a27340 Fix permission syntax in manifest.json; refs #2

IMPROVEMENTS:

- d2f6cf9 Improved tooltip colors via CSS
- 2ccf62a Made shortcut Ctl+E/Cmd+E (previously Ctrl+B/Cmd+B, which conflicted with Bold)

FEATURES:

- 37d01fb Added activation via context menu; smarter tracking of activated tabs

## [0.0.4](https://github.com/dergachev/babelfrog/compare/v0.0.3...v0.0.4) (June 23, 2014)

IMPROVEMENTS:

- 5f70d40 Extracted babelfrog.css into own file

FEAUTURES:

- c3c5a22 display alternative translations of single word selections; refs #1

## [0.0.3](https://github.com/dergachev/babelfrog/compare/v0.0.2...v0.0.3) (June 19, 2014)

IMPROVEMENTS:

- ba0cae8 Overhaul of tooltip positioning
- d4c2957 Improved style of tooltip; no longer displays source text
- 05f9936 Overhaul of tooltip positioning; relying on selection.getClientRects

BUGFIXES:

- 723dbbd Removed BabelFrog.cache support
  - this prevented settings changes from updating instantly

## [0.0.2](https://github.com/dergachev/babelfrog/compare/v0.0.1...v0.0.2) (June 9, 2014)

BACKWARDS INCOMPATIBILITIES:

- none

BUGFIXES:

- none

FEATURES:

- none

IMPROVEMENTS:

-  Default shortcut changed to Command+B / Ctrl+B for Mac/Windows compatibility.
-  Added CHANGELOG.md, DEVNOTES.md, and Makefile
