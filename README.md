<div align="center">

# 📝 MDocs

**Un procesador de textos ligero de escritorio, con cinta de opciones estilo Word.**

![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TipTap](https://img.shields.io/badge/TipTap-3-793BF6)
![Platform](https://img.shields.io/badge/Windows-0078D6?logo=windows&logoColor=white)

**Español** | [English](README.en.md)

</div>

---

## ✨ Características

- **Interfaz oscura** con una cinta de opciones inspirada en Word y una hoja A4 para escribir.
- **Formato de texto completo:** fuente, tamaño, negrita, cursiva, subrayado, tachado, subíndice y superíndice.
- **Copiar formato** de un texto y aplicarlo a otro.
- **Selector de color manual** para el texto y el resaltado: área de saturación/brillo, barra de tono y campo **hexadecimal** debajo, más colores rápidos.
- **Párrafo:** listas con viñetas y numeradas, citas y alineación (izquierda, centro, derecha, justificado).
- **Tablas:** insertar, añadir filas y columnas, eliminar filas y tabla completa.
- **Estilos rápidos:** texto normal, títulos (H1–H3) y citas.
- **Bloques de código con resaltado de sintaxis** para PHP, Python, HTML, CSS, JavaScript y Markdown.
- **Abrir** archivos `.docx`, `.html` y `.txt`.
- **Guardar** como `.docx` y **exportar a PDF**.
- **Interfaz en español e inglés**, con cambio al instante.
- Contador de palabras en la barra de estado.

---

## 📥 Instalación (usuarios)

1. Ve a la sección **[Releases](../../releases)** de este repositorio.
2. Descarga la versión que prefieras:
   - **`MDocs Setup x.y.z.exe`**: instalador.
   - **`MDocs x.y.z.exe`**: versión portable, no necesita instalación.
3. Ejecútalo.

> **Nota:** Windows puede mostrar el aviso *"Windows protegió su equipo"*, porque el instalador no está firmado digitalmente. Pulsa **Más información → Ejecutar de todas formas**.

---

## 🛠️ Desarrollo

### 📋 Requisitos

- [Node.js](https://nodejs.org/) 20 o superior
- npm

### 🚀 Puesta en marcha

```bash
# 1. Clona el repositorio
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO

# 2. Instala las dependencias
npm install

# 3. Arranca la app en modo desarrollo (Vite + Electron)
npm run electron:dev
```

### 📜 Scripts disponibles

| Comando                  | Descripción                                          |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Inicia solo el servidor de Vite (en el navegador)    |
| `npm run electron:dev`   | Inicia Vite y abre la ventana de Electron            |
| `npm run build`          | Genera la versión de producción de la web en `dist/` |
| `npm run electron:build` | Genera el instalador y el portable en `release/`     |
| `npm run lint`           | Ejecuta ESLint                                       |
| `npm run preview`        | Previsualiza el build de Vite                        |

### 📦 Generar el `.exe`

```bash
npm run electron:build
```

Los archivos resultantes quedan en la carpeta `release/`.

> **Consejo para Windows:** si el build falla con *"Cannot create symbolic link"*, activa el **Modo de desarrollador** (Configuración → Para programadores) o ejecuta la terminal como administrador. Si ya se creó una caché corrupta, bórrala antes de reintentar:
>
> ```powershell
> Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
> ```

---

## ⚙️ Descargar desde GitHub Actions/Acciones

También puedes descargar las versiones de desarrollo generadas automáticamente mediante **GitHub Actions**, sin necesidad de esperar a una Release.

1. Accede a la pestaña **[Actions](../../actions)** de este repositorio.
2. Selecciona el último workflow de compilación completado correctamente.
3. Comprueba que su estado sea **Success** (marca verde).
4. Baja hasta la sección **Artifacts**, al final de la ejecución.
5. Descarga el artefacto correspondiente:
   - **MDocs-Setup**: instalador de Windows (`.exe`).
   - **MDocs-Portable**: versión portable (`.exe`), no necesita instalación.
6. Si has descargado un archivo `.zip`, extráelo y ejecuta el `.exe` correspondiente.

> **Nota:** Los artefactos de GitHub Actions son temporales y pueden eliminarse automáticamente después del periodo de retención configurado en el workflow. Para obtener una versión estable y permanente, consulta la sección [Releases](../../releases).

> **Importante:** Estas compilaciones pueden contener cambios recientes que todavía no se han publicado como versiones oficiales.

---

## 🧱 Tecnologías

| Área                  | Herramientas                                                |
| --------------------- | ----------------------------------------------------------- |
| Escritorio            | [Electron](https://www.electronjs.org/) + electron-builder  |
| Interfaz              | [React](https://react.dev/) + [Vite](https://vite.dev/)     |
| Editor                | [TipTap](https://tiptap.dev/) (basado en ProseMirror)       |
| Resaltado de código   | [lowlight](https://github.com/wooorm/lowlight) + highlight.js |
| Importar `.docx`      | [mammoth](https://github.com/mwilliamson/mammoth.js)        |
| Exportar `.docx`      | [docx](https://docx.js.org/)                                |

---

## 📁 Estructura del proyecto

```
├── main.js              # Proceso principal de Electron
├── src/
│   ├── App.jsx          # Interfaz y lógica del editor
│   ├── App.css          # Estilos
│   ├── ColorPicker.jsx  # Selector de color manual + hexadecimal
│   ├── FontSize.js      # Extensión de tamaño de fuente para TipTap
│   ├── exportDocx.js    # Conversión del documento a .docx
│   └── translations.js  # Textos en español e inglés
└── package.json
```

---

## 🤝 Contribuir

¿Has encontrado un fallo o tienes una idea? Abre un [issue](../../issues) o envía un pull request.

---

## 🌱 Sobre este proyecto

MDocs es un proyecto personal que quise realizar por mi cuenta. Soy consciente de que todavía le quedan muchas cosas por mejorar, pero estoy empezando a aprender y cada paso de este proyecto me ha enseñado algo nuevo. Cualquier sugerencia o consejo será bienvenido.

---

<div align="center">

Hecho por **Miuu-Dev** 💜

</div>
