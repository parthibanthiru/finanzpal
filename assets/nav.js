document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.top');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  initNavDropdowns();
  initThemeToggle();
  initSiteSearch();
});

function initNavDropdowns() {
  var drops = document.querySelectorAll('.nav-drop');
  if (!drops.length) return;

  function closeAll(except) {
    drops.forEach(function (d) {
      if (d !== except) d.classList.remove('open');
    });
  }

  drops.forEach(function (drop) {
    var btn = drop.querySelector('.nav-drop-btn');
    if (!btn) return;
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !drop.classList.contains('open');
      closeAll(willOpen ? drop : null);
      drop.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
}

function initThemeToggle() {
  var actions = document.querySelector('.header-actions');
  if (!actions) return;
  var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var label = isEn ? 'Toggle dark mode' : 'Dunkelmodus umschalten';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle-btn';
  btn.setAttribute('aria-label', label);
  btn.innerHTML = '<span class="theme-icon theme-icon-sun" aria-hidden="true">☀</span><span class="theme-icon theme-icon-moon" aria-hidden="true">☾</span>';

  var searchBtn = actions.querySelector('.search-btn');
  if (searchBtn) actions.insertBefore(btn, searchBtn);
  else actions.appendChild(btn);

  function currentTheme() {
    var stored = null;
    try { stored = localStorage.getItem('fp-theme'); } catch (e) {}
    if (stored === 'dark' || stored === 'light') return stored;
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem('fp-theme', theme); } catch (e) {}
    }
  }

  // Reflect current effective theme in the attribute (covers the case where
  // no explicit choice is stored yet, so the icon state is correct from the start).
  applyTheme(currentTheme(), false);

  btn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });
}

