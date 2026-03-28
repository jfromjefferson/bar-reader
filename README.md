# Bar Reader - Barcode & QR Scanner

A Chrome extension that lets you instantly scan barcodes and QR codes by selecting any area on your screen. Built with React and the ZXing library.

**[Install on Chrome Web Store](https://chromewebstore.google.com/detail/bfokhmfapemhigigjnlgdngfjdallefa)**

## Features

- Select any area on your screen to scan for barcodes or QR codes
- Supports a wide range of formats including QR codes, EAN, UPC, Code 128, Code 39, and more
- Automatically copies the decoded result to your clipboard
- Keeps a history of all scanned results within the session
- Clean, minimal popup UI

## Tech Stack

- React 19
- ZXing (`@zxing/library`) for barcode/QR decoding
- Vite + `@crxjs/vite-plugin` for Chrome extension bundling
- Manifest V3

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Loading the Extension

1. Run `npm run build` to generate the `dist/` folder
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `dist/` folder