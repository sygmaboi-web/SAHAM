// ===== STOCKFLOW ELITE — APPLICATION LOGIC =====
(function(){
'use strict';
// ===== STATE =====
const LS=k=>JSON.parse(localStorage.getItem('sf_'+k)||'null');
const SS=(k,v)=>localStorage.setItem('sf_'+k,JSON.stringify(v));
let state={xp:LS('xp')||0,level:LS('level')||1,badges:LS('badges')||['first-login'],modulesRead:LS('modulesRead')||[],quizPassed:LS('quizPassed')||[],streak:LS('streak')||0,lastVisit:LS('lastVisit')||'',cash:LS('cash')??100000000,holdings:LS('holdings')||{},activities:LS('activities')||[],dailyQuests:LS('dailyQuests')||null,dailyQuestsDate:LS('dailyQuestsDate')||'',questsDone:LS('questsDone')||[],factChecks:LS('factChecks')||0,stockyQuestions:LS('stockyQuestions')||0,riskProfile:LS('riskProfile')||null,trades:LS('trades')||0};
function save(){Object.keys(state).forEach(k=>SS(k,state[k]))}
function today(){return new Date().toISOString().slice(0,10)}

// ===== STREAKS =====
function checkStreak(){const t=today();if(state.lastVisit===t)return;const y=new Date();y.setDate(y.getDate()-1);if(state.lastVisit===y.toISOString().slice(0,10)){state.streak++;if(state.streak>=7&&!state.badges.includes('streak-7')){earnBadge('streak-7')}}else if(state.lastVisit!==t){state.streak=1}state.lastVisit=t;save()}

// ===== XP & LEVEL =====
const LEVEL_THRESHOLDS=[0,500,1500,3500,6500,10000];
const LEVEL_NAMES=['Newbie','Pemula','Menengah','Mahir','Expert','Elite Master'];
function addXP(amount,reason){state.xp+=amount;const newLevel=LEVEL_THRESHOLDS.findIndex((t,i)=>state.xp<(LEVEL_THRESHOLDS[i+1]||Infinity));const lvl=Math.max(1,newLevel>0?newLevel:5);if(lvl>state.level){state.level=lvl;showCelebration(lvl)}state.level=lvl;showToast(`+${amount} XP — ${reason}`,'xp');addActivity(`⚡ +${amount} XP: ${reason}`);save();updateUI()}
function getXPForCurrentLevel(){const cur=LEVEL_THRESHOLDS[state.level-1]||0;const nxt=LEVEL_THRESHOLDS[state.level]||10000;return{cur:state.xp-cur,max:nxt-cur,pct:Math.min(100,((state.xp-cur)/(nxt-cur))*100)}}

// ===== BADGES =====
function earnBadge(id){if(state.badges.includes(id))return;state.badges.push(id);const b=BADGES_DEF.find(x=>x.id===id);showToast(`🏅 Badge: ${b?b.name:''}!`,'success');addActivity(`🏅 Badge earned: ${b?b.name:id}`);save();updateUI()}
function checkBadges(){if(state.modulesRead.length>=1&&!state.badges.includes('first-read'))earnBadge('first-read');const l1m=["1-1","1-2","1-3","1-4"];if(l1m.every(m=>state.modulesRead.includes(m))&&!state.badges.includes('all-l1-modules'))earnBadge('all-l1-modules');if(state.factChecks>=5&&!state.badges.includes('fact-checker'))earnBadge('fact-checker');if(state.stockyQuestions>=10&&!state.badges.includes('stocky-fan'))earnBadge('stocky-fan')}

// ===== ACTIVITIES =====
function addActivity(text){state.activities.unshift({text,time:new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})});if(state.activities.length>20)state.activities.pop();save()}

// ===== TOASTS =====
function showToast(msg,type='success'){const c=document.getElementById('toastContainer');const t=document.createElement('div');t.className=`toast toast-${type}`;t.textContent=msg;c.appendChild(t);setTimeout(()=>{t.classList.add('toast-exit');setTimeout(()=>t.remove(),300)},3000)}

// ===== CELEBRATION =====
function showCelebration(lvl){const o=document.getElementById('celebrationOverlay');o.classList.remove('hidden');document.getElementById('celebrationBadge').textContent=['','🌱','🏛️','📉','🧠','👑'][lvl]||'🎉';document.getElementById('celebrationTitle').textContent='LEVEL UP!';document.getElementById('celebrationMessage').textContent=`Selamat! Kamu naik ke Level ${lvl} — ${LEVEL_NAMES[lvl-1]}!`;document.getElementById('celebrationClose').onclick=()=>o.classList.add('hidden')}

// ===== NAVIGATION (SPA) =====
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active'));const el=document.getElementById('page-'+page);if(el)el.classList.add('active');const nl=document.querySelector(`[data-page="${page}"]`);if(nl)nl.classList.add('active');document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('active');window.location.hash=page}

