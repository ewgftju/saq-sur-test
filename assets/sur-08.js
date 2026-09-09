const historyLog = [
  ["10.08.2026 09:14","ЭВГА — плановый расчёт","Аналитик СУР","142","ok","4 мин 12 с"],
  ["10.08.2026 08:02","ЭВГА — пересчёт по обновлённым данным BCP","Автоматически (расписание)","19","ok","38 с"],
  ["09.08.2026 22:00","ЭВГА — Перечень АБП","Автоматически (расписание)","4","ok","51 с"],
  ["09.08.2026 16:47","Проф. контроль","Инспектор проф.контроля","96","ok","2 мин 05 с"],
  ["08.08.2026 09:10","ЭВГА — плановый расчёт","Аналитик СУР","9","error","— (сбой источника NSI)"],
  ["07.08.2026 09:00","ЭВГА — плановый расчёт","Автоматически (расписание)","142","ok","4 мин 40 с"],
];

/* ===================== РЕЕСТР ИСТОЧНИКОВ ДАННЫХ (интеграции) ===================== */
const integrations = [
  { name:"dfo.kz (портал ИУЦ)", icon:"ti-cloud-download", scope:"Проф. контроль", status:"partial",
    statusLabel:"Интеграция в разработке",
    desc:"Отчёты о субъектах профилактического контроля (депозитарий финансовой отчётности). СУР сам считает риск на основе этих отчётов — dfo.kz не отдаёт готовый балл.",
    tables:["Пакет отчётов о субъектах контроля, формат DFO-RISK-2026-HN-NNNN (номер, контрольная сумма, дата)","Формат API, периодичность и тестовый контур согласовываются с АО «ИУЦ» (владелец dfo.kz)"] },
  { name:"elicense.kz (реестр лицензий и аккредитаций)", icon:"ti-certificate", scope:"Проф. контроль", status:"pending",
    statusLabel:"Не подключено",
    desc:"Единый реестр лицензий и аккредитаций: лицензии аудиторских организаций (АО), аккредитация профессиональных аудиторских организаций (ПАО), аккредитация ПОБ/ОПСБ. Помимо показателей ПОБ/ОПСБ ниже, источник также покрывает статус лицензии АО (в т.ч. факт лишения — учитывается при расчёте SP по приложению 2 приказа №724/65, раздел 2.3 постановки задачи) — этот показатель в реестре критериев (SC) отдельным кодом пока не выделен.",
    tables:["ПОБ П-5, П-6 и ОПСБ П-4, П-5 (приложение А) — БИН, прежнее/новое наименование, вид и дата реорганизации, номер/дата/статус аккредитации, история юридического адреса","АО — номер, дата выдачи и статус лицензии (действующая/приостановлена/лишена), дата события","ПАО — номер, дата и статус аккредитации профессиональной аудиторской организации"] },
  { name:"АФМ «WEB СФМ»", icon:"ti-shield-lock", scope:"Проф. контроль", status:"pending",
    statusLabel:"Не подключено",
    desc:"Платформа финансового мониторинга АФМ РК — реестр регистрации субъектов финансового мониторинга. Нужен для проверки, зарегистрирована ли действующая аудиторская организация как субъект финансового мониторинга.",
    tables:["АО П-9 (приложение А) — сопоставление БИН аудиторской организации с реестром, дата регистрации, статус активности"] },
  { name:"BCP / Консолидация", icon:"ti-building-bank", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Консолидация бюджета, дебиторская/кредиторская задолженность, формы финансовой отчётности (Баланс №1/№2), бюджетные операции.",
    tables:["CONS_DICT: GU, ABP, KATO, BUDGET, BUDGET_LEVEL, FKR, REGION","CONS_META: PERIOD, TEMPL","CONS_DATA: FACT_IISK_R, HEADER, PERIOD, FACT_DZB, FACT_KZB, FACT_FIN_FORM1, FACT_FIN_FORM2, RESPONSIBILITY, HISTORY"] },
  { name:"CRAMS", icon:"ti-gavel", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Дела государственного аудита, аудиторские нарушения и отчёты, дата и тип последней проверки объекта.",
    tables:["crams_surga_gac_case","audit_violation, audit_report_doc, gac_control_types, budget_class","crams_core_managed_obj","crams_gbd_jp_core / juristicperson_main","crams_cmg_document / casefile_part","v_dm_gac_audit_report","+ более 20 таблиц"] },
  { name:"ETA / ЕГЗ (гос.закупки)", icon:"ti-shopping-cart", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Камеральный контроль, профили риска, лоты, жалобы по государственным закупкам. Схема egz_whdb.",
    tables:["d3_ctl_inspect, d3_ctl_profile, d3_ref_ctl_profile","d3_trd_buy, d3_trd_buy_lots, d3_trd_complaint","d3_pln_points","table_egz_member_reg_info_v / attributes / bids_v / contract_lines_v"] },
  { name:"NSI (нормативно-справочная информация)", icon:"ti-database", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Справочники КАТО, АБП, ГУ, программ финансирования.",
    tables:["EMF_KATO, EMF_ABP, EMF_GU","CONS_ABP","cons_fkr_prg","TYPES_OF_BUDGET"] },
  { name:"ORCL2 / ХД (хранилище данных)", icon:"ti-server-2", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Операции и платежи.",
    tables:["DATALOADER.TB_OPER_RQ_<год>","DATALOADER.global_pay"] },
  { name:"ГЗК (государственное имущество)", icon:"ti-building-warehouse", scope:"ЭВГА", status:"pending",
    statusLabel:"Не подключено — ожидает переноса на продуктив",
    desc:"Отдельная PostgreSQL база (10.58.57.113, схема PUBLIC). Договоры, бюджетные программы, платежи по гос.имуществу. В текущем конвейере закомментировано.",
    tables:["e_contract","e_budget_program","e_payment"] },
  { name:"Excel — ручная загрузка", icon:"ti-file-spreadsheet", scope:"ЭВГА", status:"manual",
    statusLabel:"Ручная загрузка, не автоматизировано",
    desc:"Ключевой мастер-справочник субъектов ГУ/АБП и данные о передаче государственного имущества.",
    tables:["EMF-export.xls — справочник субъектов ГУ/АБП","Договора КрАр/ДУ.xlsx — передача гос.имущества"] },
  { name:"Салык.кз (лицевой счёт налогоплательщика)", icon:"ti-receipt-tax", scope:"ЭВГА", status:"connected",
    statusLabel:"Подключено",
    desc:"Сверка краткосрочной дебиторской/кредиторской задолженности объекта (по расчётам с бюджетом) с данными лицевого счёта на портале «Салык.кз» — для выявления искажений бухгалтерской отчётности.",
    tables:["Лицевой счёт налогоплательщика — расчёты с бюджетом по налоговым, неналоговым и специальным поступлениям и платежам"] },
  { name:"ClevaDesk (cd-etl)", icon:"ti-folder-open", scope:"Вне СУР — контекст ЭВГА", status:"adjacent",
    statusLabel:"Подключено, вне конвейера СУР",
    desc:"Действующая legacy-система ведения дел государственного аудита, прямой предшественник модуля ЭВГА. Данные читаются отдельно; риск на их основе НЕ считается (раздел 7.4 ТЗ).",
    tables:["report_audit_case","report_contacts_org / report_contacts_user","report_disciplinary_action","report_adopted_measures_answer","dictionaries_supervisory_authority","report_users_user"] },
];
const integStatusBadge = {connected:"low", pending:"high", manual:"mid", partial:"mid", adjacent:"neutral", proposed:"mid"};
let openIntegrations = new Set();

const riskLabelB = {high:"Высокий", mid:"Средний", low:"Низкий"};
const riskLabelA = {high:"Высокий", mid:"Средний", direct:"Прямое основание"};

const kpiLabelsSubjects = ["Всего объектов","Высокий риск","Средний риск","Низкий риск"];
const kpiLabelsA = ["Всего субъектов","Высокий риск","Средний риск","Прямое основание"];
const kpiClsSubjects = ["neutral","high","mid","low"];
const kpiClsA = ["neutral","high","mid","direct"];

let currentContour = 'b';
let perechenMode = 'subjects';
let currentData = dataEVGA;
let visible = currentData;
const PAGE_SIZE = 10;
let currentPage = 1;
let detailType = 'subject'; // 'subject' | 'abp'
let selectedIndices = new Set();
let excludedSet = new Set();
let excludeReasons = {};
let engagements = [];
let engagementByObject = {};
let listByObject = {};
let semiAnnualLists = [];
let perechenApproved = false;
let sentToModule = {}; // o.name -> 'ЭВГА' | 'Проф. контроль' — что уже отправлено из СУР, чтобы не дублировать
let dfoImport = {package:'DFO-RISK-2026-H1-0041', date:'05.08.2026, 09:14', checksum:'A3F9C1E7', count:96};
let dfoImporting = false;
let lastCalc = {date:'05.08.2026, 09:20', count:96};
let calculating = false;
let lastCalcEvga = {date:'—', count:0};
let evgaCalculating = false;
let notCalculatedList = [];
const notCalculatedPool = [
  {object:'ГУ «Отдел строительства района Т.Рыскулова»', indicator:'RI-GU-PRC-04', indicatorName:'Масштабы закупок с нарушениями (по сумме)', missing:'Нет данных в d3_trd_buy за 2026 год — объект отсутствует в выгрузке ETA/ЕГЗ'},
  {object:'КГП «Су Курылыс» акимата Жамбылской области', indicator:'RI-QS-PRP-02', indicatorName:'Передача государственного имущества в имущественный наём', missing:'Интеграция ЦЭФ↔КГИП не подключена — данные по объекту недоступны'},
  {object:'ГУ «Аппарат акима Улытауской области»', indicator:'RI-GU-ACC-12', indicatorName:'Своевременность погашения кредитов по основной сумме долга', missing:'BCP: отсутствует запись CONS_DATA.FACT_KZB за 2026 год'},
  {object:'РГП «Казгидромет»', indicator:'RI-QS-PRC-05', indicatorName:'Наибольшее количество договоров с определённым поставщиком, %', missing:'ETA: субъект не найден в table_egz_member_reg_info_v (БИН не сопоставлен)'},
  {object:'ГУ «Отдел ЖКХ города Приозёрск»', indicator:'RI-GU-PRP-12', indicatorName:'Возвраты на доработку финансовой отчётности Казначейством', missing:'Казначейство обновляет источник раз в квартал — данные за 2026 год ещё не поступили'},
];
let currentDetailObj = null;
let expandedCritIndex = null;
let currentDetailIsSum = true;

function riskLabelFor(risk){
  return currentContour === 'b' ? riskLabelB[risk] : riskLabelA[risk];
}

