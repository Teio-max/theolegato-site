// Fonctions de création des fenêtres principales
// Ce fichier définit les fonctions de création de fenêtres pour les icônes du bureau

// Création de la fenêtre Films
WindowManager.createFilmsWindow = function() {
  console.log("🎬 Création de la fenêtre Films");
  const content = `
    <div class="films-container" style="padding: 12px;height:100%;display:flex;flex-direction:column;">
      <h2 style="margin:0 0 10px;color:#003399;font-size:18px;">Films</h2>
      <div style='font-size:11px;color:#555;margin-bottom:8px;'>Cliquez sur un film pour ouvrir la critique détaillée.</div>
      <div id="films-grid" style="flex:1;overflow:auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;padding:4px;">
        ${this.generateFilmsContent()}
      </div>
    </div>`;
  return this.createWindow({ title:'Films', icon:'icons/film.png', width:860, height:560, content });
};

// Générer le contenu des films à partir des données
WindowManager.generateFilmsContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.films) {
    return '<p>Aucun film disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque film
  window.DataManager.data.films.forEach(film => {
  const poster = film.image || film.poster || 'https://via.placeholder.com/160x220?text=Film';
    const note = film.note ? '⭐'.repeat(Math.min(5, film.note)) : '';
    content += `
      <div class="film-card" onclick="WindowManager.openFilmCritique(${film.id})" style="cursor:pointer;border:1px solid #888;border-radius:6px;overflow:hidden;background:#fff;display:flex;flex-direction:column;transition:box-shadow .2s,border-color .2s;">
        <div style='height:200px;overflow:hidden;background:#000;'>
      <img data-src='${poster}' alt='${(film.titre||'').replace(/'/g,"&#39;")}' class='lazy-img' style='width:100%;height:100%;object-fit:cover;filter:brightness(.94);opacity:.1;transition:opacity .4s;'>
        </div>
        <div style='padding:8px 9px 10px;'>
          <div style='font-weight:bold;font-size:13px;line-height:1.2;margin-bottom:4px;'>${film.titre||film.title||'Sans titre'}</div>
          <div style='font-size:11px;color:#444;display:flex;justify-content:space-between;'><span>${film.year||''}</span><span>${note}</span></div>
        </div>
      </div>`;
  });
  
  return content || '<p>Aucun film disponible pour le moment.</p>';
};

// Création de la fenêtre Articles
WindowManager.createArticlesWindow = function() {
  console.log("📝 Création de la fenêtre Articles");
  const content = `
    <div style='padding:12px;height:100%;display:flex;flex-direction:column;'>
      <h2 style='margin:0 0 10px;color:#003399;font-size:18px;'>Articles</h2>
      <div style='font-size:11px;color:#555;margin-bottom:8px;'>Cliquez pour ouvrir le lecteur double-page.</div>
      <div id='articles-list' style='flex:1;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:4px;'>
        ${this.generateArticlesContent()}
      </div>
    </div>`;
  return this.createWindow({ title:'Articles', icon:'icons/article.png', width:780, height:540, content });
};

// Générer le contenu des articles à partir des données
WindowManager.generateArticlesContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  let sourceArticles = [];
  if(window.articles && Array.isArray(window.articles) && window.articles.length){
    sourceArticles = window.articles; // source directe la plus fraîche
  } else if (window.DataManager?.data?.articles) {
    sourceArticles = window.DataManager.data.articles;
  }
  if(!sourceArticles.length) return '<p>Aucun article disponible pour le moment.</p>';

  // Générer le HTML pour chaque article
  sourceArticles.forEach(article => {
    const resume = (article.summary || article.contenu || '').slice(0,180).replace(/</g,'&lt;');
    const date = article.date || '';
    const cover = article.cover || '';
    const thumb = cover ? `<div style='flex:0 0 72px;width:72px;height:54px;border:1px solid #bbb;border-radius:4px;overflow:hidden;background:#f7f7f7;'>
        <img data-src='${cover}' alt='' class='lazy-img' style='width:100%;height:100%;object-fit:cover;opacity:.1;transition:opacity .4s;'>
      </div>` : '';
    content += `
      <div class='article-item' onclick="WindowManager.openArticleReader(${article.id})" style="cursor:pointer;border:1px solid #888;border-radius:6px;padding:10px 12px;background:#fff;transition:background .15s;">
        <div style='display:flex;gap:10px;align-items:flex-start;'>
          ${thumb}
          <div style='flex:1;'>
            <div style='display:flex;align-items:center;justify-content:space-between;gap:10px;'>
              <h3 style='margin:0;font-size:15px;color:#222;line-height:1.2;'>${article.titre||article.title||'Sans titre'}</h3>
              <span style='font-size:11px;color:#555;'>${date}</span>
            </div>
            <div style='font-size:11px;color:#444;margin-top:6px;'>${resume}${resume.length===180?'…':''}</div>
          </div>
        </div>
      </div>`;
  });
  
  return content || '<p>Aucun article disponible pour le moment.</p>';
};

