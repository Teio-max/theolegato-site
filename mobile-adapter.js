// Mobile adapter: transforme l'expérience en mode application sur téléphone (utilisateur uniquement)
(function(){
  function isMobile(){
    return (window.matchMedia && matchMedia('(max-width:768px)').matches) || ('ontouchstart' in window && screen.width <= 820);
  }
  function safeOpen(list){
    for(const name of list){
      const fn = (typeof name === 'function')? name : window[name];
      if(typeof fn === 'function') { try { fn(); return true; } catch(_){} }
    }
    return false;
  }
  function createMobileNav(){
    if(document.getElementById('mobileNav')) return;
    const nav=document.createElement('div');
    nav.id='mobileNav';
    nav.innerHTML=`
      <button data-open="home">Accueil</button>
      <button data-open="films">Films</button>
      <button data-open="articles">Articles</button>
      <button data-open="mangas">Mangas</button>
      <button data-open="cv">CV</button>`;
    document.body.appendChild(nav);
    const activate=(k)=> nav.querySelectorAll('button').forEach(b=> b.classList.toggle('active', b.dataset.open===k));
    nav.addEventListener('click', e=>{
      const btn=e.target.closest('button[data-open]'); if(!btn) return; const key=btn.dataset.open; activate(key);
      switch(key){
        case 'home': if(!safeOpen(['openWelcomePopup','showWelcomePopup'])) safeOpen(['createArticlesWindow','openArticlesWindow']); break;
        case 'films': safeOpen(['createFilmsWindow','openFilmsWindow','openFilms']); break;
        case 'articles': safeOpen(['createArticlesWindow','openArticlesWindow']); break;
        case 'mangas': safeOpen(['createMangasWindow','openMangasWindow']); break;
        case 'cv': safeOpen(['openCVWindow','createCVWindow']); break;
      }
    });
  }
  function observeWindows(){
    const obs=new MutationObserver(muts=>{
      muts.forEach(m=> m.addedNodes.forEach(n=>{
        if(!(n instanceof HTMLElement)) return;
        if(n.classList && (n.classList.contains('window')|| n.classList.contains('xp-window')|| n.classList.contains('win'))){
          n.classList.add('mobile-fullscreen');
          n.querySelectorAll('[data-resize], .resizer').forEach(r=> r.remove());
        }
      }));
    });
    obs.observe(document.body,{childList:true,subtree:true});
  }
  function disableAdmin(){
    // Bloquer ouverture panneau admin
    if(window.openAdminPanel){
      const orig=window.openAdminPanel; window.openAdminPanel=function(){ alert('Admin indisponible sur mobile'); }; window.openAdminPanel._original=orig;
    }
    // Cacher lanceurs admin
    document.querySelectorAll('[data-app="admin"], .icon-admin').forEach(el=> el.style.display='none');
  }
  function init(){
    if(!isMobile()) return; document.body.classList.add('is-mobile');
    createMobileNav(); observeWindows(); disableAdmin();
    // ouvrir Articles après un court délai
    setTimeout(()=>{ const b=document.querySelector('#mobileNav button[data-open="articles"]'); b && b.click(); },300);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('resize', ()=>{
    if(isMobile()){ document.body.classList.add('is-mobile'); if(!document.getElementById('mobileNav')) createMobileNav(); }
    else { document.body.classList.remove('is-mobile'); const nav=document.getElementById('mobileNav'); nav&&nav.remove(); }
  });
})();