document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.page)}));
document.getElementById('hamburgerBtn').addEventListener('click',()=>{document.getElementById('sidebar').classList.toggle('open');document.getElementById('sidebarOverlay').classList.toggle('active')});
document.getElementById('sidebarOverlay').addEventListener('click',()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebarOverlay').classList.remove('active')});

// ===== THEME TOGGLE =====
document.getElementById('themeToggle').addEventListener('click',()=>{const html=document.documentElement;const isDark=html.getAttribute('data-theme')==='dark';html.setAttribute('data-theme',isDark?'light':'dark');document.querySelector('.theme-label').textContent=isDark?'Light Mode':'Dark Mode';localStorage.setItem('sf_theme',isDark?'light':'dark')});
const savedTheme=localStorage.getItem('sf_theme');if(savedTheme){document.documentElement.setAttribute('data-theme',savedTheme);document.querySelector('.theme-label').textContent=savedTheme==='dark'?'Dark Mode':'Light Mode'}

// ===== UPDATE UI =====
function updateUI(){const xpInfo=getXPForCurrentLevel();document.getElementById('xpBarFill').style.width=xpInfo.pct+'%';document.getElementById('xpText').textContent=`${xpInfo.cur} / ${xpInfo.max}`;document.getElementById('userName').textContent=LS('userName')||'Investor';document.getElementById('userLevelBadge').textContent=`Level ${state.level} — ${LEVEL_NAMES[state.level-1]}`;document.getElementById('streakCount').textContent=state.streak;document.getElementById('mobileStreak').textContent=state.streak;document.getElementById('mobileLevelPill').textContent='Lv.'+state.level;
document.getElementById('dashXP').textContent=state.xp;document.getElementById('dashLevel').textContent=state.level;document.getElementById('dashBadges').textContent=state.badges.length;document.getElementById('dashStreak').textContent=state.streak;document.getElementById('dashGreeting').textContent=LS('userName')||'Investor';
const al=document.getElementById('activityList');if(state.activities.length>0){al.innerHTML=state.activities.map(a=>`<div class="activity-item"><span class="activity-icon">📌</span><span class="activity-text">${a.text}</span><span class="activity-time">${a.time}</span></div>`).join('')}
for(let i=1;i<=5;i++){const card=document.getElementById('levelCard'+i);const isUnlocked=i===1||state.quizPassed.includes(i-1);if(isUnlocked){card.classList.add('unlocked');card.classList.remove('locked');document.getElementById('levelStatus'+i).textContent=state.quizPassed.includes(i)?'✅ Selesai':'Terbuka';const btn=document.getElementById('quizBtn'+i);if(btn)btn.disabled=false}
const modules=card.querySelectorAll('.module-item');let readCount=0;modules.forEach(m=>{if(state.modulesRead.includes(m.dataset.module)){m.classList.add('read');readCount++}});const pct=(readCount/modules.length)*100;document.getElementById('levelProgress'+i).style.width=pct+'%'}
renderBadges();renderRoadmap();renderDailyQuests();updatePortfolioUI()}

// ===== ROADMAP =====
function renderRoadmap(){const c=document.getElementById('roadmapContainer');const icons=['🌱','🏛️','📉','🧠','👑'];c.innerHTML=icons.map((ic,i)=>{const lvl=i+1;const s=state.quizPassed.includes(lvl)?'completed':lvl<=state.level?'current':'locked';return`<div class="roadmap-node ${s}"><div class="roadmap-circle">${ic}</div><div class="roadmap-label">Level ${lvl}<br>${LEVEL_NAMES[lvl-1]}</div></div>`}).join('')}

// ===== DAILY QUESTS =====
function renderDailyQuests(){const t=today();if(state.dailyQuestsDate!==t){state.dailyQuests=[];const pool=[...DAILY_QUESTS_POOL];for(let i=0;i<4&&pool.length;i++){const idx=Math.floor(Math.random()*pool.length);state.dailyQuests.push(pool.splice(idx,1)[0])}state.dailyQuestsDate=t;state.questsDone=[];save()}
const ql=document.getElementById('questList');ql.innerHTML=state.dailyQuests.map((q,i)=>{const done=state.questsDone.includes(i);return`<div class="quest-item${done?' completed':''}"><div class="quest-check" data-qi="${i}">${done?'✓':''}</div><span class="quest-text">${q.text}</span><span class="quest-xp">+${q.xp} XP</span></div>`}).join('');
const now=new Date();const end=new Date(now);end.setHours(24,0,0,0);const diff=end-now;const hrs=Math.floor(diff/3600000);const mins=Math.floor((diff%3600000)/60000);const secs=Math.floor((diff%60000)/1000);document.getElementById('questTimer').textContent=`Reset: ${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`}
function completeQuest(action){if(!state.dailyQuests)return;state.dailyQuests.forEach((q,i)=>{if(q.action===action&&!state.questsDone.includes(i)){state.questsDone.push(i);addXP(q.xp,'Daily Quest');save();updateUI()}})}

// ===== MODULE READER =====
document.querySelectorAll('.module-read-btn').forEach(btn=>{btn.addEventListener('click',()=>{const mid=btn.dataset.module;const mod=MODULES_CONTENT[mid];if(!mod)return;document.getElementById('readerTitle').textContent=mod.title;document.getElementById('readerContent').innerHTML=mod.content;document.getElementById('moduleReaderOverlay').classList.remove('hidden');
document.getElementById('readerCompleteBtn').onclick=()=>{if(!state.modulesRead.includes(mid)){state.modulesRead.push(mid);addXP(50,'Baca: '+mod.title);completeQuest('read');checkBadges();save();updateUI()}document.getElementById('moduleReaderOverlay').classList.add('hidden')}})});
document.getElementById('readerClose').addEventListener('click',()=>document.getElementById('moduleReaderOverlay').classList.add('hidden'));

// ===== QUIZ ENGINE =====
let quizState={level:0,current:0,score:0,questions:[],answered:false};
function startQuiz(level){quizState={level,current:0,score:0,questions:QUIZZES[level]||[],answered:false};document.getElementById('quizSelect').classList.add('hidden');document.getElementById('quizContainer').classList.remove('hidden');document.getElementById('quizResult').classList.add('hidden');document.getElementById('quizQuestionCard').classList.remove('hidden');document.getElementById('quizLevelLabel').textContent=`Level ${level} Quiz`;showQuestion();navigate('quiz')}
function showQuestion(){const q=quizState.questions[quizState.current];if(!q)return showQuizResult();quizState.answered=false;document.getElementById('quizProgress').textContent=`Soal ${quizState.current+1}/${quizState.questions.length}`;document.getElementById('quizScoreDisplay').textContent=`Skor: ${quizState.score}`;document.getElementById('quizQuestionNumber').textContent=quizState.current+1;document.getElementById('quizQuestionText').textContent=q.q;document.getElementById('quizExplanation').classList.add('hidden');document.getElementById('quizNextBtn').classList.add('hidden');
const opts=document.getElementById('quizOptions');opts.innerHTML=q.o.map((o,i)=>`<div class="quiz-option" data-idx="${i}">${o}</div>`).join('');opts.querySelectorAll('.quiz-option').forEach(opt=>{opt.addEventListener('click',()=>{if(quizState.answered)return;quizState.answered=true;const idx=parseInt(opt.dataset.idx);const correct=idx===q.a;if(correct){quizState.score++;opt.classList.add('correct')}else{opt.classList.add('wrong');opts.querySelector(`[data-idx="${q.a}"]`).classList.add('correct')}document.getElementById('quizExplanation').innerHTML='💡 '+q.e;document.getElementById('quizExplanation').classList.remove('hidden');document.getElementById('quizNextBtn').classList.remove('hidden');document.getElementById('quizScoreDisplay').textContent=`Skor: ${quizState.score}`})})}
function showQuizResult(){const pct=Math.round((quizState.score/quizState.questions.length)*100);const passed=pct>=70;document.getElementById('quizQuestionCard').classList.add('hidden');document.getElementById('quizNextBtn').classList.add('hidden');document.getElementById('quizResult').classList.remove('hidden');document.getElementById('resultIcon').textContent=passed?'🎉':'😢';document.getElementById('resultTitle').textContent=passed?'Selamat! Kamu Lulus!':'Belum Berhasil';document.getElementById('resultMessage').textContent=passed?`Kamu menjawab ${quizState.score}/${quizState.questions.length} dengan benar!`:`Skor kamu ${pct}%. Butuh minimal 70% untuk lulus. Ayo coba lagi!`;document.getElementById('resultScore').textContent=`${quizState.score}/${quizState.questions.length} (${pct}%)`;
if(passed){const xpGain=quizState.level*100;document.getElementById('resultXP').textContent=`+${xpGain} XP`;if(!state.quizPassed.includes(quizState.level)){state.quizPassed.push(quizState.level);earnBadge('quiz-l'+quizState.level);addXP(xpGain,'Lulus Kuis Level '+quizState.level);completeQuest('quiz');save();updateUI()}document.getElementById('quizContinueBtn').classList.remove('hidden');document.getElementById('quizContinueBtn').onclick=()=>navigate('learning')}else{document.getElementById('resultXP').textContent='+20 XP (partisipasi)';addXP(20,'Kuis Level '+quizState.level);document.getElementById('quizContinueBtn').classList.add('hidden')}}
document.getElementById('quizNextBtn').addEventListener('click',()=>{quizState.current++;showQuestion()});
document.getElementById('quizRetryBtn').addEventListener('click',()=>startQuiz(quizState.level));
document.querySelectorAll('.quiz-start-btn').forEach(btn=>btn.addEventListener('click',()=>{const lvl=parseInt(btn.dataset.level);startQuiz(lvl)}));

// ===== VIRTUAL PORTFOLIO =====
let marketPrices={};
function initMarket(){STOCKS.forEach(s=>{if(!marketPrices[s.code])marketPrices[s.code]=s.price});renderMarket()}
function renderMarket(){const tb=document.getElementById('marketTableBody');tb.innerHTML=STOCKS.map(s=>{const price=marketPrices[s.code]||s.price;const change=((price-s.price)/s.price*100).toFixed(1);const cls=change>=0?'price-up':'price-down';return`<tr><td><strong>${s.code}</strong></td><td>${s.name}</td><td>Rp ${price.toLocaleString('id-ID')}</td><td class="${cls}">${change>=0?'+':''}${change}%</td><td><button class="btn btn-sm btn-buy market-buy-btn" data-code="${s.code}">Beli</button></td></tr>`}).join('');
tb.querySelectorAll('.market-buy-btn').forEach(btn=>btn.addEventListener('click',()=>openTradeModal(btn.dataset.code,'buy')))}

function openTradeModal(code,type){const s=STOCKS.find(x=>x.code===code);const price=marketPrices[code]||s.price;document.getElementById('tradeModal').classList.remove('hidden');document.getElementById('tradeModalTitle').textContent=type==='buy'?'Beli Saham':'Jual Saham';document.getElementById('tradeStockName').textContent=`${s.code} — ${s.name}`;document.getElementById('tradeStockPrice').textContent='Rp '+price.toLocaleString('id-ID');document.getElementById('tradeLotInput').value=1;document.getElementById('tradeTotalCost').textContent='Rp '+(price*100).toLocaleString('id-ID');
document.getElementById('tradeConfirmBuy').classList.toggle('hidden',type!=='buy');document.getElementById('tradeConfirmSell').classList.toggle('hidden',type!=='sell');
const lotInput=document.getElementById('tradeLotInput');lotInput.oninput=()=>{const lots=parseInt(lotInput.value)||1;document.getElementById('tradeTotalCost').textContent='Rp '+(price*100*lots).toLocaleString('id-ID')};
document.getElementById('tradeConfirmBuy').onclick=()=>{const lots=parseInt(lotInput.value)||1;const cost=price*100*lots;if(cost>state.cash){showToast('Cash tidak cukup!','error');return}state.cash-=cost;if(!state.holdings[code])state.holdings[code]={lots:0,avgPrice:0};const h=state.holdings[code];const totalShares=h.lots*100+lots*100;h.avgPrice=((h.avgPrice*h.lots*100)+cost)/totalShares;h.lots+=lots;state.trades++;if(state.trades===1)earnBadge('first-trade');completeQuest('trade');addXP(15,'Beli '+code);save();updateUI();closeTradeModal();showToast(`Berhasil beli ${lots} lot ${code}!`,'success')};
document.getElementById('tradeConfirmSell').onclick=()=>{const lots=parseInt(lotInput.value)||1;if(!state.holdings[code]||state.holdings[code].lots<lots){showToast('Lot tidak cukup!','error');return}const revenue=price*100*lots;state.cash+=revenue;const h=state.holdings[code];const pnl=revenue-(h.avgPrice*100*lots);h.lots-=lots;if(h.lots<=0)delete state.holdings[code];if(pnl>0&&!state.badges.includes('portfolio-profit'))earnBadge('portfolio-profit');addXP(15,'Jual '+code);state.trades++;save();updateUI();closeTradeModal();showToast(`Jual ${lots} lot ${code}. P&L: Rp ${pnl.toLocaleString('id-ID')}`,pnl>=0?'success':'warning')}}
function closeTradeModal(){document.getElementById('tradeModal').classList.add('hidden')}
document.getElementById('tradeModalClose').addEventListener('click',closeTradeModal);
document.getElementById('tradeCancelBtn').addEventListener('click',closeTradeModal);

function updatePortfolioUI(){let totalValue=state.cash;const hc=document.getElementById('holdingsContainer');if(Object.keys(state.holdings).length===0){hc.innerHTML='<div class="holdings-empty">Belum ada saham. Beli saham pertamamu!</div>'}else{let html='';Object.entries(state.holdings).forEach(([code,h])=>{const price=marketPrices[code]||STOCKS.find(s=>s.code===code).price;const value=price*h.lots*100;const cost=h.avgPrice*h.lots*100;const pnl=value-cost;const pnlPct=((pnl/cost)*100).toFixed(1);totalValue+=value;html+=`<div class="holding-item"><div class="holding-info"><h4>${code}</h4><span>${h.lots} lot @ Rp ${Math.round(h.avgPrice).toLocaleString('id-ID')}</span></div><div class="holding-pnl ${pnl>=0?'price-up':'price-down'}">Rp ${pnl.toLocaleString('id-ID')} (${pnl>=0?'+':''}${pnlPct}%)</div><button class="btn btn-sm btn-sell holding-sell-btn" data-code="${code}">Jual</button></div>`});hc.innerHTML=html;hc.querySelectorAll('.holding-sell-btn').forEach(btn=>btn.addEventListener('click',()=>openTradeModal(btn.dataset.code,'sell')))}
document.getElementById('portfolioCash').textContent='Rp '+state.cash.toLocaleString('id-ID');document.getElementById('portfolioTotal').textContent='Rp '+totalValue.toLocaleString('id-ID');const pnl=totalValue-100000000;const pnlPct=((pnl/100000000)*100).toFixed(1);const pnlEl=document.getElementById('portfolioPnL');pnlEl.textContent=`Rp ${pnl.toLocaleString('id-ID')} (${pnl>=0?'+':''}${pnlPct}%)`;pnlEl.className='pstat-value '+(pnl>0?'pstat-positive':pnl<0?'pstat-negative':'pstat-neutral');document.getElementById('portfolioTxCount').textContent=state.trades}

// ===== PANIC SIMULATOR =====
let panicState={scenario:null,day:0,value:100000000,decisions:[],timer:null,running:false,stopLoss:null};
document.querySelectorAll('.scenario-start-btn').forEach(btn=>btn.addEventListener('click',()=>{const sc=btn.dataset.scenario;panicState={scenario:sc,day:0,value:100000000,decisions:[],timer:null,running:true,stopLoss:null};document.getElementById('panicSelect').classList.add('hidden');document.getElementById('panicSimulation').classList.remove('hidden');document.getElementById('panicResult').classList.add('hidden');document.getElementById('panicScenarioLabel').textContent=PANIC_SCENARIOS[sc].name;nextPanicDay()}));
function nextPanicDay(){const sc=PANIC_SCENARIOS[panicState.scenario];if(panicState.day>=sc.days.length){endPanic();return}const day=sc.days[panicState.day];panicState.value=Math.round(panicState.value*(1+day.change/100));if(panicState.stopLoss!==null&&panicState.value<=panicState.stopLoss){clearInterval(panicState.timer);panicState.decisions.push('stop-loss');endPanic('stop-loss');return}document.getElementById('panicDay').textContent='Hari '+(panicState.day+1);document.getElementById('panicCurrentValue').textContent='Rp '+panicState.value.toLocaleString('id-ID');const pnl=panicState.value-100000000;const pnlPct=((pnl/100000000)*100).toFixed(1);document.getElementById('panicPnL').textContent=`Rp ${pnl.toLocaleString('id-ID')} (${pnlPct}%)`;document.getElementById('panicNewsText').textContent=day.news;drawPanicChart();
let seconds=15;document.getElementById('panicTimer').textContent='⏱ '+seconds+'s';clearInterval(panicState.timer);panicState.timer=setInterval(()=>{seconds--;document.getElementById('panicTimer').textContent='⏱ '+seconds+'s';if(seconds<=0){clearInterval(panicState.timer);panicState.decisions.push('hold');panicState.day++;nextPanicDay()}},1000)}
function drawPanicChart(){const canvas=document.getElementById('panicCanvas');const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);const sc=PANIC_SCENARIOS[panicState.scenario];let v=100000000;const pts=[{x:0,y:v}];for(let i=0;i<=panicState.day&&i<sc.days.length;i++){v=Math.round(v*(1+sc.days[i].change/100));pts.push({x:(i+1)/(sc.days.length)*canvas.width,y:v})}
const minV=Math.min(...pts.map(p=>p.y))*0.95;const maxV=Math.max(...pts.map(p=>p.y))*1.05;const mapY=v=>canvas.height-((v-minV)/(maxV-minV))*canvas.height*0.8-canvas.height*0.1;
ctx.strokeStyle='#ef4444';ctx.lineWidth=3;ctx.beginPath();pts.forEach((p,i)=>{const x=p.x||10;const y=mapY(p.y);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});ctx.stroke();
ctx.fillStyle='rgba(239,68,68,.1)';ctx.beginPath();ctx.moveTo(pts[0].x||10,mapY(pts[0].y));pts.forEach(p=>ctx.lineTo(p.x||10,mapY(p.y)));ctx.lineTo(pts[pts.length-1].x,canvas.height);ctx.lineTo(pts[0].x||10,canvas.height);ctx.fill()}