// --- Détails / Critiques Films ---
// État des visionneuses de galerie pour les films
window.FilmGalleryViewers = window.FilmGalleryViewers || {};

WindowManager.openFilmCritique = function(filmId){
  if(!window.DataManager?.data?.films) return alert('Pas de films');
  const film = window.DataManager.data.films.find(f=> String(f.id)===String(filmId));
  if(!film) return alert('Film introuvable');
  const poster = film.image || film.poster || '';
  const note = film.note ? '⭐'.repeat(Math.min(5, film.note)) : '—';
  const critique = (film.critique||'Aucune critique.').replace(/</g,'&lt;').replace(/\n/g,'<br>');
  const gallery = Array.isArray(film.galerie) ? film.galerie : [];
  const content = `
    <div style='display:flex;height:100%;'>
      <div style='width:240px;border-right:1px solid #999;background:#f0f0f0;padding:10px;overflow:auto;'>
  ${poster? `<div style='border:1px solid #777;padding:2px;background:#000;'><img data-src='${poster}' class='lazy-img' style='width:100%;height:auto;object-fit:cover;opacity:.1;transition:opacity .4s;'></div>`:''}
        <h2 style='font-size:16px;margin:10px 0 4px;color:#003399;'>${film.titre||'Sans titre'}</h2>
        <div style='font-size:12px;color:#333;margin-bottom:6px;'>${film.year||''}</div>
        <div style='font-size:12px;margin-bottom:8px;'>Note: ${note}</div>
        ${film.bandeAnnonce? `<button onclick="window.open('${film.bandeAnnonce}','_blank')" style='font-size:11px;padding:4px 8px;'>Bande annonce</button>`:''}
        ${gallery.length? `<div style='margin-top:10px;'>
          <div style='font-weight:bold;font-size:12px;margin-bottom:4px;'>Galerie</div>
          <div id='film-grid' style='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;'>${gallery.map((u,i)=>`<div class="film-grid-thumb" data-idx='${i}' style="width:100%;padding-top:66%;position:relative;border:1px solid #777;background:#fff;cursor:pointer;">
            <img src='${u}' style='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;'>
          </div>`).join('')}</div>
        </div>`:''}
      </div>
      <div style='flex:1;display:flex;flex-direction:column;'>
        <div style='padding:10px 14px;flex:1;overflow:auto;background:#fff;'>
          <h3 style='margin:0 0 10px;font-size:15px;color:#222;'>Critique</h3>
          <div style='font-size:13px;line-height:1.5;'>${critique}</div>
          ${gallery.length? `
          <div style='margin-top:16px;'>
            <h3 style='margin:0 0 8px;font-size:15px;color:#222;'>Galerie</h3>
            <div id='gal-viewer' style='position:relative;border:1px solid #aaa;background:#000;height:300px;display:flex;align-items:center;justify-content:center;border-radius:4px;touch-action:pan-y;'>
                <img id='gal-main' data-src='${gallery[0]}' class='lazy-img' alt='' style='max-width:100%;max-height:100%;object-fit:contain;background:#000;opacity:.1;transition:opacity .4s;'>
              <button id='gal-prev' title='Précédent' style='position:absolute;left:6px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;border:1px solid #999;background:#ece9d8;cursor:pointer;'>&lsaquo;</button>
              <button id='gal-next' title='Suivant' style='position:absolute;right:6px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;border:1px solid #999;background:#ece9d8;cursor:pointer;'>&rsaquo;</button>
              <div id='gal-counter' style='position:absolute;right:8px;bottom:6px;color:#fff;background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px;font-size:11px;'>1/${gallery.length}</div>
            </div>
            <div id='gal-thumbs' style='display:flex;gap:6px;overflow:auto;margin-top:8px;'>
              ${gallery.map((u,i)=>`<div class='film-thumb' data-idx='${i}' style="width:70px;height:50px;border:2px solid ${i===0?'#0b57d0':'#bbb'};border-radius:4px;overflow:hidden;cursor:pointer;background:#fff;">
                  <img data-src='${u}' class='lazy-img' style='width:100%;height:100%;object-fit:cover;opacity:.1;transition:opacity .4s;'>
              </div>`).join('')}
            </div>
          </div>
          `:''}
        </div>
      </div>
    </div>`;
  const win = this.createWindow({ title:`Film: ${film.titre||film.title||'Film'}`, icon:'icons/film.png', width:760, height:560, content });

  // Attacher la logique de navigation si galerie
  if(gallery.length){
    window.FilmGalleryViewers[filmId] = { index: 0 };
    setTimeout(()=>{
      const st = window.FilmGalleryViewers[filmId];
      const main = win.querySelector('#gal-main');
      const prev = win.querySelector('#gal-prev');
      const next = win.querySelector('#gal-next');
      const counter = win.querySelector('#gal-counter');
      const thumbs = Array.from(win.querySelectorAll('#gal-thumbs .film-thumb'));
      const gridThumbs = Array.from(win.querySelectorAll('#film-grid .film-grid-thumb'));

      function select(i){
        if(!gallery.length) return;
        st.index = Math.max(0, Math.min(gallery.length-1, i));
        if(main){ main.setAttribute('data-src', gallery[st.index]); WindowManager._lazyLoadNow(main); }
        if(counter) counter.textContent = `${st.index+1}/${gallery.length}`;
        thumbs.forEach((el,idx)=>{ el.style.borderColor = idx===st.index? '#0b57d0' : '#bbb'; });
  // Précharger précédent / suivant
  if(!window._filmPreloaded) window._filmPreloaded = new Set();
  const preload = (url)=>{ if(url && !window._filmPreloaded.has(url)){ const im=new Image(); im.src=url; window._filmPreloaded.add(url); } };
  preload(gallery[st.index+1]);
  preload(gallery[st.index-1]);
      }
      function nextImg(){ select(st.index+1); }
      function prevImg(){ select(st.index-1); }
      prev && prev.addEventListener('click', prevImg);
      next && next.addEventListener('click', nextImg);
      thumbs.forEach(el=> el.addEventListener('click', ()=> select(parseInt(el.getAttribute('data-idx')))));
      gridThumbs.forEach(el=> el.addEventListener('click', ()=> select(parseInt(el.getAttribute('data-idx')))));

      // Gestes swipe dans le viewer
      let sx=0, sy=0, dx=0, dy=0;
      const viewer = win.querySelector('#gal-viewer');
      if(viewer){
        viewer.addEventListener('touchstart', e=>{ const t=e.touches[0]; sx=t.clientX; sy=t.clientY; dx=0; dy=0; }, {passive:true});
        viewer.addEventListener('touchmove', e=>{ const t=e.touches[0]; dx=t.clientX-sx; dy=t.clientY-sy; }, {passive:true});
        viewer.addEventListener('touchend', ()=>{ if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){ if(dx<0) nextImg(); else prevImg(); } }, {passive:true});
      }
    }, 50);
  }
};

