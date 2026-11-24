<div align="center">

# 📝 MDocs

**A lightweight desktop word processor with a Word-style ribbon.**

![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3-793BF6)
![Platform](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)

[Español](README.md) | **English**

</div>

---

## ✨ Features

- **Dark interface** with a ribbon inspired by Word and an A4 page to write on.
- **Full text formatting:** font, size, bold, italic, underline, strikethrough, subscript and superscript.
- **Copy formatting** from one piece of text and apply it to another.
- **Manual color picker** for text and highlight: saturation/brightness area, hue bar and a **hexadecimal** field below, plus quick colors.
- **Paragraph:** bulleted and numbered lists, quotes and alignment (left, center, right, justified).
- **Tables:** insert, add rows and columns, delete rows or the whole table.
- **Quick styles:** normal text, headings (H1–H3) and quotes.
- **Code blocks with syntax highlighting** for PHP, Python, HTML, CSS, JavaScript and Markdown.
- **Open** `.docx`, `.html` and `.txt` files.
- **Save** as `.docx` and **export to PDF**.
- **Spanish and English interface**, switchable instantly.
- Word counter in the status bar.

---

## 📥 Installation (users)

1. Go to the **[Releases](../../releases)** section of this repository.
2. Download the version you prefer:
   - **`MDocs Setup x.y.z.exe`**: installer.
   - **`MDocs x.y.z.exe`**: portable version, no installation needed.
3. Run it.

> **Note:** Windows may show a *"Windows protected your PC"* warning, because the installer is not digitally signed. Click **More info → Run anyway**.

---

## 🛠️ Development

### 📋 Requirements

- [Node.js](https://nodejs.org/) 20 or higher
- npm

### 🚀 Getting started

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USER/YOUR_REPO.git
cd YOUR_REPO

# 2. Install dependencies
npm install

# 3. Start the app in development mode (Vite + Electron)
npm run electron:dev
```

### 📜 Available scripts

| Command                  | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Starts only the Vite server (in the browser)           |
| `npm run electron:dev`   | Starts Vite and opens the Electron window              |
| `npm run build`          | Builds the production web version into `dist/`         |
| `npm run electron:build` | Builds the installer and the portable app in `release/` |
| `npm run lint`           | Runs ESLint                                            |
| `npm run preview`        | Previews the Vite build                                |

### 📦 Building the `.exe`

```bash
npm run electron:build
```

The resulting files are placed in the `release/` folder.

> **Windows tip:** if the build fails with *"Cannot create symbolic link"*, enable **Developer Mode** (Settings → For developers) or run the terminal as administrator. If a corrupted cache was already created, delete it before trying again:
>
> ```powershell
> Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
> ```

---

## 🧱 Tech stack

| Area                  | Tools                                                       |
| --------------------- | ----------------------------------------------------------- |
| Desktop               | [Electron](https://www.electronjs.org/) + electron-builder  |
| UI                    | [React](https://react.dev/) + [Vite](https://vite.dev/)     |
| Editor                | [TipTap](https://tiptap.dev/) (built on ProseMirror)        |
| Code highlighting     | [lowlight](https://github.com/wooorm/lowlight) + highlight.js |
| Import `.docx`        | [mammoth](https://github.com/mwilliamson/mammoth.js)        |
| Export `.docx`        | [docx](https://docx.js.org/)                                |

---

## 📁 Project structure

```
├── main.js              # Electron main process
├── src/
│   ├── App.jsx          # Editor interface and logic
│   ├── App.css          # Styles
│   ├── ColorPicker.jsx  # Manual color picker + hexadecimal field
│   ├── FontSize.js      # Font size extension for TipTap
│   ├── exportDocx.js    # Document to .docx conversion
│   └── translations.js  # Spanish and English texts
└── package.json
```

---

## 🤝 Contributing

Found a bug or have an idea? Open an [issue](../../issues) or send a pull request.

---

## 🌱 About this project

MDocs is a personal project that I wanted to build on my own. I'm well aware that it still has a lot of room for improvement, but I'm just starting to learn, and every step of this project has taught me something new. Any suggestion or advice is very welcome.

---

<div align="center">

Made by **Miuu-Dev** 💜

</div>