document.getElementById('panicSellBtn').addEventListener('click',()=>{clearInterval(panicState.timer);panicState.decisions.push('sell');endPanic()});
document.getElementById('panicStopLossBtn').addEventListener('click',()=>{if(!panicState.running){showToast('Simulasi belum dimulai.','warning');return}panicState.stopLoss=Math.round(panicState.value*0.9);showToast(`Stop Loss 10% dipasang pada Rp ${panicState.stopLoss.toLocaleString('id-ID')}`,'success');});
document.getElementById('panicHoldBtn').addEventListener('click',()=>{clearInterval(panicState.timer);panicState.decisions.push('hold');panicState.day++;nextPanicDay()});
document.getElementById('panicBuyBtn').addEventListener('click',()=>{clearInterval(panicState.timer);panicState.decisions.push('buy');panicState.value=Math.round(panicState.value*1.05);panicState.day++;nextPanicDay()});

function endPanic(reason){clearInterval(panicState.timer);panicState.running=false;document.getElementById('panicSimulation').classList.add('hidden');document.getElementById('panicResult').classList.remove('hidden');const lastDecision=panicState.decisions[panicState.decisions.length-1];const sc=PANIC_SCENARIOS[panicState.scenario];let finalVal=100000000;sc.days.forEach(d=>{finalVal=Math.round(finalVal*(1+d.change/100))});
const sold=reason==='stop-loss'||lastDecision==='sell';if(reason==='stop-loss'){document.getElementById('panicResultIcon').textContent='🛡️';document.getElementById('panicResultTitle').textContent='Stop Loss Triggered';document.getElementById('panicResultMessage').textContent=`Stop loss kamu aktif di Rp ${panicState.stopLoss.toLocaleString('id-ID')} dan menutup posisi secara disiplin pada Rp ${panicState.value.toLocaleString('id-ID')}. Ini adalah pelajaran risk management yang sangat berharga.`;if(!state.badges.includes('risk-manager'))earnBadge('risk-manager')}else if(sold){document.getElementById('panicResultIcon').textContent='😰';document.getElementById('panicResultTitle').textContent='Kamu Panic Sell!';document.getElementById('panicResultMessage').textContent=`Kamu menjual semua di Rp ${panicState.value.toLocaleString('id-ID')}. Padahal jika hold, portfolio akhirnya Rp ${finalVal.toLocaleString('id-ID')}. Pelajaran: emosi adalah musuh terbesar investor.`}else{document.getElementById('panicResultIcon').textContent='💎';document.getElementById('panicResultTitle').textContent='Diamond Hands! 💎';document.getElementById('panicResultMessage').textContent=`Kamu berhasil menahan posisi! Portfolio akhir: Rp ${finalVal.toLocaleString('id-ID')}. Market crash SELALU diikuti recovery. Kesabaran menghasilkan!`;if(!state.badges.includes('panic-survivor'))earnBadge('panic-survivor')}
document.getElementById('panicResultStats').innerHTML=`<p>Keputusanmu: ${panicState.decisions.map(d=>d==='sell'?'🏃 Jual':d==='buy'?'🛒 Beli':d==='stop-loss'?'🛡️ Stop Loss':'💎 Hold').join(', ')}</p>`;addXP(40,'Panic Simulator');save()}
document.getElementById('panicReplayBtn').addEventListener('click',()=>{document.getElementById('panicResult').classList.add('hidden');document.getElementById('panicSelect').classList.remove('hidden')});

