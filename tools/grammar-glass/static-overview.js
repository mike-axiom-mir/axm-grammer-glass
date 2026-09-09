'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Budget = require('./render-budget-core.js');

const RECEIPT_SCHEMA = 'axm.code.grammar-glass-static-overview-receipt.v1';
const COLORS = Object.freeze({
  STATE: '#7df6be',
  CONDITION: '#ffd36e',
  CONTROL_FLOW: '#8fb3ff',
  TYPE: '#a995ff',
  EFFECT: '#ff8f91',
  FAILURE: '#ff6f9e',
  INTERFACE: '#72d7ff',
  REPRESENTATION: '#d1a4ff',
  TRANSFORMATION: '#ffad68',
  DEPENDENCY: '#c5d1dc',
  VERIFICATION: '#92f2ff',
  ERROR: '#ff6f9e',
  UNKNOWN: '#8293a5'
});

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function short(value, length = 16) {
  const text = String(value || 'unrecorded').replace(/^sha256:/, '');
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`STATIC_OVERVIEW_${label}_REQUIRED`);
  return number;
}

function validate(snapshot) {
  if (!snapshot || snapshot.schema !== 'axm.code.grammar-glass-visual-snapshot.v1') {
    throw new Error('STATIC_OVERVIEW_VALID_VISUAL_SNAPSHOT_REQUIRED');
  }
  if (!snapshot.cycle || !Array.isArray(snapshot.cycle.atoms) || !Array.isArray(snapshot.cycle.edges)) {
    throw new Error('STATIC_OVERVIEW_CYCLE_REQUIRED');
  }
  for (const atom of snapshot.cycle.atoms) {
    if (!atom || !atom.atomId || !atom.position) throw new Error('STATIC_OVERVIEW_ATOM_POSITION_REQUIRED');
    finite(atom.position.x, 'ATOM_X');
    finite(atom.position.y, 'ATOM_Y');
  }
  return snapshot;
}

function colorFor(atom) {
  return COLORS[String(atom.atomType || 'UNKNOWN').toUpperCase()] || COLORS.UNKNOWN;
}

function pointFor(position, cx, cy, scale) {
  return {
    x: cx + finite(position.x, 'POSITION_X') * scale,
    y: cy + finite(position.y, 'POSITION_Y') * scale
  };
}