// ----- Lazy loading (IntersectionObserver) -----
WindowManager._lazyObserver = null;
WindowManager._initLazyObserver = function(){
  if(this._lazyObserver) return;
  if(!('IntersectionObserver' in window)){ // fallback: charge tout immédiatement
    document.querySelectorAll('img.lazy-img[data-src]').forEach(img=>{ img.src=img.dataset.src; img.style.opacity='1'; });
    return;
  }
  this._lazyObserver = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        const img = ent.target; this._lazyObserver.unobserve(img); this._lazyLoadNow(img);
      }
    });
  }, { rootMargin: '120px 0px 120px 0px', threshold: 0.01 });
};
WindowManager._lazyLoadNow = function(img){
  if(!img || !img.dataset || !img.dataset.src) return; 
  img.src = img.dataset.src; 
  img.addEventListener('load', ()=>{ img.style.opacity='1'; }, { once:true }); 
  delete img.dataset.src; 
  // Auto disconnect si plus aucune image lazy
  if(this._lazyObserver && !document.querySelector('img.lazy-img[data-src]')){ this._lazyObserver.disconnect(); this._lazyObserver=null; }
};
WindowManager.scanLazyImages = function(root=document){ this._initLazyObserver(); if(!this._lazyObserver) return; root.querySelectorAll('img.lazy-img[data-src]').forEach(img=> this._lazyObserver.observe(img)); };

