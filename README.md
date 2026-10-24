# Text Cleaner

A free tool for cleaning text copied from documents, notes, and lists. **The entire app is in [index.html](index.html).** Download the file and open it in your browser—no installation, account, API key, or build step.

Built by [mo7mels](https://www.mo7mels.com/portfolio/).

## What it does

- Trims the edges of each line and fixes repeated spaces and tabs.
- Removes duplicate lines while keeping their original order, optionally ignoring letter case.
- Removes blank lines when selected; preserves paragraph breaks by default.
- Converts text to lowercase or uppercase, or keeps its original case.
- Counts words, visible characters, and lines, including support for Arabic and emoji in modern browsers.
- Opens UTF-8 text files, copies the result, and downloads a cleaned `.txt` file.
- Keeps the original text separate from the result.
- Adapts to phones, light/dark system themes, and right-to-left text.

## Use it

1. Open [index.html on GitHub](https://github.com/MO7EMMD/text-cleaner/blob/main/index.html) and use **Download raw file**, or download the repository ZIP.
2. Open the downloaded `index.html` file in a modern browser.
3. Paste text or select **Open .txt file**.
4. Choose the options and select **Clean text**.
5. Copy the result or download `cleaned-text.txt`.

The tool works offline after downloading it. GitHub's source-code view does not run HTML apps; download the file before using it. No Node.js or npm is required to use the tool.

## Privacy and limits

Text is processed in your browser's memory. The app has no network requests, analytics, cookies, local storage, or external fonts/scripts. It does not upload or save your input. Copying and downloading happen only when requested. The app itself does not persist the workspace between visits.

Inputs are limited to **250,000 UTF-8 bytes** to keep the tool practical on phones. File import requires valid UTF-8 plain text. If clipboard access is unavailable, the result is selected for manual copying.

Use this for prose and lists. Spacing cleanup can alter indentation, Markdown, or code. Structured formats such as CSV and JSON are not parsed or validated.

Duplicate matching compares the processed line; first occurrences are kept. Blank lines are excluded from duplicate matching so paragraph breaks remain unless blank-line removal is enabled. Case-insensitive matching uses Unicode lowercasing, not locale-specific collation. Line endings are normalized to `LF`.

Modern browsers use `Intl.Segmenter` for word and visible-character counts. Older browsers use a simpler fallback; counts may differ across browser versions and languages.

## Development

The app has no dependencies. With Node.js 20 or newer, run:

```sh
node --test
```

Tests exercise the actual processing code extracted from `index.html`, including Unicode preservation, duplicates, line endings, paragraph breaks, size limits, and character counts.

To preview over HTTP, you can optionally use Python:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## License

[MIT](LICENSE) — you can use, modify, and share the tool under the license terms.
