// Global Sync Layer: force every admin-side mutation to cascade to GitHub when token present
(function(){
  console.log('🔗 Global Sync Layer loaded');
  function canGitHub(){ return window.GITHUB_CONFIG && window.GITHUB_CONFIG.token; }
  function report(label){
    if(typeof window.getGitHubSyncStatus === 'function'){
      const st = window.getGitHubSyncStatus();
      if(st.lastStatus==='error') console.warn(`[GitHubSync][${label}] erreur: ${st.lastError}`);
      else if(st.lastStatus==='ok') console.log(`[GitHubSync][${label}] ok commit=${st.lastCommitSha?.slice(0,7)||'—'}`);
    }
  }
  async function sync(reason){
    try {
      if(!window.DataManager) return;
      // ensure local consolidation
      if(typeof window.saveData === 'function') await window.saveData().catch(()=>{});
      if(canGitHub() && typeof window.DataManager.saveDataToGitHub === 'function'){
        await window.DataManager.saveDataToGitHub();
        console.log('⬆️ Sync GitHub ok ('+reason+')');
        report(reason);
      }
    } catch(e){ console.warn('Sync fail ('+reason+'): ', e.message); }
  }
  // Patch helper that wraps a method and triggers sync afterwards
  function wrap(obj, method, reason){
    if(!obj || typeof obj[method] !== 'function') return;
    const original = obj[method];
    obj[method] = function(){
      const r = original.apply(this, arguments);
      // handle promise or sync
      if(r && typeof r.then === 'function'){
        r.then(()=> sync(reason));
      } else {
        setTimeout(()=> sync(reason), 50);
      }
      return r;
    };
  }
  // Wait a tick so modules are loaded
  setTimeout(()=>{
    // AdminManager methods affecting data
    if(window.AdminManager){
      ['saveFilm','saveArticle','saveTag','saveIcon','saveManga','saveCV','saveWelcomePopupConfig','saveIconsLayout','saveIconsToData'].forEach(m=> wrap(window.AdminManager, m, m));
    }
    // Direct global saves
    if(typeof window.saveDataToGitHub === 'function' && !window._autoSyncInterval){
      window._autoSyncInterval = setInterval(()=>{
        if(canGitHub()) sync('interval');
      }, 120000); // toutes les 2 min
    }
    console.log('✅ Global Sync instrumentation done');
  }, 400);
})();
