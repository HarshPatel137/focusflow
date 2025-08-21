
const DEFAULTS = {
  mode: 'off',
  from: '09:00',
  to: '17:00',
  blocked: {
    'youtube.com': true, 'netflix.com': true, 'tiktok.com': true, 'instagram.com': true,
    'twitter.com': true, 'facebook.com': true, 'reddit.com': true, 'discord.com': true,
    'twitch.tv': true, 'hulu.com': true, 'primevideo.com': true, 'pinterest.com': true
  },
  custom: [],
  pomodoro: { state: 'idle', until: 0, lengthMin: 25, breakMin: 5 }
};

function formatMMSS(ms){
  const s = Math.max(0, Math.floor(ms/1000));
  const m = Math.floor(s/60);
  const r = s%60;
  return (''+m).padStart(2,'0')+':'+(''+r).padStart(2,'0');
}
function ring(el, pct){
  const r=18, c=2*Math.PI*r, off=c*(1-Math.min(1,Math.max(0,pct)));
  el.setAttribute('stroke-dasharray', c);
  el.setAttribute('stroke-dashoffset', off);
}

async function load(){ const x = await chrome.storage.sync.get('ffl'); return { ...DEFAULTS, ...(x.ffl||{}) }; }
async function save(ffl){
  await chrome.storage.sync.set({ ffl });
  try{ chrome.runtime.sendMessage({type:'ffl:refresh'}, ()=>{}); }catch{}
  showToast('Saved ✓'); pingTabs();
}

function buildList(ffl, root){
  root.innerHTML='';
  const all = Object.assign({}, ffl.blocked);
  ffl.custom.forEach(d=> all[d]=true);
  Object.keys(all).sort().forEach(host=>{
    const div=document.createElement('label');div.className='chip';
    const checked = ffl.blocked[host] || ffl.custom.includes(host);
    div.innerHTML=`<input type="checkbox" ${checked?'checked':''}><span>${host}</span>`;
    root.appendChild(div);
    div.querySelector('input').addEventListener('change', async (e)=>{
      const on=e.target.checked;
      if (ffl.blocked.hasOwnProperty(host)) ffl.blocked[host]=on;
      else {
        if (on && !ffl.custom.includes(host)) ffl.custom.push(host);
        if (!on && ffl.custom.includes(host)) ffl.custom = ffl.custom.filter(x=>x!==host);
      }
      await save(ffl);
    });
  });
}

async function applyUI(){
  const ffl = await load();
  document.querySelectorAll('input[name="mode"]').forEach(r=> r.checked = r.value===ffl.mode);
  document.getElementById('from').value = ffl.from;
  document.getElementById('to').value = ffl.to;
  document.getElementById('fpState').textContent = ffl.mode==='off' ? 'Off' : (ffl.mode==='always'?'Always On':'Scheduled');
  buildList(ffl, document.getElementById('list'));
  tickPomo(ffl);
}

function wire(){
  document.getElementById('saveSchedule').onclick = async ()=>{
    const ffl = await load();
    ffl.mode = document.querySelector('input[name="mode"]:checked')?.value || 'off';
    ffl.from = document.getElementById('from').value;
    ffl.to = document.getElementById('to').value;
    await save(ffl);
    document.getElementById('fpState').textContent = ffl.mode==='off' ? 'Off' : (ffl.mode==='always'?'Always On':'Scheduled');
  };
  document.getElementById('addDomain').onclick = async ()=>{
    const input = document.getElementById('customDomain');
    const host = input.value.trim().toLowerCase().replace(/^https?:\/\//,'');
    if (!host) return;
    const ffl = await load();
    if (!ffl.custom.includes(host)) ffl.custom.push(host);
    input.value='';
    await save(ffl);
    await applyUI();
  };
  document.getElementById('pomoStart').onclick = async ()=>{
    const ffl = await load();
    ffl.pomodoro.state='work';
    ffl.pomodoro.until=Date.now()+ffl.pomodoro.lengthMin*60*1000;
    await save(ffl);
    tickPomo(ffl);
  };
  document.getElementById('pomoBreak').onclick = async ()=>{
    const ffl = await load();
    ffl.pomodoro.state='break';
    ffl.pomodoro.until=Date.now()+ffl.pomodoro.breakMin*60*1000;
    await save(ffl);
    tickPomo(ffl);
  };
  document.getElementById('pomoStop').onclick = async ()=>{
    const ffl = await load();
    ffl.pomodoro.state='idle';
    ffl.pomodoro.until=0;
    await save(ffl);
    tickPomo(ffl);
  };
}

async function tickPomo(fflIn){
  let ffl = fflIn || await load();
  const stateEl = document.getElementById('pomoState');
  const clockEl = document.getElementById('pomoClock');
  const ringEl = document.getElementById('pomoRing');
  const now = Date.now();
  if (ffl.pomodoro.state==='idle' || !ffl.pomodoro.until || now>=ffl.pomodoro.until){
    if (ffl.pomodoro.state!=='idle'){ ffl.pomodoro.state='idle'; ffl.pomodoro.until=0; await save(ffl); }
    stateEl.textContent='Idle';
    clockEl.textContent = formatMMSS(ffl.pomodoro.lengthMin*60*1000);
    ring(ringEl, 0);
  } else {
    const total = (ffl.pomodoro.state==='work'?ffl.pomodoro.lengthMin:ffl.pomodoro.breakMin)*60*1000;
    const left = ffl.pomodoro.until - now;
    stateEl.textContent = ffl.pomodoro.state==='work' ? 'Focusing' : 'Break';
    clockEl.textContent = formatMMSS(left);
    ring(ringEl, 1 - (left/total));
    setTimeout(()=> tickPomo(), 500);
  }
}

wire();
applyUI();

function showToast(text){
  const t = document.createElement('div');
  t.textContent = text;
  Object.assign(t.style,{position:'fixed',bottom:'10px',left:'50%',transform:'translateX(-50%)',background:'#16a34a',color:'#fff',padding:'8px 12px',borderRadius:'10px',boxShadow:'0 10px 24px rgba(22,163,74,.4)',zIndex:9999});
  document.body.appendChild(t);
  setTimeout(()=>{ t.style.transition='opacity .4s ease'; t.style.opacity='0'; setTimeout(()=>t.remove(),400); }, 900);
}

async function pingTabs(){
  try{
    const tabs = await chrome.tabs.query({});
    for (const t of tabs){ try{ chrome.tabs.sendMessage(t.id, {type:'ffl:refresh'}, ()=>{}); }catch{} }
  }catch{}
}
