import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const MM = 96 / 25.4;
const PAGE_H = 297 * MM;
const GAP = 12 * MM;
const MARGIN = 25 * MM;
const CONTENT_H = PAGE_H - 2 * MARGIN;
const STRIDE = PAGE_H + GAP;

const splitKey = new PluginKey('splitLongCodeBlock');

function getTextNodeAndOffset(rootEl, targetCharOffset) {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  let remaining = targetCharOffset;
  let current = walker.nextNode();

  while (current) {
    const len = current.nodeValue ? current.nodeValue.length : 0;
    if (remaining <= len) {
      return { node: current, offset: Math.max(0, remaining) };
    }
    remaining -= len;
    current = walker.nextNode();
  }

  return null;
}

function findSplitLineIndex(codeEl, lines, maxBottomDocY, editorTopY) {
  let charCursor = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineStart = charCursor;
    const lineEnd = lineStart + lines[i].length;
    charCursor = lineEnd + 1;

    const startPos = getTextNodeAndOffset(codeEl, lineStart);
    const endPos = getTextNodeAndOffset(codeEl, Math.max(lineStart, lineEnd));
    if (!startPos || !endPos) continue;

    const range = document.createRange();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);

    const rect = range.getBoundingClientRect();
    if (rect.height === 0) continue;

    const lineBottomDocY = rect.bottom - editorTopY;
    if (lineBottomDocY > maxBottomDocY - 0.5) {
      return i;
    }
  }

  return -1;
}

export const SplitLongCodeBlock = Extension.create({
  name: 'splitLongCodeBlock',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: splitKey,

        view(editorView) {
          let raf = null;

          const checkAndSplit = () => {
            raf = null;
            if (!editorView.dom.isConnected) return;

            const { state } = editorView;
            const editorDom = editorView.dom;
            const editorTopY = editorDom.getBoundingClientRect().top;

            const codeBlocks = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'codeBlock') {
                codeBlocks.push({ node, pos });
              }
            });

            if (codeBlocks.length === 0) return;

            let tr = state.tr;
            let modified = false;

            for (let i = codeBlocks.length - 1; i >= 0; i--) {
              const { node, pos } = codeBlocks[i];
              const text = node.textContent || '';
              const lines = text.split('\n');
              if (lines.length <= 1) continue;

              const domNode = editorView.nodeDOM(pos);
              const preEl =
                domNode && domNode.nodeType === 1
                  ? domNode.tagName === 'PRE'
                    ? domNode
                    : domNode.querySelector?.('pre')
                  : null;

              if (!preEl) continue;

              const preRect = preEl.getBoundingClientRect();
              if (preRect.height <= 0) continue;

              const topInDoc = preRect.top - editorTopY;
              const bottomInDoc = preRect.bottom - editorTopY;

              const pageIndex = Math.floor(Math.max(0, topInDoc) / STRIDE);
              const pageContentEnd = pageIndex * STRIDE + CONTENT_H;

              if (bottomInDoc <= pageContentEnd + 0.5) continue;

              const cs = getComputedStyle(preEl);
              const pb = parseFloat(cs.paddingBottom) || 0;
              const maxLineBottomDocY = pageContentEnd - pb;

              const codeEl = preEl.querySelector('code') || preEl;
              const splitLineIdx = findSplitLineIndex(codeEl, lines, maxLineBottomDocY, editorTopY);

              if (splitLineIdx >= 1 && splitLineIdx < lines.length) {
                const firstPartText = lines.slice(0, splitLineIdx).join('\n');
                const secondPartText = lines.slice(splitLineIdx).join('\n');
                if (!secondPartText.trim()) continue;

                const mappedPos = tr.mapping.map(pos);
                const targetNode = tr.doc.nodeAt(mappedPos);
                if (!targetNode || targetNode.type.name !== 'codeBlock') continue;

                const firstNode = targetNode.type.create(
                  { ...targetNode.attrs },
                  firstPartText ? state.schema.text(firstPartText) : null
                );
                const secondNode = targetNode.type.create(
                  { ...targetNode.attrs },
                  secondPartText ? state.schema.text(secondPartText) : null
                );

                tr = tr.replaceWith(mappedPos, mappedPos + targetNode.nodeSize, [
                  firstNode,
                  secondNode,
                ]);
                modified = true;
              }
            }

            if (modified) {
              editorView.dispatch(tr.setMeta(splitKey, true).setMeta('addToHistory', false));
            }
          };

          const schedule = () => {
            if (raf == null) {
              raf = requestAnimationFrame(checkAndSplit);
            }
          };

          schedule();

          return {
            update(view, prevState) {
              if (!view.state.doc.eq(prevState.doc)) {
                schedule();
              }
            },
            destroy() {
              if (raf != null) cancelAnimationFrame(raf);
            },
          };
        },
      }),
    ];
  },
});