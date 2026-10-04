// 칼질 그림(img/knife/*.svg)을 만드는 스크립트.
// 실행: deno run --allow-write=img tools/make-knife-svgs.js  (프로젝트 폴더에서)

const O = '#5b4636';
const CARROT = { f: '#f39a4a', face: '#f9cb97' };
const GREEN = { f: '#86b85f', face: '#eef4cf' };
const ONION = { f: '#9ccc7a', face: '#f7fbe6' };
const RADISH = { f: '#f6f0e2', top: '#fffdf6', side: '#e2d8c3' };
const CARROT_BOX = { f: '#f39a4a', top: '#f9cb97', side: '#dd8236' };

const STYLE =
  '<style>' +
  `.o{stroke:${O};stroke-width:3;stroke-linejoin:round;stroke-linecap:round}` +
  '.c{stroke:#d9622b;stroke-width:3;stroke-dasharray:7 6;fill:none;stroke-linecap:round}' +
  '.t{font:600 15px "Apple SD Gothic Neo","Malgun Gothic",sans-serif;fill:#8a7f76;text-anchor:middle}' +
  '.n{font:600 14px "Apple SD Gothic Neo","Malgun Gothic",sans-serif;fill:#5b4636}' +
  '</style>';

const ARROW =
  '<path d="M188,140H212M203,131l10,9l-10,9" fill="none" stroke="#b9a994" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';

function svg(body, left, right) {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' + STYLE + body +
    (left ? `<text class="t" x="100" y="278">${left}</text>` : '') +
    (right ? `<text class="t" x="305" y="278">${right}</text>` : '') +
    '</svg>\n'
  );
}

// 가로로 누운 원통. 오른쪽 끝에 단면이 보인다.
function log(x1, x2, cy, ry, col) {
  const rx = Math.round(ry * 0.38);
  return (
    `<path class="o" fill="${col.f}" d="M${x1},${cy - ry}L${x2},${cy - ry}A${rx},${ry} 0 0 1 ${x2},${cy + ry}L${x1},${cy + ry}A${rx},${ry} 0 0 1 ${x1},${cy - ry}Z"/>` +
    `<ellipse class="o" fill="${col.face}" cx="${x2}" cy="${cy}" rx="${rx}" ry="${ry}"/>`
  );
}

function arcCut(x, cy, ry) {
  const rx = Math.round(ry * 0.38);
  return `<path class="c" d="M${x},${cy - ry}A${rx},${ry} 0 0 1 ${x},${cy + ry}"/>`;
}

function line(x1, y1, x2, y2) {
  return `<path class="c" d="M${x1},${y1}L${x2},${y2}"/>`;
}

// 상자. (x,y)는 앞면 왼쪽 위, d는 깊이.
function box(x, y, w, h, d, col) {
  const dx = d;
  const dy = -Math.round(d * 0.6);
  return (
    `<polygon class="o" fill="${col.top}" points="${x},${y} ${x + dx},${y + dy} ${x + w + dx},${y + dy} ${x + w},${y}"/>` +
    `<polygon class="o" fill="${col.side}" points="${x + w},${y} ${x + w + dx},${y + dy} ${x + w + dx},${y + h + dy} ${x + w},${y + h}"/>` +
    `<rect class="o" fill="${col.f}" x="${x}" y="${y}" width="${w}" height="${h}"/>`
  );
}

function disc(cx, cy, r, col) {
  return `<circle class="o" fill="${col.f}" cx="${cx}" cy="${cy}" r="${r}"/><circle fill="${col.face}" cx="${cx}" cy="${cy}" r="${r - 6}"/>`;
}

function rot(deg, cx, cy, inner) {
  return `<g transform="rotate(${deg} ${cx} ${cy})">${inner}</g>`;
}

const out = {};

// 통썰기
out.tong = svg(
  log(40, 160, 140, 38, GREEN) + arcCut(70, 140, 38) + arcCut(100, 140, 38) + arcCut(130, 140, 38) + ARROW +
    disc(262, 105, 32, GREEN) + disc(338, 128, 32, GREEN) + disc(285, 185, 32, GREEN),
  '모양 그대로 직각으로', '동그란 조각'
);

// 반달썰기
function half(cx, cy, r, col) {
  return (
    `<path class="o" fill="${col.f}" d="M${cx - r},${cy}A${r},${r} 0 0 1 ${cx + r},${cy}Z"/>` +
    `<path fill="${col.face}" d="M${cx - r + 7},${cy - 2}A${r - 7},${r - 7} 0 0 1 ${cx + r - 7},${cy - 2}Z"/>`
  );
}
out.bandal = svg(
  log(40, 160, 140, 38, GREEN) + line(28, 140, 174, 140) + arcCut(70, 140, 38) + arcCut(100, 140, 38) + arcCut(130, 140, 38) + ARROW +
    half(270, 120, 36, GREEN) + rot(12, 335, 160, half(335, 160, 36, GREEN)) + rot(-10, 275, 210, half(275, 210, 36, GREEN)),
  '길게 반 갈라서 썰기', '반달 모양'
);

