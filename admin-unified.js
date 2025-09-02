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
  },
  
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
    const filmCount = typeof window.films !== 'undefined' ? window.films.length : 0;
    
    // Générer le HTML du tableau de bord
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Tableau de bord
      </h3>
      
      <div class="dashboard-stats" style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
        <div class="stat-card" style="flex:1;min-width:150px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Films</h4>
          <p style="font-size:24px;font-weight:bold;margin:5px 0;">${filmCount}</p>
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
          <label for="film-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
          <input type="text" id="film-image" name="image" value="${filmToEdit ? filmToEdit.image : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
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
    
    // Ajouter les gestionnaires d'événements
    this.initFilmFormEvents(filmId);
  },
  
  // Initialisation des événements du formulaire film
  initFilmFormEvents(filmId) {
    // Bouton annuler
    document.getElementById('film-cancel-btn')?.addEventListener('click', () => {
      this.loadDashboard();
    });
    
    // Formulaire
    document.getElementById('film-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFilm(filmId);
    });
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
      galerie: [],
      liens: []
    };
    
    // Conserver les données existantes pour les tableaux
    if (filmId && typeof window.films !== 'undefined') {
      const existingFilm = window.films.find(f => f.id === filmId);
      if (existingFilm) {
        filmData.galerie = existingFilm.galerie || [];
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
    if (typeof window.saveDataToGitHub === 'function') {
      try {
        window.saveDataToGitHub()
          .then(() => {
            alert('Données sauvegardées avec succès');
          })
          .catch(error => {
            console.error('Erreur sauvegarde:', error);
            alert(`Erreur de sauvegarde: ${error.message}`);
          });
      } catch (error) {
        console.error('Erreur lors de l\'appel à saveDataToGitHub:', error);
        alert(`Erreur: ${error.message}`);
      }
    } else if (typeof window.saveData === 'function') {
      try {
        window.saveData();
        alert('Données sauvegardées localement');
      } catch (error) {
        console.error('Erreur lors de l\'appel à saveData:', error);
        alert(`Erreur: ${error.message}`);
      }
    } else {
      console.error('Aucune fonction de sauvegarde disponible');
      alert('Erreur: Aucune fonction de sauvegarde disponible');
    }
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
