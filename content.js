
function hostname(u){ try{ return new URL(u||location.href).hostname.replace(/^www\./,''); }catch{ return ''; } }
async function loadCfg(){ const d = await chrome.storage.sync.get('ffl'); return d.ffl || {}; }
async function loadLocal(){ const d = await chrome.storage.local.get('fflLocal'); return d.fflLocal || { allowUntil: {} }; }
async function saveLocal(x){ await chrome.storage.local.set({ fflLocal: x }); }
function ensureStyles(){
  if (document.getElementById('ffl-style')) return;
  const css = `#ffl-overlay,#ffl-modal{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(15,23,42,.86)}
  .ffl-card{background:linear-gradient(135deg,#ef44441a,#3b82f61a);border:1px solid #1f2937;border-radius:18px;padding:24px;text-align:center;color:#e5e7eb;box-shadow:0 20px 60px rgba(0,0,0,.5);width:min(720px,92vw);font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .ffl-title{font-weight:800;font-size:24px;margin-bottom:8px;letter-spacing:.4px}
  .ffl-sub{font-size:18px;margin-bottom:16px;color:#cbd5e1}
  .btn{background:#3b82f6;color:#fff;border:none;border-radius:12px;padding:10px 14px;cursor:pointer;box-shadow:0 6px 16px rgba(59,130,246,.35)}
  .btn.secondary{background:#64748b}`;
  const style = document.createElement('style'); style.id='ffl-style'; style.textContent = css;
  document.documentElement.appendChild(style);
}


function inFocusPeriod(ffl){
  if (ffl.mode==='always') return true;
  if (ffl.mode!=='schedule') return false;
  const now = new Date();
  const cur = now.getHours()*60 + now.getMinutes();
  const [fh,fm]= (ffl.from||'09:00').split(':').map(Number);
  const [th,tm]= (ffl.to||'17:00').split(':').map(Number);
  const start = fh*60+fm, end = th*60+tm;
  return (start <= end) ? (cur>=start && cur<=end) : (cur>=start || cur<=end);
}
function isBlockedHost(ffl, host){
  const set = new Set(Object.keys(ffl.blocked||{}).filter(h=>ffl.blocked[h]));
  (ffl.custom||[]).forEach(h=> set.add(h));
  const parent = host.replace(/^.*?\./,'');
  return set.has(host) || set.has(parent);
}
function removeOverlays(){
  document.getElementById('ffl-overlay')?.remove();
  document.getElementById('ffl-modal')?.remove();
}
function ensureOverlay(text){ ensureStyles();
  removeOverlays();
  const wrap = document.createElement('div'); wrap.id='ffl-overlay'; wrap.className='fade-in';
  wrap.innerHTML = `<div class="ffl-card"><div class="ffl-title">${text}</div><div class="ffl-sub">Stay in your focus zone.</div>
  <div class="row" style="justify-content:center">
    <button class="btn" id="ffl-back">Go Back</button>
    <button class="btn secondary" id="ffl-close">Close Tab</button>
  </div></div>`;
  document.documentElement.appendChild(wrap);
  document.getElementById('ffl-back').onclick = ()=> history.back();
  document.getElementById('ffl-close').onclick = (e)=>{ e.preventDefault(); try{ chrome.runtime.sendMessage({type:'ffl:close-tab'}, ()=>{}); }catch{} removeOverlays(); };
}
function ensureConfirm(text){ ensureStyles();
  removeOverlays();
  const wrap = document.createElement('div'); wrap.id='ffl-modal'; wrap.className='fade-in';
  wrap.innerHTML = `<div class="ffl-card"><div class="ffl-title">${text}</div>
  <div class="ffl-sub">You're in a focus session. Do you still want to open this site?</div>
  <div class="row" style="justify-content:center">
    <button class="btn secondary" id="ffl-cancel">Close Tab</button>
    <button class="btn" id="ffl-continue">Continue</button>
  </div></div>`;
  document.documentElement.appendChild(wrap);
  document.getElementById('ffl-cancel').onclick = (e)=>{ e.preventDefault(); try{ chrome.runtime.sendMessage({type:'ffl:close-tab'}, ()=>{}); }catch{} removeOverlays(); };
  document.getElementById('ffl-continue').onclick = async ()=>{
    const host = hostname();
    const local = await loadLocal();
    const until = Date.now() + 5*60*1000; // 5 min bypass
    local.allowUntil[host] = until;
    await saveLocal(local);
    removeOverlays();
  };
}

async function apply(){
  const ffl = await loadCfg();
  const host = hostname();
  const local = await loadLocal();
  const now = Date.now();
  for (const k of Object.keys(local.allowUntil||{})){ if ((local.allowUntil[k]||0) < now) delete local.allowUntil[k]; }
  await saveLocal(local);

  if (!host || !isBlockedHost(ffl, host)){ removeOverlays(); return; }
  const inFP = inFocusPeriod(ffl);
  const inPomo = ffl.pomodoro && ffl.pomodoro.state==='work' && (ffl.pomodoro.until||0) > now;

  if (inFP){
    ensureOverlay(`${host} blocked by FocusFlow`);
  } else if (inPomo){
    if (!local.allowUntil[host] || local.allowUntil[host] < now){
      ensureConfirm(`${host} while focusing?`);
    } else {
      removeOverlays();
    }
  } else {
    removeOverlays();
  }
}

apply();
chrome.runtime.onMessage.addListener((msg)=>{ if (msg?.type==='ffl:refresh') apply(); });