// Scanner après création de chaque fenêtre
(function(){
  const originalCreate = WindowManager.createWindow.bind(WindowManager);
  WindowManager.createWindow = function(opts){
    const win = originalCreate(opts);
    setTimeout(()=> WindowManager.scanLazyImages(win), 30);
    return win;
  };
})();

// --- Lecteur double-page Articles ---
window.ArticleReaders = window.ArticleReaders || {};
WindowManager.openArticleReader = function(articleId){
  if(!window.DataManager?.data?.articles) return alert('Pas d\u0027articles');
  const article = window.DataManager.data.articles.find(a=> String(a.id)===String(articleId));
  if(!article) return alert('Article introuvable');
  // Utilisation des onglets PDF virtuels si un PDF est présent
  if(article.pdfUrl){
  WindowManager.openPdfTab({ id:'article-'+article.id, url:article.pdfUrl, title: article.titre||'Article PDF', page:1 });
    return;
  }
  // Si un contenu HTML riche est disponible, l'afficher directement (mode lecture unique)
  if(article.contenuHtml){
    const content = `
      <div style='display:flex;flex-direction:column;height:100%;'>
        <div style='padding:6px 10px;background:#ece9d8;border-bottom:1px solid #999;font-size:12px;display:flex;justify-content:space-between;align-items:center;'>
          <div style='display:flex;align-items:center;gap:8px;'>
            ${article.cover ? `<img src='${article.cover}' alt='' style='width:40px;height:28px;object-fit:cover;border:1px solid #999;border-radius:3px;background:#fff;'>` : ''}
            <strong>${(article.titre||'Article')}</strong>
          </div>
          <span style='font-size:11px;color:#555;'>${article.date||''}</span>
        </div>
        <div style='flex:1;overflow:auto;background:#fff;'>
          <div style='padding:12px 16px;line-height:1.6;font-size:14px;'>${article.contenuHtml.replace(/<img([^>]*?)src=("|')(.*?)(\2)([^>]*)>/gi, (m, before, q, url, _q2, after)=>{
            if(/data-src=/.test(m)) return m; // déjà transformée
            // Conserver dimensions si présentes
            return `<img${before}class="lazy-img" data-src="${url}" ${after}>`;
          })}</div>
        </div>
      </div>`;
    this.createWindow({ title:`Article: ${article.titre||'Lecture'}`, icon:'icons/article.png', width:820, height:600, content });
    return;
  }
  const raw = (article.contenu||'').replace(/\r/g,'');
  const paragraphs = raw.split(/\n{2,}/).map(p=> p.trim()).filter(Boolean);
  // Construire pages (regrouper paragraphes jusque ~900 caractères)
  const pages=[]; let buf='';
  paragraphs.forEach(p=>{ if((buf+('\n\n'+p)).length>900 && buf){ pages.push(buf); buf=p; } else { buf += (buf? '\n\n':'')+p; } });
  if(buf) pages.push(buf);
  if(!pages.length) pages.push('(Contenu vide)');
  ArticleReaders[articleId]={ pages, index:0 };
  const makePageHtml=(txt)=> txt.replace(/</g,'&lt;').replace(/\n/g,'<br>');
  const renderPair=(id)=>{
    const state=ArticleReaders[id]; if(!state) return {left:'',right:''};
    return {left: makePageHtml(state.pages[state.index]||''), right: makePageHtml(state.pages[state.index+1]||'')};
  };
  const pair=renderPair(articleId);
  const navHtml = pages.length>2 ? `<div style='display:flex;justify-content:center;gap:12px;padding:6px 0;'>
      <button id='art-prev-btn' style='padding:4px 10px;'>&lt; Préc.</button>
      <span style='font-size:11px;'>Page <span id='art-page-num'>${1}</span>/<span id='art-page-total'>${pages.length}</span></span>
      <button id='art-next-btn' style='padding:4px 10px;'>Suiv. &gt;</button>
    </div>` : '';
  const content = `
    <div style='display:flex;flex-direction:column;height:100%;'>
      <div style='padding:6px 10px;background:#ece9d8;border-bottom:1px solid #999;font-size:12px;display:flex;justify-content:space-between;align-items:center;'>
        <div style='display:flex;align-items:center;gap:8px;'>
          ${article.cover ? `<img src='${article.cover}' alt='' style='width:40px;height:28px;object-fit:cover;border:1px solid #999;border-radius:3px;background:#fff;'>` : ''}
          <strong>${(article.titre||'Article')}</strong>
        </div>
        <span style='font-size:11px;color:#555;'>${article.date||''}</span>
      </div>
      ${navHtml}
      <div id='double-page' style='flex:1;display:flex;gap:8px;padding:10px;overflow:auto;background:#f5f5f5;'>
        <div id='page-left' style='flex:1;background:#fff;border:1px solid #aaa;padding:12px 14px;font-size:13px;line-height:1.5;'>${pair.left}</div>
        <div id='page-right' style='flex:1;background:#fff;border:1px solid #aaa;padding:12px 14px;font-size:13px;line-height:1.5;'>${pair.right}</div>
      </div>
    </div>`;
  const win = this.createWindow({ title:`Article: ${article.titre||'Lecture'}`, icon:'icons/article.png', width:820, height:600, content });
  // Attacher navigation après insertion
  setTimeout(()=>{
    const prev = win.querySelector('#art-prev-btn');
    const next = win.querySelector('#art-next-btn');
    const pageNum = win.querySelector('#art-page-num');
    const left = win.querySelector('#page-left');
    const right = win.querySelector('#page-right');
    const totalSpan = win.querySelector('#art-page-total');
    function refresh(){
      const st=ArticleReaders[articleId]; if(!st) return; const pair=renderPair(articleId);
      if(left) left.innerHTML=pair.left;
      if(right) right.innerHTML=pair.right;
      if(pageNum) pageNum.textContent = (st.index+1).toString();
      if(totalSpan) totalSpan.textContent = st.pages.length.toString();
      if(prev) prev.disabled = st.index<=0;
      if(next) next.disabled = st.index>=st.pages.length-1;
    }
    prev && prev.addEventListener('click', ()=>{ const st=ArticleReaders[articleId]; if(st.index>0){ st.index = Math.max(0, st.index-2); refresh(); } });
    next && next.addEventListener('click', ()=>{ const st=ArticleReaders[articleId]; if(st.index < st.pages.length-1){ st.index = Math.min(st.pages.length-1, st.index+2); refresh(); } });
    refresh();
  },50);
};