function countBy(items, key) {
  const counts = new Map();
  for (const item of items) {
    const value = String(item?.[key] || 'UNKNOWN');
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function renderStaticOverview(snapshot, { width = 1600, height = 1000, mode = 'AUTO' } = {}) {
  validate(snapshot);
  width = Math.round(finite(width, 'WIDTH'));
  height = Math.round(finite(height, 'HEIGHT'));
  if (width < 960 || height < 640) throw new Error('STATIC_OVERVIEW_MINIMUM_SIZE_960_X_640');

  const plan = Budget.createPlan(snapshot.cycle.atoms, { mode });
  const panelX = Math.round(width * 0.735);
  const fieldLeft = 34;
  const fieldTop = 166;
  const fieldRight = panelX - 28;
  const fieldBottom = height - 82;
  const fieldWidth = fieldRight - fieldLeft;
  const fieldHeight = fieldBottom - fieldTop;
  const cx = fieldLeft + fieldWidth * 0.5;
  const cy = fieldTop + fieldHeight * 0.5;
  const scale = Math.min(fieldWidth, fieldHeight) * 0.46;
  const positions = new Map(plan.entries.map(({ atom }) => [atom.atomId, pointFor(atom.position, cx, cy, scale)]));
  const selectedIds = new Set(positions.keys());
  const drawnEdges = snapshot.cycle.edges.filter(edge => selectedIds.has(edge.leftAtomId) && selectedIds.has(edge.rightAtomId));
  const types = countBy(snapshot.cycle.atoms, 'atomType');
  const families = countBy(snapshot.cycle.atoms, 'grammarFamilyId');
  const stars = Array.isArray(snapshot.draftSky) ? snapshot.draftSky : [];
  const highlightedLanguages = new Set(stars.flatMap(star => Array.isArray(star.languageIds) ? star.languageIds : []));

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="overview-title overview-desc" data-projection-mode="${esc(plan.mode)}" data-selection-fingerprint="${esc(plan.selectionFingerprint)}">`);
  parts.push(`<title id="overview-title">Grammar Glass static evidence overview</title>`);
  parts.push(`<desc id="overview-desc">A deterministic, non-authoritative static projection of ${snapshot.cycle.atoms.length} recorded grammar atoms across ${snapshot.profileCount || 0} profiles at cycle tick ${snapshot.cycle.tick || 0}. ${plan.renderedAtomCount} atoms are drawn; the complete evidence count remains stated.</desc>`);
  parts.push(`<defs><radialGradient id="field" cx="50%" cy="46%" r="62%"><stop offset="0" stop-color="#17365a"/><stop offset="0.56" stop-color="#071523"/><stop offset="1" stop-color="#02060b"/></radialGradient><linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101d2b"/><stop offset="1" stop-color="#07101a"/></linearGradient><filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`);
  parts.push(`<rect width="${width}" height="${height}" fill="#02060b"/>`);
  parts.push(`<rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="24" fill="url(#panel)" stroke="#31516c"/>`);
  parts.push(`<text x="42" y="62" fill="#7df6be" font-family="ui-monospace,monospace" font-size="13" font-weight="700" letter-spacing="2.4">DRAFTSKY · STATIC EVIDENCE REALIZATION</text>`);
  parts.push(`<text x="42" y="112" fill="#eef8ff" font-family="system-ui,sans-serif" font-size="38" font-weight="800">GRAMMAR GLASS</text>`);
  parts.push(`<text x="42" y="140" fill="#91a9bd" font-family="ui-monospace,monospace" font-size="13">snapshot ${esc(short(snapshot.visualSnapshotSha256, 22))} · tick ${esc(snapshot.cycle.tick || 0)} · ${esc(plan.mode)} projection</text>`);

  parts.push(`<rect x="${fieldLeft}" y="${fieldTop}" width="${fieldWidth}" height="${fieldHeight}" rx="22" fill="url(#field)" stroke="#284a65"/>`);
  for (const radius of [0.24, 0.48, 0.72, 0.96]) {
    parts.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(scale * radius).toFixed(2)}" fill="none" stroke="#74d7ff" stroke-opacity="${radius === 0.96 ? 0.18 : 0.09}" stroke-dasharray="3 9"/>`);
  }
  parts.push(`<line x1="${fieldLeft + 16}" y1="${cy.toFixed(2)}" x2="${fieldRight - 16}" y2="${cy.toFixed(2)}" stroke="#a995ff" stroke-opacity="0.07"/>`);
  parts.push(`<line x1="${cx.toFixed(2)}" y1="${fieldTop + 16}" x2="${cx.toFixed(2)}" y2="${fieldBottom - 16}" stroke="#7df6be" stroke-opacity="0.07"/>`);

  parts.push('<g aria-label="recorded interaction edges">');
  for (const edge of drawnEdges) {
    const a = positions.get(edge.leftAtomId);
    const b = positions.get(edge.rightAtomId);
    const active = edge.thresholdMet === true;
    parts.push(`<line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" stroke="${active ? '#72d7ff' : '#718195'}" stroke-opacity="${active ? 0.28 : 0.10}" stroke-width="${active ? 1.3 : 0.7}"${active ? '' : ' stroke-dasharray="3 5"'}/>`);
  }
  parts.push('</g>');

  parts.push('<g aria-label="deterministically selected atom projection">');
  for (const { atom } of plan.entries) {
    const p = positions.get(atom.atomId);
    const carry = Number(atom.appliedInfluenceCarryCount || 0) > 0;
    const highlighted = highlightedLanguages.has(atom.languageId);
    if (carry) parts.push(`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="5.8" fill="none" stroke="#ffad68" stroke-opacity="0.42"/>`);
    parts.push(`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${highlighted ? 3.6 : 2.45}" fill="${colorFor(atom)}" fill-opacity="${highlighted ? 0.96 : 0.66}"${highlighted ? ' stroke="#ffffff" stroke-opacity="0.36" stroke-width="0.8"' : ''}/>`);
  }
  parts.push('</g>');

  parts.push('<g aria-label="draft star receipts">');
  for (const [index, star] of stars.entries()) {
    const p = pointFor({ x: star.x, y: star.y }, cx, cy, scale);
    const outer = 10 + Math.max(0, Math.min(1, Number(star.brightness || 0))) * 6;
    parts.push(`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${outer.toFixed(1)}" fill="#ffd36e" fill-opacity="0.10" stroke="#ffd36e" stroke-opacity="0.48" filter="url(#glow)"/>`);
    parts.push(`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4.2" fill="#fff2b8"/>`);
    parts.push(`<text x="${(p.x + 10).toFixed(2)}" y="${(p.y - 8).toFixed(2)}" fill="#ffd36e" font-family="ui-monospace,monospace" font-size="10">STAR ${index + 1}</text>`);
  }
  parts.push('</g>');

  const sideX = panelX;
  const sideWidth = width - panelX - 36;
  parts.push(`<rect x="${sideX}" y="${fieldTop}" width="${sideWidth}" height="${fieldHeight}" rx="22" fill="#07111c" stroke="#284a65"/>`);
  parts.push(`<text x="${sideX + 24}" y="${fieldTop + 38}" fill="#eef8ff" font-family="system-ui,sans-serif" font-size="19" font-weight="800">WHAT THIS FRAME CONTAINS</text>`);
  const facts = [
    ['PROFILES', snapshot.profileCount || 0],
    ['EVIDENCE ATOMS', snapshot.cycle.atoms.length],
    ['DRAWN ATOMS', plan.renderedAtomCount],
    ['HELD FROM DRAW', plan.projectionHeldAtomCount],
    ['RECORDED EDGES', snapshot.cycle.edges.length],
    ['DRAWN EDGES', drawnEdges.length],
    ['DRAFT STARS', stars.length]
  ];
  let y = fieldTop + 70;
  for (const [label, value] of facts) {
    parts.push(`<text x="${sideX + 24}" y="${y}" fill="#7891a6" font-family="ui-monospace,monospace" font-size="10" letter-spacing="1.4">${esc(label)}</text>`);
    parts.push(`<text x="${sideX + sideWidth - 24}" y="${y}" text-anchor="end" fill="#edf7ff" font-family="ui-monospace,monospace" font-size="15" font-weight="700">${esc(value)}</text>`);
    y += 29;
  }
  parts.push(`<line x1="${sideX + 24}" y1="${y - 8}" x2="${sideX + sideWidth - 24}" y2="${y - 8}" stroke="#29465d"/>`);
  y += 18;
  parts.push(`<text x="${sideX + 24}" y="${y}" fill="#eef8ff" font-family="system-ui,sans-serif" font-size="15" font-weight="700">ATOM TYPES · FULL EVIDENCE</text>`);
  y += 28;
  const typeStartY = y;
  const typeRows = Math.ceil(types.length / 2);
  const typeColumnWidth = (sideWidth - 48) * 0.5;
  for (const [index, [type, count]] of types.entries()) {
    const column = Math.floor(index / typeRows);
    const row = index % typeRows;
    const x = sideX + 24 + column * typeColumnWidth;
    const rowY = typeStartY + row * 22;
    parts.push(`<circle cx="${x + 6}" cy="${rowY - 4}" r="4" fill="${COLORS[type] || COLORS.UNKNOWN}"/>`);
    parts.push(`<text x="${x + 19}" y="${rowY}" fill="#9fb4c6" font-family="ui-monospace,monospace" font-size="9.5">${esc(type)}</text>`);
    parts.push(`<text x="${x + typeColumnWidth - 8}" y="${rowY}" text-anchor="end" fill="#dce9f3" font-family="ui-monospace,monospace" font-size="10">${esc(count)}</text>`);
  }
  y = typeStartY + typeRows * 22 + 8;
  parts.push(`<text x="${sideX + 24}" y="${y}" fill="#eef8ff" font-family="system-ui,sans-serif" font-size="15" font-weight="700">LARGEST GRAMMAR FAMILIES</text>`);
  y += 27;
  for (const [family, count] of families.slice(0, 4)) {
    parts.push(`<text x="${sideX + 24}" y="${y}" fill="#9fb4c6" font-family="ui-monospace,monospace" font-size="11">${esc(family)}</text>`);
    parts.push(`<text x="${sideX + sideWidth - 24}" y="${y}" text-anchor="end" fill="#7df6be" font-family="ui-monospace,monospace" font-size="11">${esc(count)}</text>`);
    y += 23;
  }

  const truthY = fieldBottom - 124;
  parts.push(`<rect x="${sideX + 18}" y="${truthY}" width="${sideWidth - 36}" height="106" rx="14" fill="#0d1a25" stroke="#7df6be" stroke-opacity="0.34"/>`);
  parts.push(`<text x="${sideX + 34}" y="${truthY + 26}" fill="#7df6be" font-family="ui-monospace,monospace" font-size="11" font-weight="700" letter-spacing="1.2">TRUTH BOUNDARY</text>`);
  parts.push(`<text x="${sideX + 34}" y="${truthY + 49}" fill="#b8c9d6" font-family="system-ui,sans-serif" font-size="11">Projection geometry is not semantic distance.</text>`);
  parts.push(`<text x="${sideX + 34}" y="${truthY + 68}" fill="#b8c9d6" font-family="system-ui,sans-serif" font-size="11">Held from this frame does not mean absent.</text>`);
  parts.push(`<text x="${sideX + 34}" y="${truthY + 87}" fill="#b8c9d6" font-family="system-ui,sans-serif" font-size="11">Stars are receipts, not quality votes or authority.</text>`);

  parts.push(`<text x="42" y="${height - 45}" fill="#71879a" font-family="ui-monospace,monospace" font-size="11">STATIC REALIZATION · FULL SNAPSHOT UNCHANGED · SELECTION ${esc(plan.selectionFingerprint)} · AUTHORITY NONE</text>`);
  parts.push('</svg>');
  const svg = `${parts.join('\n')}\n`;
  const receipt = Object.freeze({
    schema: RECEIPT_SCHEMA,
    version: '1.0.0',
    sourceVisualSnapshotSha256: snapshot.visualSnapshotSha256 || null,
    sourceCycleSha256: snapshot.cycle.cycleSha256 || null,
    projectionMode: plan.mode,
    selectionFingerprint: plan.selectionFingerprint,
    width,
    height,
    evidenceAtomCount: plan.evidenceAtomCount,
    renderedAtomCount: plan.renderedAtomCount,
    projectionHeldAtomCount: plan.projectionHeldAtomCount,
    languageCoverageCount: plan.languageCoverageCount,
    recordedEdgeCount: snapshot.cycle.edges.length,
    renderedEdgeCount: drawnEdges.length,
    draftStarCount: stars.length,
    svgSha256: sha256(svg),
    truth: Object.freeze({
      sourceSnapshotMutated: false,
      staticProjectionCreatesEvidence: false,
      geometryIsSemanticDistance: false,
      heldFromProjectionMeansAbsent: false,
      starsAreQualityVotes: false,
      automaticSelectionPerformed: false,
      authority: 'NONE'
    })
  });
  return Object.freeze({ svg, receipt });
}

function writeStaticOverview(snapshot, outputPath, options = {}) {
  const rendered = renderStaticOverview(snapshot, options);
  const target = path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, rendered.svg, 'utf8');
  fs.writeFileSync(`${target}.receipt.json`, `${JSON.stringify(rendered.receipt, null, 2)}\n`, 'utf8');
  return rendered.receipt;
}

function main(argv) {
  const [inputPath, outputPath, mode = 'AUTO'] = argv;
  if (!inputPath || !outputPath) {
    throw new Error('usage: node static-overview.js SNAPSHOT.json OVERVIEW.svg [AUTO|SAFE|BALANCED|FULL]');
  }
  const snapshot = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const receipt = writeStaticOverview(snapshot, outputPath, { mode });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

if (require.main === module) main(process.argv.slice(2));

module.exports = Object.freeze({ RECEIPT_SCHEMA, COLORS, renderStaticOverview, writeStaticOverview });
