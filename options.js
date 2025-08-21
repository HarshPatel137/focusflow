
const DEFAULTS = {
  mode: 'off', from: '09:00', to: '17:00',
  blocked: {
    'youtube.com': true, 'netflix.com': true, 'tiktok.com': true, 'instagram.com': true,
    'twitter.com': true, 'facebook.com': true, 'reddit.com': true, 'discord.com': true,
    'twitch.tv': true, 'hulu.com': true, 'primevideo.com': true, 'pinterest.com': true
  },
  custom: []
};
async function load(){ const x = await chrome.storage.sync.get('ffl'); return { ...DEFAULTS, ...(x.ffl||{}) }; }
async function save(ffl){ await chrome.storage.sync.set({ ffl }); try{chrome.runtime.sendMessage({type:'ffl:refresh'},()=>{});}catch{} }
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
async function applyUI(){ const f = await load(); buildList(f, document.getElementById('list')); }
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
applyUI();
