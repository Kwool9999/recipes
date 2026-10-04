(function () {
  'use strict';

  const app = document.getElementById('app');
  const recipes = [];
  const listState = { query: '', tag: '' };
  let wakeLock = null;

  // 레시피 파일(recipes/*.js)이 이 함수를 호출해 자신을 등록한다
  window.recipe = (r) => recipes.push(r);

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

  // ---------- 목록 ----------

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

  function calloutHtml(kind, text) {
    return (
      '<div class="callout' + (kind === 'warn' ? ' warn' : '') + '">' +
        '<span class="callout-icon">' + (kind === 'warn' ? '⚠️' : '💡') + '</span>' +
        '<div>' + fmt(text) + '</div>' +
      '</div>'
    );
  }

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
              '</label>'
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

  // ---------- 라우팅 ----------

  function route() {
    if (wakeLock) {
      wakeLock.release();
      wakeLock = null;
    }
    const m = /^#\/r\/(.+)$/.exec(location.hash);
    const r = m && recipes.find((x) => x.id === decodeURIComponent(m[1]));
    if (r) {
      document.title = r.title + ' · 내 레시피';
      renderRecipe(r);
      window.scrollTo(0, 0);
    } else {
      document.title = '내 레시피';
      renderList();
    }
  }

  function loadScript(src) {
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  const files = window.RECIPE_FILES || [];
  Promise.all(files.map((f) => loadScript('recipes/' + f + '.js'))).then(() => {
    // 로딩 순서와 무관하게 index.js에 적힌 순서로 정렬
    recipes.sort((a, b) => files.indexOf(a.id) - files.indexOf(b.id));
    window.addEventListener('hashchange', route);
    route();
  });
})();
