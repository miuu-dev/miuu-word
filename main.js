import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Activa corrección simultánea en español e inglés (no marca errores en ninguno de los dos idiomas)
  win.webContents.session.setSpellCheckerLanguages(['es-ES', 'en-US', 'en-GB']);

  win.maximize();

  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// Exportar directamente a PDF con el nombre del documento prerrellenado
ipcMain.handle('export-pdf', async (event, docTitle) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const safeName = (docTitle || 'Documento').trim();

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Guardar documento como PDF',
    defaultPath: path.join(app.getPath('desktop'), `${safeName}.pdf`),
    filters: [{ name: 'Documento PDF', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) return false;

  const pdfData = await win.webContents.printToPDF({
    printBackground: true, // Conserva los fondos oscuros de los bloques PHP/Python
    pageSize: 'A4',
    margins: {
      marginType: 'none', // Usa los márgenes propios de tu hoja .page-a4
    },
  });

  await fs.writeFile(filePath, pdfData);
  return true;
});

// Guardar directamente como .docx con el nombre del documento prerrellenado
ipcMain.handle('save-docx', async (event, { docTitle, buffer }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const safeName = (docTitle || 'Documento').trim();

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: 'Guardar documento de Word',
    defaultPath: path.join(app.getPath('desktop'), `${safeName}.docx`),
    filters: [{ name: 'Documento de Word', extensions: ['docx'] }],
  });

  if (canceled || !filePath) return false;

  await fs.writeFile(filePath, Buffer.from(buffer));
  return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});