// ===== FACT-CHECK =====
function searchFact(term){term=term.toLowerCase().trim();const key=Object.keys(FACT_DB).find(k=>term.includes(k)||k.includes(term));const rc=document.getElementById('factcheckResults');if(!key){rc.innerHTML=`<div class="fact-result-card"><h3>🤔 Tidak Ditemukan</h3><p>Istilah "${term}" belum ada di database. Coba istilah lain atau klik tag di atas.</p></div>`;return}
const f=FACT_DB[key];rc.innerHTML=`<div class="fact-result-card"><div class="fact-result-header"><h3>${f.title}</h3><span class="fact-danger-level danger-${f.danger}">${f.danger==='high'?'🔴 BAHAYA TINGGI':f.danger==='medium'?'🟡 WASPADA':'🟢 AMAN'}</span></div><div class="fact-section"><h4>📋 Penjelasan</h4><p>${f.desc}</p></div><div class="fact-section"><h4>❓ Mengapa Ini Penting?</h4><p>${f.why}</p></div><div class="fact-section"><h4>🛡️ Cara Menghindari/Menghadapi</h4><ul>${f.avoid.map(a=>'<li>'+a+'</li>').join('')}</ul></div></div>`;
state.factChecks++;completeQuest('factcheck');checkBadges();save()}
document.getElementById('factcheckSearchBtn').addEventListener('click',()=>searchFact(document.getElementById('factcheckInput').value));
document.getElementById('factcheckInput').addEventListener('keydown',e=>{if(e.key==='Enter')searchFact(e.target.value)});
document.querySelectorAll('.fact-tag').forEach(tag=>tag.addEventListener('click',()=>{document.getElementById('factcheckInput').value=tag.dataset.term;searchFact(tag.dataset.term)}));

