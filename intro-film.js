/* MahaSetu scroll-film intro — hierarchical diagram, canvas-drawn.
   Same architecture as the scroll-site-gen skill's vanilla scrubber
   (sticky stage, scrollY -> progress -> frame draw, data-in/hold/out
   captions) but frames are procedurally drawn each tick instead of
   decoded from AI-generated WebP frames — platform.higgsfield.ai is
   unreachable from this environment, and a diagram of MahaSetu's
   hierarchy is better served by a precise vector draw than photoreal
   video anyway. */

const track = document.getElementById('film-track');
const canvas = document.getElementById('film-canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('film-loader');
const scrollCue = document.getElementById('film-scrollcue');
const fcaps = [...document.querySelectorAll('.fcap')];

const ROOT = { label: 'MahaSetu', sub: 'Integration Layer' };
const BRANCH_A = [
  { label: 'Identity Registry' },
  { label: 'Revenue & Residence' },
  { label: 'Income Verification' },
];
const BRANCH_B = [
  { label: 'Education Records' },
  { label: 'Benefits Registry' },
  { label: 'Document Vault' },
];
const ALL_LEAVES = [...BRANCH_A, ...BRANCH_B];

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth; H = canvas.clientHeight;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function clamp01(v) { return Math.min(1, Math.max(0, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

/* layout: root centered upper-third, 6 leaves fan out in two rows below */
function layout() {
  const rootY = H * 0.30;
  const rootX = W / 2;
  const rowAY = H * 0.56;
  const rowBY = H * 0.74;
  const spanA = Math.min(W * 0.62, 620);
  const spanB = Math.min(W * 0.72, 720);
  const leafPos = [];
  BRANCH_A.forEach((_, i) => {
    const t = BRANCH_A.length === 1 ? 0.5 : i / (BRANCH_A.length - 1);
    leafPos.push({ x: rootX - spanA / 2 + spanA * t, y: rowAY });
  });
  BRANCH_B.forEach((_, i) => {
    const t = BRANCH_B.length === 1 ? 0.5 : i / (BRANCH_B.length - 1);
    leafPos.push({ x: rootX - spanB / 2 + spanB * t, y: rowBY });
  });
  return { root: { x: rootX, y: rootY }, leaves: leafPos };
}

/* progress phases (fractions of total scroll):
   0.00–0.10  title only, canvas empty
   0.10–0.20  root node materializes
   0.20–0.50  branch A lines draw + nodes appear (identity/revenue/income)
   0.50–0.75  branch B lines draw + nodes appear (education/benefits/docs)
   0.75–1.00  full hierarchy settles, gentle glow pulse           */

function draw(p) {
  ctx.clearRect(0, 0, W, H);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0a0e18'); grad.addColorStop(1, '#080b14');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

  // faint grid dots for depth
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  const step = 34;
  for (let x = (W % step) / 2; x < W; x += step) {
    for (let y = (H % step) / 2; y < H; y += step) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  const { root, leaves } = layout();
  const rootP = easeOutCubic(clamp01((p - 0.10) / 0.10));
  if (rootP <= 0) { return; }

  // root node
  const rootR = lerp(0, 46, rootP);
  drawNodeGlow(root.x, root.y, rootR * 1.9, rootP * 0.35);
  ctx.beginPath(); ctx.arc(root.x, root.y, rootR, 0, Math.PI * 2);
  ctx.fillStyle = '#0d1424'; ctx.fill();
  ctx.lineWidth = 1.6; ctx.strokeStyle = `rgba(224,138,44,${rootP})`; ctx.stroke();
  if (rootP > 0.5) {
    ctx.globalAlpha = clamp01((rootP - 0.5) * 2);
    ctx.fillStyle = '#eef1f8'; ctx.font = '600 15px Fraunces, serif'; ctx.textAlign = 'center';
    ctx.fillText('MahaSetu', root.x, root.y + 5);
    ctx.globalAlpha = 1;
  }

  // branch A: 0.20 - 0.50
  drawBranch(root, leaves.slice(0, 3), BRANCH_A, (p - 0.22) / 0.26);
  // branch B: 0.50 - 0.75
  drawBranch(root, leaves.slice(3, 6), BRANCH_B, (p - 0.52) / 0.22);

  // final settle glow across whole tree
  if (p > 0.85) {
    const pulse = 0.5 + 0.5 * Math.sin((p - 0.85) * 40);
    drawNodeGlow(root.x, root.y, 90, 0.12 + pulse * 0.06);
  }
}

function drawBranch(root, leafPositions, meta, tRaw) {
  const t = clamp01(tRaw);
  leafPositions.forEach((leaf, i) => {
    const stagger = i * 0.16;
    const localT = clamp01((t - stagger) / (1 - stagger || 1));
    const lineT = easeOutCubic(clamp01(localT / 0.6));
    const nodeT = easeOutCubic(clamp01((localT - 0.35) / 0.65));
    if (lineT <= 0) return;

    // connecting line, drawn from root outward
    const midX = lerp(root.x, leaf.x, lineT);
    const midY = lerp(root.y, leaf.y, lineT);
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.quadraticCurveTo(root.x, (root.y + leaf.y) / 2, midX, midY);
    ctx.strokeStyle = `rgba(224,138,44,${0.55 * lineT})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (nodeT <= 0) return;
    const r = lerp(0, 8, nodeT);
    ctx.beginPath(); ctx.arc(leaf.x, leaf.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(238,241,248,${0.9 * nodeT})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(224,138,44,${nodeT})`;
    ctx.stroke();

    if (nodeT > 0.55) {
      const labelA = clamp01((nodeT - 0.55) / 0.45);
      ctx.globalAlpha = labelA;
      ctx.fillStyle = 'rgba(238,241,248,0.85)';
      ctx.font = '500 12.5px Inter, sans-serif';
      ctx.textAlign = 'center';
      const ly = leaf.y > root.y + 200 ? leaf.y + 24 : leaf.y + 22;
      ctx.fillText(meta[i].label, leaf.x, ly);
      ctx.globalAlpha = 1;
    }
  });
}

function drawNodeGlow(x, y, r, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(224,138,44,${alpha})`);
  g.addColorStop(1, 'rgba(224,138,44,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

/* ---- scroll mapping + captions (same pattern as the skill's main.js) ---- */

function progress() {
  const max = track.offsetHeight - window.innerHeight;
  return max > 0 ? clamp01(window.scrollY / max) : 0;
}

function updateCaptions(p) {
  for (const el of fcaps) {
    const tIn = +el.dataset.in, tHold = +el.dataset.hold, tOut = +el.dataset.out;
    const rise = Math.max((tHold - tIn) * 0.4, 0.01);
    const fall = Math.max((tOut - tHold) * 0.5, 0.01);
    let o = 0;
    if (p >= tIn && p <= tOut) {
      o = Math.min((p - tIn) / rise, 1) * Math.min((tOut - p) / fall, 1);
      o = clamp01(o);
    }
    el.style.opacity = o.toFixed(3);
  }
  scrollCue.style.opacity = p < 0.02 ? 1 : 0;
}

let smooth = 0, lastT = performance.now();
function tick(now) {
  const dt = Math.min((now - lastT) / 1000, 0.5) || 0.016;
  lastT = now;
  const p = progress();
  const k = 1 - Math.exp(-dt * 12);
  smooth += (p - smooth) * k;
  if (Math.abs(p - smooth) < 0.0015) smooth = p;
  draw(smooth);
  updateCaptions(p);
  requestAnimationFrame(tick);
}

requestAnimationFrame(() => {
  loader.classList.add('done');
  requestAnimationFrame(tick);
});
