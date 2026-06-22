import fs from "fs";
import path from "path";

function writeFile(outDir: string, file: string, content: string) {
  const target = path.join(outDir, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function artifact(outDir: string, file: string, title: string, type = "typescript") {
  const target = path.join(outDir, file);
  return {
    title,
    file,
    path: target,
    type,
    status: "generated",
    content: fs.readFileSync(target, "utf8")
  };
}

function cleanName(prompt: string) {
  const called = String(prompt || "").match(/\b(?:called|named|brand(?:ed)? as)\s+([a-z0-9][a-z0-9 -]{2,60})/i);
  return called?.[1]?.trim().replace(/[^\w\s-]/g, "") || "LedgerPro";
}

export function isFinancePlatformPrompt(prompt: string) {
  const source = String(prompt || "").toLowerCase();
  return [
    "personal finance",
    "finance app",
    "expense",
    "expenses",
    "income",
    "savings",
    "budget",
    "cash flow",
    "ledger",
    "transaction",
    "transactions"
  ].some((term) => source.includes(term));
}

export async function buildFinancePlatformArtifacts(run: any) {
  const outDir = path.join(process.cwd(), "data", "artifacts", run.projectId);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const appName = cleanName(run.prompt || "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${appName} - Personal Finance</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<style>
:root{--bg:#f6f4ef;--card:#fff;--text:#171513;--muted:#8a857d;--line:#e8e4dc;--green:#059669;--red:#dc2626;--gold:#d97706;--blue:#2563eb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{display:grid;grid-template-columns:245px 1fr;min-height:100vh}.side{background:#fff;border-right:1px solid var(--line);padding:22px}.brand{font-weight:900;font-size:1.35rem}.nav button{display:block;width:100%;margin:10px 0;padding:12px 14px;border:0;border-radius:14px;text-align:left;background:transparent;color:var(--muted);font-weight:800;cursor:pointer}.nav button.active,.primary{background:var(--text);color:#fff}.main{padding:24px}.top{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:20px}.ghost,.primary{border:0;border-radius:14px;padding:11px 14px;font-weight:900;cursor:pointer}.ghost{background:#fff;border:1px solid var(--line);color:var(--text)}.cards{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}.card,.panel{background:#fff;border:1px solid var(--line);border-radius:22px;padding:18px;box-shadow:0 12px 35px rgba(0,0,0,.04)}.card small,.muted{color:var(--muted);font-weight:800;font-size:.78rem}.card b{display:block;font-size:1.45rem;margin-top:8px}.grid{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-top:16px}.insights{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}input,select{border:1px solid var(--line);border-radius:13px;padding:11px 12px;background:#fff}table{width:100%;border-collapse:collapse}td,th{padding:13px;border-bottom:1px solid var(--line);text-align:left}th{font-size:.75rem;color:var(--muted);text-transform:uppercase}.actions button{border:0;border-radius:10px;padding:8px 10px;margin-right:6px;cursor:pointer}.modal{position:fixed;inset:0;background:rgba(0,0,0,.36);display:none;align-items:center;justify-content:center;padding:20px}.modal.on{display:flex}.box{background:#fff;border-radius:24px;width:min(520px,96vw);padding:22px}.form{display:grid;gap:12px}.toast{position:fixed;right:18px;top:18px;background:#111;color:#fff;padding:12px 14px;border-radius:13px;font-weight:800;display:none}.progress{height:9px;background:#eee8df;border-radius:999px;overflow:hidden}.progress span{display:block;height:100%;background:var(--green)}.page{display:none}.page.on{display:block}@media(max-width:1050px){.shell{grid-template-columns:1fr}.cards,.insights{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}@media(max-width:640px){.cards,.insights{grid-template-columns:1fr}.top{display:grid}td:nth-child(3),th:nth-child(3){display:none}}
</style>
</head>
<body>
<div class="shell">
<aside class="side">
  <div class="brand">${appName}</div>
  <p class="muted">Full-scale finance command center</p>
  <div class="nav">
    <button class="active" onclick="go('dashboard',this)">Dashboard</button>
    <button onclick="go('transactions',this)">Transactions</button>
    <button onclick="go('analytics',this)">Analytics</button>
    <button onclick="go('insights',this)">Insights</button>
    <button onclick="go('settings',this)">Settings</button>
  </div>
</aside>
<main class="main">
  <div class="top">
    <div><button class="ghost" onclick="moveMonth(-1)">Previous</button> <button class="ghost" id="monthLabel" onclick="toggleAll()">Month</button> <button class="ghost" onclick="moveMonth(1)">Next</button></div>
    <button class="primary" onclick="openTx()">+ Add Transaction</button>
  </div>

  <section id="dashboard" class="page on">
    <div id="cards" class="cards"></div>
    <div class="grid">
      <div class="panel"><b>Monthly Income vs Expenses vs Savings</b><canvas id="bar"></canvas></div>
      <div class="panel"><b>Expense Category Breakdown</b><canvas id="donut"></canvas></div>
    </div>
    <div id="quickInsights" class="insights"></div>
  </section>

  <section id="transactions" class="page">
    <div class="panel">
      <div class="toolbar">
        <input id="search" placeholder="Search transactions" oninput="render()" />
        <select id="typeFilter" onchange="render()"><option value="all">All Types</option><option>income</option><option>expense</option><option>savings</option></select>
        <select id="sortFilter" onchange="render()"><option value="new">Newest</option><option value="old">Oldest</option><option value="high">Highest Amount</option><option value="low">Lowest Amount</option></select>
        <button class="ghost" onclick="exportCsv()">Export CSV</button>
        <button class="ghost" onclick="exportJson()">Export JSON</button>
      </div>
      <table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th>Type</th><th>Amount</th><th>Actions</th></tr></thead><tbody id="txRows"></tbody></table>
      <p id="empty" class="muted"></p>
    </div>
  </section>

  <section id="analytics" class="page">
    <div class="grid">
      <div class="panel"><b>6-Month Cash Flow Trend</b><canvas id="trend"></canvas></div>
      <div class="panel"><b>Savings Growth</b><canvas id="savingsChart"></canvas></div>
    </div>
    <div class="panel" style="margin-top:16px"><b>Cumulative Balance</b><canvas id="balanceChart"></canvas></div>
  </section>

  <section id="insights" class="page">
    <div id="insightCards" class="insights"></div>
    <div class="panel" style="margin-top:16px"><b>Category Detail Table</b><div id="categoryTable"></div></div>
  </section>

  <section id="settings" class="page">
    <div class="panel form">
      <h2>Settings</h2>
      <label>Currency <select id="currency" onchange="saveSettings()"><option>$</option><option>€</option><option>£</option><option>¥</option><option>₹</option><option>R$</option></select></label>
      <label>Monthly Budget <input id="budget" type="number" oninput="saveSettings()" /></label>
      <label>Savings Goal <input id="goal" type="number" oninput="saveSettings()" /></label>
      <button class="ghost" onclick="loadSample()">Load Sample Data</button>
      <button class="ghost" onclick="resetData()">Reset Data</button>
    </div>
  </section>
</main>
</div>

<div id="modal" class="modal"><div class="box">
<h2>Add / Edit Transaction</h2>
<div class="form">
<select id="txType"><option value="income">Income</option><option value="expense">Expense</option><option value="savings">Savings</option></select>
<input id="txAmount" type="number" placeholder="Amount" />
<input id="txCategory" placeholder="Category" />
<input id="txDesc" placeholder="Description" />
<input id="txDate" type="date" />
<button class="primary" onclick="saveTx()">Save</button>
<button class="ghost" onclick="closeTx()">Cancel</button>
</div>
</div></div>
<div id="toast" class="toast"></div>

<script>
var tx=[], editing=null, allTime=false, current=new Date(), charts={}, settings={currency:'$',budget:4500,goal:1200};
function seed(){var out=[],id=1,now=new Date();var cats=['Food','Housing','Transport','Utilities','Shopping','Healthcare','Subscriptions','Entertainment'];for(var m=4;m>=0;m--){var d=new Date(now.getFullYear(),now.getMonth()-m,1),y=d.getFullYear(),mo=d.getMonth()+1,p=y+'-'+String(mo).padStart(2,'0')+'-';out.push({id:id++,type:'income',category:'Salary',description:'Monthly salary',amount:5400,date:p+'01'});out.push({id:id++,type:'income',category:'Freelance',description:'Design project',amount:850,date:p+'12'});for(var i=0;i<cats.length;i++)out.push({id:id++,type:'expense',category:cats[i],description:cats[i]+' payment',amount:Math.round(35+Math.random()*350),date:p+String(3+i*2).padStart(2,'0')});out.push({id:id++,type:'savings',category:'Emergency Fund',description:'Monthly savings',amount:500,date:p+'02'});out.push({id:id++,type:'savings',category:'Investments',description:'Index fund',amount:250,date:p+'15'});}return out;}
function load(){tx=JSON.parse(localStorage.getItem('ledgerpro.tx')||'null')||seed();settings=Object.assign(settings,JSON.parse(localStorage.getItem('ledgerpro.settings')||'{}'));document.getElementById('currency').value=settings.currency;document.getElementById('budget').value=settings.budget;document.getElementById('goal').value=settings.goal;}
function persist(){localStorage.setItem('ledgerpro.tx',JSON.stringify(tx));}
function money(n){return settings.currency+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});}
function mkey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function scoped(){var list=allTime?tx.slice():tx.filter(function(t){return t.date.indexOf(mkey(current))===0});var q=(document.getElementById('search')?.value||'').toLowerCase();var f=document.getElementById('typeFilter')?.value||'all';var s=document.getElementById('sortFilter')?.value||'new';if(q)list=list.filter(function(t){return (t.description+t.category).toLowerCase().includes(q)});if(f!=='all')list=list.filter(function(t){return t.type===f});list.sort(function(a,b){return s==='old'?a.date.localeCompare(b.date):s==='high'?b.amount-a.amount:s==='low'?a.amount-b.amount:b.date.localeCompare(a.date)});return list;}
function sums(list){return list.reduce(function(a,t){a[t.type]+=Number(t.amount);return a},{income:0,expense:0,savings:0});}
function render(){document.getElementById('monthLabel').textContent=allTime?'All Time':current.toLocaleString('default',{month:'long',year:'numeric'});var list=scoped(), period=allTime?tx:tx.filter(function(t){return t.date.indexOf(mkey(current))===0}), s=sums(period), balance=s.income-s.expense-s.savings, rate=s.income?((s.income-s.expense)/s.income*100):0, flow=s.income-s.expense;document.getElementById('cards').innerHTML=[['Income',s.income],['Expenses',s.expense],['Savings',s.savings],['Net Balance',balance],['Savings Rate',rate.toFixed(1)+'%'],['Cash Flow',flow]].map(function(c){return '<div class="card"><small>'+c[0]+'</small><b>'+(c[0].includes('Rate')?c[1]:money(c[1]))+'</b></div>'}).join('');document.getElementById('txRows').innerHTML=list.map(function(t){return '<tr><td>'+t.description+'</td><td>'+t.category+'</td><td>'+t.date+'</td><td>'+t.type+'</td><td>'+money(t.amount)+'</td><td class="actions"><button onclick="openTx('+t.id+')">Edit</button><button onclick="delTx('+t.id+')">Delete</button></td></tr>'}).join('');document.getElementById('empty').textContent=list.length?'':'No transactions found.';renderInsights(s,period);renderCharts();}
function monthSeries(){var labels=[],income=[],expense=[],savings=[],balance=[],cum=0;for(var i=5;i>=0;i--){var d=new Date(current.getFullYear(),current.getMonth()-i,1),k=mkey(d),ss=sums(tx.filter(function(t){return t.date.indexOf(k)===0}));labels.push(d.toLocaleString('default',{month:'short'}));income.push(ss.income);expense.push(ss.expense);savings.push(ss.savings);cum+=ss.income-ss.expense-ss.savings;balance.push(cum)}return{labels:labels,income:income,expense:expense,savings:savings,balance:balance};}
function chart(id,type,data){if(charts[id])charts[id].destroy();charts[id]=new Chart(document.getElementById(id),{type:type,data:data,options:{responsive:true}})}
function renderCharts(){var ms=monthSeries();chart('bar','bar',{labels:ms.labels,datasets:[{label:'Income',data:ms.income},{label:'Expenses',data:ms.expense},{label:'Savings',data:ms.savings}]});var period=allTime?tx:tx.filter(function(t){return t.date.indexOf(mkey(current))===0}), map={};period.filter(function(t){return t.type==='expense'}).forEach(function(t){map[t.category]=(map[t.category]||0)+t.amount});chart('donut','doughnut',{labels:Object.keys(map),datasets:[{data:Object.values(map)}]});chart('trend','line',{labels:ms.labels,datasets:[{label:'Income',data:ms.income},{label:'Expenses',data:ms.expense}]});chart('savingsChart','bar',{labels:ms.labels,datasets:[{label:'Savings',data:ms.savings}]});chart('balanceChart','line',{labels:ms.labels,datasets:[{label:'Cumulative Balance',data:ms.balance}]});}
function renderInsights(s,period){var expense=period.filter(function(t){return t.type==='expense'}), by={};expense.forEach(function(t){by[t.category]=(by[t.category]||0)+t.amount});var top=Object.entries(by).sort(function(a,b){return b[1]-a[1]})[0]||['None',0], daily=s.expense/Math.max(1,new Date().getDate()), projected=daily*30, budgetPct=settings.budget?Math.min(100,s.expense/settings.budget*100):0;var cards=[['Savings Rate',(s.income?((s.income-s.expense)/s.income*100):0).toFixed(1)+'%'],['Top Category',top[0]+' '+money(top[1])],['Daily Spend',money(daily)],['Projected Spend',money(projected)],['Budget Used',budgetPct.toFixed(0)+'%'],['Transactions',period.length]];var html=cards.map(function(c){return '<div class="card"><small>'+c[0]+'</small><b>'+c[1]+'</b></div>'}).join('');document.getElementById('quickInsights').innerHTML=html;document.getElementById('insightCards').innerHTML=html;document.getElementById('categoryTable').innerHTML=Object.entries(by).map(function(e){var pct=s.expense?e[1]/s.expense*100:0;return '<p><b>'+e[0]+'</b> '+money(e[1])+' <span class="muted">'+pct.toFixed(1)+'%</span><div class="progress"><span style="width:'+pct+'%"></span></div></p>'}).join('')||'<p class="muted">No expense categories.</p>';}
function openTx(id){editing=id||null;var t=tx.find(function(x){return x.id===id})||{type:'expense',amount:'',category:'Food',description:'',date:new Date().toISOString().slice(0,10)};document.getElementById('txType').value=t.type;document.getElementById('txAmount').value=t.amount;document.getElementById('txCategory').value=t.category;document.getElementById('txDesc').value=t.description;document.getElementById('txDate').value=t.date;document.getElementById('modal').classList.add('on');}
function closeTx(){document.getElementById('modal').classList.remove('on');editing=null;}
function saveTx(){var item={id:editing||Date.now(),type:document.getElementById('txType').value,amount:Number(document.getElementById('txAmount').value),category:document.getElementById('txCategory').value,description:document.getElementById('txDesc').value,date:document.getElementById('txDate').value};if(!item.amount||!item.description||!item.date)return toast('Complete every field');if(editing)tx=tx.map(function(t){return t.id===editing?item:t});else tx.push(item);persist();closeTx();toast('Saved');render();}
function delTx(id){if(confirm('Delete this transaction?')){tx=tx.filter(function(t){return t.id!==id});persist();toast('Deleted');render();}}
function moveMonth(n){allTime=false;current=new Date(current.getFullYear(),current.getMonth()+n,1);render();}
function toggleAll(){allTime=!allTime;render();}
function go(id,el){document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on')});document.getElementById(id).classList.add('on');document.querySelectorAll('.nav button').forEach(function(b){b.classList.remove('active')});el.classList.add('active');setTimeout(renderCharts,60)}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(function(){t.style.display='none'},2200)}
function exportCsv(){var rows=[['date','type','category','description','amount']].concat(tx.map(function(t){return[t.date,t.type,t.category,t.description,t.amount]}));var blob=new Blob([rows.map(function(r){return r.join(',')}).join('\\n')]);download(blob,'ledgerpro.csv');}
function exportJson(){download(new Blob([JSON.stringify(tx,null,2)]),'ledgerpro.json');}
function download(blob,name){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();}
function loadSample(){tx=seed();persist();render();toast('Sample loaded');}
function resetData(){if(confirm('Reset all finance data?')){tx=[];persist();render();}}
function saveSettings(){settings.currency=document.getElementById('currency').value;settings.budget=Number(document.getElementById('budget').value);settings.goal=Number(document.getElementById('goal').value);localStorage.setItem('ledgerpro.settings',JSON.stringify(settings));render();}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeTx()});load();render();
</script>
</body>
</html>`;

  writeFile(outDir, "index.html", html);

  writeFile(outDir, "metadata.json", JSON.stringify({
    projectId: run.projectId,
    mode: "finance",
    name: appName,
    prompt: run.prompt,
    standard: "OmegaCrownAI Full-Scale App Builder Mode",
    artifacts: ["index.html", "app/page.tsx", "app/admin/page.tsx", "app/editor/page.tsx", "app/api/transactions/route.ts", "lib/finance-store.ts", "prisma/schema.prisma", "README.md", "package.json", "Dockerfile", "scripts/smoke-test.mjs", "data/asset-manifest.json"]
  }, null, 2));

  writeFile(outDir, "data/asset-manifest.json", JSON.stringify({
    domain: "finance",
    hero: "public/images/dashboard.svg",
    assets: [
      { file: "public/images/dashboard.svg", role: "hero visual" },
      { file: "public/images/analytics.svg", role: "analytics visual" },
      { file: "public/images/settings.svg", role: "settings visual" }
    ]
  }, null, 2));

  const svg = (title: string, bg: string, fg: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="1600" height="900" rx="64" fill="${bg}"/><text x="100" y="220" fill="${fg}" font-size="82" font-family="Arial" font-weight="900">${title}</text><rect x="100" y="380" width="360" height="250" rx="34" fill="white" opacity=".14"/><rect x="520" y="380" width="360" height="250" rx="34" fill="white" opacity=".14"/><rect x="940" y="380" width="360" height="250" rx="34" fill="white" opacity=".14"/></svg>`;
  writeFile(outDir, "public/images/dashboard.svg", svg("Finance Dashboard", "#111827", "#fbbf24"));
  writeFile(outDir, "public/images/analytics.svg", svg("Finance Analytics", "#172554", "#60a5fa"));
  writeFile(outDir, "public/images/settings.svg", svg("Finance Settings", "#052e16", "#4ade80"));

  writeFile(outDir, "app/page.tsx", `export default function FinanceAppPage() {
  return <main className="min-h-screen bg-stone-100 p-8"><h1 className="text-5xl font-black">${appName}</h1><p>Full-scale finance app with dashboard, transactions, analytics, insights, settings, exports, API, and persistence.</p></main>;
}
`);

  writeFile(outDir, "app/admin/page.tsx", `export default function AdminFinancePage() {
  return <main className="p-8"><h1>Finance Admin Dashboard</h1><p>Review budgets, categories, transactions, cash flow, and savings goals.</p></main>;
}
`);

  writeFile(outDir, "app/editor/page.tsx", `export default function FinanceEditorPage() {
  return <main className="p-8"><h1>Edit ${appName}</h1><p>Update categories, budget defaults, dashboard labels, and insight copy.</p></main>;
}
`);

  writeFile(outDir, "app/api/transactions/route.ts", `import { NextResponse } from "next/server";
import { createTransaction, listTransactions } from "../../../lib/finance-service";

export async function GET() {
  return NextResponse.json({ transactions: await listTransactions() });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ transaction: await createTransaction(body) }, { status: 201 });
}
`);

  writeFile(outDir, "lib/finance-store.ts", `export type FinanceTransaction = {
  id: string;
  type: "income" | "expense" | "savings";
  category: string;
  description: string;
  amount: number;
  date: string;
};

const transactions: FinanceTransaction[] = [];

export async function listTransactions() {
  return transactions;
}

export async function createTransaction(input: Partial<FinanceTransaction>) {
  const transaction: FinanceTransaction = {
    id: String(Date.now()),
    type: input.type || "expense",
    category: input.category || "General",
    description: input.description || "Finance transaction",
    amount: Number(input.amount || 0),
    date: input.date || new Date().toISOString().slice(0, 10)
  };
  transactions.push(transaction);
  return transaction;
}
`);

  writeFile(outDir, "prisma/schema.prisma", `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Transaction {
  id          String   @id @default(cuid())
  type        String
  category    String
  description String
  amount      Float
  date        DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Setting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  type      String
  createdAt DateTime @default(now())
}

model Budget {
  id        String   @id @default(cuid())
  month     String
  category  String
  amount    Float
  createdAt DateTime @default(now())
}

model SavingsGoal {
  id        String   @id @default(cuid())
  name      String
  target    Float
  current   Float    @default(0)
  deadline  DateTime?
  createdAt DateTime @default(now())
}
`);

  writeFile(outDir, "global.d.ts", `declare module "*.css";
declare module "*.svg" {
  const src: string;
  export default src;
}
`);

  writeFile(outDir, "scripts/smoke-test.mjs", `import fs from "fs";
for (const file of ["index.html","metadata.json","README.md","package.json","app/page.tsx","app/api/transactions/route.ts","data/asset-manifest.json"]) {
  if (!fs.existsSync(file)) throw new Error("Missing " + file);
}
const html = fs.readFileSync("index.html", "utf8");
for (const term of ["Dashboard","Transactions","Analytics","Insights","Settings","Export CSV"]) {
  if (!html.includes(term)) throw new Error("Missing UI term " + term);
}
console.log("Finance artifact smoke test passed");
`);

  writeFile(outDir, "package.json", JSON.stringify({
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      smoke: "node scripts/smoke-test.mjs",
      "db:generate": "prisma generate",
      "db:push": "prisma db push",
      "db:seed": "tsx prisma/seed.ts",
      "test:fullstack": "node scripts/fullstack-smoke.mjs"
    },
    dependencies: {
      "@prisma/client": "6.19.0",
      "next": "latest",
      "react": "latest",
      "react-dom": "latest",
      "chart.js": "latest"
    },
    devDependencies: {
      "prisma": "6.19.0",
      "typescript": "latest",
      "tsx": "latest"
    }
  }, null, 2));

  writeFile(outDir, "Dockerfile", `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm","run","start"]
`);

  writeFile(outDir, "README.md", `# ${appName} - Full-Scale Personal Finance App

Prompt:
${run.prompt}

## Included
- Polished responsive dashboard
- Income, expense, and savings CRUD
- Search, filter, sort, monthly navigation, and all-time view
- Charts, analytics, smart insights, and category breakdowns
- Settings, budget, savings goal, CSV export, JSON export
- LocalStorage preview persistence
- Next.js API scaffold
- Prisma schema
- Admin page
- Editor page
- Dockerfile
- Smoke test
- Asset manifest

## Run
npm install
npm run dev
npm run smoke
`);


  writeFile(outDir, "lib/db.ts", `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`);

  writeFile(outDir, "lib/finance-service.ts", `import { prisma } from "./db";

export type TransactionInput = {
  type?: string;
  category?: string;
  description?: string;
  amount?: number;
  date?: string;
};

export async function listTransactions() {
  return prisma.transaction.findMany({ orderBy: { date: "desc" } });
}

export async function getTransaction(id: string) {
  return prisma.transaction.findUnique({ where: { id } });
}

export async function createTransaction(input: TransactionInput) {
  return prisma.transaction.create({
    data: {
      type: input.type || "expense",
      category: input.category || "General",
      description: input.description || "Finance transaction",
      amount: Number(input.amount || 0),
      date: input.date ? new Date(input.date) : new Date()
    }
  });
}

export async function updateTransaction(id: string, input: TransactionInput) {
  return prisma.transaction.update({
    where: { id },
    data: {
      ...(input.type ? { type: input.type } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.description ? { description: input.description } : {}),
      ...(typeof input.amount === "number" ? { amount: input.amount } : {}),
      ...(input.date ? { date: new Date(input.date) } : {})
    }
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return Object.fromEntries(settings.map((setting) => [setting.key, setting.value]));
}

export async function updateSettings(input: Record<string, string | number>) {
  await Promise.all(
    Object.entries(input).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )
  );
  return getSettings();
}

export async function importTransactions(transactions: TransactionInput[]) {
  const created = [];
  for (const transaction of transactions) {
    created.push(await createTransaction(transaction));
  }
  return created.length;
}
`);

  writeFile(outDir, "app/api/transactions/[id]/route.ts", `import { NextResponse } from "next/server";
import { deleteTransaction, getTransaction, updateTransaction } from "../../../../lib/finance-service";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const transaction = await getTransaction(params.id);
  if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  return NextResponse.json({ transaction });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  return NextResponse.json({ transaction: await updateTransaction(params.id, body) });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteTransaction(params.id);
  return NextResponse.json({ ok: true });
}
`);

  writeFile(outDir, "app/api/settings/route.ts", `import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "../../../lib/finance-service";

export async function GET() {
  return NextResponse.json({ settings: await getSettings() });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  return NextResponse.json({ settings: await updateSettings(body) });
}
`);

  writeFile(outDir, "app/api/import/route.ts", `import { NextResponse } from "next/server";
import { importTransactions } from "../../../lib/finance-service";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ imported: await importTransactions(body.transactions || []) });
}
`);

  writeFile(outDir, "app/api/export/route.ts", `import { NextResponse } from "next/server";
import { listTransactions } from "../../../lib/finance-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";
  const transactions = await listTransactions();

  if (format === "csv") {
    const rows = [["date", "type", "category", "description", "amount"], ...transactions.map((transaction) => [
      transaction.date.toISOString(),
      transaction.type,
      transaction.category,
      transaction.description,
      String(transaction.amount)
    ])];

    return new NextResponse(rows.map((row) => row.join(",")).join("\\n"), {
      headers: {
        "content-type": "text/csv",
        "content-disposition": "attachment; filename=transactions.csv"
      }
    });
  }

  return NextResponse.json({ transactions });
}
`);

  writeFile(outDir, "prisma/seed.ts", `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.setting.deleteMany();

  await prisma.setting.createMany({
    data: [
      { key: "currency", value: "$" },
      { key: "monthlyBudget", value: "4500" },
      { key: "savingsGoal", value: "1200" }
    ]
  });

  await prisma.transaction.createMany({
    data: [
      { type: "income", category: "Salary", description: "Monthly salary", amount: 5400, date: new Date() },
      { type: "income", category: "Freelance", description: "Consulting income", amount: 850, date: new Date() },
      { type: "expense", category: "Housing", description: "Rent payment", amount: 1850, date: new Date() },
      { type: "expense", category: "Food", description: "Groceries", amount: 420, date: new Date() },
      { type: "expense", category: "Transport", description: "Transit and rides", amount: 210, date: new Date() },
      { type: "savings", category: "Emergency Fund", description: "Monthly savings", amount: 700, date: new Date() }
    ]
  });
}

main().finally(() => prisma.$disconnect());
`);

  writeFile(outDir, ".env.example", `DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_NAME="${appName}"
`);

  writeFile(outDir, "scripts/fullstack-smoke.mjs", `import fs from "fs";

const required = [
  "app/api/transactions/route.ts",
  "app/api/transactions/[id]/route.ts",
  "app/api/settings/route.ts",
  "app/api/import/route.ts",
  "app/api/export/route.ts",
  "lib/db.ts",
  "lib/finance-service.ts",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  ".env.example"
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error("Missing full-stack file: " + file);
}

const schema = fs.readFileSync("prisma/schema.prisma", "utf8");
for (const model of ["Transaction", "Setting", "Category", "Budget", "SavingsGoal"]) {
  if (!schema.includes("model " + model)) throw new Error("Missing Prisma model: " + model);
}

console.log("Finance full-stack smoke test passed");
`);

  const files = [
    ["index.html", "Finance Full Preview", "html"],
    ["metadata.json", "Finance Metadata", "json"],
    ["data/asset-manifest.json", "Asset Manifest", "json"],
    ["public/images/dashboard.svg", "Dashboard Visual", "svg"],
    ["public/images/analytics.svg", "Analytics Visual", "svg"],
    ["public/images/settings.svg", "Settings Visual", "svg"],
    ["app/page.tsx", "Next App Page", "typescript"],
    ["app/admin/page.tsx", "Admin Page", "typescript"],
    ["app/editor/page.tsx", "Editor Page", "typescript"],
    ["app/api/transactions/route.ts", "Transactions API", "typescript"],
    ["lib/finance-store.ts", "Finance Store", "typescript"],
    ["prisma/schema.prisma", "Prisma Schema", "prisma"],
    ["scripts/smoke-test.mjs", "Smoke Test", "javascript"],
    ["scripts/fullstack-smoke.mjs", "Full-Stack Smoke Test", "javascript"],
    ["app/api/transactions/[id]/route.ts", "Transaction Detail API", "typescript"],
    ["app/api/settings/route.ts", "Settings API", "typescript"],
    ["app/api/import/route.ts", "Import API", "typescript"],
    ["app/api/export/route.ts", "Export API", "typescript"],
    ["lib/db.ts", "Prisma Client", "typescript"],
    ["lib/finance-service.ts", "Finance Service Layer", "typescript"],
    ["prisma/seed.ts", "Database Seed", "typescript"],
    [".env.example", "Environment Template", "text"],
    ["global.d.ts", "CSS Declaration File", "typescript"],
    ["package.json", "Package Manifest", "json"],
    ["Dockerfile", "Dockerfile", "docker"],
    ["README.md", "README", "markdown"]
  ];

  return files.map(([file, title, type]) => artifact(outDir, file, title, type));
}
