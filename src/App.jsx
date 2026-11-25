import { useState, useRef, useEffect } from 'react';
import { Pagination } from './Pagination';
import { SplitLongCodeBlock } from './SplitLongCodeBlock';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import php from 'highlight.js/lib/languages/php';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import markdown from 'highlight.js/lib/languages/markdown';
import mammoth from 'mammoth';
import { FontSize } from './FontSize';
import { generateDocxBlob } from './exportDocx';
import { TRANSLATIONS } from './translations';
import ColorPicker from './ColorPicker';
import './App.css';

// Registrar lenguajes en lowlight
const lowlight = createLowlight(common);
lowlight.register('php', php);
lowlight.register('python', python);
lowlight.register('html', xml);
lowlight.register('css', css);
lowlight.register('javascript', javascript);
lowlight.register('markdown', markdown);

const FONT_SIZES = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '36px', '48px', '72px'];

const QUICK_COLORS = [
  { name: 'Negro / Black', hex: '#111111' },
  { name: 'Morado / Purple', hex: '#793bf6' },
  { name: 'Rojo / Red', hex: '#ef4444' },
  { name: 'Verde / Green', hex: '#22c55e' },
  { name: 'Azul / Blue', hex: '#3b82f6' },
  { name: 'Amarillo / Yellow', hex: '#facc15' },
];

