// yt-dlp가 받은 json3 자막을 시간 표시가 붙은 텍스트로 바꾼다.
// 실행: deno run --allow-read --allow-write tools/subs-to-text.js <자막.json3> <출력.txt>

const [input, output] = Deno.args;
const data = JSON.parse(await Deno.readTextFile(input));

const lines = [];
let buf = '';
let bufStart = 0;
for (const ev of data.events || []) {
  if (!ev.segs) continue;
  const text = ev.segs.map((s) => s.utf8 || '').join('').replace(/\s+/g, ' ').trim();
  if (!text) continue;
  if (!buf) bufStart = ev.tStartMs;
  buf += (buf ? ' ' : '') + text;
  // 20초쯤마다 한 줄로 묶는다
  if (ev.tStartMs - bufStart >= 20000) {
    lines.push(stamp(bufStart) + ' ' + buf);
    buf = '';
  }
}
if (buf) lines.push(stamp(bufStart) + ' ' + buf);

function stamp(ms) {
  const s = Math.floor(ms / 1000);
  return `[${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}]`;
}

await Deno.writeTextFile(output, lines.join('\n') + '\n');
console.log(lines.length, 'lines');