// ===== RISK PROFILE =====
let riskState={current:0,scores:{c:0,a:0,e:0}};
document.getElementById('riskStartBtn').addEventListener('click',()=>{riskState={current:0,scores:{c:0,a:0,e:0}};document.getElementById('riskIntro').classList.add('hidden');document.getElementById('riskQuestionnaire').classList.remove('hidden');document.getElementById('riskResult').classList.add('hidden');showRiskQuestion()});
function showRiskQuestion(){if(riskState.current>=RISK_QUESTIONS.length){showRiskResult();return}const q=RISK_QUESTIONS[riskState.current];document.getElementById('riskProgressFill').style.width=((riskState.current+1)/RISK_QUESTIONS.length*100)+'%';document.getElementById('riskQuestionCounter').textContent=`Pertanyaan ${riskState.current+1} dari ${RISK_QUESTIONS.length}`;document.getElementById('riskQuestionText').textContent=q.q;
const opts=document.getElementById('riskOptions');opts.innerHTML=q.o.map((o,i)=>`<div class="risk-option" data-idx="${i}">${o.t}</div>`).join('');opts.querySelectorAll('.risk-option').forEach(opt=>{opt.addEventListener('click',()=>{const idx=parseInt(opt.dataset.idx);const s=q.o[idx].s;riskState.scores.c+=s.c;riskState.scores.a+=s.a;riskState.scores.e+=s.e;riskState.current++;showRiskQuestion()})})}
function showRiskResult(){document.getElementById('riskQuestionnaire').classList.add('hidden');document.getElementById('riskResult').classList.remove('hidden');const{c,a,e}=riskState.scores;let type,badge,desc,strategy;
if(e>c&&e>a){type='Emotional Investor';badge='😰';desc='Kamu cenderung membuat keputusan berdasarkan emosi. FOMO dan panic selling adalah tantangan terbesarmu.';strategy=`<h4>🎯 Strategi untuk Emotional Investor</h4><ul><li><strong>Wajib punya trading plan TERTULIS</strong> sebelum setiap transaksi</li><li><strong>Gunakan stop loss otomatis</strong> — jangan manual, karena kamu akan ragu</li><li><strong>Batasi cek portfolio</strong> maks 1x sehari</li><li><strong>Dollar Cost Averaging (DCA)</strong> — hilangkan keputusan timing</li><li><strong>Jurnal emosi:</strong> Catat perasaanmu saat trading</li><li><strong>Hindari saham volatile</strong> — fokus blue chip</li></ul>`}else if(a>c){type='Aggressive Investor';badge='🦁';desc='Kamu suka ambil risiko tinggi untuk return tinggi. Berani, tapi perlu kontrol agar tidak overexposed.';strategy=`<h4>🎯 Strategi untuk Aggressive Investor</h4><ul><li><strong>Position sizing ketat:</strong> Maks 10% modal per posisi</li><li><strong>Risk-reward ratio minimal 1:2</strong> untuk setiap trade</li><li><strong>Diversifikasi wajib:</strong> Min 5 sektor berbeda</li><li><strong>Alokasi 70% growth stocks, 30% defensive</strong></li><li><strong>Review dan rebalance bulanan</strong></li><li><strong>Jangan pernah trading dengan uang pinjaman</strong></li></ul>`}else{type='Conservative Investor';badge='🛡️';desc='Kamu mengutamakan keamanan modal. Sabar dan hati-hati — tapi jangan terlalu takut sampai miss opportunity.';strategy=`<h4>🎯 Strategi untuk Conservative Investor</h4><ul><li><strong>Fokus blue chip & dividend stocks</strong> (BBCA, TLKM, dll)</li><li><strong>Alokasi: 40% saham, 40% obligasi, 20% deposito</strong></li><li><strong>DCA rutin</strong> — konsistensi lebih penting dari timing</li><li><strong>Target return realistis:</strong> 10-15% per tahun</li><li><strong>Sesekali ambil 5-10% untuk growth stocks</strong> agar tidak ketinggalan</li><li><strong>Review tahunan</strong>, jangan terlalu sering trading</li></ul>`}
document.getElementById('riskResultBadge').textContent=badge;document.getElementById('riskResultType').textContent=type;document.getElementById('riskResultDesc').textContent=desc;document.getElementById('riskStrategy').innerHTML=strategy;state.riskProfile=type;if(!state.badges.includes('risk-profile'))earnBadge('risk-profile');completeQuest('riskprofile');addXP(50,'Risk Profile');save();updateUI()}
document.getElementById('riskRetakeBtn').addEventListener('click',()=>{document.getElementById('riskResult').classList.add('hidden');document.getElementById('riskIntro').classList.remove('hidden')});

