<div align="center">
# 📝 MDocs

**A lightweight desktop word processor with a Word-inspired ribbon interface.**

![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3-793BF6)
![Platform](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)

**[Español](README.md) | English**

</div>

---

## ✨ Features

- **Dark interface** with a Word-inspired ribbon and an A4 page layout for writing.
- **Full text formatting:** font family, font size, bold, italic, underline, strikethrough, subscript, and superscript.
- **Format painter** to copy formatting from one piece of text and apply it to another.
- **Manual color picker** for text and highlighting, featuring a saturation/brightness area, hue slider, hexadecimal input field, and quick color presets.
- **Paragraph formatting:** bulleted and numbered lists, blockquotes, and text alignment (left, center, right, and justified).
- **Tables:** insert tables, add rows and columns, delete rows, and remove entire tables.
- **Quick styles:** normal text, headings (H1–H3), and blockquotes.
- **Syntax-highlighted code blocks** for PHP, Python, HTML, CSS, JavaScript, and Markdown.
- **Open** `.docx`, `.html`, and `.txt` files.
- **Save** documents as `.docx` and **export to PDF**.
- **Spanish and English interface**, with instant language switching.
- Word counter in the status bar.

---

## 📥 Installation (Users)

1. Go to the repository's **[Releases](../../releases)** section.
2. Download the version you prefer:
   - **`MDocs Setup x.y.z.exe`**: Windows installer.
   - **`MDocs x.y.z.exe`**: portable version, no installation required.
3. Run the downloaded file.

> **Note:** Windows may display the *"Windows protected your PC"* warning because the installer is not digitally signed. Click **More info → Run anyway** to continue.

---

## 🛠️ Development

### 📋 Requirements

- [Node.js](https://nodejs.org/) 20 or later.
- npm.

### 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO

# 2. Install dependencies
npm install

# 3. Start the app in development mode (Vite + Electron)
npm run electron:dev
```

### 📜 Available Scripts

| Command | Description |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev` | Starts the Vite development server (in the browser). |
| `npm run electron:dev` | Starts Vite and launches the Electron window. |
| `npm run build` | Builds the production web version into `dist/`. |
| `npm run electron:build` | Generates the installer and portable version in `release/`. |
| `npm run lint` | Runs ESLint. |
| `npm run preview` | Previews the Vite production build. |

### 📦 Building the `.exe`

```bash
npm run electron:build
```

The generated files will be available in the `release/` folder.

> **Windows tip:** If the build fails with *"Cannot create symbolic link"*, enable **Developer Mode** (Settings → For developers) or run your terminal as an administrator. If a corrupted cache was created, delete it before trying again:

```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
```

---

## ⚙️ Downloading from GitHub Actions

You can also download development builds generated automatically through **GitHub Actions**, without having to wait for a Release.

1. Go to the repository's **[Actions](../../actions)** tab.
2. Select the latest successfully completed build workflow.
3. Make sure its status is **Success** (green checkmark).
4. Scroll down to the **Artifacts** section at the bottom of the workflow run.
5. Download the artifact you want:
   - **MDocs-Setup**: Windows installer (`.exe`).
   - **MDocs-Portable**: portable version (`.exe`), no installation required.
6. If you downloaded a `.zip` file, extract it and run the corresponding `.exe` file.

> **Note:** GitHub Actions artifacts are temporary and may be automatically deleted after the retention period configured in the workflow. For a stable and permanent version, visit the [Releases](../../releases) section.

> **Important:** These builds may include recent changes that have not yet been published as official releases.

---

## 🧱 Technologies

| Area | Tools |
| --------------------- | ----------------------------------------------------------- |
| Desktop | [Electron](https://www.electronjs.org/) + electron-builder |
| Interface | [React](https://react.dev/) + [Vite](https://vite.dev/) |
| Editor | [TipTap](https://tiptap.dev/) (based on ProseMirror) |
| Code highlighting | [lowlight](https://github.com/wooorm/lowlight) + highlight.js |
| `.docx` importing | [mammoth](https://github.com/mwilliamson/mammoth.js) |
| `.docx` exporting | [docx](https://docx.js.org/) |

---

## 📁 Project Structure

```text
├── main.js              # Electron main process
├── src/
│   ├── App.jsx          # Editor interface and logic
│   ├── App.css           # Styles
│   ├── ColorPicker.jsx  # Manual color picker + hexadecimal input
│   ├── FontSize.js      # TipTap font size extension
│   ├── exportDocx.js    # Document-to-.docx conversion
│   └── translations.js  # Spanish and English translations
└── package.json
```

---

## 🤝 Contributing

Found a bug or have an idea? Open an [issue](../../issues) or submit a pull request.

---

## 🌱 About This Project

MDocs is a personal project I decided to build on my own. I know there are still many things that can be improved, but I'm just getting started with development, and every step of this project has taught me something new.

Any suggestions, feedback, or advice are always welcome!

---

<div align="center">

Made with 💜 by **Miuu-Dev**

</div>