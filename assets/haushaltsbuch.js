(function () {
  var LANG = (document.documentElement.lang || 'de').toLowerCase().indexOf('en') === 0 ? 'en' : 'de';
  var LOCALE = LANG === 'en' ? 'en-IE' : 'de-DE';
  var STORAGE_KEY = 'fp-haushaltsbuch-v1';

  var KATEGORIEN = LANG === 'en' ? {
    einnahme: [
      { id: 'gehalt', label: 'Salary' },
      { id: 'sonstige-einnahme', label: 'Other income' }
    ],
    ausgabe: [
      { id: 'wohnen', label: 'Housing' },
      { id: 'kommunikation', label: 'Internet & mobile' },
      { id: 'lebensmittel', label: 'Groceries' },
      { id: 'transport', label: 'Transport' },
      { id: 'versicherungen', label: 'Insurance' },
      { id: 'freizeit', label: 'Leisure & shopping' },
      { id: 'sonstiges', label: 'Other' }
    ]
  } : {
    einnahme: [
      { id: 'gehalt', label: 'Gehalt' },
      { id: 'sonstige-einnahme', label: 'Sonstige Einnahme' }
    ],
    ausgabe: [
      { id: 'wohnen', label: 'Wohnen' },
      { id: 'kommunikation', label: 'Internet & Handy' },
      { id: 'lebensmittel', label: 'Lebensmittel' },
      { id: 'transport', label: 'Transport' },
      { id: 'versicherungen', label: 'Versicherungen' },
      { id: 'freizeit', label: 'Freizeit & Shopping' },
      { id: 'sonstiges', label: 'Sonstiges' }
    ]
  };

  // Quick-add presets for common recurring/fixed costs (Miete, Strom, Internet,
  // Handy/SIM-Karte, …) so the most repetitive bookings — the same basics
  // almost every household has — take one click instead of typing the
  // category and description by hand each month. Each preset maps to one of
  // the existing KATEGORIEN.ausgabe ids above, so nothing new needs to be
  // added to saved data: clicking a chip just pre-fills the form.
  var FIXKOSTEN = LANG === 'en' ? [
    { id: 'miete', label: 'Rent', kategorie: 'wohnen' },
    { id: 'strom', label: 'Electricity', kategorie: 'wohnen' },
    { id: 'heizung', label: 'Heating/gas', kategorie: 'wohnen' },
    { id: 'wasser', label: 'Water', kategorie: 'wohnen' },
    { id: 'rundfunk', label: 'Broadcast fee (Rundfunkbeitrag)', kategorie: 'wohnen' },
    { id: 'internet', label: 'Internet', kategorie: 'kommunikation' },
    { id: 'handy', label: 'Mobile/SIM card', kategorie: 'kommunikation' },
    { id: 'versicherung', label: 'Insurance', kategorie: 'versicherungen' },
    { id: 'streaming', label: 'Streaming subscription', kategorie: 'freizeit' },
    { id: 'fitness', label: 'Gym membership', kategorie: 'freizeit' },
    { id: 'oepnv', label: 'Public transport pass', kategorie: 'transport' }
  ] : [
    { id: 'miete', label: 'Miete', kategorie: 'wohnen' },
    { id: 'strom', label: 'Strom', kategorie: 'wohnen' },
    { id: 'heizung', label: 'Heizung/Gas', kategorie: 'wohnen' },
    { id: 'wasser', label: 'Wasser', kategorie: 'wohnen' },
    { id: 'rundfunk', label: 'Rundfunkbeitrag', kategorie: 'wohnen' },
    { id: 'internet', label: 'Internet', kategorie: 'kommunikation' },
    { id: 'handy', label: 'Handy/SIM-Karte', kategorie: 'kommunikation' },
    { id: 'versicherung', label: 'Versicherung', kategorie: 'versicherungen' },
    { id: 'streaming', label: 'Streaming-Abo', kategorie: 'freizeit' },
    { id: 'fitness', label: 'Fitnessstudio', kategorie: 'freizeit' },
    { id: 'oepnv', label: 'ÖPNV-Ticket', kategorie: 'transport' }
  ];

  var STR = LANG === 'en' ? {
    empty: 'No entries yet — add your first income or expense above.',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    delete: 'Delete',
    confirmReset: 'Delete all entries? This can’t be undone.',
    noExpenses: 'No expenses yet to break down by category.'
  } : {
    empty: 'Noch keine Buchungen — füge oben deine erste Einnahme oder Ausgabe hinzu.',
    income: 'Einnahmen',
    expense: 'Ausgaben',
    balance: 'Saldo',
    delete: 'Löschen',
    confirmReset: 'Wirklich alle Buchungen löschen? Das kann nicht rückgängig gemacht werden.',
    noExpenses: 'Noch keine Ausgaben zur Aufschlüsselung nach Kategorie.'
  };

  function formatEUR(n) {
    return n.toLocaleString(LOCALE, { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function katLabel(typ, katId) {
    var list = KATEGORIEN[typ] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === katId) return list[i].label;
    }
    return katId;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // localStorage unavailable (private mode, quota, etc.) — fail silently,
      // the page still works for the current session.
    }
  }

  function uid() {
    return 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function init() {
    var typEl = document.getElementById('hb-typ');
    var kategorieEl = document.getElementById('hb-kategorie');
    var beschreibungEl = document.getElementById('hb-beschreibung');
    var betragEl = document.getElementById('hb-betrag');
    var formEl = document.getElementById('hb-form');
    var listEl = document.getElementById('hb-list');
    var resetBtn = document.getElementById('hb-reset');
    var fixkostenEl = document.getElementById('hb-fixkosten');

    var resultEinnahmen = document.getElementById('hb-result-einnahmen');
    var resultAusgaben = document.getElementById('hb-result-ausgaben');
    var resultSaldo = document.getElementById('hb-result-saldo');
    var breakdownEl = document.getElementById('hb-breakdown');

    var items = load();

    function populateKategorien() {
      var typ = typEl.value;
      var list = KATEGORIEN[typ] || [];
      kategorieEl.innerHTML = list.map(function (k) {
        return '<option value="' + k.id + '">' + escapeHtml(k.label) + '</option>';
      }).join('');
    }

    function renderList() {
      if (!items.length) {
        listEl.innerHTML = '<p class="kk-empty">' + STR.empty + '</p>';
        return;
      }
      var sorted = items.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
      listEl.innerHTML = sorted.map(function (tx) {
        var sign = tx.typ === 'einnahme' ? '+' : '−';
        var cls = tx.typ === 'einnahme' ? 'hb-amt-in' : 'hb-amt-out';
        return '<div class="hb-row" data-id="' + tx.id + '">' +
          '<div class="hb-row-main"><span class="hb-desc">' + escapeHtml(tx.beschreibung || katLabel(tx.typ, tx.kategorie)) + '</span>' +
          '<span class="hb-kat">' + escapeHtml(katLabel(tx.typ, tx.kategorie)) + '</span></div>' +
          '<span class="hb-amt ' + cls + '">' + sign + ' ' + formatEUR(Math.abs(tx.betrag)) + '</span>' +
          '<button type="button" class="hb-del" data-del="' + tx.id + '" aria-label="' + STR.delete + '">×</button>' +
          '</div>';
      }).join('');
    }

    function renderSummary() {
      var einnahmen = 0, ausgaben = 0;
      var byKategorie = {};
      items.forEach(function (tx) {
        if (tx.typ === 'einnahme') {
          einnahmen += tx.betrag;
        } else {
          ausgaben += tx.betrag;
          byKategorie[tx.kategorie] = (byKategorie[tx.kategorie] || 0) + tx.betrag;
        }
      });
      var saldo = einnahmen - ausgaben;

      resultEinnahmen.textContent = formatEUR(einnahmen);
      resultAusgaben.textContent = formatEUR(ausgaben);
      resultSaldo.textContent = formatEUR(saldo);
      resultSaldo.parentElement.classList.toggle('hb-negative', saldo < 0);

      if (!ausgaben) {
        breakdownEl.innerHTML = '<p class="kk-empty">' + STR.noExpenses + '</p>';
        return;
      }
      var rows = Object.keys(byKategorie).map(function (katId) {
        return { katId: katId, betrag: byKategorie[katId] };
      }).sort(function (a, b) { return b.betrag - a.betrag; });

      breakdownEl.innerHTML = rows.map(function (r) {
        var pct = ausgaben ? (r.betrag / ausgaben) * 100 : 0;
        return '<div class="hb-cat-row">' +
          '<div class="hb-cat-head"><span>' + escapeHtml(katLabel('ausgabe', r.katId)) + '</span><span>' + formatEUR(r.betrag) + ' · ' + pct.toFixed(0) + ' %</span></div>' +
          '<div class="hb-cat-bar-track"><div class="hb-cat-bar-fill" style="width:' + pct + '%"></div></div>' +
          '</div>';
      }).join('');
    }

    function renderAll() {
      renderList();
      renderSummary();
    }

    function renderFixkosten() {
      if (!fixkostenEl) return;
      fixkostenEl.innerHTML = FIXKOSTEN.map(function (f) {
        return '<button type="button" class="chip" data-fix="' + f.id + '">' + escapeHtml(f.label) + '</button>';
      }).join('');
    }

    if (fixkostenEl) {
      fixkostenEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-fix]');
        if (!btn) return;
        var preset = FIXKOSTEN.filter(function (f) { return f.id === btn.getAttribute('data-fix'); })[0];
        if (!preset) return;
        typEl.value = 'ausgabe';
        populateKategorien();
        kategorieEl.value = preset.kategorie;
        beschreibungEl.value = preset.label;
        betragEl.focus();
      });
    }

    typEl.addEventListener('change', populateKategorien);

    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var betrag = parseFloat(betragEl.value);
      if (!betrag || betrag <= 0) return;
      items.push({
        id: uid(),
        typ: typEl.value,
        kategorie: kategorieEl.value,
        beschreibung: beschreibungEl.value.trim(),
        betrag: betrag,
        createdAt: Date.now()
      });
      save(items);
      betragEl.value = '';
      beschreibungEl.value = '';
      beschreibungEl.focus();
      renderAll();
    });

    listEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-del]');
      if (!btn) return;
      var id = btn.getAttribute('data-del');
      items = items.filter(function (tx) { return tx.id !== id; });
      save(items);
      renderAll();
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!items.length) return;
        if (!window.confirm(STR.confirmReset)) return;
        items = [];
        save(items);
        renderAll();
      });
    }

    populateKategorien();
    renderFixkosten();
    renderAll();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