// Création de la fenêtre CV
WindowManager.createCVWindow = function() {
  console.log("📄 Création de la fenêtre CV");
  
  // Générer le contenu HTML pour le CV
    const hasPdf = !!window.cvData?.pdfUrl;
    let content = document.createElement('div');
    content.style.padding='0';
    if(hasPdf){
      // Ouvrir directement en onglet PDF interne et quitter
      WindowManager.openPdfTab({ url: window.cvData.pdfUrl, title: 'CV PDF', id: 'cv-pdf' });
      return;
    } else {
      content.style.padding='10px';
      content.innerHTML = `
        <h2 style="margin-top:0;color:#003399;font-size:18px;">Curriculum Vitae</h2>
        <p style="font-size:12px;color:#333;">Aucun PDF n'est encore importé. Affichage des données textuelles.</p>
        <div style="margin-top:10px;font-size:12px;line-height:1.4;">
          <strong>Résumé:</strong>
          <p>${(window.cvData?.summary||'').replace(/</g,'&lt;')||'--'}</p>
          <strong>Expériences:</strong>
          <ul style='padding-left:16px;'>
            ${(window.cvData?.experiences||['']).map(e=> e?`<li>${e.replace(/</g,'&lt;')}</li>`:'').join('')}
          </ul>
          <strong>Formations:</strong>
          <ul style='padding-left:16px;'>
            ${(window.cvData?.education||['']).map(e=> e?`<li>${e.replace(/</g,'&lt;')}</li>`:'').join('')}
          </ul>
          <strong>Compétences:</strong>
          <div>${(window.cvData?.skills||[]).map(s=>`<span style="display:inline-block;background:#d0dff0;border:1px solid #718da6;padding:2px 6px;margin:2px;border-radius:3px;font-size:11px;">${s.replace(/</g,'&lt;')}</span>`).join('')||'--'}</div>
        </div>`;
  WindowManager.createWindow({ title:'CV', icon:'icons/cv.png', content, width:500, height:420 });
    }
  
  // Créer la fenêtre (version texte)
  return this.createWindow({ title:'CV', icon:'icons/cv.png', width:600, height:500, content });
};

