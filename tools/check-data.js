// 데이터 파일이 문법 오류 없이 읽히는지, 필수 항목이 있는지 확인한다.
// 실행: deno run --allow-read tools/check-data.js  (프로젝트 폴더에서)

const groups = [];
const basics = [];
const cuts = [];
const tips = [];
const recipes = [];
const problems = [];

globalThis.seasoningGroup = (g) => groups.push(g);
const ingredientGroups = [];
globalThis.ingredientGroup = (g) => {
  ingredientGroups.push(g);
  for (const i of g.items || []) {
    if (!i.name || !(i.good && i.good.length)) problems.push(`재료 ${g.id} / ${i.name}: good 없음`);
  }
  console.log(`재료 ${g.id.padEnd(10)} ${String((g.items || []).length).padStart(2)}개  ${g.emoji} ${g.title}`);
};
globalThis.knifeBasic = (b) => basics.push(b);
globalThis.knifeCut = (c) => cuts.push(c);
globalThis.tipGroup = (g) => tips.push(g);
globalThis.pageSources = () => {};
globalThis.recipe = (r) => recipes.push(r);

async function load(path) {
  try {
    (0, eval)(await Deno.readTextFile(path));
  } catch (e) {
    problems.push(`${path}: ${e.message}`);
  }
}

for await (const f of Deno.readDir('data')) if (f.name.endsWith('.js')) await load('data/' + f.name);
for await (const f of Deno.readDir('recipes')) if (f.name.endsWith('.js') && f.name !== 'index.js') await load('recipes/' + f.name);

const ids = new Set();
for (const g of groups) {
  if (ids.has(g.id)) problems.push(`양념 그룹 id 중복: ${g.id}`);
  ids.add(g.id);
  for (const i of g.items || []) {
    for (const key of ['name', 'taste', 'uses', 'why', 'vs']) {
      if (!i[key] || !i[key].length) problems.push(`${g.id} / ${i.name}: ${key} 없음`);
    }
  }
  console.log(`${g.id.padEnd(10)} ${String((g.items || []).length).padStart(2)}개  ${g.emoji} ${g.title}`);
}

for (const c of cuts) {
  if (c.image) {
    try { await Deno.stat(c.image); } catch { problems.push(`그림 없음: ${c.image}`); }
  }
}
for (const b of basics) {
  if (b.image) {
    try { await Deno.stat(b.image); } catch { problems.push(`그림 없음: ${b.image}`); }
  }
}

const total = groups.reduce((n, g) => n + (g.items || []).length, 0);
console.log(`양념 ${groups.length}개 그룹 ${total}개 항목, 칼질 기본 ${basics.length}개, 썰기 ${cuts.length}개, 팁 그룹 ${tips.length}개, 레시피 ${recipes.length}개`);
console.log(problems.length ? '문제:\n' + problems.join('\n') : '문제 없음');
