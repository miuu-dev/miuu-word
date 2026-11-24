import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';

const ALIGN_MAP = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
};

const HEADING_MAP = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
};

function parseTextRuns(content = [], forceCodeStyle = false) {
  if (!content || content.length === 0) {
    return [new TextRun({ text: '' })];
  }

  return content.map((node) => {
    if (node.type === 'hardBreak') {
      return new TextRun({ break: 1 });
    }

    const marks = node.marks || [];
    let bold = false;
    let italics = false;
    let underline = undefined;
    let strike = false;
    let subScript = false;
    let superScript = false;
    let font = forceCodeStyle ? 'JetBrains Mono' : 'Century Gothic';
    let size = forceCodeStyle ? 20 : 24;
    let color = forceCodeStyle ? 'F4F4F5' : undefined;

    for (const mark of marks) {
      if (mark.type === 'bold') bold = true;
      if (mark.type === 'italic') italics = true;
      if (mark.type === 'underline') underline = {};
      if (mark.type === 'strike') strike = true;
      if (mark.type === 'subscript') subScript = true;
      if (mark.type === 'superscript') superScript = true;

      if (mark.type === 'textStyle') {
        if (mark.attrs?.fontFamily) font = mark.attrs.fontFamily;
        if (mark.attrs?.fontSize) {
          const px = parseInt(mark.attrs.fontSize.replace('px', ''), 10);
          if (!isNaN(px)) size = Math.round(px * 1.5);
        }
        if (mark.attrs?.color) {
          color = mark.attrs.color.replace('#', '');
        }
      }
    }

    return new TextRun({
      text: node.text || '',
      bold,
      italics,
      underline,
      strike,
      subScript,
      superScript,
      font,
      size,
      color,
    });
  });
}

function convertNode(node) {
  const align = ALIGN_MAP[node.attrs?.textAlign] || AlignmentType.LEFT;

  switch (node.type) {
    case 'paragraph':
      return [
        new Paragraph({
          alignment: align,
          spacing: { after: 120 },
          children: parseTextRuns(node.content),
        }),
      ];

    case 'heading':
      return [
        new Paragraph({
          heading: HEADING_MAP[node.attrs?.level] || HeadingLevel.HEADING_1,
          alignment: align,
          spacing: { before: 200, after: 120 },
          children: parseTextRuns(node.content),
        }),
      ];

    case 'blockquote':
      return (node.content || []).flatMap((child) =>
        new Paragraph({
          alignment: align,
          indent: { left: 480 },
          border: {
            left: { color: '793BF6', space: 12, style: BorderStyle.SINGLE, size: 18 },
          },
          shading: { type: ShadingType.CLEAR, fill: 'FAF5FF' },
          spacing: { after: 120 },
          children: parseTextRuns(child.content),
        })
      );

    case 'codeBlock': {
      const lang = (node.attrs?.language || 'CODE').toUpperCase();
      const rawText = (node.content || []).map((c) => c.text || '').join('');
      const lines = rawText.split('\n');

      return [
        new Paragraph({
          spacing: { before: 140, after: 40 },
          shading: { type: ShadingType.CLEAR, fill: '27272A' },
          children: [
            new TextRun({
              text: ` [${lang}]`,
              bold: true,
              font: 'JetBrains Mono',
              size: 18,
              color: lang === 'PYTHON' ? 'FFD43B' : 'A5B4FC',
            }),
          ],
        }),
        ...lines.map(
          (line) =>
            new Paragraph({
              shading: { type: ShadingType.CLEAR, fill: '18181B' },
              indent: { left: 160, right: 160 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: line || ' ',
                  font: 'JetBrains Mono',
                  size: 20,
                  color: 'F4F4F5',
                }),
              ],
            })
        ),
      ];
    }

    case 'bulletList':
      return (node.content || []).flatMap((item) =>
        (item.content || []).map(
          (p) =>
            new Paragraph({
              bullet: { level: 0 },
              children: parseTextRuns(p.content),
            })
        )
      );

    case 'orderedList':
      return (node.content || []).flatMap((item, idx) =>
        (item.content || []).map(
          (p) =>
            new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true, font: 'Century Gothic', size: 24 }),
                ...parseTextRuns(p.content),
              ],
            })
        )
      );

    case 'table': {
      const rows = (node.content || []).map((rowNode) => {
        const cells = (rowNode.content || []).map((cellNode) => {
          const isHeader = cellNode.type === 'tableHeader';
          const cellParagraphs = (cellNode.content || []).flatMap((c) => convertNode(c));

          return new TableCell({
            shading: isHeader ? { type: ShadingType.CLEAR, fill: 'F0EBF8' } : undefined,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: cellParagraphs.length > 0 ? cellParagraphs : [new Paragraph('')],
          });
        });

        return new TableRow({ children: cells });
      });

      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }),
        new Paragraph({ text: '' }),
      ];
    }

    default:
      return [];
  }
}

export async function generateDocxBlob(editorJSON) {
  const children = (editorJSON.content || []).flatMap((node) => convertNode(node));

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1417,
              right: 1417,
              bottom: 1417,
              left: 1417,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}