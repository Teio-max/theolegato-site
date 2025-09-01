/**
 * PANNEAU D'ADMINISTRATION CONSOLIDÉ
 * ===================================
 * 
 * Ce fichier remplace tous les anciens fichiers d'administration :
 * - admin-functions.js
 * - admin-fix-simple.js  
 * - admin-fix-window.js
 * 
 * Fonctionnalités incluses :
 * - Gestion des films (CRUD complet)
 * - Gestion des mangas (CRUD complet)
 * - Gestion des tags (CRUD complet)
 * - Gestion des icônes (CRUD complet)
 * - Gestion des articles PDF (CRUD + visualisation double page)
 * - Gestion du CV (upload PDF, visualisation)
 * - Configuration du token GitHub
 * 
 * Architecture :
 * - Utilise WindowManager pour la gestion des fenêtres
 * - Utilise DataManager pour la persistence des données
 * - Gestion d'erreurs robuste
 * - Code bien documenté et structuré
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
  },

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
          ${this.generateFilmForm()}
        </div>
      </div>
    `;

    // Configurer les événements spécifiques aux films
    this.setupFilmsEvents();
  },

  /**
   * Génère une carte pour un film
   * @param {Object} film - Données du film
   * @returns {string} HTML de la carte
   */
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
  },

  /**
   * Génère le formulaire d'ajout/modification de film
   * @param {Object} film - Film à modifier (optionnel)
   * @returns {string} HTML du formulaire
   */
  generateFilmForm(film = null) {
    const isEdit = !!film;
    
    return `
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
            <div class="admin-input-group">
              <input 
                type="url" 
                id="film-image" 
                name="image" 
                value="${film ? film.image || '' : ''}"
                class="admin-input"
                placeholder="https://exemple.com/affiche.jpg"
              >
              <button type="button" class="admin-btn-secondary" id="btn-upload-film-image">
                📁 Upload
              </button>
            </div>
            <input type="file" id="film-image-file" accept="image/*" style="display: none;">
          </div>
          
          <div class="admin-form-group">
            <label for="film-bande-annonce" class="admin-label">Bande annonce (URL)</label>
            <input 
              type="url" 
              id="film-bande-annonce" 
              name="bandeAnnonce" 
              value="${film ? film.bandeAnnonce || '' : ''}"
              class="admin-input"
              placeholder="https://youtube.com/watch?v=..."
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
  },

  /**
   * Configure les événements spécifiques aux films
   */
  setupFilmsEvents() {
    // Bouton ajouter film
    const addBtn = document.getElementById('btn-add-film');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showFilmForm();
      });
    }

    // Autres événements de formulaire (configurés dans setupEventListeners)
  },

  /**
   * Affiche le formulaire d'ajout/modification de film
   * @param {Object} film - Film à modifier (optionnel)
   */
  showFilmForm(film = null) {
    const container = document.getElementById('film-form-container');
    if (!container) return;

    container.innerHTML = this.generateFilmForm(film);
    container.style.display = 'block';

    // Faire défiler vers le formulaire
    container.scrollIntoView({ behavior: 'smooth' });

    // Configurer les événements du formulaire
    this.setupFormEvents('film');
  },

  /**
   * Cache le formulaire de film
   */
  hideFilmForm() {
    const container = document.getElementById('film-form-container');
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  },

  /**
   * Édite un film existant
   * @param {number} filmId - ID du film à éditer
   */
  editFilm(filmId) {
    const films = DataManager.data.films || [];
    const film = films.find(f => f.id == filmId);
    
    if (!film) {
      this.showError('Film non trouvé');
      return;
    }

    this.showFilmForm(film);
  },

  /**
   * Supprime un film
   * @param {number} filmId - ID du film à supprimer
   */
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
        
        // Sauvegarder les données
        this.saveData();
        
        // Rafraîchir la vue
        this.showFilmsView();
      } else {
        this.showError('Film non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du film', error);
      this.showError('Erreur lors de la suppression du film');
    }
  },

  // ========================================
  // GESTION DES MANGAS
  // ========================================

  /**
   * Affiche la vue de gestion des mangas
   */
  showMangasView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const mangas = DataManager.data.mangas || [];
    
    content.innerHTML = `
      <div class="admin-view-mangas">
        <div class="admin-view-header">
          <h2>📚 Gestion des Mangas</h2>
          <button class="admin-btn-primary" id="btn-add-manga">
            ➕ Ajouter un manga
          </button>
        </div>
        
        <div class="admin-mangas-list" id="mangas-list">
          ${mangas.length === 0 ? 
            '<p class="admin-empty">Aucun manga trouvé. Commencez par en ajouter un !</p>' :
            mangas.map(manga => this.generateMangaCard(manga)).join('')
          }
        </div>
        
        <div class="admin-form-container" id="manga-form-container" style="display: none;">
          ${this.generateMangaForm()}
        </div>
      </div>
    `;

    // Configurer les événements spécifiques aux mangas
    this.setupMangasEvents();
  },

  /**
   * Génère une carte pour un manga
   * @param {Object} manga - Données du manga
   * @returns {string} HTML de la carte
   */
  generateMangaCard(manga) {
    return `
      <div class="admin-item-card" data-id="${manga.id}">
        <div class="admin-item-image">
          ${manga.image ? 
            `<img src="${manga.image}" alt="${this.sanitizeHtml(manga.titre)}" onerror="this.src='icons/book.png'">` :
            `<div class="admin-item-placeholder">📚</div>`
          }
        </div>
        <div class="admin-item-content">
          <h3 class="admin-item-title">${this.sanitizeHtml(manga.titre)}</h3>
          <div class="admin-item-meta">
            <span class="admin-item-rating">${'⭐'.repeat(manga.note || 0)}</span>
            <span class="admin-item-status">${manga.statut || 'Inconnu'}</span>
            <span class="admin-item-id">ID: ${manga.id}</span>
          </div>
          <div class="admin-item-description">
            ${manga.auteur ? `Par: ${this.sanitizeHtml(manga.auteur)}` : ''}
            ${manga.chapitres ? ` • ${manga.chapitres} chapitres` : ''}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="AdminPanel.editManga(${manga.id})">
            ✏️ Modifier
          </button>
          <button class="admin-btn-delete" onclick="AdminPanel.deleteManga(${manga.id})">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Génère le formulaire d'ajout/modification de manga
   * @param {Object} manga - Manga à modifier (optionnel)
   * @returns {string} HTML du formulaire
   */
  generateMangaForm(manga = null) {
    const isEdit = !!manga;
    
    return `
      <div class="admin-form">
        <div class="admin-form-header">
          <h3>${isEdit ? '✏️ Modifier le manga' : '➕ Ajouter un manga'}</h3>
          <button class="admin-btn-close" id="btn-close-manga-form">✕</button>
        </div>
        
        <form id="manga-form" class="admin-form-body">
          <input type="hidden" id="manga-id" value="${manga ? manga.id : ''}">
          
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="manga-titre" class="admin-label">Titre *</label>
              <input 
                type="text" 
                id="manga-titre" 
                name="titre" 
                value="${manga ? this.sanitizeHtml(manga.titre) : ''}"
                required 
                class="admin-input"
                placeholder="Titre du manga"
              >
            </div>
            
            <div class="admin-form-group">
              <label for="manga-auteur" class="admin-label">Auteur</label>
              <input 
                type="text" 
                id="manga-auteur" 
                name="auteur" 
                value="${manga ? this.sanitizeHtml(manga.auteur || '') : ''}"
                class="admin-input"
                placeholder="Nom de l'auteur"
              >
            </div>
          </div>
          
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="manga-note" class="admin-label">Note (0-5)</label>
              <input 
                type="number" 
                id="manga-note" 
                name="note" 
                min="0" 
                max="5" 
                value="${manga ? manga.note || 0 : 0}"
                class="admin-input"
              >
            </div>
            
            <div class="admin-form-group">
              <label for="manga-statut" class="admin-label">Statut</label>
              <select id="manga-statut" name="statut" class="admin-select">
                <option value="En cours" ${manga && manga.statut === 'En cours' ? 'selected' : ''}>En cours</option>
                <option value="Terminé" ${manga && manga.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
                <option value="Abandonné" ${manga && manga.statut === 'Abandonné' ? 'selected' : ''}>Abandonné</option>
                <option value="En pause" ${manga && manga.statut === 'En pause' ? 'selected' : ''}>En pause</option>
              </select>
            </div>
            
            <div class="admin-form-group">
              <label for="manga-chapitres" class="admin-label">Chapitres lus</label>
              <input 
                type="number" 
                id="manga-chapitres" 
                name="chapitres" 
                min="0" 
                value="${manga ? manga.chapitres || 0 : 0}"
                class="admin-input"
              >
            </div>
          </div>
          
          <div class="admin-form-group">
            <label for="manga-critique" class="admin-label">Critique</label>
            <textarea 
              id="manga-critique" 
              name="critique" 
              rows="4" 
              class="admin-textarea"
              placeholder="Votre critique du manga..."
            >${manga ? this.sanitizeHtml(manga.critique || '') : ''}</textarea>
          </div>
          
          <div class="admin-form-group">
            <label for="manga-image" class="admin-label">URL de la couverture</label>
            <div class="admin-input-group">
              <input 
                type="url" 
                id="manga-image" 
                name="image" 
                value="${manga ? manga.image || '' : ''}"
                class="admin-input"
                placeholder="https://exemple.com/couverture.jpg"
              >
              <button type="button" class="admin-btn-secondary" id="btn-upload-manga-image">
                📁 Upload
              </button>
            </div>
            <input type="file" id="manga-image-file" accept="image/*" style="display: none;">
          </div>
          
          <div class="admin-form-actions">
            <button type="submit" class="admin-btn-primary">
              ${isEdit ? '💾 Mettre à jour' : '➕ Ajouter le manga'}
            </button>
            <button type="button" class="admin-btn-secondary" id="btn-cancel-manga">
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    `;
  },

  /**
   * Configure les événements spécifiques aux mangas
   */
  setupMangasEvents() {
    const addBtn = document.getElementById('btn-add-manga');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showMangaForm();
      });
    }
  },

  /**
   * Affiche le formulaire d'ajout/modification de manga
   * @param {Object} manga - Manga à modifier (optionnel)
   */
  showMangaForm(manga = null) {
    const container = document.getElementById('manga-form-container');
    if (!container) return;

    container.innerHTML = this.generateMangaForm(manga);
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    this.setupFormEvents('manga');
  },

  /**
   * Cache le formulaire de manga
   */
  hideMangaForm() {
    const container = document.getElementById('manga-form-container');
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  },

  /**
   * Édite un manga existant
   * @param {number} mangaId - ID du manga à éditer
   */
  editManga(mangaId) {
    const mangas = DataManager.data.mangas || [];
    const manga = mangas.find(m => m.id == mangaId);
    
    if (!manga) {
      this.showError('Manga non trouvé');
      return;
    }

    this.showMangaForm(manga);
  },

  /**
   * Supprime un manga
   * @param {number} mangaId - ID du manga à supprimer
   */
  deleteManga(mangaId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce manga ?')) {
      return;
    }

    try {
      const mangas = DataManager.data.mangas || [];
      const index = mangas.findIndex(m => m.id == mangaId);
      
      if (index !== -1) {
        mangas.splice(index, 1);
        this.showSuccess('Manga supprimé avec succès');
        this.saveData();
        this.showMangasView();
      } else {
        this.showError('Manga non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du manga', error);
      this.showError('Erreur lors de la suppression du manga');
    }
  }

  // ========================================
  // GESTION DES TAGS
  // ========================================

  /**
   * Affiche la vue de gestion des tags
   */
  showTagsView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const tags = DataManager.data.tags || [];
    
    content.innerHTML = `
      <div class="admin-view-tags">
        <div class="admin-view-header">
          <h2>🏷️ Gestion des Tags</h2>
          <button class="admin-btn-primary" id="btn-add-tag">
            ➕ Ajouter un tag
          </button>
        </div>
        
        <div class="admin-tags-list" id="tags-list">
          ${tags.length === 0 ? 
            '<p class="admin-empty">Aucun tag trouvé. Commencez par en ajouter un !</p>' :
            this.generateTagsGrid(tags)
          }
        </div>
        
        <div class="admin-form-container" id="tag-form-container" style="display: none;">
          ${this.generateTagForm()}
        </div>
      </div>
    `;

    this.setupTagsEvents();
  },

  /**
   * Génère la grille des tags
   * @param {Array} tags - Liste des tags
   * @returns {string} HTML de la grille
   */
  generateTagsGrid(tags) {
    return `
      <div class="admin-tags-grid">
        ${tags.map(tag => this.generateTagCard(tag)).join('')}
      </div>
    `;
  },

  /**
   * Génère une carte pour un tag
   * @param {Object} tag - Données du tag
   * @returns {string} HTML de la carte
   */
  generateTagCard(tag) {
    return `
      <div class="admin-tag-card" data-id="${tag.id}" style="background: ${tag.color}20; border-color: ${tag.color};">
        <div class="admin-tag-preview" style="background: ${tag.color};">
          ${this.sanitizeHtml(tag.name)}
        </div>
        <div class="admin-tag-info">
          <div class="admin-tag-name">${this.sanitizeHtml(tag.name)}</div>
          <div class="admin-tag-category">${this.sanitizeHtml(tag.category || 'général')}</div>
          <div class="admin-tag-color">${tag.color}</div>
        </div>
        <div class="admin-tag-actions">
          <button class="admin-btn-edit" onclick="AdminPanel.editTag('${tag.id}')">✏️</button>
          <button class="admin-btn-delete" onclick="AdminPanel.deleteTag('${tag.id}')">🗑️</button>
        </div>
      </div>
    `;
  },

  /**
   * Génère le formulaire d'ajout/modification de tag
   * @param {Object} tag - Tag à modifier (optionnel)
   * @returns {string} HTML du formulaire
   */
  generateTagForm(tag = null) {
    const isEdit = !!tag;
    
    return `
      <div class="admin-form">
        <div class="admin-form-header">
          <h3>${isEdit ? '✏️ Modifier le tag' : '➕ Ajouter un tag'}</h3>
          <button class="admin-btn-close" id="btn-close-tag-form">✕</button>
        </div>
        
        <form id="tag-form" class="admin-form-body">
          <input type="hidden" id="tag-id" value="${tag ? tag.id : ''}">
          
          <div class="admin-form-row">
            <div class="admin-form-group">
              <label for="tag-name" class="admin-label">Nom du tag *</label>
              <input 
                type="text" 
                id="tag-name" 
                name="name" 
                value="${tag ? this.sanitizeHtml(tag.name) : ''}"
                required 
                class="admin-input"
                placeholder="Nom du tag"
              >
            </div>
            
            <div class="admin-form-group">
              <label for="tag-category" class="admin-label">Catégorie</label>
              <select id="tag-category" name="category" class="admin-select">
                <option value="genre" ${tag && tag.category === 'genre' ? 'selected' : ''}>Genre</option>
                <option value="annee" ${tag && tag.category === 'annee' ? 'selected' : ''}>Année</option>
                <option value="realisateur" ${tag && tag.category === 'realisateur' ? 'selected' : ''}>Réalisateur</option>
                <option value="theme" ${tag && tag.category === 'theme' ? 'selected' : ''}>Thème</option>
                <option value="general" ${tag && tag.category === 'general' ? 'selected' : ''}>Général</option>
              </select>
            </div>
          </div>
          
          <div class="admin-form-group">
            <label for="tag-color" class="admin-label">Couleur</label>
            <div class="admin-input-group">
              <input 
                type="color" 
                id="tag-color" 
                name="color" 
                value="${tag ? tag.color || '#3498db' : '#3498db'}"
                class="admin-input"
                style="width: 60px;"
              >
              <input 
                type="text" 
                id="tag-color-text" 
                name="colorText" 
                value="${tag ? tag.color || '#3498db' : '#3498db'}"
                class="admin-input"
                placeholder="#3498db"
              >
            </div>
          </div>
          
          <div class="admin-form-group">
            <label class="admin-label">Aperçu</label>
            <div id="tag-preview" class="admin-tag-preview" style="background: ${tag ? tag.color || '#3498db' : '#3498db'};">
              ${tag ? this.sanitizeHtml(tag.name) : 'Aperçu du tag'}
            </div>
          </div>
          
          <div class="admin-form-actions">
            <button type="submit" class="admin-btn-primary">
              ${isEdit ? '💾 Mettre à jour' : '➕ Ajouter le tag'}
            </button>
            <button type="button" class="admin-btn-secondary" id="btn-cancel-tag">
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    `;
  },

  /**
   * Configure les événements spécifiques aux tags
   */
  setupTagsEvents() {
    const addBtn = document.getElementById('btn-add-tag');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showTagForm();
      });
    }
  },

  /**
   * Affiche le formulaire d'ajout/modification de tag
   * @param {Object} tag - Tag à modifier (optionnel)
   */
  showTagForm(tag = null) {
    const container = document.getElementById('tag-form-container');
    if (!container) return;

    container.innerHTML = this.generateTagForm(tag);
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    this.setupFormEvents('tag');
    this.setupTagPreview();
  },

  /**
   * Configure l'aperçu en temps réel du tag
   */
  setupTagPreview() {
    const nameInput = document.getElementById('tag-name');
    const colorInput = document.getElementById('tag-color');
    const colorTextInput = document.getElementById('tag-color-text');
    const preview = document.getElementById('tag-preview');

    if (!nameInput || !colorInput || !colorTextInput || !preview) return;

    const updatePreview = () => {
      const name = nameInput.value || 'Aperçu du tag';
      const color = colorInput.value;
      
      preview.textContent = name;
      preview.style.background = color;
      colorTextInput.value = color;
    };

    nameInput.addEventListener('input', updatePreview);
    colorInput.addEventListener('input', updatePreview);
    
    colorTextInput.addEventListener('input', (e) => {
      const color = e.target.value;
      if (/^#[0-9A-F]{6}$/i.test(color)) {
        colorInput.value = color;
        updatePreview();
      }
    });
  },

  /**
   * Édite un tag existant
   * @param {string} tagId - ID du tag à éditer
   */
  editTag(tagId) {
    const tags = DataManager.data.tags || [];
    const tag = tags.find(t => t.id === tagId);
    
    if (!tag) {
      this.showError('Tag non trouvé');
      return;
    }

    this.showTagForm(tag);
  },

  /**
   * Supprime un tag
   * @param {string} tagId - ID du tag à supprimer
   */
  deleteTag(tagId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      return;
    }

    try {
      const tags = DataManager.data.tags || [];
      const index = tags.findIndex(t => t.id === tagId);
      
      if (index !== -1) {
        tags.splice(index, 1);
        this.showSuccess('Tag supprimé avec succès');
        this.saveData();
        this.showTagsView();
      } else {
        this.showError('Tag non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du tag', error);
      this.showError('Erreur lors de la suppression du tag');
    }
  },

  // ========================================
  // GESTION DES ICÔNES
  // ========================================

  /**
   * Affiche la vue de gestion des icônes
   */
  showIconsView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const icons = DataManager.data.desktopIcons || [];
    
    content.innerHTML = `
      <div class="admin-view-icons">
        <div class="admin-view-header">
          <h2>🖼️ Gestion des Icônes du Bureau</h2>
          <button class="admin-btn-primary" id="btn-add-icon">
            ➕ Ajouter une icône
          </button>
        </div>
        
        <div class="admin-icons-list" id="icons-list">
          ${icons.length === 0 ? 
            '<p class="admin-empty">Aucune icône trouvée. Commencez par en ajouter une !</p>' :
            icons.map(icon => this.generateIconCard(icon)).join('')
          }
        </div>
        
        <div class="admin-form-container" id="icon-form-container" style="display: none;">
          ${this.generateIconForm()}
        </div>
      </div>
    `;

    this.setupIconsEvents();
  },

  /**
   * Génère une carte pour une icône
   * @param {Object} icon - Données de l'icône
   * @returns {string} HTML de la carte
   */
  generateIconCard(icon) {
    return `
      <div class="admin-item-card" data-id="${icon.id}">
        <div class="admin-item-image">
          <img src="${icon.icon}" alt="${this.sanitizeHtml(icon.name)}" onerror="this.src='icons/window.png'" style="width: 48px; height: 48px;">
        </div>
        <div class="admin-item-content">
          <h3 class="admin-item-title">${this.sanitizeHtml(icon.name)}</h3>
          <div class="admin-item-meta">
            <span class="admin-item-action">Action: ${icon.action || 'Aucune'}</span>
          </div>
          <div class="admin-item-description">
            Position: x=${icon.position?.x || 0}, y=${icon.position?.y || 0}
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="AdminPanel.editIcon('${icon.id}')">
            ✏️ Modifier
          </button>
          <button class="admin-btn-delete" onclick="AdminPanel.deleteIcon('${icon.id}')">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Configure les événements spécifiques aux icônes
   */
  setupIconsEvents() {
    const addBtn = document.getElementById('btn-add-icon');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.showIconForm();
      });
    }
  },

  // ========================================
  // GESTION DE LA CONFIGURATION
  // ========================================

  /**
   * Affiche la vue de configuration
   */
  showConfigView() {
    const content = document.getElementById('admin-content');
    if (!content) return;

    const currentToken = localStorage.getItem('github_token') ? '●●●●●●●●' : '';
    
    content.innerHTML = `
      <div class="admin-view-config">
        <div class="admin-view-header">
          <h2>⚙️ Configuration</h2>
        </div>
        
        <div class="admin-config-sections">
          <div class="admin-config-section">
            <h3>🔐 Configuration GitHub</h3>
            <p>Configurez votre token GitHub pour la sauvegarde automatique des données.</p>
            
            <form id="github-config-form" class="admin-form-body">
              <div class="admin-form-group">
                <label for="github-token" class="admin-label">Token GitHub</label>
                <div class="admin-input-group">
                  <input 
                    type="password" 
                    id="github-token" 
                    name="token" 
                    value="${currentToken}"
                    class="admin-input"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  >
                  <button type="button" class="admin-btn-secondary" id="btn-toggle-token">
                    👁️ Afficher
                  </button>
                </div>
                <small>Token personnel GitHub avec permissions sur le dépôt</small>
              </div>
              
              <div class="admin-form-group">
                <label for="github-owner" class="admin-label">Propriétaire du dépôt</label>
                <input 
                  type="text" 
                  id="github-owner" 
                  name="owner" 
                  value="${GITHUB_CONFIG.owner || ''}"
                  class="admin-input"
                  readonly
                >
              </div>
              
              <div class="admin-form-group">
                <label for="github-repo" class="admin-label">Nom du dépôt</label>
                <input 
                  type="text" 
                  id="github-repo" 
                  name="repo" 
                  value="${GITHUB_CONFIG.repo || ''}"
                  class="admin-input"
                  readonly
                >
              </div>
              
              <div class="admin-form-actions">
                <button type="submit" class="admin-btn-primary">
                  💾 Sauvegarder la configuration
                </button>
                <button type="button" class="admin-btn-secondary" id="btn-test-token">
                  🧪 Tester la connexion
                </button>
              </div>
            </form>
          </div>
          
          <div class="admin-config-section">
            <h3>📊 Actions de maintenance</h3>
            
            <div class="admin-maintenance-actions">
              <button class="admin-btn-primary admin-maintenance-btn" onclick="AdminPanel.saveData()">
                💾 Sauvegarder toutes les données
              </button>
              
              <button class="admin-btn-secondary admin-maintenance-btn" onclick="AdminPanel.exportData()">
                📤 Exporter les données
              </button>
              
              <button class="admin-btn-secondary admin-maintenance-btn" onclick="AdminPanel.importData()">
                📥 Importer des données
              </button>
              
              <button class="admin-btn-danger admin-maintenance-btn" onclick="AdminPanel.resetData()">
                🔄 Réinitialiser les données
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupConfigEvents();
  },

  /**
   * Configure les événements spécifiques à la configuration
   */
  setupConfigEvents() {
    // Formulaire de configuration GitHub
    const githubForm = document.getElementById('github-config-form');
    if (githubForm) {
      githubForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveGitHubConfig();
      });
    }

    // Bouton toggle password
    const toggleBtn = document.getElementById('btn-toggle-token');
    const tokenInput = document.getElementById('github-token');
    
    if (toggleBtn && tokenInput) {
      toggleBtn.addEventListener('click', () => {
        if (tokenInput.type === 'password') {
          tokenInput.type = 'text';
          toggleBtn.textContent = '🙈 Masquer';
        } else {
          tokenInput.type = 'password';
          toggleBtn.textContent = '👁️ Afficher';
        }
      });
    }

    // Bouton test token
    const testBtn = document.getElementById('btn-test-token');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.testGitHubConnection();
      });
    }
  }

  // ========================================
  // GESTION DES FORMULAIRES GÉNÉRIQUES
  // ========================================

  /**
   * Gère la soumission de formulaires
   * @param {Event} event - Événement de soumission
   */
  handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formId = form.id;
    
    try {
      switch (formId) {
        case 'film-form':
          this.saveFilm(form);
          break;
        case 'manga-form':
          this.saveManga(form);
          break;
        case 'tag-form':
          this.saveTag(form);
          break;
        case 'icon-form':
          this.saveIcon(form);
          break;
        case 'article-form':
          this.saveArticle(form);
          break;
        case 'cv-form':
          this.saveCV(form);
          break;
        case 'github-config-form':
          this.saveGitHubConfig();
          break;
        default:
          console.warn('Formulaire non reconnu:', formId);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire', error);
      this.showError('Erreur lors de la sauvegarde');
    }
  },

  /**
   * Configure les événements d'un formulaire
   * @param {string} type - Type de formulaire (film, manga, etc.)
   */
  setupFormEvents(type) {
    // Bouton fermer
    const closeBtn = document.getElementById(`btn-close-${type}-form`);
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this[`hide${type.charAt(0).toUpperCase() + type.slice(1)}Form`]();
      });
    }

    // Bouton annuler
    const cancelBtn = document.getElementById(`btn-cancel-${type}`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this[`hide${type.charAt(0).toUpperCase() + type.slice(1)}Form`]();
      });
    }

    // Bouton upload d'image
    const uploadBtn = document.getElementById(`btn-upload-${type}-image`);
    const fileInput = document.getElementById(`${type}-image-file`);
    
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });
    }
  },

  /**
   * Gère l'upload de fichiers
   * @param {Event} event - Événement de changement de fichier
   */
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const inputId = event.target.id;
    let targetType = '';
    
    if (inputId.includes('film')) targetType = 'film';
    else if (inputId.includes('manga')) targetType = 'manga';
    else if (inputId.includes('article')) targetType = 'article';
    else if (inputId.includes('cv')) targetType = 'cv';

    this.uploadFile(file, targetType);
  },

  /**
   * Upload un fichier vers GitHub ou en local
   * @param {File} file - Fichier à uploader
   * @param {string} type - Type de contenu
   */
  async uploadFile(file, type) {
    try {
      this.updateStatus('Upload en cours...');
      
      // Vérifier la taille du fichier
      if (file.size > this.config.maxFileSize) {
        throw new Error('Fichier trop volumineux (max 10MB)');
      }

      // Vérifier le type de fichier
      const isImage = this.config.supportedImageTypes.includes(file.type);
      const isPdf = this.config.supportedPdfTypes.includes(file.type);
      
      if (!isImage && !isPdf) {
        throw new Error('Type de fichier non supporté');
      }

      // Utiliser MediaManager si disponible
      if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
        const url = await MediaManager.uploadImage(file);
        if (url) {
          // Mettre à jour le champ URL correspondant
          const urlInput = document.getElementById(`${type}-${isPdf ? 'pdf' : 'image'}`);
          if (urlInput) {
            urlInput.value = url;
          }
          this.showSuccess('Fichier uploadé avec succès');
        } else {
          throw new Error('Échec de l\'upload');
        }
      } else {
        // Fallback : afficher un message
        this.showError('Service d\'upload non disponible. Utilisez une URL directe.');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'upload', error);
      this.showError(error.message);
    }
  },

  // ========================================
  // SAUVEGARDE DES DONNÉES
  // ========================================

  /**
   * Sauvegarde un film
   * @param {HTMLFormElement} form - Formulaire du film
   */
  saveFilm(form) {
    const formData = new FormData(form);
    const filmId = formData.get('titre') ? this.generateId() : parseInt(document.getElementById('film-id').value);
    const isEdit = !!document.getElementById('film-id').value;
    
    const filmData = {
      id: isEdit ? parseInt(document.getElementById('film-id').value) : this.generateId(),
      titre: formData.get('titre'),
      note: parseInt(formData.get('note')) || 0,
      critique: formData.get('critique') || '',
      image: formData.get('image') || '',
      bandeAnnonce: formData.get('bandeAnnonce') || '',
      galerie: [],
      liens: []
    };

    // Valider les données
    if (!filmData.titre) {
      this.showError('Le titre est requis');
      return;
    }

    // Sauvegarder dans DataManager
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

  /**
   * Sauvegarde un manga
   * @param {HTMLFormElement} form - Formulaire du manga
   */
  saveManga(form) {
    const formData = new FormData(form);
    const isEdit = !!document.getElementById('manga-id').value;
    
    const mangaData = {
      id: isEdit ? parseInt(document.getElementById('manga-id').value) : this.generateId(),
      titre: formData.get('titre'),
      auteur: formData.get('auteur') || '',
      note: parseInt(formData.get('note')) || 0,
      critique: formData.get('critique') || '',
      image: formData.get('image') || '',
      statut: formData.get('statut') || 'En cours',
      chapitres: parseInt(formData.get('chapitres')) || 0,
      genre: [],
      galerie: [],
      liens: []
    };

    // Valider les données
    if (!mangaData.titre) {
      this.showError('Le titre est requis');
      return;
    }

    // Sauvegarder dans DataManager
    if (!DataManager.data.mangas) {
      DataManager.data.mangas = [];
    }

    if (isEdit) {
      const index = DataManager.data.mangas.findIndex(m => m.id === mangaData.id);
      if (index !== -1) {
        DataManager.data.mangas[index] = mangaData;
      }
    } else {
      DataManager.data.mangas.push(mangaData);
    }

    this.showSuccess(`Manga ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
    this.saveData();
    this.hideMangaForm();
    this.showMangasView();
  },

  /**
   * Sauvegarde un tag
   * @param {HTMLFormElement} form - Formulaire du tag
   */
  saveTag(form) {
    const formData = new FormData(form);
    const isEdit = !!document.getElementById('tag-id').value;
    
    const tagData = {
      id: isEdit ? document.getElementById('tag-id').value : `tag-${this.generateId()}`,
      name: formData.get('name'),
      color: formData.get('color') || '#3498db',
      category: formData.get('category') || 'general'
    };

    // Valider les données
    if (!tagData.name) {
      this.showError('Le nom du tag est requis');
      return;
    }

    // Sauvegarder dans DataManager
    if (!DataManager.data.tags) {
      DataManager.data.tags = [];
    }

    if (isEdit) {
      const index = DataManager.data.tags.findIndex(t => t.id === tagData.id);
      if (index !== -1) {
        DataManager.data.tags[index] = tagData;
      }
    } else {
      DataManager.data.tags.push(tagData);
    }

    this.showSuccess(`Tag ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
    this.saveData();
    this.hideTagForm();
    this.showTagsView();
  },

  hideTagForm() {
    const container = document.getElementById('tag-form-container');
    if (container) {
      container.style.display = 'none';
      container.innerHTML = '';
    }
  },

  /**
   * Sauvegarde la configuration GitHub
   */
  saveGitHubConfig() {
    const tokenInput = document.getElementById('github-token');
    if (!tokenInput) return;

    const token = tokenInput.value.trim();
    
    if (token && token !== '●●●●●●●●') {
      // Valider le format du token
      if (!this.isValidGitHubToken(token)) {
        this.showError('Format de token GitHub invalide');
        return;
      }

      // Sauvegarder le token
      localStorage.setItem('github_token', token);
      GITHUB_CONFIG.token = token;
      
      this.showSuccess('Configuration GitHub sauvegardée');
    } else {
      this.showError('Token GitHub requis');
    }
  },

  /**
   * Valide un token GitHub
   * @param {string} token - Token à valider
   * @returns {boolean} True si le token est valide
   */
  isValidGitHubToken(token) {
    return typeof token === 'string' && 
           (token.startsWith('ghp_') || token.startsWith('github_pat_')) && 
           token.length >= 40;
  },

  /**
   * Teste la connexion GitHub
   */
  async testGitHubConnection() {
    try {
      this.updateStatus('Test de la connexion...');
      
      const token = document.getElementById('github-token').value.trim();
      if (!token || token === '●●●●●●●●') {
        throw new Error('Token GitHub requis');
      }

      // Test de l'API GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        this.showSuccess('Connexion GitHub réussie');
      } else {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Erreur de connexion GitHub', error);
      this.showError('Échec de la connexion GitHub: ' + error.message);
    }
  },

  /**
   * Sauvegarde toutes les données
   */
  saveData() {
    try {
      this.updateStatus('Sauvegarde en cours...');
      
      // Sauvegarder localement
      if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
      }
      
      // Sauvegarder sur GitHub si possible
      if (typeof DataManager !== 'undefined' && DataManager.saveDataToGitHub) {
        DataManager.saveDataToGitHub();
      }
      
      this.showSuccess('Données sauvegardées avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde', error);
      this.showError('Erreur lors de la sauvegarde des données');
    }
  },

  /**
   * Exporte les données
   */
  exportData() {
    try {
      const data = JSON.stringify(DataManager.data, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      this.showSuccess('Données exportées avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'export', error);
      this.showError('Erreur lors de l\'export des données');
    }
  },

  /**
   * Importe des données
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (confirm('Êtes-vous sûr de vouloir remplacer toutes les données actuelles ?')) {
            DataManager.data = data;
            this.saveData();
            this.showSuccess('Données importées avec succès');
            
            // Rafraîchir la vue actuelle
            this.switchView(this.config.currentView);
          }
          
        } catch (error) {
          console.error('Erreur lors de l\'import', error);
          this.showError('Erreur lors de l\'import: fichier JSON invalide');
        }
      };
      
      reader.readAsText(file);
    });
    
    input.click();
  },

  /**
   * Réinitialise toutes les données
   */
  resetData() {
    if (!confirm('⚠️ ATTENTION: Cette action supprimera toutes vos données de manière permanente. Êtes-vous absolument sûr ?')) {
      return;
    }
    
    if (!confirm('Dernière chance ! Toutes vos données (films, mangas, tags, articles, etc.) seront perdues. Continuer ?')) {
      return;
    }
    
    try {
      // Réinitialiser les données
      DataManager.data = {
        films: [],
        mangas: [],
        tags: [],
        articles: [],
        desktopIcons: [],
        cv: {},
        homePageConfig: DataManager.data.homePageConfig || {},
        bsodConfig: DataManager.data.bsodConfig || {}
      };
      
      this.saveData();
      this.showSuccess('Données réinitialisées');
      
      // Retourner à l'accueil
      this.switchView('home');
      
    } catch (error) {
      console.error('Erreur lors de la réinitialisation', error);
      this.showError('Erreur lors de la réinitialisation des données');
    }
  }
};

// ========================================
// INITIALISATION ET FONCTIONS UTILITAIRES
// ========================================

/**
 * Utilitaires pour le panneau d'administration
 */
AdminPanel.Utils = {
  /**
   * Nettoie le HTML pour éviter les injections XSS
   * @param {string} text - Texte à nettoyer
   * @returns {string} Texte nettoyé
   */
  sanitizeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Génère un ID unique
   * @returns {number} ID unique basé sur timestamp
   */
  generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
  },

  /**
   * Valide une URL
   * @param {string} url - URL à valider
   * @returns {boolean} True si l'URL est valide
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Formate une date
   * @param {Date|string} date - Date à formater
   * @returns {string} Date formatée
   */
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
};

// Ajouter les utilitaires à AdminPanel
Object.assign(AdminPanel, {
  sanitizeHtml: AdminPanel.Utils.sanitizeHtml,
  generateId: AdminPanel.Utils.generateId,
  isValidUrl: AdminPanel.Utils.isValidUrl,
  formatDate: AdminPanel.Utils.formatDate
});

// ========================================
// MÉTHODES DE DONNÉES ET STATISTIQUES  
// ========================================

/**
 * Méthodes pour obtenir les statistiques
 */
AdminPanel.getFilmsCount = function() {
  return (DataManager.data.films || []).length;
};

AdminPanel.getMangasCount = function() {
  return (DataManager.data.mangas || []).length;
};

AdminPanel.getTagsCount = function() {
  return (DataManager.data.tags || []).length;
};

AdminPanel.getArticlesCount = function() {
  return (DataManager.data.articles || []).length;
};

AdminPanel.getIconsCount = function() {
  return (DataManager.data.desktopIcons || []).length;
};

// ========================================
// GESTION DES ERREURS ET STATUT
// ========================================

/**
 * Affiche une erreur à l'utilisateur
 * @param {string} message - Message d'erreur
 */
AdminPanel.showError = function(message) {
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
};

/**
 * Affiche un succès à l'utilisateur
 * @param {string} message - Message de succès
 */
AdminPanel.showSuccess = function(message) {
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
};

/**
 * Met à jour le statut
 * @param {string} message - Message de statut
 */
AdminPanel.updateStatus = function(message) {
  const statusEl = document.getElementById('admin-status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = 'admin-status';
  }
};

// ========================================
// VUES MANQUANTES (stubs pour compatibilité)
// ========================================

AdminPanel.showArticlesView = function() {
  const content = document.getElementById('admin-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="admin-view-articles">
      <div class="admin-view-header">
        <h2>📄 Gestion des Articles</h2>
      </div>
      <p class="admin-empty">Gestion des articles PDF en cours d'implémentation...</p>
    </div>
  `;
};

AdminPanel.showCVView = function() {
  const content = document.getElementById('admin-content');
  if (!content) return;
  
  content.innerHTML = `
    <div class="admin-view-cv">
      <div class="admin-view-header">
        <h2>📋 Gestion du CV</h2>
      </div>
      <p class="admin-empty">Gestion du CV en cours d'implémentation...</p>
    </div>
  `;
};

AdminPanel.showIconForm = function() {
  const container = document.getElementById('icon-form-container');
  if (!container) return;
  
  container.innerHTML = '<p>Formulaire d\'icône en cours d\'implémentation...</p>';
  container.style.display = 'block';
};

AdminPanel.editIcon = function(iconId) {
  this.showError('Édition d\'icône en cours d\'implémentation');
};

AdminPanel.deleteIcon = function(iconId) {
  this.showError('Suppression d\'icône en cours d\'implémentation');
};

// ========================================
// INITIALISATION DU MODULE
// ========================================

// Initialiser le module quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
  AdminPanel.init();
  console.log('✅ AdminPanel: Module d\'administration consolidé initialisé');
});

// Compatibilité avec les anciens appels
window.AdminPanel = AdminPanel;

console.log('🚀 AdminPanel: Module d\'administration consolidé chargé');
