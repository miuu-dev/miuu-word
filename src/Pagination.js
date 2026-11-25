import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const MM = 96 / 25.4;
const PAGE_H = 297 * MM;
const GAP = 12 * MM;
const MARGIN = 25 * MM;
const CONTENT_H = PAGE_H - 2 * MARGIN;
const STRIDE = PAGE_H + GAP;

const key = new PluginKey('pagination');

function createSpacer(height) {
  return () => {
    const el = document.createElement('div');
    el.className = 'page-spacer';
    el.style.height = `${height}px`;
    el.contentEditable = 'false';
    return el;
  };
}

function buildSet(doc, spacers) {
  return DecorationSet.create(
    doc,
    spacers.map((s) =>
      Decoration.widget(s.pos, createSpacer(s.height), {
        side: -1,
        key: `pg-${s.pos}-${Math.round(s.height)}`,
        spacerHeight: s.height,
      })
    )
  );
}

function sameSpacers(a, b) {
  return (
    a.length === b.length &&
    a.every((s, i) => s.pos === b[i].pos && Math.abs(s.height - b[i].height) < 1)
  );
}

function computeSpacers(view) {
  const dom = view.dom;
  const existing = dom.querySelectorAll(':scope > .page-spacer');
  existing.forEach((e) => {
    e.style.display = 'none';
  });

  const top0 = dom.getBoundingClientRect().top;
  const spacers = [];
  let added = 0;   // desplazamiento acumulado real por separadores ya añadidos
  let prevEnd = 0; // borde inferior real (con margin-bottom y separadores) del bloque anterior
  let endY = 0;

  view.state.doc.forEach((node, offset) => {
    const el = view.nodeDOM(offset);
    if (!el || el.nodeType !== 1) return;

    const r = el.getBoundingClientRect();
    if (r.height === 0) return;

    const cs = getComputedStyle(el);
    const mt = parseFloat(cs.marginTop) || 0;
    const mb = parseFloat(cs.marginBottom) || 0;

    const natTop = r.top - top0;
    const natBottom = r.bottom - top0;

    const top = natTop + added;
    const bottom = natBottom + added;

    const page = Math.floor(Math.max(0, top) / STRIDE);
    const pageStart = page * STRIDE;
    const pageEnd = pageStart + CONTENT_H;

    const startsInMarginOrGap = top >= pageEnd - 0.5;
    const overflowsPage = bottom > pageEnd + 0.5 && top > pageStart + 1;

    if (startsInMarginOrGap || overflowsPage) {
      const targetPage =
        startsInMarginOrGap && top >= pageStart + CONTENT_H + GAP - 0.5
          ? page
          : page + 1;

      const targetTop = targetPage * STRIDE;
      const effectiveTop = Math.max(top, prevEnd + mt);
      const spacerHeight = Math.max(0, targetTop - effectiveTop);

      if (spacerHeight > 0.5) {
        spacers.push({ pos: offset, height: spacerHeight });
        added += spacerHeight;
      }
    }

    const finalTop = natTop + added;
    const finalBottom = natBottom + added;
    prevEnd = finalBottom + mb;
    endY = Math.max(endY, finalBottom, finalTop);
  });

  existing.forEach((e) => {
    e.style.display = '';
  });

  const pages = Math.max(1, Math.floor(Math.max(endY - 1, 0) / STRIDE) + 1);
  const minHeight = pages * PAGE_H + (pages - 1) * GAP - 2 * MARGIN;

  return { spacers, minHeight };
}

export const Pagination = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key,

        state: {
          init: () => DecorationSet.empty,
          apply(tr, set) {
            const meta = tr.getMeta(key);
            if (meta) return buildSet(tr.doc, meta);
            return set.map(tr.mapping, tr.doc);
          },
        },

        props: {
          decorations(state) {
            return key.getState(state);
          },
        },

        view(editorView) {
          let raf = null;

          const run = () => {
            raf = null;
            if (!editorView.dom.isConnected) return;

            const { spacers, minHeight } = computeSpacers(editorView);
            editorView.dom.style.minHeight = `${minHeight}px`;

            const current = key
              .getState(editorView.state)
              .find()
              .map((d) => ({ pos: d.from, height: d.spec.spacerHeight }));

            if (!sameSpacers(current, spacers)) {
              editorView.dispatch(
                editorView.state.tr.setMeta(key, spacers).setMeta('addToHistory', false)
              );
            }
          };

          const schedule = () => {
            if (raf == null) raf = requestAnimationFrame(run);
          };

          schedule();

          const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
          if (ro) ro.observe(editorView.dom);
          if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);

          return {
            update: schedule,
            destroy() {
              if (raf != null) cancelAnimationFrame(raf);
              if (ro) ro.disconnect();
            },
          };
        },
      }),
    ];
  },
});