// ===== AI TUTOR STOCKY =====
function sendToStocky(msg){if(!msg.trim())return;const mc=document.getElementById('chatMessages');mc.innerHTML+=`<div class="chat-message user-message"><div class="chat-avatar user-msg-avatar">🧑</div><div class="chat-bubble"><p>${msg}</p></div></div>`;
const key=Object.keys(STOCKY_RESPONSES).find(k=>msg.toLowerCase().includes(k));let reply;if(key){reply=STOCKY_RESPONSES[key].a}else{const fallbacks=["Pertanyaan bagus! 🤔 Sayangnya saya belum punya jawaban spesifik untuk itu. Coba tanyakan tentang: PER, PBV, diversifikasi, stop loss, atau istilah investasi lainnya.","Hmm, saya perlu belajar lebih banyak tentang itu! 📚 Tapi saya bisa bantu jelaskan konsep dasar saham, rasio keuangan, dan strategi investasi. Coba tanya yang lain!","Topik menarik! Satu hal yang pasti: <strong>jangan pernah investasi tanpa riset</strong>. Coba gunakan Fact-Check Tool atau Stock Analysis Dashboard untuk info lebih detail. 🔍"];reply=fallbacks[Math.floor(Math.random()*fallbacks.length)]}
setTimeout(()=>{mc.innerHTML+=`<div class="chat-message bot-message"><div class="chat-avatar bot-avatar">🤖</div><div class="chat-bubble"><p>${reply}</p></div></div>`;mc.scrollTop=mc.scrollHeight},500);
state.stockyQuestions++;completeQuest('stocky');checkBadges();save();document.getElementById('chatInput').value=''}
document.getElementById('chatSendBtn').addEventListener('click',()=>sendToStocky(document.getElementById('chatInput').value));
document.getElementById('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendToStocky(e.target.value)});
document.querySelectorAll('.suggestion-chip').forEach(chip=>chip.addEventListener('click',()=>sendToStocky(chip.dataset.q)));

// ===== BADGES RENDER =====
function renderBadges(){const grid=document.getElementById('badgesGrid');grid.innerHTML=BADGES_DEF.map(b=>{const earned=state.badges.includes(b.id);return`<div class="badge-card ${earned?'earned':'locked'}"><div class="badge-icon">${b.icon}</div><h3>${b.name}</h3><p>${b.desc}</p>${earned?'<span class="badge-earned-tag">✓ Earned</span>':''}</div>`}).join('')}

// ===== STOCK ANALYSIS =====
function analyzeStock(code){code=code.toUpperCase().trim();const s=STOCKS.find(x=>x.code===code);if(!s){showToast('Saham '+code+' tidak ditemukan.','warning');return}const d=document.getElementById('analysisDashboard');d.classList.remove('hidden');document.getElementById('analysisStockName').textContent=s.name;document.getElementById('analysisStockCode').textContent=s.code;document.getElementById('analysisPrice').textContent='Rp '+(marketPrices[s.code]||s.price).toLocaleString('id-ID');const ch=((Math.random()-0.3)*4).toFixed(1);document.getElementById('analysisChange').textContent=(ch>=0?'+':'')+ch+'%';document.getElementById('analysisChange').style.color=ch>=0?'var(--green)':'var(--red)';
document.getElementById('metricPER').textContent=s.per+(s.per>0?'x':'x (Rugi)');document.getElementById('metricPBV').textContent=s.pbv+'x';document.getElementById('metricROE').textContent=s.roe+'%';document.getElementById('metricDER').textContent=s.der+'x';
document.getElementById('metricPERVerdict').textContent=s.per<0?'Negatif':s.per<10?'Murah':s.per<20?'Wajar':'Premium';
document.getElementById('metricPBVVerdict').textContent=s.pbv<1?'Undervalued':s.pbv<3?'Wajar':'Premium';
document.getElementById('metricROEVerdict').textContent=s.roe<0?'Negatif':s.roe>15?'Bagus':'Moderat';
document.getElementById('metricDERVerdict').textContent=s.sector==='Banking'?'Normal bank':s.der>2?'Tinggi':'Wajar';
completeQuest('analysis');addXP(15,'Analisis '+code);save()}
document.getElementById('analysisSearchBtn').addEventListener('click',()=>analyzeStock(document.getElementById('analysisInput').value));
document.getElementById('analysisInput').addEventListener('keydown',e=>{if(e.key==='Enter')analyzeStock(e.target.value)});
document.querySelectorAll('.analysis-pick').forEach(p=>p.addEventListener('click',()=>{document.getElementById('analysisInput').value=p.dataset.stock;analyzeStock(p.dataset.stock)}));

document.getElementById('eligibilityCheckBtn').addEventListener('click',()=>{const per=parseFloat(document.getElementById('eligibilityPER').value);const pbv=parseFloat(document.getElementById('eligibilityPBV').value);const bvps=parseFloat(document.getElementById('eligibilityBVPS').value);const roe=parseFloat(document.getElementById('eligibilityROE').value);const der=parseFloat(document.getElementById('eligibilityDER').value);const divYield=parseFloat(document.getElementById('eligibilityDivYield').value);const eps=parseFloat(document.getElementById('eligibilityEPS').value);const price=parseFloat(document.getElementById('eligibilityPrice').value);if(Number.isNaN(per)||Number.isNaN(pbv)||Number.isNaN(bvps)||Number.isNaN(roe)||Number.isNaN(der)||Number.isNaN(divYield)||Number.isNaN(eps)||Number.isNaN(price)){showToast('Lengkapi semua metrik untuk kelayakan saham.','warning');return}const result=evaluateStockEligibility({per,pbv,bvps,roe,der,divYield,eps,price});displayEligibilityResult(result)});
document.getElementById('eligibilityResetBtn').addEventListener('click',()=>{['eligibilityPER','eligibilityPBV','eligibilityBVPS','eligibilityROE','eligibilityDER','eligibilityDivYield','eligibilityEPS','eligibilityPrice'].forEach(id=>document.getElementById(id).value='');document.getElementById('eligibilityResult').classList.add('hidden');});

function evaluateStockEligibility(data){let score=0;const notes=[];
if(data.per<0){notes.push('PER negatif menunjukkan perusahaan merugi. Hati-hati.');score+=0}else if(data.per<=12){score+=18;notes.push('PER rendah bagus jika bukan karena penurunan pendapatan.');}else if(data.per<=20){score+=14;notes.push('PER wajar untuk banyak sektor.');}else if(data.per<=30){score+=8;notes.push('PER tinggi. Pastikan pertumbuhan nyata.');}else{score+=2;notes.push('PER sangat tinggi. Perlu analisis lebih dalam.');}
if(data.pbv>0){if(data.pbv<=1){score+=18;notes.push('PBV di bawah 1 menunjukkan valuasi menarik.');}else if(data.pbv<=3){score+=14;notes.push('PBV wajar.');}else if(data.pbv<=5){score+=8;notes.push('PBV premium. Perlu moat kuat.');}else{score+=2;notes.push('PBV sangat tinggi. Pastikan bukan hype.');}}else{score+=0;notes.push('PBV tidak valid.');}
if(data.bvps>0&&data.price>0){const priceToBook=data.price/data.bvps;if(priceToBook<=3){score+=12;notes.push('Harga relatif terhadap BVPS masih dalam level konservatif.');}else if(priceToBook<=5){score+=8;notes.push('Price-to-book tinggi. Pastikan growth support.');}else{score+=2;notes.push('Harga jauh di atas BVPS — waspada overvaluation.');}}else{notes.push('BVPS atau harga tidak valid.');}
if(data.roe>=15){score+=18;notes.push('ROE kuat, perusahaan efisien mengelola modal.');}else if(data.roe>=10){score+=12;notes.push('ROE cukup baik.');}else if(data.roe>=5){score+=6;notes.push('ROE rendah. Cek profitabilitas.');}else{score+=0;notes.push('ROE sangat rendah/negatif. Ini red flag.');}
if(data.der<1){score+=12;notes.push('Leverage rendah. Profil risiko lebih konservatif.');}else if(data.der<=2){score+=8;notes.push('Leverage moderat.');}else if(data.der<=3){score+=4;notes.push('Leverage tinggi. Perusahaan lebih rentan gejolak.');}else{score+=0;notes.push('DER sangat tinggi. Risiko finansial tinggi.');}
if(data.divYield>=4){score+=10;notes.push('Dividen menarik, memberi buffer total return.');}else if(data.divYield>=2){score+=6;notes.push('Dividen wajar.');}else if(data.divYield>=1){score+=3;notes.push('Dividen rendah. Mungkin saham growth.');}else{score+=0;notes.push('Dividen minimal/0%. Harus bergantung pada capital gain.');}
if(data.eps>=0){score+=12;notes.push('EPS positif menunjukkan profitabilitas tercatat.');}else{score-=5;notes.push('EPS negatif. Perusahaan rugi dalam 3 tahun terakhir.');}
const maxScore=100;const normalized=Math.max(0,Math.min(100,Math.round(score)));
let verdict='Perlu Evaluasi';let color='var(--yellow)';if(normalized>=80){verdict='Layak untuk riset lanjut';color='var(--green)';}else if(normalized>=60){verdict='Cukup menarik, cek lebih dalam';color='var(--accent)';}else{verdict='Belum ideal — hati-hati';color='var(--red)';}
return{score:normalized,verdict,color,notes}} 

function displayEligibilityResult(result){const wrapper=document.getElementById('eligibilityResult');wrapper.classList.remove('hidden');document.getElementById('eligibilityVerdict').textContent=`${result.verdict} — Skor ${result.score}/100`;document.getElementById('eligibilityVerdict').style.color=result.color;document.getElementById('eligibilitySummary').innerHTML=`<strong>Kesimpulan:</strong> ${result.score>=80?'Stock ini memenuhi banyak syarat awal untuk layak ditelaah lagi.':'Stock ini punya beberapa catatan penting. Gunakan ini sebagai filter awal saja.'}`;document.getElementById('eligibilityDetails').innerHTML=`<ul>${result.notes.map(n=>`<li>${n}</li>`).join('')}</ul>`;} 

function simulateMarketMove(stock) {
    const baseVolatility = {
        'Banking': 0.003, 'Telco': 0.004, 'Multi-sector': 0.005,
        'Consumer': 0.004, 'Tech': 0.012, 'Mining': 0.009, 'Energy': 0.008
    }[stock.sector] || 0.005;

    const drift = (Math.random() - 0.5) * baseVolatility;
    const marketTrend = (Math.random() - 0.48) * 0.002; 
    const change = drift + marketTrend;
    const price = marketPrices[stock.code] || stock.price;
    
    let next = Math.max(50, Math.round(price * (1 + change)));
    if (next < 500) next = Math.round(next / 2) * 2;
    else if (next < 2000) next = Math.round(next / 5) * 5;
    else if (next < 5000) next = Math.round(next / 10) * 10;
    else next = Math.round(next / 25) * 25;
    return next;
}

document.getElementById('refreshMarket').addEventListener('click',()=>{STOCKS.forEach(s=>{marketPrices[s.code]=simulateMarketMove(s)});renderMarket();updatePortfolioUI();showToast('Harga pasar diperbarui dengan pergerakan wajar.','success')});
document.getElementById('resetPortfolio').addEventListener('click',()=>{if(!confirm('Reset portfolio ke Rp100 juta?'))return;state.cash=100000000;state.holdings={};state.trades=0;save();updateUI();showToast('Portfolio direset!','success')});

// ===== INIT =====
function init() {
    checkStreak();
    initMarket();
    if (!state.badges.includes('first-login')) earnBadge('first-login');
    updateUI();

    const hash = window.location.hash.slice(1);
    if (hash) navigate(hash);

    setInterval(renderDailyQuests, 60000);

    // FITUR BARU: Update harga pasar otomatis setiap 60 detik (1 Menit)
    setInterval(() => {
        STOCKS.forEach(s => { marketPrices[s.code] = simulateMarketMove(s); });
        renderMarket();
        updatePortfolioUI();
        const marketHeader = document.querySelector('.market-card .card-header h2');
        if(marketHeader) {
            marketHeader.innerHTML = '📊 Pasar Saham <span style="font-size:0.7rem; color:var(--green); font-weight:normal; margin-left:8px;">Live Updated 🟢</span>';
            setTimeout(() => { marketHeader.innerHTML = '📊 Pasar Saham'; }, 2000);
        }
    }, 60000);
}
init();
})();