// 은행잎썰기
function quarter(cx, cy, r, col) {
  return (
    `<path class="o" fill="${col.f}" d="M${cx},${cy}L${cx + r},${cy}A${r},${r} 0 0 0 ${cx},${cy - r}Z"/>` +
    `<path fill="${col.face}" d="M${cx + 2},${cy - 2}L${cx + r - 7},${cy - 2}A${r - 7},${r - 7} 0 0 0 ${cx + 2},${cy - r + 7}Z"/>`
  );
}
out.eunhaeng = svg(
  log(40, 160, 140, 38, CARROT) + line(28, 140, 174, 140) + line(160, 102, 160, 178) +
    arcCut(70, 140, 38) + arcCut(100, 140, 38) + arcCut(130, 140, 38) + ARROW +
    quarter(245, 130, 44, CARROT) + rot(15, 310, 150, quarter(310, 150, 44, CARROT)) + rot(-8, 255, 215, quarter(255, 215, 44, CARROT)),
  '길게 4등분해서 썰기', '부채꼴 모양'
);

// 어슷썰기
function oval(cx, cy, col, deg) {
  return rot(deg, cx, cy,
    `<ellipse class="o" fill="${col.f}" cx="${cx}" cy="${cy}" rx="38" ry="19"/><ellipse fill="${col.face}" cx="${cx}" cy="${cy}" rx="32" ry="13"/>`);
}
out.eoseut = svg(
  log(36, 164, 140, 24, GREEN) + line(76, 110, 44, 170) + line(108, 110, 76, 170) + line(140, 110, 108, 170) + ARROW +
    oval(275, 105, GREEN, -28) + oval(335, 150, GREEN, -28) + oval(275, 195, GREEN, -28),
  '칼을 비스듬히 눕혀서', '길쭉한 타원'
);

// 송송썰기
function ring(cx, cy) {
  return `<circle class="o" fill="${ONION.f}" cx="${cx}" cy="${cy}" r="12"/><circle class="o" fill="${ONION.face}" cx="${cx}" cy="${cy}" r="5" stroke-width="2"/>`;
}
out.songsong = svg(
  log(34, 166, 140, 15, ONION) + [52, 66, 80, 94, 108, 122, 136, 150].map((x) => arcCut(x, 140, 15)).join('') + ARROW +
    [[250, 100], [285, 92], [322, 104], [352, 128], [262, 136], [300, 130], [330, 162], [248, 172], [284, 168], [312, 196], [270, 204]]
      .map(([x, y]) => ring(x, y)).join(''),
  '가늘게 촘촘히', '작은 동그라미'
);

// 채썰기
function stick(cx, cy, deg, col) {
  return rot(deg, cx, cy, `<rect class="o" fill="${col}" x="${cx - 3.5}" y="${cy - 42}" width="7" height="84" rx="2" stroke-width="2.5"/>`);
}
out.chae = svg(
  `<rect class="o" fill="${RADISH.side}" x="34" y="112" width="124" height="72" rx="4"/>` +
    `<rect class="o" fill="${RADISH.f}" x="40" y="104" width="124" height="72" rx="4"/>` +
    `<rect class="o" fill="${RADISH.top}" x="46" y="96" width="124" height="72" rx="4"/>` +
    [60, 73, 86, 99, 112, 125, 138, 151].map((x) => line(x, 88, x, 176)).join('') + ARROW +
    [[240, -3], [257, 2], [274, -2], [291, 3], [308, -3], [325, 2], [342, -2], [359, 3]].map(([x, d]) => stick(x, 140, d, RADISH.top)).join(''),
  '얇게 썰어 겹친 뒤 가늘게', '가는 채'
);

// 깍둑썰기
out.kkakduk = svg(
  box(40, 110, 96, 96, 40, RADISH) +
    line(72, 110, 72, 206) + line(104, 110, 104, 206) + line(40, 142, 136, 142) + line(40, 174, 136, 174) +
    line(72, 110, 112, 86) + line(104, 110, 144, 86) + line(53, 102, 149, 102) + line(67, 94, 163, 94) + ARROW +
    box(238, 96, 38, 38, 16, RADISH) + box(312, 124, 38, 38, 16, RADISH) + box(250, 176, 38, 38, 16, RADISH),
  '막대로 썬 뒤 같은 길이로', '주사위 모양'
);

