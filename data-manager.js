// ==============================================================
// Data Manager unifié + Persistance GitHub + Diagnostics
// ==============================================================
(function(){
  console.log('🔄 Initialisation DataManager (clean build)');

  // === Configuration & État Global ===
  window.films   = window.films   || [];
  window.mangas  = window.mangas  || [];
  window.articles= window.articles|| [];
  window.tags    = window.tags    || [];
  window.cvData  = window.cvData  || { pdfUrl:'', lastUpdated:null };

  if(!window.GITHUB_CONFIG){
    window.GITHUB_CONFIG = {
      owner:'Teio-max', repo:'theolegato-site', branch:'main', dataFile:'data.json',
      token: localStorage.getItem('github_token') || sessionStorage.getItem('github_token') || null
    };
  }

  if(!window.UIManager){
    window.UIManager = { showNotification:(msg,type='info')=>console.log(`📣 [${type}] ${msg}`) };
  }

  if(!window.GitHubSyncState){
    window.GitHubSyncState = { lastStatus:null,lastError:null,invalidToken:false,lastCommitSha:null,lastSync:null };
  }

  const encodeJsonToBase64 = (obj)=>{
    const json = JSON.stringify(obj,null,2);
    return btoa(unescape(encodeURIComponent(json))); // UTF-8 safe
  };
  const decodeGitHubFileJson = (ghJson)=>{
    if(ghJson && ghJson.content && ghJson.encoding==='base64'){
      try{ return JSON.parse(decodeURIComponent(escape(atob(ghJson.content)))); }catch(e){ console.warn('⚠️ Decode base64 JSON échoué',e.message); }
    }
    return ghJson;
  };

  // === API utilitaire GitHub bas-niveau ===
  async function githubApi(url, options={}){
    const token = (window.GITHUB_CONFIG||{}).token;
    if(!token) throw new Error('Token GitHub manquant');
    const headers = Object.assign({
      'Authorization': 'Bearer '+token,
      'Accept':'application/vnd.github+json',
      'X-GitHub-Api-Version':'2022-11-28'
    }, options.headers||{});
    const resp = await fetch(url,{...options, headers});
    if(!resp.ok){
      let detail='';
      try{ const j=await resp.json(); detail=j.message||JSON.stringify(j); }catch(_){ }
      const err = new Error(`GitHub ${options.method||'GET'} ${resp.status}${detail?' - '+detail:''}`);
      err.status=resp.status; err.detail=detail; throw err;
    }
    return resp;
  }

  // === Conversion binaire fichier -> Base64 (PDF, etc.) ===
  if(typeof window.fileToBase64Binary !== 'function'){
    window.fileToBase64Binary = async function(file){
      return new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.onload = ()=>{
          const bytes = new Uint8Array(reader.result);
          let bin='';
            for(let i=0;i<bytes.length;i++) bin+=String.fromCharCode(bytes[i]);
          resolve(btoa(bin));
        };
        reader.onerror = ()=>reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    };
  }

  // === Objet Principal DataManager ===
  window.DataManager = {
    data:{ films:[], articles:[], projects:[], desktopIcons:[], welcomePopupConfig:{} },
    defaultData:{
      films:[{ id:1, titre:'Blade Runner 2049', note:5, critique:'Démo', image:'https://via.placeholder.com/420x240?text=BR2049', galerie:[], bandeAnnonce:'', liens:[], tags:['demo']}],
      articles:[], projects:[], desktopIcons:[
        { id:'icon-articles', name:'Articles', icon:'icons/article.png', action:'createArticlesWindow', position:{x:50,y:50}},
        { id:'icon-films', name:'Critiques Ciné', icon:'icons/film.png', action:'createFilmsWindow', position:{x:50,y:150}},
        { id:'icon-cv', name:'CV', icon:'icons/cv.png', action:'createCVWindow', position:{x:50,y:250}}
      ],
      welcomePopupConfig:{}
    },

    initData(){ this.loadDataFromGitHub(); },

    updateGlobalData(d){
      if(!d) return;
      this.data = { ...this.data, ...d };
      if(Array.isArray(d.films)) window.films = d.films;
      if(Array.isArray(d.mangas)) window.mangas = d.mangas;
      if(Array.isArray(d.articles)) window.articles = d.articles;
      if(Array.isArray(d.tags)) window.tags = d.tags;
      if(d.cvData) window.cvData = d.cvData;
      // On ignore volontairement desktopIcons pour ne pas écraser le layout par défaut (non persistant)
      if(d.welcomePopupConfig) this.data.welcomePopupConfig = d.welcomePopupConfig;
    },

    loadDefaultData(){
      console.log('ℹ️ Chargement des données par défaut');
      this.data = JSON.parse(JSON.stringify(this.defaultData));
      this.updateGlobalData(this.data);
      document.dispatchEvent(new CustomEvent('data:loaded',{detail:this.data}));
      return this.data;
    },

    loadDataFromLocal(){
      try{
        const raw = localStorage.getItem('site_data');
        if(raw){
          const parsed = JSON.parse(raw);
          console.log('📦 Données locales chargées');
          this.updateGlobalData(parsed);
          document.dispatchEvent(new CustomEvent('data:loaded',{detail:parsed}));
          return parsed;
        }
      }catch(e){ console.warn('⚠️ Lecture locale échouée',e.message); }
      return this.loadDefaultData();
    },

    async loadDataFromGitHub(){
      const cfg = window.GITHUB_CONFIG || {};
      const apiUrl = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.dataFile}`;
      const token = cfg.token;
      const headersBase = {'Accept':'application/vnd.github.v3+json'};
      const headersTok = token ? {...headersBase,'Authorization':'Bearer '+token}: headersBase;
      const isTokenLikelyValid = t=>typeof t==='string' && (t.startsWith('ghp_')||t.startsWith('github_pat_')) && t.length>=40;
      try{
        if(token && isTokenLikelyValid(token)){
          const r = await fetch(apiUrl,{headers:headersTok});
          if(r.status===401||r.status===403){
            console.warn('🔐 Token invalide -> suppression & retry public');
            try{localStorage.removeItem('github_token');sessionStorage.removeItem('github_token');}catch(_){ }
            window.GITHUB_CONFIG.token=null; window.GitHubSyncState.invalidToken=true;
          } else if(!r.ok){ throw new Error('GitHub '+r.status); }
          else {
            const json = decodeGitHubFileJson(await r.json());
            console.log('✅ Données chargées depuis GitHub (token)');
            this.updateGlobalData(json); document.dispatchEvent(new CustomEvent('data:loaded',{detail:json})); return json;
          }
        }
        // Public fallback
        const r2 = await fetch(apiUrl,{headers:headersBase});
        if(!r2.ok) throw new Error('GitHub public '+r2.status);
        const json2 = decodeGitHubFileJson(await r2.json());
        console.log('✅ Données chargées depuis GitHub (public)');
        this.updateGlobalData(json2); document.dispatchEvent(new CustomEvent('data:loaded',{detail:json2})); return json2;
      }catch(e){
        console.error('❌ Échec GitHub -> fallback local', e.message);
        return this.loadDataFromLocal();
      }
    },

    buildConsolidated(){
      // Exclure desktopIcons pour que les positions restent éphémères
      return {
        films: window.films||[],
        mangas: window.mangas||[],
        articles: window.articles||[],
        tags: window.tags||[],
        cvData: window.cvData||{ pdfUrl:'', lastUpdated:null },
        welcomePopupConfig: this.data.welcomePopupConfig||{},
        lastUpdated: new Date().toISOString()
      };
    },

    saveDataLocally(){
      try {
        const bundle = this.buildConsolidated();
        localStorage.setItem('site_data', JSON.stringify(bundle));
  // Maintenir DataManager.data synchronisé avec les modifications (articles, films, etc.)
  // afin que les fenêtres (ex: Articles) reflètent immédiatement les ajouts / suppressions.
  try { this.updateGlobalData(bundle); } catch(e){ console.warn('Sync DataManager.data échouée', e.message); }
        console.log('💾 Données sauvegardées localement');
        return true;
      }catch(e){ console.error('❌ Save locale échouée', e.message); return false; }
    },

    saveDataToGitHub(){
      if(!window.GITHUB_CONFIG?.token){
        console.warn('⚠️ Pas de token -> sauvegarde locale uniquement');
        return Promise.resolve(this.saveDataLocally());
      }
      // Débounce: si une sauvegarde est en cours on marque pending et réutilise la promesse
      if(this._saving){
        this._pendingSave = true;
        return this._currentSavePromise || Promise.resolve(true);
      }
      this._saving = true;
      this._currentSavePromise = this._performGitHubSave().then(r=>{
        this._saving=false;
        if(this._pendingSave){ this._pendingSave=false; return this.saveDataToGitHub(); }
        return r;
      }).catch(e=>{
        this._saving=false;
        const again = this._pendingSave; this._pendingSave=false;
        if(again) return this.saveDataToGitHub();
        throw e;
      });
      return this._currentSavePromise;
    },

    async _performGitHubSave(){
      const { owner, repo, branch='main', dataFile='data.json', token } = window.GITHUB_CONFIG;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dataFile}`;
      const consolidated = this.buildConsolidated();
      // cache local optimiste
      try{ localStorage.setItem('site_data', JSON.stringify(consolidated)); }catch(_){ }
      const contentB64 = encodeJsonToBase64(consolidated);
      const fetchMeta = async ()=>{
        const r = await fetch(`${apiUrl}?ref=${branch}`,{headers:{'Authorization':`token ${token}`,'Accept':'application/vnd.github.v3+json'}});
        if(r.status===200) return r.json();
        if(r.status===404) return { sha: undefined };
        throw new Error('GET meta '+r.status);
      };
      const putFile = async (sha)=>{
        return fetch(apiUrl, { method:'PUT', headers:{'Authorization':`token ${token}`,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'}, body: JSON.stringify({ message:'📦 Update data.json (auto-save)', content:contentB64, branch, sha }) });
      };
      const attempt = async (i)=>{
        const meta = await fetchMeta();
        const resp = await putFile(meta.sha);
        if(!resp.ok){
          let detail=''; try{ const j=await resp.json(); detail=j.message||JSON.stringify(j);}catch(_){ }
          if(resp.status===409 && i<2){ // 3 essais
            const delay = 300*(i+1);
            console.warn('⚠️ Conflit 409 – retry '+(i+2)+' dans '+delay+'ms');
            await new Promise(r=>setTimeout(r,delay));
            return attempt(i+1);
          }
          throw new Error('PUT '+resp.status+(detail?' - '+detail:''));
        }
        const json = await resp.json();
        window.GitHubSyncState.lastCommitSha = json.commit?.sha || null;
        window.GitHubSyncState.lastStatus = 'ok'; window.GitHubSyncState.lastSync = Date.now(); window.GitHubSyncState.lastError=null;
        console.log('✅ data.json synchronisé sur GitHub');
        UIManager?.showNotification('Données synchronisées sur GitHub','success');
        return json;
      };
      try { return await attempt(0); }
      catch(e){
        window.GitHubSyncState.lastStatus='error'; window.GitHubSyncState.lastError=e.message; if(/401|403/.test(e.message)) window.GitHubSyncState.invalidToken=true;
        console.error('❌ Sauvegarde GitHub échouée', e.message);
        UIManager?.showNotification('Sauvegarde GitHub échouée: '+e.message,'error');
        return false;
      }
    }
  };

  // === Fonctions globales pratique (compat héritage) ===
  window.saveDataToGitHub = (...a)=>window.DataManager.saveDataToGitHub(...a);
  window.saveData = ()=>{
    try{ const ok = window.DataManager.saveDataLocally(); return Promise.resolve(ok); }
    catch(e){ return Promise.reject(e); }
  };

  // === Upload binaire (PDF / images) ===
  window.uploadBinaryToGitHub = async function(file, pathInRepo){
    if(!window.GITHUB_CONFIG?.token) throw new Error('Token GitHub absent');
    if(window.GitHubSyncState.invalidToken) throw new Error('Token invalide (marqué)');
    const { owner, repo, branch='main' } = window.GITHUB_CONFIG;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathInRepo}`;
    let sha; try { const meta=await githubApi(`${apiUrl}?ref=${branch}`); const mj=await meta.json(); sha=mj.sha; } catch(e){ if(e.status!==404) throw e; }
    const content = await window.fileToBase64Binary(file);
    try{
      const resp = await githubApi(apiUrl,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message:`Upload ${pathInRepo}`, branch, content, sha }) });
      const json = await resp.json();
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathInRepo}`;
      window.GitHubSyncState.lastCommitSha = json.commit?.sha || null;
      window.GitHubSyncState.lastStatus='ok'; window.GitHubSyncState.lastSync=Date.now();
      return { downloadUrl: json.content?.download_url || rawUrl, rawUrl };
    }catch(e){
      window.GitHubSyncState.lastStatus='error'; window.GitHubSyncState.lastError=e.message; if(e.status===401||e.status===403) window.GitHubSyncState.invalidToken=true; throw e;
    }
  };

  // === Test rapide permissions écriture ===
  window.testGitHubWrite = async function(){
    try{
      const { owner, repo, branch='main' } = window.GITHUB_CONFIG || {};
      if(!owner||!repo) throw new Error('Config incomplète');
      const path='tmp_permission_test.txt';
      const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      let sha; try { const meta=await githubApi(`${api}?ref=${branch}`); sha=(await meta.json()).sha; } catch(e){ if(e.status!==404) throw e; }
      const contentB64 = btoa('ok '+new Date().toISOString());
      const put = await githubApi(api,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message:'permission test', branch, content:contentB64, sha }) });
      const j = await put.json(); console.log('✅ Test écriture OK', j.content?.path); return true;
    }catch(e){ console.error('❌ Test écriture échoué', e.message); return false; }
  };

  window.getGitHubSyncStatus = function(){ const st=window.GitHubSyncState; return { ...st, lastSyncISO: st.lastSync? new Date(st.lastSync).toISOString(): null }; };

  window.setGitHubToken = function(token, remember=true){
    if(!window.GITHUB_CONFIG) window.GITHUB_CONFIG={ owner:'Teio-max', repo:'theolegato-site', branch:'main', dataFile:'data.json', token:null };
    window.GITHUB_CONFIG.token = token || null;
    try{
      if(token){
        if(remember) localStorage.setItem('github_token', token); else sessionStorage.setItem('github_token', token);
      } else { localStorage.removeItem('github_token'); sessionStorage.removeItem('github_token'); }
      console.log('🔐 Token GitHub mis à jour');
    }catch(e){ console.warn('⚠️ Stockage token impossible', e.message); }
    return window.GITHUB_CONFIG.token;
  };

  // === Pré-chargement local rapide puis fetch GitHub ===
  try{ window.DataManager.loadDataFromLocal(); }catch(_){ }
  window.DataManager.initData();

  console.log('✅ DataManager initialisé');
})();
