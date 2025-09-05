// Solution unifiée pour l'administration - Version complète
console.log("🔧 Chargement du module d'administration unifié");

// Stockage des fonctions originales si elles existent
let originalCreateAdminPanelWindow = null;
if (typeof window.createAdminPanelWindow === 'function') {
  originalCreateAdminPanelWindow = window.createAdminPanelWindow;
  console.log("📌 Fonction createAdminPanelWindow originale sauvegardée");
}

// Gestionnaire unifié du panneau d'administration
window.AdminManager = {
  // Configuration
  config: {
    defaultWidth: 750,
    defaultHeight: 550,
    minWidth: 600,
    minHeight: 400
  },
  
  // État interne
  state: {
    activeTab: 'dashboard',
    editingItem: null,
    itemType: null,
    isUploading: false,
    isInitialized: false
  },
  
  // Initialisation du gestionnaire
  init() {
    if (this.state.isInitialized) {
      console.log("ℹ️ AdminManager déjà initialisé");
      return;
    }
    
    console.log("🚀 Initialisation d'AdminManager");
    
    // Charger le token GitHub si disponible
    const token = localStorage.getItem('github_token') || sessionStorage.getItem('github_token');
    if (typeof window.GITHUB_CONFIG !== 'undefined') {
      window.GITHUB_CONFIG.token = token;
    }
    
    this.state.isInitialized = true;
    this.state.tagEditors = {};
  },

  // ----- Tag editor (chips + suggestions) -----
  _buildTagSuggestions(){
    const set = new Set();
    (window.tags||[]).forEach(t=> t?.name && set.add(String(t.name)));
    (window.films||[]).forEach(f=> (f.tags||[]).forEach(x=> x && set.add(String(x))));
    (window.articles||[]).forEach(a=> (a.tags||[]).forEach(x=> x && set.add(String(x))));
    (window.mangas||[]).forEach(m=> (m.tags||[]).forEach(x=> x && set.add(String(x))));
    return Array.from(set).sort((a,b)=> a.localeCompare(b));
  },
  initTagEditor(editorId, hiddenInputId, initialTags){
    const root=document.getElementById(editorId); if(!root) return;
    const tags=(initialTags||[]).map(s=> String(s).trim()).filter(Boolean);
    if(!this.state.tagEditors) this.state.tagEditors={};
    this.state.tagEditors[editorId]={ tags };
    root.innerHTML=`
      <div class='tags-chips' style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;border:1px solid #ACA899;border-radius:3px;padding:6px;background:#fff;">
        <div class='chips' style='display:flex;flex-wrap:wrap;gap:6px;'></div>
        <input type='text' class='tag-input' placeholder='Ajouter un tag…' style='flex:1;min-width:120px;border:0;outline:none;'>
      </div>
      <div class='tag-suggest' style='position:relative;'>
        <div class='menu' style='position:absolute;z-index:5;left:0;right:0;background:#fff;border:1px solid #ACA899;border-top:0;display:none;max-height:160px;overflow:auto;'></div>
      </div>`;
    const chips=root.querySelector('.chips');
    const input=root.querySelector('.tag-input');
    const menu=root.querySelector('.tag-suggest .menu');
    const hidden=hiddenInputId? document.getElementById(hiddenInputId): null;
    const sync=()=>{ this.state.tagEditors[editorId].tags = tags.slice(); if(hidden) hidden.value = tags.join(', '); };
    const render=()=>{
      chips.innerHTML='';
      tags.forEach((t,idx)=>{
        const el=document.createElement('span');
        el.style.cssText='display:inline-flex;align-items:center;background:#e7f0fb;border:1px solid #8ab4f8;color:#0b57d0;border-radius:12px;padding:2px 8px;font-size:11px;';
        el.innerHTML = `<span>${t}</span><button title='Retirer' style="margin-left:6px;border:0;background:#e33;color:#fff;width:16px;height:16px;border-radius:50%;line-height:16px;font-size:10px;cursor:pointer">×</button>`;
        el.querySelector('button').addEventListener('click',()=>{ tags.splice(idx,1); sync(); render(); });
        chips.appendChild(el);
      });
    };
    const addTag=(raw)=>{ const t=String(raw||'').trim(); if(!t) return; if(tags.includes(t)) return; tags.push(t); sync(); render(); input.value=''; hideMenu(); };
    const suggestions=this._buildTagSuggestions();
    const showMenu=(items)=>{ if(!items.length){ hideMenu(); return; } menu.style.display='block'; menu.innerHTML=items.slice(0,12).map(s=>`<div class='itm' style="padding:6px 8px;cursor:pointer;border-top:1px solid #eee;">${s}</div>`).join(''); Array.from(menu.querySelectorAll('.itm')).forEach(el=> el.addEventListener('click',()=> addTag(el.textContent))); };
    const hideMenu=()=>{ menu.style.display='none'; };
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter' || e.key===','){ e.preventDefault(); addTag(input.value.replace(/,+$/,'')); } else if(e.key==='Backspace' && !input.value && tags.length){ tags.pop(); sync(); render(); } });
    input.addEventListener('input',()=>{ const q=input.value.trim().toLowerCase(); if(!q){ hideMenu(); return; } const items=suggestions.filter(s=> s.toLowerCase().includes(q) && !tags.includes(s)); showMenu(items); });
    input.addEventListener('blur',()=> setTimeout(hideMenu,150));
    // initial render
    sync(); render();
  },
  getTagEditorTags(editorId){ return (this.state.tagEditors && this.state.tagEditors[editorId] && this.state.tagEditors[editorId].tags) || []; },
  
  // Création du panneau d'administration - Méthode unifiée
  createPanel(editItemId = null, itemType = 'film') {
    console.log(`📝 Création du panneau d'administration (type: ${itemType}, id: ${editItemId})`);
    
    // S'assurer que le gestionnaire est initialisé
    if (!this.state.isInitialized) {
      this.init();
    }
    
    // Mettre à jour l'état
    this.state.editingItem = editItemId;
    this.state.itemType = itemType;
    
    // Générer le contenu HTML de base
    const content = this.generatePanelHTML();
    
    // Créer la fenêtre avec WindowManager si disponible
    let win;
    
    try {
      if (typeof window.WindowManager !== 'undefined' && typeof window.WindowManager.createWindow === 'function') {
        win = window.WindowManager.createWindow({
          title: 'Panneau d\'administration',
          icon: 'icons/key.png',
          width: `${this.config.defaultWidth}px`,
          height: `${this.config.defaultHeight}px`,
          content: content,
          minWidth: this.config.minWidth,
          minHeight: this.config.minHeight,
          onClose: () => {
            if (this.state.isUploading) {
              if (confirm('Un upload est en cours. Êtes-vous sûr de vouloir fermer cette fenêtre?')) {
                return true;
              }
              return false;
            }
            return true;
          }
        });
      } else {
        // Fallback si WindowManager n'est pas disponible
        console.log("⚠️ WindowManager non disponible, utilisation de la méthode alternative");
        win = this.createSimpleWindow(content);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de la fenêtre:", error);
      win = this.createSimpleWindow(content);
    }
    
    // Initialiser les gestionnaires d'événements après un court délai
    setTimeout(() => {
      this.initEventHandlers();
      
      // Charger l'interface appropriée selon l'état
      if (editItemId) {
        if (itemType === 'film') {
          this.loadFilmForm(editItemId);
        } else {
          this.loadDashboard();
        }
      } else {
        this.loadDashboard();
      }
    }, 100);
    
    return win;
  },
  
  // Création d'une fenêtre simple (fallback)
  createSimpleWindow(content) {
    // Générer un ID unique pour la fenêtre
    const winId = 'adminpanel_' + Date.now();
    
    // Créer l'élément de fenêtre
    const win = document.createElement('div');
    win.id = winId;
    win.className = 'xp-window admin-window';
    win.style.position = 'absolute';
    win.style.width = `${this.config.defaultWidth}px`;
    win.style.height = `${this.config.defaultHeight}px`;
    win.style.left = '150px';
    win.style.top = '100px';
    win.style.zIndex = 9999;
    win.style.backgroundColor = '#ECE9D8';
    win.style.border = '3px solid #0058a8';
    win.style.borderRadius = '3px';
    win.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    
    // Construire le contenu HTML de la fenêtre
    win.innerHTML = `
      <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;cursor:move;">
        <span style="display:flex;align-items:center;">
          <img src="icons/key.png" alt="Admin" style="width:16px;height:16px;margin-right:6px;">
          <span>Panneau d'administration</span>
        </span>
        <div style="display:flex;">
          <span class="xp-btn close" style="margin:0 2px;cursor:pointer;width:16px;height:16px;text-align:center;line-height:16px;background:#f00;color:#fff;border-radius:2px;" onclick="document.getElementById('${winId}').remove()">✖</span>
        </div>
      </div>
      <div style="overflow:auto;height:calc(100% - 35px);">
        ${content}
      </div>
    `;
    
    // Ajouter la fenêtre au document
    document.body.appendChild(win);
    
    // Rendre la fenêtre draggable
    this.makeDraggable(win);
    
    return win;
  },
  
  // Rendre un élément draggable
  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const titlebar = element.querySelector('.xp-titlebar');
    
    if (titlebar) {
      titlebar.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // Position initiale du curseur
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // Calculer la nouvelle position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Définir la nouvelle position
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      // Arrêter de déplacer lorsque le bouton de la souris est relâché
      document.onmouseup = null;
      document.onmousemove = null;
    }
  },
  
  // Génération du HTML de base pour le panneau
  generatePanelHTML() {
    return `
      <div class="admin-panel">
        <div class="admin-toolbar" style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;flex-wrap:wrap;">
          <button id="btn-dashboard" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Dashboard
          </button>
          <button id="btn-add-film" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Ajouter Film
          </button>
          <button id="btn-list-films" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer Films
          </button>
          <button id="btn-manage-articles" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Articles
          </button>
          <button id="btn-manage-tags" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Tags
          </button>
          <button id="btn-manage-mangas" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Mangas
          </button>
          <button id="btn-manage-icons" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Icônes
          </button>
          <button id="btn-manage-cv" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            CV
          </button>
          <button id="btn-import-export" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Import/Export
          </button>
          <button id="btn-welcome-popup" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Popup Bienvenue
          </button>
          <button id="btn-github-token" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Token GitHub
          </button>
        </div>
        <div id="admin-content" style="padding:15px;height:calc(100% - 50px);overflow-y:auto;">
          <div class="loading-indicator" style="text-align:center;padding:20px;">
            <p>Chargement en cours...</p>
          </div>
        </div>
      </div>
    `;
  },
  
  // Initialisation des gestionnaires d'événements
  initEventHandlers() {
    document.getElementById('btn-dashboard')?.addEventListener('click', () => this.loadDashboard());
    document.getElementById('btn-add-film')?.addEventListener('click', () => this.loadFilmForm());
    document.getElementById('btn-list-films')?.addEventListener('click', () => this.loadFilmsList());
  document.getElementById('btn-manage-articles')?.addEventListener('click', () => this.loadArticlesManager());
  document.getElementById('btn-manage-tags')?.addEventListener('click', () => this.loadTagsManager());
  document.getElementById('btn-manage-mangas')?.addEventListener('click', () => this.loadMangasManager && this.loadMangasManager());
  document.getElementById('btn-manage-icons')?.addEventListener('click', () => this.loadIconsManager());
  document.getElementById('btn-manage-cv')?.addEventListener('click', () => this.loadCVManager && this.loadCVManager());
  document.getElementById('btn-import-export')?.addEventListener('click', () => this.loadImportExportManager());
    document.getElementById('btn-welcome-popup')?.addEventListener('click', () => this.loadWelcomePopupConfig());
    document.getElementById('btn-github-token')?.addEventListener('click', () => this.loadTokenManager());
  },
  
  // Chargement du tableau de bord
  loadDashboard() {
    console.log("📊 Chargement du tableau de bord");
    this.state.activeTab = 'dashboard';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Obtenir les statistiques
  const filmCount = Array.isArray(window.films) ? window.films.length : 0;
  const articleCount = Array.isArray(window.articles) ? window.articles.length : 0;
  const tagCount = Array.isArray(window.tags) ? window.tags.length : 0;
  const mangaCount = Array.isArray(window.mangas) ? window.mangas.length : 0;
  const customIconCount = window.desktopIcons?.customIcons?.length || 0;
    
    // Générer le HTML du tableau de bord
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Tableau de bord
      </h3>
      
      <div class="dashboard-stats" style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
        <div class="stat-card" style="flex:1;min-width:140px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Films</h4><p style="font-size:24px;font-weight:bold;margin:5px 0;">${filmCount}</p>
        </div>
        <div class="stat-card" style="flex:1;min-width:140px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Articles</h4><p style="font-size:24px;font-weight:bold;margin:5px 0;">${articleCount}</p>
        </div>
        <div class="stat-card" style="flex:1;min-width:140px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Tags</h4><p style="font-size:24px;font-weight:bold;margin:5px 0;">${tagCount}</p>
        </div>
        <div class="stat-card" style="flex:1;min-width:140px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Mangas</h4><p style="font-size:24px;font-weight:bold;margin:5px 0;">${mangaCount}</p>
        </div>
        <div class="stat-card" style="flex:1;min-width:140px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Icônes+</h4><p style="font-size:24px;font-weight:bold;margin:5px 0;">${customIconCount}</p>
        </div>
      </div>
      
      <h4 style="color:#333;border-bottom:1px solid #ddd;padding-bottom:5px;">Actions rapides</h4>
      <div class="quick-actions" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;">
        <button id="quick-add-film" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
          + Nouveau film
        </button>
        <button id="quick-save-data" style="padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;">
          Sauvegarder données
        </button>
      </div>
      
      <div class="github-status" style="margin-top:25px;padding:10px;background:#f8f8f8;border:1px solid #ddd;border-radius:3px;">
        <h4 style="margin-top:0;color:#333;">Statut GitHub</h4>
        <p>
          Token: <span id="github-token-status">${window.GITHUB_CONFIG && window.GITHUB_CONFIG.token ? '✅ Configuré' : '❌ Non configuré'}</span>
        </p>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements pour les actions rapides
    document.getElementById('quick-add-film')?.addEventListener('click', () => this.loadFilmForm());
    document.getElementById('quick-save-data')?.addEventListener('click', () => this.saveAllData());
  },
  
  // Chargement du gestionnaire de token GitHub
  loadTokenManager() {
    console.log('🔑 Chargement du gestionnaire de token GitHub');
    this.state.activeTab = 'github-token';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Configuration du token GitHub
      </h3>
      
      <div style="background:#f8f8f8;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;">
        <p>
          Le token GitHub est nécessaire pour sauvegarder vos données sur GitHub. 
          Vous pouvez créer un token d'accès personnel sur 
          <a href="https://github.com/settings/tokens" target="_blank">https://github.com/settings/tokens</a>
        </p>
        <p>
          Assurez-vous de donner au token les autorisations <strong>repo</strong> pour accéder au dépôt.
        </p>
        <p>Statut actuel: <span id="token-status">${window.GITHUB_CONFIG && window.GITHUB_CONFIG.token ? '✅ Token configuré' : '❌ Token manquant'}</span></p>
      </div>
      <form id="github-token-form">
        <div style="margin-bottom:15px;">
          <label for="github-token" style="display:block;margin-bottom:5px;font-weight:bold;">Token GitHub</label>
          <input type="password" id="github-token" value="${window.GITHUB_CONFIG && window.GITHUB_CONFIG.token ? window.GITHUB_CONFIG.token : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
          <p style="margin-top:5px;font-size:small;color:#666;">
            Format: commence par 'ghp_' ou 'github_pat_' suivi de caractères alphanumériques
          </p>
        </div>
        
        <div style="margin-bottom:15px;">
          <label style="display:flex;align-items:center;cursor:pointer;">
            <input type="checkbox" id="remember-token" ${localStorage.getItem('github_token') ? 'checked' : ''}>
            <span style="margin-left:5px;">Mémoriser ce token</span>
          </label>
        </div>
        
        <div style="margin-top:20px;">
          <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Enregistrer
          </button>
          <button type="button" id="token-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('github-token-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGitHubToken();
    });
    
    document.getElementById('token-cancel-btn')?.addEventListener('click', () => {
      this.loadDashboard();
    });
  },
  
  // Sauvegarde du token GitHub
  saveGitHubToken() {
    const tokenInput = document.getElementById('github-token');
    const rememberCheckbox = document.getElementById('remember-token');
    
    if (!tokenInput) return;
    
    const token = tokenInput.value.trim();
    
    // Valider le format du token (basique)
    if (token && !token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      alert('Format de token invalide');
      return;
    }
    
    // Mettre à jour la configuration
    if (typeof window.GITHUB_CONFIG !== 'undefined') {
      window.GITHUB_CONFIG.token = token;
    }
    
    // Sauvegarder dans le stockage approprié
    if (rememberCheckbox?.checked) {
      localStorage.setItem('github_token', token);
      sessionStorage.removeItem('github_token');
    } else {
      localStorage.removeItem('github_token');
      sessionStorage.setItem('github_token', token);
    }
    
    // Afficher une notification
    alert('Token GitHub sauvegardé');
    
    // Retourner au tableau de bord
    this.loadDashboard();
  },
  
  // Formulaire pour ajouter/modifier un film
  loadFilmForm(filmId = null) {
    console.log(`🎬 Chargement du formulaire film (id: ${filmId})`);
    this.state.activeTab = 'film-form';
    this.state.editingItem = filmId;
    this.state.itemType = 'film';
    
    // Trouver le film à éditer
    let filmToEdit = null;
    if (filmId && typeof window.films !== 'undefined') {
      filmToEdit = window.films.find(f => f.id === filmId);
    }
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Générer le HTML du formulaire
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${filmId ? 'Modifier' : 'Ajouter'} un film
      </h3>
      
  <form id="film-form">
        <div style="margin-bottom:15px;">
          <label for="film-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
          <input type="text" id="film-titre" name="titre" value="${filmToEdit ? filmToEdit.titre : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
          <input type="number" id="film-note" name="note" min="0" max="5" value="${filmToEdit ? filmToEdit.note : 0}" 
            style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
          <textarea id="film-critique" name="critique" rows="4" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${filmToEdit ? filmToEdit.critique : ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:5px;font-weight:bold;">Tags</label>
          <div id="film-tags-editor"></div>
          <input type="hidden" id="film-tags-hidden" value="${filmToEdit && Array.isArray(filmToEdit.tags) ? filmToEdit.tags.join(', ') : ''}">
          <div style='font-size:11px;color:#666;margin-top:4px;'>Ajoutez avec Entrée, utilisez la liste de suggestions.</div>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-image" style="display:block;margin-bottom:5px;font-weight:bold;">Affiche (URL) </label>
          <input type="text" id="film-image" name="image" value="${filmToEdit ? (filmToEdit.image||'') : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          <div style="margin-top:6px;display:flex;gap:8px;align-items:center;">
            <input type="file" id="film-image-file" accept="image/*" style="font-size:12px;">
            <span style="font-size:11px;color:#555;">ou collez une URL ci-dessus</span>
          </div>
          <div id="film-image-preview" style="margin-top:8px;"></div>
        </div>

        <div style="margin-bottom:15px;">
          <label style="display:block;margin-bottom:5px;font-weight:bold;">Galerie photos</label>
          <input type="file" id="film-gallery-files" accept="image/*" multiple style="font-size:12px;">
          <div id="film-gallery-list" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;"></div>
          <div style="font-size:11px;color:#666;margin-top:4px;">Astuce: sélectionnez plusieurs images pour les envoyer d'un coup.</div>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-bande-annonce" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la bande annonce</label>
          <input type="text" id="film-bande-annonce" name="bandeAnnonce" value="${filmToEdit ? filmToEdit.bandeAnnonce : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-top:20px;">
          <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${filmToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" id="film-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
    
  // Init tags editor then ajouter les gestionnaires d'événements
  this.initTagEditor('film-tags-editor','film-tags-hidden', filmToEdit ? (filmToEdit.tags||[]) : []);
  this.initFilmFormEvents(filmId);
  },
  
  // Initialisation des événements du formulaire film
  initFilmFormEvents(filmId) {
    // État temporaire pour la galerie
    this.state._filmGallery = [];
    // Bouton annuler
    document.getElementById('film-cancel-btn')?.addEventListener('click', () => {
      this.loadDashboard();
    });
    
    // Formulaire
    document.getElementById('film-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFilm(filmId);
    });

    // Pré-remplir la galerie/preview si édition
    if (filmId && Array.isArray(window.films)){
      const f = window.films.find(x=> x.id===filmId);
      if(f){
        // Affiche
        if(f.image){
          const prev = document.getElementById('film-image-preview');
          if(prev){ prev.innerHTML = `<img src="${f.image}" alt="affiche" style="max-width:180px;max-height:120px;border:1px solid #ACA899;">`; }
        }
        // Galerie
        (f.galerie||[]).forEach(url=> this._pushFilmGalleryThumb(url));
      }
    }

    // Upload affiche
    const posterInput = document.getElementById('film-image-file');
    posterInput?.addEventListener('change', async (ev)=>{
      const file = ev.target.files && ev.target.files[0];
      if(!file) return;
      try{
        const url = await MediaManager.uploadImage(file, MediaManager.config.uploadDirectories.films);
        const urlInput = document.getElementById('film-image');
        if(urlInput) urlInput.value = url;
        const prev = document.getElementById('film-image-preview');
        if(prev){ prev.innerHTML = `<img src="${url}" alt="affiche" style="max-width:180px;max-height:120px;border:1px solid #ACA899;">`; }
        alert('Affiche envoyée');
      }catch(err){ alert('Upload affiche échoué: '+err.message); }
    });

    // Upload galerie multiple
    const galleryInput = document.getElementById('film-gallery-files');
    galleryInput?.addEventListener('change', async (ev)=>{
      const files = ev.target.files; if(!files || !files.length) return;
      try{
        const results = await MediaManager.uploadMultipleImages(files, MediaManager.config.uploadDirectories.films);
        const ok = results.filter(r=> r.success).map(r=> r.url);
        ok.forEach(url=> this._pushFilmGalleryThumb(url));
        const ko = results.filter(r=> !r.success);
        if(ko.length) alert(`${ok.length} image(s) envoyée(s), ${ko.length} erreur(s)`);
      }catch(err){ alert('Upload galerie échoué: '+err.message); }
      finally { ev.target.value = ''; }
    });
  },

  // Ajouter visuellement et mémoriser une image de galerie (films)
  _pushFilmGalleryThumb(url){
    if(!this.state._filmGallery) this.state._filmGallery=[];
    this.state._filmGallery.push(url);
    const list = document.getElementById('film-gallery-list'); if(!list) return;
    const idx = this.state._filmGallery.length-1;
    const wrap = document.createElement('div');
    wrap.style.cssText='width:90px;height:70px;position:relative;border:1px solid #ACA899;background:#fff;display:flex;align-items:center;justify-content:center;';
    wrap.innerHTML = `
      <img src="${url}" style="max-width:100%;max-height:100%;object-fit:cover;">
      <button title="Retirer" style="position:absolute;top:2px;right:2px;border:0;background:#e33;color:#fff;width:18px;height:18px;border-radius:50%;line-height:18px;font-size:11px;cursor:pointer">×</button>
    `;
    wrap.querySelector('button').addEventListener('click',()=>{
      this.state._filmGallery = this.state._filmGallery.filter(u=> u!==url);
      wrap.remove();
    });
    list.appendChild(wrap);
  },
  
  // Sauvegarde d'un film
  saveFilm(filmId) {
    // Création de l'objet film
    const filmData = {
      id: filmId || Date.now(),
      titre: document.getElementById('film-titre')?.value || '',
      note: parseInt(document.getElementById('film-note')?.value) || 0,
      critique: document.getElementById('film-critique')?.value || '',
  image: document.getElementById('film-image')?.value || '',
      bandeAnnonce: document.getElementById('film-bande-annonce')?.value || '',
  galerie: (this.state._filmGallery||[]),
  liens: [],
  tags: (()=>{ let t=this.getTagEditorTags('film-tags-editor'); if(!t.length){ const h=document.getElementById('film-tags-hidden')?.value||''; t=h.split(',').map(s=>s.trim()).filter(Boolean);} return t; })()
    };
    
    // Conserver les données existantes pour les tableaux
    if (filmId && typeof window.films !== 'undefined') {
      const existingFilm = window.films.find(f => f.id === filmId);
      if (existingFilm) {
        // Si aucune modif faite côté UI, garder l'ancienne galerie
        if(!(this.state._filmGallery && this.state._filmGallery.length)){
          filmData.galerie = existingFilm.galerie || [];
        }
        filmData.liens = existingFilm.liens || [];
      }
    }
    
    // Ajouter ou mettre à jour le film
    if (typeof window.films !== 'undefined') {
      if (filmId) {
        // Mettre à jour le film existant
        const index = window.films.findIndex(f => f.id === filmId);
        if (index !== -1) {
          window.films[index] = filmData;
        }
      } else {
        // Ajouter un nouveau film
        window.films.push(filmData);
      }
      
      // Sauvegarder les données
      this.saveAllData();
      
      // Afficher une notification
      alert('Film sauvegardé avec succès');
      
      // Retourner à la liste des films
      this.loadFilmsList();
    } else {
      alert("Erreur: La variable 'films' n'est pas définie");
    }
  },
  
  // Chargement de la liste des films
  loadFilmsList() {
    console.log('📋 Chargement de la liste des films');
    this.state.activeTab = 'films-list';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les films sont disponibles
    if (typeof window.films === 'undefined' || !Array.isArray(window.films)) {
      contentDiv.innerHTML = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gestion des films
        </h3>
        <p>Aucun film disponible. La variable 'films' n'est pas définie.</p>
        
        <div style="margin-top:15px;">
          <button id="add-new-film-btn" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            + Ajouter un premier film
          </button>
        </div>
      `;
      
      document.getElementById('add-new-film-btn')?.addEventListener('click', () => this.loadFilmForm());
      return;
    }
    
    // Tri des films par titre
    const sortedFilms = [...window.films].sort((a, b) => a.titre.localeCompare(b.titre));
    
    // Générer le HTML de la liste
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion des films (${window.films.length})
      </h3>
      
      <div style="margin-bottom:15px;">
        <button id="add-new-film-btn" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          + Ajouter un film
        </button>
      </div>
      
      <div style="margin-bottom:15px;">
        <input type="text" id="film-search" placeholder="Rechercher un film..." 
          style="width:100%;padding:8px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      
      <div class="films-list" style="border:1px solid #ACA899;border-radius:3px;overflow:hidden;">
        <div style="background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 100px 150px;">
          <div>Titre</div>
          <div>Note</div>
          <div>Actions</div>
        </div>
        
        <div id="films-container">
          ${sortedFilms.length > 0 ? sortedFilms.map(film => `
            <div class="film-item" data-id="${film.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 100px 150px;align-items:center;">
              <div style="overflow:hidden;text-overflow:ellipsis;">
                ${film.titre || 'Sans titre'}
              </div>
              <div>
                ${film.note ? '⭐'.repeat(Math.min(film.note, 5)) : '-'}
              </div>
              <div>
                <button class="edit-film-btn" data-id="${film.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
                  Éditer
                </button>
                <button class="delete-film-btn" data-id="${film.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
                  Suppr.
                </button>
              </div>
            </div>
          `).join('') : '<div style="padding:15px;text-align:center;">Aucun film trouvé</div>'}
        </div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('add-new-film-btn')?.addEventListener('click', () => this.loadFilmForm());
    
    // Recherche
    document.getElementById('film-search')?.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.filterFilmsList(searchTerm);
    });
    
    // Boutons d'édition
    document.querySelectorAll('.edit-film-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filmId = parseInt(e.target.dataset.id);
        this.loadFilmForm(filmId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-film-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filmId = parseInt(e.target.dataset.id);
        this.confirmDeleteFilm(filmId);
      });
    });
  },
  
  // Filtrage de la liste des films
  filterFilmsList(searchTerm) {
    if (typeof window.films === 'undefined' || !Array.isArray(window.films)) return;
    
    const container = document.getElementById('films-container');
    if (!container) return;
    
    // Si le terme de recherche est vide, afficher tous les films
    if (!searchTerm) {
      this.loadFilmsList();
      return;
    }
    
    // Filtrer les films par titre
    const filteredFilms = window.films.filter(film => 
      (film.titre || '').toLowerCase().includes(searchTerm)
    ).sort((a, b) => (a.titre || '').localeCompare(b.titre || ''));
    
    // Mettre à jour le contenu
    container.innerHTML = filteredFilms.length ? 
      filteredFilms.map(film => `
        <div class="film-item" data-id="${film.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 100px 150px;align-items:center;">
          <div style="overflow:hidden;text-overflow:ellipsis;">
            ${film.titre || 'Sans titre'}
          </div>
          <div>
            ${film.note ? '⭐'.repeat(Math.min(film.note, 5)) : '-'}
          </div>
          <div>
            <button class="edit-film-btn" data-id="${film.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Éditer
            </button>
            <button class="delete-film-btn" data-id="${film.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
              Suppr.
            </button>
          </div>
        </div>
      `).join('') : 
      '<div style="padding:15px;text-align:center;">Aucun film trouvé</div>';
    
    // Réattacher les gestionnaires d'événements
    document.querySelectorAll('.edit-film-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filmId = parseInt(e.target.dataset.id);
        this.loadFilmForm(filmId);
      });
    });
    
    document.querySelectorAll('.delete-film-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filmId = parseInt(e.target.dataset.id);
        this.confirmDeleteFilm(filmId);
      });
    });
  },
  
  // Confirmation de suppression d'un film
  confirmDeleteFilm(filmId) {
    if (typeof window.films === 'undefined' || !Array.isArray(window.films)) return;
    
    const film = window.films.find(f => f.id === filmId);
    if (!film) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le film "${film.titre || 'Sans titre'}" ?`)) {
      // Supprimer le film
      const index = window.films.findIndex(f => f.id === filmId);
      if (index !== -1) {
        window.films.splice(index, 1);
        
        // Sauvegarder les données
        this.saveAllData();
        
        // Afficher une notification
        alert('Film supprimé avec succès');
        
        // Actualiser la liste
        this.loadFilmsList();
      }
    }
  },
  
  // Sauvegarde de toutes les données
  saveAllData() {
    console.log('💾 Sauvegarde des données');
    
    // Vérifier si la fonction de sauvegarde existe
    // Consolidation locale puis GitHub via DataManager quand disponible
    try {
      if (typeof window.saveData === 'function') window.saveData();
      if (window.DataManager && typeof window.DataManager.saveDataToGitHub === 'function') {
        window.DataManager.saveDataToGitHub();
      } else if (typeof window.saveDataToGitHub === 'function') {
        window.saveDataToGitHub();
      }
      UIManager?.showNotification('Sauvegarde déclenchée', 'info');
    } catch(err){
      console.error('Erreur sauvegarde globale', err);
      alert('Erreur sauvegarde: '+err.message);
    }
  }
  ,
  // === Placeholders supplémentaires ===
  // === ARTICLES (CRUD) ===
  loadArticlesManager() {
    console.log('� Chargement du gestionnaire d\'articles');
    this.state.activeTab = 'articles-list';
    if (!window.articles || !Array.isArray(window.articles)) window.articles = [];
    const contentDiv = document.getElementById('admin-content'); if(!contentDiv) return;
    const articles = [...window.articles].sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">Gestion des articles (${articles.length})</h3>
      <div style='margin-bottom:15px;display:flex;gap:10px;flex-wrap:wrap;'>
        <button id='add-article-btn' style="background:#0058a8;color:#fff;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">+ Nouvel article</button>
        <button id='refresh-articles-btn' style="padding:6px 12px;border-radius:3px;cursor:pointer;">Rafraîchir</button>
        <input id='article-search' type='text' placeholder='Recherche titre...' style='flex:1;min-width:200px;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
      </div>
      <div class='articles-list' style='border:1px solid #ACA899;border-radius:3px;overflow:hidden;'>
        <div style='background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 140px 80px 120px;'>
          <div>Titre</div><div>Date</div><div>Tags</div><div>Actions</div>
        </div>
        <div id='articles-container'>
          ${articles.length ? articles.map(a=>`<div class='article-row' data-id='${a.id}' style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 140px 80px 120px;align-items:center;">
            <div style='overflow:hidden;text-overflow:ellipsis;'>${a.titre || 'Sans titre'}</div>
            <div>${a.date || '-'}</div>
            <div style='font-size:11px;'>${(a.tags||[]).slice(0,2).join(', ') + ((a.tags||[]).length>2?'…':'') || '-'}</div>
            <div>
              <button class='edit-article-btn' data-id='${a.id}' style="padding:3px 6px;margin-right:5px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
              <button class='delete-article-btn' data-id='${a.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
            </div>
          </div>`).join('') : `<div style='padding:15px;text-align:center;'>Aucun article</div>`}
        </div>
      </div>`;
    // Events
    document.getElementById('add-article-btn')?.addEventListener('click', ()=> this.loadArticleForm());
    document.getElementById('refresh-articles-btn')?.addEventListener('click', ()=> this.loadArticlesManager());
    document.getElementById('article-search')?.addEventListener('input', (e)=> this.filterArticlesList(e.target.value.toLowerCase()));
    document.querySelectorAll('.edit-article-btn').forEach(btn=> btn.addEventListener('click', e=> this.loadArticleForm(parseInt(e.target.dataset.id))));
    document.querySelectorAll('.delete-article-btn').forEach(btn=> btn.addEventListener('click', e=> this.confirmDeleteArticle(parseInt(e.target.dataset.id))));
  },
  loadArticleForm(articleId = null) {
    console.log(`📝 Formulaire article (id: ${articleId})`);
    this.state.activeTab = 'article-form';
    if (!window.articles || !Array.isArray(window.articles)) window.articles = [];
    const article = articleId ? window.articles.find(a=> a.id === articleId) : null;
    const contentDiv = document.getElementById('admin-content'); if(!contentDiv) return;
    const today = new Date().toISOString().slice(0,10);
    contentDiv.innerHTML = `
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>${article? 'Modifier':'Nouvel'} article</h3>
      <form id='article-form'>
        <div style='margin-bottom:15px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Titre</label>
          <input type='text' id='article-titre' value="${article? (article.titre||'').replace(/"/g,'&quot;'): ''}" style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;' required>
        </div>
        <div style='margin-bottom:15px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>PDF (optionnel, ≤ 4 Mo)</label>
          <input type='file' id='article-pdf' accept='application/pdf' style='display:block;margin-bottom:6px;'>
          <div id='article-pdf-current' style='font-size:12px;${article?.pdfUrl? '':'display:none;'}'>Actuel: <a href='${article?.pdfUrl||'#'}' target='_blank'>Ouvrir PDF</a></div>
          <progress id='article-pdf-progress' value='0' max='100' style='width:100%;display:none;'></progress>
        </div>
        <div style='margin-bottom:15px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Image de couverture (URL)</label>
          <input type='text' id='article-cover' value='${article? (article.cover||''): ''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          <div style='margin-top:6px;display:flex;gap:8px;align-items:center;'>
            <input type='file' id='article-cover-file' accept='image/*' style='font-size:12px;'>
            <span style='font-size:11px;color:#555;'>ou collez une URL ci-dessus</span>
          </div>
          <div id='article-cover-preview' style='margin-top:8px;'></div>
        </div>
    <div style='margin-bottom:15px;display:flex;gap:15px;flex-wrap:wrap;'>
          <div style='flex:1;min-width:200px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Date</label>
            <input type='date' id='article-date' value='${article? (article.date||today): today}' style='padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
          <div style='flex:2;min-width:220px;'>
      <label style='display:block;margin-bottom:5px;font-weight:bold;'>Tags</label>
      <div id='article-tags-editor'></div>
      <input type='hidden' id='article-tags-hidden' value='${article? (article.tags||[]).join(', '): ''}'>
      <div style='font-size:11px;color:#666;margin-top:4px;'>Ajoutez avec Entrée, utilisez la liste de suggestions.</div>
          </div>
        </div>
        <div style='margin-bottom:15px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Contenu / Markdown</label>
          <textarea id='article-contenu' rows='12' style='width:100%;padding:8px;border:1px solid #ACA899;border-radius:3px;font-family:monospace;'>${article? (article.contenu||'').replace(/</g,'&lt;') : ''}</textarea>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>${article? 'Enregistrer':'Créer'}</button>
          <button type='button' id='article-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Annuler</button>
        </div>
      </form>`;
    document.getElementById('article-cancel-btn')?.addEventListener('click', ()=> this.loadArticlesManager());
  document.getElementById('article-form')?.addEventListener('submit', (e)=> { e.preventDefault(); this.saveArticle(articleId); });
  // Init tag editor
  this.initTagEditor('article-tags-editor','article-tags-hidden', article? (article.tags||[]) : []);
    const pdfInput = document.getElementById('article-pdf');
    pdfInput?.addEventListener('change', async (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const prog = document.getElementById('article-pdf-progress'); prog.style.display='block'; prog.value=0;
      try {
        // Si token GitHub présent on upload directement, sinon fallback dataURL
        if(window.GITHUB_CONFIG?.token && typeof window.uploadBinaryToGitHub === 'function') {
          if(file.type !== 'application/pdf'){ throw new Error('Type de fichier invalide'); }
          // Pas de limite stricte: on laisse GitHub gérer (max 100Mo), on avertit >8Mo.
            if(file.size > 8*1024*1024) alert('⚠️ PDF volumineux, le chargement peut prendre du temps.');
          const safeName = (file.name||'article.pdf').replace(/[^a-zA-Z0-9._-]/g,'_');
          const path = `articles/pdf/${Date.now()}_${safeName}`;
          const res = await window.uploadBinaryToGitHub(file, path);
          if(article){ article.pdfUrl = res.rawUrl; }
          else { window._pendingArticlePdf = res.rawUrl; }
          prog.value = 100;
          const cur = document.getElementById('article-pdf-current'); if(cur){ cur.style.display='block'; cur.querySelector('a').href = (article? article.pdfUrl : window._pendingArticlePdf); }
          setTimeout(()=> prog.style.display='none', 400);
          UIManager?.showNotification('PDF article uploadé sur GitHub', 'success');
        } else {
          if(file.size > 4*1024*1024){ alert('PDF trop volumineux (>4Mo) sans token GitHub'); e.target.value=''; prog.style.display='none'; return; }
          const reader = new FileReader();
          reader.onprogress = ev=> { if(ev.lengthComputable) prog.value = (ev.loaded/ev.total)*100; };
          reader.onload = ev=> {
            if(article){ article.pdfUrl = ev.target.result; }
            else { window._pendingArticlePdf = ev.target.result; }
            prog.style.display='none';
            const cur = document.getElementById('article-pdf-current'); if(cur){ cur.style.display='block'; cur.querySelector('a').href = ev.target.result; }
            alert('PDF chargé (enregistrer pour sauvegarder)');
          };
          reader.onerror = ()=> { prog.style.display='none'; alert('Erreur lecture PDF'); };
          reader.readAsDataURL(file);
        }
      } catch(err){
        prog.style.display='none';
        console.error(err); alert('Upload PDF échoué: '+err.message);
      }
    });

    // Prévisualisation couverture (si édition)
    if(article?.cover){
      const prev = document.getElementById('article-cover-preview');
      if(prev){ prev.innerHTML = `<img src='${article.cover}' alt='couverture' style='max-width:180px;max-height:120px;border:1px solid #ACA899;'>`; }
    }

    // Upload image de couverture
    const coverInput = document.getElementById('article-cover-file');
    coverInput?.addEventListener('change', async (ev)=>{
      const file = ev.target.files && ev.target.files[0]; if(!file) return;
      try{
        const url = await MediaManager.uploadImage(file, MediaManager.config.uploadDirectories.articles);
        const urlInput = document.getElementById('article-cover'); if(urlInput) urlInput.value = url;
        const prev = document.getElementById('article-cover-preview');
        if(prev){ prev.innerHTML = `<img src='${url}' alt='couverture' style='max-width:180px;max-height:120px;border:1px solid #ACA899;'>`; }
        alert('Image de couverture envoyée');
      }catch(err){ alert('Upload couverture échoué: '+err.message); }
      finally{ ev.target.value=''; }
    });
  },
  saveArticle(articleId) {
    if (!window.articles || !Array.isArray(window.articles)) window.articles = [];
    const titre = document.getElementById('article-titre')?.value.trim() || '';
    if (!titre) { alert('Titre requis'); return; }
    const date = document.getElementById('article-date')?.value || new Date().toISOString().slice(0,10);
    const contenu = document.getElementById('article-contenu')?.value || '';
    const cover = document.getElementById('article-cover')?.value || '';
    let tags = this.getTagEditorTags('article-tags-editor');
    if(!tags.length){
      const hidden = document.getElementById('article-tags-hidden')?.value || '';
      tags = hidden.split(',').map(t=>t.trim()).filter(Boolean);
    }
    let article;
    if (articleId) {
      article = window.articles.find(a=> a.id === articleId);
      if (!article) { alert('Article introuvable'); return; }
      Object.assign(article, {titre,date,tags,contenu,cover,updatedAt:Date.now()});
    } else {
      article = { id: Date.now(), titre, date, tags, contenu, cover, createdAt: Date.now() };
      if(window._pendingArticlePdf){ article.pdfUrl = window._pendingArticlePdf; delete window._pendingArticlePdf; }
      window.articles.push(article);
    }
    // Si modification & nouveau PDF en mémoire temporaire
    if(window._pendingArticlePdf && article){ article.pdfUrl = window._pendingArticlePdf; delete window._pendingArticlePdf; }
    this.saveAllData();
    alert('Article sauvegardé');
    this.loadArticlesManager();
  },
  filterArticlesList(search) {
    if (!window.articles || !Array.isArray(window.articles)) return;
    const container = document.getElementById('articles-container'); if(!container) return;
    if (!search) { this.loadArticlesManager(); return; }
    const filtered = window.articles.filter(a=> (a.titre||'').toLowerCase().includes(search));
    if (!filtered.length){ container.innerHTML = `<div style='padding:15px;text-align:center;'>Aucun article</div>`; return; }
    const sorted = filtered.sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    container.innerHTML = sorted.map(a=>`<div class='article-row' data-id='${a.id}' style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 140px 80px 120px;align-items:center;">
      <div style='overflow:hidden;text-overflow:ellipsis;'>${a.titre||'Sans titre'}</div>
      <div>${a.date||'-'}</div>
      <div style='font-size:11px;'>${(a.tags||[]).slice(0,2).join(', ') + ((a.tags||[]).length>2?'…':'') || '-'}</div>
      <div>
        <button class='edit-article-btn' data-id='${a.id}' style="padding:3px 6px;margin-right:5px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
        <button class='delete-article-btn' data-id='${a.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
      </div>
    </div>`).join('');
    container.querySelectorAll('.edit-article-btn').forEach(btn=> btn.addEventListener('click', e=> this.loadArticleForm(parseInt(e.target.dataset.id))));
    container.querySelectorAll('.delete-article-btn').forEach(btn=> btn.addEventListener('click', e=> this.confirmDeleteArticle(parseInt(e.target.dataset.id))));
  },
  confirmDeleteArticle(articleId) {
    if (!window.articles || !Array.isArray(window.articles)) return;
    const article = window.articles.find(a=> a.id === articleId); if(!article) return;
    if (confirm(`Supprimer l'article "${article.titre||'Sans titre'}" ?`)) {
      window.articles = window.articles.filter(a=> a.id !== articleId);
      this.saveAllData();
      alert('Article supprimé');
      this.loadArticlesManager();
    }
  },
  // ================= TAGS (CRUD) =================
  loadTagsManager() {
    console.log('🏷️ Chargement gestionnaire tags');
    if (!window.tags || !Array.isArray(window.tags)) window.tags = [];
    this.state.activeTab='tags-list';
    const contentDiv = document.getElementById('admin-content'); if(!contentDiv) return;
    const tags=[...window.tags].sort((a,b)=> (a.name||'').localeCompare(b.name||''));
    const usageMap={};
    const addUsage=(tag)=>{ if(!usageMap[tag]) usageMap[tag]=0; usageMap[tag]++; };
    (window.films||[]).forEach(f=> (f.tags||[]).forEach(addUsage));
    (window.articles||[]).forEach(a=> (a.tags||[]).forEach(addUsage));
    (window.mangas||[]).forEach(m=> (m.tags||[]).forEach(addUsage));
    contentDiv.innerHTML=`
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>Gestion des tags (${tags.length})</h3>
      <div style='display:flex;flex-wrap:wrap;gap:10px;margin-bottom:15px;'>
        <button id='add-tag-btn' style="background:#0058a8;color:#fff;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">+ Nouveau tag</button>
        <input id='tag-search' type='text' placeholder='Recherche...' style='flex:1;min-width:200px;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
      </div>
      <div class='tags-list' style='border:1px solid #ACA899;border-radius:3px;overflow:hidden;'>
        <div style='background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:160px auto 80px 130px;'>
          <div>Nom</div><div>Description</div><div>Usage</div><div>Actions</div>
        </div>
        <div id='tags-container'>
          ${tags.length ? tags.map(t=>`<div class='tag-row' data-id='${t.id}' style="padding:6px 8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:160px auto 80px 130px;align-items:center;">
            <div style='display:flex;align-items:center;gap:6px;'><span style='display:inline-block;width:16px;height:16px;background:${t.color||'#777'};border:1px solid #555;border-radius:3px;'></span><span>${t.name}</span></div>
            <div style='font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;'>${t.description? t.description.replace(/</g,'&lt;') : '<em style="color:#777;">—</em>'}</div>
            <div>${usageMap[t.name]||0}</div>
            <div>
              <button class='edit-tag-btn' data-id='${t.id}' style="padding:3px 6px;margin-right:4px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
              <button class='delete-tag-btn' data-id='${t.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
            </div>
          </div>`).join('') : `<div style='padding:15px;text-align:center;'>Aucun tag</div>`}
        </div>
      </div>`;
    document.getElementById('add-tag-btn')?.addEventListener('click',()=> this.loadTagForm());
    document.getElementById('tag-search')?.addEventListener('input',(e)=> this.filterTagsList(e.target.value.toLowerCase()));
    contentDiv.querySelectorAll('.edit-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.loadTagForm(parseInt(e.target.dataset.id))));
    contentDiv.querySelectorAll('.delete-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.confirmDeleteTag(parseInt(e.target.dataset.id))));
  },
  loadTagForm(tagId=null){
    console.log(`🏷️ Formulaire tag (id:${tagId})`);
    if(!window.tags||!Array.isArray(window.tags)) window.tags=[];
    const tag = tagId? window.tags.find(t=> t.id===tagId): null;
    this.state.activeTab='tag-form';
    const contentDiv=document.getElementById('admin-content'); if(!contentDiv) return;
    contentDiv.innerHTML=`
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>${tag? 'Modifier':'Nouveau'} tag</h3>
      <form id='tag-form'>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Nom</label>
          <input type='text' id='tag-name' value='${tag? (tag.name||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;' required>
        </div>
        <div style='margin-bottom:12px;display:flex;gap:15px;flex-wrap:wrap;'>
          <div style='flex:1;min-width:140px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Couleur</label>
            <input type='color' id='tag-color' value='${tag? (tag.color||'#777777'):'#777777'}' style='width:70px;height:36px;padding:0;border:1px solid #ACA899;border-radius:4px;'>
          </div>
          <div style='flex:3;min-width:220px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Description (optionnelle)</label>
            <input type='text' id='tag-description' value='${tag? (tag.description||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>${tag? 'Enregistrer':'Créer'}</button>
          <button type='button' id='tag-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Annuler</button>
        </div>
      </form>`;
    document.getElementById('tag-cancel-btn')?.addEventListener('click', ()=> this.loadTagsManager());
    document.getElementById('tag-form')?.addEventListener('submit', (e)=> { e.preventDefault(); this.saveTag(tagId); });
  },
  saveTag(tagId){
    if(!window.tags||!Array.isArray(window.tags)) window.tags=[];
    const name = (document.getElementById('tag-name')?.value||'').trim();
    if(!name){ alert('Nom requis'); return; }
    const color = document.getElementById('tag-color')?.value || '#777777';
    const description = document.getElementById('tag-description')?.value || '';
    const exists = window.tags.some(t=> t.id!==tagId && t.name.toLowerCase()===name.toLowerCase());
    if(exists){ alert('Un tag avec ce nom existe déjà'); return; }
    if(tagId){
      const tag = window.tags.find(t=> t.id===tagId); if(!tag){ alert('Tag introuvable'); return; }
      Object.assign(tag,{ name, color, description, updatedAt:Date.now() });
    } else {
      window.tags.push({ id: Date.now(), name, color, description, createdAt:Date.now() });
    }
    this.saveAllData();
    alert('Tag sauvegardé');
    this.loadTagsManager();
  },
  confirmDeleteTag(tagId){
    if(!window.tags||!Array.isArray(window.tags)) return;
    const tag = window.tags.find(t=> t.id===tagId); if(!tag) return;
    let usage=0; (window.films||[]).forEach(f=> (f.tags||[]).includes(tag.name)&&usage++); (window.articles||[]).forEach(a=> (a.tags||[]).includes(tag.name)&&usage++); (window.mangas||[]).forEach(m=> (m.tags||[]).includes(tag.name)&&usage++);
    if(!confirm(`Supprimer le tag "${tag.name}"${usage? ` (utilisé ${usage} fois)`:''} ?`)) return;
    window.tags = window.tags.filter(t=> t.id!==tagId);
    this.saveAllData();
    alert('Tag supprimé');
    this.loadTagsManager();
  },
  filterTagsList(search){
    if(!window.tags||!Array.isArray(window.tags)) return; const container=document.getElementById('tags-container'); if(!container) return;
    if(!search){ this.loadTagsManager(); return; }
    const tags=window.tags.filter(t=> (t.name||'').toLowerCase().includes(search));
    const usageMap={}; const addUsage=(tg)=>{ if(!usageMap[tg]) usageMap[tg]=0; usageMap[tg]++; };
    (window.films||[]).forEach(f=> (f.tags||[]).forEach(addUsage)); (window.articles||[]).forEach(a=> (a.tags||[]).forEach(addUsage)); (window.mangas||[]).forEach(m=> (m.tags||[]).forEach(addUsage));
    if(!tags.length){ container.innerHTML=`<div style='padding:15px;text-align:center;'>Aucun tag</div>`; return; }
    container.innerHTML = tags.sort((a,b)=> (a.name||'').localeCompare(b.name||'')).map(t=>`<div class='tag-row' data-id='${t.id}' style="padding:6px 8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:160px auto 80px 130px;align-items:center;">
      <div style='display:flex;align-items:center;gap:6px;'><span style='display:inline-block;width:16px;height:16px;background:${t.color||'#777'};border:1px solid #555;border-radius:3px;'></span><span>${t.name}</span></div>
      <div style='font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;'>${t.description? t.description.replace(/</g,'&lt;') : '<em style="color:#777;">—</em>'}</div>
      <div>${usageMap[t.name]||0}</div>
      <div>
        <button class='edit-tag-btn' data-id='${t.id}' style="padding:3px 6px;margin-right:4px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
        <button class='delete-tag-btn' data-id='${t.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
      </div>
    </div>`).join('');
    container.querySelectorAll('.edit-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.loadTagForm(parseInt(e.target.dataset.id))));
    container.querySelectorAll('.delete-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.confirmDeleteTag(parseInt(e.target.dataset.id))));
  },
  loadIconForm(iconId=null, iconType='custom') {
    console.log(`🖥️ Formulaire icône (id:${iconId||'nouvelle'}, type:${iconType})`);
    this.state.activeTab='icon-form';
    if (typeof window.desktopIcons === 'undefined') window.desktopIcons={defaultIcons:[],customIcons:[]};
    let icon=null;
    if(iconId){
      icon = iconType==='default' ? (window.desktopIcons.defaultIcons||[]).find(i=> i.id===iconId) : (window.desktopIcons.customIcons||[]).find(i=> i.id===iconId);
    }
    const contentDiv=document.getElementById('admin-content'); if(!contentDiv) return;
    contentDiv.innerHTML=`
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>${icon? 'Modifier':'Nouvelle'} icône</h3>
      <form id='icon-form'>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Nom</label>
          <input type='text' id='icon-name' value='${icon? (icon.name||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;' required>
        </div>
        <div style='margin-bottom:12px;display:flex;flex-wrap:wrap;gap:15px;'>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>ID</label>
            <input type='text' id='icon-id' ${icon? 'disabled':''} value='${icon? icon.id.replace(/"/g,'&quot;'):''}' placeholder='auto' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Type fenêtre (option)</label>
            <select id='icon-window' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
              <option value=''>Aucune</option>
              <option value='films' ${icon?.window==='films'?'selected':''}>Films</option>
              <option value='articles' ${icon?.window==='articles'?'selected':''}>Articles</option>
              <option value='mangas' ${icon?.window==='mangas'?'selected':''}>Mangas</option>
              <option value='cv' ${icon?.window==='cv'?'selected':''}>CV</option>
              <option value='custom' ${icon?.window==='custom'?'selected':''}>Custom</option>
            </select>
          </div>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Lien URL (si pas fenêtre)</label>
            <input type='text' id='icon-link' value='${icon? (icon.link||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
        </div>
        <div style='margin-bottom:12px;display:flex;flex-wrap:wrap;gap:15px;'>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Position X</label>
            <input type='number' id='icon-x' value='${icon? Math.round(icon.x):20}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Position Y</label>
            <input type='number' id='icon-y' value='${icon? Math.round(icon.y):20}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
          <div style='flex:1;min-width:160px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Icône (chemin)</label>
            <input type='text' id='icon-src' value='${icon? (icon.icon||'').replace(/"/g,'&quot;'):'icons/window.png'}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:flex;align-items:center;gap:6px;cursor:pointer;'>
            <input type='checkbox' id='icon-visible' ${icon? (icon.visible!==false?'checked':''):'checked'}> Visible
          </label>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>${icon? 'Enregistrer':'Créer'}</button>
          <button type='button' id='icon-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Annuler</button>
        </div>
      </form>`;
    document.getElementById('icon-cancel-btn')?.addEventListener('click', ()=> this.loadIconsManager());
    document.getElementById('icon-form')?.addEventListener('submit', (e)=>{ e.preventDefault(); this.saveIcon(iconId, iconType); });
  },
  saveIcon(iconId, iconType){
    if (typeof window.desktopIcons === 'undefined') window.desktopIcons={defaultIcons:[],customIcons:[]};
    const name = (document.getElementById('icon-name')?.value||'').trim(); if(!name){ alert('Nom requis'); return; }
    let id = document.getElementById('icon-id')?.value.trim();
    if(!iconId){ // création
      if(!id) id = 'icon_'+Date.now();
      // Unicité
      const exists = (window.desktopIcons.defaultIcons.concat(window.desktopIcons.customIcons)).some(i=> i.id===id);
      if(exists){ alert('ID déjà utilisé'); return; }
    } else {
      id = iconId; // pas de changement
    }
    const data = {
      id,
      name,
      window: document.getElementById('icon-window')?.value || '',
      link: document.getElementById('icon-link')?.value.trim() || '',
      x: parseInt(document.getElementById('icon-x')?.value)||20,
      y: parseInt(document.getElementById('icon-y')?.value)||20,
      icon: document.getElementById('icon-src')?.value || 'icons/window.png',
      visible: document.getElementById('icon-visible')?.checked
    };
    if(iconId){ // update
      if(iconType==='default'){
        const idx = window.desktopIcons.defaultIcons.findIndex(i=> i.id===iconId); if(idx>-1) window.desktopIcons.defaultIcons[idx] = {...window.desktopIcons.defaultIcons[idx], ...data};
      } else {
        const idx = window.desktopIcons.customIcons.findIndex(i=> i.id===iconId); if(idx>-1) window.desktopIcons.customIcons[idx] = {...window.desktopIcons.customIcons[idx], ...data};
      }
    } else { // create
      window.desktopIcons.customIcons.push(data);
    }
    // Re-render bureau si possible
    if(window.DesktopManager && typeof window.DesktopManager.renderDesktopIcons==='function') window.DesktopManager.renderDesktopIcons();
    this.saveIconsToData();
    alert('Icône sauvegardée');
    this.loadIconsManager();
  },
  confirmDeleteIcon(iconId){
    if(typeof window.desktopIcons==='undefined') return;
    const idx = (window.desktopIcons.customIcons||[]).findIndex(i=> i.id===iconId);
    if(idx===-1){ alert('Icône introuvable (seules les personnalisées sont supprimables)'); return; }
    if(!confirm('Supprimer cette icône ?')) return;
    window.desktopIcons.customIcons.splice(idx,1);
    if(window.DesktopManager) window.DesktopManager.renderDesktopIcons();
    this.saveIconsToData();
    alert('Icône supprimée');
    this.loadIconsManager();
  },
  saveIconsLayout(){
    // Juste persister les positions actuelles (déjà mises à jour en temps réel)
    this.saveIconsToData();
    alert('Positions sauvegardées');
  },
  saveIconsToData(){
    // Désactivé: pas de persistance des positions. On met seulement à jour l'objet runtime si besoin.
    if(window.DataManager && window.DataManager.data){
      window.DataManager.data.desktopIcons = undefined; // ne pas stocker
    }
  },
  // ====== MANGAS (CRUD) ======
  loadMangasManager(){
    console.log('📚 Chargement gestionnaire mangas');
    if(!Array.isArray(window.mangas)) window.mangas = [];
    this.state.activeTab='mangas-list';
    const contentDiv=document.getElementById('admin-content'); if(!contentDiv) return;
    const mangas=[...window.mangas].sort((a,b)=> (a.titre||'').localeCompare(b.titre||''));
    contentDiv.innerHTML=`<h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>Gestion des mangas (${mangas.length})</h3>
      <div style='margin-bottom:15px;display:flex;flex-wrap:wrap;gap:10px;'>
        <button id='add-manga-btn' style="background:#0058a8;color:#fff;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">+ Nouveau manga</button>
        <input id='manga-search' type='text' placeholder='Recherche titre...' style='flex:1;min-width:200px;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
      </div>
      <div style='border:1px solid #ACA899;border-radius:3px;overflow:hidden;'>
        <div style='background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 120px 100px 140px;'>
          <div>Titre</div><div>Chapitres</div><div>Tags</div><div>Actions</div>
        </div>
        <div id='mangas-container'>${mangas.length? mangas.map(m=>`<div class='manga-row' data-id='${m.id}' style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 100px 140px;align-items:center;">
              <div style='overflow:hidden;text-overflow:ellipsis;'>${m.titre||'Sans titre'}</div>
              <div>${m.chapitres||'-'}</div>
              <div style='font-size:11px;'>${(m.tags||[]).slice(0,2).join(', ') + ((m.tags||[]).length>2?'…':'') || '-'}</div>
              <div>
                <button class='edit-manga-btn' data-id='${m.id}' style="padding:3px 6px;margin-right:4px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
                <button class='delete-manga-btn' data-id='${m.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
              </div>
            </div>`).join('') : `<div style='padding:15px;text-align:center;'>Aucun manga</div>`}</div>
      </div>`;
    document.getElementById('add-manga-btn')?.addEventListener('click',()=> this.loadMangaForm());
    document.getElementById('manga-search')?.addEventListener('input',e=> this.filterMangasList(e.target.value.toLowerCase()));
    contentDiv.querySelectorAll('.edit-manga-btn').forEach(btn=> btn.addEventListener('click',e=> this.loadMangaForm(parseInt(e.target.dataset.id))));
    contentDiv.querySelectorAll('.delete-manga-btn').forEach(btn=> btn.addEventListener('click',e=> this.confirmDeleteManga(parseInt(e.target.dataset.id))));
  },
  loadMangaForm(mangaId=null){
    console.log(`📘 Formulaire manga (id:${mangaId})`);
    if(!Array.isArray(window.mangas)) window.mangas=[];
    const manga = mangaId? window.mangas.find(m=> m.id===mangaId): null;
    this.state.activeTab='manga-form';
    const contentDiv=document.getElementById('admin-content'); if(!contentDiv) return;
    contentDiv.innerHTML=`<h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>${manga? 'Modifier':'Nouveau'} manga</h3>
      <form id='manga-form'>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Titre</label>
          <input type='text' id='manga-titre' value='${manga? (manga.titre||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;' required>
        </div>
    <div style='margin-bottom:12px;display:flex;flex-wrap:wrap;gap:15px;'>
          <div style='flex:1;min-width:120px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Chapitres</label>
            <input type='number' id='manga-chapitres' value='${manga? (manga.chapitres||0):0}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
          <div style='flex:2;min-width:200px;'>
      <label style='display:block;margin-bottom:5px;font-weight:bold;'>Tags</label>
      <div id='manga-tags-editor'></div>
      <input type='hidden' id='manga-tags-hidden' value='${manga? (manga.tags||[]).join(', '):''}'>
          </div>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Couverture (URL)</label>
          <input type='text' id='manga-cover' value='${manga? (manga.cover||''):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          <div style='margin-top:6px;display:flex;gap:8px;align-items:center;'>
            <input type='file' id='manga-cover-file' accept='image/*' style='font-size:12px;'>
            <span style='font-size:11px;color:#555;'>ou collez une URL ci-dessus</span>
          </div>
          <div id='manga-cover-preview' style='margin-top:8px;'></div>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Galerie</label>
          <input type='file' id='manga-gallery-files' accept='image/*' multiple style='font-size:12px;'>
          <div id='manga-gallery-list' style='margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;'></div>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Description / Notes</label>
          <textarea id='manga-notes' rows='6' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>${manga? (manga.notes||'').replace(/</g,'&lt;'):''}</textarea>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>${manga? 'Enregistrer':'Créer'}</button>
          <button type='button' id='manga-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Annuler</button>
        </div>
      </form>`;
    document.getElementById('manga-cancel-btn')?.addEventListener('click',()=> this.loadMangasManager());
  document.getElementById('manga-form')?.addEventListener('submit',e=>{ e.preventDefault(); this.saveManga(mangaId); });
  // Init tag editor
  this.initTagEditor('manga-tags-editor','manga-tags-hidden', manga? (manga.tags||[]) : []);

    // État galerie mangas
    this.state._mangaGallery = [];
    if(manga){
      if(manga.cover){ const prev=document.getElementById('manga-cover-preview'); if(prev){ prev.innerHTML = `<img src='${manga.cover}' style='max-width:180px;max-height:120px;border:1px solid #ACA899;'>`; } }
      (manga.gallery||[]).forEach(url=> this._pushMangaGalleryThumb(url));
    }
    document.getElementById('manga-cover-file')?.addEventListener('change',async (ev)=>{
      const file = ev.target.files && ev.target.files[0]; if(!file) return;
      try{
        const url = await MediaManager.uploadImage(file, MediaManager.config.uploadDirectories.mangas);
        const inp = document.getElementById('manga-cover'); if(inp) inp.value = url;
        const prev=document.getElementById('manga-cover-preview'); if(prev){ prev.innerHTML = `<img src='${url}' style='max-width:180px;max-height:120px;border:1px solid #ACA899;'>`; }
        alert('Couverture envoyée');
      }catch(err){ alert('Upload couverture échoué: '+err.message); }
      finally{ ev.target.value=''; }
    });
    document.getElementById('manga-gallery-files')?.addEventListener('change',async (ev)=>{
      const files = ev.target.files; if(!files||!files.length) return;
      try{
        const results = await MediaManager.uploadMultipleImages(files, MediaManager.config.uploadDirectories.mangas);
        const ok = results.filter(r=> r.success).map(r=> r.url);
        ok.forEach(url=> this._pushMangaGalleryThumb(url));
        const ko = results.filter(r=> !r.success);
        if(ko.length) alert(`${ok.length} image(s) envoyée(s), ${ko.length} erreur(s)`);
      }catch(err){ alert('Upload galerie échoué: '+err.message); }
      finally{ ev.target.value=''; }
    });
  },
  _pushMangaGalleryThumb(url){
    if(!this.state._mangaGallery) this.state._mangaGallery=[];
    this.state._mangaGallery.push(url);
    const list=document.getElementById('manga-gallery-list'); if(!list) return;
    const wrap=document.createElement('div');
    wrap.style.cssText='width:90px;height:70px;position:relative;border:1px solid #ACA899;background:#fff;display:flex;align-items:center;justify-content:center;';
    wrap.innerHTML = `
      <img src='${url}' style='max-width:100%;max-height:100%;object-fit:cover;'>
      <button title='Retirer' style='position:absolute;top:2px;right:2px;border:0;background:#e33;color:#fff;width:18px;height:18px;border-radius:50%;line-height:18px;font-size:11px;cursor:pointer'>×</button>
    `;
    wrap.querySelector('button').addEventListener('click',()=>{ this.state._mangaGallery = this.state._mangaGallery.filter(u=> u!==url); wrap.remove(); });
    list.appendChild(wrap);
  },
  saveManga(mangaId){
    if(!Array.isArray(window.mangas)) window.mangas=[];
    const titre=(document.getElementById('manga-titre')?.value||'').trim(); if(!titre){ alert('Titre requis'); return; }
  const chapitres=parseInt(document.getElementById('manga-chapitres')?.value)||0;
  let tags=this.getTagEditorTags('manga-tags-editor');
  if(!tags.length){ const hidden=document.getElementById('manga-tags-hidden')?.value||''; tags=hidden.split(',').map(t=>t.trim()).filter(Boolean); }
    const notes=document.getElementById('manga-notes')?.value||'';
    const cover=(document.getElementById('manga-cover')?.value||'').trim();
    if(mangaId){
      const m=window.mangas.find(mm=> mm.id===mangaId); if(!m){ alert('Manga introuvable'); return; }
      Object.assign(m,{ titre, chapitres, tags, notes, cover, gallery:(this.state._mangaGallery||[]), updatedAt:Date.now() });
    } else {
      window.mangas.push({ id:Date.now(), titre, chapitres, tags, notes, cover, gallery:(this.state._mangaGallery||[]), createdAt:Date.now() });
    }
    this.saveAllData(); alert('Manga sauvegardé'); this.loadMangasManager();
  },
  filterMangasList(search){
    if(!Array.isArray(window.mangas)) return; const container=document.getElementById('mangas-container'); if(!container) return;
    if(!search){ this.loadMangasManager(); return; }
    const filtered=window.mangas.filter(m=> (m.titre||'').toLowerCase().includes(search));
    if(!filtered.length){ container.innerHTML='<div style="padding:15px;text-align:center;">Aucun manga</div>'; return; }
    container.innerHTML = filtered.sort((a,b)=> (a.titre||'').localeCompare(b.titre||'')).map(m=>`<div class='manga-row' data-id='${m.id}' style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 100px 140px;align-items:center;">
      <div style='overflow:hidden;text-overflow:ellipsis;'>${m.titre||'Sans titre'}</div>
      <div>${m.chapitres||'-'}</div>
      <div style='font-size:11px;'>${(m.tags||[]).slice(0,2).join(', ') + ((m.tags||[]).length>2?'…':'') || '-'}</div>
      <div>
        <button class='edit-manga-btn' data-id='${m.id}' style="padding:3px 6px;margin-right:4px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
        <button class='delete-manga-btn' data-id='${m.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
      </div>
    </div>`).join('');
    container.querySelectorAll('.edit-manga-btn').forEach(btn=> btn.addEventListener('click',e=> this.loadMangaForm(parseInt(e.target.dataset.id))));
    container.querySelectorAll('.delete-manga-btn').forEach(btn=> btn.addEventListener('click',e=> this.confirmDeleteManga(parseInt(e.target.dataset.id))));
  },
  confirmDeleteManga(mangaId){
    if(!Array.isArray(window.mangas)) return; const m=window.mangas.find(mm=> mm.id===mangaId); if(!m) return;
    if(!confirm(`Supprimer le manga "${m.titre||'Sans titre'}" ?`)) return;
    window.mangas = window.mangas.filter(mm=> mm.id!==mangaId); this.saveAllData(); alert('Manga supprimé'); this.loadMangasManager();
  },
  // ====== CV MANAGER ======
  loadCVManager(){
    console.log('📄 Chargement gestionnaire CV');
    if(!window.cvData) window.cvData = { summary:'', experiences:[], education:[], skills:[], pdfUrl:'', lastUpdated:null };
    this.state.activeTab='cv';
    const d=document.getElementById('admin-content'); if(!d) return;
    d.innerHTML=`<h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>CV</h3>
      <form id='cv-form'>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Fichier PDF du CV</label>
          <input type='file' id='cv-pdf-file' accept='application/pdf' style='display:block;margin-bottom:6px;'>
          <div style='font-size:12px;color:#555;margin-bottom:6px;'>Sélectionnez un PDF (<= 2 Mo) pour l'intégrer. Il sera stocké localement (data URL) et sauvegardé via GitHub.</div>
          <div id='cv-pdf-current' style='font-size:12px;color:#333;${window.cvData.pdfUrl? '':'display:none;'}'>Actuel: <a href='${window.cvData.pdfUrl||'#'}' target='_blank'>Ouvrir PDF</a></div>
          <progress id='cv-pdf-progress' value='0' max='100' style='width:100%;display:none;'></progress>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Résumé</label>
          <textarea id='cv-summary' rows='4' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>${(window.cvData.summary||'').replace(/</g,'&lt;')}</textarea>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Expériences (une par ligne)</label>
          <textarea id='cv-experiences' rows='6' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>${(window.cvData.experiences||[]).join('\n').replace(/</g,'&lt;')}</textarea>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Formations (une par ligne)</label>
          <textarea id='cv-education' rows='4' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>${(window.cvData.education||[]).join('\n').replace(/</g,'&lt;')}</textarea>
        </div>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Compétences (séparées par des virgules)</label>
          <input id='cv-skills' type='text' value='${(window.cvData.skills||[]).join(', ').replace(/"/g,'&quot;')}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>Enregistrer</button>
          <button type='button' id='cv-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Tableau de bord</button>
        </div>
      </form>`;
    const fileInput = d.querySelector('#cv-pdf-file');
    fileInput?.addEventListener('change', async (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const progress = d.querySelector('#cv-pdf-progress'); progress.style.display='block'; progress.value=0;
      try {
        if(window.GITHUB_CONFIG?.token && typeof window.uploadBinaryToGitHub === 'function') {
          if(file.type !== 'application/pdf') throw new Error('Fichier non PDF');
          if(file.size > 12*1024*1024) alert('⚠️ PDF très volumineux, patience...');
          const safeName = (file.name||'cv.pdf').replace(/[^a-zA-Z0-9._-]/g,'_');
          const path = `cv/${Date.now()}_${safeName}`;
          const res = await window.uploadBinaryToGitHub(file, path);
          window.cvData.pdfUrl = res.rawUrl;
          window.cvData.lastUpdated = Date.now();
          if(window.DataManager?.data){ window.DataManager.data.cvData = JSON.parse(JSON.stringify(window.cvData)); }
          progress.value = 100; setTimeout(()=> progress.style.display='none', 400);
          const cur = d.querySelector('#cv-pdf-current'); if(cur){ cur.style.display='block'; cur.querySelector('a').href = window.cvData.pdfUrl; }
          UIManager?.showNotification('CV uploadé sur GitHub', 'success');
          // Sauvegarde data.json distante
          if(typeof window.DataManager?.saveDataToGitHub === 'function') window.DataManager.saveDataToGitHub();
        } else {
          if(file.size > 2*1024*1024){ alert('Fichier trop volumineux (>2Mo) sans token GitHub'); progress.style.display='none'; return; }
          const reader = new FileReader();
          reader.onprogress = ev=> { if(ev.lengthComputable){ progress.value = (ev.loaded/ev.total)*100; } };
          reader.onload = ev=> {
            window.cvData.pdfUrl = ev.target.result; window.cvData.lastUpdated = Date.now();
            if(window.DataManager?.data){ window.DataManager.data.cvData = JSON.parse(JSON.stringify(window.cvData)); }
            progress.style.display='none';
            const cur = d.querySelector('#cv-pdf-current'); if(cur){ cur.style.display='block'; cur.querySelector('a').href = window.cvData.pdfUrl; }
            UIManager?.showNotification('PDF chargé localement (token manquant)', 'warning');
          };
          reader.onerror = ()=> { progress.style.display='none'; alert('Erreur lecture fichier'); };
          reader.readAsDataURL(file);
        }
      } catch(err){ progress.style.display='none'; console.error(err); alert('Upload CV échoué: '+err.message); }
    });
    document.getElementById('cv-cancel-btn')?.addEventListener('click',()=> this.loadDashboard());
    document.getElementById('cv-form')?.addEventListener('submit',e=>{ e.preventDefault(); this.saveCV(true); });
  },
  saveCV(triggerSave=false){
    if(!window.cvData) window.cvData={};
    window.cvData.summary=document.getElementById('cv-summary')?.value||'';
    window.cvData.experiences=(document.getElementById('cv-experiences')?.value||'').split(/\n+/).map(l=>l.trim()).filter(Boolean);
    window.cvData.education=(document.getElementById('cv-education')?.value||'').split(/\n+/).map(l=>l.trim()).filter(Boolean);
    window.cvData.skills=(document.getElementById('cv-skills')?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
    if(window.DataManager?.data){ window.DataManager.data.cvData = JSON.parse(JSON.stringify(window.cvData)); }
    if(triggerSave){ this.saveAllData(); }
    alert('CV sauvegardé');
  },
  loadTagForm(tagId=null){
    console.log(`🏷️ Formulaire tag (id:${tagId})`);
    if(!window.tags||!Array.isArray(window.tags)) window.tags=[];
    const tag = tagId? window.tags.find(t=> t.id===tagId): null;
    this.state.activeTab='tag-form';
    const contentDiv=document.getElementById('admin-content'); if(!contentDiv) return;
    contentDiv.innerHTML=`
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>${tag? 'Modifier':'Nouveau'} tag</h3>
      <form id='tag-form'>
        <div style='margin-bottom:12px;'>
          <label style='display:block;margin-bottom:5px;font-weight:bold;'>Nom</label>
          <input type='text' id='tag-name' value='${tag? (tag.name||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;' required>
        </div>
        <div style='margin-bottom:12px;display:flex;gap:15px;flex-wrap:wrap;'>
          <div style='flex:1;min-width:140px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Couleur</label>
            <input type='color' id='tag-color' value='${tag? (tag.color||'#777777'):'#777777'}' style='width:70px;height:36px;padding:0;border:1px solid #ACA899;border-radius:4px;'>
          </div>
          <div style='flex:3;min-width:220px;'>
            <label style='display:block;margin-bottom:5px;font-weight:bold;'>Description (optionnelle)</label>
            <input type='text' id='tag-description' value='${tag? (tag.description||'').replace(/"/g,'&quot;'):''}' style='width:100%;padding:6px;border:1px solid #ACA899;border-radius:3px;'>
          </div>
        </div>
        <div style='margin-top:15px;'>
          <button type='submit' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:8px 16px;border-radius:3px;cursor:pointer;'>${tag? 'Enregistrer':'Créer'}</button>
          <button type='button' id='tag-cancel-btn' style='margin-left:10px;padding:8px 16px;border-radius:3px;cursor:pointer;'>Annuler</button>
        </div>
      </form>`;
    document.getElementById('tag-cancel-btn')?.addEventListener('click', ()=> this.loadTagsManager());
    document.getElementById('tag-form')?.addEventListener('submit', (e)=> { e.preventDefault(); this.saveTag(tagId); });
  },
  saveTag(tagId){
    if(!window.tags||!Array.isArray(window.tags)) window.tags=[];
    const name = (document.getElementById('tag-name')?.value||'').trim();
    if(!name){ alert('Nom requis'); return; }
    const color = document.getElementById('tag-color')?.value || '#777777';
    const description = document.getElementById('tag-description')?.value || '';
    // Unicité nom (case insensitive)
    const exists = window.tags.some(t=> t.id!==tagId && t.name.toLowerCase()===name.toLowerCase());
    if(exists){ alert('Un tag avec ce nom existe déjà'); return; }
    if(tagId){
      const tag = window.tags.find(t=> t.id===tagId); if(!tag){ alert('Tag introuvable'); return; }
      Object.assign(tag,{ name, color, description, updatedAt:Date.now() });
    } else {
      window.tags.push({ id: Date.now(), name, color, description, createdAt:Date.now() });
    }
    this.saveAllData();
    alert('Tag sauvegardé');
    this.loadTagsManager();
  },
  confirmDeleteTag(tagId){
    if(!window.tags||!Array.isArray(window.tags)) return;
    const tag = window.tags.find(t=> t.id===tagId); if(!tag) return;
    // Calcul usage
    let usage=0; (window.films||[]).forEach(f=> (f.tags||[]).includes(tag.name)&&usage++); (window.articles||[]).forEach(a=> (a.tags||[]).includes(tag.name)&&usage++); (window.mangas||[]).forEach(m=> (m.tags||[]).includes(tag.name)&&usage++);
    if(!confirm(`Supprimer le tag "${tag.name}"${usage? ` (utilisé ${usage} fois)`:''} ?`)) return;
    window.tags = window.tags.filter(t=> t.id!==tagId);
    this.saveAllData();
    alert('Tag supprimé');
    this.loadTagsManager();
  },
  filterTagsList(search){
    if(!window.tags||!Array.isArray(window.tags)) return; const container=document.getElementById('tags-container'); if(!container) return;
    if(!search){ this.loadTagsManager(); return; }
    const tags=window.tags.filter(t=> (t.name||'').toLowerCase().includes(search));
    // Rebuild usage
    const usageMap={}; const addUsage=(tg)=>{ if(!usageMap[tg]) usageMap[tg]=0; usageMap[tg]++; };
    (window.films||[]).forEach(f=> (f.tags||[]).forEach(addUsage)); (window.articles||[]).forEach(a=> (a.tags||[]).forEach(addUsage)); (window.mangas||[]).forEach(m=> (m.tags||[]).forEach(addUsage));
    if(!tags.length){ container.innerHTML=`<div style='padding:15px;text-align:center;'>Aucun tag</div>`; return; }
    container.innerHTML = tags.sort((a,b)=> (a.name||'').localeCompare(b.name||'')).map(t=>`<div class='tag-row' data-id='${t.id}' style="padding:6px 8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:160px auto 80px 130px;align-items:center;">
      <div style='display:flex;align-items:center;gap:6px;'><span style='display:inline-block;width:16px;height:16px;background:${t.color||'#777'};border:1px solid #555;border-radius:3px;'></span><span>${t.name}</span></div>
      <div style='font-size:12px;color:#333;overflow:hidden;text-overflow:ellipsis;'>${t.description? t.description.replace(/</g,'&lt;') : '<em style="color:#777;">—</em>'}</div>
      <div>${usageMap[t.name]||0}</div>
      <div>
        <button class='edit-tag-btn' data-id='${t.id}' style="padding:3px 6px;margin-right:4px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
        <button class='delete-tag-btn' data-id='${t.id}' style="padding:3px 6px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">Suppr.</button>
      </div>
    </div>`).join('');
    container.querySelectorAll('.edit-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.loadTagForm(parseInt(e.target.dataset.id))));
    container.querySelectorAll('.delete-tag-btn').forEach(btn=> btn.addEventListener('click', e=> this.confirmDeleteTag(parseInt(e.target.dataset.id))));
  },
  loadIconsManager() {
    console.log('🖥️ Chargement gestionnaire icônes');
    const contentDiv = document.getElementById('admin-content'); if(!contentDiv) return; this.state.activeTab='icons';
    const all = window.DesktopManager ? window.DesktopManager.getAllIcons() : {defaultIcons:[],customIcons:[]};
    contentDiv.innerHTML = `
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>Gestion des icônes</h3>
      <div style='margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;'>
        <button id='add-custom-icon' style="background:#0058a8;color:#fff;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">+ Nouvelle icône</button>
        <button id='refresh-icons' style="padding:6px 12px;border:1px solid #ACA899;border-radius:3px;cursor:pointer;">Rafraîchir</button>
        <button id='save-icon-positions' style="background:#4CAF50;color:#fff;border:1px solid #2e7d32;padding:6px 12px;border-radius:3px;cursor:pointer;">Sauver positions</button>
      </div>
      <div style='display:grid;grid-template-columns:1fr 1fr;gap:20px;'>
        <div>
          <h4 style='margin:0 0 8px;'>Icônes par défaut (${all.defaultIcons.length})</h4>
          <div style='border:1px solid #ACA899;border-radius:4px;max-height:260px;overflow:auto;'>
            ${all.defaultIcons.map(i=>`<div class='icon-row' data-id='${i.id}' data-type='default' style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-top:1px solid #ddd;">
              <span style='display:flex;align-items:center;gap:6px;'><img src='${i.icon}' style='width:18px;height:18px;'> ${i.name}</span>
              <span style='font-size:11px;color:#666;'>${i.window||'-'}</span>
            </div>`).join('')}
          </div>
        </div>
        <div>
          <h4 style='margin:0 0 8px;'>Icônes personnalisées (${all.customIcons.length})</h4>
          <div id='custom-icons-box' style='border:1px solid #ACA899;border-radius:4px;max-height:260px;overflow:auto;'>
            ${all.customIcons.length? all.customIcons.map(i=>`<div class='icon-row' data-id='${i.id}' data-type='custom' style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-top:1px solid #ddd;">
              <span style='display:flex;align-items:center;gap:6px;'><img src='${i.icon}' style='width:18px;height:18px;'> ${i.name}</span>
              <span>
                <button class='edit-icon-btn' data-id='${i.id}' style="padding:2px 6px;font-size:11px;border:1px solid #ACA899;background:#ECE9D8;cursor:pointer;">Éditer</button>
                <button class='delete-icon-btn' data-id='${i.id}' style="padding:2px 6px;font-size:11px;border:1px solid #c62828;background:#f44336;color:#fff;cursor:pointer;">✕</button>
              </span>
            </div>`).join('') : `<div style='padding:10px;text-align:center;font-size:12px;color:#666;'>Aucune icône</div>`}
          </div>
        </div>
      </div>
      <p style='margin-top:15px;font-size:12px;color:#555;'>Astuce: déplacez les icônes directement sur le bureau puis cliquez sur "Sauver positions".</p>`;
    // Actions
    document.getElementById('add-custom-icon')?.addEventListener('click',()=> this.loadIconForm());
    document.getElementById('refresh-icons')?.addEventListener('click',()=> this.loadIconsManager());
    document.getElementById('save-icon-positions')?.addEventListener('click',()=> this.saveIconsLayout());
    contentDiv.querySelectorAll('.edit-icon-btn').forEach(btn=> btn.addEventListener('click',e=> this.loadIconForm(e.target.dataset.id,'custom')));
    contentDiv.querySelectorAll('.delete-icon-btn').forEach(btn=> btn.addEventListener('click',e=> this.confirmDeleteIcon(e.target.dataset.id)));
  },
  loadImportExportManager() {
    console.log('📦 Import/Export');
    const contentDiv = document.getElementById('admin-content'); if(!contentDiv) return; this.state.activeTab='import-export';
    const current = {
      films: window.films || [],
      articles: window.articles || [],
      mangas: window.mangas || [],
      tags: window.tags || [],
      welcomePopupConfig: window.DataManager?.data?.welcomePopupConfig || {}
  ,desktopIcons: window.DataManager?.data?.desktopIcons || window.desktopIcons || {}
  ,cvData: window.DataManager?.data?.cvData || window.cvData || {}
    };
    contentDiv.innerHTML = `
      <h3 style='color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;'>Import / Export</h3>
      <p>Copiez / collez les données JSON ou exportez un fichier.</p>
      <textarea id='export-json' style='width:100%;height:180px;border:1px solid #ACA899;padding:8px;'>${JSON.stringify(current,null,2)}</textarea>
      <div style='margin-top:10px;'>
        <button id='btn-download-json' style='background:#0058a8;color:#fff;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;'>Télécharger</button>
        <button id='btn-import-json' style='margin-left:8px;background:#4CAF50;color:#fff;border:1px solid #2e7d32;padding:6px 12px;border-radius:3px;cursor:pointer;'>Importer</button>
        <input type='file' id='file-import' accept='application/json' style='margin-left:12px;'>
      </div>`;
    // Events basiques
    document.getElementById('btn-download-json')?.addEventListener('click',()=>{
      const blob=new Blob([document.getElementById('export-json').value],{type:'application/json'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup.json';a.click();
    });
    document.getElementById('btn-import-json')?.addEventListener('click',()=>{
      try { const parsed=JSON.parse(document.getElementById('export-json').value); Object.assign(window.DataManager.data, parsed); alert('Import appliqué (non sauvegardé)'); } catch(e){ alert('JSON invalide'); }
    });
    document.getElementById('file-import')?.addEventListener('change',(e)=>{
      const file=e.target.files[0]; if(!file) return; const reader=new FileReader(); reader.onload=ev=>{ try{ const parsed=JSON.parse(ev.target.result); Object.assign(window.DataManager.data, parsed); document.getElementById('export-json').value=JSON.stringify(parsed,null,2); alert('Import fichier appliqué (non sauvegardé)'); } catch(err){ alert('Fichier invalide'); } }; reader.readAsText(file); });
  }
};

// Définir une seule fonction globale createAdminPanelWindow
window.createAdminPanelWindow = function(editItemId = null, itemType = 'film') {
  console.log("📝 Appel à la fonction globale createAdminPanelWindow");
  
  // Utiliser directement AdminManager
  if (typeof window.AdminManager !== 'undefined' && typeof window.AdminManager.createPanel === 'function') {
    return window.AdminManager.createPanel(editItemId, itemType);
  } else {
    console.error("❌ AdminManager n'est pas disponible");
    alert("Erreur: Le panneau d'administration n'est pas disponible");
    return null;
  }
};

// Définir les fonctions d'administration globales pour la compatibilité
window.showManageArticlesForm = function() {
  console.log("📝 Redirection de showManageArticlesForm vers AdminManager");
  if (typeof window.AdminManager !== 'undefined') {
    window.AdminManager.loadArticlesManager();
  }
};

window.showManageTagsForm = function() {
  console.log("📝 Redirection de showManageTagsForm vers AdminManager");
  if (typeof window.AdminManager !== 'undefined') {
    window.AdminManager.loadTagsManager();
  }
};

window.showManageIconsForm = function() {
  console.log("📝 Redirection de showManageIconsForm vers AdminManager");
  if (typeof window.AdminManager !== 'undefined') {
    window.AdminManager.loadIconsManager();
  }
};

// Au chargement de la page, initialiser le gestionnaire
window.addEventListener('DOMContentLoaded', function() {
  console.log("🔍 Initialisation du module d'administration unifié");
  if (typeof window.AdminManager !== 'undefined') {
    window.AdminManager.init();
  }
});

console.log("✅ Module d'administration unifié chargé avec succès");

// Initialiser le gestionnaire
window.addEventListener('DOMContentLoaded', function() {
  window.AdminManager.init();
  console.log("✅ Module d'administration unifié chargé avec succès");
});
