/**
 * PANNEAU D'ADMINISTRATION UNIFIÉ
 * Remplace tous les fichiers admin-fix-* et centralise la gestion du site
 * Version consolidée avec gestion complète et robuste des erreurs
 * 
 * Fonctionnalités :
 * - Gestion complète des films (ajout, modification, suppression)
 * - Gestion complète des mangas (ajout, modification, suppression) 
 * - Gestion des tags pour catégoriser le contenu
 * - Gestion des icônes de bureau
 * - Gestion des articles (upload PDF, affichage double page)
 * - Gestion du CV (upload PDF, affichage)
 * - Configuration token GitHub pour sauvegardes
 */

// ============================================================================
// GESTIONNAIRE D'ERREURS GLOBAL
// ============================================================================
const AdminErrorHandler = {
  /**
   * Log une erreur et la notifie à l'utilisateur
   * @param {Error|string} error - L'erreur à traiter
   * @param {string} context - Le contexte où l'erreur s'est produite
   * @param {boolean} showToUser - Afficher l'erreur à l'utilisateur
   */
  handleError(error, context = 'Admin Panel', showToUser = true) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${context}] ${errorMessage}`, error instanceof Error ? error.stack : '');
    
    if (showToUser) {
      this.showErrorToUser(errorMessage, context);
    }
  },

  /**
   * Affiche une erreur à l'utilisateur via notification ou alert
   * @param {string} message - Message d'erreur
   * @param {string} context - Contexte de l'erreur
   */
  showErrorToUser(message, context) {
    try {
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(`Erreur ${context}: ${message}`, 'error');
      } else {
        alert(`Erreur ${context}: ${message}`);
      }
    } catch (e) {
      console.error('Erreur lors de l\'affichage de l\'erreur:', e);
    }
  },

  /**
   * Wrapper pour exécuter du code avec gestion d'erreur automatique
   * @param {Function} fn - Fonction à exécuter
   * @param {string} context - Contexte d'exécution
   * @param {boolean} showToUser - Afficher les erreurs à l'utilisateur
   */
  async safeExecute(fn, context = 'Operation', showToUser = true) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error, context, showToUser);
      return null;
    }
  }
};

// ============================================================================
// GESTIONNAIRE DE MÉDIAS (UPLOAD D'IMAGES ET PDF)
// ============================================================================
const AdminMediaManager = {
  /**
   * Upload une image vers GitHub
   * @param {File} file - Fichier image à uploader
   * @param {string} directory - Répertoire de destination
   * @param {number} maxWidth - Largeur maximale
   * @param {number} quality - Qualité de compression
   * @returns {Promise<string|null>} URL de l'image uploadée
   */
  async uploadImage(file, directory = 'images/films', maxWidth = 800, quality = 0.85) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!file) throw new Error('Aucun fichier fourni');
      if (!this.validateImageFile(file)) throw new Error('Type de fichier non supporté');
      
      const token = this.getGitHubToken();
      if (!token) throw new Error('Token GitHub manquant');

      // Compresser l'image
      const compressedFile = await this.compressImage(file, maxWidth, quality);
      const fileName = this.generateFileName(file, directory);
      const filePath = `${directory}/${fileName}`;

      // Upload vers GitHub
      const base64Content = await this.fileToBase64(compressedFile);
      const response = await fetch(`https://api.github.com/repos/${this.getGitHubOwner()}/${this.getGitHubRepo()}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload: ${fileName}`,
          content: base64Content,
          branch: this.getGitHubBranch()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      return result.content.download_url;
    }, 'Upload Image');
  },

  /**
   * Upload un PDF vers GitHub
   * @param {File} file - Fichier PDF à uploader
   * @param {string} directory - Répertoire de destination
   * @returns {Promise<string|null>} URL du PDF uploadé
   */
  async uploadPDF(file, directory = 'documents') {
    return AdminErrorHandler.safeExecute(async () => {
      if (!file) throw new Error('Aucun fichier fourni');
      if (!this.validatePDFFile(file)) throw new Error('Le fichier doit être un PDF');
      
      const token = this.getGitHubToken();
      if (!token) throw new Error('Token GitHub manquant');

      const fileName = this.generateFileName(file, directory);
      const filePath = `${directory}/${fileName}`;

      // Upload vers GitHub
      const base64Content = await this.fileToBase64(file);
      const response = await fetch(`https://api.github.com/repos/${this.getGitHubOwner()}/${this.getGitHubRepo()}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📄 Upload PDF: ${fileName}`,
          content: base64Content,
          branch: this.getGitHubBranch()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      return result.content.download_url;
    }, 'Upload PDF');
  },

  /**
   * Valide qu'un fichier est une image supportée
   * @param {File} file - Fichier à valider
   * @returns {boolean}
   */
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type);
  },

  /**
   * Valide qu'un fichier est un PDF
   * @param {File} file - Fichier à valider
   * @returns {boolean}
   */
  validatePDFFile(file) {
    return file.type === 'application/pdf';
  },

  /**
   * Génère un nom de fichier unique
   * @param {File} file - Fichier original
   * @param {string} directory - Répertoire de destination
   * @returns {string}
   */
  generateFileName(file, directory) {
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = directory.split('/').pop();
    return `${prefix}_${timestamp}_${cleanName}`;
  },

  /**
   * Convertit un fichier en base64
   * @param {File} file - Fichier à convertir
   * @returns {Promise<string>}
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Compresse une image
   * @param {File} file - Image à comprimer
   * @param {number} maxWidth - Largeur maximale
   * @param {number} quality - Qualité (0-1)
   * @returns {Promise<Blob>}
   */
  compressImage(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Récupère le token GitHub depuis la configuration
   * @returns {string|null}
   */
  getGitHubToken() {
    try {
      return CONFIG?.github?.token || GITHUB_CONFIG?.token || localStorage.getItem('github_token') || null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Récupère le propriétaire du repo GitHub
   * @returns {string}
   */
  getGitHubOwner() {
    return CONFIG?.github?.owner || GITHUB_CONFIG?.owner || 'Teio-max';
  },

  /**
   * Récupère le nom du repo GitHub
   * @returns {string}
   */
  getGitHubRepo() {
    return CONFIG?.github?.repo || GITHUB_CONFIG?.repo || 'theolegato-site';
  },

  /**
   * Récupère la branche GitHub
   * @returns {string}
   */
  getGitHubBranch() {
    return CONFIG?.github?.branch || GITHUB_CONFIG?.branch || 'main';
  }
};

// ============================================================================
// GESTIONNAIRE PRINCIPAL DU PANNEAU D'ADMINISTRATION
// ============================================================================
const AdminPanelManager = {
  currentSection: 'welcome',
  
  /**
   * Initialise le panneau d'administration
   */
  init() {
    AdminErrorHandler.safeExecute(() => {
      this.setupEventListeners();
      this.showWelcomeSection();
    }, 'Admin Panel Init');
  },

  /**
   * Configure les écouteurs d'événements pour la barre d'outils
   */
  setupEventListeners() {
    const buttons = [
      { id: 'btn-add-film', handler: () => FilmManager.showAddFilmSection() },
      { id: 'btn-list-films', handler: () => FilmManager.showManageFilmsSection() },
      { id: 'btn-add-manga', handler: () => MangaManager.showAddMangaSection() },
      { id: 'btn-list-mangas', handler: () => MangaManager.showManageMangasSection() },
      { id: 'btn-manage-tags', handler: () => TagManager.showManageTagsSection() },
      { id: 'btn-manage-icons', handler: () => IconManager.showManageIconsSection() },
      { id: 'btn-manage-articles', handler: () => ArticleManager.showManageArticlesSection() },
      { id: 'btn-manage-cv', handler: () => CVManager.showManageCVSection() },
      { id: 'btn-github-token', handler: () => GitHubManager.showTokenSection() }
    ];

    buttons.forEach(({ id, handler }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          AdminErrorHandler.safeExecute(handler, `Button ${id}`);
        });
      }
    });
  },

  /**
   * Met à jour le contenu de la section admin
   * @param {string} html - Contenu HTML à afficher
   * @param {string} section - Identifiant de la section
   */
  updateAdminContent(html, section = '') {
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = html;
      this.currentSection = section;
    }
  },

  /**
   * Affiche la section d'accueil
   */
  showWelcomeSection() {
    const html = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Administration du site
      </h3>
      <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;">
        <p><strong>Bienvenue dans le panneau d'administration unifié !</strong></p>
        <p>Utilisez les boutons de la barre d'outils pour gérer le contenu de votre site :</p>
        <ul style="margin-left:20px;">
          <li><strong>Films</strong> : Ajoutez, modifiez ou supprimez des films de votre collection</li>
          <li><strong>Mangas</strong> : Gérez votre collection de mangas</li>
          <li><strong>Tags</strong> : Organisez votre contenu avec des étiquettes</li>
          <li><strong>Icônes</strong> : Personnalisez les icônes du bureau</li>
          <li><strong>Articles</strong> : Gérez vos articles avec upload PDF</li>
          <li><strong>CV</strong> : Uploadez et affichez votre CV</li>
          <li><strong>GitHub</strong> : Configurez la sauvegarde automatique</li>
        </ul>
        <p style="color:#6c757d;font-size:0.9em;margin-top:15px;">
          Toutes les modifications sont automatiquement sauvegardées sur GitHub (si configuré).
        </p>
      </div>
    `;
    this.updateAdminContent(html, 'welcome');
  }
};

// Exposer AdminPanelManager globalement
window.AdminPanelManager = AdminPanelManager;

// ============================================================================
// GESTIONNAIRE DES FILMS
// ============================================================================
const FilmManager = {
  /**
   * Affiche le formulaire d'ajout de film
   */
  showAddFilmSection() {
    AdminPanelManager.updateAdminContent(this.getFilmFormHTML(), 'add-film');
    this.setupFilmFormEvents();
  },

  /**
   * Affiche le formulaire de modification de film
   * @param {number} filmId - ID du film à modifier
   */
  showEditFilmSection(filmId) {
    const film = this.getFilmById(filmId);
    if (!film) {
      AdminErrorHandler.showErrorToUser('Film non trouvé', 'Edit Film');
      return;
    }
    
    AdminPanelManager.updateAdminContent(this.getFilmFormHTML(film), 'edit-film');
    this.setupFilmFormEvents(film);
  },

  /**
   * Affiche la liste des films existants pour gestion
   */
  showManageFilmsSection() {
    AdminErrorHandler.safeExecute(() => {
      const films = DataManager?.data?.films || [];
      let filmsHTML = '';

      if (films.length === 0) {
        filmsHTML = '<p>Aucun film trouvé dans la base de données.</p>';
      } else {
        filmsHTML = '<div class="films-list" style="max-height:400px;overflow-y:auto;">';
        films.forEach(film => {
          const stars = '★'.repeat(film.note || 0) + '☆'.repeat(5 - (film.note || 0));
          filmsHTML += `
            <div class="film-item" style="border:1px solid #ddd;padding:10px;margin:5px 0;background:#f9f9f9;">
              <div style="display:flex;align-items:center;gap:10px;">
                ${film.image ? `<img src="${film.image}" alt="${film.titre}" style="width:60px;height:auto;border-radius:3px;">` : ''}
                <div style="flex-grow:1;">
                  <h4 style="margin:0;color:#0058a8;">${film.titre}</h4>
                  <div style="color:#666;font-size:0.9em;">Note: ${stars}</div>
                  <div style="color:#666;font-size:0.9em;margin-top:3px;">${(film.critique || '').substring(0, 100)}${film.critique && film.critique.length > 100 ? '...' : ''}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:5px;">
                  <button onclick="FilmManager.showEditFilmSection(${film.id})" 
                    style="background:#17a2b8;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">
                    Modifier
                  </button>
                  <button onclick="FilmManager.deleteFilm(${film.id})" 
                    style="background:#dc3545;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        filmsHTML += '</div>';
      }

      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer les films
        </h3>
        ${filmsHTML}
        <div style="margin-top:15px;">
          <button onclick="FilmManager.showAddFilmSection()" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Ajouter un nouveau film
          </button>
        </div>
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-films');
    }, 'Manage Films');
  },

  /**
   * Génère le HTML du formulaire de film
   * @param {Object|null} film - Film à modifier (null pour création)
   * @returns {string}
   */
  getFilmFormHTML(film = null) {
    const isEdit = !!film;
    return `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${isEdit ? 'Modifier' : 'Ajouter'} un film
      </h3>
      
      <form id="film-form" class="admin-form">
        <div style="margin-bottom:15px;">
          <label for="film-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre *</label>
          <input type="text" id="film-titre" name="titre" value="${film?.titre || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (0-5)</label>
          <input type="number" id="film-note" name="note" min="0" max="5" value="${film?.note || 0}" 
            style="width:80px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
          <textarea id="film-critique" name="critique" rows="4" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${film?.critique || ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
          <input type="url" id="film-image" name="image" value="${film?.image || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="film-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="film-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Parcourir...
            </button>
            <button type="button" id="film-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
              Upload
            </button>
          </div>
          
          <div id="film-image-preview" style="margin-top:10px;"></div>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="film-bande-annonce" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la bande annonce</label>
          <input type="url" id="film-bande-annonce" name="bandeAnnonce" value="${film?.bandeAnnonce || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-top:20px;display:flex;gap:10px;">
          <button type="submit" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onclick="AdminPanelManager.showWelcomeSection()" 
            style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
  },

  /**
   * Configure les événements du formulaire de film
   * @param {Object|null} film - Film en cours de modification
   */
  setupFilmFormEvents(film = null) {
    AdminErrorHandler.safeExecute(() => {
      // Gestion du formulaire
      const form = document.getElementById('film-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleFilmSubmit(e, film));
      }

      // Gestion de l'upload d'image
      const browseBtn = document.getElementById('film-browse-btn');
      const uploadBtn = document.getElementById('film-upload-btn');
      const fileInput = document.getElementById('film-image-upload');
      const imageInput = document.getElementById('film-image');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
      }

      if (fileInput && imageInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            this.previewImage(file);
          }
        });
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => this.handleImageUpload(fileInput, imageInput, uploadBtn));
      }

      // Afficher l'aperçu de l'image existante
      if (film?.image) {
        this.showImagePreview(film.image);
      }
    }, 'Film Form Events');
  },

  /**
   * Gère la soumission du formulaire de film
   * @param {Event} e - Événement de soumission
   * @param {Object|null} existingFilm - Film existant (pour modification)
   */
  async handleFilmSubmit(e, existingFilm = null) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      const filmData = {
        id: existingFilm?.id || Date.now(),
        titre: formData.get('titre').trim(),
        note: parseInt(formData.get('note')) || 0,
        critique: formData.get('critique').trim(),
        image: formData.get('image').trim(),
        bandeAnnonce: formData.get('bandeAnnonce').trim(),
        galerie: existingFilm?.galerie || [],
        liens: existingFilm?.liens || []
      };

      // Validation
      if (!filmData.titre) {
        throw new Error('Le titre est obligatoire');
      }

      // Sauvegarder le film
      if (existingFilm) {
        this.updateFilm(filmData);
      } else {
        this.addFilm(filmData);
      }

      // Sauvegarder les données
      await this.saveData();

      // Retourner à la liste
      this.showManageFilmsSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(
          `Film ${existingFilm ? 'modifié' : 'ajouté'} avec succès`, 
          'success'
        );
      }
    }, 'Film Submit');
  },

  /**
   * Gère l'upload d'une image
   * @param {HTMLInputElement} fileInput - Input de fichier
   * @param {HTMLInputElement} imageInput - Input d'URL d'image
   * @param {HTMLButtonElement} uploadBtn - Bouton d'upload
   */
  async handleImageUpload(fileInput, imageInput, uploadBtn) {
    const file = fileInput.files[0];
    if (!file) {
      AdminErrorHandler.showErrorToUser('Veuillez sélectionner un fichier', 'Upload');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload en cours...';
    uploadBtn.style.background = '#95a5a6';

    const url = await AdminMediaManager.uploadImage(file, 'images/films');
    
    if (url) {
      imageInput.value = url;
      this.showImagePreview(url);
      uploadBtn.textContent = '✅ Uploadé';
      uploadBtn.style.background = '#27ae60';
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Image uploadée avec succès', 'success');
      }
    } else {
      uploadBtn.textContent = 'Réessayer';
      uploadBtn.style.background = '#e74c3c';
    }
    
    uploadBtn.disabled = false;
  },

  /**
   * Affiche un aperçu de l'image
   * @param {File|string} source - Fichier ou URL de l'image
   */
  previewImage(source) {
    const preview = document.getElementById('film-image-preview');
    if (!preview) return;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => this.showImagePreview(e.target.result);
      reader.readAsDataURL(source);
    } else {
      this.showImagePreview(source);
    }
  },

  /**
   * Affiche l'aperçu d'une image
   * @param {string} url - URL de l'image
   */
  showImagePreview(url) {
    const preview = document.getElementById('film-image-preview');
    if (preview && url) {
      preview.innerHTML = `
        <div style="border:1px solid #ACA899;padding:8px;background:#fff;border-radius:3px;">
          <p style="margin:0 0 5px 0;font-weight:bold;font-size:0.9em;">Aperçu de l'image :</p>
          <img src="${url}" alt="Aperçu" style="max-width:200px;max-height:120px;border-radius:3px;">
        </div>
      `;
    }
  },

  /**
   * Ajoute un film à la collection
   * @param {Object} filmData - Données du film
   */
  addFilm(filmData) {
    if (!DataManager?.data) {
      throw new Error('DataManager non disponible');
    }
    
    if (!DataManager.data.films) {
      DataManager.data.films = [];
    }
    
    DataManager.data.films.push(filmData);
  },

  /**
   * Met à jour un film existant
   * @param {Object} filmData - Nouvelles données du film
   */
  updateFilm(filmData) {
    if (!DataManager?.data?.films) {
      throw new Error('DataManager ou films non disponibles');
    }
    
    const index = DataManager.data.films.findIndex(f => f.id === filmData.id);
    if (index === -1) {
      throw new Error('Film non trouvé');
    }
    
    DataManager.data.films[index] = filmData;
  },

  /**
   * Supprime un film
   * @param {number} filmId - ID du film à supprimer
   */
  async deleteFilm(filmId) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
        return;
      }

      if (!DataManager?.data?.films) {
        throw new Error('DataManager ou films non disponibles');
      }

      DataManager.data.films = DataManager.data.films.filter(f => f.id !== filmId);
      await this.saveData();
      this.showManageFilmsSection();

      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Film supprimé avec succès', 'success');
      }
    }, 'Delete Film');
  },

  /**
   * Récupère un film par son ID
   * @param {number} filmId - ID du film
   * @returns {Object|null}
   */
  getFilmById(filmId) {
    return DataManager?.data?.films?.find(f => f.id === filmId) || null;
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// Exposer FilmManager globalement pour les event handlers
window.FilmManager = FilmManager;

// ============================================================================
// GESTIONNAIRE DES MANGAS
// ============================================================================
const MangaManager = {
  /**
   * Affiche le formulaire d'ajout de manga
   */
  showAddMangaSection() {
    AdminPanelManager.updateAdminContent(this.getMangaFormHTML(), 'add-manga');
    this.setupMangaFormEvents();
  },

  /**
   * Affiche le formulaire de modification de manga
   * @param {number} mangaId - ID du manga à modifier
   */
  showEditMangaSection(mangaId) {
    const manga = this.getMangaById(mangaId);
    if (!manga) {
      AdminErrorHandler.showErrorToUser('Manga non trouvé', 'Edit Manga');
      return;
    }
    
    AdminPanelManager.updateAdminContent(this.getMangaFormHTML(manga), 'edit-manga');
    this.setupMangaFormEvents(manga);
  },

  /**
   * Affiche la liste des mangas existants pour gestion
   */
  showManageMangasSection() {
    AdminErrorHandler.safeExecute(() => {
      const mangas = DataManager?.data?.mangas || [];
      let mangasHTML = '';

      if (mangas.length === 0) {
        mangasHTML = '<p>Aucun manga trouvé dans la base de données.</p>';
      } else {
        mangasHTML = '<div class="mangas-list" style="max-height:400px;overflow-y:auto;">';
        mangas.forEach(manga => {
          const stars = '★'.repeat(manga.note || 0) + '☆'.repeat(5 - (manga.note || 0));
          mangasHTML += `
            <div class="manga-item" style="border:1px solid #ddd;padding:10px;margin:5px 0;background:#f9f9f9;">
              <div style="display:flex;align-items:center;gap:10px;">
                ${manga.image ? `<img src="${manga.image}" alt="${manga.titre}" style="width:60px;height:auto;border-radius:3px;">` : ''}
                <div style="flex-grow:1;">
                  <h4 style="margin:0;color:#0058a8;">${manga.titre}</h4>
                  <div style="color:#666;font-size:0.9em;">Note: ${stars}</div>
                  <div style="color:#666;font-size:0.9em;">Auteur: ${manga.auteur || 'Non spécifié'}</div>
                  <div style="color:#666;font-size:0.9em;">Statut: ${manga.statut || 'En cours'}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:5px;">
                  <button onclick="MangaManager.showEditMangaSection(${manga.id})" 
                    style="background:#17a2b8;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">
                    Modifier
                  </button>
                  <button onclick="MangaManager.deleteManga(${manga.id})" 
                    style="background:#dc3545;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        mangasHTML += '</div>';
      }

      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer les mangas
        </h3>
        ${mangasHTML}
        <div style="margin-top:15px;">
          <button onclick="MangaManager.showAddMangaSection()" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Ajouter un nouveau manga
          </button>
        </div>
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-mangas');
    }, 'Manage Mangas');
  },

  /**
   * Génère le HTML du formulaire de manga
   * @param {Object|null} manga - Manga à modifier (null pour création)
   * @returns {string}
   */
  getMangaFormHTML(manga = null) {
    const isEdit = !!manga;
    return `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${isEdit ? 'Modifier' : 'Ajouter'} un manga
      </h3>
      
      <form id="manga-form" class="admin-form">
        <div style="margin-bottom:15px;">
          <label for="manga-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre *</label>
          <input type="text" id="manga-titre" name="titre" value="${manga?.titre || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (0-5)</label>
          <input type="number" id="manga-note" name="note" min="0" max="5" value="${manga?.note || 0}" 
            style="width:80px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-auteur" style="display:block;margin-bottom:5px;font-weight:bold;">Auteur</label>
          <input type="text" id="manga-auteur" name="auteur" value="${manga?.auteur || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-statut" style="display:block;margin-bottom:5px;font-weight:bold;">Statut</label>
          <select id="manga-statut" name="statut" 
            style="width:200px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
            <option value="En cours" ${manga?.statut === 'En cours' ? 'selected' : ''}>En cours</option>
            <option value="Terminé" ${manga?.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
            <option value="En pause" ${manga?.statut === 'En pause' ? 'selected' : ''}>En pause</option>
            <option value="Abandonné" ${manga?.statut === 'Abandonné' ? 'selected' : ''}>Abandonné</option>
          </select>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-description" style="display:block;margin-bottom:5px;font-weight:bold;">Description</label>
          <textarea id="manga-description" name="description" rows="4" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${manga?.description || ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
          <input type="url" id="manga-image" name="image" value="${manga?.image || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="manga-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="manga-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Parcourir...
            </button>
            <button type="button" id="manga-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
              Upload
            </button>
          </div>
          
          <div id="manga-image-preview" style="margin-top:10px;"></div>
        </div>
        
        <div style="margin-top:20px;display:flex;gap:10px;">
          <button type="submit" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onclick="AdminPanelManager.showWelcomeSection()" 
            style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
  },

  /**
   * Configure les événements du formulaire de manga
   * @param {Object|null} manga - Manga en cours de modification
   */
  setupMangaFormEvents(manga = null) {
    AdminErrorHandler.safeExecute(() => {
      // Gestion du formulaire
      const form = document.getElementById('manga-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleMangaSubmit(e, manga));
      }

      // Gestion de l'upload d'image
      const browseBtn = document.getElementById('manga-browse-btn');
      const uploadBtn = document.getElementById('manga-upload-btn');
      const fileInput = document.getElementById('manga-image-upload');
      const imageInput = document.getElementById('manga-image');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
      }

      if (fileInput && imageInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            this.previewImage(file);
          }
        });
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => this.handleImageUpload(fileInput, imageInput, uploadBtn));
      }

      // Afficher l'aperçu de l'image existante
      if (manga?.image) {
        this.showImagePreview(manga.image);
      }
    }, 'Manga Form Events');
  },

  /**
   * Gère la soumission du formulaire de manga
   * @param {Event} e - Événement de soumission
   * @param {Object|null} existingManga - Manga existant (pour modification)
   */
  async handleMangaSubmit(e, existingManga = null) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      const mangaData = {
        id: existingManga?.id || Date.now(),
        titre: formData.get('titre').trim(),
        note: parseInt(formData.get('note')) || 0,
        auteur: formData.get('auteur').trim(),
        statut: formData.get('statut'),
        description: formData.get('description').trim(),
        image: formData.get('image').trim(),
        dateAjout: existingManga?.dateAjout || new Date().toISOString().split('T')[0]
      };

      // Validation
      if (!mangaData.titre) {
        throw new Error('Le titre est obligatoire');
      }

      // Sauvegarder le manga
      if (existingManga) {
        this.updateManga(mangaData);
      } else {
        this.addManga(mangaData);
      }

      // Sauvegarder les données
      await this.saveData();

      // Retourner à la liste
      this.showManageMangasSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(
          `Manga ${existingManga ? 'modifié' : 'ajouté'} avec succès`, 
          'success'
        );
      }
    }, 'Manga Submit');
  },

  /**
   * Gère l'upload d'une image
   * @param {HTMLInputElement} fileInput - Input de fichier
   * @param {HTMLInputElement} imageInput - Input d'URL d'image
   * @param {HTMLButtonElement} uploadBtn - Bouton d'upload
   */
  async handleImageUpload(fileInput, imageInput, uploadBtn) {
    const file = fileInput.files[0];
    if (!file) {
      AdminErrorHandler.showErrorToUser('Veuillez sélectionner un fichier', 'Upload');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload en cours...';
    uploadBtn.style.background = '#95a5a6';

    const url = await AdminMediaManager.uploadImage(file, 'images/mangas');
    
    if (url) {
      imageInput.value = url;
      this.showImagePreview(url);
      uploadBtn.textContent = '✅ Uploadé';
      uploadBtn.style.background = '#27ae60';
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Image uploadée avec succès', 'success');
      }
    } else {
      uploadBtn.textContent = 'Réessayer';
      uploadBtn.style.background = '#e74c3c';
    }
    
    uploadBtn.disabled = false;
  },

  /**
   * Affiche un aperçu de l'image
   * @param {File|string} source - Fichier ou URL de l'image
   */
  previewImage(source) {
    const preview = document.getElementById('manga-image-preview');
    if (!preview) return;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => this.showImagePreview(e.target.result);
      reader.readAsDataURL(source);
    } else {
      this.showImagePreview(source);
    }
  },

  /**
   * Affiche l'aperçu d'une image
   * @param {string} url - URL de l'image
   */
  showImagePreview(url) {
    const preview = document.getElementById('manga-image-preview');
    if (preview && url) {
      preview.innerHTML = `
        <div style="border:1px solid #ACA899;padding:8px;background:#fff;border-radius:3px;">
          <p style="margin:0 0 5px 0;font-weight:bold;font-size:0.9em;">Aperçu de l'image :</p>
          <img src="${url}" alt="Aperçu" style="max-width:200px;max-height:120px;border-radius:3px;">
        </div>
      `;
    }
  },

  /**
   * Ajoute un manga à la collection
   * @param {Object} mangaData - Données du manga
   */
  addManga(mangaData) {
    if (!DataManager?.data) {
      throw new Error('DataManager non disponible');
    }
    
    if (!DataManager.data.mangas) {
      DataManager.data.mangas = [];
    }
    
    DataManager.data.mangas.push(mangaData);
  },

  /**
   * Met à jour un manga existant
   * @param {Object} mangaData - Nouvelles données du manga
   */
  updateManga(mangaData) {
    if (!DataManager?.data?.mangas) {
      throw new Error('DataManager ou mangas non disponibles');
    }
    
    const index = DataManager.data.mangas.findIndex(m => m.id === mangaData.id);
    if (index === -1) {
      throw new Error('Manga non trouvé');
    }
    
    DataManager.data.mangas[index] = mangaData;
  },

  /**
   * Supprime un manga
   * @param {number} mangaId - ID du manga à supprimer
   */
  async deleteManga(mangaId) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce manga ?')) {
        return;
      }

      if (!DataManager?.data?.mangas) {
        throw new Error('DataManager ou mangas non disponibles');
      }

      DataManager.data.mangas = DataManager.data.mangas.filter(m => m.id !== mangaId);
      await this.saveData();
      this.showManageMangasSection();

      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Manga supprimé avec succès', 'success');
      }
    }, 'Delete Manga');
  },

  /**
   * Récupère un manga par son ID
   * @param {number} mangaId - ID du manga
   * @returns {Object|null}
   */
  getMangaById(mangaId) {
    return DataManager?.data?.mangas?.find(m => m.id === mangaId) || null;
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// Exposer MangaManager globalement pour les event handlers
window.MangaManager = MangaManager;

// ============================================================================
// GESTIONNAIRE DES TAGS
// ============================================================================
const TagManager = {
  /**
   * Affiche la section de gestion des tags
   */
  showManageTagsSection() {
    AdminErrorHandler.safeExecute(() => {
      const tags = DataManager?.data?.tags || [];
      let tagsHTML = '';

      if (tags.length === 0) {
        tagsHTML = '<p>Aucun tag trouvé. Créez des tags pour organiser votre contenu.</p>';
      } else {
        tagsHTML = '<div class="tags-list" style="max-height:300px;overflow-y:auto;border:1px solid #ddd;padding:10px;background:#f9f9f9;">';
        tags.forEach(tag => {
          tagsHTML += `
            <div class="tag-item" style="display:inline-block;margin:3px;padding:5px 10px;background:#0058a8;color:white;border-radius:15px;position:relative;">
              <span>${tag.nom}</span>
              <button onclick="TagManager.deleteTag('${tag.id}')" 
                style="margin-left:5px;background:none;border:none;color:white;cursor:pointer;font-size:12px;">
                ×
              </button>
            </div>
          `;
        });
        tagsHTML += '</div>';
      }

      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer les tags
        </h3>
        
        <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;margin-bottom:20px;">
          <p>Les tags permettent de catégoriser vos films et mangas pour faciliter la recherche et l'organisation.</p>
        </div>

        <div style="margin-bottom:20px;">
          <h4>Ajouter un nouveau tag</h4>
          <form id="add-tag-form" style="display:flex;gap:10px;align-items:end;">
            <div>
              <label for="tag-nom" style="display:block;margin-bottom:5px;font-weight:bold;">Nom du tag</label>
              <input type="text" id="tag-nom" required 
                style="padding:5px;border:1px solid #ACA899;border-radius:3px;">
            </div>
            <div>
              <label for="tag-couleur" style="display:block;margin-bottom:5px;font-weight:bold;">Couleur</label>
              <input type="color" id="tag-couleur" value="#0058a8" 
                style="padding:5px;border:1px solid #ACA899;border-radius:3px;width:60px;">
            </div>
            <button type="submit" 
              style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Ajouter
            </button>
          </form>
        </div>

        <h4>Tags existants</h4>
        ${tagsHTML}
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-tags');
      this.setupTagsEvents();
    }, 'Manage Tags');
  },

  /**
   * Configure les événements de gestion des tags
   */
  setupTagsEvents() {
    const form = document.getElementById('add-tag-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddTag(e));
    }
  },

  /**
   * Gère l'ajout d'un nouveau tag
   * @param {Event} e - Événement de soumission
   */
  async handleAddTag(e) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const nom = document.getElementById('tag-nom').value.trim();
      const couleur = document.getElementById('tag-couleur').value;

      if (!nom) {
        throw new Error('Le nom du tag est obligatoire');
      }

      // Vérifier si le tag existe déjà
      const existingTags = DataManager?.data?.tags || [];
      if (existingTags.some(tag => tag.nom.toLowerCase() === nom.toLowerCase())) {
        throw new Error('Ce tag existe déjà');
      }

      const tagData = {
        id: Date.now().toString(),
        nom: nom,
        couleur: couleur,
        dateCreation: new Date().toISOString().split('T')[0]
      };

      // Ajouter le tag
      if (!DataManager.data.tags) {
        DataManager.data.tags = [];
      }
      DataManager.data.tags.push(tagData);

      // Sauvegarder
      await this.saveData();

      // Recharger l'interface
      this.showManageTagsSection();

      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Tag ajouté avec succès', 'success');
      }
    }, 'Add Tag');
  },

  /**
   * Supprime un tag
   * @param {string} tagId - ID du tag à supprimer
   */
  async deleteTag(tagId) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
        return;
      }

      if (!DataManager?.data?.tags) {
        throw new Error('Aucun tag trouvé');
      }

      DataManager.data.tags = DataManager.data.tags.filter(tag => tag.id !== tagId);
      await this.saveData();
      this.showManageTagsSection();

      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Tag supprimé avec succès', 'success');
      }
    }, 'Delete Tag');
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// ============================================================================
// GESTIONNAIRE DES ICÔNES
// ============================================================================
const IconManager = {
  /**
   * Affiche la section de gestion des icônes
   */
  showManageIconsSection() {
    AdminErrorHandler.safeExecute(() => {
      const icons = DataManager?.data?.desktopIcons || [];
      let iconsHTML = '';

      if (icons.length === 0) {
        iconsHTML = '<p>Aucune icône personnalisée trouvée.</p>';
      } else {
        iconsHTML = '<div class="icons-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:15px;">';
        icons.forEach(icon => {
          iconsHTML += `
            <div class="icon-item" style="border:1px solid #ddd;padding:15px;background:#f9f9f9;border-radius:5px;text-align:center;">
              <img src="${icon.image}" alt="${icon.label}" style="width:32px;height:32px;margin-bottom:10px;">
              <div style="font-weight:bold;margin-bottom:5px;">${icon.label}</div>
              <div style="font-size:0.8em;color:#666;margin-bottom:10px;">${icon.action}</div>
              <div style="display:flex;gap:5px;justify-content:center;">
                <button onclick="IconManager.showEditIconSection(${icon.id})" 
                  style="background:#17a2b8;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
                  Modifier
                </button>
                <button onclick="IconManager.deleteIcon(${icon.id})" 
                  style="background:#dc3545;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
                  Supprimer
                </button>
              </div>
            </div>
          `;
        });
        iconsHTML += '</div>';
      }

      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer les icônes du bureau
        </h3>
        
        <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;margin-bottom:20px;">
          <p>Personnalisez les icônes qui s'affichent sur le bureau de votre site.</p>
        </div>

        <div style="margin-bottom:20px;">
          <button onclick="IconManager.showAddIconSection()" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Ajouter une nouvelle icône
          </button>
        </div>

        ${iconsHTML}
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-icons');
    }, 'Manage Icons');
  },

  /**
   * Affiche le formulaire d'ajout d'icône
   */
  showAddIconSection() {
    AdminPanelManager.updateAdminContent(this.getIconFormHTML(), 'add-icon');
    this.setupIconFormEvents();
  },

  /**
   * Affiche le formulaire de modification d'icône
   * @param {number} iconId - ID de l'icône à modifier
   */
  showEditIconSection(iconId) {
    const icon = this.getIconById(iconId);
    if (!icon) {
      AdminErrorHandler.showErrorToUser('Icône non trouvée', 'Edit Icon');
      return;
    }
    
    AdminPanelManager.updateAdminContent(this.getIconFormHTML(icon), 'edit-icon');
    this.setupIconFormEvents(icon);
  },

  /**
   * Génère le HTML du formulaire d'icône
   * @param {Object|null} icon - Icône à modifier (null pour création)
   * @returns {string}
   */
  getIconFormHTML(icon = null) {
    const isEdit = !!icon;
    return `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${isEdit ? 'Modifier' : 'Ajouter'} une icône
      </h3>
      
      <form id="icon-form" class="admin-form">
        <div style="margin-bottom:15px;">
          <label for="icon-label" style="display:block;margin-bottom:5px;font-weight:bold;">Label *</label>
          <input type="text" id="icon-label" name="label" value="${icon?.label || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="icon-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image *</label>
          <input type="url" id="icon-image" name="image" value="${icon?.image || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="icon-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="icon-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Parcourir...
            </button>
            <button type="button" id="icon-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
              Upload
            </button>
          </div>
          
          <div id="icon-image-preview" style="margin-top:10px;"></div>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="icon-action" style="display:block;margin-bottom:5px;font-weight:bold;">Action *</label>
          <select id="icon-action" name="action" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
            <option value="">Sélectionner une action</option>
            <option value="openWindow('films')" ${icon?.action === "openWindow('films')" ? 'selected' : ''}>Ouvrir la fenêtre Films</option>
            <option value="openWindow('mangas')" ${icon?.action === "openWindow('mangas')" ? 'selected' : ''}>Ouvrir la fenêtre Mangas</option>
            <option value="showAdminLogin()" ${icon?.action === 'showAdminLogin()' ? 'selected' : ''}>Panneau d'administration</option>
            <option value="custom">Action personnalisée</option>
          </select>
        </div>
        
        <div id="custom-action-field" style="margin-bottom:15px;display:${icon?.action && !["openWindow('films')", "openWindow('mangas')", 'showAdminLogin()'].includes(icon.action) ? 'block' : 'none'};">
          <label for="icon-custom-action" style="display:block;margin-bottom:5px;font-weight:bold;">Action personnalisée</label>
          <input type="text" id="icon-custom-action" name="customAction" 
            value="${icon?.action && !["openWindow('films')", "openWindow('mangas')", 'showAdminLogin()'].includes(icon.action) ? icon.action : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          <small style="color:#666;">Exemple: openURL('https://example.com')</small>
        </div>
        
        <div style="margin-top:20px;display:flex;gap:10px;">
          <button type="submit" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onclick="IconManager.showManageIconsSection()" 
            style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
  },

  /**
   * Configure les événements du formulaire d'icône
   * @param {Object|null} icon - Icône en cours de modification
   */
  setupIconFormEvents(icon = null) {
    AdminErrorHandler.safeExecute(() => {
      // Gestion du formulaire
      const form = document.getElementById('icon-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleIconSubmit(e, icon));
      }

      // Gestion du changement d'action
      const actionSelect = document.getElementById('icon-action');
      const customField = document.getElementById('custom-action-field');
      
      if (actionSelect && customField) {
        actionSelect.addEventListener('change', (e) => {
          customField.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
      }

      // Gestion de l'upload d'image
      const browseBtn = document.getElementById('icon-browse-btn');
      const uploadBtn = document.getElementById('icon-upload-btn');
      const fileInput = document.getElementById('icon-image-upload');
      const imageInput = document.getElementById('icon-image');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
      }

      if (fileInput && imageInput) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            this.previewImage(file);
          }
        });
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => this.handleImageUpload(fileInput, imageInput, uploadBtn));
      }

      // Afficher l'aperçu de l'image existante
      if (icon?.image) {
        this.showImagePreview(icon.image);
      }
    }, 'Icon Form Events');
  },

  /**
   * Gère la soumission du formulaire d'icône
   * @param {Event} e - Événement de soumission
   * @param {Object|null} existingIcon - Icône existante (pour modification)
   */
  async handleIconSubmit(e, existingIcon = null) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      let action = formData.get('action');
      
      if (action === 'custom') {
        action = formData.get('customAction').trim();
      }

      const iconData = {
        id: existingIcon?.id || Date.now(),
        label: formData.get('label').trim(),
        image: formData.get('image').trim(),
        action: action
      };

      // Validation
      if (!iconData.label || !iconData.image || !iconData.action) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }

      // Sauvegarder l'icône
      if (existingIcon) {
        this.updateIcon(iconData);
      } else {
        this.addIcon(iconData);
      }

      // Sauvegarder les données
      await this.saveData();

      // Retourner à la liste
      this.showManageIconsSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(
          `Icône ${existingIcon ? 'modifiée' : 'ajoutée'} avec succès`, 
          'success'
        );
      }
    }, 'Icon Submit');
  },

  /**
   * Gère l'upload d'une image
   */
  async handleImageUpload(fileInput, imageInput, uploadBtn) {
    const file = fileInput.files[0];
    if (!file) {
      AdminErrorHandler.showErrorToUser('Veuillez sélectionner un fichier', 'Upload');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload en cours...';
    uploadBtn.style.background = '#95a5a6';

    const url = await AdminMediaManager.uploadImage(file, 'icons');
    
    if (url) {
      imageInput.value = url;
      this.showImagePreview(url);
      uploadBtn.textContent = '✅ Uploadé';
      uploadBtn.style.background = '#27ae60';
    } else {
      uploadBtn.textContent = 'Réessayer';
      uploadBtn.style.background = '#e74c3c';
    }
    
    uploadBtn.disabled = false;
  },

  /**
   * Affiche un aperçu de l'image
   */
  previewImage(source) {
    const preview = document.getElementById('icon-image-preview');
    if (!preview) return;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => this.showImagePreview(e.target.result);
      reader.readAsDataURL(source);
    } else {
      this.showImagePreview(source);
    }
  },

  /**
   * Affiche l'aperçu d'une image
   */
  showImagePreview(url) {
    const preview = document.getElementById('icon-image-preview');
    if (preview && url) {
      preview.innerHTML = `
        <div style="border:1px solid #ACA899;padding:8px;background:#fff;border-radius:3px;">
          <p style="margin:0 0 5px 0;font-weight:bold;font-size:0.9em;">Aperçu de l'icône :</p>
          <img src="${url}" alt="Aperçu" style="width:32px;height:32px;">
        </div>
      `;
    }
  },

  /**
   * Ajoute une icône
   */
  addIcon(iconData) {
    if (!DataManager?.data) {
      throw new Error('DataManager non disponible');
    }
    
    if (!DataManager.data.desktopIcons) {
      DataManager.data.desktopIcons = [];
    }
    
    DataManager.data.desktopIcons.push(iconData);
  },

  /**
   * Met à jour une icône existante
   */
  updateIcon(iconData) {
    if (!DataManager?.data?.desktopIcons) {
      throw new Error('DataManager ou icônes non disponibles');
    }
    
    const index = DataManager.data.desktopIcons.findIndex(i => i.id === iconData.id);
    if (index === -1) {
      throw new Error('Icône non trouvée');
    }
    
    DataManager.data.desktopIcons[index] = iconData;
  },

  /**
   * Supprime une icône
   */
  async deleteIcon(iconId) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette icône ?')) {
        return;
      }

      if (!DataManager?.data?.desktopIcons) {
        throw new Error('DataManager ou icônes non disponibles');
      }

      DataManager.data.desktopIcons = DataManager.data.desktopIcons.filter(i => i.id !== iconId);
      await this.saveData();
      this.showManageIconsSection();

      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Icône supprimée avec succès', 'success');
      }
    }, 'Delete Icon');
  },

  /**
   * Récupère une icône par son ID
   */
  getIconById(iconId) {
    return DataManager?.data?.desktopIcons?.find(i => i.id === iconId) || null;
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// Exposer les managers globalement pour les event handlers
window.TagManager = TagManager;
window.IconManager = IconManager;

// ============================================================================
// GESTIONNAIRE DES ARTICLES
// ============================================================================
const ArticleManager = {
  /**
   * Affiche la section de gestion des articles
   */
  showManageArticlesSection() {
    AdminErrorHandler.safeExecute(() => {
      const articles = DataManager?.data?.articles || [];
      let articlesHTML = '';

      if (articles.length === 0) {
        articlesHTML = '<p>Aucun article trouvé.</p>';
      } else {
        articlesHTML = '<div class="articles-list" style="max-height:400px;overflow-y:auto;">';
        articles.forEach(article => {
          articlesHTML += `
            <div class="article-item" style="border:1px solid #ddd;padding:15px;margin:10px 0;background:#f9f9f9;">
              <div style="display:flex;justify-content:space-between;align-items:start;">
                <div style="flex-grow:1;">
                  <h4 style="margin:0 0 5px 0;color:#0058a8;">${article.titre}</h4>
                  <div style="color:#666;font-size:0.9em;margin-bottom:5px;">
                    Catégorie: ${article.categorie || 'Non spécifiée'} | 
                    Date: ${article.date || 'Non spécifiée'}
                  </div>
                  <div style="color:#666;font-size:0.9em;margin-bottom:10px;">
                    ${(article.contenu || '').substring(0, 150)}${article.contenu && article.contenu.length > 150 ? '...' : ''}
                  </div>
                  ${article.pdfUrl ? `<a href="${article.pdfUrl}" target="_blank" style="color:#0058a8;text-decoration:none;">📄 Voir le PDF</a>` : ''}
                </div>
                <div style="display:flex;flex-direction:column;gap:5px;margin-left:15px;">
                  <button onclick="ArticleManager.showEditArticleSection(${article.id})" 
                    style="background:#17a2b8;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
                    Modifier
                  </button>
                  <button onclick="ArticleManager.deleteArticle(${article.id})" 
                    style="background:#dc3545;color:white;border:none;padding:4px 8px;border-radius:3px;cursor:pointer;font-size:12px;">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          `;
        });
        articlesHTML += '</div>';
      }

      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer les articles
        </h3>
        
        <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;margin-bottom:20px;">
          <p>Gérez vos articles avec upload PDF et affichage en double page.</p>
        </div>

        <div style="margin-bottom:20px;">
          <button onclick="ArticleManager.showAddArticleSection()" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Ajouter un nouvel article
          </button>
        </div>

        ${articlesHTML}
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-articles');
    }, 'Manage Articles');
  },

  /**
   * Affiche le formulaire d'ajout d'article
   */
  showAddArticleSection() {
    AdminPanelManager.updateAdminContent(this.getArticleFormHTML(), 'add-article');
    this.setupArticleFormEvents();
  },

  /**
   * Affiche le formulaire de modification d'article
   */
  showEditArticleSection(articleId) {
    const article = this.getArticleById(articleId);
    if (!article) {
      AdminErrorHandler.showErrorToUser('Article non trouvé', 'Edit Article');
      return;
    }
    
    AdminPanelManager.updateAdminContent(this.getArticleFormHTML(article), 'edit-article');
    this.setupArticleFormEvents(article);
  },

  /**
   * Génère le HTML du formulaire d'article
   */
  getArticleFormHTML(article = null) {
    const isEdit = !!article;
    return `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${isEdit ? 'Modifier' : 'Ajouter'} un article
      </h3>
      
      <form id="article-form" class="admin-form">
        <div style="margin-bottom:15px;">
          <label for="article-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre *</label>
          <input type="text" id="article-titre" name="titre" value="${article?.titre || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-date" style="display:block;margin-bottom:5px;font-weight:bold;">Date</label>
          <input type="date" id="article-date" name="date" value="${article?.date || new Date().toISOString().split('T')[0]}" 
            style="width:200px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-categorie" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie</label>
          <input type="text" id="article-categorie" name="categorie" value="${article?.categorie || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-contenu" style="display:block;margin-bottom:5px;font-weight:bold;">Contenu</label>
          <textarea id="article-contenu" name="contenu" rows="6" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${article?.contenu || ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-pdf" style="display:block;margin-bottom:5px;font-weight:bold;">PDF ${isEdit ? '' : '*'}</label>
          <input type="hidden" id="article-pdf-url" value="${article?.pdfUrl || ''}">
          
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
            <input type="file" id="article-pdf-upload" accept=".pdf" style="display:none;">
            <button type="button" id="article-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Parcourir...
            </button>
            <button type="button" id="article-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
              Upload PDF
            </button>
            <span id="article-pdf-name" style="font-size:0.9em;color:#666;"></span>
          </div>
          
          ${article?.pdfUrl ? `
            <div style="background:#e8f5e8;padding:10px;border-radius:3px;">
              <p style="margin:0;color:#155724;">
                📄 PDF actuel: <a href="${article.pdfUrl}" target="_blank" style="color:#0058a8;">Voir le PDF</a>
              </p>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top:20px;display:flex;gap:10px;">
          <button type="submit" 
            style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" onclick="ArticleManager.showManageArticlesSection()" 
            style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
  },

  /**
   * Configure les événements du formulaire d'article
   */
  setupArticleFormEvents(article = null) {
    AdminErrorHandler.safeExecute(() => {
      const form = document.getElementById('article-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleArticleSubmit(e, article));
      }

      // Gestion de l'upload PDF
      const browseBtn = document.getElementById('article-browse-btn');
      const uploadBtn = document.getElementById('article-upload-btn');
      const fileInput = document.getElementById('article-pdf-upload');
      const pdfName = document.getElementById('article-pdf-name');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
      }

      if (fileInput && pdfName) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            pdfName.textContent = file.name;
          }
        });
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => this.handlePDFUpload(fileInput, uploadBtn));
      }
    }, 'Article Form Events');
  },

  /**
   * Gère l'upload du PDF
   */
  async handlePDFUpload(fileInput, uploadBtn) {
    const file = fileInput.files[0];
    if (!file) {
      AdminErrorHandler.showErrorToUser('Veuillez sélectionner un fichier PDF', 'Upload');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload en cours...';
    uploadBtn.style.background = '#95a5a6';

    const url = await AdminMediaManager.uploadPDF(file, 'documents/articles');
    
    if (url) {
      document.getElementById('article-pdf-url').value = url;
      uploadBtn.textContent = '✅ Uploadé';
      uploadBtn.style.background = '#27ae60';
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('PDF uploadé avec succès', 'success');
      }
    } else {
      uploadBtn.textContent = 'Réessayer';
      uploadBtn.style.background = '#e74c3c';
    }
    
    uploadBtn.disabled = false;
  },

  /**
   * Gère la soumission du formulaire d'article
   */
  async handleArticleSubmit(e, existingArticle = null) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      const pdfUrl = document.getElementById('article-pdf-url').value;

      if (!existingArticle && !pdfUrl) {
        throw new Error('Un PDF est obligatoire pour un nouvel article');
      }

      const articleData = {
        id: existingArticle?.id || Date.now(),
        titre: formData.get('titre').trim(),
        date: formData.get('date'),
        categorie: formData.get('categorie').trim(),
        contenu: formData.get('contenu').trim(),
        pdfUrl: pdfUrl || existingArticle?.pdfUrl,
        dateCreation: existingArticle?.dateCreation || new Date().toISOString().split('T')[0]
      };

      // Validation
      if (!articleData.titre) {
        throw new Error('Le titre est obligatoire');
      }

      // Sauvegarder l'article
      if (existingArticle) {
        this.updateArticle(articleData);
      } else {
        this.addArticle(articleData);
      }

      // Sauvegarder les données
      await this.saveData();

      // Retourner à la liste
      this.showManageArticlesSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification(
          `Article ${existingArticle ? 'modifié' : 'ajouté'} avec succès`, 
          'success'
        );
      }
    }, 'Article Submit');
  },

  /**
   * Ajoute un article
   */
  addArticle(articleData) {
    if (!DataManager?.data) {
      throw new Error('DataManager non disponible');
    }
    
    if (!DataManager.data.articles) {
      DataManager.data.articles = [];
    }
    
    DataManager.data.articles.push(articleData);
  },

  /**
   * Met à jour un article existant
   */
  updateArticle(articleData) {
    if (!DataManager?.data?.articles) {
      throw new Error('DataManager ou articles non disponibles');
    }
    
    const index = DataManager.data.articles.findIndex(a => a.id === articleData.id);
    if (index === -1) {
      throw new Error('Article non trouvé');
    }
    
    DataManager.data.articles[index] = articleData;
  },

  /**
   * Supprime un article
   */
  async deleteArticle(articleId) {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
        return;
      }

      if (!DataManager?.data?.articles) {
        throw new Error('DataManager ou articles non disponibles');
      }

      DataManager.data.articles = DataManager.data.articles.filter(a => a.id !== articleId);
      await this.saveData();
      this.showManageArticlesSection();

      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Article supprimé avec succès', 'success');
      }
    }, 'Delete Article');
  },

  /**
   * Récupère un article par son ID
   */
  getArticleById(articleId) {
    return DataManager?.data?.articles?.find(a => a.id === articleId) || null;
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// ============================================================================
// GESTIONNAIRE DU CV
// ============================================================================
const CVManager = {
  /**
   * Affiche la section de gestion du CV
   */
  showManageCVSection() {
    AdminErrorHandler.safeExecute(() => {
      const cv = DataManager?.data?.cv || null;
      
      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Gérer votre CV
        </h3>
        
        <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;margin-bottom:20px;">
          <p>Uploadez et gérez votre CV au format PDF pour l'afficher sur votre site.</p>
        </div>

        ${cv && cv.pdfUrl ? `
          <div style="background:#e8f5e8;padding:15px;border:1px solid #c3e6c3;border-radius:5px;margin-bottom:20px;">
            <h4 style="margin:0 0 10px 0;color:#155724;">CV actuel</h4>
            <div style="margin-bottom:10px;">
              <strong>Titre:</strong> ${cv.titre || 'Mon CV'}<br>
              <strong>Dernière modification:</strong> ${cv.dateModification || 'Non spécifiée'}
            </div>
            <div style="display:flex;gap:10px;">
              <a href="${cv.pdfUrl}" target="_blank" 
                style="background:#0058a8;color:white;padding:6px 12px;text-decoration:none;border-radius:3px;">
                📄 Voir le CV
              </a>
              <button onclick="CVManager.removeCVConfirm()" 
                style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:3px;cursor:pointer;">
                Supprimer
              </button>
            </div>
          </div>
        ` : ''}

        <form id="cv-form" class="admin-form">
          <div style="margin-bottom:15px;">
            <label for="cv-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
            <input type="text" id="cv-titre" name="titre" value="${cv?.titre || 'Mon CV'}" 
              style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          </div>
          
          <div style="margin-bottom:15px;">
            <label for="cv-pdf" style="display:block;margin-bottom:5px;font-weight:bold;">
              PDF ${cv && cv.pdfUrl ? '(optionnel - laissez vide pour garder l\'actuel)' : '(obligatoire)'}
            </label>
            <input type="hidden" id="cv-pdf-url" value="${cv?.pdfUrl || ''}">
            
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:10px;">
              <input type="file" id="cv-pdf-upload" accept=".pdf" style="display:none;">
              <button type="button" id="cv-browse-btn" 
                style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
                Parcourir...
              </button>
              <button type="button" id="cv-upload-btn" 
                style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
                Upload PDF
              </button>
              <span id="cv-pdf-name" style="font-size:0.9em;color:#666;"></span>
            </div>
          </div>
          
          <div style="margin-top:20px;display:flex;gap:10px;">
            <button type="submit" 
              style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Enregistrer
            </button>
            <button type="button" onclick="AdminPanelManager.showWelcomeSection()" 
              style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
              Annuler
            </button>
          </div>
        </form>
      `;

      AdminPanelManager.updateAdminContent(html, 'manage-cv');
      this.setupCVFormEvents();
    }, 'Manage CV');
  },

  /**
   * Configure les événements du formulaire CV
   */
  setupCVFormEvents() {
    AdminErrorHandler.safeExecute(() => {
      const form = document.getElementById('cv-form');
      if (form) {
        form.addEventListener('submit', (e) => this.handleCVSubmit(e));
      }

      // Gestion de l'upload PDF
      const browseBtn = document.getElementById('cv-browse-btn');
      const uploadBtn = document.getElementById('cv-upload-btn');
      const fileInput = document.getElementById('cv-pdf-upload');
      const pdfName = document.getElementById('cv-pdf-name');

      if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', () => fileInput.click());
      }

      if (fileInput && pdfName) {
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            pdfName.textContent = file.name;
          }
        });
      }

      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => this.handlePDFUpload(fileInput, uploadBtn));
      }
    }, 'CV Form Events');
  },

  /**
   * Gère l'upload du PDF
   */
  async handlePDFUpload(fileInput, uploadBtn) {
    const file = fileInput.files[0];
    if (!file) {
      AdminErrorHandler.showErrorToUser('Veuillez sélectionner un fichier PDF', 'Upload');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Upload en cours...';
    uploadBtn.style.background = '#95a5a6';

    const url = await AdminMediaManager.uploadPDF(file, 'documents/cv');
    
    if (url) {
      document.getElementById('cv-pdf-url').value = url;
      uploadBtn.textContent = '✅ Uploadé';
      uploadBtn.style.background = '#27ae60';
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('CV uploadé avec succès', 'success');
      }
    } else {
      uploadBtn.textContent = 'Réessayer';
      uploadBtn.style.background = '#e74c3c';
    }
    
    uploadBtn.disabled = false;
  },

  /**
   * Gère la soumission du formulaire CV
   */
  async handleCVSubmit(e) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      const pdfUrl = document.getElementById('cv-pdf-url').value;
      const existingCV = DataManager?.data?.cv;

      if (!existingCV && !pdfUrl) {
        throw new Error('Un PDF est obligatoire pour le CV');
      }

      const cvData = {
        titre: formData.get('titre').trim() || 'Mon CV',
        dateModification: new Date().toISOString().split('T')[0],
        pdfUrl: pdfUrl || existingCV?.pdfUrl
      };

      // Sauvegarder le CV
      if (!DataManager.data) DataManager.data = {};
      DataManager.data.cv = cvData;

      // Sauvegarder les données
      await this.saveData();

      // Recharger l'interface
      this.showManageCVSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('CV enregistré avec succès', 'success');
      }
    }, 'CV Submit');
  },

  /**
   * Confirme la suppression du CV
   */
  async removeCVConfirm() {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer votre CV actuel ?')) {
        return;
      }

      if (DataManager?.data) {
        DataManager.data.cv = {};
        await this.saveData();
        this.showManageCVSection();
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('CV supprimé avec succès', 'success');
        }
      }
    }, 'Remove CV');
  },

  /**
   * Sauvegarde les données
   */
  async saveData() {
    if (typeof saveDataToGitHub === 'function') {
      await saveDataToGitHub();
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
    } else {
      throw new Error('Aucune méthode de sauvegarde disponible');
    }
  }
};

// ============================================================================
// GESTIONNAIRE DU TOKEN GITHUB
// ============================================================================
const GitHubManager = {
  /**
   * Affiche la section de configuration du token GitHub
   */
  showTokenSection() {
    AdminErrorHandler.safeExecute(() => {
      const currentToken = this.getCurrentToken();
      const hasToken = !!currentToken;
      
      const html = `
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          Configuration GitHub
        </h3>
        
        <div style="background:#f8f9fa;padding:15px;border:1px solid #dee2e6;border-radius:5px;margin-bottom:20px;">
          <p><strong>Configuration de la sauvegarde automatique sur GitHub</strong></p>
          <p>Pour sauvegarder automatiquement vos données sur GitHub, vous devez configurer un token d'accès personnel.</p>
          <p>Statut actuel: ${hasToken ? '<span style="color:#28a745;">✅ Token configuré</span>' : '<span style="color:#dc3545;">❌ Aucun token</span>'}</p>
        </div>

        ${hasToken ? `
          <div style="background:#e8f5e8;padding:15px;border:1px solid #c3e6c3;border-radius:5px;margin-bottom:20px;">
            <h4 style="margin:0 0 10px 0;color:#155724;">Token GitHub configuré</h4>
            <p>Token: ${this.maskToken(currentToken)}</p>
            <button onclick="GitHubManager.removeToken()" 
              style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Supprimer le token
            </button>
          </div>
        ` : ''}

        <form id="github-token-form" class="admin-form">
          <div style="margin-bottom:15px;">
            <label for="github-token" style="display:block;margin-bottom:5px;font-weight:bold;">
              Token GitHub ${hasToken ? '(nouveau token)' : ''}
            </label>
            <input type="password" id="github-token" name="token" 
              style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx">
            <small style="color:#666;">
              Le token doit avoir les permissions 'repo' pour pouvoir sauvegarder vos données.
            </small>
          </div>
          
          <div style="background:#fff3cd;border:1px solid #ffeaa7;padding:15px;border-radius:5px;margin-bottom:15px;">
            <h5 style="margin:0 0 10px 0;">Comment créer un token GitHub :</h5>
            <ol style="margin:0;">
              <li>Allez sur <a href="https://github.com/settings/tokens" target="_blank">GitHub Settings > Developer settings > Personal access tokens</a></li>
              <li>Cliquez sur "Generate new token"</li>
              <li>Donnez un nom à votre token (ex: "Site Admin")</li>
              <li>Sélectionnez la permission "repo"</li>
              <li>Copiez le token généré et collez-le ici</li>
            </ol>
          </div>
          
          <div style="margin-top:20px;display:flex;gap:10px;">
            <button type="submit" 
              style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
              ${hasToken ? 'Mettre à jour' : 'Configurer'} le token
            </button>
            <button type="button" onclick="GitHubManager.testConnection()" 
              style="background:#28a745;color:white;border:1px solid #1e7e34;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Tester la connexion
            </button>
            <button type="button" onclick="AdminPanelManager.showWelcomeSection()" 
              style="padding:6px 12px;border:1px solid #ccc;border-radius:3px;cursor:pointer;">
              Annuler
            </button>
          </div>
        </form>
      `;

      AdminPanelManager.updateAdminContent(html, 'github-token');
      this.setupTokenFormEvents();
    }, 'GitHub Token');
  },

  /**
   * Configure les événements du formulaire token
   */
  setupTokenFormEvents() {
    const form = document.getElementById('github-token-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleTokenSubmit(e));
    }
  },

  /**
   * Gère la soumission du formulaire token
   */
  async handleTokenSubmit(e) {
    e.preventDefault();
    
    return AdminErrorHandler.safeExecute(async () => {
      const formData = new FormData(e.target);
      const token = formData.get('token').trim();

      if (!token) {
        throw new Error('Veuillez saisir un token');
      }

      if (!this.validateTokenFormat(token)) {
        throw new Error('Format de token invalide (doit commencer par ghp_ ou github_pat_)');
      }

      // Tester le token
      if (!(await this.testToken(token))) {
        throw new Error('Token invalide ou sans permissions suffisantes');
      }

      // Sauvegarder le token
      this.saveToken(token);

      // Recharger l'interface
      this.showTokenSection();
      
      // Notification
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Token GitHub configuré avec succès', 'success');
      }
    }, 'Token Submit');
  },

  /**
   * Teste la connexion avec le token actuel
   */
  async testConnection() {
    return AdminErrorHandler.safeExecute(async () => {
      const token = this.getCurrentToken();
      if (!token) {
        throw new Error('Aucun token configuré');
      }

      if (await this.testToken(token)) {
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Connexion GitHub réussie !', 'success');
        } else {
          alert('Connexion GitHub réussie !');
        }
      } else {
        throw new Error('Échec de la connexion GitHub');
      }
    }, 'Test GitHub Connection');
  },

  /**
   * Teste un token GitHub
   */
  async testToken(token) {
    try {
      const response = await fetch(`https://api.github.com/repos/${AdminMediaManager.getGitHubOwner()}/${AdminMediaManager.getGitHubRepo()}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  /**
   * Valide le format d'un token
   */
  validateTokenFormat(token) {
    return /^(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]+)$/.test(token);
  },

  /**
   * Sauvegarde le token
   */
  saveToken(token) {
    try {
      localStorage.setItem('github_token', token);
      
      // Mettre à jour les configurations globales si elles existent
      if (typeof CONFIG !== 'undefined' && CONFIG.github) {
        CONFIG.github.token = token;
      }
      if (typeof GITHUB_CONFIG !== 'undefined') {
        GITHUB_CONFIG.token = token;
      }
    } catch (error) {
      throw new Error('Erreur lors de la sauvegarde du token');
    }
  },

  /**
   * Récupère le token actuel
   */
  getCurrentToken() {
    return AdminMediaManager.getGitHubToken();
  },

  /**
   * Masque un token pour l'affichage
   */
  maskToken(token) {
    if (!token) return '';
    const start = token.substring(0, 8);
    const end = token.substring(token.length - 4);
    return `${start}${'*'.repeat(token.length - 12)}${end}`;
  },

  /**
   * Supprime le token
   */
  async removeToken() {
    return AdminErrorHandler.safeExecute(async () => {
      if (!confirm('Êtes-vous sûr de vouloir supprimer le token GitHub ?')) {
        return;
      }

      localStorage.removeItem('github_token');
      
      // Mettre à jour les configurations globales
      if (typeof CONFIG !== 'undefined' && CONFIG.github) {
        CONFIG.github.token = null;
      }
      if (typeof GITHUB_CONFIG !== 'undefined') {
        GITHUB_CONFIG.token = null;
      }

      this.showTokenSection();
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Token GitHub supprimé', 'success');
      }
    }, 'Remove Token');
  }
};

// Exposer les managers restants globalement pour les event handlers
window.ArticleManager = ArticleManager;
window.CVManager = CVManager;
window.GitHubManager = GitHubManager;

// ============================================================================
// FONCTION PRINCIPALE POUR CRÉER LE PANNEAU D'ADMINISTRATION
// ============================================================================

/**
 * Remplace la fonction createAdminPanelWindow existante
 * Crée une fenêtre d'administration unifiée avec toutes les fonctionnalités
 */
function createAdminPanelWindow() {
  return AdminErrorHandler.safeExecute(() => {
    // Jouer un son d'ouverture si disponible
    if (typeof playOpenSound === 'function') {
      playOpenSound();
    }

    // Créer le contenu HTML de la fenêtre
    const content = `
      <div class="admin-panel">
        <div class="admin-toolbar">
          <button id="btn-add-film">Ajouter Film</button>
          <button id="btn-list-films">Gérer Films</button>
          <button id="btn-add-manga">Ajouter Manga</button>
          <button id="btn-list-mangas">Gérer Mangas</button>
          <button id="btn-manage-tags">Gérer Tags</button>
          <button id="btn-manage-icons">Gérer Icônes</button>
          <button id="btn-manage-articles">Gérer Articles</button>
          <button id="btn-manage-cv">Gérer CV</button>
          <button id="btn-github-token">Token GitHub</button>
        </div>
        <div id="admin-content">
          <!-- Le contenu sera rempli par AdminPanelManager -->
        </div>
      </div>
    `;

    // Créer la fenêtre avec WindowManager si disponible
    let win;
    if (typeof WindowManager !== 'undefined' && WindowManager.createWindow) {
      win = WindowManager.createWindow({
        title: 'Admin Panel - Gestion Unifiée',
        icon: 'icons/key.png',
        width: '800px',
        height: '600px',
        content: content
      });
    } else {
      // Fallback : créer une fenêtre simple
      const winId = 'adminpanel_' + Date.now();
      win = document.createElement('div');
      win.id = winId;
      win.className = 'xp-window';
      win.style.cssText = `
        position: absolute;
        width: 800px;
        height: 600px;
        left: 150px;
        top: 100px;
        z-index: 9999;
        background: #ECE9D8;
        border: 1px solid #0058a8;
        border-radius: 5px;
      `;
      
      win.innerHTML = `
        <div class="xp-titlebar" style="background: linear-gradient(to right, #0058a8, #2586e7, #83b3ec); color: white; padding: 5px 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 5px;">
            <img src="icons/key.png" alt="" style="width: 16px; height: 16px;">
            <span>Admin Panel - Gestion Unifiée</span>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
        </div>
        <div style="height: calc(100% - 35px);">
          ${content}
        </div>
      `;
      
      document.body.appendChild(win);
    }

    // Initialiser le panneau d'administration
    setTimeout(() => {
      AdminPanelManager.init();
    }, 100);

    return win;
  }, 'Create Admin Panel Window');
}

// Sauvegarder l'ancienne fonction si elle existe
if (typeof window.createAdminPanelWindow === 'function') {
  window.originalCreateAdminPanelWindow = window.createAdminPanelWindow;
}

// Remplacer la fonction globalement
window.createAdminPanelWindow = createAdminPanelWindow;

// Initialisation automatique au chargement
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎛️ Admin Panel unifié chargé avec succès');
});