// Site-search index for the header search icon (.search-btn). Flat list of
// every page; "kw" holds extra search terms beyond the title itself (e.g.
// provider names, synonyms) so a query like "Kfz" or "Auto" finds the
// Versicherungen page even though neither word is in its title.
var PAGES_DE = [
  { url: 'index.html', title: 'Startseite', group: 'Start', kw: '' },
  { url: 'broker.html', title: 'Broker-Vergleich', group: 'Vergleich', kw: 'Trade Republic Scalable Capital Consorsbank comdirect flatex DKB Smartbroker Online-Broker Depot' },
  { url: 'broker-trade-republic.html', title: 'Trade Republic im Test', group: 'Broker-Test', kw: '' },
  { url: 'broker-scalable-capital.html', title: 'Scalable Capital im Test', group: 'Broker-Test', kw: '' },
  { url: 'broker-consorsbank.html', title: 'Consorsbank im Test', group: 'Broker-Test', kw: '' },
  { url: 'broker-trade-republic-vs-scalable-capital.html', title: 'Trade Republic vs. Scalable Capital', group: 'Broker-Vergleich', kw: 'Neobroker Gegenüberstellung direkter Vergleich' },
  { url: 'girokonto.html', title: 'Girokonto-Vergleich', group: 'Vergleich', kw: 'Bankkonto Kontoführungsgebühr DKB ING N26 C24 Dispozins' },
  { url: 'tagesgeld.html', title: 'Tagesgeld-Vergleich', group: 'Vergleich', kw: 'Zinsen Sparkonto Festgeld Einlagensicherung' },
  { url: 'kinderdepot.html', title: 'Kinderdepot-Vergleich', group: 'Vergleich', kw: 'Junior-Depot Kinder ETF Elterndepot' },
  { url: 'kreditkarte.html', title: 'Kreditkarten-Vergleich', group: 'Vergleich', kw: 'Visa Mastercard kostenlos Jahresgebühr Fremdwährung' },
  { url: 'kredite.html', title: 'Kredit-Vergleich', group: 'Vergleich', kw: 'Ratenkredit Darlehen Zinssatz Sondertilgung' },
  { url: 'baufinanzierung.html', title: 'Baufinanzierung-Vermittler-Vergleich', group: 'Vergleich', kw: 'Interhyp Dr. Klein Baufi24 Hüttig Rompf Hypothek Immobilienfinanzierung' },
  { url: 'versicherungen.html', title: 'Versicherungs-Vergleich', group: 'Vergleich', kw: 'Privathaftpflicht Hausrat Berufsunfähigkeit BU Rechtsschutz Kfz Auto Autoversicherung' },
  { url: 'etf-suche.html', title: 'ETF-Suche', group: 'Vergleich', kw: 'Aktien Anleihen Geldmarkt TER Replikation' },
  { url: 'steuerprogramm.html', title: 'Steuerprogramm-Vergleich', group: 'Vergleich', kw: 'Steuererklärung WISO Taxfix smartsteuer ELSTER' },
  { url: 'finanz-check.html', title: 'Finanz-Check', group: 'Tool', kw: 'Quiz Empfehlung Girokonto Depot Kreditkarte Tagesgeld' },
  { url: 'sparplanrechner.html', title: 'ETF-Sparplanrechner', group: 'Rechner', kw: 'Einmalanlage Sparrate' },
  { url: 'zinseszinsrechner.html', title: 'Zinseszinsrechner', group: 'Rechner', kw: '' },
  { url: 'kreditrechner.html', title: 'Kreditrechner', group: 'Rechner', kw: 'Annuitätendarlehen' },
  { url: 'baufinanzierungsrechner.html', title: 'Baufinanzierungsrechner', group: 'Rechner', kw: 'Monatsrate Restschuld Zinskosten' },
  { url: 'nettolohnrechner.html', title: 'Nettolohnrechner', group: 'Rechner', kw: 'Brutto Netto Steuerklasse Gehalt' },
  { url: 'haushaltsbuch.html', title: 'Haushaltsbuch', group: 'Rechner', kw: 'Budget-Tracker Ausgaben' },
  { url: 'altersvorsorge-rechner.html', title: 'Altersvorsorge-Rechner', group: 'Rechner', kw: 'Rentenlücke Rente' },
  { url: 'ratgeber.html', title: 'Ratgeber', group: 'Ratgeber', kw: 'Alle Artikel' },
  { url: 'ratgeber-etf-sparplan.html', title: 'ETF-Sparplan starten: Die ersten Schritte', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-kreditkarte-guide.html', title: 'Kostenlose Kreditkarte: Worauf du wirklich achten solltest', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-tagesgeld-vs-festgeld.html', title: 'Tagesgeld oder Festgeld: Was passt zu dir?', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-ratenkredit-vergleichen.html', title: 'Ratenkredit vergleichen', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-haftpflicht-basics.html', title: 'Private Haftpflicht: Was wirklich zählt', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-berufsunfaehigkeit-guide.html', title: 'Berufsunfähigkeitsversicherung: Brauchst du sie wirklich?', group: 'Ratgeber', kw: 'BU' },
  { url: 'ratgeber-girokonto-guide.html', title: 'Kostenloses Girokonto: Worauf es wirklich ankommt', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-depot-guide.html', title: 'Das richtige Depot für deinen ETF-Sparplan', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-steuerprogramm-guide.html', title: 'Steuererklärung mit Software: Lohnt sich das?', group: 'Ratgeber', kw: '' },
  { url: 'ratgeber-altersvorsorgedepot.html', title: 'Das Altersvorsorgedepot: Was sich 2027 ändert', group: 'Ratgeber', kw: '' },
  { url: 'ueber-uns.html', title: 'Über uns & Methodik', group: 'Info', kw: '' },
  { url: 'impressum.html', title: 'Impressum', group: 'Info', kw: '' },
  { url: 'datenschutz.html', title: 'Datenschutzerklärung', group: 'Info', kw: '' }
];

var PAGES_EN = [
  { url: 'index.html', title: 'Home', group: 'Start', kw: '' },
  { url: 'broker.html', title: 'Broker Comparison', group: 'Compare', kw: 'Trade Republic Scalable Capital Consorsbank comdirect flatex DKB Smartbroker Online broker Custody account' },
  { url: 'broker-trade-republic.html', title: 'Trade Republic Reviewed', group: 'Broker review', kw: '' },
  { url: 'broker-scalable-capital.html', title: 'Scalable Capital Reviewed', group: 'Broker review', kw: '' },
  { url: 'broker-consorsbank.html', title: 'Consorsbank Reviewed', group: 'Broker review', kw: '' },
  { url: 'broker-trade-republic-vs-scalable-capital.html', title: 'Trade Republic vs. Scalable Capital', group: 'Broker comparison', kw: 'neobroker head to head comparison' },
  { url: 'girokonto.html', title: 'Checking Account Comparison', group: 'Compare', kw: 'Bank account fee DKB ING N26 C24 overdraft checking' },
  { url: 'tagesgeld.html', title: 'Instant Savings Account Comparison', group: 'Compare', kw: 'Interest rate fixed deposit protection' },
  { url: 'kinderdepot.html', title: 'Junior Depot Comparison', group: 'Compare', kw: 'Children custody account ETF' },
  { url: 'kreditkarte.html', title: 'Credit Card Comparison', group: 'Compare', kw: 'Visa Mastercard free annual fee foreign currency' },
  { url: 'kredite.html', title: 'Loan Comparison', group: 'Compare', kw: 'Installment loan rate early repayment' },
  { url: 'baufinanzierung.html', title: 'Mortgage Broker Comparison', group: 'Compare', kw: 'Interhyp Dr. Klein Baufi24 Hüttig Rompf mortgage' },
  { url: 'versicherungen.html', title: 'Insurance Comparison', group: 'Compare', kw: 'Personal liability home contents disability BU legal protection car insurance' },
  { url: 'etf-suche.html', title: 'ETF Search', group: 'Compare', kw: 'Equity bond money market TER replication' },
  { url: 'steuerprogramm.html', title: 'Tax Software Comparison', group: 'Compare', kw: 'Tax return WISO Taxfix smartsteuer ELSTER' },
  { url: 'finanz-check.html', title: 'Finanz-Check', group: 'Tool', kw: 'Quiz recommendation checking account custody account credit card savings' },
  { url: 'sparplanrechner.html', title: 'ETF Savings Plan Calculator', group: 'Calculator', kw: 'Lump sum savings rate' },
  { url: 'zinseszinsrechner.html', title: 'Compound Interest Calculator', group: 'Calculator', kw: '' },
  { url: 'kreditrechner.html', title: 'Loan Calculator', group: 'Calculator', kw: 'Amortizing loan' },
  { url: 'baufinanzierungsrechner.html', title: 'Mortgage Calculator', group: 'Calculator', kw: 'Monthly payment remaining balance' },
  { url: 'nettolohnrechner.html', title: 'Net Salary Calculator', group: 'Calculator', kw: 'Gross net tax class salary' },
  { url: 'haushaltsbuch.html', title: 'Budget Tracker', group: 'Calculator', kw: 'Household expenses' },
  { url: 'altersvorsorge-rechner.html', title: 'Retirement Savings Calculator', group: 'Calculator', kw: 'Pension gap' },
  { url: 'ratgeber.html', title: 'Guides', group: 'Guides', kw: 'All articles' },
  { url: 'ratgeber-etf-sparplan.html', title: 'Starting an ETF Savings Plan: First Steps', group: 'Guides', kw: '' },
  { url: 'ratgeber-kreditkarte-guide.html', title: 'Free Credit Card: What to Actually Watch For', group: 'Guides', kw: '' },
  { url: 'ratgeber-tagesgeld-vs-festgeld.html', title: 'Instant Savings Account or Fixed Deposit: Which Fits You?', group: 'Guides', kw: '' },
  { url: 'ratgeber-ratenkredit-vergleichen.html', title: 'Comparing Instalment Loans', group: 'Guides', kw: '' },
  { url: 'ratgeber-haftpflicht-basics.html', title: 'Personal Liability Insurance: What Actually Matters', group: 'Guides', kw: '' },
  { url: 'ratgeber-berufsunfaehigkeit-guide.html', title: 'Disability Income Insurance: Do You Really Need It?', group: 'Guides', kw: 'BU' },
  { url: 'ratgeber-girokonto-guide.html', title: 'Free Checking Account: What Really Matters', group: 'Guides', kw: '' },
  { url: 'ratgeber-depot-guide.html', title: 'The Right Custody Account for Your ETF Savings Plan', group: 'Guides', kw: '' },
  { url: 'ratgeber-steuerprogramm-guide.html', title: 'Tax Filing Software: Is It Worth It?', group: 'Guides', kw: '' },
  { url: 'ratgeber-altersvorsorgedepot.html', title: 'The Altersvorsorgedepot: What Changes in 2027', group: 'Guides', kw: '' },
  { url: 'ueber-uns.html', title: 'About Us & Methodology', group: 'Info', kw: '' },
  { url: 'impressum.html', title: 'Legal Notice', group: 'Info', kw: '' },
  { url: 'datenschutz.html', title: 'Privacy Policy', group: 'Info', kw: '' }
];

function initSiteSearch() {
  var searchBtn = document.querySelector('.search-btn');
  if (!searchBtn) return;

  var isEn = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0;
  var pages = isEn ? PAGES_EN : PAGES_DE;
  var placeholder = isEn ? 'Search pages…' : 'Seite suchen…';
  var emptyText = isEn ? 'No matches' : 'Keine Treffer';
  var closeLabel = isEn ? 'Close' : 'Schließen';

  searchBtn.setAttribute('role', 'button');
  searchBtn.setAttribute('tabindex', '0');
  searchBtn.setAttribute('aria-label', isEn ? 'Search' : 'Suche');

  var overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="search-modal" role="dialog" aria-modal="true">' +
      '<div class="search-input-row">' +
        '<span class="search-input-icon" aria-hidden="true">&#8981;</span>' +
        '<input type="text" class="search-input" placeholder="' + placeholder + '" autocomplete="off">' +
        '<button type="button" class="search-close" aria-label="' + closeLabel + '">&#10005;</button>' +
      '</div>' +
      '<div class="search-results"></div>' +
      '<div class="search-empty" hidden>' + emptyText + '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector('.search-input');
  var resultsEl = overlay.querySelector('.search-results');
  var emptyEl = overlay.querySelector('.search-empty');
  var closeBtn = overlay.querySelector('.search-close');
  var activeIndex = -1;

  function render(matches) {
    activeIndex = matches.length ? 0 : -1;
    resultsEl.innerHTML = '';
    emptyEl.hidden = matches.length !== 0;
    matches.forEach(function (p, i) {
      var a = document.createElement('a');
      a.href = p.url;
      a.className = 'search-result' + (i === 0 ? ' active-result' : '');
      a.innerHTML = '<span class="sr-title"></span><span class="sr-group"></span>';
      a.querySelector('.sr-title').textContent = p.title;
      a.querySelector('.sr-group').textContent = p.group;
      resultsEl.appendChild(a);
    });
  }

  function filter(query) {
    var q = query.trim().toLowerCase();
    if (!q) { render(pages.slice(0, 8)); return; }
    var matches = pages.filter(function (p) {
      return p.title.toLowerCase().indexOf(q) !== -1 || (p.kw && p.kw.toLowerCase().indexOf(q) !== -1);
    });
    render(matches.slice(0, 12));
  }

  function updateActive() {
    var links = resultsEl.querySelectorAll('.search-result');
    links.forEach(function (l, i) { l.classList.toggle('active-result', i === activeIndex); });
    if (links[activeIndex]) links[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    var links = resultsEl.querySelectorAll('.search-result');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < links.length - 1) activeIndex++;
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) activeIndex--;
      updateActive();
    } else if (e.key === 'Enter') {
      if (links[activeIndex]) window.location.href = links[activeIndex].getAttribute('href');
    }
  }

  function open() {
    overlay.hidden = false;
    input.value = '';
    render(pages.slice(0, 8));
    document.addEventListener('keydown', onKeydown);
    setTimeout(function () { input.focus(); }, 10);
  }

  function close() {
    overlay.hidden = true;
    document.removeEventListener('keydown', onKeydown);
  }

  input.addEventListener('input', function () { filter(input.value); });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  searchBtn.addEventListener('click', open);
  searchBtn.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });

  // "/" opens search from anywhere on the page, as long as the person isn't
  // already typing in another field — a common, low-effort convention users
  // may already expect from other sites.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || overlay.hidden === false) return;
    var tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || document.activeElement.isContentEditable) return;
    e.preventDefault();
    open();
  });
}
