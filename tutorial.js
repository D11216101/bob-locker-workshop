
'use strict';
(() => {
 const storageKey = 'ibm-bob-locker-tutorial-progress-v2';
 const boxes = Array.from(document.querySelectorAll('[data-progress]'));
 const toast = document.getElementById('toast');
 // Expand optional prompts for printing, then restore the learner's view.
 let printDetails = [];
 window.addEventListener('beforeprint', () => {
   if (printDetails.length) return;
   printDetails = [...document.querySelectorAll('details')].map(el => [el, el.open]);
   printDetails.forEach(([el]) => { el.open = true; });
 });
 window.addEventListener('afterprint', () => {
   printDetails.forEach(([el, open]) => { el.open = open; });
   printDetails = [];
 });
 let toastTimer;
 function announce(message) {
   toast.textContent = message; toast.classList.add('visible');
   clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('visible'), 3200);
 }
 function storageWarning() { document.getElementById('storage-note').hidden = false; }
 function update() {
   const done = boxes.filter(box => box.checked).length;
   document.getElementById('progress-text').textContent = '已完成 ' + done + '／' + boxes.length + ' 項';
   const bar = document.getElementById('progress-bar'); bar.max = boxes.length; bar.value = done;
   document.querySelectorAll('[data-count]').forEach(el => {
     const list = boxes.filter(box => box.id.startsWith(el.dataset.count + '-'));
     el.textContent = list.filter(box => box.checked).length + '／' + list.length;
   });
 }
 try {
   const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
   if (saved && typeof saved === 'object') boxes.forEach(box => { box.checked = saved[box.id] === true; });
 } catch { storageWarning(); }
 boxes.forEach(box => box.addEventListener('change', () => {
   update();
   try { localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(boxes.map(b => [b.id, b.checked])))); }
   catch { storageWarning(); }
 }));
 document.getElementById('reset-progress').addEventListener('click', () => {
   if (!window.confirm('確定重設這份教學的學習進度？只會清除本教學的驗收勾選，不會清除包裹櫃資料庫。')) return;
   boxes.forEach(box => { box.checked = false; });
   try { localStorage.removeItem(storageKey); } catch { storageWarning(); }
   update(); announce('已重設本教學的學習進度');
 });
 document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
   const block = document.getElementById(button.dataset.copy);
   const help = button.closest('.prompt').querySelector('.copy-help');
   try {
     if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
     await navigator.clipboard.writeText(block.textContent);
     help.hidden = true; announce('提示詞已複製');
     button.textContent = '已複製 ✓';
     setTimeout(() => { button.textContent = '複製提示詞 ⧉'; }, 2200);
   } catch {
     const range = document.createRange(); range.selectNodeContents(block);
     const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
     help.hidden = false; announce('請手動複製已選取的提示詞');
   }
 }));
 const sidebar = document.querySelector('.sidebar');
 const toggle = document.querySelector('.menu-toggle');
 toggle.addEventListener('click', () => {
   const open = toggle.getAttribute('aria-expanded') !== 'true';
   toggle.setAttribute('aria-expanded', String(open)); sidebar.classList.toggle('menu-open', open);
   toggle.querySelector('span').textContent = open ? '－' : '＋';
 });
 const links = [...document.querySelectorAll('nav a')];
 function highlight(id) {
   links.forEach(link => {
     const active = link.hash === '#' + id;
     link.classList.toggle('active', active);
     if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
   });
 }
 links.forEach(link => link.addEventListener('click', () => {
   highlight(link.hash.slice(1));
   if (window.matchMedia('(max-width:720px)').matches) {
     sidebar.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); toggle.querySelector('span').textContent = '＋';
   }
 }));
 let scrollPending = false;
 function updateChapter() {
   const sections = [...document.querySelectorAll('main>section[id]')];
   const current = sections.filter(section => section.getBoundingClientRect().top <= 135).pop() || sections[0];
   if (current) highlight(current.id);
   scrollPending = false;
 }
 window.addEventListener('scroll', () => {
   if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateChapter); }
 }, { passive:true });
 update(); updateChapter();
})();
