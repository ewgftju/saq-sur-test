const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function createApp() {
  const elements = Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => [id, {
    value: '', innerHTML: '', textContent: '', disabled: false, options: [], style: {},
    classList: { add() {}, remove() {}, toggle() {} },
  }]));
  elements['chk-form-type'].value = 'app2_arbp';
  const timers = [];
  const downloads = [];
  const storage = new Map();
  const context = vm.createContext({
    document: { getElementById: id => elements[id] || null },
    window: { scrollTo() {} },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    XLSX: { utils: { sheet_to_json: sheet => sheet } },
    setTimeout: callback => timers.push(callback),
    alert: message => { throw new Error(message); },
    downloads,
  });
  for (let i = 1; i <= 8; i++) {
    vm.runInContext(fs.readFileSync(path.join(root, 'assets', `sur-0${i}.js`), 'utf8'), context);
  }
  const run = source => vm.runInContext(source, context);
  run('downloadCSV = (filename, rows) => downloads.push({filename, rows})');
  return { elements, downloads, run, finishTimers: () => { while (timers.length) timers.shift()(); } };
}

for (const [risk, label] of [['low', 'Низкий'], ['high', 'Высокий']]) {
  test(`risk assessment refreshes the ${risk} filter and its CSV export`, () => {
    const app = createApp();
    app.elements['f-risk'].value = risk;
    app.run('applyFilters()');
    const initialCount = app.run('visible.length');
    app.run('runEvgaRiskAssessment()');
    app.finishTimers();
    const expectedCount = app.run(`dataEVGA.filter(object => object.risk === '${risk}').length`);
    assert.notEqual(expectedCount, initialCount, 'fixture must include objects whose risk changes');
    assert.equal(app.run('visible.length'), expectedCount);
    assert.equal(app.run(`visible.every(object => object.risk === '${risk}')`), true);
    app.run('exportCSV()');
    const rows = app.downloads[0].rows.slice(1);
    assert.equal(rows.length, expectedCount);
    assert.equal(rows.every(row => row[4] === label), true);
  });
}

test('returning to Appendix 5 keeps an existing result exportable', () => {
  const app = createApp();
  app.elements['chk-form-type'].value = 'app5_sample';
  app.run("onFormsTypeChange(); updateFormFilter('bin', '000140002861')");
  assert.equal(app.elements['chk-export-btn'].disabled, false);
  const count = app.run('lastFormRows.length');
  assert.ok(count > 0);
  app.elements['chk-form-type'].value = 'app2_arbp';
  app.run('onFormsTypeChange()');
  assert.equal(app.elements['chk-export-btn'].disabled, true, 'an ungenerated form must stay disabled');
  app.elements['chk-form-type'].value = 'app5_sample';
  app.run('onFormsTypeChange()');
  assert.equal(app.run('lastFormRows.length'), count);
  assert.equal(app.elements['chk-export-btn'].disabled, false);
  app.run('exportFormReport()');
  assert.equal(app.downloads[0].rows.length, count + 1);
  app.run("updateFormFilter('bin', '000000000000')");
  assert.equal(app.elements['chk-export-btn'].disabled, true, 'a lookup with no result cannot be exported');
});

test('recalculating a DFO package preserves the saved EVGA selection', () => {
  const app = createApp();
  const evgaName = app.run('dataEVGA[0].name');
  app.run('toggleSelect(0, true); sendSelectedToModule()');
  app.run("selectSurModule('a'); toggleSelect(dataA.findIndex(isEligibleForSend), true); sendSelectedToModule()");
  assert.equal(app.run("Object.values(sentToModule).includes('Проф. контроль')"), true);
  app.run(`processDfoWorkbook({Sheets: {
    'Сводка': [['Период', '2026 H1'], ['Снимок данных', '2026-09-13']],
    'Субъекты': [{subject_id:'qa1', subject_name:'QA test subject', subject_type:'ОПИ', BIN:'000000000001', status:'ACTIVE', registration_date:'2000-01-01'}],
    'Отчеты': [{subject_id:'qa1', report_code:'OPI_1B', report_status:'MISSING'}]
  }}); runCandidateCheck()`);
  app.finishTimers();
  assert.equal(app.run("Object.values(sentToModule).includes('Проф. контроль')"), false);
  assert.equal(app.run(`sentToModule[${JSON.stringify(evgaName)}]`), 'ЭВГА');
  app.run("selectSurModule('b'); exportSelectedObjects()");
  assert.equal(app.downloads[0].rows.length, 2);
  assert.equal(app.downloads[0].rows[1][1], evgaName);
});
