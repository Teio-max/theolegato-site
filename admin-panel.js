/**
 * PANNEAU D'ADMINISTRATION CONSOLIDÉ
 * ===================================
 * 
 * Ce fichier remplace tous les anciens fichiers d'administration et
 * fournit une interface unifiée pour gérer tous les contenus du site.
 */

// ========================================
// GESTIONNAIRE PRINCIPAL DU PANNEAU ADMIN
// ========================================

const AdminPanel = {
  // Configuration
  config: {
    windowId: null,
    currentView: 'home',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedPdfTypes: ['application/pdf']
  },

  /**
   * Initialise le panneau d'administration
   */
  init() {
    console.log('🔧 AdminPanel: Initialisation du panneau d\'administration');
    
    // Remplacer l'ancienne fonction createAdminPanelWindow
    window.createAdminPanelWindow = this.create.bind(this);
    
    // Sauvegarder l'ancienne fonction si elle existe
    if (typeof window.originalCreateAdminPanelWindow === 'undefined' && typeof window.createAdminPanelWindow === 'function') {
      window.originalCreateAdminPanelWindow = window.createAdminPanelWindow;
    }
  },

  /**
   * Crée et affiche le panneau d'administration
   * @param {Object} options - Options pour la création du panneau
   */
  create(options = {}) {
    try {
      console.log('🔧 AdminPanel: Création du panneau d\'administration');

      // Créer le contenu HTML du panneau
      const content = this.generatePanelHTML();

      // Créer la fenêtre avec WindowManager
      const window = WindowManager.createWindow({
        title: 'Panneau d\'Administration',
        icon: 'icons/key.png',
        width: options.width || '850px',
        height: options.height || '650px',
        content: content,
        className: 'admin-panel-window'
      });

      // Stocker l'ID de la fenêtre
      this.config.windowId = window.id;

      // Configurer les événements après un court délai
      setTimeout(() => {
        this.setupEventListeners();
        this.showHomeView();
      }, 100);

      return window;

    } catch (error) {
      console.error('❌ AdminPanel: Erreur lors de la création du panneau', error);
      this.showError('Erreur lors de la création du panneau d\'administration');
      return null;
    }
  },

  /**
   * Génère le HTML principal du panneau
   * @returns {string} HTML du panneau
   */
  generatePanelHTML() {
    return `
      <div class="admin-panel">
        <div class="admin-toolbar">
          <div class="admin-toolbar-group">
            <button id="admin-btn-home" class="admin-btn active" data-view="home">
              <span class="admin-btn-icon">🏠</span>
              <span class="admin-btn-text">Accueil</span>
            </button>
          </div>
          
          <div class="admin-toolbar-group">
            <button id="admin-btn-films" class="admin-btn" data-view="films">
              <span class="admin-btn-icon">🎬</span>
              <span class="admin-btn-text">Films</span>
            </button>
            <button id="admin-btn-mangas" class="admin-btn" data-view="mangas">
              <span class="admin-btn-icon">📚</span>
              <span class="admin-btn-text">Mangas</span>
            </button>
          </div>
          
          <div class="admin-toolbar-group">
            <button id="admin-btn-tags" class="admin-btn" data-view="tags">
              <span class="admin-btn-icon">🏷️</span>
              <span class="admin-btn-text">Tags</span>
            </button>
            <button id="admin-btn-icons" class="admin-btn" data-view="icons">
              <span class="admin-btn-icon">🖼️</span>
              <span class="admin-btn-text">Icônes</span>
            </button>
          </div>
          
          <div class="admin-toolbar-group">
            <button id="admin-btn-articles" class="admin-btn" data-view="articles">
              <span class="admin-btn-icon">📄</span>
              <span class="admin-btn-text">Articles</span>
            </button>
            <button id="admin-btn-cv" class="admin-btn" data-view="cv">
              <span class="admin-btn-icon">📋</span>
              <span class="admin-btn-text">CV</span>
            </button>
          </div>
          
          <div class="admin-toolbar-group">
            <button id="admin-btn-config" class="admin-btn" data-view="config">
              <span class="admin-btn-icon">⚙️</span>
              <span class="admin-btn-text">Config</span>
            </button>
          </div>
        </div>
        
        <div class="admin-content" id="admin-content">
          <!-- Le contenu sera injecté dynamiquement ici -->
        </div>
        
        <div class="admin-status" id="admin-status">
          Prêt
        </div>
      </div>
    `;
  }
  ,
  
  /**
   * Configure tous les événements du panneau
   */
  setupEventListeners() {
    console.log('🔧 AdminPanel: Configuration des événements');

    // Gestionnaire pour les boutons de la barre d'outils
    const toolbarButtons = document.querySelectorAll('.admin-btn[data-view]');
    toolbarButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });

    // Gestionnaire global pour les formulaires
    document.addEventListener('submit', (e) => {
      if (e.target.closest('.admin-panel')) {
        this.handleFormSubmit(e);
      }
    });

    // Gestionnaire pour les uploads de fichiers
    document.addEventListener('change', (e) => {
      if (e.target.type === 'file' && e.target.closest('.admin-panel')) {
        this.handleFileUpload(e);
      }
    });
  },

  /**
   * Change la vue active du panneau
   * @param {string} view - Nom de la vue à afficher
   */
  switchView(view) {
    try {
      console.log(`🔧 AdminPanel: Changement vers la vue ${view}`);

      // Mettre à jour les boutons actifs
      document.querySelectorAll('.admin-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      const activeButton = document.querySelector(`[data-view="${view}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }

      // Stocker la vue actuelle
      this.config.currentView = view;

      // Afficher la vue correspondante
      switch (view) {
        case 'home':
          this.showHomeView();
          break;
        case 'films':
          this.showFilmsView();
          break;
        case 'mangas':
          this.showMangasView();
          break;
        case 'tags':
          this.showTagsView();
          break;
        case 'icons':
          this.showIconsView();
          break;
        case 'articles':
          this.showArticlesView();
          break;
        case 'cv':
          this.showCVView();
          break;
        case 'config':
          this.showConfigView();
          break;
        default:
          console.warn(`⚠️ AdminPanel: Vue inconnue ${view}`);
          this.showHomeView();
      }

      this.updateStatus(`Vue ${view} affichée`);

    } catch (error) {
      console.error('❌ AdminPanel: Erreur lors du changement de vue', error);
      this.showError(`Erreur lors du changement vers la vue ${view}`);
    }
  },

  // ========================================
  // VUES DU PANNEAU D'ADMINISTRATION
  // ========================================

  /**
   * Affiche la vue d'accueil
   */
  showHomeView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    content.innerHTML = `
      <div class="admin-view-home">
        <div class="admin-welcome">
          <h2>🎛️ Panneau d'Administration</h2>
          <p>Bienvenue dans le panneau d'administration de votre site. Utilisez les boutons ci-dessus pour gérer différents aspects de votre site.</p>
        </div>
        
        <div class="admin-stats">
          <div class="admin-stat-card">
            <h3>📊 Statistiques</h3>
            <div class="admin-stat-items">
              <div class="admin-stat-item">
                <span class="admin-stat-label">Films:</span>
                <span class="admin-stat-value">${this.getFilmsCount()}</span>
              </div>
              <div class="admin-stat-item">
                <span class="admin-stat-label">Mangas:</span>
                <span class="admin-stat-value">${this.getMangasCount()}</span>
              </div>
              <div class="admin-stat-item">
                <span class="admin-stat-label">Tags:</span>
                <span class="admin-stat-value">${this.getTagsCount()}</span>
              </div>
              <div class="admin-stat-item">
                <span class="admin-stat-label">Articles:</span>
                <span class="admin-stat-value">${this.getArticlesCount()}</span>
              </div>
              <div class="admin-stat-item">
                <span class="admin-stat-label">Icônes:</span>
                <span class="admin-stat-value">${this.getIconsCount()}</span>
              </div>
            </div>
          </div>
          
          <div class="admin-quick-actions">
            <h3>⚡ Actions rapides</h3>
            <div class="admin-quick-buttons">
              <button class="admin-quick-btn" onclick="AdminPanel.switchView('films')">
                🎬 Gérer les films
              </button>
              <button class="admin-quick-btn" onclick="AdminPanel.switchView('mangas')">
                📚 Gérer les mangas
              </button>
              <button class="admin-quick-btn" onclick="AdminPanel.switchView('articles')">
                📄 Gérer les articles
              </button>
              <button class="admin-quick-btn" onclick="AdminPanel.saveData()">
                💾 Sauvegarder tout
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Affiche la vue de gestion des films
   */
  showFilmsView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const films = DataManager.data.films || [];
    
    content.innerHTML = `
      <div class="admin-view-films">
        <div class="admin-view-header">
          <h2>🎬 Gestion des Films</h2>
          <button class="admin-btn-primary" id="btn-add-film">
            ➕ Ajouter un film
          </button>
        </div>
        
        <div class="admin-films-list" id="films-list">
          ${films.length === 0 ? 
            '<p class="admin-empty">Aucun film trouvé. Commencez par en ajouter un !</p>' :
            films.map(film => this.generateFilmCard(film)).join('')
          }
        </div>
        
        <div class="admin-form-container" id="film-form-container" style="display: none;">
          <!-- Le formulaire sera injecté ici -->
        </div>
      </div>
    `;

    // Configurer les événements spécifiques aux films
    this.setupFilmsEvents();
  },

  generateFilmCard(film) {
    return `
      <div class="admin-item-card" data-id="${film.id}">
        <div class="admin-item-image">
          ${film.image ? 
            `<img src="${film.image}" alt="${this.sanitizeHtml(film.titre)}" onerror="this.src='icons/film.png'">` :
            `<div class="admin-item-placeholder">🎬</div>`
          }
        </div>
        <div class="admin-item-content">
          <h3 class="admin-item-title">${this.sanitizeHtml(film.titre)}</h3>
          <div class="admin-item-meta">
            <span class="admin-item-rating">${'⭐'.repeat(film.note || 0)}</span>
            <span class="admin-item-id">ID: ${film.id}</span>
          </div>
          <div class="admin-item-description">
            ${film.critique ? 
              this.sanitizeHtml(film.critique.substring(0, 100)) + (film.critique.length > 100 ? '...' : '') :
              'Pas de critique'
            }
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="AdminPanel.editFilm(${film.id})">
            ✏️ Modifier
          </button>
          <button class="admin-btn-delete" onclick="AdminPanel.deleteFilm(${film.id})">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `;
  }
  ,

  setupFilmsEvents() {
    const addBtn = document.getElementById('btn-add-film');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showFilmForm();
      });
    }
  },

  showFilmForm(film = null) {
    const container = document.getElementById('film-form-container');
    if (!container) return;

    const isEdit = !!film;
    
    container.innerHTML = `
      <div class="admin-form">
        <div class="admin-form-header">
          <h3>${isEdit ? '✏️ Modifier le film' : '➕ Ajouter un film'}</h3>
          <button class="admin-btn-close" id="btn-close-film-form">✕</button>
        </div>
        
        <form id="film-form" class="admin-form-body">
          <input type="hidden" id="film-id" value="${film ? film.id : ''}">
          
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="film-titre" class="admin-label">Titre *</label>
              <input 
                type="text" 
                id="film-titre" 
                name="titre" 
                value="${film ? this.sanitizeHtml(film.titre) : ''}"
                required 
                class="admin-input"
                placeholder="Titre du film"
              >
            </div>
            
            <div class="admin-form-group">
              <label for="film-note" class="admin-label">Note (0-5)</label>
              <input 
                type="number" 
                id="film-note" 
                name="note" 
                min="0" 
                max="5" 
                value="${film ? film.note || 0 : 0}"
                class="admin-input"
              >
            </div>
          </div>
          
          <div class="admin-form-group">
            <label for="film-critique" class="admin-label">Critique</label>
            <textarea 
              id="film-critique" 
              name="critique" 
              rows="4" 
              class="admin-textarea"
              placeholder="Votre critique du film..."
            >${film ? this.sanitizeHtml(film.critique || '') : ''}</textarea>
          </div>
          
          <div class="admin-form-group">
            <label for="film-image" class="admin-label">URL de l'affiche</label>
            <input 
              type="url" 
              id="film-image" 
              name="image" 
              value="${film ? film.image || '' : ''}"
              class="admin-input"
              placeholder="https://exemple.com/affiche.jpg"
            >
          </div>
          
          <div class="admin-form-actions">
            <button type="submit" class="admin-btn-primary">
              ${isEdit ? '💾 Mettre à jour' : '➕ Ajouter le film'}
            </button>
            <button type="button" class="admin-btn-secondary" id="btn-cancel-film">
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    `;
    
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    // Configurer les événements du formulaire
    const closeBtn = document.getElementById('btn-close-film-form');
    const cancelBtn = document.getElementById('btn-cancel-film');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideFilmForm());
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideFilmForm());
    }
  },

  hideFilmForm() {
    const container = document.getElementById('film-form-container');
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  },

  editFilm(filmId) {
    const films = DataManager.data.films || [];
    const film = films.find(f => f.id == filmId);
    
    if (!film) {
      this.showError('Film non trouvé');
      return;
    }

    this.showFilmForm(film);
  },

  deleteFilm(filmId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
      return;
    }

    try {
      const films = DataManager.data.films || [];
      const index = films.findIndex(f => f.id == filmId);
      
      if (index !== -1) {
        films.splice(index, 1);
        this.showSuccess('Film supprimé avec succès');
        this.saveData();
        this.showFilmsView();
      } else {
        this.showError('Film non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du film', error);
      this.showError('Erreur lors de la suppression du film');
    }
  },

  // Stubs pour les autres vues
  showMangasView() { this.showPlaceholderView('📚 Gestion des Mangas', 'Gestion des mangas en cours d\'implémentation...'); },
  showTagsView() { this.showPlaceholderView('🏷️ Gestion des Tags', 'Gestion des tags en cours d\'implémentation...'); },
  showIconsView() { this.showPlaceholderView('🖼️ Gestion des Icônes', 'Gestion des icônes en cours d\'implémentation...'); },
  showArticlesView() { this.showPlaceholderView('📄 Gestion des Articles', 'Gestion des articles en cours d\'implémentation...'); },
  showCVView() { this.showPlaceholderView('📋 Gestion du CV', 'Gestion du CV en cours d\'implémentation...'); },
  showConfigView() { this.showPlaceholderView('⚙️ Configuration', 'Configuration en cours d\'implémentation...'); },

  showPlaceholderView(title, message) {
    const content = document.getElementById('admin-content');
    if (!content) return;
    
    content.innerHTML = `
      <div class="admin-view-placeholder">
        <div class="admin-view-header">
          <h2>${title}</h2>
        </div>
        <p class="admin-empty">${message}</p>
      </div>
    `;
  },

  // ========================================
  // GESTION DES FORMULAIRES
  // ========================================

  handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formId = form.id;
    
    try {
      switch (formId) {
        case 'film-form':
          this.saveFilm(form);
          break;
        default:
          console.warn('Formulaire non reconnu:', formId);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire', error);
      this.showError('Erreur lors de la sauvegarde');
    }
  },

  saveFilm(form) {
    const formData = new FormData(form);
    const isEdit = !!document.getElementById('film-id').value;
    
    const filmData = {
      id: isEdit ? parseInt(document.getElementById('film-id').value) : this.generateId(),
      titre: formData.get('titre'),
      note: parseInt(formData.get('note')) || 0,
      critique: formData.get('critique') || '',
      image: formData.get('image') || '',
      bandeAnnonce: '',
      galerie: [],
      liens: []
    };

    if (!filmData.titre) {
      this.showError('Le titre est requis');
      return;
    }

    if (!DataManager.data.films) {
      DataManager.data.films = [];
    }

    if (isEdit) {
      const index = DataManager.data.films.findIndex(f => f.id === filmData.id);
      if (index !== -1) {
        DataManager.data.films[index] = filmData;
      }
    } else {
      DataManager.data.films.push(filmData);
    }

    this.showSuccess(`Film ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
    this.saveData();
    this.hideFilmForm();
    this.showFilmsView();
  },

  handleFileUpload(event) {
    console.log('Upload de fichier:', event.target.files[0]);
  },

  // ========================================
  // UTILITAIRES
  // ========================================

  sanitizeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  getFilmsCount() {
    return (DataManager.data.films || []).length;
  },

  getMangasCount() {
    return (DataManager.data.mangas || []).length;
  },

  getTagsCount() {
    return (DataManager.data.tags || []).length;
  },

  getArticlesCount() {
    return (DataManager.data.articles || []).length;
  },

  getIconsCount() {
    return (DataManager.data.desktopIcons || []).length;
  },

  // ========================================
  // GESTION D'ÉTAT ET NOTIFICATIONS
  // ========================================

  showError(message) {
    console.error('❌ AdminPanel:', message);
    
    const statusEl = document.getElementById('admin-status');
    if (statusEl) {
      statusEl.textContent = `❌ ${message}`;
      statusEl.className = 'admin-status error';
      
      setTimeout(() => {
        statusEl.className = 'admin-status';
        statusEl.textContent = 'Prêt';
      }, 5000);
    } else {
      alert(message);
    }
  },

  showSuccess(message) {
    console.log('✅ AdminPanel:', message);
    
    const statusEl = document.getElementById('admin-status');
    if (statusEl) {
      statusEl.textContent = `✅ ${message}`;
      statusEl.className = 'admin-status success';
      
      setTimeout(() => {
        statusEl.className = 'admin-status';
        statusEl.textContent = 'Prêt';
      }, 3000);
    }
  },

  updateStatus(message) {
    const statusEl = document.getElementById('admin-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = 'admin-status';
    }
  },

  saveData() {
    try {
      this.updateStatus('Sauvegarde en cours...');
      
      if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
      }
      
      if (typeof DataManager !== 'undefined' && DataManager.saveDataToGitHub) {
        DataManager.saveDataToGitHub();
      }
      
      this.showSuccess('Données sauvegardées avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde', error);
      this.showError('Erreur lors de la sauvegarde des données');
    }
  }
};

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  AdminPanel.init();
  console.log('✅ AdminPanel: Module d\'administration consolidé initialisé');
});

// Compatibilité avec les anciens appels
window.AdminPanel = AdminPanel;

console.log('🚀 AdminPanel: Module d\'administration consolidé chargé');
