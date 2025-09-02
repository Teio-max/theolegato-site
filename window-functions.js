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
          <img src='${poster}' alt='${(film.titre||'').replace(/'/g,"&#39;")}' style='width:100%;height:100%;object-fit:cover;filter:brightness(.94);'>
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
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.articles) {
    return '<p>Aucun article disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque article
  window.DataManager.data.articles.forEach(article => {
    const resume = (article.summary || article.contenu || '').slice(0,180).replace(/</g,'&lt;');
    const date = article.date || '';
    content += `
      <div class='article-item' onclick="WindowManager.openArticleReader(${article.id})" style="cursor:pointer;border:1px solid #888;border-radius:6px;padding:10px 12px;background:#fff;transition:background .15s;">
        <div style='display:flex;align-items:center;justify-content:space-between;gap:10px;'>
          <h3 style='margin:0;font-size:15px;color:#222;line-height:1.2;'>${article.titre||article.title||'Sans titre'}</h3>
          <span style='font-size:11px;color:#555;'>${date}</span>
        </div>
        <div style='font-size:11px;color:#444;margin-top:6px;'>${resume}${resume.length===180?'…':''}</div>
      </div>`;
  });
  
  return content || '<p>Aucun article disponible pour le moment.</p>';
};

// --- Détails / Critiques Films ---
WindowManager.openFilmCritique = function(filmId){
  if(!window.DataManager?.data?.films) return alert('Pas de films');
  const film = window.DataManager.data.films.find(f=> String(f.id)===String(filmId));
  if(!film) return alert('Film introuvable');
  const poster = film.image || film.poster || '';
  const note = film.note ? '⭐'.repeat(Math.min(5, film.note)) : '—';
  const critique = (film.critique||'Aucune critique.').replace(/</g,'&lt;').replace(/\n/g,'<br>');
  const content = `
    <div style='display:flex;height:100%;'>
      <div style='width:240px;border-right:1px solid #999;background:#f0f0f0;padding:10px;overflow:auto;'>
        ${poster? `<div style='border:1px solid #777;padding:2px;background:#000;'><img src='${poster}' style='width:100%;height:auto;object-fit:cover;'></div>`:''}
        <h2 style='font-size:16px;margin:10px 0 4px;color:#003399;'>${film.titre||'Sans titre'}</h2>
        <div style='font-size:12px;color:#333;margin-bottom:6px;'>${film.year||''}</div>
        <div style='font-size:12px;margin-bottom:8px;'>Note: ${note}</div>
        ${film.bandeAnnonce? `<button onclick="window.open('${film.bandeAnnonce}','_blank')" style='font-size:11px;padding:4px 8px;'>Bande annonce</button>`:''}
      </div>
      <div style='flex:1;display:flex;flex-direction:column;'>
        <div style='padding:10px 14px;flex:1;overflow:auto;background:#fff;'>
          <h3 style='margin:0 0 10px;font-size:15px;color:#222;'>Critique</h3>
          <div style='font-size:13px;line-height:1.5;'>${critique}</div>
        </div>
      </div>
    </div>`;
  this.createWindow({ title:`Film: ${film.titre||film.title||'Film'}`, icon:'icons/film.png', width:720, height:520, content });
};

// --- Lecteur double-page Articles ---
window.ArticleReaders = window.ArticleReaders || {};
WindowManager.openArticleReader = function(articleId){
  if(!window.DataManager?.data?.articles) return alert('Pas d\u0027articles');
  const article = window.DataManager.data.articles.find(a=> String(a.id)===String(articleId));
  if(!article) return alert('Article introuvable');
  if(article.pdfUrl){
    const content = `
      <div style='display:flex;flex-direction:column;height:100%;'>
        <div style='padding:6px 10px;background:#ece9d8;border-bottom:1px solid #999;font-size:12px;display:flex;justify-content:space-between;align-items:center;'>
          <strong>${(article.titre||'Article')}</strong>
          <span style='font-size:11px;color:#555;'>PDF • ${article.date||''}</span>
        </div>
        <div style='flex:1;position:relative;'>
          <iframe src='${article.pdfUrl}' style='width:100%;height:100%;border:0;background:#fff;'></iframe>
        </div>
      </div>`;
    this.createWindow({ title:`Article: ${article.titre||'PDF'}`, icon:'icons/article.png', width:860, height:620, content });
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
        <strong>${(article.titre||'Article')}</strong>
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
      const st=ArticleReaders[articleId]; if(!st) return; const pair=renderPair(articleId); left.innerHTML=pair.left; right.innerHTML=pair.right; pageNum.textContent = (st.index+1).toString(); totalSpan.textContent = st.pages.length.toString();
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
      content.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#ece9d8;border-bottom:1px solid #999;font-size:11px;">
          <div><strong>CV PDF</strong>${window.cvData.lastUpdated? ' - '+ new Date(window.cvData.lastUpdated).toLocaleDateString() : ''}</div>
          <div>
            <button style='margin-right:6px;' onclick="(function(u){ window.open(u,'_blank'); })(window.cvData.pdfUrl);">Nouvel Onglet</button>
            <button onclick="(function(u){ const a=document.createElement('a'); a.href=u; a.download='cv.pdf'; a.click(); })(window.cvData.pdfUrl);">Télécharger</button>
          </div>
        </div>
        <iframe src='${window.cvData.pdfUrl}' style="width:100%;height:calc(100% - 32px);border:0;background:white;"></iframe>
      `;
  WindowManager.createWindow({ title:'CV', icon:'icons/cv.png', content, width:700, height:500 });
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
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'CV',
    icon: 'icons/cv.png',
    width: 750,
    height: 600,
    content: content
  });
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
    const cover = manga.cover || 'https://via.placeholder.com/150x200?text=No+Cover';
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
          <img src="${cover}" alt="${manga.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${manga.title}</h3>
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
