(function () {
  'use strict';

  const app = document.getElementById('app');
  const recipes = [];
  const seasonings = [];
  const knifeBasics = [];
  const knifeCuts = [];
  const tipGroups = [];
  const listState = { query: '', tag: '' };
  const seasoningState = { query: '' };
  let wakeLock = null;

  // 데이터 파일(recipes/*.js, data/*.js)이 이 함수들을 호출해 자신을 등록한다
  window.recipe = (r) => recipes.push(r);
  window.seasoningGroup = (g) => seasonings.push(g);
  const ingredientGroups = [];
  const ingredientState = { query: '' };
  window.ingredientGroup = (g) => ingredientGroups.push(g);
  window.knifeBasic = (b) => knifeBasics.push(b);
  window.knifeCut = (c) => knifeCuts.push(c);
  window.tipGroup = (g) => tipGroups.push(g);
  const productGroups = [];
  window.productGroup = (g) => productGroups.push(g);
  const sourcesByTab = {};
  window.pageSources = (tab, list) => { sourcesByTab[tab] = list; };

  // ---------- 유틸 ----------

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // **굵게**, ==형광펜==, 줄바꿈 지원
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/==(.+?)==/g, '<mark>$1</mark>')
      .replace(/\n/g, '<br>');
  }

  function youtubeId(url) {
    const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/)([\w-]{11})/.exec(url || '');
    return m ? m[1] : null;
  }

  function imageOf(r) {
    if (r.image) return r.image;
    const id = r.source && youtubeId(r.source.url);
    return id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : null;
  }

  function clock(sec) {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return m + ':' + s;
  }

  function isDraft(r) {
    return r.status === 'draft' || !(r.steps && r.steps.length);
  }

  function loadChecks(id) {
    try { return JSON.parse(localStorage.getItem('chk:' + id)) || {}; } catch (e) { return {}; }
  }

  function saveChecks(id, checks) {
    try { localStorage.setItem('chk:' + id, JSON.stringify(checks)); } catch (e) { /* 저장 불가 시 무시 */ }
  }

  function calloutHtml(kind, text) {
    return (
      '<div class="callout' + (kind === 'warn' ? ' warn' : '') + '">' +
        '<span class="callout-icon">' + (kind === 'warn' ? '⚠️' : '💡') + '</span>' +
        '<div>' + fmt(text) + '</div>' +
      '</div>'
    );
  }

  function sourcesHtml(sources) {
    if (!sources || !sources.length) return '';
    return (
      '<details class="sources"><summary>참고한 자료 ' + sources.length + '곳</summary><ul>' +
        sources
          .map((s) => '<li><a target="_blank" rel="noopener" href="' + esc(s.url) + '">' + esc(s.title || s.url) + '</a></li>')
          .join('') +
      '</ul></details>'
    );
  }

  function listHtml(items) {
    return '<ul class="plain">' + items.map((t) => '<li>' + fmt(t) + '</li>').join('') + '</ul>';
  }

  // ---------- 레시피 목록 ----------

  function matches(r) {
    if (listState.tag && !(r.tags || []).includes(listState.tag)) return false;
    const q = listState.query.trim().toLowerCase();
    if (!q) return true;
    const hay = [r.title, r.description, (r.tags || []).join(' ')]
      .concat((r.ingredients || []).flatMap((g) => (g.items || []).map((i) => i.name)))
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  function cardHtml(r) {
    const img = imageOf(r);
    const meta = [r.time, r.servings].filter(Boolean).join(' · ');
    return (
      '<a class="card" href="#/r/' + encodeURIComponent(r.id) + '">' +
        '<div class="card-img">' +
          (isDraft(r) ? '<span class="badge">미완성</span>' : '') +
          (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '🍳') +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-title">' + esc(r.title) + '</div>' +
          (meta ? '<div class="card-meta">' + esc(meta) + '</div>' : '') +
        '</div>' +
      '</a>'
    );
  }

  function renderGrid() {
    const found = recipes.filter(matches);
    document.getElementById('grid').innerHTML = found.length
      ? found.map(cardHtml).join('')
      : '<div class="empty" style="grid-column:1/-1">해당하는 레시피가 없어요</div>';
  }

  function renderList() {
    const tags = Array.from(new Set(recipes.flatMap((r) => r.tags || [])));
    app.innerHTML =
      '<div class="list-head"><h1>내 레시피</h1><span>' + recipes.length + '개</span></div>' +
      '<input class="search" id="search" type="search" placeholder="요리나 재료로 검색" value="' + esc(listState.query) + '">' +
      (tags.length
        ? '<div class="chips" id="chips">' +
          ['']
            .concat(tags)
            .map((t) => '<button class="chip' + (t === listState.tag ? ' on' : '') + '" data-tag="' + esc(t) + '">' + esc(t || '전체') + '</button>')
            .join('') +
          '</div>'
        : '') +
      '<div class="grid" id="grid"></div>';

    renderGrid();

    document.getElementById('search').addEventListener('input', (e) => {
      listState.query = e.target.value;
      renderGrid();
    });

    const chips = document.getElementById('chips');
    if (chips) {
      chips.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        listState.tag = btn.dataset.tag;
        chips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === btn));
        renderGrid();
      });
    }
  }

  // ---------- 레시피 ----------

  function ingredientsHtml(r, checks) {
    let n = 0;
    return (r.ingredients || [])
      .map((g) =>
        (g.group ? '<div class="ing-group">' + esc(g.group) + '</div>' : '') +
        (g.items || [])
          .map((i) => {
            const key = n++;
            return (
              '<label class="ing">' +
                '<input type="checkbox" data-key="' + key + '"' + (checks[key] ? ' checked' : '') + '>' +
                '<span class="ing-name">' + esc(i.name) +
                  (i.note ? '<span class="ing-note">' + esc(i.note) + '</span>' : '') +
                '</span>' +
                (i.amount ? '<span class="ing-amount">' + esc(i.amount) + '</span>' : '') +
              '</label>' +
              (i.tip ? '<div class="ing-tip">💡 ' + fmt(i.tip) + '</div>' : '')
            );
          })
          .join('')
      )
      .join('');
  }

  function stepsHtml(r) {
    const vid = r.source && youtubeId(r.source.url);
    return (r.steps || [])
      .map((s, idx) =>
        '<div class="step">' +
          '<div class="step-head">' +
            '<span class="step-num">' + (idx + 1) + '</span>' +
            (vid && s.timestamp != null
              ? '<a class="step-time" target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=' + vid + '&t=' + s.timestamp + 's">▶ ' + clock(s.timestamp) + '</a>'
              : '') +
          '</div>' +
          '<p>' + fmt(s.text) + '</p>' +
          (s.image ? '<img src="' + esc(s.image) + '" alt="" loading="lazy">' : '') +
          (s.tip ? calloutHtml('tip', s.tip) : '') +
          (s.warning ? calloutHtml('warn', s.warning) : '') +
        '</div>'
      )
      .join('');
  }

  // 원본(source)과 참고한 레시피(links)를 맨 아래에 모아 보여준다
  function linksHtml(r) {
    const links = [];
    if (r.source && r.source.url) links.push({ kind: '원본', title: r.source.title || r.source.label || r.source.url, url: r.source.url });
    (r.links || []).forEach((l) => links.push({ kind: '참고', title: l.title || l.url, url: l.url }));
    if (!links.length) return '';
    return (
      '<section><div class="sec-head"><h2>링크</h2></div><div class="links">' +
      links
        .map((l) =>
          '<a class="link-row" target="_blank" rel="noopener" href="' + esc(l.url) + '">' +
            '<span class="link-kind' + (l.kind === '원본' ? ' origin' : '') + '">' + l.kind + '</span>' +
            '<span class="link-title">' + esc(l.title) + '</span>' +
            '<span class="link-arrow">↗</span>' +
          '</a>'
        )
        .join('') +
      '</div></section>'
    );
  }

  function renderRecipe(r) {
    const img = imageOf(r);
    const checks = loadChecks(r.id);
    const meta = [r.servings, r.time].concat(r.tags || []).filter(Boolean);
    const hasIngredients = (r.ingredients || []).some((g) => (g.items || []).length);
    const hasSteps = r.steps && r.steps.length;

    app.innerHTML =
      '<article class="recipe">' +
        '<div class="topbar">' +
          '<a class="btn" href="#/">← 목록</a>' +
          ('wakeLock' in navigator ? '<button class="btn" id="wake">화면 켜두기</button>' : '') +
        '</div>' +
        (img ? '<img class="hero" src="' + esc(img) + '" alt="">' : '') +
        '<h1>' + esc(r.title) + '</h1>' +
        (r.description ? '<p class="desc">' + fmt(r.description) + '</p>' : '') +
        (meta.length ? '<div class="meta">' + meta.map((m) => '<span>' + esc(m) + '</span>').join('') + '</div>' : '') +
        (r.source && r.source.url
          ? '<a class="btn primary" target="_blank" rel="noopener" href="' + esc(r.source.url) + '">▶ ' + esc(r.source.label || '원본 영상 보기') + '</a>'
          : '') +
        (isDraft(r) ? '<div class="draft-note">아직 미완성인 레시피예요. 조리 순서가 정리되면 채워집니다.</div>' : '') +
        (hasIngredients
          ? '<section><div class="sec-head"><h2>재료</h2><button class="link-btn" id="reset">체크 초기화</button></div>' +
            '<div id="ings">' + ingredientsHtml(r, checks) + '</div></section>'
          : '') +
        (hasSteps ? '<section><div class="sec-head"><h2>만드는 법</h2></div>' + stepsHtml(r) + '</section>' : '') +
        (r.tips && r.tips.length
          ? '<section><div class="sec-head"><h2>팁</h2></div>' + r.tips.map((t) => calloutHtml('tip', t)).join('') + '</section>'
          : '') +
        (r.notes ? '<section><div class="sec-head"><h2>메모</h2></div><div class="notes">' + fmt(r.notes) + '</div></section>' : '') +
        linksHtml(r) +
      '</article>';

    const ings = document.getElementById('ings');
    if (ings) {
      ings.addEventListener('change', (e) => {
        if (!e.target.matches('input[type=checkbox]')) return;
        checks[e.target.dataset.key] = e.target.checked;
        saveChecks(r.id, checks);
      });
      document.getElementById('reset').addEventListener('click', () => {
        Object.keys(checks).forEach((k) => delete checks[k]);
        saveChecks(r.id, checks);
        ings.querySelectorAll('input').forEach((c) => { c.checked = false; });
      });
    }

    const wake = document.getElementById('wake');
    if (wake) wake.addEventListener('click', () => toggleWake(wake));
  }

  async function toggleWake(btn) {
    try {
      if (wakeLock) {
        await wakeLock.release();
        wakeLock = null;
      } else {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          wakeLock = null;
          btn.classList.remove('on');
        });
      }
    } catch (e) {
      wakeLock = null;
    }
    btn.classList.toggle('on', !!wakeLock);
  }

  // ---------- 양념 사전 ----------

  function itemBlock(label, html) {
    return '<div class="item-block"><div class="item-label">' + label + '</div><div>' + html + '</div></div>';
  }

  function seasoningItemHtml(item, open, groupLabel) {
    return (
      '<details class="item"' + (open ? ' open' : '') + '>' +
        '<summary>' +
          '<div class="item-name">' + esc(item.name) +
            (groupLabel ? '<span class="item-group">' + esc(groupLabel) + '</span>' : '') +
          '</div>' +
          (item.aka ? '<div class="item-aka">' + esc(item.aka) + '</div>' : '') +
          (item.summary ? '<div class="item-summary">' + fmt(item.summary) + '</div>' : '') +
        '</summary>' +
        '<div class="item-body">' +
          (item.taste ? itemBlock('👅 넣으면 이런 맛', fmt(item.taste)) : '') +
          (item.uses && item.uses.length ? itemBlock('🍳 이럴 때 써요', listHtml(item.uses)) : '') +
          (item.why ? itemBlock('🤔 왜 이걸 쓸까', fmt(item.why)) : '') +
          (item.vs ? itemBlock('⚖️ 비슷한 것과 차이', fmt(item.vs)) : '') +
          (item.tips || []).map((t) => calloutHtml('tip', t)).join('') +
          (item.caution ? calloutHtml('warn', item.caution) : '') +
          (item.storage ? itemBlock('📦 보관', fmt(item.storage)) : '') +
        '</div>' +
      '</details>'
    );
  }

  function seasoningResultsHtml() {
    const q = seasoningState.query.trim().toLowerCase();
    if (!q) {
      return (
        '<div class="group-list">' +
        seasonings
          .map((g) =>
            '<a class="group-card" href="#/s/' + encodeURIComponent(g.id) + '">' +
              '<span class="group-emoji">' + esc(g.emoji || '🧂') + '</span>' +
              '<span class="group-text">' +
                '<span class="group-title">' + esc(g.title) + '<span class="group-count">' + (g.items || []).length + '</span></span>' +
                '<span class="group-names">' + esc((g.items || []).map((i) => i.name).join(' · ')) + '</span>' +
              '</span>' +
            '</a>'
          )
          .join('') +
        '</div>'
      );
    }
    const found = [];
    seasonings.forEach((g) =>
      (g.items || []).forEach((i) => {
        const hay = [i.name, i.aka, i.summary].join(' ').toLowerCase();
        if (hay.includes(q)) found.push(seasoningItemHtml(i, false, g.title));
      })
    );
    return found.length ? found.join('') : '<div class="empty">찾는 양념이 없어요</div>';
  }

  function renderSeasonings() {
    const total = seasonings.reduce((n, g) => n + (g.items || []).length, 0);
    app.innerHTML =
      '<div class="list-head"><h1>양념 사전</h1><span>' + total + '가지</span></div>' +
      '<p class="page-intro">왜 넣는지 알면 맛을 고칠 수 있어요. 종류별로 맛, 쓰임새, 차이를 정리했어요.</p>' +
      '<input class="search" id="s-search" type="search" placeholder="양념 이름으로 검색 (예: 국간장)" value="' + esc(seasoningState.query) + '">' +
      '<div id="s-results" class="results">' + seasoningResultsHtml() + '</div>';

    document.getElementById('s-search').addEventListener('input', (e) => {
      seasoningState.query = e.target.value;
      document.getElementById('s-results').innerHTML = seasoningResultsHtml();
    });
  }

  function renderSeasoningGroup(g) {
    app.innerHTML =
      '<article class="doc">' +
        '<div class="topbar"><a class="btn" href="#/s">← 양념 사전</a></div>' +
        '<h1>' + esc(g.emoji || '') + ' ' + esc(g.title) + '</h1>' +
        (g.intro ? '<p class="lead">' + fmt(g.intro) + '</p>' : '') +
        (g.pick && g.pick.length
          ? '<section><div class="sec-head"><h2>상황별로 고르기</h2></div><div class="pick">' +
            g.pick
              .map((p) =>
                '<div class="pick-row">' +
                  '<div class="pick-when">' + fmt(p.when) + '</div>' +
                  '<div class="pick-use">→ ' + fmt(p.use) + '</div>' +
                  (p.why ? '<div class="pick-why">' + fmt(p.why) + '</div>' : '') +
                '</div>'
              )
              .join('') +
            '</div></section>'
          : '') +
        '<section><div class="sec-head"><h2>종류별로 알아보기</h2></div>' +
          (g.items || []).map((i) => seasoningItemHtml(i, false)).join('') +
        '</section>' +
        sourcesHtml(g.sources) +
      '</article>';
  }

  // ---------- 재료 고르기 ----------

  function ingredientItemHtml(item, groupLabel) {
    return (
      '<details class="item">' +
        '<summary>' +
          '<div class="item-name">' + esc(item.name) +
            (groupLabel ? '<span class="item-group">' + esc(groupLabel) + '</span>' : '') +
          '</div>' +
          (item.summary ? '<div class="item-summary">' + fmt(item.summary) + '</div>' : '') +
        '</summary>' +
        '<div class="item-body">' +
          (item.mom ? '<div class="tip-why"><span>엄마</span> ' + fmt(item.mom) + '</div>' : '') +
          (item.good && item.good.length ? itemBlock('👍 이런 걸 골라요', listHtml(item.good)) : '') +
          (item.bad && item.bad.length ? itemBlock('👎 이런 건 피해요', listHtml(item.bad)) : '') +
          (item.why ? itemBlock('🤔 왜 그럴까', fmt(item.why)) : '') +
          (item.uses ? itemBlock('🍳 어디에 쓸까', fmt(item.uses)) : '') +
          (item.season ? itemBlock('📅 제철', fmt(item.season)) : '') +
          (item.storage ? itemBlock('📦 보관', fmt(item.storage)) : '') +
          (item.tips || []).map((t) => calloutHtml('tip', t)).join('') +
          (item.caution ? calloutHtml('warn', item.caution) : '') +
        '</div>' +
      '</details>'
    );
  }

  function ingredientResultsHtml() {
    const q = ingredientState.query.trim().toLowerCase();
    if (!q) {
      return (
        '<div class="group-list">' +
        ingredientGroups
          .map((g) =>
            '<a class="group-card" href="#/i/' + encodeURIComponent(g.id) + '">' +
              '<span class="group-emoji">' + esc(g.emoji || '🛒') + '</span>' +
              '<span class="group-text">' +
                '<span class="group-title">' + esc(g.title) + '<span class="group-count">' + (g.items || []).length + '</span></span>' +
                '<span class="group-names">' + esc((g.items || []).map((i) => i.name).join(' · ')) + '</span>' +
              '</span>' +
            '</a>'
          )
          .join('') +
        '</div>'
      );
    }
    const found = [];
    ingredientGroups.forEach((g) =>
      (g.items || []).forEach((i) => {
        if ([i.name, i.summary].join(' ').toLowerCase().includes(q)) found.push(ingredientItemHtml(i, g.title));
      })
    );
    return found.length ? found.join('') : '<div class="empty">찾는 재료가 없어요</div>';
  }

  function renderIngredients() {
    const total = ingredientGroups.reduce((n, g) => n + (g.items || []).length, 0);
    app.innerHTML =
      '<div class="list-head"><h1>재료 고르기</h1><span>' + total + '가지</span></div>' +
      '<p class="page-intro">장 볼 때 무엇을 보고 골라야 하는지, 사 온 뒤 어떻게 보관하는지 정리했어요.</p>' +
      '<input class="search" id="i-search" type="search" placeholder="재료 이름으로 검색 (예: 양파)" value="' + esc(ingredientState.query) + '">' +
      '<div id="i-results" class="results">' + ingredientResultsHtml() + '</div>';

    document.getElementById('i-search').addEventListener('input', (e) => {
      ingredientState.query = e.target.value;
      document.getElementById('i-results').innerHTML = ingredientResultsHtml();
    });
  }

  function renderIngredientGroup(g) {
    app.innerHTML =
      '<article class="doc">' +
        '<div class="topbar"><a class="btn" href="#/i">← 재료 고르기</a></div>' +
        '<h1>' + esc(g.emoji || '') + ' ' + esc(g.title) + '</h1>' +
        (g.intro ? '<p class="lead">' + fmt(g.intro) + '</p>' : '') +
        '<section>' + (g.items || []).map((i) => ingredientItemHtml(i)).join('') + '</section>' +
        sourcesHtml(g.sources) +
      '</article>';
  }

  // ---------- 칼질 ----------

  function knifeBasicsHtml(group) {
    const list = knifeBasics.filter((b) => (b.group || '기본기') === group);
    if (!list.length) return '';
    return (
      '<section><div class="sec-head"><h2>' + esc(group) + '</h2></div>' +
      list
        .map((b) =>
          '<details class="item">' +
            '<summary><div class="item-name">' + esc(b.title) + '</div>' +
              (b.summary ? '<div class="item-summary">' + fmt(b.summary) + '</div>' : '') +
            '</summary>' +
            '<div class="item-body">' +
              (b.image ? '<img class="illust" src="' + esc(b.image) + '" alt="' + esc(b.title) + '">' : '') +
              (b.body ? '<p>' + fmt(b.body) + '</p>' : '') +
              (b.points && b.points.length ? '<div class="item-block">' + listHtml(b.points) + '</div>' : '') +
              (b.tip ? calloutHtml('tip', b.tip) : '') +
              (b.warning ? calloutHtml('warn', b.warning) : '') +
            '</div>' +
          '</details>'
        )
        .join('') +
      '</section>'
    );
  }

  function renderKnife() {
    const otherGroups = Array.from(new Set(knifeBasics.map((b) => b.group || '기본기'))).filter((g) => g !== '기본기');
    app.innerHTML =
      '<div class="list-head"><h1>칼질</h1><span>' + knifeCuts.length + '가지 썰기</span></div>' +
      '<p class="page-intro">모양이 다르면 익는 속도와 식감, 양념이 배는 정도가 달라져요.</p>' +
      knifeBasicsHtml('기본기') +
      '<section><div class="sec-head"><h2>썰기 종류</h2></div><div class="grid">' +
        knifeCuts
          .map((c) =>
            '<a class="card" href="#/k/' + encodeURIComponent(c.id) + '">' +
              '<div class="card-img illust-bg">' + (c.image ? '<img src="' + esc(c.image) + '" alt="" loading="lazy">' : '🔪') + '</div>' +
              '<div class="card-body">' +
                '<div class="card-title">' + esc(c.name) + '</div>' +
                (c.short ? '<div class="card-meta">' + esc(c.short) + '</div>' : '') +
              '</div>' +
            '</a>'
          )
          .join('') +
      '</div></section>' +
      otherGroups.map(knifeBasicsHtml).join('') +
      sourcesHtml(sourcesByTab.k);
  }

  function renderKnifeCut(c) {
    app.innerHTML =
      '<article class="doc">' +
        '<div class="topbar"><a class="btn" href="#/k">← 칼질</a></div>' +
        (c.image ? '<img class="illust" src="' + esc(c.image) + '" alt="' + esc(c.name) + '">' : '') +
        '<h1>' + esc(c.name) + '</h1>' +
        (c.aka ? '<div class="item-aka">' + esc(c.aka) + '</div>' : '') +
        (c.summary ? '<p class="lead">' + fmt(c.summary) + '</p>' : '') +
        (c.size ? '<div class="meta"><span>📏 ' + esc(c.size) + '</span></div>' : '') +
        (c.steps && c.steps.length
          ? '<section><div class="sec-head"><h2>써는 순서</h2></div>' +
            c.steps
              .map((s, i) => '<div class="step"><div class="step-head"><span class="step-num">' + (i + 1) + '</span></div><p>' + fmt(s) + '</p></div>')
              .join('') +
            '</section>'
          : '') +
        (c.uses && c.uses.length ? '<section><div class="sec-head"><h2>이럴 때 써요</h2></div>' + listHtml(c.uses) + '</section>' : '') +
        (c.why ? '<section><div class="sec-head"><h2>왜 이 모양일까</h2></div><p>' + fmt(c.why) + '</p></section>' : '') +
        (c.mistakes && c.mistakes.length
          ? '<section><div class="sec-head"><h2>흔한 실수</h2></div>' + c.mistakes.map((m) => calloutHtml('warn', m)).join('') + '</section>'
          : '') +
        (c.tips || []).map((t) => calloutHtml('tip', t)).join('') +
      '</article>';
  }

  // ---------- 팁 ----------

  function renderTips() {
    const total = tipGroups.reduce((n, g) => n + (g.items || []).length, 0);
    app.innerHTML =
      '<div class="list-head"><h1>요리 팁</h1><span>' + total + '개</span></div>' +
      (tipGroups.length
        ? tipGroups
            .map((g) =>
              '<section><div class="sec-head"><h2>' + esc(g.emoji || '') + ' ' + esc(g.title) + '</h2></div>' +
                (g.intro ? '<p class="page-intro">' + fmt(g.intro) + '</p>' : '') +
                (g.items || [])
                  .map((t) =>
                    '<div class="tip-card">' +
                      '<div class="tip-title">' + fmt(t.title) + '</div>' +
                      (t.body ? '<p>' + fmt(t.body) + '</p>' : '') +
                      (t.points && t.points.length ? listHtml(t.points) : '') +
                      (t.why ? '<div class="tip-why"><span>왜?</span> ' + fmt(t.why) + '</div>' : '') +
                      (t.warning ? calloutHtml('warn', t.warning) : '') +
                    '</div>'
                  )
                  .join('') +
              '</section>'
            )
            .join('') + sourcesHtml(sourcesByTab.t)
        : '<div class="empty">아직 팁이 없어요</div>');
  }

  // ---------- 엄마 추천 ----------

  function productHtml(p) {
    const meta = [p.where ? '🏪 ' + p.where : '', p.price ? '💰 ' + p.price : ''].filter(Boolean);
    return (
      '<div class="tip-card product">' +
        (p.image ? '<img class="product-img" src="' + esc(p.image) + '" alt="" loading="lazy">' : '') +
        '<div class="tip-title">' + esc(p.name) +
          (p.brand ? '<span class="item-group">' + esc(p.brand) + '</span>' : '') +
        '</div>' +
        (p.summary ? '<p>' + fmt(p.summary) + '</p>' : '') +
        (p.momSays ? '<div class="tip-why"><span>엄마</span> ' + fmt(p.momSays) + '</div>' : '') +
        (p.uses && p.uses.length ? itemBlock('🍳 이럴 때 써요', listHtml(p.uses)) : '') +
        (meta.length ? '<div class="meta">' + meta.map((m) => '<span>' + esc(m) + '</span>').join('') + '</div>' : '') +
        (p.tip ? calloutHtml('tip', p.tip) : '') +
        (p.link && p.link.url
          ? '<div class="links"><a class="link-row"' + (p.link.url.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener"') + ' href="' + esc(p.link.url) + '">' +
              '<span class="link-title">' + esc(p.link.title || p.link.url) + '</span>' +
              '<span class="link-arrow">↗</span>' +
            '</a></div>'
          : '') +
      '</div>'
    );
  }

  function renderProducts() {
    const total = productGroups.reduce((n, g) => n + (g.items || []).length, 0);
    app.innerHTML =
      '<div class="list-head"><h1>엄마 추천</h1><span>' + total + '개</span></div>' +
      '<p class="page-intro">엄마가 써 보고 추천해 준 제품을 모아 둬요.</p>' +
      (total
        ? productGroups
            .filter((g) => (g.items || []).length)
            .map((g) =>
              '<section><div class="sec-head"><h2>' + esc(g.emoji || '') + ' ' + esc(g.title) + '</h2></div>' +
                (g.intro ? '<p class="page-intro">' + fmt(g.intro) + '</p>' : '') +
                g.items.map(productHtml).join('') +
              '</section>'
            )
            .join('')
        : '<div class="empty">아직 추천 제품이 없어요</div>');
  }

  // ---------- 라우팅 ----------

  function setTab(name) {
    document.querySelectorAll('#tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === name));
  }

  function route() {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
    const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
    let title = '내 레시피';
    let scrollTop = true;

    if (parts[0] === 's') {
      setTab('s');
      const g = seasonings.find((x) => x.id === parts[1]);
      if (g) { renderSeasoningGroup(g); title = g.title; } else { renderSeasonings(); title = '양념 사전'; scrollTop = false; }
    } else if (parts[0] === 'i') {
      setTab('i');
      const g = ingredientGroups.find((x) => x.id === parts[1]);
      if (g) { renderIngredientGroup(g); title = g.title; } else { renderIngredients(); title = '재료 고르기'; scrollTop = false; }
    } else if (parts[0] === 'k') {
      setTab('k');
      const c = knifeCuts.find((x) => x.id === parts[1]);
      if (c) { renderKnifeCut(c); title = c.name; } else { renderKnife(); title = '칼질'; scrollTop = false; }
    } else if (parts[0] === 't') {
      setTab('t');
      renderTips();
      title = '요리 팁';
    } else if (parts[0] === 'p') {
      setTab('p');
      renderProducts();
      title = '엄마 추천';
    } else {
      setTab('r');
      const r = parts[0] === 'r' && recipes.find((x) => x.id === parts[1]);
      if (r) { renderRecipe(r); title = r.title; } else { renderList(); scrollTop = false; }
    }

    document.title = title === '내 레시피' ? title : title + ' · 내 레시피';
    if (scrollTop) window.scrollTo(0, 0);
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  // data/*.js는 index.html에 적힌 순서대로 이미 실행된 뒤다
  document.addEventListener('DOMContentLoaded', () => {
    const files = window.RECIPE_FILES || [];
    Promise.all(files.map((f) => loadScript('recipes/' + f + '.js'))).then(() => {
      // 로딩 순서와 무관하게 index.js에 적힌 순서로 정렬
      recipes.sort((a, b) => files.indexOf(a.id) - files.indexOf(b.id));
      window.addEventListener('hashchange', route);
      route();
    });
  });
})();