export default function App() {
  const [lang, setLang] = useState('es');
  const t = TRANSLATIONS[lang];

  const [docTitle, setDocTitle] = useState(TRANSLATIONS.es.untitled);
  const [wordCount, setWordCount] = useState(0);
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [highlightHex, setHighlightHex] = useState('#ffff00');
  const [fontHex, setFontHex] = useState('#ff0000');
  const [openColorMenu, setOpenColorMenu] = useState(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Abre/cierra el desplegable de color colocándolo sobre la interfaz (fixed)
  const toggleColorMenu = (name, e) => {
    if (openColorMenu === name) {
      setOpenColorMenu(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const POPOVER_WIDTH = 240;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8));
    setPopoverPos({ top: rect.bottom + 6, left });
    setOpenColorMenu(name);
  };
  const [, setTick] = useState(0);
  const fileInputRef = useRef(null);
  const ribbonRef = useRef(null);

  useEffect(() => {
    document.title = docTitle || t.untitled;
  }, [docTitle, t.untitled]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target)) {
        setOpenColorMenu(null);
      }
    };
    const closeMenu = () => setOpenColorMenu(null);
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', closeMenu);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', closeMenu);
    };
  }, []);

  const handleLanguageChange = (newLang) => {
    if (docTitle === TRANSLATIONS[lang].untitled) {
      setDocTitle(TRANSLATIONS[newLang].untitled);
    }
    setLang(newLang);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          spellcheck: 'false',
        },
      }),
      Underline,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph', 'blockquote'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TableHeader,
      TableCell,
      Pagination,
      SplitLongCodeBlock,
    ],
    editorProps: {
      attributes: {
        lang: lang,
        spellcheck: 'true',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Tab') {
          event.preventDefault();

          if (editor.isActive('listItem')) {
            return editor.chain().focus().sinkListItem('listItem').run();
          }

          const { state, dispatch } = view;
          dispatch(state.tr.insertText('    '));
          return true;
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          const { $from } = view.state.selection;
          const isAtEnd = $from.parentOffset === $from.parent.content.size;
          const isEmptyLine = $from.parent.textContent.length === 0;

          if (editor.isActive('heading') && isAtEnd) {
            event.preventDefault();
            return editor
              .chain()
              .focus()
              .splitBlock()
              .setParagraph()
              .setTextAlign('left')
              .run();
          }

          if ((editor.isActive('blockquote') || editor.isActive('codeBlock')) && (isEmptyLine || event.ctrlKey)) {
            event.preventDefault();
            return editor
              .chain()
              .focus()
              .exitCode()
              .setParagraph()
              .setTextAlign('left')
              .run();
          }
        }

        return false;
      },
    },
    content: `<p style="text-align: left"><span style="font-family: Century Gothic; font-size: 14px"></span></p>`,
    autofocus: 'start',
    onUpdate: ({ editor }) => {
      const text = editor.getText().trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    },
    onTransaction: () => {
      setTick((prev) => prev + 1);
    },
  });

  useEffect(() => {
    if (editor && editor.view) {
      editor.view.dom.setAttribute('lang', lang);
    }
  }, [lang, editor]);

  if (!editor) return null;

  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Century Gothic';
  const currentSize = editor.getAttributes('textStyle').fontSize || '14px';

  const applyHighlightHex = (hex) => {
    setHighlightHex(hex);
    editor.chain().focus().setHighlight({ color: hex }).run();
  };

  const applyFontHex = (hex) => {
    setFontHex(hex);
    editor.chain().focus().setColor(hex).run();
  };

  const toggleCodeLanguage = (codeLang) => {
    if (editor.isActive('codeBlock', { language: codeLang })) {
      editor.chain().focus().toggleCodeBlock().setTextAlign('left').run();
    } else if (editor.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language: codeLang }).run();
    } else {
      editor.chain().focus().setTextAlign('left').setCodeBlock({ language: codeLang }).run();
    }
  };

  const handleCopyFormat = () => {
    const attrs = editor.getAttributes('textStyle');
    setCopiedFormat({
      fontFamily: attrs.fontFamily || null,
      fontSize: attrs.fontSize || null,
      color: attrs.color || null,
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
    });
  };

  const handleApplyFormat = () => {
    if (!copiedFormat) return;
    const chain = editor.chain().focus();

    if (copiedFormat.fontFamily) chain.setFontFamily(copiedFormat.fontFamily);
    if (copiedFormat.fontSize) chain.setFontSize(copiedFormat.fontSize);
    if (copiedFormat.color) chain.setColor(copiedFormat.color);

    copiedFormat.bold ? chain.setBold() : chain.unsetBold();
    copiedFormat.italic ? chain.setItalic() : chain.unsetItalic();
    copiedFormat.underline ? chain.setUnderline() : chain.unsetUnderline();
    copiedFormat.strike ? chain.setStrike() : chain.unsetStrike();

    chain.run();
    setCopiedFormat(null);
  };

  const handleSave = async () => {
    const blob = await generateDocxBlob(editor.getJSON());
    const arrayBuffer = await blob.arrayBuffer();

    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('save-docx', {
        docTitle,
        buffer: new Uint8Array(arrayBuffer),
      });
    } catch {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docTitle}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { ipcRenderer } = window.require('electron');
      await ipcRenderer.invoke('export-pdf', docTitle);
    } catch {
      window.print();
    }
  };

  const handleOpenFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocTitle(file.name.replace(/\.[^/.]+$/, ''));

    if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor.commands.setContent(result.value);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => editor.commands.setContent(event.target.result);
      reader.readAsText(file);
    }

    e.target.value = '';
  };

  return (
    <div className="word-app">
      {/* Cabecera superior */}
      <header className="doc-header no-print">
        <div className="doc-info">
          <span className="app-badge">W</span>
          <input
            className="title-input"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />
        </div>
        <div className="file-actions">
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            title="Idioma / Language"
          >
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
          </select>

          <input
            type="file"
            accept=".docx,.html,.txt"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleOpenFile}
          />
          <button onClick={() => editor.chain().focus().clearContent().setTextAlign('left').run()}>{t.new}</button>
          <button onClick={() => fileInputRef.current?.click()}>{t.open}</button>
          <button onClick={handleSave}>{t.save}</button>
          <button className="btn-primary" onClick={handleExportPDF}>{t.exportPdf}</button>
        </div>
      </header>

      {/* Cinta de opciones estilo Word */}
      <div className="ribbon no-print" ref={ribbonRef}>
        {/* Grupo 1: Portapapeles */}
        <div className="ribbon-group">
          <div className="ribbon-controls">
            <button
              onClick={copiedFormat ? handleApplyFormat : handleCopyFormat}
              className={`btn-tall ${copiedFormat ? 'active' : ''}`}
              title={t.copyFormatTitle}
            >
              <span className="icon-lg">🖌️</span>
              <span>{copiedFormat ? t.applyFormat : t.copyFormat}</span>
            </button>
          </div>
          <span className="group-label">{t.clipboard}</span>
        </div>

        {/* Grupo 2: Fuente */}
        <div className="ribbon-group">
          <div className="ribbon-row">
            <select
              className="font-select"
              value={currentFont}
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            >
              <optgroup label={t.sansSerif}>
                <option value="Century Gothic">Century Gothic</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Segoe UI">Segoe UI</option>
                <option value="Verdana">Verdana</option>
                <option value="Tahoma">Tahoma</option>
              </optgroup>
              <optgroup label={t.serif}>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Garamond">Garamond</option>
                <option value="Cambria">Cambria</option>
              </optgroup>
              <optgroup label={t.monospace}>
                <option value="JetBrains Mono">JetBrains Mono</option>
                <option value="Consolas">Consolas</option>
                <option value="Courier New">Courier New</option>
              </optgroup>
            </select>

            <select
              className="size-select"
              value={currentSize}
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size.replace('px', '')}
                </option>
              ))}
            </select>

            <button
              title={t.clearFormat}
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              A🧹
            </button>
          </div>

          <div className="ribbon-row">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><b>N</b></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>K</i></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}><u>S</u></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}><s>ab</s></button>
            <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={editor.isActive('subscript') ? 'active' : ''}>x₂</button>
            <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={editor.isActive('superscript') ? 'active' : ''}>x²</button>

            {/* Desplegable de Color de Resaltado */}
            <div className="color-popover-wrap">
              <button
                type="button"
                className="color-trigger-btn"
                title={t.highlightColor}
                onClick={(e) => toggleColorMenu('highlight', e)}
              >
                <span>🖍️</span>
                <span
                  className="color-swatch-dot"
                  style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(highlightHex) ? highlightHex : '#ffff00' }}
                />
              </button>

              {openColorMenu === 'highlight' && (
                <div
                  className="color-popover"
                  style={{ top: popoverPos.top, left: popoverPos.left }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ColorPicker
                    value={highlightHex}
                    onChange={applyHighlightHex}
                    quickColors={QUICK_COLORS}
                    quickLabel={lang === 'es' ? 'Colores rápidos' : 'Quick colors'}
                    hexLabel={lang === 'es' ? 'Hexadecimal' : 'Hex'}
                  >
                    <button
                      type="button"
                      className="popover-clear-btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor.chain().focus().unsetHighlight().run();
                        setOpenColorMenu(null);
                      }}
                    >
                      {lang === 'es' ? 'Quitar resaltado' : 'Remove highlight'}
                    </button>
                  </ColorPicker>
                </div>
              )}
            </div>

            {/* Desplegable de Color de Fuente */}
            <div className="color-popover-wrap">
              <button
                type="button"
                className="color-trigger-btn"
                title={t.fontColor}
                onClick={(e) => toggleColorMenu('font', e)}
              >
                <span style={{ borderBottom: `2px solid ${/^#[0-9A-Fa-f]{6}$/.test(fontHex) ? fontHex : '#ff4444'}` }}>A</span>
                <span
                  className="color-swatch-dot"
                  style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(fontHex) ? fontHex : '#ff0000' }}
                />
              </button>

              {openColorMenu === 'font' && (
                <div
                  className="color-popover"
                  style={{ top: popoverPos.top, left: popoverPos.left }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ColorPicker
                    value={fontHex}
                    onChange={applyFontHex}
                    quickColors={QUICK_COLORS}
                    quickLabel={lang === 'es' ? 'Colores rápidos' : 'Quick colors'}
                    hexLabel={lang === 'es' ? 'Hexadecimal' : 'Hex'}
                  />
                </div>
              )}
            </div>
          </div>
          <span className="group-label">{t.font}</span>
        </div>

        {/* Grupo 3: Párrafo y Tablas */}
        <div className="ribbon-group">
          <div className="paragraph-grid">
            <div className="sub-cluster">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'active' : ''}
                title={t.bullets}
              >
                •
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'active' : ''}
                title={t.numbering}
              >
                1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'active' : ''}
                title={t.quoteTitle}
              >
                ❞
              </button>
            </div>

            <div className="sub-cluster">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}
                title={t.alignLeft}
              >
                {t.leftShort}
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}
                title={t.alignCenter}
              >
                ≡
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}
                title={t.alignRight}
              >
                {t.rightShort}
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}
                title={t.alignJustify}
              >
                ☰
              </button>
            </div>

            <div className="sub-cluster table-cluster">
              <button
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="btn-table-insert"
                title={t.insertTableTitle}
              >
                {t.insertTable}
              </button>
              <div className="table-mini-actions">
                <button
                  disabled={!editor.isActive('table')}
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  title={t.addRowTitle}
                >
                  {t.addRow}
                </button>
                <button
                  disabled={!editor.isActive('table')}
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  title={t.addColTitle}
                >
                  {t.addCol}
                </button>
                <button
                  disabled={!editor.isActive('table')}
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  title={t.delRowTitle}
                >
                  {t.delRow}
                </button>
                <button
                  disabled={!editor.isActive('table')}
                  onClick={() => editor.chain().focus().deleteTable().run()}
                  className="btn-danger"
                  title={t.delTableTitle}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <span className="group-label">{t.paragraphAndTables}</span>
        </div>

        {/* Grupo 4: Galería de Estilos */}
        <div className="ribbon-group">
          <div className="styles-gallery">
            <button
              className={`style-card ${editor.isActive('paragraph') && !editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setParagraph().setTextAlign('left').run()}
            >
              <span className="preview-normal">AaBbCc</span>
              <small>{t.normal}</small>
            </button>

            <button
              className={`style-card ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <span className="preview-h1">AABBCC</span>
              <small>{t.h1}</small>
            </button>

            <button
              className={`style-card ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <span className="preview-h2">AABBCC</span>
              <small>{t.h2}</small>
            </button>

            <button
              className={`style-card ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <span className="preview-h3">AABBCC</span>
              <small>{t.h3}</small>
            </button>

            <button
              className={`style-card ${editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <span className="preview-quote">“AaBbCc”</span>
              <small>{t.quote}</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'php' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('php')}
            >
              <span className="preview-php">php</span>
              <small>PHP</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'python' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('python')}
            >
              <span className="preview-python">py</span>
              <small>Python</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'html' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('html')}
            >
              <span className="preview-html">HTML5</span>
              <small>HTML</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'css' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('css')}
            >
              <span className="preview-css">CSS3</span>
              <small>CSS</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'javascript' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('javascript')}
            >
              <span className="preview-js">JS</span>
              <small>JavaScript</small>
            </button>

            <button
              className={`style-card ${editor.isActive('codeBlock', { language: 'markdown' }) ? 'active' : ''}`}
              onClick={() => toggleCodeLanguage('markdown')}
            >
              <span className="preview-md">MD</span>
              <small>Markdown</small>
            </button>
          </div>
          <span className="group-label">{t.styles}</span>
        </div>
      </div>

      {/* Lienzo de hoja A4 */}
      <main className="workspace" onMouseUp={() => { if (copiedFormat) handleApplyFormat(); }}>
        <div className="page-a4">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Barra de estado */}
      <footer className="statusbar no-print">
        <span>{t.words}: {wordCount}</span>
        <span>{copiedFormat ? t.pasteFormatHint : t.readyStatus}</span>
      </footer>
    </div>
  );
}