// Création de la fenêtre Mangas
WindowManager.createMangasWindow = function() {
  console.log("📚 Création de la fenêtre Mangas");
  
  // Générer le contenu HTML pour les mangas
  let content = `
    <div class="mangas-container" style="padding: 20px;">
      <h2 style="margin-bottom: 20px; color: #003399;">Ma Collection de Mangas</h2>
      <div id="mangas-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
        ${this.generateMangasContent()}
      </div>
    </div>
  `;
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'Mangas',
    icon: 'icons/portfolio.png',
    width: 800,
    height: 600,
    content: content
  });
};

// Générer le contenu des mangas à partir des données
WindowManager.generateMangasContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.mangas) {
    return '<p>Aucun manga disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque manga
  window.DataManager.data.mangas.forEach(manga => {
    const cover = manga.cover || manga.image || 'https://via.placeholder.com/150x200?text=No+Cover';
    const status = manga.status || 'unknown';
    let statusClass = '';
    let statusText = '';
    
    // Déterminer la classe et le texte pour le statut
    switch (status.toLowerCase()) {
      case 'finished':
      case 'terminé':
      case 'complete':
        statusClass = 'completed';
        statusText = 'Terminé';
        break;
      case 'ongoing':
      case 'en cours':
        statusClass = 'ongoing';
        statusText = 'En cours';
        break;
      case 'hiatus':
      case 'pause':
        statusClass = 'hiatus';
        statusText = 'En pause';
        break;
      default:
        statusClass = 'unknown';
        statusText = 'Inconnu';
    }
    
    content += `
      <div class="manga-card" style="border: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 220px; overflow: hidden;">
          <img src="${cover}" alt="${manga.title||manga.titre||''}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${manga.title||manga.titre||'Sans titre'}</h3>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #666; font-size: 14px;">Volumes: ${manga.volumes || '?'}</span>
            <span class="manga-status ${statusClass}" style="padding: 2px 8px; border-radius: 12px; font-size: 12px;">${statusText}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  return content || '<p>Aucun manga disponible pour le moment.</p>';
};

// === Onglets PDF Virtuels (version fenêtre interne) ===
(function(){
  if(window.PdfTabManager) return;
  const tabs = new Map(); // id -> {tabBtn,pane,iframe}
  let hostWin = null; // fenêtre WindowManager
  let container = null; // racine interne
  let bar = null; // barre d'onglets
  let zone = null; // zone contenu

  function focusHost(){
    try{
      if(!hostWin) return;
      const id = hostWin.id;
      if(!id) return;
      if(typeof WindowManager.focusWindow === 'function'){
        WindowManager.focusWindow(id);
      } else if (typeof WindowManager.setActiveWindow === 'function'){
        WindowManager.setActiveWindow(id);
      } else {
        const el = document.getElementById(id);
        if(el){ el.style.zIndex = (window.getNextZIndex ? window.getNextZIndex() : (parseInt(el.style.zIndex||'9000')+1)); }
      }
    }catch(e){ console.warn('PDF focus fallback:', e); }
  }

  function ensureWindow(){
    if(hostWin && document.body.contains(hostWin)) return;
    const innerHtml = `
      <div class="pdf-workspace" style="display:flex;flex-direction:column;height:100%;background:#1b1e22;">
        <div class="pdf-tabs-bar" style="flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:4px 6px;background:#23272d;border-bottom:1px solid #333;font:11px sans-serif;color:#eee;overflow:auto;">
          <span style='font-weight:bold;margin-right:8px;font-size:11px;'>PDF</span>
        </div>
        <div class="pdf-tabs-zone" style="flex:1;position:relative;background:#0f1012;"></div>
      </div>`;
    hostWin = WindowManager.createWindow({ title:'Documents PDF', icon:'icons/article.png', width:880, height:640, content: innerHtml });
    container = hostWin.querySelector('.pdf-workspace') || hostWin.querySelector('.window-content');
    bar = hostWin.querySelector('.pdf-tabs-bar');
    zone = hostWin.querySelector('.pdf-tabs-zone');
  focusHost();
  }

  function sanitizeId(id){ return (id||'pdf').toString().replace(/[^a-zA-Z0-9_\-:.]/g,'_'); }

  function activate(id){
    tabs.forEach((o,k)=>{
      const active = k===id;
      o.tabBtn.classList.toggle('active', active);
      o.pane.style.display = active? 'block':'none';
      if(active) o.tabBtn.style.background='#3d7ef0'; else o.tabBtn.style.background='#2f343b';
    });
  focusHost();
  }

  function close(id){
    const st = tabs.get(id); if(!st) return;
    st.pane.remove(); st.tabBtn.remove(); tabs.delete(id);
    if(!tabs.size){
      // fermer la fenêtre
      if(hostWin){ hostWin.parentNode && hostWin.parentNode.removeChild(hostWin); hostWin=null; }
      container=bar=zone=null; return;
    }
    activate([...tabs.keys()].pop());
  }

  function makeTab(id,title){
    const btn = document.createElement('button');
    btn.className='pdf-tab-btn';
    btn.style.cssText='background:#2f343b;border:1px solid #444;color:#fff;padding:4px 8px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:6px;font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    btn.innerHTML = `<span class="label">${title}</span><span class="close" style='font-weight:bold;padding:0 4px;cursor:pointer;'>×</span>`;
    btn.addEventListener('click', e=>{ if(e.target.classList.contains('close')){ e.stopPropagation(); close(id); } else activate(id); });
    bar.appendChild(btn);
    return btn;
  }

  function open(opts){
    const { url, title='PDF', id=url, page, usePdfJs=false, pdfJsBase='/pdfjs/web/viewer.html' } = opts||{};
    if(!url) return;
    const cleanId = sanitizeId(id);
    ensureWindow();
    if(tabs.has(cleanId)){ activate(cleanId); return; }
    // Créer pane
    const pane = document.createElement('div');
    pane.className='pdf-pane';
    pane.style.cssText='position:absolute;inset:0;display:none;';
    let finalUrl = url;
    if(usePdfJs){ finalUrl = pdfJsBase + '?file=' + encodeURIComponent(url); if(page) finalUrl += '#page='+page; }
    else if(page){ finalUrl += '#page='+page; }
    const iframe=document.createElement('iframe');
    iframe.src=finalUrl;
    iframe.style.cssText='width:100%;height:100%;border:0;background:#fff;';
    pane.appendChild(iframe);
    zone.appendChild(pane);
    const tabBtn = makeTab(cleanId, title);
    tabs.set(cleanId,{tabBtn,pane,iframe,url,title});
    activate(cleanId);
  }

  window.PdfTabManager = { open, close, activate };
  WindowManager.openPdfTab = function(o){ PdfTabManager.open(o); };
  WindowManager.attachPdfLinks = function(root=document){ root.querySelectorAll('a.pdf-link').forEach(a=>{ if(a._pdfBound) return; a._pdfBound=true; a.addEventListener('click', e=>{ e.preventDefault(); WindowManager.openPdfTab({ url:a.href, title:a.dataset.title||a.textContent.trim().slice(0,40)||'Document', id:a.dataset.id||a.href }); }); }); };
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', ()=> WindowManager.attachPdfLinks()); } else { WindowManager.attachPdfLinks(); }
})();