/* ---------- переключение экранов (сайдбар) ---------- */
function showScreen(name){
  ['list','criteria','history','integrations','analytics'].forEach(s=>{
    document.getElementById('screen-'+s).classList.toggle('active', s===name);
  });
  document.getElementById('nav-check').classList.remove('active');
  ['criteria','history','integrations','analytics'].forEach(s=>{
    document.getElementById('nav-'+s).classList.toggle('active', s===name);
  });
  if(name==='criteria'){ setCriteriaContour(currentContour); renderCriteriaB(); renderCriteriaA(); }
  if(name==='history') renderHistory();
  if(name==='integrations') renderIntegrations();
  if(name==='analytics') renderAnalyticsMain();
}
function showWorkspace(tab){
  showScreen('list');
  document.getElementById('nav-check').classList.add('active');
  document.getElementById('view-list').style.display = 'block';
  document.getElementById('view-detail').style.display = 'none';
}
function renderPerechenMain(){
  document.getElementById('perechen-contour-pill').textContent = currentContour==='b' ? 'ЭВГА' : 'Проф. контроль';
  setPerechenTab(perechenTab);
}
function setPerechenTab(tab){
  perechenTab = tab;
  document.getElementById('ptab-draft').classList.toggle('active', tab==='draft');
  document.getElementById('ptab-approved').classList.toggle('active', tab==='approved');
  document.getElementById('perechen-draft-content').style.display = tab==='draft' ? 'block' : 'none';
  document.getElementById('perechen-approved-content').style.display = tab==='approved' ? 'block' : 'none';
  if(tab==='draft') renderPerechenDraft(); else renderPerechenApproved();
}
function renderPerechenDraft(){
  const el = document.getElementById('perechen-draft-content');
  if(currentContour === 'b'){
    if(perechenApproved){
      el.innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);">Итоговый перечень контура Б уже утверждён — активных проектов нет. Изменения вносятся через вкладку «Утверждённые перечни».</div>`;
      return;
    }
    el.innerHTML = `
      <div class="topbar" style="margin-bottom:8px;">
        <div class="section-title" style="margin:0;">Аудиторские мероприятия — проекты (${engagements.length})</div>
        <button class="btn btn-primary" onclick="openEngagementForm()"><i class="ti ti-folder-plus"></i>Открыть формирование</button>
      </div>
      <div class="card"><table>
        <thead><tr><th>Наименование</th><th style="width:170px;">Тип аудита</th><th style="width:150px;">Срок</th><th style="width:90px;">Объектов</th><th style="width:220px;">Контекст</th></tr></thead>
        <tbody>${engagements.length ? engagements.map((e,i)=>`
          <tr class="row" onclick="openGroupDetail('engagement', ${i})"><td>${e.name}</td><td style="color:var(--text-2);">${e.type}</td><td style="color:var(--text-2);">${e.quarter}</td><td>${e.count}</td><td style="color:var(--text-2);">${e.context}</td></tr>`).join('') :
          `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Пока не сформировано ни одного мероприятия — отметьте объекты галочками на вкладке «Проверка»</td></tr>`}</tbody>
      </table></div>`;
  } else {
    const drafts = semiAnnualLists.map((l,i)=>({l,i})).filter(x=>x.l.status!=='sent');
    el.innerHTML = `
      <div class="topbar" style="margin-bottom:8px;">
        <div class="section-title" style="margin:0;">Полугодовые списки — проекты (${drafts.length})</div>
        <button class="btn btn-primary" onclick="openSemiAnnualForm()"><i class="ti ti-calendar-event"></i>Открыть формирование</button>
      </div>
      <div class="card"><table>
        <thead><tr><th>Список</th><th style="width:130px;">Год</th><th style="width:90px;">Объектов</th><th style="width:150px;">Статус</th></tr></thead>
        <tbody>${drafts.length ? drafts.map(({l,i})=>`
          <tr class="row" onclick="openGroupDetail('semiannual', ${i})"><td>${l.name}</td><td style="color:var(--text-2);">${l.year}</td><td>${l.count}</td><td><span class="badge low">Сформирован</span></td></tr>`).join('') :
          `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">Пока не сформировано ни одного списка — отметьте субъекты галочками на вкладке «Проверка»</td></tr>`}</tbody>
      </table></div>`;
  }
}
function renderPerechenApproved(){
  const el = document.getElementById('perechen-approved-content');
  if(currentContour === 'b'){
    if(!perechenApproved){
      el.innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);margin-bottom:12px;">Итоговый перечень ещё не утверждён.</div>
        <button class="btn btn-primary" onclick="openFinalPerechen()"><i class="ti ti-file-check"></i>Перейти к формированию итогового перечня</button>`;
      return;
    }
    el.innerHTML = `
      <div class="card" style="padding:18px 20px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div><strong>Итоговый перечень утверждён.</strong> Мероприятий: ${engagements.length}.</div>
          <button class="btn" onclick="openFinalPerechen()"><i class="ti ti-eye"></i>Открыть документ</button>
        </div>
        <div style="font-size:12.5px;color:var(--text-2);margin-top:8px;">Чтобы изменить состав уже утверждённого мероприятия, откройте его ниже и запустите приказ на внесение изменений.</div>
      </div>
      <div class="card"><table>
        <thead><tr><th>Наименование</th><th style="width:170px;">Тип аудита</th><th style="width:150px;">Срок</th><th style="width:90px;">Объектов</th><th style="width:220px;">Контекст</th></tr></thead>
        <tbody>${engagements.map((e,i)=>`
          <tr class="row" onclick="openGroupDetail('engagement', ${i})"><td>${e.name}</td><td style="color:var(--text-2);">${e.type}</td><td style="color:var(--text-2);">${e.quarter}</td><td>${e.count}</td><td style="color:var(--text-2);">${e.context}</td></tr>`).join('')}</tbody>
      </table></div>`;
  } else {
    const approved = semiAnnualLists.map((l,i)=>({l,i})).filter(x=>x.l.status==='sent');
    el.innerHTML = `
      <div class="section-title" style="margin-top:0;">Направленные в КПСиСУ (${approved.length})</div>
      <div class="card"><table>
        <thead><tr><th>Список</th><th style="width:130px;">Год</th><th style="width:90px;">Объектов</th><th style="width:190px;">Статус</th></tr></thead>
        <tbody>${approved.length ? approved.map(({l,i})=>`
          <tr class="row" onclick="openGroupDetail('semiannual', ${i})"><td>${l.name}</td><td style="color:var(--text-2);">${l.year}</td><td>${l.count}</td><td><span class="badge sent">Направлен в КПСиСУ</span></td></tr>`).join('') :
          `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">Пока нет направленных списков</td></tr>`}</tbody>
      </table></div>`;
  }
}
function setCriteriaContour(c){
  document.getElementById('crit-toolbar-b').style.display = c==='b' ? 'flex' : 'none';
  document.getElementById('crit-toolbar-a').style.display = c==='a' ? 'flex' : 'none';
  document.getElementById('crit-formula-b').style.display = c==='b' ? 'block' : 'none';
  document.getElementById('crit-table-b').style.display = c==='b' ? 'block' : 'none';
  document.getElementById('crit-formula-a').style.display = c==='a' ? 'block' : 'none';
  document.getElementById('crit-checktype-switch').style.display = c==='a' ? 'flex' : 'none';
  document.getElementById('crit-table-a').style.display = c==='a' ? 'block' : 'none';
  if(c==='a'){ critChecktypeMode = 'visit'; document.getElementById('crit-ct-visit').classList.add('active'); document.getElementById('crit-ct-compliance').classList.remove('active'); }
  document.getElementById('crit-crumb').textContent = c==='b' ? 'СУР ЭВГА / Реестр критериев' : 'СУР Проф.контроль / Реестр критериев';
  document.getElementById('crit-title').textContent = c==='b' ? 'Реестр критериев — ЭВГА' : 'Реестр критериев — профилактический контроль';
  document.getElementById('crit-pill').textContent = c==='b' ? 'ЭВГА' : 'Проф. контроль';
  document.getElementById('crit-desc').textContent = c==='b'
    ? 'Справочник критериев государственного аудита (ЭВГА/СВА) — код индикатора, категория объекта, логика скоринга. Версионируется; изменение веса или порога создаёт новую версию критерия (ФТ-2).'
    : 'Справочник критериев профилактического контроля — по трём категориям субъектов рынка и по видам проверки (у аудиторских организаций веса различаются для профконтроля с посещением и для проверки на соответствие требованиям). Формула SP — выше, отдельно от весовой таблицы.';
}
function renderCriteriaB(){
  const q = (document.getElementById('crit-search-b').value || '').trim().toLowerCase();
  const rows = criteriaB_registry.filter(r => !q || r[0].toLowerCase().includes(q) || r[1].toLowerCase().includes(q));
  document.getElementById('criteria-b-body').innerHTML = rows.length ? rows.map(r=>{
    let badgeCls = 'low', badgeText = r[5];
    if(r[5].includes('резерв') || r[5].includes('Предложение')) badgeCls = 'mid';
    else if(r[5].includes('Не подтверждено')) badgeCls = 'high';
    return `
    <tr>
      <td class="mono" style="font-size:11.5px;">${r[0]}</td>
      <td>${r[1]}</td>
      <td style="color:var(--text-2);">${r[2]}</td>
      <td style="color:var(--text-2);">${r[3]}</td>
      <td style="color:var(--text-2);font-size:12.5px;">${r[4]}</td>
      <td><span class="badge ${badgeCls}">${badgeText}</span></td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px;">Ничего не найдено</td></tr>`;
}
let critChecktypeMode = 'visit'; // 'visit' | 'compliance' — только для реестра критериев проф.контроля
function setCritChecktype(mode){
  critChecktypeMode = mode;
  document.getElementById('crit-ct-visit').classList.toggle('active', mode==='visit');
  document.getElementById('crit-ct-compliance').classList.toggle('active', mode==='compliance');
  renderCriteriaA();
}
function toggleCritFormulaA(){
  const body = document.getElementById('crit-formula-a-body');
  const chevron = document.getElementById('crit-formula-a-chevron');
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
function toggleCritFormulaB(){
  const body = document.getElementById('crit-formula-b-body');
  const chevron = document.getElementById('crit-formula-b-chevron');
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  chevron.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}
function renderCriteriaA(){
  const q = (document.getElementById('crit-search-a').value || '').trim().toLowerCase();
  const wantedCheckType = critChecktypeMode === 'visit' ? 'Профилактический контроль с посещением' : 'Проверка на соответствие требованиям';
  let html = '';
  let any = false;
  criteriaA_registry.filter(group => group.checkType === wantedCheckType).forEach(group=>{
    const items = group.items.filter(it => !q || it[0].toLowerCase().includes(q) || it[1].toLowerCase().includes(q));
    if(items.length === 0) return;
    any = true;
    const numericWi = group.items.filter(it => !isNaN(parseInt(it[2])));
    const sumWi = numericWi.reduce((s,it)=> s + parseInt(it[2]), 0);
    const sumLabel = numericWi.length > 0 ? ` <span style="font-weight:400;color:var(--text-muted);">(Σwi=${sumWi})</span>` : '';
    html += `<tr style="background:var(--surface-alt);"><td colspan="4" style="font-weight:600;font-size:12.5px;padding-top:14px;">${group.category}${sumLabel}</td></tr>`;
    items.forEach((it)=>{
      html += `<tr>
        <td class="mono" style="color:var(--text-muted);font-size:12px;">${it[0]}</td>
        <td>${it[1]}</td>
        <td style="color:var(--text-2);">${it[2]}</td>
        <td style="color:var(--text-2);font-size:12.5px;">${it[3]}</td>
      </tr>`;
    });
  });
  document.getElementById('criteria-a-body').innerHTML = any ? html : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">Ничего не найдено</td></tr>`;
}
function renderHistory(){
  document.getElementById('history-crumb').textContent = currentContour==='b' ? 'СУР ЭВГА / История расчётов' : 'СУР Проф.контроль / История расчётов';
  const prefix = currentContour==='b' ? 'ЭВГА' : 'Проф. контроль';
  const rows = historyLog.filter(r => r[1].startsWith(prefix));
  document.getElementById('history-body').innerHTML = rows.map(r=>`
    <tr>
      <td class="mono" style="font-size:12px;">${r[0]}</td>
      <td>${r[1]}</td>
      <td style="color:var(--text-2);">${r[2]}</td>
      <td style="text-align:right;">${r[3]}</td>
      <td>${r[4]==='ok' ? '<span class="badge low">Завершён</span>' : '<span class="badge high">Ошибка</span>'}</td>
      <td style="color:var(--text-2);">${r[5]}</td>
    </tr>`).join('');
}

function renderIntegrations(){
  document.getElementById('integrations-crumb').textContent = currentContour==='b' ? 'СУР ЭВГА / Источники данных' : 'СУР Проф.контроль / Источники данных';
  document.getElementById('integrations-desc').textContent = currentContour==='b'
    ? 'Системы, из которых модуль СУР забирает исходные данные для расчёта по направлению ЭВГА (конвейер ETL Stage 1). Нажмите на систему, чтобы увидеть, какие именно таблицы и поля используются.'
    : 'Системы, из которых модуль СУР забирает исходные данные для расчёта по направлению профилактического контроля (интеграция с dfo.kz). Нажмите на систему, чтобы увидеть, какие именно таблицы и поля используются.';
  const scopeWanted = currentContour==='b' ? 'ЭВГА' : 'Проф. контроль';
  const filtered = integrations.filter(it => it.scope === scopeWanted);
  document.getElementById('integrations-list').innerHTML = filtered.map((it,i)=>{
    const idx = integrations.indexOf(it);
    const open = openIntegrations.has(idx);
    return `
    <div class="card" style="padding:14px 18px;">
      <div style="display:flex;align-items:center;gap:12px;cursor:pointer;" onclick="toggleIntegration(${idx})">
        <i class="ti ${it.icon}" style="font-size:20px;color:var(--accent);flex-shrink:0;"></i>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:500;font-size:14px;">${it.name} <span class="badge neutral" style="margin-left:4px;">${it.scope}</span></div>
          <div style="font-size:12.5px;color:var(--text-2);margin-top:2px;">${it.desc}</div>
        </div>
        <span class="badge ${integStatusBadge[it.status]}" style="white-space:nowrap;">${it.statusLabel}</span>
        <i class="ti ${open?'ti-chevron-up':'ti-chevron-down'}" style="color:var(--text-muted);flex-shrink:0;"></i>
      </div>
      ${open ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Таблицы / поля, которые использует СУР:</div>
        ${it.tables.map(t=>`<div class="crit-row"><span class="crit-name mono" style="font-size:12.5px;">${t}</span></div>`).join('')}
      </div>` : ''}
    </div>`;
  }).join('');
}
function toggleIntegration(i){
  if(openIntegrations.has(i)) openIntegrations.delete(i); else openIntegrations.add(i);
  renderIntegrations();
}

/* ---------- интеграция с dfo.kz (контур А) ---------- */
function renderDfoStatus(){
  document.getElementById('dfo-status-line').textContent = 'Последний импорт: ' + dfoImport.date;
  document.getElementById('dfo-meta-line').textContent = `Пакет ${dfoImport.package} · ${dfoImport.count} отчётов · контрольная сумма ${dfoImport.checksum}`;
}
function importDfo(){
  if(dfoImporting) return;
  dfoImporting = true;
  const btn = document.getElementById('dfo-import-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i>Импортируем…';
  document.getElementById('dfo-import-note').style.display = 'none';
  setTimeout(() => {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const numMatch = dfoImport.package.match(/(\d+)$/);
    const nextNum = numMatch ? String(Number(numMatch[1])+1).padStart(4,'0') : '0001';
    const newChecksum = Math.random().toString(16).slice(2,10).toUpperCase();
    const newCount = 90 + Math.floor(Math.random()*15);
    dfoImport = { package: `DFO-RISK-2026-H1-${nextNum}`, date: dateStr, checksum: newChecksum, count: newCount };
    uploadedDfoPackage = null; // возврат к демонстрационному пакету — ранее загруженный вручную файл больше не используется расчётом
    uploadedVkkScores = null; // оценки ВКК относились к предыдущему пакету — сбрасываются вместе с ним
    document.getElementById('dfo-manual-note').style.display = 'none';
    renderDfoStatus();
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-download"></i>Импортировать новый пакет';
    dfoImporting = false;
    const note = document.getElementById('dfo-import-note');
    note.style.display = 'block';
    note.innerHTML = `<strong>Пакет ${dfoImport.package} импортирован.</strong> Получено ${dfoImport.count} отчётов о субъектах контроля. Контрольная сумма проверена, расхождений не найдено. Для пересчёта риска запустите «Проверить кандидатов» — расчёт SC/SP/R обновит перечень.`;
    historyLog.unshift([dateStr, 'Проф. контроль — импорт dfo.kz', 'Автоматически (интеграция)', String(dfoImport.count), 'ok', '—']);
  }, 900);
}
function renderCalcStatus(){
  document.getElementById('calc-status-line').textContent = `Последний расчёт: ${lastCalc.date} · обработано ${lastCalc.count} субъектов`;
}
/* ===== Ручная загрузка пакета dfo.kz — имитация интеграции по реальному файлу ===== */
const BIZCAT_MAP = {'Крупный':'Крупное предпринимательство','Средний':'Среднее предпринимательство','Малый':'Малое предпринимательство','Микро':'Микропредпринимательство'};
const DFO_GROUP_TO_KIND = {'АО':'Аудиторская организация','ПАО':'Проф. аудиторская организация','ОПИ':'Организация публичного интереса','ПОБ':'Проф. организация бухгалтеров','ОПСБ':'Организация по сертификации бухгалтеров','ПО':'Палата оценщиков'};
const CATEGORY_TO_AUDITTYPE = {'АО':'Аудиторские организации','ПАО':'Профессиональные аудиторские организации','ПО':'Палаты оценщиков','ОПИ':'Организации публичного интереса','ПОБ':'Проф. организации бухгалтеров','ОПСБ':'Организации по сертификации бухгалтеров'};
const DFO_REPORT_CRITERIA = {
  'AO_6A':  {name:'Непредоставление/несвоевременное предоставление отчёта о соответствии квалификационным требованиям', wi:15},
  'AO_4A':  {name:'Непредоставление/несвоевременное предоставление отчёта по основным показателям деятельности', wi:15},
  'AO_7A':  {name:'Непредоставление/несвоевременное предоставление информации по страхованию гражданско-правовой ответственности', wi:15},
  'PAO_1A': {name:'Несвоевременное/недостоверное предоставление полугодового отчёта о деятельности', wi:25},
  'PAO_2A': {name:'Несвоевременное/недостоверное предоставление годового отчёта о курсах повышения квалификации', wi:25},
  'PAO_3A': {name:'Несвоевременное/недостоверное предоставление ежеквартального отчёта о соответствии минимальным требованиям', wi:25},
  'PAO_5A': {name:'Несвоевременное/недостоверное предоставление ежеквартального отчёта о внешнем контроле качества', wi:25},
  'OPI_1B':     {name:'Представление финансовой отчётности (Баланс) с нарушением срока либо непредставление', wi:100, autoHigh:true},
  'OPI_2OPU':   {name:'Представление отчёта о прибылях и убытках с нарушением срока либо непредставление', wi:100, autoHigh:true},
  'OPI_3DDS_P': {name:'Представление отчёта о движении денежных средств (прямой метод) с нарушением срока либо непредставление', wi:100, autoHigh:true},
  'OPI_4DDS_K': {name:'Представление отчёта о движении денежных средств (косвенный метод) с нарушением срока либо непредставление', wi:100, autoHigh:true},
  'OPI_5IK':    {name:'Представление отчёта об изменениях в капитале с нарушением срока либо непредставление', wi:100, autoHigh:true},
  'POB_1CHL':  {name:'Непредставление отчёта о количестве бухгалтеров/организаций, вступивших/выбывших', wi:20},
  'POB_F2PK':  {name:'Непредставление отчёта о повышении квалификации членов', wi:20},
  'POB_F3MS':  {name:'Непредставление отчёта о сотрудничестве с международными организациями', wi:20},
  'POB_F4RO':  {name:'Непредставление отчёта об изменении структуры рабочих органов', wi:20},
  'OPSB_F5SERT': {name:'Непредставление отчёта о выданных сертификатах', wi:15},
  'OPSB_F6EK':   {name:'Непредставление отчёта о проведённых экзаменах', wi:15},
  'PO_1CHL': {name:'Несвоевременное предоставление/непредставление/недостоверность информации о деятельности палаты', wi:100, autoHigh:true},
};

function handleManualDfoUpload(event){
  const file = event.target.files[0];
  if(!file) return;
  const btn = document.getElementById('dfo-manual-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i>Читаем файл…';
  const finish = () => {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-upload"></i>Загрузить файл dfo.kz';
    event.target.value = '';
  };
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const wb = XLSX.read(e.target.result, {type:'array'});
      processDfoWorkbook(wb);
    } catch(err) {
      showDfoManualNote('Не удалось прочитать файл: ' + err.message, true);
    } finally { finish(); }
  };
  reader.onerror = function(){ showDfoManualNote('Ошибка чтения файла', true); finish(); };
  reader.readAsArrayBuffer(file);
}

function showDfoManualNote(html, isError){
  const note = document.getElementById('dfo-manual-note');
  note.style.display = 'block';
  note.style.borderLeftColor = isError ? '#b91c1c' : '';
  note.innerHTML = isError ? `<strong>Ошибка.</strong> ${html}` : html;
}

function parseDateVal(v){
  if(!v) return null;
  if(typeof v === 'number'){
    const d = XLSX.SSF.parse_date_code(v);
    return d ? new Date(Date.UTC(d.y, d.m-1, d.d)) : null;
  }
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function formatRegDate(v){
  const d = parseDateVal(v);
  if(!d) return null;
  const pad = n => String(n).padStart(2,'0');
  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`;
}

let uploadedDfoPackage = null; // {subjects, reportsBySubject, period, snapshot, reportsCount} — заполняется загрузкой, читается расчётом

function processDfoWorkbook(wb){
  const sheetSummary = wb.Sheets['Сводка'];
  const sheetSubjects = wb.Sheets['Субъекты'];
  const sheetReports = wb.Sheets['Отчеты'];
  if(!sheetSubjects || !sheetReports){
    showDfoManualNote('В файле не найдены листы «Субъекты» и/или «Отчеты» — ожидается выгрузка dfo.kz установленного формата.', true);
    return;
  }

  let period = '—', snapshot = '—';
  if(sheetSummary){
    XLSX.utils.sheet_to_json(sheetSummary, {header:1, defval:null}).forEach(r=>{
      if(r[0]==='Период') period = r[1];
      if(r[0]==='Снимок данных') snapshot = r[1];
    });
  }

  const subjects = XLSX.utils.sheet_to_json(sheetSubjects, {defval:null});
  const reports = XLSX.utils.sheet_to_json(sheetReports, {defval:null});

  const reportsBySubject = {};
  reports.forEach(r=>{
    if(!r.subject_id) return;
    (reportsBySubject[r.subject_id] = reportsBySubject[r.subject_id] || []).push(r);
  });

  // Импорт: только чтение и сохранение пакета — расчёт СЮДА не входит (раздел 2.1 постановки задачи)
  uploadedDfoPackage = { subjects, reportsBySubject, period, snapshot, reportsCount: reports.length };

  dfoImport = { package: `DFO-MANUAL-${String(snapshot).replace(/-/g,'')}`, date: `${snapshot} (снимок, загружено вручную)`, checksum: '—', count: reports.length };
  renderDfoStatus();

  showDfoManualNote(`<strong>Пакет прочитан.</strong> ${subjects.length} субъектов, ${reports.length} отчётов (период: ${period}). Данные ещё не рассчитаны — нажмите «Проверить кандидатов», чтобы выполнить расчёт SC/SP/R по этому пакету.`, false);

  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  historyLog.unshift([dateStr, 'Проф. контроль — ручная загрузка пакета', 'Инспектор проф.контроля', String(subjects.length), 'ok', '—']);
}

// Расчёт SC/SP/R по загруженному вручную пакету — вызывается из «Проверить кандидатов» (раздел 2.2-2.5 постановки задачи)
function computeDfoCandidates(pkg){
  const { subjects, reportsBySubject, period } = pkg;
  const computed = [];

  subjects.forEach(subj=>{
    const subjReports = reportsBySubject[subj.subject_id] || [];
    let sc = 0, direct = false, autoHigh = false;
    const critList = [];

    subjReports.forEach(rep=>{
      const meta = DFO_REPORT_CRITERIA[rep.report_code];
      if(!meta) return;
      const status = rep.report_status;
      let triggered = false, note = '';

      if(status === 'MISSING'){
        triggered = true; note = 'отчёт не представлен';
      } else if(status === 'SUBMITTED_LATE'){
        triggered = true; note = `представлен позже срока (${rep.due_at||'—'} → ${rep.submitted_at||'—'})`;
      } else {
        const due = parseDateVal(rep.due_at), sub = parseDateVal(rep.submitted_at);
        if(due && sub && sub.getTime() > due.getTime()){ triggered = true; note = `представлен позже срока (${rep.due_at} → ${rep.submitted_at})`; }
      }
      if(triggered){
        if(meta.direct) direct = true;
        else if(meta.autoHigh) autoHigh = true;
        else sc += meta.wi;
        critList.push([rep.form_index || rep.report_code, meta.name, meta.direct ? 'прямое основание' : meta.autoHigh ? 'включение в перечень' : ('wi='+meta.wi), note, null]);
      }

      // «глубокая» проверка содержимого конкретных форм
      if(rep.report_code === 'AO_7A' && status !== 'MISSING' && rep.payload_json){
        try {
          const payload = JSON.parse(rep.payload_json);
          const policy = payload['Страхование ответственности'] && payload['Страхование ответственности']['4'];
          if(!policy){
            sc += 10;
            critList.push(['АО П-5', 'Отсутствие договора страхования гражданско-правовой ответственности', 'wi=10', 'в отчёте №7-А не указан номер полиса', null]);
          }
        } catch(e){}
      }
      // ОПИ: показатели финансовой отчётности (значения внутри payload, не факт подачи)
      if(rep.report_code === 'OPI_2OPU' && status !== 'MISSING' && rep.payload_json){
        try {
          const p = JSON.parse(rep.payload_json)['Показатели'] || {};
          if(p['300'] && typeof p['300'].current === 'number' && p['300'].current < 0){
            autoHigh = true;
            critList.push(['ОПИ П-6', 'Отрицательный (убыточный) финансовый результат', 'включение в перечень', `прибыль (стр.300) №2-ОПУ: ${p['300'].current.toLocaleString('ru-RU')}`, null]);
          }
          if(p['10'] && typeof p['10'].current === 'number' && typeof p['10'].previous === 'number' && p['10'].previous > 0){
            const pct = (p['10'].previous - p['10'].current) / p['10'].previous * 100;
            if(pct >= 50){
              autoHigh = true;
              critList.push(['ОПИ П-7', 'Снижение совокупного годового дохода на ≥50% к предыдущему периоду', 'включение в перечень', `доход (стр.10) №2-ОПУ: ${p['10'].previous.toLocaleString('ru-RU')} → ${p['10'].current.toLocaleString('ru-RU')} (−${pct.toFixed(1)}%)`, null]);
            }
          }
        } catch(e){}
      }
      if(rep.report_code === 'OPI_1B' && status !== 'MISSING' && rep.payload_json){
        try {
          const p = JSON.parse(rep.payload_json)['Показатели'] || {};
          if(p['214'] && p['314']){
            const cur = (p['214'].current||0) + (p['314'].current||0);
            const prev = (p['214'].previous||0) + (p['314'].previous||0);
            if(prev > 0){
              const pct = (cur - prev) / prev * 100;
              if(pct >= 50){
                autoHigh = true;
                critList.push(['ОПИ П-8', 'Рост кредиторской задолженности на ≥50% к предыдущему периоду', 'включение в перечень', `кредиторская задолженность (стр.214+314) №1-Б: ${prev.toLocaleString('ru-RU')} → ${cur.toLocaleString('ru-RU')} (+${pct.toFixed(1)}%)`, null]);
              }
            }
          }
        } catch(e){}
      }
    });

    sc = Math.min(sc, 100);
    const score = direct ? 100 : autoHigh ? 100 : sc;
    const risk = direct ? 'direct' : (score >= 71 ? 'high' : (score >= 31 ? 'mid' : 'low'));

    computed.push({
      name: subj.subject_name, kind: DFO_GROUP_TO_KIND[subj.subject_type] || subj.subject_type,
      category: subj.subject_type, score, risk,
      year: (String(period).match(/\d{4}/)||[])[0] || String(CURRENT_YEAR),
      auditType: CATEGORY_TO_AUDITTYPE[subj.subject_type] || subj.subject_type, checkType: 'Профконтроль с посещением',
      sp: 0, sc,
      objRisk: direct ? 'Высокий — прямое основание (по данным загруженного пакета)' : autoHigh ? 'Высокий — сработал критерий с прямым включением в перечень (по данным загруженного пакета)' : (score>=71 ? 'Высокий' : score>=31 ? 'Средний' : 'Низкий') + ' — расчёт по загруженному пакету dfo.kz',
      bin: String(subj.BIN || ''), status: subj.status === 'ACTIVE' ? 'Действующий' : (subj.status || 'Действующий'),
      region: subj.region || '—', lastAudit: {date:'—', type:'—'},
      regDate: formatRegDate(subj.registration_date),
      bizCategory: BIZCAT_MAP[subj.business_category] || (subj.business_category || '—'),
      crit: critList,
    });
  });

  return computed;
}

/* ===== Оценки внешнего контроля качества (Профессиональный совет) — отдельный источник, не dfo.kz ===== */
function handleVkkUpload(event){
  const file = event.target.files[0];
  if(!file) return;
  const btn = document.getElementById('vkk-manual-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i>Читаем файл…';
  const finish = () => {
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-upload"></i>Загрузить файл оценок';
    event.target.value = '';
  };
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const wb = XLSX.read(e.target.result, {type:'array'});
      processVkkWorkbook(wb);
    } catch(err) {
      showVkkNote('Не удалось прочитать файл: ' + err.message, true);
    } finally { finish(); }
  };
  reader.onerror = function(){ showVkkNote('Ошибка чтения файла', true); finish(); };
  reader.readAsArrayBuffer(file);
}

function showVkkNote(html, isError){
  const note = document.getElementById('vkk-note');
  note.style.display = 'block';
  note.style.borderLeftColor = isError ? '#b91c1c' : '';
  note.innerHTML = isError ? `<strong>Ошибка.</strong> ${html}` : html;
}

let uploadedVkkScores = null; // [{bin, score, name}] — сохраняется, чтобы не терялось при пересчёте по пакету dfo.kz

function processVkkWorkbook(wb){
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if(!sheet){
    showVkkNote('В файле не найдено ни одного листа с данными.', true);
    return;
  }
  const rows = XLSX.utils.sheet_to_json(sheet, {defval:null});
  if(!rows.length){
    showVkkNote('Файл прочитан, но не содержит строк с данными.', true);
    return;
  }

  const getBin = r => String(r['БИН'] ?? r['bin'] ?? r['БИН субъекта'] ?? '').trim();
  const getScore = r => parseFloat(r['Оценка'] ?? r['оценка'] ?? r['Балл'] ?? r['score']);
  const getName = r => r['Наименование'] ?? r['Наименование субъекта'] ?? r['name'] ?? null;

  uploadedVkkScores = rows
    .map(r => ({ bin: getBin(r), score: getScore(r), name: getName(r) }))
    .filter(r => r.bin && !isNaN(r.score));

  const result = applyVkkScores();

  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  let msg = `<strong>Файл оценок обработан.</strong> Строк в файле: ${rows.length}. Сопоставлено с текущим перечнем по БИН: ${result.matched}. `;
  if(result.flagged > 0) msg += `Включено в перечень по критерию «Оценка ниже «4»»: <strong>${result.flagged}</strong>. `;
  if(result.alreadyLow > 0) msg += `Уже были отмечены этим критерием ранее: ${result.alreadyLow}. `;
  if(result.notFound > 0){
    const inPackageButHidden = uploadedDfoPackage ? result.notFoundNames.filter(n => uploadedDfoPackage.subjects.some(s => (n===s.subject_name) || (n===s.BIN))) : [];
    if(inPackageButHidden.length > 0){
      msg += `Не показаны сейчас в перечне (пока не входят в число объектов высокого риска): ${inPackageButHidden.length} — нажмите «Проверить кандидатов», чтобы применить оценку и, при необходимости, включить их в перечень. `;
    }
    const trulyNotFound = result.notFound - inPackageButHidden.length;
    if(trulyNotFound > 0) msg += `Не найдено ни в перечне, ни в загруженном пакете dfo.kz: ${trulyNotFound}.`;
  } else {
    msg += ` Оценки сохранены и будут применены заново, если вы запустите «Проверить кандидатов» повторно.`;
  }
  showVkkNote(msg, false);

  historyLog.unshift([dateStr, 'Проф. контроль — загрузка оценок ВКК (Профсовет)', 'Инспектор проф.контроля', String(result.matched), 'ok', '—']);
}

// Применяет уже загруженные (сохранённые) оценки ВКК к текущему dataA.
// Вызывается и сразу после загрузки файла, и повторно после каждого пересчёта по пакету dfo.kz —
// иначе «Проверить кандидатов» стирает эффект загруженных оценок, пересчитывая dataA с нуля.
function applyVkkScores(){
  const result = { matched:0, flagged:0, notFound:0, alreadyLow:0, notFoundNames:[] };
  if(!uploadedVkkScores) return result;

  uploadedVkkScores.forEach(({bin, score, name})=>{
    const subj = dataA.find(o => o.bin === bin);
    if(!subj){
      result.notFound++;
      result.notFoundNames.push(name || bin);
      return;
    }
    result.matched++;
    if(score < 4){
      const already = subj.crit.some(c => c[0] === 'ОПИ П-4');
      if(already){ result.alreadyLow++; return; }
      result.flagged++;
      subj.crit.push(['ОПИ П-4', 'Оценка ниже «4» по результатам внешнего контроля качества аудиторского отчёта', 'включение в перечень',
        `оценка Профсовета: ${score} из 5`, null]);
      subj.sc = Math.min(100, subj.sc);
      subj.score = 100;
      if(subj.risk !== 'direct') subj.risk = 'high';
      subj.objRisk = 'Высокий — сработал критерий с прямым включением в перечень (оценка Профсовета по аудиторской деятельности)';
    }
  });

  renderFilterOptions(); renderKpis(); renderTableHead(); applyFilters();
  return result;
}

function runCandidateCheck(){
  if(calculating) return;
  calculating = true;
  const btn = document.getElementById('calc-run-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i>Считаем…';
  document.getElementById('dfo-import-note').style.display = 'none';
  setTimeout(() => {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    if(uploadedDfoPackage){
      const computed = computeDfoCandidates(uploadedDfoPackage);
      // сначала кладём в dataA весь пересчитанный список (до фильтра по риску) — чтобы оценки ВКК
      // могли сопоставиться по БИН и, при необходимости, поднять субъекта в категорию «Высокий»
      // ДО того, как список отфильтруется — иначе поднятый субъект не попадёт в перечень
      dataA.length = 0;
      computed.forEach(o=>dataA.push(o));
      applyVkkScores();

      const filtered = dataA.filter(o=>o.risk==='high' || o.risk==='direct').sort((a,b)=> b.score - a.score);
      dataA.length = 0;
      filtered.forEach(o=>dataA.push(o));
      sentToModule = {};
      selectedIndices.clear();
      document.getElementById('dfo-manual-note').style.display = 'none';

      lastCalc = { date: dateStr, count: uploadedDfoPackage.subjects.length };
      renderCalcStatus();
      if(currentContour==='a'){ renderFilterOptions(); renderKpis(); renderTableHead(); applyFilters(); }

      const maxScore = computed.reduce((m,o)=>Math.max(m,o.score), 0);
      const vkkSuffix = uploadedVkkScores ? ' Учтены ранее загруженные оценки внешнего контроля качества (Профсовет).' : '';
      const note = document.getElementById('dfo-import-note');
      note.style.display = 'block';
      if(filtered.length > 0){
        note.innerHTML = `<strong>Расчёт SC/SP/R завершён.</strong> Обработано ${uploadedDfoPackage.subjects.length} субъектов из загруженного пакета. В перечень включены объекты с высоким уровнем риска либо прямым основанием: <strong>${filtered.length}</strong>.${vkkSuffix}`;
      } else {
        note.innerHTML = `<strong>Расчёт SC/SP/R завершён.</strong> Обработано ${uploadedDfoPackage.subjects.length} субъектов из загруженного пакета. Объектов с высоким уровнем риска либо прямым основанием не найдено — максимальный балл по пакету составил <strong>${maxScore}</strong> из 100 (порог «Высокий» — от 71). Перечень пуст: это не ошибка расчёта, а фактический результат по данным пакета.${vkkSuffix}`;
      }
      historyLog.unshift([dateStr, 'Проф. контроль — Проверить кандидатов (загруженный пакет)', 'Инспектор проф.контроля', String(uploadedDfoPackage.subjects.length), 'ok', '~45 с']);
    } else {
      lastCalc = { date: dateStr, count: dataA.length };
      renderCalcStatus();
      const note = document.getElementById('dfo-import-note');
      note.style.display = 'block';
      note.innerHTML = `<strong>Расчёт SC/SP/R завершён.</strong> Обработано ${dataA.length} субъектов. Перечень актуализирован по состоянию на ${dateStr}.`;
      historyLog.unshift([dateStr, 'Проф. контроль — Проверить кандидатов', 'Инспектор проф.контроля', String(dataA.length), 'ok', '~45 с']);
      renderTable(); renderCards();
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-refresh"></i>Проверить кандидатов';
    calculating = false;
  }, 900);
}
function renderEvgaCalcStatus(){
  document.getElementById('evga-calc-status-line').textContent = `Последний расчёт: ${lastCalcEvga.date}${lastCalcEvga.count ? ' · обработано '+lastCalcEvga.count+' объектов' : ''}`;
}
function pluralObjects(n){
  const mod10 = n % 10, mod100 = n % 100;
  if(mod10===1 && mod100!==11) return n+' объект';
  if(mod10>=2 && mod10<=4 && (mod100<10 || mod100>=20)) return n+' объекта';
  return n+' объектов';
}
function renderNotCalculated(){
  const panel = document.getElementById('not-calculated-panel');
  const body = document.getElementById('not-calculated-body');
  document.getElementById('not-calculated-count').textContent = pluralObjects(notCalculatedList.length);
  body.innerHTML = notCalculatedList.map(r=>`<tr><td>${r.object}</td><td><code class="mono">${r.indicator}</code> — ${r.indicatorName}</td><td>${r.missing}</td></tr>`).join('');
  panel.style.display = (currentContour==='b' && notCalculatedList.length>0) ? 'block' : 'none';
}
/* ===== RI-GU-AUDIT-01 — длительное отсутствие аудита =====
   Реальный расчёт по полю lastInspection.date каждого объекта — не статичные примеры.
   Пересчитывается заново при каждом запуске «Запустить оценку рисков», как и должно быть. */
function computeAuditGapForObject(o){
  if(!o.lastInspection) return null;
  let years;
  if(o.lastInspection.date === '—' || !o.lastInspection.date){
    years = Infinity;
  } else {
    const [d, mo, y] = o.lastInspection.date.split('.').map(Number);
    const last = new Date(Date.UTC(y, mo - 1, d));
    const now = new Date(Date.UTC(CURRENT_YEAR, 7, 28));
    years = (now - last) / (365.25 * 24 * 3600 * 1000);
  }
  if(years < 5) return null;

  const high = years > 10;
  const yearsLabel = years === Infinity ? 'аудит не проводился' : `${years.toFixed(1)} лет с последней проверки`;
  return {
    high,
    points: high ? 15 : 6,
    critEntry: {
      code: 'RI-GU-AUDIT-01',
      name: 'Длительное отсутствие аудиторских мероприятий',
      value: yearsLabel,
      note: high ? 'высокий риск' : 'средний риск',
      points: high ? 5 : 2,
      yearly: high ? [5,5,5] : [2,2,2],
      source: {
        system: 'CRAMS', doc: 'Реестр аудиторских мероприятий по объекту',
        field: 'Дата последней проверки — сравнение с текущей датой',
        period: o.year,
        excerpt: years === Infinity
          ? 'Записей о проведении аудиторских мероприятий по объекту не найдено'
          : `Последнее аудиторское мероприятие проведено ${o.lastInspection.date} — ${high ? 'свыше 10 лет назад' : 'свыше 5, но менее 10 лет назад'}`,
      },
    },
  };
}
function applyAuditGapProposal(){
  let affected = 0;
  dataEVGA.forEach(o=>{
    const already = o.crit.some(c => c.code === 'RI-GU-AUDIT-01');
    if(already) return; // не накапливаем повторно при повторном запуске
    const result = computeAuditGapForObject(o);
    if(!result) return;
    affected++;
    o.crit.push(result.critEntry);
    o.score += result.points;
    o.yearScores = o.yearScores.map((v,i) => v + result.critEntry.yearly[i]);
    if(result.high) o.risk = 'high';
    else if(o.risk === 'low') o.risk = 'mid';
  });
  return affected;
}

/* ===== RI-GU-AUDIT-03 — сверка с лицевым счётом Салык.кз =====
   Реальное сравнение: поле salykCheck.reportedDebt (по данным отчётности объекта) против salykCheck.salykRecord
   (гипотетические данные лицевого счёта — источник не подключён, см. «Источники данных»). */
function computeSalykCheckForObject(o){
  if(!o.salykCheck) return null;
  const { reportedDebt, salykRecord, debtType } = o.salykCheck;
  const diffPct = Math.abs(salykRecord - reportedDebt) / reportedDebt * 100;
  if(diffPct < 10) return null; // расхождение в пределах погрешности — не считается несоответствием
  return {
    points: 6,
    critEntry: {
      code: 'RI-GU-AUDIT-03',
      name: 'Несоответствие данных отчётности лицевому счёту «Салык.кз»',
      value: `расхождение ${diffPct.toFixed(0)}%`,
      note: 'средний риск',
      points: 2,
      yearly: [2,2,2],
      source: {
        system: 'Салык.кз (предложение — источник не подключён)', doc: 'Лицевой счёт налогоплательщика',
        field: debtType,
        period: o.year,
        excerpt: `По данным бухгалтерской отчётности объекта: ${reportedDebt.toFixed(1)} млн тенге · по лицевому счёту «Салык.кз»: ${salykRecord.toFixed(1)} млн тенге — расхождение ${diffPct.toFixed(0)}%`,
      },
    },
  };
}
function applySalykCheckProposal(){
  let affected = 0;
  dataEVGA.forEach(o=>{
    const already = o.crit.some(c => c.code === 'RI-GU-AUDIT-03');
    if(already) return;
    const result = computeSalykCheckForObject(o);
    if(!result) return;
    affected++;
    o.crit.push(result.critEntry);
    o.score += result.points;
    o.yearScores = o.yearScores.map((v,i) => v + result.critEntry.yearly[i]);
    if(o.risk === 'low') o.risk = 'mid';
  });
  return affected;
}

/* ===== RI-GU-AUDIT-02 — несоблюдение принципа ротации аудиторов =====
   Реальный расчёт по полю auditHistory объекта — считает повторы одного аудитора подряд. */
function computeRotationForObject(o){
  if(!o.auditHistory || o.auditHistory.length < 3) return null;
  const sorted = [...o.auditHistory].sort((a,b)=>{
    const [d1,m1,y1]=a.date.split('.').map(Number), [d2,m2,y2]=b.date.split('.').map(Number);
    return new Date(y1,m1-1,d1) - new Date(y2,m2-1,d2);
  });
  const lastAuditor = sorted[sorted.length-1].auditor;
  let streak = 0;
  for(let i=sorted.length-1; i>=0; i--){
    if(sorted[i].auditor === lastAuditor) streak++; else break;
  }
  if(streak <= 2) return null;
  return {
    points: 5,
    critEntry: {
      code: 'RI-GU-AUDIT-02',
      name: 'Несоблюдение принципа ротации аудиторов',
      value: `${streak} проверки подряд одним аудитором`,
      note: 'высокий риск',
      points: 3,
      yearly: [1,1,3],
      source: {
        system: 'CRAMS (предложение — расчёт по существующим данным)', doc: 'Реестр аудиторских мероприятий по объекту',
        field: 'ФИО аудитора по каждой проверке объекта, подряд',
        period: o.year,
        excerpt: `${sorted.map(h=>`${h.date}: ${h.auditor}`).join(' · ')} — ${lastAuditor} проверял объект ${streak} раза подряд`,
      },
    },
  };
}
function applyRotationProposal(){
  let affected = 0;
  dataEVGA.forEach(o=>{
    const already = o.crit.some(c => c.code === 'RI-GU-AUDIT-02');
    if(already) return;
    const result = computeRotationForObject(o);
    if(!result) return;
    affected++;
    o.crit.push(result.critEntry);
    o.score += result.points;
    o.yearScores = o.yearScores.map((v,i) => v + result.critEntry.yearly[i]);
    o.risk = 'high';
  });
  return affected;
}

function runEvgaRiskAssessment(){
  if(evgaCalculating) return;
  evgaCalculating = true;
  const startedAt = Date.now();
  const btn = document.getElementById('evga-calc-run-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2"></i>Считаем…';
  document.getElementById('evga-calc-note').style.display = 'none';
  setTimeout(() => {
    const gapAffected = applyAuditGapProposal();
    const salykAffected = applySalykCheckProposal();
    const rotationAffected = applyRotationProposal();
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    notCalculatedList = notCalculatedPool.slice(0, 3);
    lastCalcEvga = { date: dateStr, count: dataEVGA.length + notCalculatedList.length };
    renderEvgaCalcStatus();
    renderNotCalculated();
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-refresh"></i>Запустить оценку рисков';
    evgaCalculating = false;
    const note = document.getElementById('evga-calc-note');
    note.style.display = 'block';
    const okCount = dataEVGA.length;
    note.innerHTML = `<strong>Оценка рисков ЭВГА завершена.</strong> Рассчитано ${okCount} из ${lastCalcEvga.count} объектов. ${notCalculatedList.length>0 ? pluralObjects(notCalculatedList.length)+' не рассчитано из-за недостающих данных по отдельным индикаторам — см. таблицу ниже.' : 'Недостающих данных не обнаружено, все объекты рассчитаны полностью.'} Перечень и уровни риска обновлены.${gapAffected>0 ? ` По индикатору «Длительное отсутствие аудиторских мероприятий» пересчитано ${gapAffected} объектов.` : ''}${salykAffected>0 ? ` По индикатору «Сверка с Салык.кз» пересчитано ${salykAffected} объектов.` : ''}${rotationAffected>0 ? ` По индикатору «Ротация аудиторов» пересчитано ${rotationAffected} объектов.` : ''}`;
    historyLog.unshift([dateStr, 'ЭВГА — оценка рисков (ручной запуск)', 'Аналитик СУР', String(lastCalcEvga.count), 'ok', `${((Date.now() - startedAt) / 1000).toFixed(1)} с`]);
    renderKpis(); renderTable(); renderCards();
    saveSurDemo();
  }, 1100);
}

/* ---------- контур / контекст / режим перечня ---------- */
let checktypeMode = 'visit'; // 'visit' (Профконтроль с посещением) | 'compliance' (Проверка на соответствие требованиям) — только контур А

function selectSurModule(c){
  document.getElementById('mod-sur-evga').classList.toggle('active', c==='b');
  document.getElementById('mod-sur-pk').classList.toggle('active', c==='a');
  showWorkspace('check');
  setContour(c);
}

function setContour(c){
  if(editingGroup){
    const wantContour = editingGroup.type === 'engagement' ? 'b' : 'a';
    if(wantContour !== c){
      editingGroup = null;
      document.getElementById('edit-mode-banner').style.display = 'none';
    }
  }
  currentContour = c;
  selectedIndices.clear();
  document.getElementById('dfo-import-panel').style.display = c==='a' ? 'block' : 'none';
  document.getElementById('row-context').style.display = c==='b' ? 'flex' : 'none';
  document.getElementById('row-checktype-tabs').style.display = c==='a' ? 'flex' : 'none';
  document.getElementById('dfo-import-note').style.display = 'none';
  document.getElementById('evga-calc-panel').style.display = c==='b' ? 'block' : 'none';
  document.getElementById('evga-calc-note').style.display = 'none';
  document.getElementById('not-calculated-panel').style.display = (c==='b' && notCalculatedList.length>0) ? 'block' : 'none';
  document.getElementById('f-checktype').style.display = 'none';
  document.getElementById('f-search').value = '';
  document.getElementById('f-year').value = '';

  if(c === 'b'){
    document.getElementById('crumb').textContent = 'СУР ЭВГА / Проверка';
    document.getElementById('page-title').textContent = 'Перечень объектов';
    setPerechenMode('subjects');
  } else {
    perechenMode = 'subjects';
    checktypeMode = 'visit';
    document.getElementById('btn-mode-subjects').classList.add('active');
    document.getElementById('btn-mode-abp').classList.remove('active');
    document.getElementById('btn-mode-forms').classList.remove('active');
    document.getElementById('btn-checktype-visit').classList.add('active');
    document.getElementById('btn-checktype-compliance').classList.remove('active');
    document.getElementById('subjects-content-wrap').style.display = 'block';
    document.getElementById('forms-panel').style.display = 'none';
    document.getElementById('crumb').textContent = 'СУР Проф.контроль / Проверка';
    document.getElementById('page-title').textContent = '';
    document.getElementById('page-pill').textContent = 'Все субъекты рынка';
    currentData = dataA;
    renderFilterOptions();
    renderKpis();
    renderTableHead();
    applyFilters();
  }
}

function setChecktypeMode(mode){
  checktypeMode = mode;
  selectedIndices.clear();
  document.getElementById('btn-checktype-visit').classList.toggle('active', mode==='visit');
  document.getElementById('btn-checktype-compliance').classList.toggle('active', mode==='compliance');
  renderKpis();
  applyFilters();
}

function setPerechenMode(mode){
  perechenMode = mode;
  selectedIndices.clear();
  document.getElementById('btn-mode-subjects').classList.toggle('active', mode==='subjects');
  document.getElementById('btn-mode-abp').classList.toggle('active', mode==='abp');
  document.getElementById('btn-mode-forms').classList.toggle('active', mode==='forms');
  document.getElementById('f-type').style.display = mode==='abp' ? 'none' : 'inline-block';
  document.getElementById('subjects-content-wrap').style.display = mode==='forms' ? 'none' : 'block';
  document.getElementById('forms-panel').style.display = mode==='forms' ? 'block' : 'none';

  if(mode === 'forms'){
    document.getElementById('page-title').textContent = 'Официальные выходные формы';
    document.getElementById('page-pill').textContent = 'Приложения 2, 3, 5, 6';
    onFormsTypeChange();
    return;
  }
  if(mode === 'subjects'){
    document.getElementById('page-title').textContent = '';
    document.getElementById('page-pill').textContent = 'Государственные учреждения, АБП, квазигоссектор';
    currentData = dataEVGA;
  } else {
    document.getElementById('page-title').textContent = 'Перечень АБП';
    document.getElementById('page-pill').textContent = 'Параллельный расчёт по бюджетным программам';
    currentData = dataABP;
  }
  renderFilterOptions();
  renderKpis();
  renderTableHead();
  applyFilters();
  updateGroupedButton();
}

/* ---------- KPI ---------- */
function renderKpis(){
  let labels, classes, values;
  if(currentContour === 'a'){
    const ctValue = checktypeMode==='visit' ? 'Профконтроль с посещением' : 'Проверка на соответствие требованиям';
    const scoped = dataA.filter(o=>o.checkType === ctValue);
    labels = kpiLabelsA; classes = kpiClsA;
    values = [scoped.length, scoped.filter(o=>o.risk==='high').length, scoped.filter(o=>o.risk==='mid').length, scoped.filter(o=>o.risk==='direct').length];
  } else if(perechenMode === 'abp'){
    labels = kpiLabelsSubjects; classes = kpiClsSubjects;
    values = [dataABP.length, dataABP.filter(o=>o.risk==='high').length, dataABP.filter(o=>o.risk==='mid').length, dataABP.filter(o=>o.risk==='low').length];
  } else {
    labels = kpiLabelsSubjects; classes = kpiClsSubjects;
    values = [dataEVGA.length, dataEVGA.filter(o=>o.risk==='high').length, dataEVGA.filter(o=>o.risk==='mid').length, dataEVGA.filter(o=>o.risk==='low').length];
  }
  document.getElementById('kpi-grid').innerHTML = labels.map((l,i)=>`
    <div class="kpi ${classes[i]}"><div class="lbl">${l}</div><div class="val">${values[i]}</div></div>`).join('');
}

/* ---------- фильтры ---------- */
function renderFilterOptions(){
  const typeSel = document.getElementById('f-type');
  const riskSel = document.getElementById('f-risk');
  const ctSel = document.getElementById('f-checktype');
  if(currentContour === 'b'){
    typeSel.innerHTML = `<option value="">Все типы аудита</option>
      <option>Аудит соответствия</option><option>Аудит финансовой отчётности</option>`;
    riskSel.innerHTML = `<option value="">Все уровни риска</option>
      <option value="high">Высокий</option><option value="mid">Средний</option><option value="low">Низкий</option>`;
  } else {
    typeSel.innerHTML = `<option value="">Все категории субъектов</option>
      <option>Аудиторские организации</option><option>Профессиональные аудиторские организации</option>
      <option>Палаты оценщиков</option><option>Организации публичного интереса</option>
      <option>Проф. организации бухгалтеров</option><option>Организации по сертификации бухгалтеров</option>`;
    riskSel.innerHTML = `<option value="">Все уровни риска</option>
      <option value="high">Высокий</option><option value="mid">Средний</option><option value="direct">Прямое основание</option>`;
    ctSel.innerHTML = `<option value="">Все виды проверки</option>
      <option>Профконтроль с посещением</option><option>Проверка на соответствие требованиям</option>`;
  }
}
function applyFilters(){
  const year = document.getElementById('f-year').value;
  const type = document.getElementById('f-type').value;
  const risk = document.getElementById('f-risk').value;
  const ct = currentContour==='a' ? (checktypeMode==='visit' ? 'Профконтроль с посещением' : 'Проверка на соответствие требованиям') : '';
  const q = document.getElementById('f-search').value.trim().toLowerCase();
  const isABP = currentContour==='b' && perechenMode==='abp';
  visible = currentData.filter(o => {
    const name = isABP ? o.name : o.name;
    return (!year || o.year === year) &&
      (isABP || !type || o.auditType === type) &&
      (!risk || o.risk === risk) &&
      (currentContour!=='a' || !ct || o.checkType === ct) &&
      (!q || name.toLowerCase().includes(q));
  });
  currentPage = 1;
  if(isABP) renderABP(); else { renderTable(); renderCards(); }
  renderPagination();
}
function renderPagination(){
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  if(currentPage > totalPages) currentPage = totalPages;
  const start = visible.length ? (currentPage-1)*PAGE_SIZE + 1 : 0;
  const end = Math.min(visible.length, currentPage*PAGE_SIZE);
  document.getElementById('count-label').textContent = visible.length
    ? `Показано ${start}–${end} из ${visible.length}`
    : `Показано 0 из ${currentData.length}`;

  const el = document.getElementById('pagination');
  if(totalPages <= 1){ el.innerHTML = ''; return; }
  const svgLeft = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"></polyline></svg>';
  const svgRight = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';
  let html = `<div class="icon-btn ${currentPage===1?'disabled':''}" onclick="goToPage(${currentPage-1})" title="Предыдущая страница">${svgLeft}</div>`;
  for(let p=1; p<=totalPages; p++){
    html += `<div class="page-num ${p===currentPage?'active':''}" onclick="goToPage(${p})">${p}</div>`;
  }
  html += `<div class="icon-btn ${currentPage===totalPages?'disabled':''}" onclick="goToPage(${currentPage+1})" title="Следующая страница">${svgRight}</div>`;
  el.innerHTML = html;
}
function goToPage(p){
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  if(p < 1 || p > totalPages) return;
  currentPage = p;
  const isABP = currentContour==='b' && perechenMode==='abp';
  if(isABP) renderABP(); else { renderTable(); renderCards(); }
  renderPagination();
  window.scrollTo(0,0);
}

/* ---------- таблица: заголовки ---------- */
function renderTableHead(){
  const isABP = currentContour==='b' && perechenMode==='abp';
  const canGroup = perechenMode==='subjects';
  const head = document.getElementById('table-head-row');
  if(isABP){
    head.innerHTML = `<th style="width:34px;">№</th><th style="width:70px;">Код АБП</th><th>Наименование АБП</th>
      <th style="width:90px;">ГУ в составе</th><th style="width:70px;">Год</th><th style="width:90px;text-align:right;">Баллы</th><th style="width:150px;">Уровень риска</th><th style="width:40px;"></th>`;
  } else {
    head.innerHTML = (canGroup ? `<th style="width:30px;"><input type="checkbox" id="chk-all" onclick="toggleSelectAll(this.checked)"></th>` : '') +
      `<th style="width:34px;">№</th><th>Наименование объекта</th><th style="width:170px;">${currentContour==='b'?'Вид':'Категория субъекта'}</th>
      <th style="width:70px;">Год</th><th style="width:100px;">Критериев</th>
      <th style="width:90px;text-align:right;">${currentContour==='b'?'Баллы, 3г':'Балл R'}</th><th style="width:150px;">Уровень риска</th><th style="width:40px;"></th>`;
  }
}

function updateGroupedButton(){ /* функция формирования перечня удалена из модуля СУР — заглушка на случай недостижимого старого кода */ }
const CURRENT_YEAR = 2026; // условное «сегодня» демо-прототипа — синхронизировано с датами пакетов dfo.kz и расчётов
function lastAuditYear(o){
  if(!o.lastAudit || o.lastAudit.date === '—') return null;
  const parts = o.lastAudit.date.split('.');
  return parseInt(parts[2], 10);
}
function subjectAgeYears(o){
  if(!o.regDate) return null;
  const parts = o.regDate.split('.');
  if(parts.length !== 3) return null;
  const regDateObj = new Date(Date.UTC(parseInt(parts[2],10), parseInt(parts[1],10)-1, parseInt(parts[0],10)));
  const now = new Date(Date.UTC(CURRENT_YEAR, 7, 28));
  return (now - regDateObj) / (365.25*24*3600*1000);
}
function isEligibleForSend(o){
  if(o.status === 'Ликвидирован' || o.status === 'Недействующий' || o.status === 'Реорганизован') return false; // нельзя направить на аудит организацию, которой нет, которая не работает, либо прекратила существование в результате реорганизации (правопреемник — уже другое юрлицо) — общее правило для обоих направлений
  if(currentContour === 'a'){
    const ly = lastAuditYear(o);
    if(ly !== null && ly === CURRENT_YEAR - 1) return false; // последняя проверка была год назад — в текущем году повторно не проводится
    const age = subjectAgeYears(o);
    if(age !== null && age <= 3) return false; // субъект зарегистрирован не более 3 лет назад — на момент формирования перечня не включается
    return o.risk === 'high' || o.risk === 'direct';
  }
  return true; // ЭВГА — без требования по уровню риска (см. выше — по статусу ограничение общее)
}
/* ---------- рендер: субъекты (контур А и Б-по-субъектам) ---------- */
function renderTable(){
  document.getElementById('table-wrap').style.display = 'block';
  const canGroup = perechenMode==='subjects';
  const pageStart = (currentPage-1)*PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart+PAGE_SIZE);
  document.getElementById('table-body').innerHTML = pageItems.length ? pageItems.map((o, pi)=>{
    const idx = currentData.indexOf(o);
    const displayNum = pageStart + pi + 1;
    const excluded = excludedSet.has(o.name);
    const sentTo = sentToModule[o.name];
    const eligible = isEligibleForSend(o);
    let checkboxCell = '';
    if(canGroup){
      if(sentTo){
        checkboxCell = currentContour === 'b'
          ? `<td onclick="event.stopPropagation()"><button type="button" class="btn btn-outline" title="Исключить из отбора" aria-label="Исключить из отбора" onclick="removeFromSelection(${idx})">✓</button></td>`
          : `<td onclick="event.stopPropagation()" title="Включён в отбор для «${sentTo}»"><i class="ti ti-circle-check" style="color:var(--positive-text, #2e7d32);"></i></td>`;
      } else if(!eligible){
        const ly = lastAuditYear(o);
        const age = subjectAgeYears(o);
        let reason;
        if(o.status === 'Ликвидирован' || o.status === 'Недействующий'){
          reason = `Объект имеет статус «${o.status}» — направление на аудит невозможно`;
        } else if(o.status === 'Реорганизован'){
          reason = `Объект реорганизован — исходное юридическое лицо прекратило существование, аудит правопреемника требует отдельной записи`;
        } else if(ly !== null && ly === CURRENT_YEAR - 1){
          reason = `Последняя проверка проводилась в ${ly} году — в текущем году повторно не проводится`;
        } else if(age !== null && age <= 3){
          reason = `Субъект зарегистрирован ${o.regDate} — на момент формирования перечня действует не более 3 лет`;
        } else {
          reason = 'Доступно только для объектов с высоким уровнем риска';
        }
        checkboxCell = `<td onclick="event.stopPropagation()" title="${reason}"><input type="checkbox" disabled style="opacity:.3;"></td>`;
      } else {
        checkboxCell = `<td onclick="event.stopPropagation()"><input type="checkbox" ${selectedIndices.has(idx)?'checked':''} onchange="toggleSelect(${idx}, this.checked, this)"></td>`;
      }
    }
    return `
    <tr class="row" style="${excluded?'opacity:.5;':''}" onclick="openDetail('subject', ${idx})">
      ${checkboxCell}
      <td style="color:var(--text-muted);">${displayNum}</td>
      <td>${o.name}${sentTo?` <span class="tag-mini">в отборе для ${sentTo}</span>`:''}${excluded?' <span class="tag-mini">исключён</span>':''}</td>
      <td style="color:var(--text-2);">${o.kind}</td>
      <td style="color:var(--text-2);">${o.year}</td>
      <td style="color:var(--text-2);">${o.crit.length}</td>
      <td style="text-align:right;">${o.score}</td>
      <td><span class="badge ${o.risk}">${riskLabelFor(o.risk)}</span></td>
      <td><i class="ti ti-chevron-right" style="color:var(--text-muted);"></i></td>
    </tr>`;
  }).join('') : `<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:24px;">Объекты не найдены — попробуйте изменить фильтры</td></tr>`;
  updateSelectionBar();
}
function renderCards(){
  /* карточный вид списка убран — остаётся только таблица (пункт 1) */
}

/* ---------- выбор объектов для отправки в модуль ---------- */
function toggleSelect(idx, checked, el){
  const o = currentData[idx];
  if(checked && (sentToModule[o.name] || !isEligibleForSend(o))){
    if(el) el.checked = false;
    return;
  }
  if(checked) selectedIndices.add(idx); else selectedIndices.delete(idx);
  updateSelectionBar();
}
function toggleSelectAll(checked){
  selectedIndices.clear();
  if(checked) visible.forEach(o=>{ if(!sentToModule[o.name] && isEligibleForSend(o)) selectedIndices.add(currentData.indexOf(o)); });
  renderTable(); renderCards();
}
function clearSelection(){
  selectedIndices.clear();
  renderTable(); renderCards();
}
function updateSelectionBar(){
  renderSavedSelection();
  const bar = document.getElementById('selection-bar');
  const canGroup = perechenMode==='subjects';
  if(!canGroup || selectedIndices.size===0){ bar.style.display='none'; return; }
  bar.style.display = 'flex';
  document.getElementById('selection-count').textContent = selectedIndices.size;
  const moduleName = currentContour==='b' ? 'ЭВГА' : 'Проф. контроль';
  document.getElementById('selection-action-btn').innerHTML = `<i class="ti ti-send"></i>Включить в отбор для «${moduleName}»`;
}
function sendSelectedToModule(){
  const moduleName = currentContour==='b' ? 'ЭВГА' : 'Проф. контроль';
  const count = selectedIndices.size;
  if (!count) return;
  selectedIndices.forEach(idx=>{
    const o = currentData[idx];
    if (o && isEligibleForSend(o)) sentToModule[o.name] = moduleName;
  });
  selectedIndices.clear();
  renderTable(); renderCards();
  const note = document.getElementById('send-module-note');
  if(note){
    note.style.display = 'block';
    note.innerHTML = `<strong>Отбор сохранён.</strong> Включено объектов: ${count}. Назначение: «${moduleName}». <button type="button" class="btn btn-outline" onclick="exportSelectedObjects()">Скачать отбор</button>`;
  }
  saveSurDemo();
  renderSavedSelection();
}

function renderSavedSelection(){
  const note = document.getElementById('send-module-note');
  if (!note || currentContour !== 'b') return;
  const count = dataEVGA.filter(object => sentToModule[object.name] === 'ЭВГА').length;
  note.style.display = count && perechenMode === 'subjects' ? 'block' : 'none';
  if (count) note.innerHTML = `<strong>Отбор для ЭВГА: ${count} объектов.</strong> <button type="button" class="btn btn-outline" onclick="exportSelectedObjects()">Скачать отбор</button>`;
}

function removeFromSelection(idx){
  if (currentContour !== 'b') return;
  const object = currentData[idx];
  if (!object || sentToModule[object.name] !== 'ЭВГА') return;
  delete sentToModule[object.name];
  selectedIndices.delete(idx);
  saveSurDemo();
  renderTable();
}

/* ---------- рендер: Перечень АБП ---------- */
function renderABP(){
  const pageStart = (currentPage-1)*PAGE_SIZE;
  const pageItems = visible.slice(pageStart, pageStart+PAGE_SIZE);
  document.getElementById('table-body').innerHTML = pageItems.length ? pageItems.map((o, pi)=>`
    <tr class="row" onclick="openDetail('abp', ${currentData.indexOf(o)})">
      <td style="color:var(--text-muted);">${pageStart+pi+1}</td>
      <td class="mono" style="font-size:12px;">${o.code}</td>
      <td>${o.name}</td>
      <td style="color:var(--text-2);">${o.guCount}</td>
      <td style="color:var(--text-2);">${o.year}</td>
      <td style="text-align:right;">${o.score}</td>
      <td><span class="badge ${o.risk}">${riskLabelB[o.risk]}</span></td>
      <td><i class="ti ti-chevron-right" style="color:var(--text-muted);"></i></td>
    </tr>`).join('') : `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px;">АБП не найдены — попробуйте изменить фильтры</td></tr>`;
}

/* ---------- детальная карточка ---------- */
function openDetail(type, i){
  detailType = type;
  document.getElementById('exclude-form').style.display = 'none';
  document.getElementById('exclude-confirmed').style.display = 'none';
  document.getElementById('actions-normal').style.display = 'flex';
  document.getElementById('score-history-panel').style.display = 'none';
  document.getElementById('calc-breakdown').style.display = 'none';
  expandedCritIndex = null;
  if(type === 'subject'){
    const o = currentData[i];
    const isB = currentContour === 'b';
    document.getElementById('d-action-history').style.display = isB ? 'inline-flex' : 'none';
    currentDetailObj = o;
    currentDetailIsSum = isB;
    document.getElementById('d-title').textContent = o.name;
    document.getElementById('d-sub').textContent = isB
      ? `${o.kind} · ЭВГА`
      : `${o.kind} · Проф. контроль · ${o.checkType}`;
    document.getElementById('d-badge').textContent = riskLabelFor(o.risk);
    document.getElementById('d-badge').className = 'badge ' + o.risk;
    document.getElementById('top-stat-grid').style.display = isB ? 'grid' : 'none';
    document.getElementById('d-score-lbl').textContent = isB ? 'Балл, 3 года' : 'Балл R';
    document.getElementById('d-score').textContent = o.score;
    document.getElementById('d-thresh-lbl').textContent = isB ? 'Порог A / B в группе' : 'Пороги высокий / средний';
    document.getElementById('d-thresh-val').textContent = isB ? `${o.threshA} / ${o.threshB}` : '71 / 31';
    document.getElementById('d-count-lbl').textContent = 'Сработало критериев';
    document.getElementById('d-critcount').textContent = isB ? o.crit.length + ' из 41' : String(o.crit.length);
    document.getElementById('d-year').textContent = o.year;
    document.getElementById('d-crit-title').textContent = 'Сработавшие критерии';
    if(isB){
      document.getElementById('requisites-block').style.display = 'block';
      document.getElementById('requisites-block-a').style.display = 'none';
      document.getElementById('d-bin').textContent = o.bin;
      document.getElementById('d-gucode').textContent = o.guCode;
      document.getElementById('d-status').innerHTML = o.status === 'Действующий'
        ? o.status
        : `${o.status} <span style="color:var(--text-muted);font-weight:400;">· ${o.statusDate}</span>`;
      document.getElementById('d-subjtype').textContent = `${o.subjectType} — ${o.auditType}`;
      document.getElementById('d-region').textContent = o.district ? `${o.region}, ${o.district}` : o.region;
      document.getElementById('d-abprisk').innerHTML = o.parentAbp
        ? `${o.parentAbp.name} <span class="badge ${o.parentAbp.risk}" style="margin-left:4px;">${riskLabelB[o.parentAbp.risk]}</span>`
        : '<span style="color:var(--text-muted);">не входит в состав АБП</span>';
      document.getElementById('d-lastinsp').textContent = `${o.lastInspection.date} · ${o.lastInspection.type}`;
      document.getElementById('d-financing').innerHTML = o.financing.map(f=>`${f.year}: <strong>${f.amount}</strong>`).join(' &nbsp;·&nbsp; ');
    } else {
      document.getElementById('requisites-block').style.display = 'none';
      document.getElementById('requisites-block-a').style.display = 'block';
      document.getElementById('da-bin').textContent = o.bin;
      document.getElementById('da-category').textContent = o.category;
      document.getElementById('da-status').textContent = o.status;
      document.getElementById('da-region').textContent = o.region;
      document.getElementById('da-bizcat').textContent = o.bizCategory;
      document.getElementById('da-lastaudit').textContent = o.lastAudit.date === '—' ? 'Не проводился' : `${o.lastAudit.date} · ${o.lastAudit.type}`;
      document.getElementById('da-year').textContent = o.year;
    }
    if(!isB){
      document.getElementById('calc-breakdown').style.display = 'block';
      document.getElementById('cb-objrisk').textContent = o.objRisk;
      document.getElementById('cb-sp').textContent = o.sp;
      document.getElementById('cb-sc').textContent = o.sc;
      document.getElementById('cb-r').textContent = o.score;
      document.getElementById('cb-step1').textContent = `SC = Σ(wi × xi) = ${o.sc} баллов`;
      if(o.sp + o.sc !== o.score){
        document.getElementById('cb-step2').textContent = `Сработал критерий с прямым включением в перечень — обычная формула SP+SC не применяется`;
        document.getElementById('cb-step3').textContent = `R = ${o.score} (присвоено напрямую, минуя нормализацию)`;
      } else {
        document.getElementById('cb-step2').textContent = `Rпром = SP + SC = ${o.sp} + ${o.sc} = ${o.sp+o.sc}`;
        document.getElementById('cb-step3').textContent = `R = ((${o.sp+o.sc} − 0) / (100 − 0)) × 100 = ${o.score}`;
      }
    } else {
      document.getElementById('calc-breakdown').style.display = 'none';
    }
    document.getElementById('d-crit').innerHTML = renderCritList(o.crit);
  } else {
    document.getElementById('requisites-block').style.display = 'none';
    document.getElementById('requisites-block-a').style.display = 'none';
    const o = dataABP[i];
    currentDetailObj = o;
    currentDetailIsSum = true;
    document.getElementById('d-title').textContent = o.name;
    document.getElementById('d-sub').textContent = `АБП, код ${o.code} · Перечень АБП · ЭВГА`;
    document.getElementById('d-badge').textContent = riskLabelB[o.risk];
    document.getElementById('d-badge').className = 'badge ' + o.risk;
    document.getElementById('top-stat-grid').style.display = 'grid';
    document.getElementById('d-score-lbl').textContent = 'Балл АБП, 3 года';
    document.getElementById('d-score').textContent = o.score;
    document.getElementById('d-thresh-lbl').textContent = 'Порог C / D по АБП';
    document.getElementById('d-thresh-val').textContent = '55 / 75';
    document.getElementById('d-count-lbl').textContent = 'ГУ в составе';
    document.getElementById('d-critcount').textContent = String(o.guCount);
    document.getElementById('d-year').textContent = o.year;
    document.getElementById('d-crit-title').textContent = 'Государственные учреждения в составе АБП';
    document.getElementById('d-crit').innerHTML = o.sub.map(g=>`
      <div class="crit-row" style="cursor:pointer;" onclick="openSubjectByName('${g[0].replace(/'/g,"\\'")}')">
        <span class="crit-name">${g[0]}</span>
        <span class="crit-val">${g[1]} балл.</span>
        <i class="ti ti-chevron-right" style="color:var(--text-muted);"></i>
      </div>`).join('') + '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;">Нажмите на учреждение, чтобы открыть его карточку в контуре Б</div>';
  }
  if(type === 'subject' && excludedSet.has(currentData[i].name)){
    showExcludedBanner(excludeReasons[currentData[i].name]);
  }
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-detail').style.display = 'block';
  window.scrollTo(0,0);
}
function showList(){
  document.getElementById('view-detail').style.display = 'none';
  document.getElementById('view-engagement').style.display = 'none';
  document.getElementById('view-semiannual').style.display = 'none';
  document.getElementById('view-final').style.display = 'none';
  document.getElementById('view-perechen-main').style.display = 'none';
  document.getElementById('view-list').style.display = 'block';
  document.getElementById('nav-check').classList.add('active');
}

/* ---------- переход к объекту ГУ из карточки АБП (сквозной поиск по контекстам) ---------- */
function findSubjectByName(name){
  const idx = dataEVGA.findIndex(o => o.name === name);
  return idx !== -1 ? idx : null;
}
function openSubjectByName(name){
  const idx = findSubjectByName(name);
  if(idx === null){
    alert(`Карточка объекта «${name}» отсутствует в текущем перечне ЭВГА.`);
    return;
  }
  setPerechenMode('subjects');
  openDetail('subject', idx);
}

/* ---------- экспорт текущего (отфильтрованного) списка в CSV ---------- */
function csvEscape(val){
  const s = String(val === undefined || val === null ? '' : val);
  if(/[;"\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
  return s;
}
function downloadCSV(filename, rows){
  const content = rows.map(r => r.map(csvEscape).join(';')).join('\r\n');
  const blob = new Blob(['\uFEFF' + content], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function exportCSV(){
  const isABP = currentContour==='b' && perechenMode==='abp';
  let header, rows, filename;
  if(isABP){
    header = ['№','Код АБП','Наименование АБП','ГУ в составе','Баллы','Уровень риска'];
    rows = visible.map(o=>[currentData.indexOf(o)+1, o.code, o.name, o.guCount, o.score, riskLabelB[o.risk]]);
    filename = `perechen_abp_evga.csv`;
  } else {
    const kindLabel = currentContour==='b' ? 'Вид' : 'Категория субъекта';
    const scoreLabel = currentContour==='b' ? 'Баллы, 3г' : 'Балл R';
    header = ['№','Наименование объекта',kindLabel,scoreLabel,'Уровень риска'];
    rows = visible.map(o=>[currentData.indexOf(o)+1, o.name, o.kind, o.score, riskLabelFor(o.risk)]);
    filename = currentContour==='b' ? `perechen_evga.csv` : `perechen_profkontrol.csv`;
  }
  if(rows.length === 0){
    alert('Нет данных для экспорта — измените фильтры.');
    return;
  }
  downloadCSV(filename, [header, ...rows]);
}

/* ---------- экспорт утверждённого перечня — формат официального документа КВГА ---------- */
function exportApprovedPerechen(){
  if(!perechenApproved){
    alert('Перечень ещё не утверждён — выгрузка официального документа доступна после утверждения.');
    return;
  }
  if(engagements.length === 0){
    alert('Нет ни одного мероприятия для выгрузки.');
    return;
  }
  const header = ['№ п/п','Наименование объекта государственного аудита','Тип аудита','Вид аудита',
    'Наименование аудиторского мероприятия','Срок проведения аудита',
    '2023 год','2024 год','2025 год','за истекший период 2026 года','Всего'];
  const rows = [header];
  let n = 1;

  const groups = {};
  const order = [];
  engagements.forEach(e=>{
    if(!groups[e.context]){ groups[e.context] = []; order.push(e.context); }
    groups[e.context].push(e);
  });

  order.forEach(dvga=>{
    rows.push([dvga]);
    let dGrand = [0,0,0,0,0];
    groups[dvga].forEach(eng=>{
      let eSum = [0,0,0,0,0];
      (eng.objects||[]).forEach(o=>{
        const m = moneyBreakdown(o.name);
        const total = m[0]+m[1]+m[2]+m[3];
        rows.push([n++, o.name, 'внутренний государственный аудит', (eng.type||'').toLowerCase(),
          eng.name, eng.quarter, m[0], m[1], m[2], m[3], total]);
        eSum = [eSum[0]+m[0], eSum[1]+m[1], eSum[2]+m[2], eSum[3]+m[3], eSum[4]+total];
      });
      rows.push(['','Всего по аудиторскому мероприятию:','','','','', eSum[0],eSum[1],eSum[2],eSum[3],eSum[4]]);
      dGrand = dGrand.map((v,i)=>v+eSum[i]);
    });
    rows.push(['', `ИТОГО по: ${dvga}`, '', '', '', '', dGrand[0],dGrand[1],dGrand[2],dGrand[3],dGrand[4]]);
  });

  downloadCSV(`perechen_obektov_gosaudita_2026.csv`, rows);
}

/* ---------- исключение объекта с указанием причины ---------- */
function startExclude(){
  document.getElementById('exclude-form').style.display = 'block';
  document.getElementById('exclude-reason').value = '';
  document.getElementById('exclude-reason').focus();
}
function cancelExclude(){
  document.getElementById('exclude-form').style.display = 'none';
}
function confirmExclude(){
  const reason = document.getElementById('exclude-reason').value.trim();
  if(!reason){ alert('Укажите причину исключения — это обязательное поле для аудит-лога.'); return; }
  const name = document.getElementById('d-title').textContent;
  excludedSet.add(name);
  excludeReasons[name] = reason;
  document.getElementById('exclude-form').style.display = 'none';
  showExcludedBanner(reason);
  renderTable(); renderCards();
}
function showExcludedBanner(reason){
  document.getElementById('actions-normal').style.display = 'none';
  document.getElementById('exclude-form').style.display = 'none';
  const el = document.getElementById('exclude-confirmed');
  el.style.display = 'block';
  el.innerHTML = `<strong>Объект исключён из перечня.</strong><br>Причина: ${reason}<br><span style="color:var(--text-muted);">Действие зафиксировано в аудит-логе.</span>`;
}

/* ---------- история баллов по годам ---------- */
/* ---------- сработавшие критерии: провал в источник ---------- */
function renderCritList(crit){
  if(!crit.length) return '<div style="color:var(--text-muted);font-size:13px;">Нет сработавших критериев за период</div>';
  return crit.map((raw,ci)=>{
    const isNew = !Array.isArray(raw);
    const code = isNew ? raw.code : raw[0];
    const name = isNew ? raw.name : raw[1];
    const value = isNew ? raw.value : raw[2];
    const note = isNew ? raw.note : raw[3];
    const src = isNew ? raw.source : raw[4];
    const pointsBadge = isNew ? `<span class="crit-tag mono" title="Балл этого критерия за отчётный год — вклад в сумму по году" style="background:var(--accent-bg);color:var(--accent);">балл ${raw.yearly[['2024','2025','2026'].indexOf(currentDetailObj.year)]}</span>` : '';
    let html = `<div class="crit-row" ${src?`onclick="toggleCritSource(${ci})" style="cursor:pointer;"`:''}>
      <span class="crit-code mono">${code}</span>
      <span class="crit-name">${name}</span>
      <span class="crit-val">${value}</span>
      <span class="crit-tag">${note}</span>
      ${pointsBadge}
      ${src ? `<i class="ti ti-chevron-${expandedCritIndex===ci?'up':'down'}" style="color:var(--text-muted);flex-shrink:0;"></i>` : ''}
    </div>`;
    if(src && expandedCritIndex===ci){
      html += `<div class="card" style="padding:12px 14px;margin:-2px 0 8px;background:var(--surface-alt);">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">${src.system} · ${src.doc}</div>
        <div style="font-size:12.5px;font-weight:500;margin-bottom:6px;">${src.field} <span style="font-weight:400;color:var(--text-muted);">(${src.period})</span></div>
        <div style="font-size:12.5px;font-style:italic;color:var(--text-2);border-left:2px solid var(--accent);padding-left:10px;">«${src.excerpt}»</div>
        ${isNew ? `<div style="font-size:12px;color:var(--text-2);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">Балл по годам: 2024 — <strong>${raw.yearly[0]}</strong> · 2025 — <strong>${raw.yearly[1]}</strong> · 2026 — <strong>${raw.yearly[2]}</strong></div>` : ''}
      </div>`;
    }
    return html;
  }).join('');
}
function toggleCritSource(ci){
  expandedCritIndex = expandedCritIndex === ci ? null : ci;
  const o = currentDetailObj;
  document.getElementById('d-crit').innerHTML = renderCritList(o.crit);
}

function moneyBreakdown(name){
  const seed = seedFromName(name);
  const base = 150 + (seed % 1850);
  const y2025 = base;
  const y2024 = Math.round(base * (0.75 + ((seed>>>4)%30)/100));
  const y2023 = Math.round(base * (0.65 + ((seed>>>8)%35)/100));
  const y2026 = Math.round(base * (0.30 + ((seed>>>12)%25)/100));
  return [y2023, y2024, y2025, y2026];
}
function seedFromName(name){
  let h = 0;
  for(let i=0;i<name.length;i++){ h = (h*31 + name.charCodeAt(i)) >>> 0; }
  return h;
}
function yearlyBreakdown(o, isSum){
  const seed = seedFromName(o.name);
  const r1 = (seed % 100) / 100;
  const r2 = ((Math.floor(seed/100)) % 100) / 100;
  if(isSum){
    let a = Math.round(o.score * (0.20 + r1*0.30));
    let b = Math.round(o.score * (0.20 + r2*0.30));
    let c = o.score - a - b;
    if(c < 0){ b += c; c = 0; }
    return [{year:'2024', val:Math.max(0,a)}, {year:'2025', val:Math.max(0,b)}, {year:'2026', val:Math.max(0,c)}];
  }
  const clamp = v => Math.max(0, Math.min(100, Math.round(v)));
  const j1 = (r1 - 0.5) * 30;
  const j2 = (r2 - 0.5) * 20;
  return [{year:'2024', val:clamp(o.score - j1 - j2)}, {year:'2025', val:clamp(o.score - j2)}, {year:'2026', val:o.score}];
}
function barRow(year, val, max){
  const pct = Math.max(4, Math.round((val/max)*100));
  return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
    <span style="width:40px;font-size:12.5px;color:var(--text-2);">${year}</span>
    <div style="flex:1;background:var(--surface-alt);border-radius:5px;height:18px;overflow:hidden;">
      <div style="width:${pct}%;background:var(--accent);height:100%;border-radius:5px;"></div>
    </div>
    <span style="width:34px;text-align:right;font-size:12.5px;">${val}</span>
  </div>`;
}
function toggleScoreHistory(){
  const panel = document.getElementById('score-history-panel');
  const willShow = panel.style.display === 'none';
  if(willShow && currentDetailObj){
    const o = currentDetailObj;
    const data = (currentDetailIsSum && o.yearScores)
      ? [{year:'2024',val:o.yearScores[0]},{year:'2025',val:o.yearScores[1]},{year:'2026',val:o.yearScores[2]}]
      : yearlyBreakdown(o, currentDetailIsSum);
    const max = currentDetailIsSum ? Math.max(...data.map(d=>d.val), 1) : 100;
    document.getElementById('score-history-title').textContent = currentDetailIsSum
      ? 'История баллов по годам (сумма = текущий итог)'
      : 'История балла R по годам (нормализованный показатель, не сумма)';
    document.getElementById('score-history-bars').innerHTML = data.map(d=>barRow(d.year, d.val, max)).join('');
  }
  panel.style.display = willShow ? 'block' : 'none';
}

/* ---------- формирование аудиторского мероприятия (ЭВГА) ---------- */
function openEngagementForm(){
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-detail').style.display = 'none';
  document.getElementById('view-perechen-main').style.display = 'none';
  document.getElementById('view-engagement').style.display = 'block';
  document.getElementById('nav-check').classList.remove('active');
  document.getElementById('nav-perechen').classList.add('active');
  document.getElementById('eng-context-label').textContent = 'ЭВГА';
  document.getElementById('eng-success').style.display = 'none';
  document.getElementById('eng-name').value = '';
  renderEngagementSelection();
  renderEngagementsList();
  window.scrollTo(0,0);
}
function closeEngagementForm(){
  document.getElementById('view-engagement').style.display = 'none';
  document.getElementById('view-final').style.display = 'none';
  returnToPerechen();
}
function renderEngagementSelection(){
  const objs = [...selectedIndices].map(i=>currentData[i]).filter(Boolean);
  document.getElementById('eng-obj-count').textContent = objs.length;
  document.getElementById('eng-obj-list').innerHTML = objs.length ? objs.map(o=>`
    <div class="crit-row">
      <span class="crit-name">${o.name}</span>
      <span class="crit-val">${o.kind}</span>
      <span class="badge ${o.risk}">${riskLabelB[o.risk]}</span>
    </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;">Выбор пуст — вернитесь к перечню и отметьте объекты галочками.</div>';
  document.getElementById('eng-form-block').style.display = objs.length ? 'block' : 'none';
}
function confirmEngagement(){
  if(perechenApproved){ alert('Перечень утверждён. Изменения оформляются через утверждённый перечень.'); return; }
  const name = document.getElementById('eng-name').value.trim();
  if(!name){ alert('Укажите наименование аудиторского мероприятия.'); return; }
  const objs = [...selectedIndices].map(i=>currentData[i]).filter(Boolean);
  const eng = {
    name, type: document.getElementById('eng-type').value, quarter: document.getElementById('eng-quarter').value,
    context: 'ЭВГА', count: objs.length,
    status: 'formed',
    objects: objs.map(o=>({name:o.name, kind:o.kind, risk:o.risk, score:o.score})),
  };
  if(!objs.length){ alert('Выберите хотя бы один объект.'); return; }
  engagements.push(eng);
  objs.forEach(o=> engagementByObject[o.name] = name);
  saveSurDemo();
  selectedIndices.clear();
  const el = document.getElementById('eng-success');
  el.style.display = 'block';
  el.innerHTML = `<strong>Мероприятие «${name}» сформировано.</strong> Объектов: ${objs.length}. Добавлено в перечень контура Б.`;
  renderEngagementSelection();
  renderEngagementsList();
  renderTable(); renderCards();
  updateGroupedButton();
}
function renderEngagementsList(){
  document.getElementById('eng-total-count').textContent = engagements.length;
  document.getElementById('eng-list-body').innerHTML = engagements.length ? engagements.map((e,i)=>`
    <tr class="row" onclick="openGroupDetail('engagement', ${i})"><td>${e.name}</td><td style="color:var(--text-2);">${e.type}</td><td style="color:var(--text-2);">${e.quarter}</td><td>${e.count}</td><td style="color:var(--text-2);">${e.context}</td></tr>
  `).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Пока не сформировано ни одного мероприятия</td></tr>`;
}

/* ---------- формирование полугодового списка (Проф. контроль) ---------- */
function openSemiAnnualForm(){
  document.getElementById('view-list').style.display = 'none';
  document.getElementById('view-detail').style.display = 'none';
  document.getElementById('view-perechen-main').style.display = 'none';
  document.getElementById('view-semiannual').style.display = 'block';
  document.getElementById('nav-check').classList.remove('active');
  document.getElementById('nav-perechen').classList.add('active');
  document.getElementById('sa-success').style.display = 'none';
  renderSemiAnnualSelection();
  renderSemiAnnualLists();
  window.scrollTo(0,0);
}
function closeSemiAnnualForm(){
  document.getElementById('view-semiannual').style.display = 'none';
  returnToPerechen();
}
function renderSemiAnnualSelection(){
  const objs = [...selectedIndices].map(i=>dataA[i]).filter(Boolean);
  document.getElementById('sa-obj-count').textContent = objs.length;
  document.getElementById('sa-obj-list').innerHTML = objs.length ? objs.map(o=>`
    <div class="crit-row">
      <span class="crit-name">${o.name}</span>
      <span class="crit-val">${o.kind}</span>
      <span class="badge ${o.risk}">${riskLabelA[o.risk]}</span>
    </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;">Выбор пуст — вернитесь к перечню и отметьте субъекты галочками.</div>';
  document.getElementById('sa-form-block').style.display = objs.length ? 'block' : 'none';
}
function confirmSemiAnnual(){
  const objs = [...selectedIndices].map(i=>dataA[i]).filter(Boolean);
  const period = document.getElementById('sa-period').value;
  const year = document.getElementById('sa-year').value;
  const list = { name: `${period} ${year} года`, period, year, count: objs.length, status: 'formed',
    objects: objs.map(o=>({name:o.name, kind:o.kind, risk:o.risk, score:o.score})) };
  semiAnnualLists.push(list);
  objs.forEach(o => listByObject[o.name] = list.name);
  selectedIndices.clear();
  const el = document.getElementById('sa-success');
  el.style.display = 'block';
  el.innerHTML = `<strong>Полугодовой список «${list.name}» сформирован.</strong> Субъектов: ${objs.length}. Готов к направлению в КПСиСУ.`;
  renderSemiAnnualSelection();
  renderSemiAnnualLists();
  renderTable(); renderCards();
  updateGroupedButton();
}
function renderSemiAnnualLists(){
  document.getElementById('sa-total-count').textContent = semiAnnualLists.length;
  document.getElementById('sa-list-body').innerHTML = semiAnnualLists.length ? semiAnnualLists.map((l,i)=>`
    <tr class="row" onclick="openGroupDetail('semiannual', ${i})">
      <td>${l.name}</td><td style="color:var(--text-2);">${l.year}</td><td>${l.count}</td>
      <td>${l.status==='sent' ? '<span class="badge sent">Направлен в КПСиСУ</span>' : '<span class="badge low">Сформирован</span>'}</td>
      <td onclick="event.stopPropagation()">${l.status==='sent' ? '' : `<button class="btn" style="height:28px;padding:0 10px;font-size:12px;" onclick="sendSemiAnnual(${i})"><i class="ti ti-send"></i>Направить в КПСиСУ</button>`}</td>
    </tr>
  `).join('') : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">Пока не сформировано ни одного полугодового списка</td></tr>`;
}
function sendSemiAnnual(i){
  semiAnnualLists[i].status = 'sent';
  renderSemiAnnualLists();
}

/* ---------- просмотр и редактирование состава сформированного мероприятия / списка ---------- */
let groupDetailOrigin = 'list';
let currentGroupDetail = null;
let groupEditMode = false;
let amendmentActive = false;
let editingGroup = null;

function isGroupEditable(type, item){
  return type === 'engagement' ? !perechenApproved : item.status !== 'sent';
}
function openGroupDetail(type, i){
  groupDetailOrigin =
    document.getElementById('view-engagement').style.display === 'block' ? 'engagement' :
    document.getElementById('view-semiannual').style.display === 'block' ? 'semiannual' :
    document.getElementById('view-final').style.display === 'block' ? 'final' : 'perechen-main';
  currentGroupDetail = { type, index: i };
  groupEditMode = false;
  amendmentActive = false;
  ['view-list','view-detail','view-engagement','view-semiannual','view-final','view-perechen-main'].forEach(id=>{
    document.getElementById(id).style.display = 'none';
  });
  document.getElementById('view-group-detail').style.display = 'block';
  document.getElementById('nav-check').classList.remove('active');
  document.getElementById('nav-perechen').classList.add('active');
  renderGroupDetailBody();
  window.scrollTo(0,0);
}
function renderGroupDetailBody(){
  const { type, index } = currentGroupDetail;
  const item = type === 'engagement' ? engagements[index] : semiAnnualLists[index];
  document.getElementById('gd-title').textContent = item.name;
  const sent = item.status === 'sent';
  document.getElementById('gd-status').textContent = sent ? 'Направлен в КПСиСУ' : 'Сформирован';
  document.getElementById('gd-status').className = 'badge ' + (sent ? 'sent' : 'low');
  document.getElementById('gd-meta').textContent = type === 'engagement'
    ? `${item.type} · ${item.quarter} · ${item.context} · ЭВГА`
    : `${item.period} ${item.year} года · Проф. контроль`;
  document.getElementById('gd-count').textContent = item.count;
  const labelFn = type === 'engagement' ? riskLabelB : riskLabelA;
  const showX = groupEditMode;
  document.getElementById('gd-objects').innerHTML = (item.objects && item.objects.length) ? item.objects.map((o,oi)=>`
    <div class="crit-row">
      <span class="crit-name">${o.name}</span>
      <span class="crit-val">${o.kind}</span>
      <span class="badge ${o.risk}">${labelFn[o.risk]}</span>
      ${showX ? `<button class="btn" style="height:26px;padding:0 8px;font-size:11.5px;" onclick="removeFromGroup(${oi})" title="Убрать из состава"><i class="ti ti-x"></i></button>` : ''}
    </div>`).join('') : '<div style="color:var(--text-muted);font-size:13px;">Нет данных об объектах</div>';

  const editBtn = document.getElementById('gd-edit-btn');
  const addBtn = document.getElementById('gd-add-btn');
  const lockedNote = document.getElementById('gd-locked-note');
  const editable = isGroupEditable(type, item);

  if(!editable){
    lockedNote.style.display = amendmentActive ? 'none' : 'block';
    lockedNote.innerHTML = type === 'engagement'
      ? 'Мероприятие входит в утверждённый итоговый перечень. Изменение состава — только через приказ на внесение изменений.'
      : 'Список направлен в КПСиСУ. Изменение состава — только через приказ на внесение изменений.';
    editBtn.style.display = 'inline-flex';
    editBtn.innerHTML = amendmentActive ? '<i class="ti ti-check"></i>Завершить приказ' : '<i class="ti ti-file-diff"></i>Внести изменения (приказ)';
    addBtn.style.display = amendmentActive ? 'inline-flex' : 'none';
  } else {
    lockedNote.style.display = 'none';
    editBtn.style.display = 'inline-flex';
    editBtn.innerHTML = groupEditMode ? '<i class="ti ti-check"></i>Готово' : '<i class="ti ti-edit"></i>Редактировать';
    addBtn.style.display = groupEditMode ? 'inline-flex' : 'none';
  }

  document.getElementById('gd-amendments').innerHTML = (item.amendments && item.amendments.length) ? `
    <div class="section-title">Приказы на внесение изменений (${item.amendments.length})</div>
    ${item.amendments.map(a=>`
      <div class="crit-row">
        <span class="crit-code mono">Приказ №${a.orderNo}</span>
        <span class="crit-name">${a.action==='added' ? 'Включён' : 'Исключён'}: ${a.objName}</span>
        <span class="crit-val">${a.date}</span>
      </div>`).join('')}
  ` : '';
}
function toggleGroupEdit(){
  const { type, index } = currentGroupDetail;
  const item = type === 'engagement' ? engagements[index] : semiAnnualLists[index];
  if(isGroupEditable(type, item)){
    groupEditMode = !groupEditMode;
  } else {
    amendmentActive = !amendmentActive;
    groupEditMode = amendmentActive;
  }
  renderGroupDetailBody();
}
function logAmendment(item, action, objName){
  if(!item.amendments) item.amendments = [];
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`;
  item.amendments.push({ orderNo: item.amendments.length + 1, date: dateStr, action, objName });
}
function removeFromGroup(objIdx){
  const { type, index } = currentGroupDetail;
  const item = type === 'engagement' ? engagements[index] : semiAnnualLists[index];
  const map = type === 'engagement' ? engagementByObject : listByObject;
  if(item.objects.length <= 1 && !confirm('Это последний объект в составе. Убрать и оставить пустым?')) return;
  const removed = item.objects.splice(objIdx, 1)[0];
  if(removed){
    delete map[removed.name];
    if(amendmentActive) logAmendment(item, 'removed', removed.name);
  }
  item.count = item.objects.length;
  renderGroupDetailBody();
  renderTable(); renderCards();
  updateGroupedButton();
  if(type === 'engagement') renderEngagementsList(); else renderSemiAnnualLists();
}
function startAddToGroup(){
  editingGroup = { ...currentGroupDetail };
  document.getElementById('view-group-detail').style.display = 'none';
  document.getElementById('view-perechen-main').style.display = 'none';
  document.getElementById('view-list').style.display = 'block';
  document.getElementById('nav-perechen').classList.remove('active');
  document.getElementById('nav-check').classList.add('active');
  const item = editingGroup.type === 'engagement' ? engagements[editingGroup.index] : semiAnnualLists[editingGroup.index];
  document.getElementById('edit-mode-banner').style.display = 'block';
  document.getElementById('edit-mode-text').innerHTML = amendmentActive
    ? `<strong>Приказ на внесение изменений:</strong> отметьте объекты для включения в «${item.name}».`
    : `<strong>Режим добавления:</strong> отметьте объекты и нажмите «Добавить в «${item.name}»».`;
  const wantContour = editingGroup.type === 'engagement' ? 'b' : 'a';
  if(currentContour !== wantContour) setContour(wantContour);
}
function cancelAddToGroup(){
  const wasEditing = editingGroup;
  const wasAmendment = amendmentActive;
  editingGroup = null;
  selectedIndices.clear();
  document.getElementById('edit-mode-banner').style.display = 'none';
  renderTable(); renderCards();
  if(wasEditing){
    groupEditMode = wasAmendment; amendmentActive = wasAmendment;
    openGroupDetail(wasEditing.type, wasEditing.index);
    groupEditMode = wasAmendment; amendmentActive = wasAmendment;
    renderGroupDetailBody();
  }
}
function appendToGroup(){
  const { type, index } = editingGroup;
  const item = type === 'engagement' ? engagements[index] : semiAnnualLists[index];
  const map = type === 'engagement' ? engagementByObject : listByObject;
  const objs = [...selectedIndices].map(i=>currentData[i]).filter(Boolean);
  if(objs.length === 0) return;
  const wasAmendment = amendmentActive;
  objs.forEach(o=>{
    item.objects.push({name:o.name, kind:o.kind, risk:o.risk, score:o.score});
    map[o.name] = item.name;
    if(wasAmendment) logAmendment(item, 'added', o.name);
  });
  item.count = item.objects.length;
  selectedIndices.clear();
  editingGroup = null;
  document.getElementById('edit-mode-banner').style.display = 'none';
  renderTable(); renderCards();
  updateGroupedButton();
  if(type === 'engagement') renderEngagementsList(); else renderSemiAnnualLists();
  openGroupDetail(type, index);
  groupEditMode = true;
  amendmentActive = wasAmendment;
  renderGroupDetailBody();
}
function closeGroupDetail(){
  document.getElementById('view-group-detail').style.display = 'none';
  if(groupDetailOrigin === 'perechen-main'){
    returnToPerechen();
  } else {
    document.getElementById('view-' + groupDetailOrigin).style.display = 'block';
  }
}

/* ---------- итоговый перечень: консолидация всех мероприятий по контексту ---------- */
function openFinalPerechen(){
  document.getElementById('view-engagement').style.display = 'none';
  document.getElementById('view-perechen-main').style.display = 'none';
  document.getElementById('view-final').style.display = 'block';
  document.getElementById('nav-check').classList.remove('active');
  document.getElementById('nav-perechen').classList.add('active');
  renderFinalPerechen();
  updateApprovalUI();
  window.scrollTo(0,0);
}
function closeFinalPerechen(){
  document.getElementById('view-final').style.display = 'none';
  returnToPerechen();
}
function renderFinalPerechen(){
  const groups = {};
  const order = [];
  engagements.forEach(e => {
    if(!groups[e.context]){ groups[e.context] = []; order.push(e.context); }
    groups[e.context].push(e);
  });
  let html = '';
  if(order.length === 0){
    html = '<div class="card" style="text-align:center;color:var(--text-muted);padding:32px;margin-bottom:16px;">Пока не сформировано ни одного мероприятия — вернитесь назад, отметьте объекты в перечне и сформируйте мероприятия.</div>';
  } else {
    order.forEach(ctxName => {
      const list = groups[ctxName];
      const objSum = list.reduce((s,e)=>s+e.count,0);
      html += `<div class="card" style="margin-bottom:16px;">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:600;font-size:14px;">${ctxName}</div>
        <table>
          <thead><tr><th>Наименование аудиторского мероприятия</th><th style="width:170px;">Тип аудита</th><th style="width:150px;">Срок</th><th style="width:90px;">Объектов</th></tr></thead>
          <tbody>
            ${list.map(e=>`<tr><td>${e.name}</td><td style="color:var(--text-2);">${e.type}</td><td style="color:var(--text-2);">${e.quarter}</td><td>${e.count}</td></tr>`).join('')}
            <tr style="background:var(--surface-alt);font-weight:500;"><td colspan="3">Всего по ${ctxName}</td><td>${objSum}</td></tr>
          </tbody>
        </table>
      </div>`;
    });
  }
  document.getElementById('final-groups').innerHTML = html;
  const totalObj = engagements.reduce((s,e)=>s+e.count,0);
  document.getElementById('final-total-eng').textContent = engagements.length;
  document.getElementById('final-total-obj').textContent = totalObj;
}
function approvePerechen(){
  if(engagements.length === 0){ alert('Нельзя утвердить пустой перечень — сначала сформируйте хотя бы одно аудиторское мероприятие.'); return; }
  perechenApproved = true;
  saveSurDemo();
  updateApprovalUI();
}
function updateApprovalUI(){
  const pill = document.getElementById('final-status-pill');
  const note = document.getElementById('final-approved-note');
  const exportBtn = document.getElementById('final-export-btn');
  if(perechenApproved){
    pill.textContent = 'Утверждён';
    pill.className = 'pill approved';
    note.style.display = 'block';
    note.innerHTML = '<strong>Перечень утверждён.</strong> Состав мероприятий сохранён. Перечень доступен для выгрузки и дальнейшего направления.';
    exportBtn.disabled = false;
    exportBtn.style.opacity = '1';
    exportBtn.style.cursor = 'pointer';
    exportBtn.title = 'Выгрузить в формате официального перечня';
  } else {
    pill.textContent = 'Проект';
    pill.className = 'pill';
    note.style.display = 'none';
    exportBtn.disabled = true;
    exportBtn.style.opacity = '.5';
    exportBtn.style.cursor = 'not-allowed';
    exportBtn.title = 'Доступно после утверждения';
  }
}

/* ===================== АНАЛИТИКА: дашборды и отчёты ===================== */
function getAllSubjectsFlat(){
  const list = [];
  dataEVGA.forEach(o=>list.push({...o, contour:'b'}));
  dataA.forEach(o=>list.push({...o, contour:'a'}));
  return list;
}
function barChartCard(title, rows){
  const max = Math.max(...rows.map(r=>r.value), 1);
  return `<div class="card" style="padding:16px 20px;margin-bottom:16px;">
    <div style="font-size:13px;font-weight:600;margin-bottom:14px;">${title}</div>
    ${rows.map(r=>`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:9px;">
        <div style="width:190px;font-size:12.5px;color:var(--text-2);flex-shrink:0;" title="${r.label}">${r.label}</div>
        <div style="flex:1;background:var(--surface-alt);border-radius:6px;height:20px;overflow:hidden;">
          <div style="width:${(r.value/max*100).toFixed(1)}%;height:100%;background:${r.color||'var(--accent)'};border-radius:6px;transition:width .3s;"></div>
        </div>
        <div style="width:36px;text-align:right;font-size:12.5px;font-weight:600;flex-shrink:0;">${r.value}</div>
      </div>`).join('')}
  </div>`;
}
const PIE_PALETTE = ['#1E4FA3','#2E9E6B','#C08A1E','#A0439B','#3A9BB5','#C0392B','#6B6F76','#8A5FD1'];
function polarToXY(cx, cy, r, angleDeg){
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function pieChartCard(title, rows){
  const data = rows.map((r,i)=>({...r, color: r.color || PIE_PALETTE[i % PIE_PALETTE.length]}));
  const total = data.reduce((s,r)=>s+r.value, 0);
  const cx=90, cy=90, r=80;
  let angle = 0, paths = '';
  if(total > 0){
    data.forEach(row=>{
      if(row.value <= 0) return;
      const slice = (row.value/total)*360;
      const clampedSlice = Math.min(slice, 359.99);
      const start = polarToXY(cx,cy,r,angle);
      const end = polarToXY(cx,cy,r,angle+clampedSlice);
      const largeArc = clampedSlice > 180 ? 1 : 0;
      paths += `<path d="M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z" fill="${row.color}" stroke="var(--surface)" stroke-width="1.5"><title>${row.label}: ${row.value}</title></path>`;
      angle += slice;
    });
  } else {
    paths = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface-alt)"/>`;
  }
  const legend = data.map(row=>`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px;">
      <span style="width:11px;height:11px;border-radius:3px;background:${row.color};flex-shrink:0;"></span>
      <span style="font-size:12.5px;color:var(--text-2);flex:1;" title="${row.label}">${row.label}</span>
      <span style="font-size:12.5px;font-weight:600;flex-shrink:0;">${row.value} <span style="color:var(--text-muted);font-weight:400;">(${total ? Math.round(row.value/total*100) : 0}%)</span></span>
    </div>`).join('');
  return `<div class="card" style="padding:16px 20px;margin-bottom:16px;">
    <div style="font-size:13px;font-weight:600;margin-bottom:14px;">${title}</div>
    <div style="display:flex;align-items:center;gap:28px;flex-wrap:wrap;">
      <svg width="180" height="180" viewBox="0 0 180 180" style="flex-shrink:0;">${paths}</svg>
      <div style="flex:1;min-width:170px;">${legend}</div>
    </div>
  </div>`;
}
let dashChartType = 'bar';
function setDashChartType(type){
  dashChartType = type;
  document.getElementById('an-ct-bar').classList.toggle('active', type==='bar');
  document.getElementById('an-ct-pie').classList.toggle('active', type==='pie');
  renderDashboard();
}
let analyticsTab = 'dash';
function setAnalyticsTab(tab){
  analyticsTab = tab;
  document.getElementById('atab-dash').classList.toggle('active', tab==='dash');
  document.getElementById('atab-reports').classList.toggle('active', tab==='reports');
  document.getElementById('analytics-dash-content').style.display = tab==='dash' ? 'block' : 'none';
  document.getElementById('analytics-reports-content').style.display = tab==='reports' ? 'block' : 'none';
  if(tab==='dash') renderDashboard(); else onReportTypeChange();
}
function renderAnalyticsMain(){
  document.getElementById('analytics-crumb').textContent = currentContour==='b' ? 'СУР ЭВГА / Аналитика' : 'СУР Проф.контроль / Аналитика';
  document.getElementById('analytics-pill').textContent = currentContour==='b' ? 'ЭВГА — дашборды и отчёты' : 'Проф.контроль — дашборды и отчёты';
  setAnalyticsTab(analyticsTab);
}
function renderDashboard(){
  const contourFilter = currentContour;
  const yearFilter = document.getElementById('an-d-year').value;
  let subjects = getAllSubjectsFlat();
  subjects = subjects.filter(o=>o.contour===contourFilter);
  if(yearFilter) subjects = subjects.filter(o=>o.year===yearFilter);

  const high = subjects.filter(o=>o.risk==='high').length;
  const mid = subjects.filter(o=>o.risk==='mid').length;
  const low = subjects.filter(o=>o.risk==='low').length;
  const direct = subjects.filter(o=>o.risk==='direct').length;

  const kpiCards = [
    {lbl:'Всего объектов', val:subjects.length, cls:'neutral'},
    {lbl:'Высокий риск', val:high, cls:'high'},
    {lbl:'Средний риск', val:mid, cls:'mid'},
  ];
  if(contourFilter==='b') kpiCards.push({lbl:'Низкий риск', val:low, cls:'low'});
  if(contourFilter==='a') kpiCards.push({lbl:'Прямое основание', val:direct, cls:'direct'});
  document.getElementById('an-kpi-grid').innerHTML = kpiCards.map(k=>`
    <div class="kpi ${k.cls}"><div class="lbl">${k.lbl}</div><div class="val">${k.val}</div></div>`).join('');

  const riskColors = {high:'#C0392B', mid:'#C08A1E', low:'#1E8449', direct:'#2C2C2A'};
  const riskRows = [
    {label:'Высокий', value:high, color:riskColors.high},
    {label:'Средний', value:mid, color:riskColors.mid},
  ];
  if(contourFilter==='b') riskRows.push({label:'Низкий', value:low, color:riskColors.low});
  if(contourFilter==='a') riskRows.push({label:'Прямое основание', value:direct, color:riskColors.direct});

  const kindCounts = {};
  subjects.forEach(o=>{ const k=o.kind||'—'; kindCounts[k]=(kindCounts[k]||0)+1; });
  const kindRows = Object.keys(kindCounts).sort((a,b)=>kindCounts[b]-kindCounts[a])
    .map(k=>({label:k, value:kindCounts[k]}));

  const yearCounts = {};
  subjects.forEach(o=>{ yearCounts[o.year]=(yearCounts[o.year]||0)+1; });
  const yearRows = Object.keys(yearCounts).sort().map(y=>({label:y+' год', value:yearCounts[y]}));

  const chartFn = dashChartType === 'pie' ? pieChartCard : barChartCard;
  document.getElementById('an-charts').innerHTML =
    chartFn('Распределение по уровню риска', riskRows) +
    chartFn('По видам / категориям объектов', kindRows.length ? kindRows : [{label:'нет данных', value:0}]) +
    chartFn('Количество объектов по отчётному году', yearRows.length ? yearRows : [{label:'нет данных', value:0}]);
}

/* ---------- Отчёты: конфигурируемая выгрузка ---------- */
const reportTypeMeta = {
  perechen_b: {label:'Перечень объектов — ЭВГА', hasYear:true, hasRisk:true},
  perechen_a: {label:'Перечень объектов — Проф. контроль', hasYear:true, hasRisk:true},
  criteria_b: {label:'Реестр критериев — ЭВГА', hasYear:false, hasRisk:false},
  history:    {label:'История расчётов', hasYear:false, hasRisk:false},
};
function onReportTypeChange(){
  const type = document.getElementById('rep-type').value;
  const meta = reportTypeMeta[type];
  document.getElementById('rep-f-year-wrap').style.display = meta.hasYear ? 'block' : 'none';
  document.getElementById('rep-f-risk-wrap').style.display = meta.hasRisk ? 'block' : 'none';
  document.getElementById('rep-result').innerHTML = '';
  document.getElementById('rep-export-btn').disabled = true;
  document.getElementById('rep-export-btn').style.opacity = '.5';
  document.getElementById('rep-export-btn').style.cursor = 'not-allowed';
}
let lastReportRows = null;
let lastReportHeader = null;
let lastReportFilename = null;
function generateReport(){
  const type = document.getElementById('rep-type').value;
  const yearF = document.getElementById('rep-f-year').value;
  const riskF = document.getElementById('rep-f-risk').value;
  let header, rows, filename;

  if(type === 'perechen_b'){
    let items = dataEVGA.slice();
    if(yearF) items = items.filter(o=>o.year===yearF);
    if(riskF) items = items.filter(o=>o.risk===riskF);
    header = ['№','Наименование','Вид','Год','Критериев','Балл','Уровень риска'];
    rows = items.map((o,i)=>[i+1,o.name,o.kind,o.year,o.crit.length,o.score,riskLabelB[o.risk]]);
    filename = 'otchet_perechen_evga.csv';
  } else if(type === 'perechen_a'){
    let items = dataA.slice();
    if(yearF) items = items.filter(o=>o.year===yearF);
    if(riskF) items = items.filter(o=>o.risk===riskF);
    header = ['№','Наименование','Категория','Год','Критериев','Балл R','Уровень риска'];
    rows = items.map((o,i)=>[i+1,o.name,o.kind,o.year,o.crit.length,o.score,riskLabelA[o.risk]]);
    filename = 'otchet_perechen_a.csv';
  } else if(type === 'criteria_b'){
    header = ['Код','Наименование','Категория','Тип логики','Формула','Статус'];
    rows = criteriaB_registry.map(r=>[r[0],r[1],r[2],r[3],r[4],r[5]]);
    filename = 'otchet_reestr_kriteriev_b.csv';
  } else {
    header = ['Дата и время','Контур/контекст','Инициатор','Объектов','Статус','Длительность'];
    rows = historyLog.map(r=>[r[0],r[1],r[2],r[3],r[4]==='ok'?'Завершён':'Ошибка',r[5]]);
    filename = 'otchet_istoria_raschetov.csv';
  }

  lastReportHeader = header; lastReportRows = rows; lastReportFilename = filename;
  if(rows.length === 0){
    document.getElementById('rep-result').innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);">По заданным параметрам ничего не найдено — измените фильтры.</div>`;
    document.getElementById('rep-export-btn').disabled = true;
    document.getElementById('rep-export-btn').style.opacity = '.5';
    document.getElementById('rep-export-btn').style.cursor = 'not-allowed';
    return;
  }
  const previewRows = rows.slice(0, 15);
  document.getElementById('rep-result').innerHTML = `
    <div class="topbar" style="margin-bottom:8px;">
      <div class="section-title" style="margin:0;">Предпросмотр (${rows.length} ${rows.length===1?'строка':'строк'}${rows.length>15?', показаны первые 15':''})</div>
    </div>
    <div class="card"><table>
      <thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${previewRows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  document.getElementById('rep-export-btn').disabled = false;
  document.getElementById('rep-export-btn').style.opacity = '1';
  document.getElementById('rep-export-btn').style.cursor = 'pointer';
}
function exportReport(){
  if(!lastReportRows || !lastReportRows.length) return;
  downloadCSV(lastReportFilename, [lastReportHeader, ...lastReportRows]);
}

/* ===================== ВКЛАДКА «ПРОВЕРКА» → ВЫХОДНЫЕ ФОРМЫ (Приложения 2,3,5,6) ===================== */
const formTypeMeta = {
  app2_arbp:  {label:'Приложение 2', hasRisk:true, hasAuditType:true, hasSearch:true, hasYear:true,
    desc:'Оценка уровня и вероятности риска по объектам контроля под АРБП по типам аудита за выбранный год'},
  app3_abp:   {label:'Приложение 3', hasRisk:true, hasAuditType:true, hasSearch:true, hasYear:true, hasRegion:true,
    desc:'Оценка уровня и вероятности риска по объектам контроля по типам аудита за выбранный год по определённой области'},
  app6_abprisk: {label:'Приложение 6', hasSearch:false,
    desc:'Количество набранных баллов по АРБП'},
  app5_sample: {label:'Приложение 5', isLookup:true,
    desc:'Детализация таблицы баллов по выбранному объекту контроля'},
};
const OBLAST_PATTERNS = [
  ['Акмолинская область','Акмолинск'], ['Актюбинская область','Актюбинск'],
  ['Алматинская область','Алматинск'], ['Атырауская область','Атырауск'],
  ['Восточно-Казахстанская область','Восточно-Казахстанск'], ['Жамбылская область','Жамбылск'],
  ['Западно-Казахстанская область','Западно-Казахстанск'], ['Карагандинская область','Карагандинск'],
  ['Костанайская область','Костанайск'], ['Кызылординская область','Кызылординск'],
  ['Мангистауская область','Мангистауск'], ['Павлодарская область','Павлодарск'],
  ['Северо-Казахстанская область','Северо-Казахстанск'], ['Туркестанская область','Туркестанск'],
  ['область Абай','области Абай'], ['область Жетісу','области Жетісу'], ['область Ұлытау','области Ұлытау'],
  ['г. Астана','города Астан'], ['г. Алматы','города Алмат'], ['г. Шымкент','города Шымкент'],
];
function deriveRegion(name){
  for(const [label, marker] of OBLAST_PATTERNS){
    if(name.includes(marker)) return label;
  }
  return 'г. Астана';
}
function populateRegionFilterChk(){
  const sel = document.getElementById('chk-f-region');
  const allRegions = OBLAST_PATTERNS.map(p=>p[0]).sort((a,b)=>a.localeCompare(b,'ru'));
  sel.innerHTML = '<option value="">Все</option>'
    + allRegions.map(r=>`<option>${r}</option>`).join('');
}
/* Поля фильтров всегда остаются в раскладке (visibility), чтобы сетка не "прыгала"
   при переключении форм — в отличие от display:none, visibility:hidden сохраняет место. */
function setFilterVisible(id, show){
  const el = document.getElementById(id);
  el.style.visibility = show ? 'visible' : 'hidden';
  el.style.pointerEvents = show ? 'auto' : 'none';
}

/* ---------- Сквозное (общее для всех форм) состояние фильтров — как выборы в Qlik ---------- */
let formFilters = {year:'2025', risk:'', auditType:'', region:'', search:'', bin:''};
let lastFormRows = null;
const FILTER_LABELS = {year:'Год', risk:'Уровень риска', auditType:'Тип аудита', region:'Регион', search:'Наименование', bin:'БИН'};
const RISK_LABELS_RU = {high:'Высокий', mid:'Средний', low:'Низкий'};
function renderSelectionsBar(){
  const bar = document.getElementById('chk-selections-bar');
  const entries = Object.entries(formFilters).filter(([k,v])=>v);
  if(entries.length === 0){ bar.style.display = 'none'; bar.innerHTML = ''; return; }
  bar.style.display = 'flex';
  bar.innerHTML = entries.map(([k,v])=>{
    const val = k==='risk' ? (RISK_LABELS_RU[v]||v) : v;
    return `<span class="filter-chip">${FILTER_LABELS[k]}: ${val}<span class="chip-x" onclick="clearFormFilter('${k}')" title="Убрать фильтр">✕</span></span>`;
  }).join('');
}
function syncFilterInputsFromState(){
  document.getElementById('chk-f-year').value = formFilters.year;
  document.getElementById('chk-f-risk').value = formFilters.risk;
  document.getElementById('chk-f-audittype').value = formFilters.auditType;
  const regionSel = document.getElementById('chk-f-region');
  if(regionSel.options.length) regionSel.value = formFilters.region;
  document.getElementById('chk-f-search').value = formFilters.search;
  document.getElementById('chk-f-bin').value = formFilters.bin;
  document.getElementById('chk-f-app5name').value = formFilters.search;
}
function refreshCurrentForm(){
  const meta = formTypeMeta[document.getElementById('chk-form-type').value];
  if(meta.isLookup) lookupApp5BinChk();
  else if(lastFormRows !== null) generateFormReport();
}
function updateFormFilter(key, value){
  formFilters[key] = value;
  renderSelectionsBar();
  refreshCurrentForm();
}
function clearFormFilter(key){
  formFilters[key] = key === 'year' ? '2025' : '';
  syncFilterInputsFromState();
  renderSelectionsBar();
  refreshCurrentForm();
}

function onFormsTypeChange(){
  const type = document.getElementById('chk-form-type').value;
  const meta = formTypeMeta[type];
  document.getElementById('chk-form-desc').textContent = meta.desc || '';
  if(meta.isLookup){
    document.getElementById('chk-filter-grid').style.display = 'none';
    document.getElementById('chk-app5-lookup').style.display = 'block';
    document.getElementById('chk-generate-btn').style.display = 'none';
  } else {
    document.getElementById('chk-filter-grid').style.display = 'grid';
    document.getElementById('chk-app5-lookup').style.display = 'none';
    document.getElementById('chk-generate-btn').style.display = 'inline-flex';
    if(meta.hasRegion) populateRegionFilterChk();
    setFilterVisible('chk-f-year-wrap', !!meta.hasYear);
    setFilterVisible('chk-f-risk-wrap', !!meta.hasRisk);
    setFilterVisible('chk-f-audittype-wrap', !!meta.hasAuditType);
    setFilterVisible('chk-f-region-wrap', !!meta.hasRegion);
    setFilterVisible('chk-f-search-wrap', !!meta.hasSearch);
  }
  syncFilterInputsFromState();
  renderSelectionsBar();
  lastFormRows = null;
  if(meta.isLookup){
    lookupApp5BinChk();
  } else {
    document.getElementById('chk-result').innerHTML = '';
  }
  document.getElementById('chk-export-btn').disabled = true;
  document.getElementById('chk-export-btn').style.opacity = '.5';
  document.getElementById('chk-export-btn').style.cursor = 'not-allowed';
}
let lastFormHeader = null;
let lastFormFilename = null;
function generateFormReport(){
  const type = document.getElementById('chk-form-type').value;
  const riskTextMap = {high:'Высокий', mid:'Средний', low:'Низкий'};
  let header, rows, filename;

  if(type === 'app2_arbp' || type === 'app3_abp'){
    const src = type === 'app2_arbp' ? dataApp2Arbp : dataApp3Abp;
    let items = formFilters.year === '2025' ? src.slice() : [];
    if(formFilters.risk) items = items.filter(r=>r[3]===riskTextMap[formFilters.risk]);
    if(formFilters.auditType) items = items.filter(r=>r[5]===formFilters.auditType);
    if(formFilters.region) items = items.filter(r=>deriveRegion(r[2])===formFilters.region);
    if(formFilters.bin) items = items.filter(r=>r[1]===formFilters.bin);
    if(formFilters.search) items = items.filter(r=>r[2].toLowerCase().includes(formFilters.search.toLowerCase()));
    const codeLabel = type === 'app2_arbp' ? 'Код АРБП' : 'Код АБП';
    if(type === 'app3_abp'){
      header = [codeLabel,'БИН объекта контроля','Наименование объекта контроля','Регион','Уровень риска','Вероятность риска','Тип аудита'];
      rows = items.map(r=>[r[0], r[1], r[2], deriveRegion(r[2]), r[3], r[4], r[5]]);
    } else {
      header = [codeLabel,'БИН объекта контроля','Наименование объекта контроля','Уровень риска','Вероятность риска','Тип аудита'];
      rows = items.map(r=>r.slice());
    }
    filename = type === 'app2_arbp' ? 'prilozhenie_2_perechen_arbp.csv' : 'prilozhenie_3_perechen_abp.csv';
  } else {
    let items = dataApp6AbpRisk.slice();
    header = ['№','РББӘ коды','РББӘ (қаз.)','Код АБП','АРБП (наименование)','Баллы'];
    rows = items.map(r=>r.slice());
    filename = 'prilozhenie_6_uroven_riska_abp.csv';
  }

  lastFormHeader = header; lastFormRows = rows; lastFormFilename = filename;
  const totalsRow = (type === 'app6_abprisk')
    ? ['', '', '', '', 'Итого:', String(rows.reduce((s,r)=>s+Number(r[5]||0),0))]
    : null;

  if(rows.length === 0){
    const isYearGap = (type === 'app2_arbp' || type === 'app3_abp') && formFilters.year !== '2025';
    const msg = isYearGap
      ? `Данные загружены только за 2025 год — за ${formFilters.year} год выгрузка пока не поступала.`
      : 'По заданным параметрам ничего не найдено — измените фильтры.';
    document.getElementById('chk-result').innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);">${msg}</div>`;
    document.getElementById('chk-export-btn').disabled = true;
    document.getElementById('chk-export-btn').style.opacity = '.5';
    document.getElementById('chk-export-btn').style.cursor = 'not-allowed';
    return;
  }
  const previewRows = rows.slice(0, 15);
  document.getElementById('chk-result').innerHTML = `
    <div class="topbar" style="margin-bottom:8px;">
      <div class="section-title" style="margin:0;">Предпросмотр (${rows.length} ${rows.length===1?'строка':'строк'}${rows.length>15?', показаны первые 15':''})</div>
    </div>
    <div class="card"><table>
      <thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${totalsRow ? `<tr style="font-weight:600;background:var(--surface-alt);">${totalsRow.map(v=>`<td>${v}</td>`).join('')}</tr>` : ''}
        ${previewRows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table></div>`;
  document.getElementById('chk-export-btn').disabled = false;
  document.getElementById('chk-export-btn').style.opacity = '1';
  document.getElementById('chk-export-btn').style.cursor = 'pointer';
}
function exportFormReport(){
  if(!lastFormRows || !lastFormRows.length) return;
  const type = document.getElementById('chk-form-type').value;
  const extraRow = (type === 'app6_abprisk')
    ? [['', '', '', '', 'Итого:', String(lastFormRows.reduce((s,r)=>s+Number(r[5]||0),0))]]
    : [];
  downloadCSV(lastFormFilename, [lastFormHeader, ...extraRow, ...lastFormRows]);
}
function lookupApp5BinChk(){
  const bin = formFilters.bin.trim();
  const nameQuery = formFilters.search.trim().toLowerCase();
  const header = ['Код индикатора','Наименование индикатора','Год','Значение индикатора','Балл'];
  const KNOWN_BIN = '000140002861';
  const KNOWN_NAME = 'Коммунальное государственное учреждение Специализированная детско-юношеская спортивная школа №10 по хоккею с шайбой акимата города Астаны';

  if(!bin && !nameQuery){
    document.getElementById('chk-result').innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);">Введите БИН или наименование объекта контроля, чтобы увидеть его индикаторы.</div>`;
    document.getElementById('chk-export-btn').disabled = true;
    document.getElementById('chk-export-btn').style.opacity = '.5';
    document.getElementById('chk-export-btn').style.cursor = 'not-allowed';
    lastFormRows = null;
    return;
  }
  const binOk = !bin || bin === KNOWN_BIN;
  const nameOk = !nameQuery || KNOWN_NAME.toLowerCase().includes(nameQuery);
  if(binOk && nameOk){
    const rows = dataApp5Sample.map(r=>r.slice());
    lastFormHeader = header; lastFormRows = rows; lastFormFilename = `prilozhenie_5_indikatory_${KNOWN_BIN}.csv`;
    document.getElementById('chk-result').innerHTML = `
      <div class="topbar" style="margin-bottom:8px;">
        <div class="section-title" style="margin:0;">${KNOWN_NAME} <span class="mono" style="color:var(--text-muted);font-weight:400;">| ${KNOWN_BIN}</span></div>
      </div>
      <div class="card"><table>
        <thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;
    document.getElementById('chk-export-btn').disabled = false;
    document.getElementById('chk-export-btn').style.opacity = '1';
    document.getElementById('chk-export-btn').style.cursor = 'pointer';
  } else {
    const criteria = [bin && `БИН «${bin}»`, nameQuery && `наименованию «${nameQuery}»`].filter(Boolean).join(' и ');
    document.getElementById('chk-result').innerHTML = `<div class="card" style="padding:24px;text-align:center;color:var(--text-muted);">
      Нет данных по ${criteria}.<br>
      <span style="font-size:12px;">В прототипе доступен один эталонный объект — попробуйте <span class="mono" style="cursor:pointer;color:var(--accent);" onclick="formFilters.search='';syncFilterInputsFromState();updateFormFilter('bin','${KNOWN_BIN}');">${KNOWN_BIN}</span></span>
    </div>`;
    document.getElementById('chk-export-btn').disabled = true;
    document.getElementById('chk-export-btn').style.opacity = '.5';
    document.getElementById('chk-export-btn').style.cursor = 'not-allowed';
    lastFormRows = null;
  }
}

function saveSurDemo(){
  try { localStorage.setItem('saq.sur.demo.v1', JSON.stringify({data:dataEVGA, history:historyLog, lastCalcEvga, notCalculatedList, sentToModule, engagements, engagementByObject, perechenApproved})); }
  catch { const note=document.getElementById('send-module-note'); if(note){note.style.display='block';note.textContent='Не удалось сохранить изменения в браузере.';} }
}
function restoreSurDemo(){
  try {
    const saved=JSON.parse(localStorage.getItem('saq.sur.demo.v1') || 'null');
    if(!saved || !Array.isArray(saved.data) || saved.data.length!==dataEVGA.length || !saved.data.every((o,i)=>o.name===dataEVGA[i].name)) return;
    dataEVGA.splice(0,dataEVGA.length,...saved.data);
    if(Array.isArray(saved.history)) historyLog.splice(0,historyLog.length,...saved.history.map(row=>row.map(value=>typeof value === "string" ? value.replaceAll(" (демо)", "") : value)));
    if(saved.lastCalcEvga) lastCalcEvga=saved.lastCalcEvga;
    if(Array.isArray(saved.notCalculatedList)) notCalculatedList=saved.notCalculatedList;
    if(saved.sentToModule && typeof saved.sentToModule==='object') sentToModule=saved.sentToModule;
    if(Array.isArray(saved.engagements) && saved.engagements.every(item => item.name && Array.isArray(item.objects))) engagements=saved.engagements;
    if(saved.engagementByObject && typeof saved.engagementByObject==='object') engagementByObject=saved.engagementByObject;
    if(typeof saved.perechenApproved==='boolean') perechenApproved=saved.perechenApproved;
  } catch { /* A damaged saved example must not prevent the module from opening. */ }
}
/* ---------- инициализация ---------- */
restoreSurDemo();
renderNotCalculated();
renderFilterOptions();
renderDfoStatus();
renderCalcStatus();
renderEvgaCalcStatus();
renderKpis();
renderTableHead();
applyFilters();

function exportSelectedObjects(){
  const moduleName = currentContour === 'b' ? 'ЭВГА' : 'Проф. контроль';
  const selected = currentData.filter(object => sentToModule[object.name] === moduleName);
  if(!selected.length){ alert('В отборе пока нет объектов.'); return; }
  downloadCSV(currentContour === 'b' ? 'otbor_evga.csv' : 'otbor_profkontrol.csv', [
    ['№','Наименование объекта','Вид','Баллы','Уровень риска','Назначение'],
    ...selected.map((object,index) => [index+1,object.name,object.kind,object.score,riskLabelFor(object.risk),moduleName])
  ]);
}
