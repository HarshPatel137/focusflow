
document.getElementById('back').onclick = ()=> history.back();
document.getElementById('close').onclick = ()=> window.close();
const p = new URLSearchParams(location.search);
const why = p.get('why') || 'Stay in your focus zone.';
document.getElementById('why').textContent = why;
