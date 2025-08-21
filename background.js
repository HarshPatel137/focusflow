
async function clearAllDynamicRules(){
  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    if (existing.length) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existing.map(r=>r.id) });
  } catch {}
}
async function ensureContentScriptOnAllTabs(){
  try {
    try {
      await chrome.scripting.registerContentScripts([{
        id: "ffl-auto",
        js: ["content.js"],
        matches: ["<all_urls>"],
        runAt: "document_idle",
        allFrames: false,
        persistAcrossSessions: true
      }]);
    } catch {}
    const tabs = await chrome.tabs.query({});
    for (const t of tabs){
      if (!t.id || !t.url) continue;
      if (!/^https?:\/\//.test(t.url)) continue;
      try { await chrome.scripting.executeScript({ target: { tabId: t.id }, files: ["content.js"] }); } catch {}
    }
  } catch {}
}
async function broadcastRefresh(){
  const tabs = await chrome.tabs.query({});
  for (const t of tabs){ try { chrome.tabs.sendMessage(t.id, { type: 'ffl:refresh' }, ()=>{}); } catch {} }
}
async function applyNow(){
  await clearAllDynamicRules();
  await ensureContentScriptOnAllTabs();
  await broadcastRefresh();
}
chrome.runtime.onInstalled.addListener(applyNow);
chrome.runtime.onStartup.addListener(applyNow);
chrome.storage.onChanged.addListener(async (changes, area)=>{ if (area==='sync' && changes.ffl) await applyNow(); });
chrome.tabs.onUpdated.addListener(async (tabId, info)=>{ if (info.status==='complete') await applyNow(); });
chrome.alarms.create('ffl_ping', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((a)=>{ if (a.name==='ffl_ping') applyNow(); });
chrome.runtime.onMessage.addListener(async (msg)=>{ if (msg?.type==='ffl:refresh') await applyNow(); });

chrome.runtime.onMessage.addListener((msg, sender)=>{ try{ if(msg&&msg.type==='ffl:close-tab' && sender.tab && sender.tab.id){ chrome.tabs.remove(sender.tab.id); } }catch{} });