// 나박썰기
out.nabak = svg(
  box(36, 122, 112, 52, 30, RADISH) + [56, 72, 88, 104, 120, 136].map((x) => line(x, 174, x, 122) + line(x, 122, x + 30, 104)).join('') + ARROW +
    box(234, 110, 46, 6, 40, RADISH) + box(300, 150, 46, 6, 40, RADISH) + box(240, 200, 46, 6, 40, RADISH),
  '네모 기둥을 얇게', '얇은 정사각형'
);

// 골패썰기
out.golpae = svg(
  box(30, 132, 100, 34, 40, CARROT_BOX) + [46, 62, 78, 94, 110].map((x) => line(x, 166, x, 132) + line(x, 132, x + 40, 108)).join('') + ARROW +
    box(232, 112, 70, 6, 28, CARROT_BOX) + box(290, 158, 70, 6, 28, CARROT_BOX) + box(236, 204, 70, 6, 28, CARROT_BOX),
  '납작한 기둥을 얇게', '얇은 직사각형'
);

// 막대썰기
out.makdae = svg(
  box(28, 152, 100, 18, 48, RADISH) + [12, 24, 36].map((k) => line(28 + k, 152 - Math.round(k * 0.6), 128 + k, 152 - Math.round(k * 0.6))).join('') + ARROW +
    box(232, 108, 100, 15, 14, RADISH) + box(250, 152, 100, 15, 14, RADISH) + box(236, 196, 100, 15, 14, RADISH),
  '도톰한 판을 길게', '네모 막대'
);

// 편썰기
function clove(cx, cy, s, fill) {
  return `<path class="o" fill="${fill}" d="M${cx},${cy - 62 * s}C${cx + 52 * s},${cy - 44 * s} ${cx + 58 * s},${cy + 40 * s} ${cx},${cy + 62 * s}C${cx - 58 * s},${cy + 40 * s} ${cx - 52 * s},${cy - 44 * s} ${cx},${cy - 62 * s}Z"/>`;
}
out.pyeon = svg(
  rot(90, 100, 140, clove(100, 140, 1, '#f5ead0')) + [64, 82, 100, 118, 136].map((x) => line(x, 92, x, 188)).join('') + ARROW +
    rot(-12, 258, 112, clove(258, 112, 0.52, '#fbf4e2')) + rot(10, 330, 132, clove(330, 132, 0.52, '#fbf4e2')) +
    rot(4, 268, 190, clove(268, 190, 0.52, '#fbf4e2')) + rot(-8, 338, 204, clove(338, 204, 0.46, '#fbf4e2')),
  '모양대로 얇게 저미기', '얇은 조각'
);

// 다지기
let seed = 7;
function rnd() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}
let bits = '';
for (let i = 0; i < 70; i++) {
  const a = rnd() * Math.PI * 2;
  const r = Math.sqrt(rnd());
  const x = Math.round(305 + Math.cos(a) * r * 68);
  const y = Math.round(150 + Math.sin(a) * r * 50);
  bits += rot(Math.round(rnd() * 80), x, y, `<rect class="o" fill="#f5ead0" x="${x - 4}" y="${y - 4}" width="8" height="8" stroke-width="2"/>`);
}
out.dajigi = svg(
  [108, 122, 136, 150, 164].map((y) => `<rect class="o" fill="#f5ead0" x="36" y="${y}" width="128" height="9" rx="2" stroke-width="2.5"/>`).join('') +
    [52, 66, 80, 94, 108, 122, 136, 150].map((x) => line(x, 98, x, 182)).join('') + ARROW + bits,
  '채 썬 것을 다시 잘게', '아주 작은 조각'
);

