/* The interactive moments of the page: the hero's rotating scenarios, the
   capabilities tabs, the connect guides, the carousel of models and the
   questions. */
(function () {
  /* The page opens at its top: the browser does not bring back where the
     last visit stopped, unless the address names a section. */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  function toTop() {
    if (location.hash) return;
    var html = document.documentElement, prev = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = prev;
  }
  toTop();
  window.addEventListener('load', toTop);
  window.addEventListener('pageshow', toTop);

  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- hero: three moments of a real day ---------- */
  var scenes = [
    { f: 'dec', n: 14, who: 'Claude', tb: 'Claude escreveu em Decisões/', ts: 'Decisão 14 · seguiu o modelo da pasta',
      doc: '<div class="meta"><span class="ok">aceita</span><span>17 nov 2026</span><span>infra</span><span>e-mail</span></div><h3>Decisão 14 · Fornecedor de e-mail</h3><h4>Por quê</h4><p>O fornecedor A não entregava no Outlook. Três clientes reclamaram na mesma semana, como registrado em <a>Reunião 2026-11-12</a>.</p><h4>O que decidimos</h4><p>Trocar para o fornecedor B até o fim do mês.</p>',
      you: 'Registra que escolhemos o fornecedor B para os e-mails.',
      ai: 'Li a Orientação do caderno: cada decisão ganha um número. <em>Registrei a Decisão 14 em Decisões/</em>, com o motivo e o link para a reunião.' },
    { f: 'ent', n: 24, who: 'ChatGPT', tb: 'ChatGPT escreveu em Entrevistas/', ts: 'Carla · nome e data no título',
      doc: '<div class="meta"><span class="ok">entrevista</span><span>17 nov 2026</span><span>varejo</span></div><h3>2026-11-17 · Carla, Loja Norte</h3><h4>O que ouvimos</h4><p>Fecha o caixa numa planilha todo fim de dia e perde quase uma hora com isso.</p><h4>Ligações</h4><p>Reforça a hipótese <a>Onboarding guiado</a>.</p>',
      you: 'Conversei com a Carla, da Loja Norte. Ela fecha o caixa numa planilha.',
      ai: 'Entrevistas levam o nome e a data no título. <em>Criei a nota em Entrevistas/</em> e liguei à hipótese que ela reforça.' },
    { f: 'pai', n: 3, who: 'Grok', tb: 'Grok criou um painel', ts: 'Pipeline de vendas · funil e Kanban',
      doc: '<div class="meta"><span class="ok">painel</span><span>tabela Pipeline</span><span>212 linhas</span></div><h3>Pipeline de vendas</h3><h4>Funil</h4><p>Lead 120 · Proposta 54 · Negociação 41 · Fechado 38</p><h4>Kanban</h4><p>Cartões agrupados por etapa, atualizados junto com a tabela.</p>',
      you: 'Monta um painel do pipeline por etapa.',
      ai: 'Li a tabela Pipeline, com 212 linhas. <em>Criei o painel</em> com um funil e um Kanban por etapa.' }
  ];
  var base = { ent: 23, hip: 9, dec: 14, reu: 41, tab: 3, pai: 2 };
  var cur = 0;
  function showScene(i) {
    var s = scenes[i], doc = $('h-doc'), chat = $('h-chat'), toast = $('h-toast');
    [doc, chat, toast].forEach(function (el) { el.classList.add('out'); });
    setTimeout(function () {
      doc.innerHTML = s.doc;
      chat.innerHTML = '<small>' + s.who + '</small><div class="msg you">' + s.you + '</div><div class="msg ai">' + s.ai + '</div>';
      $('h-tb').textContent = s.tb; $('h-ts').textContent = s.ts;
      var rows = $('h-side').querySelectorAll('[data-f]');
      for (var k = 0; k < rows.length; k++) {
        var f = rows[k].dataset.f; rows[k].classList.toggle('on', f === s.f);
        rows[k].querySelector('b').textContent = f === s.f ? s.n : base[f];
      }
      var dots = $('h-dots').children;
      for (var d = 0; d < dots.length; d++) { dots[d].classList.toggle('on', d === i); dots[d].setAttribute('aria-current', d === i ? 'true' : 'false'); }
      [doc, chat, toast].forEach(function (el) { el.classList.remove('out'); });
    }, 450);
  }
  /* Less motion, asked for in the operating system, pauses every rotation; read on each tick, so a change applies at once. */
  function isReduced() { return !!(motion && motion.matches); }
  /* A new scene every 14 s. It pauses under the pointer or the focus and when
     less motion is asked for. The arrows, the dots, the arrow keys and a swipe
     change the scene by hand, and the first manual change stops the rotation
     for good (WCAG 2.2.2), with no pause button needed. */
  var heroManual = false, heroOver = false;
  var heroTimer = setInterval(function () {
    if (heroManual || heroOver || document.hidden || isReduced()) return;
    cur = (cur + 1) % scenes.length; showScene(cur);
  }, 14000);
  function heroGo(k) {
    heroManual = true; clearInterval(heroTimer);
    k = (k + scenes.length) % scenes.length;
    if (k !== cur) { cur = k; showScene(cur); }
  }
  var shot = $('h-shot');
  shot.addEventListener('mouseenter', function () { heroOver = true; });
  shot.addEventListener('mouseleave', function () { heroOver = false; });
  shot.addEventListener('focusin', function () { heroOver = true; });
  shot.addEventListener('focusout', function (e) { if (!shot.contains(e.relatedTarget)) heroOver = false; });
  $('h-dots').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    heroGo(Array.prototype.indexOf.call(this.children, b));
  });
  $('h-prev').addEventListener('click', function () { heroGo(cur - 1); });
  $('h-next').addEventListener('click', function () { heroGo(cur + 1); });
  shot.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { heroGo(cur - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { heroGo(cur + 1); e.preventDefault(); }
  });
  var hx0 = null, hy0 = 0;
  shot.addEventListener('touchstart', function (e) { hx0 = e.touches[0].clientX; hy0 = e.touches[0].clientY; }, { passive: true });
  shot.addEventListener('touchend', function (e) {
    if (hx0 === null) return;
    var t = e.changedTouches[0], dx = t.clientX - hx0, dy = t.clientY - hy0; hx0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) heroGo(cur + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* ---------- capabilities tabs ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-cap]");
    if (!t) return;
    var tabs = document.querySelectorAll("[data-cap]");
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute("aria-selected", tabs[i] === t ? "true" : "false");
    var panes = document.querySelectorAll("[data-pane]");
    for (var j = 0; j < panes.length; j++) panes[j].hidden = panes[j].dataset.pane !== t.dataset.cap;
  });


  /* ---------- connect ---------- */
  var guides = {
    claude: [['Abra Configurações e depois Conectores', 'No Claude, na web ou no app.'], ['Adicione um conector personalizado', 'Dê o nome MemorySmith e cole o endereço ao lado.'], ['Entre com a sua conta MemorySmith', 'Autorize o acesso aos seus cadernos.'], ['Peça: “O que tem nos meus cadernos?”', 'O Claude lê a Orientação e começa a trabalhar.']],
    chatgpt: [['Abra Configurações e depois Conectores', 'Em alguns planos, ative antes o modo de desenvolvedor.'], ['Crie um conector', 'Cole o endereço ao lado e escolha a autenticação OAuth.'], ['Entre com a sua conta MemorySmith', 'Autorize o acesso aos seus cadernos.'], ['Ative o conector na conversa', 'E peça o seu primeiro registro.']],
    grok: [['Abra as configurações de conectores do Grok', 'Na web ou no app.'], ['Adicione um servidor MCP remoto', 'Dê o nome MemorySmith e cole o endereço ao lado.'], ['Entre com a sua conta MemorySmith', 'Autorize o acesso aos seus cadernos.'], ['Peça o seu primeiro registro', 'O Grok lê a Orientação antes de escrever.']],
    outro: [['Procure a opção de servidor MCP remoto', 'Muitos clientes aceitam um servidor pelo endereço.'], ['Cole o endereço ao lado', 'É o mesmo para qualquer cliente.'], ['Entre com a sua conta MemorySmith', 'Pelo mesmo login do Claude, do ChatGPT e do Grok.']]
  };
  function setClient(c) {
    var tabs = document.querySelectorAll('[data-c]');
    for (var i = 0; i < tabs.length; i++) tabs[i].setAttribute('aria-selected', tabs[i].dataset.c === c ? 'true' : 'false');
    $('c-steps').innerHTML = guides[c].map(function (s) { return '<li><div><b>' + esc(s[0]) + '</b><small>' + esc(s[1]) + '</small></div></li>'; }).join('');
  }
  document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-c]'); if (t) setClient(t.dataset.c); });
  setClient('claude');
  $('c-copy').addEventListener('click', function () {
    var btn = this, url = $('c-url');
    var done = function () { btn.textContent = 'Copiado'; setTimeout(function () { btn.textContent = 'Copiar'; }, 1600); };
    var fallback = function () { var r = document.createRange(); r.selectNodeContents(url); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Selecionado'; setTimeout(function () { btn.textContent = 'Copiar'; }, 1600); };
    try { navigator.clipboard.writeText(url.textContent).then(done, fallback); } catch (e) { fallback(); }
  });

  /* ---------- carousel of models ----------
     Arrows over the image, dots, the arrow keys and a drag with the finger or
     the mouse, the image following it. It moves on by itself every 6 s,
     pauses under the pointer or the focus and when less motion is asked for,
     and the first manual change stops the rotation for good (WCAG 2.2.2). */
  (function () {
    var box = $('carousel');
    if (!box) return;
    var track = $('car-track'), slides = track.children, n = slides.length, i = 0;
    var dots = $('car-dots'), live = $('car-live'), manual = false, over = false;
    for (var k = 0; k < n; k++) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.go = k;
      b.setAttribute('aria-label', 'Ir para o slide ' + (k + 1) + ' de ' + n);
      dots.appendChild(b);
    }
    function go(to, say) {
      i = (to + n) % n;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      for (var k = 0; k < n; k++) {
        var on = k === i;
        slides[k].setAttribute('aria-hidden', on ? 'false' : 'true');
        if (on) slides[k].removeAttribute('inert'); else slides[k].setAttribute('inert', '');
        dots.children[k].setAttribute('aria-current', on ? 'true' : 'false');
      }
      if (say) live.textContent = 'Slide ' + (i + 1) + ' de ' + n + ': ' + slides[i].querySelector('b').textContent;
    }
    var timer = setInterval(function () { if (!manual && !over && !document.hidden && !isReduced()) go(i + 1, false); }, 6000);
    function pick(to) { manual = true; clearInterval(timer); go(to, true); }
    $('car-prev').addEventListener('click', function () { pick(i - 1); });
    $('car-next').addEventListener('click', function () { pick(i + 1); });
    dots.addEventListener('click', function (e) { var d = e.target.closest('[data-go]'); if (d) pick(+d.dataset.go); });
    box.addEventListener('mouseenter', function () { over = true; });
    box.addEventListener('mouseleave', function () { over = false; });
    box.addEventListener('focusin', function () { over = true; });
    box.addEventListener('focusout', function (e) { if (!box.contains(e.relatedTarget)) over = false; });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { pick(i - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { pick(i + 1); e.preventDefault(); }
    });
    /* Drag: the track follows the finger or the mouse and, on release, moves
       to the neighbouring slide if it travelled more than 1/6 of the width;
       otherwise it goes back. */
    var x0 = null, dx = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      x0 = e.clientX; dx = 0;
      track.classList.add('dragging');
      try { track.setPointerCapture(e.pointerId); } catch (err) {}
    });
    track.addEventListener('pointermove', function (e) {
      if (x0 === null) return;
      dx = e.clientX - x0;
      track.style.transform = 'translateX(calc(' + (-100 * i) + '% + ' + dx + 'px))';
    });
    function drop() {
      if (x0 === null) return;
      x0 = null; track.classList.remove('dragging');
      if (Math.abs(dx) > track.offsetWidth / 6) pick(i + (dx < 0 ? 1 : -1));
      else go(i, false);
    }
    track.addEventListener('pointerup', drop);
    track.addEventListener('pointercancel', drop);
    go(0, false);
  })();

  /* ---------- questions: search and tabs by topic ----------
     The search ignores case and accents ("preco" finds "preço"). */
  (function () {
    var q = $('faq-q');
    if (!q) return;
    var items = document.querySelectorAll('#faq-list details'), cat = 'all';
    function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function run() {
      var term = norm(q.value.trim()), shown = 0;
      for (var k = 0; k < items.length; k++) {
        var d = items[k];
        var show = (cat === 'all' || d.dataset.cat === cat) && (!term || norm(d.textContent).indexOf(term) >= 0);
        d.hidden = !show;
        if (show) { shown++; if (term) d.open = true; }
      }
      $('faq-empty').hidden = shown > 0;
      $('faq-count').textContent = shown === items.length ? items.length + ' perguntas' : shown + ' de ' + items.length + ' perguntas';
    }
    q.addEventListener('input', run);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-faq]');
      if (!b) return;
      cat = b.dataset.faq;
      var bs = document.querySelectorAll('[data-faq]');
      for (var k = 0; k < bs.length; k++) bs[k].setAttribute('aria-pressed', bs[k] === b ? 'true' : 'false');
      run();
    });
    run();
  })();
})();
