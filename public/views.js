'use strict';
(()=>{
 const enter=document.getElementById('showScreen'),exit=document.getElementById('showDashboard'),clock=document.getElementById('screenClock'),timer=document.getElementById('timer');
 function show(screen,push){document.body.classList.toggle('broadcast-view',screen);document.title=screen?'표류단 · 방송 화면':'표류단 · 방송인 관리';enter.setAttribute('aria-pressed',String(screen));if(push)history.pushState(null,'',screen?'/screen':'/dashboard');}
 function mirror(){clock.textContent=timer.textContent;clock.setAttribute('aria-label','남은 시간 '+timer.textContent);}
 enter.onclick=()=>show(true,true);exit.onclick=()=>show(false,true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')&&document.body.classList.contains('broadcast-view'))show(false,true);});
 window.addEventListener('popstate',()=>show(location.pathname==='/screen',false));
 new MutationObserver(mirror).observe(timer,{childList:true,subtree:true,characterData:true});mirror();show(location.pathname==='/screen',false);
})();