// 돌려깎기
out.dollyeo = svg(
  log(52, 148, 158, 34, GREEN) +
    `<path class="o" fill="${GREEN.f}" d="M52,124L148,124L176,82L80,82Z"/>` +
    `<path class="o" fill="${GREEN.face}" d="M80,82L176,82L170,72L74,72Z"/>` +
    line(52, 124, 148, 124) + ARROW +
    `<rect class="o" fill="${GREEN.f}" x="236" y="92" width="130" height="50" rx="3"/>` +
    `<path d="M300,152v16m-7,-7l7,8l7,-8" fill="none" stroke="#b9a994" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    [244, 258, 272, 286, 300, 314, 328, 342, 356].map((x) => `<rect class="o" fill="${GREEN.f}" x="${x}" y="180" width="6" height="52" rx="2" stroke-width="2.5"/>`).join(''),
  '껍질 쪽을 얇게 돌려 깎기', '펼친 뒤 채썰기'
);

// 깎아썰기
function shaving(cx, cy, deg) {
  return rot(deg, cx, cy, `<path class="o" fill="#e9d3a6" d="M${cx - 34},${cy}Q${cx},${cy - 20} ${cx + 34},${cy}Q${cx},${cy + 9} ${cx - 34},${cy}Z"/>`);
}
out.kkakka = svg(
  `<path class="o" fill="#c9a36a" d="M30,118L118,118L176,140L118,162L30,162A9,22 0 0 1 30,118Z"/>` +
    `<path class="o" fill="#e9d3a6" d="M118,118L176,140L118,162A9,22 0 0 0 118,118Z"/>` +
    line(112, 108, 178, 132) + ARROW +
    shaving(268, 104, -15) + shaving(334, 128, 10) + shaving(262, 160, 8) + shaving(330, 186, -12) + shaving(274, 212, -4),
  '연필 깎듯 돌려가며', '얇고 뾰족한 조각'
);

// 마구썰기
function chunk(x, y, deg) {
  return rot(deg, x + 30, y + 18,
    `<polygon class="o" fill="${CARROT.f}" points="${x},${y + 6} ${x + 44},${y - 6} ${x + 62},${y + 26} ${x + 16},${y + 40}"/>` +
    `<polygon class="o" fill="${CARROT.face}" points="${x + 44},${y - 6} ${x + 62},${y + 26} ${x + 16},${y + 40}"/>`);
}
out.magu = svg(
  log(36, 164, 140, 26, CARROT) + line(60, 110, 86, 170) + line(112, 110, 86, 170) + line(112, 110, 138, 170) + ARROW +
    chunk(236, 90, -6) + chunk(308, 126, 14) + chunk(244, 178, 8),
  '돌려가며 어슷하게', '세모난 덩어리'
);

// 모서리 다듬기
out.moseori = svg(
  box(46, 110, 84, 74, 30, RADISH) +
    `<path d="M46,110L130,110M130,110L130,184M46,110L46,184M46,184L130,184M130,110L160,92" fill="none" stroke="#d9622b" stroke-width="5" stroke-linecap="round" opacity="0.75"/>` + ARROW +
    `<rect class="o" fill="${RADISH.side}" x="262" y="92" width="92" height="84" rx="28"/>` +
    `<rect class="o" fill="${RADISH.f}" x="242" y="106" width="92" height="84" rx="28"/>`,
  '각진 모서리를 얇게 깎기', '둥글어진 조각'
);

// 칼 잡는 법
out.grip = svg(
  `<path class="o" fill="#e3e7ea" d="M150,96L300,104Q352,116 372,168Q300,180 150,176Z"/>` +
    `<rect class="o" fill="#7a553b" x="26" y="100" width="128" height="40" rx="14"/>` +
    `<circle cx="172" cy="128" r="17" fill="#d9622b" opacity="0.85"/>` +
    `<circle cx="60" cy="120" r="13" fill="#f2c9a0" class="o"/><circle cx="92" cy="120" r="13" fill="#f2c9a0" class="o"/><circle cx="124" cy="120" r="13" fill="#f2c9a0" class="o"/>` +
    `<path d="M172,150V200" stroke="#d9622b" stroke-width="2.5" fill="none"/>` +
    `<text class="n" x="200" y="222" text-anchor="middle">엄지와 검지로 칼날 뿌리를 양옆에서 집어요</text>` +
    `<path d="M92,96V62" stroke="${O}" stroke-width="2.5" fill="none"/>` +
    `<text class="n" x="30" y="52">나머지 세 손가락은 손잡이를 감싸요</text>`,
  '', ''
);

// 고양이 손
out.catpaw = svg(
  `<rect class="o" fill="${CARROT.f}" x="60" y="196" width="280" height="44" rx="8"/>` +
    `<rect class="o" fill="#e3e7ea" x="258" y="60" width="12" height="136"/>` +
    `<polyline points="70,84 236,120 216,174" fill="none" stroke="${O}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<polyline points="70,84 236,120 216,174" fill="none" stroke="#f2c9a0" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="246" cy="122" r="7" fill="#d9622b"/>` +
    `<text class="n" x="282" y="100">둘째 마디가</text><text class="n" x="282" y="120">칼 옆면에 닿아요</text>` +
    `<text class="n" x="60" y="172">손끝은 안쪽으로</text>` +
    `<text class="t" x="200" y="278">옆에서 본 모습</text>`,
  '', ''
);

await Deno.mkdir('img/knife', { recursive: true });
for (const [name, content] of Object.entries(out)) {
  await Deno.writeTextFile(`img/knife/${name}.svg`, content);
}

// 한눈에 확인하는 미리보기 (배포에는 쓰지 않음)
const preview =
  '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#fdf8f0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font:14px sans-serif">' +
  Object.keys(out).map((n) => `<div style="border:1px solid #ddd"><img src="${n}.svg" style="width:100%;display:block"><div style="text-align:center">${n}</div></div>`).join('') +
  '</body>';
await Deno.writeTextFile('img/knife/_preview.html', preview);
console.log('wrote', Object.keys(out).length, 'svgs');
