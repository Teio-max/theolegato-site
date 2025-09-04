// Enhanced Admin Panel Manager - Version optimisée
// Intégration améliorée avec WindowManager

// Gestionnaire du panneau d'administration avec API moderne
window.AdminPanelManager = {
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
    isUploading: false
  },
  
  // Initialisation du gestionnaire
  init() {
    console.log("🚀 Initialisation du gestionnaire de panneau d'administration");
    
    // Vérifier le token GitHub
    this.checkGitHubToken();
    
    // IMPORTANT: NE PAS remplacer createAdminPanelWindow ici pour éviter la récursion infinie
  },
  
  // Vérification du token GitHub
  checkGitHubToken() {
    // Récupérer le token depuis le stockage
    const token = localStorage.getItem('github_token') || sessionStorage.getItem('github_token');
    
    if (typeof window.GITHUB_CONFIG !== 'undefined') {
      window.GITHUB_CONFIG.token = token;
    }
    
    console.log(`🔑 Token GitHub ${token ? 'présent' : 'manquant'}`);
  },
  
  // Création du panneau d'administration
  createPanel(editItemId = null, itemType = 'film') {
    console.log(`📝 Création du panneau d'administration (type: ${itemType}, id: ${editItemId})`);
    
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
        // Fallback au cas où WindowManager n'est pas disponible
        console.log("⚠️ WindowManager non disponible, utilisation de la méthode alternative");
        win = this.createLegacyWindow(content);
      }
    } catch (error) {
      console.error("Erreur lors de la création de la fenêtre:", error);
      win = this.createLegacyWindow(content);
    }
    
    // Initialiser les gestionnaires d'événements après un court délai
    setTimeout(() => {
      this.initEventHandlers();
      
      // Charger l'interface appropriée selon l'état
      if (editItemId) {
        if (itemType === 'film') {
          this.loadFilmEditForm(editItemId);
        } else if (itemType === 'manga') {
          this.loadMangaEditForm(editItemId);
        }
      } else {
        this.loadDashboard();
      }
    }, 100);
    
    return win;
  },
  
  // Chargement du formulaire d'édition de film
  loadFilmEditForm(filmId) {
    if (!filmId) return this.loadFilmForm();
    this.loadFilmForm(filmId);
  },
  
  // Chargement du formulaire d'édition de manga
  loadMangaEditForm(mangaId) {
    // À implémenter
    console.log("Édition de manga à implémenter");
    this.loadDashboard();
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
          <button id="btn-add-manga" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Ajouter Manga
          </button>
          <button id="btn-list-mangas" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer Mangas
          </button>
          <button id="btn-manage-tags" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer Tags (${window.tags?.length || 0})
          </button>
          <button id="btn-manage-icons" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer Icônes
          </button>
          <button id="btn-manage-articles" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer Articles
          </button>
          <button id="btn-manage-cv" class="admin-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Gérer CV
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
    console.log("🔄 Initialisation des gestionnaires d'événements");
    
    // Boutons de la barre d'outils
    document.getElementById('btn-dashboard')?.addEventListener('click', () => this.loadDashboard());
    document.getElementById('btn-add-film')?.addEventListener('click', () => this.loadFilmForm());
    document.getElementById('btn-list-films')?.addEventListener('click', () => this.loadFilmsList());
    document.getElementById('btn-add-manga')?.addEventListener('click', () => this.loadMangaForm());
    document.getElementById('btn-list-mangas')?.addEventListener('click', () => this.loadMangasList());
    document.getElementById('btn-manage-tags')?.addEventListener('click', () => this.loadTagsManager());
    document.getElementById('btn-manage-icons')?.addEventListener('click', () => this.loadIconsManager());
    document.getElementById('btn-manage-articles')?.addEventListener('click', () => this.loadArticlesManager());
    document.getElementById('btn-github-token')?.addEventListener('click', () => this.loadTokenManager());
    document.getElementById('btn-manage-cv')?.addEventListener('click', () => this.loadCVManager());
    document.getElementById('btn-manage-cv')?.addEventListener('click', () => this.loadCVManager());
  },
  
  // Chargement du tableau de bord
  loadDashboard() {
    console.log("📊 Chargement du tableau de bord");
    this.state.activeTab = 'dashboard';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Obtenir les statistiques
    const filmCount = typeof window.films !== 'undefined' ? window.films.length : 0;
    const mangaCount = typeof window.mangas !== 'undefined' ? window.mangas.length : 0;
    const articleCount = typeof window.articles !== 'undefined' ? window.articles.length : 0;
    
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
        
        <div class="stat-card" style="flex:1;min-width:150px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Mangas</h4>
          <p style="font-size:24px;font-weight:bold;margin:5px 0;">${mangaCount}</p>
        </div>
        
        <div class="stat-card" style="flex:1;min-width:150px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;padding:15px;text-align:center;">
          <h4 style="margin-top:0;color:#333;">Articles</h4>
          <p style="font-size:24px;font-weight:bold;margin:5px 0;">${articleCount}</p>
        </div>
      </div>
      
      <h4 style="color:#333;border-bottom:1px solid #ddd;padding-bottom:5px;">Actions rapides</h4>
      <div class="quick-actions" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;">
        <button id="quick-add-film" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
          + Nouveau film
        </button>
        <button id="quick-add-manga" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
          + Nouveau manga
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
    document.getElementById('quick-add-manga')?.addEventListener('click', () => this.loadMangaForm());
    document.getElementById('quick-save-data')?.addEventListener('click', () => this.saveAllData());
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
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="film-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="film-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="film-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">Upload</button>
          </div>
          
          ${filmToEdit && filmToEdit.image ? `
          <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
            <p style="margin:0 0 5px 0;font-weight:bold;">Image actuelle:</p>
            <img src="${filmToEdit.image}" alt="Aperçu" style="max-width:200px;max-height:120px;">
          </div>
          ` : ''}
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
    // Bouton parcourir
    document.getElementById('film-browse-btn')?.addEventListener('click', () => {
      document.getElementById('film-image-upload')?.click();
    });
    
    // Bouton upload
    document.getElementById('film-upload-btn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('film-image-upload');
      if (fileInput?.files.length > 0) {
        this.uploadFilmImage();
      } else {
        this.showNotification("Veuillez d'abord sélectionner une image", 'warning');
      }
    });
    
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
  
  // Upload d'une image de film
  uploadFilmImage() {
    const fileInput = document.getElementById('film-image-upload');
    const imageInput = document.getElementById('film-image');
    
    if (!fileInput || !fileInput.files.length) {
      this.showNotification("Veuillez sélectionner une image", 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      this.showNotification("Veuillez sélectionner un fichier image valide", 'error');
      return;
    }
    
    // Vérifier le token GitHub
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      this.showNotification("Token GitHub manquant. L'upload ne sera pas persistant.", 'warning');
    }
    
    // Marquer le début de l'upload
    this.state.isUploading = true;
    this.showNotification('Upload en cours...', 'info');
    
    // Utiliser MediaManager si disponible, sinon fallback
    if (typeof window.MediaManager !== 'undefined' && typeof window.MediaManager.uploadImage === 'function') {
      window.MediaManager.uploadImage(file, 'images/films')
        .then(imageUrl => {
          if (imageUrl) {
            imageInput.value = imageUrl;
            this.showNotification('Image uploadée avec succès', 'success');
            
            // Afficher un aperçu
            this.displayImagePreview(imageUrl, imageInput);
          } else {
            throw new Error("L'upload a échoué");
          }
        })
        .catch(error => {
          console.error('Erreur upload:', error);
          this.showNotification(`Erreur: ${error.message}`, 'error');
        })
        .finally(() => {
          this.state.isUploading = false;
        });
    } else {
      // Fallback à l'ancienne méthode
      this.legacyUploadImage(file, imageInput);
    }
  },
  
  // Méthode de repli pour l'upload d'image
  legacyUploadImage(file, imageInput) {
    // Code de l'ancienne méthode d'upload
    if (typeof window.compressImage === 'function') {
      window.compressImage(file, 800, 0.85).then(compressedFile => {
        this.uploadImageToGitHub(compressedFile, file.name, imageInput);
      }).catch(error => {
        console.error('Erreur compression:', error);
        this.showNotification("Erreur lors de la compression de l'image", 'error');
        this.state.isUploading = false;
      });
    } else {
      this.uploadImageToGitHub(file, file.name, imageInput);
    }
  },
  
  // Upload d'une image sur GitHub (méthode de repli)
  uploadImageToGitHub(file, fileName, imageInput) {
    // Vérifier que la configuration GitHub est disponible
    if (typeof window.GITHUB_CONFIG === 'undefined') {
      this.showNotification("Configuration GitHub manquante", 'error');
      this.state.isUploading = false;
      return;
    }
    
    const token = window.GITHUB_CONFIG.token;
    if (!token) {
      this.showNotification("Token GitHub manquant", 'error');
      this.state.isUploading = false;
      return;
    }
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
    const uploadName = `film_${timestamp}_${safeName}`;
    const filePath = `images/films/${uploadName}`;
    
    // Convertir le fichier en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target.result.split(',')[1];
      
      // Appeler l'API GitHub
      fetch(`https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload image film: ${uploadName}`,
          content: base64Content,
          branch: window.GITHUB_CONFIG.branch || 'main'
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Mettre à jour le champ input avec l'URL
        imageInput.value = data.content.download_url;
        
        // Afficher un aperçu de l'image
        this.displayImagePreview(data.content.download_url, imageInput);
        
        // Afficher une notification
        this.showNotification('Image uploadée avec succès', 'success');
      })
      .catch(error => {
        console.error('Erreur upload:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      })
      .finally(() => {
        this.state.isUploading = false;
      });
    };
    
    reader.onerror = () => {
      this.showNotification("Erreur lors de la lecture du fichier", 'error');
      this.state.isUploading = false;
    };
    
    reader.readAsDataURL(file);
  },
  
  // Affichage d'un aperçu d'image
  displayImagePreview(imageUrl, imageInput) {
    const previewDiv = document.createElement('div');
    previewDiv.style.marginTop = '10px';
    previewDiv.style.border = '1px solid #ACA899';
    previewDiv.style.padding = '8px';
    previewDiv.style.background = '#fff';
    
    previewDiv.innerHTML = `
      <p style="margin:0 0 5px 0;font-weight:bold;">Image uploadée:</p>
      <img src="${imageUrl}" alt="Aperçu" style="max-width:200px;max-height:120px;">
    `;
    
    // Remplacer l'aperçu existant ou ajouter le nouveau
    const existingPreview = imageInput.parentElement.querySelector('div[style*="margin-top:10px"]');
    if (existingPreview) {
      imageInput.parentElement.replaceChild(previewDiv, existingPreview);
    } else {
      imageInput.parentElement.appendChild(previewDiv);
    }
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
      this.showNotification('Film sauvegardé avec succès', 'success');
      
      // Retourner à la liste des films
      this.loadFilmsList();
    } else {
      this.showNotification("Erreur: La variable 'films' n'est pas définie", 'error');
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
        this.showNotification('Film supprimé avec succès', 'success');
        
        // Actualiser la liste
        this.loadFilmsList();
      }
    }
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
      
      <div style="margin-bottom:20px;">
        <p>Un token GitHub est nécessaire pour sauvegarder les données et uploader des images.</p>
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
      
      <div style="margin-top:30px;padding:10px;background:#f5f5f5;border:1px solid #ddd;border-radius:3px;">
        <h4 style="margin-top:0;color:#333;">Comment obtenir un token GitHub</h4>
        <ol style="padding-left:20px;margin-bottom:0;">
          <li>Connectez-vous à votre compte GitHub</li>
          <li>Accédez aux paramètres de votre profil</li>
          <li>Cliquez sur "Developer settings" puis "Personal access tokens"</li>
          <li>Cliquez sur "Generate new token"</li>
          <li>Donnez un nom à votre token et sélectionnez les permissions suivantes: repo</li>
          <li>Cliquez sur "Generate token" et copiez le token généré</li>
        </ol>
      </div>
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
    
    // Valider le format du token
    if (token && !this.isValidTokenFormat(token)) {
      this.showNotification('Format de token invalide', 'error');
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
    this.showNotification('Token GitHub sauvegardé', 'success');
    
    // Retourner au tableau de bord
    this.loadDashboard();
  },
  
  // Validation du format du token GitHub
  isValidTokenFormat(token) {
    return typeof token === 'string' && 
           (token.startsWith('ghp_') || token.startsWith('github_pat_')) && 
           token.length >= 40;
  },
  
  // Sauvegarde de toutes les données
  saveAllData() {
    console.log('💾 Sauvegarde des données');
    
    // Vérifier si la fonction de sauvegarde existe
    if (typeof window.saveDataToGitHub === 'function') {
      try {
        window.saveDataToGitHub()
          .then(() => {
            this.showNotification('Données sauvegardées avec succès', 'success');
          })
          .catch(error => {
            console.error('Erreur sauvegarde:', error);
            this.showNotification(`Erreur de sauvegarde: ${error.message}`, 'error');
          });
      } catch (error) {
        console.error('Erreur lors de l\'appel à saveDataToGitHub:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      }
    } else if (typeof window.saveData === 'function') {
      try {
        window.saveData();
        this.showNotification('Données sauvegardées localement', 'success');
      } catch (error) {
        console.error('Erreur lors de l\'appel à saveData:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      }
    } else {
      console.error('Aucune fonction de sauvegarde disponible');
      this.showNotification('Erreur: Aucune fonction de sauvegarde disponible', 'error');
    }
  },
  
  // Méthodes temporaires pour les fonctionnalités non implémentées
  loadMangaForm(mangaId = null) {
    console.log(`📚 Chargement du formulaire manga (id: ${mangaId})`);
    this.state.activeTab = 'manga-form';
    this.state.editingItem = mangaId;
    this.state.itemType = 'manga';
    
    // Trouver le manga à éditer
    let mangaToEdit = null;
    if (mangaId && typeof window.mangas !== 'undefined') {
      mangaToEdit = window.mangas.find(m => m.id === mangaId);
    }
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Générer le HTML du formulaire
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${mangaId ? 'Modifier' : 'Ajouter'} un manga
      </h3>
      
      <form id="manga-form">
        <div style="margin-bottom:15px;">
          <label for="manga-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
          <input type="text" id="manga-titre" name="titre" value="${mangaToEdit ? mangaToEdit.titre || '' : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-auteur" style="display:block;margin-bottom:5px;font-weight:bold;">Auteur</label>
          <input type="text" id="manga-auteur" name="auteur" value="${mangaToEdit ? mangaToEdit.auteur || '' : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
          <input type="number" id="manga-note" name="note" min="0" max="5" value="${mangaToEdit ? mangaToEdit.note || 0 : 0}" 
            style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-volumes" style="display:block;margin-bottom:5px;font-weight:bold;">Volumes</label>
          <input type="number" id="manga-volumes" name="volumes" min="0" value="${mangaToEdit ? mangaToEdit.volumes || 0 : 0}" 
            style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
          <textarea id="manga-critique" name="critique" rows="4" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${mangaToEdit ? mangaToEdit.critique || '' : ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la couverture</label>
          <input type="text" id="manga-image" name="image" value="${mangaToEdit ? mangaToEdit.image || '' : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="manga-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="manga-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="manga-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">Upload</button>
          </div>
          
          ${mangaToEdit && mangaToEdit.image ? `
          <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
            <p style="margin:0 0 5px 0;font-weight:bold;">Image actuelle:</p>
            <img src="${mangaToEdit.image}" alt="Aperçu" style="max-width:200px;max-height:120px;">
          </div>
          ` : ''}
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="manga-tags" style="display:block;margin-bottom:5px;font-weight:bold;">Tags (séparés par des virgules)</label>
          <input type="text" id="manga-tags" name="tags" value="${mangaToEdit && mangaToEdit.tags ? mangaToEdit.tags.join(', ') : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-top:20px;">
          <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${mangaToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" id="manga-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
    
    // Ajouter les gestionnaires d'événements
    this.initMangaFormEvents(mangaId);
  },
  
  // Initialisation des événements du formulaire manga
  initMangaFormEvents(mangaId) {
    // Bouton parcourir
    document.getElementById('manga-browse-btn')?.addEventListener('click', () => {
      document.getElementById('manga-image-upload')?.click();
    });
    
    // Bouton upload
    document.getElementById('manga-upload-btn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('manga-image-upload');
      if (fileInput?.files.length > 0) {
        this.uploadMangaImage();
      } else {
        this.showNotification("Veuillez d'abord sélectionner une image", 'warning');
      }
    });
    
    // Bouton annuler
    document.getElementById('manga-cancel-btn')?.addEventListener('click', () => {
      this.loadMangasList();
    });
    
    // Formulaire
    document.getElementById('manga-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveManga(mangaId);
    });
  },
  
  // Upload d'une image de manga
  uploadMangaImage() {
    const fileInput = document.getElementById('manga-image-upload');
    const imageInput = document.getElementById('manga-image');
    
    if (!fileInput || !fileInput.files.length) {
      this.showNotification("Veuillez sélectionner une image", 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      this.showNotification("Veuillez sélectionner un fichier image valide", 'error');
      return;
    }
    
    // Vérifier le token GitHub
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      this.showNotification("Token GitHub manquant. L'upload ne sera pas persistant.", 'warning');
    }
    
    // Marquer le début de l'upload
    this.state.isUploading = true;
    this.showNotification('Upload en cours...', 'info');
    
    // Utiliser MediaManager si disponible, sinon fallback
    if (typeof window.MediaManager !== 'undefined' && typeof window.MediaManager.uploadImage === 'function') {
      window.MediaManager.uploadImage(file, 'images/mangas')
        .then(imageUrl => {
          if (imageUrl) {
            imageInput.value = imageUrl;
            this.showNotification('Image uploadée avec succès', 'success');
            
            // Afficher un aperçu
            this.displayImagePreview(imageUrl, imageInput);
          } else {
            throw new Error("L'upload a échoué");
          }
        })
        .catch(error => {
          console.error('Erreur upload:', error);
          this.showNotification(`Erreur: ${error.message}`, 'error');
        })
        .finally(() => {
          this.state.isUploading = false;
        });
    } else {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const uploadName = `manga_${timestamp}_${safeName}`;
      const filePath = `images/mangas/${uploadName}`;
      
      // Utiliser la méthode générique d'upload
      this.uploadFileToGitHub(file, filePath, imageInput, 'Image');
    }
  },
  
  // Sauvegarde d'un manga
  saveManga(mangaId) {
    // Création de l'objet manga
    const mangaData = {
      id: mangaId || 'manga_' + Date.now(),
      titre: document.getElementById('manga-titre')?.value || '',
      auteur: document.getElementById('manga-auteur')?.value || '',
      note: parseInt(document.getElementById('manga-note')?.value) || 0,
      volumes: parseInt(document.getElementById('manga-volumes')?.value) || 0,
      critique: document.getElementById('manga-critique')?.value || '',
      image: document.getElementById('manga-image')?.value || '',
      tags: document.getElementById('manga-tags')?.value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '')
    };
    
    // S'assurer que window.mangas existe
    if (typeof window.mangas === 'undefined') {
      window.mangas = [];
    }
    
    // Ajouter ou mettre à jour le manga
    if (mangaId) {
      // Mettre à jour le manga existant
      const index = window.mangas.findIndex(m => m.id === mangaId);
      if (index !== -1) {
        window.mangas[index] = mangaData;
      }
    } else {
      // Ajouter un nouveau manga
      window.mangas.push(mangaData);
    }
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Afficher une notification
    this.showNotification('Manga sauvegardé avec succès', 'success');
    
    // Retourner à la liste des mangas
    this.loadMangasList();
  },
  
  // Chargement de la liste des mangas
  loadMangasList() {
    console.log('📋 Chargement de la liste des mangas');
    this.state.activeTab = 'mangas-list';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les mangas sont disponibles
    if (typeof window.mangas === 'undefined' || !Array.isArray(window.mangas)) {
      window.mangas = [];
    }
    
    // Tri des mangas par titre
    const sortedMangas = [...window.mangas].sort((a, b) => (a.titre || '').localeCompare(b.titre || ''));
    
    // Générer le HTML de la liste
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion des mangas (${window.mangas.length})
      </h3>
      
      <div style="margin-bottom:15px;">
        <button id="add-new-manga-btn" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          + Ajouter un manga
        </button>
      </div>
      
      <div style="margin-bottom:15px;">
        <input type="text" id="manga-search" placeholder="Rechercher un manga..." 
          style="width:100%;padding:8px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      
      <div class="mangas-list" style="border:1px solid #ACA899;border-radius:3px;overflow:hidden;">
        <div style="background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 120px 80px 150px;">
          <div>Titre</div>
          <div>Auteur</div>
          <div>Note</div>
          <div>Actions</div>
        </div>
        
        <div id="mangas-container">
          ${sortedMangas.length > 0 ? sortedMangas.map(manga => `
            <div class="manga-item" data-id="${manga.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 80px 150px;align-items:center;">
              <div style="overflow:hidden;text-overflow:ellipsis;">
                ${manga.titre || 'Sans titre'}
              </div>
              <div style="overflow:hidden;text-overflow:ellipsis;">
                ${manga.auteur || '-'}
              </div>
              <div>
                ${manga.note ? '⭐'.repeat(Math.min(manga.note, 5)) : '-'}
              </div>
              <div>
                <button class="edit-manga-btn" data-id="${manga.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
                  Éditer
                </button>
                <button class="delete-manga-btn" data-id="${manga.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
                  Suppr.
                </button>
              </div>
            </div>
          `).join('') : '<div style="padding:15px;text-align:center;">Aucun manga trouvé</div>'}
        </div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('add-new-manga-btn')?.addEventListener('click', () => this.loadMangaForm());
    
    // Recherche
    document.getElementById('manga-search')?.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.filterMangasList(searchTerm);
    });
    
    // Boutons d'édition
    document.querySelectorAll('.edit-manga-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mangaId = e.target.dataset.id;
        this.loadMangaForm(mangaId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-manga-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mangaId = e.target.dataset.id;
        this.confirmDeleteManga(mangaId);
      });
    });
  },
  
  // Filtrage de la liste des mangas
  filterMangasList(searchTerm) {
    if (typeof window.mangas === 'undefined' || !Array.isArray(window.mangas)) return;
    
    const container = document.getElementById('mangas-container');
    if (!container) return;
    
    // Si le terme de recherche est vide, afficher tous les mangas
    if (!searchTerm) {
      this.loadMangasList();
      return;
    }
    
    // Filtrer les mangas par titre ou auteur
    const filteredMangas = window.mangas.filter(manga => 
      (manga.titre || '').toLowerCase().includes(searchTerm) ||
      (manga.auteur || '').toLowerCase().includes(searchTerm) ||
      (manga.critique || '').toLowerCase().includes(searchTerm)
    ).sort((a, b) => (a.titre || '').localeCompare(b.titre || ''));
    
    // Mettre à jour le contenu
    container.innerHTML = filteredMangas.length > 0 ? 
      filteredMangas.map(manga => `
        <div class="manga-item" data-id="${manga.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 80px 150px;align-items:center;">
          <div style="overflow:hidden;text-overflow:ellipsis;">
            ${manga.titre || 'Sans titre'}
          </div>
          <div style="overflow:hidden;text-overflow:ellipsis;">
            ${manga.auteur || '-'}
          </div>
          <div>
            ${manga.note ? '⭐'.repeat(Math.min(manga.note, 5)) : '-'}
          </div>
          <div>
            <button class="edit-manga-btn" data-id="${manga.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Éditer
            </button>
            <button class="delete-manga-btn" data-id="${manga.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
              Suppr.
            </button>
          </div>
        </div>
      `).join('') : 
      '<div style="padding:15px;text-align:center;">Aucun manga trouvé</div>';
    
    // Réattacher les gestionnaires d'événements
    document.querySelectorAll('.edit-manga-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mangaId = e.target.dataset.id;
        this.loadMangaForm(mangaId);
      });
    });
    
    document.querySelectorAll('.delete-manga-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mangaId = e.target.dataset.id;
        this.confirmDeleteManga(mangaId);
      });
    });
  },
  
  // Confirmation de suppression d'un manga
  confirmDeleteManga(mangaId) {
    if (typeof window.mangas === 'undefined' || !Array.isArray(window.mangas)) return;
    
    const manga = window.mangas.find(m => m.id === mangaId);
    if (!manga) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le manga "${manga.titre || 'Sans titre'}" ?`)) {
      // Supprimer le manga
      const index = window.mangas.findIndex(m => m.id === mangaId);
      if (index !== -1) {
        window.mangas.splice(index, 1);
        
        // Sauvegarder les données
        this.saveAllData();
        
        // Afficher une notification
        this.showNotification('Manga supprimé avec succès', 'success');
        
        // Actualiser la liste
        this.loadMangasList();
      }
    }
  },
  
  loadTagsManager() {
    console.log('🏷️ Chargement du gestionnaire de tags');
    this.state.activeTab = 'tags-manager';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les tags sont disponibles
    if (typeof window.tags === 'undefined') {
      window.tags = [];
    }
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion des tags (${window.tags.length})
      </h3>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="tags-list-section">
          <h4 style="color:#333;margin-top:0;">Liste des tags</h4>
          
          <div style="margin-bottom:15px;">
            <input type="text" id="tag-search" placeholder="Rechercher un tag..." 
              style="width:100%;padding:8px;border:1px solid #ACA899;border-radius:3px;">
          </div>
          
          <div class="tags-list" style="border:1px solid #ACA899;border-radius:3px;max-height:400px;overflow-y:auto;">
            <div style="background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 50px 100px;">
              <div>Nom</div>
              <div>Usages</div>
              <div>Actions</div>
            </div>
            
            <div id="tags-container">
              ${this.generateTagsList()}
            </div>
          </div>
        </div>
        
        <div class="tag-form-section">
          <h4 style="color:#333;margin-top:0;">Ajouter/Modifier un tag</h4>
          
          <form id="tag-form" style="border:1px solid #ACA899;border-radius:3px;padding:15px;background:#f8f8f8;">
            <input type="hidden" id="tag-id" value="">
            
            <div style="margin-bottom:15px;">
              <label for="tag-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom du tag</label>
              <input type="text" id="tag-name" name="name" 
                style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
            </div>
            
            <div style="margin-bottom:15px;">
              <label for="tag-category" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie</label>
              <select id="tag-category" name="category" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                <option value="genre">Genre</option>
                <option value="theme">Thème</option>
                <option value="type">Type</option>
                <option value="public">Public</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            
            <div style="margin-bottom:15px;">
              <label for="tag-color" style="display:block;margin-bottom:5px;font-weight:bold;">Couleur</label>
              <input type="color" id="tag-color" name="color" value="#3498db"
                style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
            </div>
            
            <div style="margin-top:15px;">
              <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
                Enregistrer
              </button>
              <button type="button" id="tag-reset-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
                Nouveau
              </button>
            </div>
          </form>
          
          <div style="margin-top:20px;">
            <h4 style="color:#333;">Utilisation des tags</h4>
            <p>Les tags vous permettent de classer et filtrer vos films, mangas et articles.</p>
            <p>Suggestions d'organisation:</p>
            <ul>
              <li><strong>Genres:</strong> Action, Comédie, Drame, Horreur, etc.</li>
              <li><strong>Thèmes:</strong> Amour, Guerre, Voyage, Technologie, etc.</li>
              <li><strong>Types:</strong> Film, Série, OAV, Manga, Article, etc.</li>
              <li><strong>Public:</strong> Tous publics, +12, +16, +18, etc.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    this.initTagsEvents();
  },
  
  // Génération de la liste des tags
  generateTagsList() {
    if (!window.tags || !Array.isArray(window.tags) || window.tags.length === 0) {
      return '<div style="padding:15px;text-align:center;">Aucun tag défini</div>';
    }
    
    // Calculer l'utilisation des tags
    const tagUsage = this.calculateTagUsage();
    
    // Tri des tags par nom
    const sortedTags = [...window.tags].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
    
    return sortedTags.map(tag => `
      <div class="tag-item" data-id="${tag.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 50px 100px;align-items:center;">
        <div style="display:flex;align-items:center;">
          <span style="display:inline-block;width:12px;height:12px;background-color:${tag.color || '#3498db'};margin-right:8px;border-radius:3px;"></span>
          <span style="overflow:hidden;text-overflow:ellipsis;">${tag.name || 'Sans nom'}</span>
        </div>
        <div>
          ${tagUsage[tag.id] || 0}
        </div>
        <div>
          <button class="edit-tag-btn" data-id="${tag.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Éditer
          </button>
          <button class="delete-tag-btn" data-id="${tag.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;${tagUsage[tag.id] > 0 ? 'opacity:0.5;' : ''}">
            X
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // Calcul de l'utilisation des tags
  calculateTagUsage() {
    const tagUsage = {};
    
    // Initialiser à 0 pour tous les tags
    if (window.tags && Array.isArray(window.tags)) {
      window.tags.forEach(tag => {
        tagUsage[tag.id] = 0;
      });
    }
    
    // Compter les utilisations dans les films
    if (window.films && Array.isArray(window.films)) {
      window.films.forEach(film => {
        if (film.tags && Array.isArray(film.tags)) {
          film.tags.forEach(tagId => {
            if (tagUsage[tagId] !== undefined) {
              tagUsage[tagId]++;
            }
          });
        }
      });
    }
    
    // Compter les utilisations dans les mangas
    if (window.mangas && Array.isArray(window.mangas)) {
      window.mangas.forEach(manga => {
        if (manga.tags && Array.isArray(manga.tags)) {
          manga.tags.forEach(tagId => {
            if (tagUsage[tagId] !== undefined) {
              tagUsage[tagId]++;
            }
          });
        }
      });
    }
    
    // Compter les utilisations dans les articles
    if (window.articles && Array.isArray(window.articles)) {
      window.articles.forEach(article => {
        if (article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tagId => {
            if (tagUsage[tagId] !== undefined) {
              tagUsage[tagId]++;
            }
          });
        }
      });
    }
    
    return tagUsage;
  },
  
  // Initialisation des événements pour les tags
  initTagsEvents() {
    // Formulaire de tag
    document.getElementById('tag-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTag();
    });
    
    // Bouton de réinitialisation
    document.getElementById('tag-reset-btn')?.addEventListener('click', () => {
      this.resetTagForm();
    });
    
    // Recherche de tags
    document.getElementById('tag-search')?.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.filterTagsList(searchTerm);
    });
    
    // Boutons d'édition
    document.querySelectorAll('.edit-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tagId = e.target.dataset.id;
        this.editTag(tagId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tagId = e.target.dataset.id;
        this.confirmDeleteTag(tagId);
      });
    });
  },
  
  // Réinitialisation du formulaire de tag
  resetTagForm() {
    document.getElementById('tag-id').value = '';
    document.getElementById('tag-name').value = '';
    document.getElementById('tag-category').value = 'genre';
    document.getElementById('tag-color').value = '#3498db';
  },
  
  // Édition d'un tag
  editTag(tagId) {
    if (!window.tags || !Array.isArray(window.tags)) return;
    
    const tag = window.tags.find(t => t.id === tagId);
    if (!tag) return;
    
    // Remplir le formulaire
    document.getElementById('tag-id').value = tag.id;
    document.getElementById('tag-name').value = tag.name || '';
    document.getElementById('tag-category').value = tag.category || 'genre';
    document.getElementById('tag-color').value = tag.color || '#3498db';
  },
  
  // Sauvegarde d'un tag
  saveTag() {
    const tagId = document.getElementById('tag-id').value;
    const tagName = document.getElementById('tag-name').value;
    const tagCategory = document.getElementById('tag-category').value;
    const tagColor = document.getElementById('tag-color').value;
    
    // Créer l'objet tag
    const tagData = {
      id: tagId || 'tag_' + Date.now(),
      name: tagName,
      category: tagCategory,
      color: tagColor
    };
    
    // S'assurer que window.tags existe
    if (typeof window.tags === 'undefined') {
      window.tags = [];
    }
    
    // Ajouter ou mettre à jour le tag
    if (tagId) {
      // Mettre à jour le tag existant
      const index = window.tags.findIndex(t => t.id === tagId);
      if (index !== -1) {
        window.tags[index] = tagData;
      }
    } else {
      // Ajouter un nouveau tag
      window.tags.push(tagData);
    }
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Afficher une notification
    this.showNotification('Tag sauvegardé avec succès', 'success');
    
    // Réinitialiser le formulaire
    this.resetTagForm();
    
    // Actualiser la liste des tags
    const tagsContainer = document.getElementById('tags-container');
    if (tagsContainer) {
      tagsContainer.innerHTML = this.generateTagsList();
      this.initTagsEvents();
    }
  },
  
  // Filtrage de la liste des tags
  filterTagsList(searchTerm) {
    if (!window.tags || !Array.isArray(window.tags)) return;
    
    const container = document.getElementById('tags-container');
    if (!container) return;
    
    // Si le terme de recherche est vide, afficher tous les tags
    if (!searchTerm) {
      container.innerHTML = this.generateTagsList();
      this.initTagsEvents();
      return;
    }
    
    // Filtrer les tags par nom
    const tagUsage = this.calculateTagUsage();
    const filteredTags = window.tags.filter(tag => 
      (tag.name || '').toLowerCase().includes(searchTerm) ||
      (tag.category || '').toLowerCase().includes(searchTerm)
    ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    // Mettre à jour le contenu
    if (filteredTags.length === 0) {
      container.innerHTML = '<div style="padding:15px;text-align:center;">Aucun tag trouvé</div>';
      return;
    }
    
    container.innerHTML = filteredTags.map(tag => `
      <div class="tag-item" data-id="${tag.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 50px 100px;align-items:center;">
        <div style="display:flex;align-items:center;">
          <span style="display:inline-block;width:12px;height:12px;background-color:${tag.color || '#3498db'};margin-right:8px;border-radius:3px;"></span>
          <span style="overflow:hidden;text-overflow:ellipsis;">${tag.name || 'Sans nom'}</span>
        </div>
        <div>
          ${tagUsage[tag.id] || 0}
        </div>
        <div>
          <button class="edit-tag-btn" data-id="${tag.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Éditer
          </button>
          <button class="delete-tag-btn" data-id="${tag.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;${tagUsage[tag.id] > 0 ? 'opacity:0.5;' : ''}">
            X
          </button>
        </div>
      </div>
    `).join('');
    
    // Réattacher les gestionnaires d'événements
    this.initTagsEvents();
  },
  
  // Confirmation de suppression d'un tag
  confirmDeleteTag(tagId) {
    if (!window.tags || !Array.isArray(window.tags)) return;
    
    const tag = window.tags.find(t => t.id === tagId);
    if (!tag) return;
    
    // Vérifier si le tag est utilisé
    const tagUsage = this.calculateTagUsage();
    if (tagUsage[tagId] > 0) {
      this.showNotification(`Impossible de supprimer le tag "${tag.name}" car il est utilisé ${tagUsage[tagId]} fois.`, 'warning');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?`)) {
      // Supprimer le tag
      const index = window.tags.findIndex(t => t.id === tagId);
      if (index !== -1) {
        window.tags.splice(index, 1);
        
        // Sauvegarder les données
        this.saveAllData();
        
        // Afficher une notification
        this.showNotification('Tag supprimé avec succès', 'success');
        
        // Actualiser la liste des tags
        const tagsContainer = document.getElementById('tags-container');
        if (tagsContainer) {
          tagsContainer.innerHTML = this.generateTagsList();
          this.initTagsEvents();
        }
      }
    }
  },
  
  // Gestion des articles
  loadArticlesManager() {
    console.log('📚 Chargement du gestionnaire d\'articles');
    this.state.activeTab = 'articles-manager';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les articles sont disponibles
    if (typeof window.articles === 'undefined') {
      window.articles = [];
    }
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion des articles (${window.articles.length})
      </h3>
      
      <div style="margin-bottom:15px;display:flex;gap:10px;">
        <button id="add-article-btn" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          + Ajouter un article
        </button>
        <button id="refresh-articles-btn" style="padding:6px 12px;border-radius:3px;cursor:pointer;">
          🔄 Actualiser
        </button>
      </div>
      
      <div style="margin-bottom:15px;">
        <input type="text" id="article-search" placeholder="Rechercher un article..." 
          style="width:100%;padding:8px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      
      <div class="articles-list" style="border:1px solid #ACA899;border-radius:3px;overflow:hidden;">
        <div style="background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:auto 120px 150px;">
          <div>Titre</div>
          <div>Date</div>
          <div>Actions</div>
        </div>
        
        <div id="articles-container">
          ${this.generateArticlesList()}
        </div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('add-article-btn')?.addEventListener('click', () => this.loadArticleForm());
    document.getElementById('refresh-articles-btn')?.addEventListener('click', () => this.loadArticlesManager());
    
    // Recherche
    document.getElementById('article-search')?.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      this.filterArticlesList(searchTerm);
    });
    
    // Attacher les gestionnaires aux boutons d'action
    this.attachArticleEventHandlers();
  },
  
  // Génération de la liste des articles
  generateArticlesList() {
    if (!window.articles || !Array.isArray(window.articles) || window.articles.length === 0) {
      return '<div style="padding:15px;text-align:center;">Aucun article trouvé</div>';
    }
    
    // Tri des articles par date (du plus récent au plus ancien)
    const sortedArticles = [...window.articles].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    return sortedArticles.map(article => `
      <div class="article-item" data-id="${article.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 150px;align-items:center;">
        <div style="overflow:hidden;text-overflow:ellipsis;">
          ${article.titre || 'Sans titre'}
        </div>
        <div>
          ${article.date ? new Date(article.date).toLocaleDateString() : '-'}
        </div>
        <div>
          <button class="edit-article-btn" data-id="${article.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Éditer
          </button>
          <button class="delete-article-btn" data-id="${article.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
            Suppr.
          </button>
        </div>
      </div>
    `).join('');
  },
  
  // Attacher les gestionnaires d'événements aux boutons d'articles
  attachArticleEventHandlers() {
    // Boutons d'édition
    document.querySelectorAll('.edit-article-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const articleId = e.target.dataset.id;
        this.loadArticleForm(articleId);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-article-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const articleId = e.target.dataset.id;
        this.confirmDeleteArticle(articleId);
      });
    });
  },
  
  // Filtrage de la liste des articles
  filterArticlesList(searchTerm) {
    if (!window.articles || !Array.isArray(window.articles)) return;
    
    const container = document.getElementById('articles-container');
    if (!container) return;
    
    // Si le terme de recherche est vide, afficher tous les articles
    if (!searchTerm) {
      container.innerHTML = this.generateArticlesList();
      this.attachArticleEventHandlers();
      return;
    }
    
    // Filtrer les articles par titre
    const filteredArticles = window.articles.filter(article => 
      (article.titre || '').toLowerCase().includes(searchTerm) ||
      (article.contenu || '').toLowerCase().includes(searchTerm)
    ).sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    // Mettre à jour le contenu
    if (filteredArticles.length === 0) {
      container.innerHTML = '<div style="padding:15px;text-align:center;">Aucun article trouvé</div>';
      return;
    }
    
    container.innerHTML = filteredArticles.map(article => `
      <div class="article-item" data-id="${article.id}" style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:auto 120px 150px;align-items:center;">
        <div style="overflow:hidden;text-overflow:ellipsis;">
          ${article.titre || 'Sans titre'}
        </div>
        <div>
          ${article.date ? new Date(article.date).toLocaleDateString() : '-'}
        </div>
        <div>
          <button class="edit-article-btn" data-id="${article.id}" style="padding:3px 8px;margin-right:5px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Éditer
          </button>
          <button class="delete-article-btn" data-id="${article.id}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
            Suppr.
          </button>
        </div>
      </div>
    `).join('');
    
    // Réattacher les gestionnaires d'événements
    this.attachArticleEventHandlers();
  },
  
  // Confirmation de suppression d'un article
  confirmDeleteArticle(articleId) {
    if (!window.articles || !Array.isArray(window.articles)) return;
    
    const article = window.articles.find(a => a.id === articleId);
    if (!article) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.titre || 'Sans titre'}" ?`)) {
      // Supprimer l'article
      const index = window.articles.findIndex(a => a.id === articleId);
      if (index !== -1) {
        window.articles.splice(index, 1);
        
        // Sauvegarder les données
        this.saveAllData();
        
        // Afficher une notification
        this.showNotification('Article supprimé avec succès', 'success');
        
        // Actualiser la liste
        this.loadArticlesManager();
      }
    }
  },
  
  // Chargement du formulaire d'article
  loadArticleForm(articleId = null) {
    console.log(`📝 Chargement du formulaire article (id: ${articleId})`);
    this.state.activeTab = 'article-form';
    this.state.editingItem = articleId;
    this.state.itemType = 'article';
    
    // Trouver l'article à éditer
    let articleToEdit = null;
    if (articleId && window.articles && Array.isArray(window.articles)) {
      articleToEdit = window.articles.find(a => a.id === articleId);
    }
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Générer le HTML du formulaire
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${articleId ? 'Modifier' : 'Ajouter'} un article
      </h3>
      
      <form id="article-form">
        <div style="margin-bottom:15px;">
          <label for="article-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
          <input type="text" id="article-titre" name="titre" value="${articleToEdit ? articleToEdit.titre || '' : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-type" style="display:block;margin-bottom:5px;font-weight:bold;">Type</label>
          <select id="article-type" name="type" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
            <option value="texte" ${articleToEdit && articleToEdit.type === 'texte' ? 'selected' : ''}>Texte</option>
            <option value="pdf" ${articleToEdit && articleToEdit.type === 'pdf' ? 'selected' : ''}>PDF</option>
          </select>
        </div>
        
        <div id="pdf-content-section" style="margin-bottom:15px;${articleToEdit && articleToEdit.type === 'pdf' ? '' : 'display:none;'}">
          <label for="article-pdf" style="display:block;margin-bottom:5px;font-weight:bold;">Fichier PDF</label>
          <input type="text" id="article-pdf" name="pdfUrl" value="${articleToEdit && articleToEdit.pdfUrl ? articleToEdit.pdfUrl : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="article-pdf-upload" accept="application/pdf" style="display:none;">
            <button type="button" id="article-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="article-upload-pdf-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">Upload</button>
          </div>
          
          ${articleToEdit && articleToEdit.pdfUrl ? `
          <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
            <p style="margin:0 0 5px 0;font-weight:bold;">PDF actuel:</p>
            <a href="${articleToEdit.pdfUrl}" target="_blank" style="color:#0058a8;">${articleToEdit.pdfUrl.split('/').pop()}</a>
          </div>
          ` : ''}
        </div>
        
        <div id="text-content-section" style="margin-bottom:15px;${articleToEdit && articleToEdit.type === 'pdf' ? 'display:none;' : ''}">
          <label for="article-contenu" style="display:block;margin-bottom:5px;font-weight:bold;">Contenu</label>
          <textarea id="article-contenu" name="contenu" rows="15" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;font-family:monospace;">${articleToEdit && articleToEdit.type !== 'pdf' ? articleToEdit.contenu || '' : ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="article-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image de couverture</label>
          <input type="text" id="article-image" name="image" value="${articleToEdit ? articleToEdit.image || '' : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="article-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="article-browse-image-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="article-upload-image-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">Upload</button>
          </div>
          
          ${articleToEdit && articleToEdit.image ? `
          <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
            <p style="margin:0 0 5px 0;font-weight:bold;">Image actuelle:</p>
            <img src="${articleToEdit.image}" alt="Aperçu" style="max-width:200px;max-height:120px;">
          </div>
          ` : ''}
        </div>
        
        <div style="margin-top:20px;">
          <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${articleToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          <button type="button" id="article-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
        </div>
      </form>
    `;
    
    // Ajouter les gestionnaires d'événements
    this.initArticleFormEvents(articleId);
  },
  
  // Initialisation des événements du formulaire article
  initArticleFormEvents(articleId) {
    // Changement de type d'article
    document.getElementById('article-type')?.addEventListener('change', (e) => {
      const pdfSection = document.getElementById('pdf-content-section');
      const textSection = document.getElementById('text-content-section');
      
      if (e.target.value === 'pdf') {
        pdfSection.style.display = '';
        textSection.style.display = 'none';
      } else {
        pdfSection.style.display = 'none';
        textSection.style.display = '';
      }
    });
    
    // Bouton parcourir pour PDF
    document.getElementById('article-browse-btn')?.addEventListener('click', () => {
      document.getElementById('article-pdf-upload')?.click();
    });
    
    // Bouton upload pour PDF
    document.getElementById('article-upload-pdf-btn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('article-pdf-upload');
      if (fileInput?.files.length > 0) {
        this.uploadArticlePDF();
      } else {
        this.showNotification("Veuillez d'abord sélectionner un fichier PDF", 'warning');
      }
    });
    
    // Bouton parcourir pour image
    document.getElementById('article-browse-image-btn')?.addEventListener('click', () => {
      document.getElementById('article-image-upload')?.click();
    });
    
    // Bouton upload pour image
    document.getElementById('article-upload-image-btn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('article-image-upload');
      if (fileInput?.files.length > 0) {
        this.uploadArticleImage();
      } else {
        this.showNotification("Veuillez d'abord sélectionner une image", 'warning');
      }
    });
    
    // Bouton annuler
    document.getElementById('article-cancel-btn')?.addEventListener('click', () => {
      this.loadArticlesManager();
    });
    
    // Formulaire
    document.getElementById('article-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveArticle(articleId);
    });
  },
  
  // Upload d'un PDF d'article
  uploadArticlePDF() {
    const fileInput = document.getElementById('article-pdf-upload');
    const pdfInput = document.getElementById('article-pdf');
    
    if (!fileInput || !fileInput.files.length) {
      this.showNotification("Veuillez sélectionner un fichier PDF", 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
      this.showNotification("Veuillez sélectionner un fichier PDF valide", 'error');
      return;
    }
    
    // Vérifier le token GitHub
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      this.showNotification("Token GitHub manquant. L'upload ne sera pas persistant.", 'warning');
    }
    
    // Marquer le début de l'upload
    this.state.isUploading = true;
    this.showNotification('Upload du PDF en cours...', 'info');
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const uploadName = `article_${timestamp}_${safeName}`;
    const filePath = `articles/${uploadName}`;
    
    // Utiliser la même méthode d'upload que pour les images
    this.uploadFileToGitHub(file, filePath, pdfInput, 'PDF');
  },
  
  // Upload d'une image d'article
  uploadArticleImage() {
    const fileInput = document.getElementById('article-image-upload');
    const imageInput = document.getElementById('article-image');
    
    if (!fileInput || !fileInput.files.length) {
      this.showNotification("Veuillez sélectionner une image", 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      this.showNotification("Veuillez sélectionner un fichier image valide", 'error');
      return;
    }
    
    // Vérifier le token GitHub
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      this.showNotification("Token GitHub manquant. L'upload ne sera pas persistant.", 'warning');
    }
    
    // Marquer le début de l'upload
    this.state.isUploading = true;
    this.showNotification('Upload de l\'image en cours...', 'info');
    
    // Utiliser MediaManager si disponible, sinon fallback
    if (typeof window.MediaManager !== 'undefined' && typeof window.MediaManager.uploadImage === 'function') {
      window.MediaManager.uploadImage(file, 'images/articles')
        .then(imageUrl => {
          if (imageUrl) {
            imageInput.value = imageUrl;
            this.showNotification('Image uploadée avec succès', 'success');
            
            // Afficher un aperçu
            this.displayImagePreview(imageUrl, imageInput);
          } else {
            throw new Error("L'upload a échoué");
          }
        })
        .catch(error => {
          console.error('Erreur upload:', error);
          this.showNotification(`Erreur: ${error.message}`, 'error');
        })
        .finally(() => {
          this.state.isUploading = false;
        });
    } else {
      // Fallback à l'ancienne méthode
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const uploadName = `article_${timestamp}_${safeName}`;
      const filePath = `images/articles/${uploadName}`;
      
      // Compresser l'image si possible
      if (typeof window.compressImage === 'function') {
        window.compressImage(file, 800, 0.85).then(compressedFile => {
          this.uploadFileToGitHub(compressedFile, filePath, imageInput, 'Image');
        }).catch(error => {
          console.error('Erreur compression:', error);
          this.showNotification("Erreur lors de la compression de l'image", 'error');
          this.state.isUploading = false;
        });
      } else {
        this.uploadFileToGitHub(file, filePath, imageInput, 'Image');
      }
    }
  },
  
  // Upload d'un fichier sur GitHub (méthode générique)
  uploadFileToGitHub(file, filePath, inputElement, fileType = 'Fichier') {
    // Vérifier que la configuration GitHub est disponible
    if (typeof window.GITHUB_CONFIG === 'undefined') {
      this.showNotification("Configuration GitHub manquante", 'error');
      this.state.isUploading = false;
      return;
    }
    
    const token = window.GITHUB_CONFIG.token;
    if (!token) {
      this.showNotification("Token GitHub manquant", 'error');
      this.state.isUploading = false;
      return;
    }
    
    // Convertir le fichier en base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Content = e.target.result.split(',')[1];
      
      // Appeler l'API GitHub
      fetch(`https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📝 Upload ${fileType.toLowerCase()}: ${filePath}`,
          content: base64Content,
          branch: window.GITHUB_CONFIG.branch || 'main'
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Mettre à jour le champ input avec l'URL
        inputElement.value = data.content.download_url;
        
        // Afficher un aperçu si c'est une image
        if (fileType === 'Image') {
          this.displayImagePreview(data.content.download_url, inputElement);
        } else if (fileType === 'PDF') {
          // Afficher un lien vers le PDF
          const previewDiv = document.createElement('div');
          previewDiv.style.marginTop = '10px';
          previewDiv.style.border = '1px solid #ACA899';
          previewDiv.style.padding = '8px';
          previewDiv.style.background = '#fff';
          
          previewDiv.innerHTML = `
            <p style="margin:0 0 5px 0;font-weight:bold;">PDF uploadé:</p>
            <a href="${data.content.download_url}" target="_blank" style="color:#0058a8;">${filePath.split('/').pop()}</a>
          `;
          
          // Remplacer l'aperçu existant ou ajouter le nouveau
          const existingPreview = inputElement.parentElement.querySelector('div[style*="margin-top:10px"]');
          if (existingPreview) {
            inputElement.parentElement.replaceChild(previewDiv, existingPreview);
          } else {
            inputElement.parentElement.appendChild(previewDiv);
          }
        }
        
        // Afficher une notification
        this.showNotification(`${fileType} uploadé avec succès`, 'success');
      })
      .catch(error => {
        console.error('Erreur upload:', error);
        this.showNotification(`Erreur: ${error.message}`, 'error');
      })
      .finally(() => {
        this.state.isUploading = false;
      });
    };
    
    reader.onerror = () => {
      this.showNotification("Erreur lors de la lecture du fichier", 'error');
      this.state.isUploading = false;
    };
    
    reader.readAsDataURL(file);
  },
  
  // Sauvegarde d'un article
  saveArticle(articleId) {
    const titre = document.getElementById('article-titre')?.value || '';
    const type = document.getElementById('article-type')?.value || 'texte';
    const image = document.getElementById('article-image')?.value || '';
    
    // Création de l'objet article
    const articleData = {
      id: articleId || 'article_' + Date.now(),
      titre: titre,
      type: type,
      image: image,
      date: new Date().toISOString()
    };
    
    // Ajouter des propriétés selon le type
    if (type === 'pdf') {
      articleData.pdfUrl = document.getElementById('article-pdf')?.value || '';
    } else {
      articleData.contenu = document.getElementById('article-contenu')?.value || '';
    }
    
    // S'assurer que window.articles existe
    if (typeof window.articles === 'undefined') {
      window.articles = [];
    }
    
    // Ajouter ou mettre à jour l'article
    if (articleId) {
      // Mettre à jour l'article existant
      const index = window.articles.findIndex(a => a.id === articleId);
      if (index !== -1) {
        window.articles[index] = articleData;
      }
    } else {
      // Ajouter un nouvel article
      window.articles.push(articleData);
    }
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Afficher une notification
    this.showNotification('Article sauvegardé avec succès', 'success');
    
    // Retourner à la liste des articles
    this.loadArticlesManager();
  },
  
  // Affichage d'une notification
  showNotification(message, type = 'info') {
    console.log(`📣 Notification (${type}): ${message}`);
    
    // Utiliser UIManager si disponible
    if (typeof window.UIManager !== 'undefined' && typeof window.UIManager.showNotification === 'function') {
      window.UIManager.showNotification(message, type);
    }
    // Utiliser la fonction globale si disponible
    else if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    }
    // Fallback à alert pour les erreurs
    else if (type === 'error') {
      alert(`Erreur: ${message}`);
    } else {
      // Créer une notification personnalisée pour les autres types
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px 15px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '10000';
      notification.style.maxWidth = '300px';
      notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
      notification.style.transition = 'opacity 0.3s ease';
      notification.style.opacity = '0';
      
      // Définir la couleur selon le type
      switch (type) {
        case 'success':
          notification.style.backgroundColor = '#DFF2BF';
          notification.style.color = '#4F8A10';
          notification.style.borderLeft = '4px solid #4F8A10';
          break;
        case 'warning':
          notification.style.backgroundColor = '#FEEFB3';
          notification.style.color = '#9F6000';
          notification.style.borderLeft = '4px solid #9F6000';
          break;
        case 'error':
          notification.style.backgroundColor = '#FFBABA';
          notification.style.color = '#D8000C';
          notification.style.borderLeft = '4px solid #D8000C';
          break;
        default: // info
          notification.style.backgroundColor = '#BDE5F8';
          notification.style.color = '#00529B';
          notification.style.borderLeft = '4px solid #00529B';
      }
      
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Afficher la notification
      setTimeout(() => {
        notification.style.opacity = '1';
      }, 10);
      
      // Cacher et supprimer après un délai
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  },
  
  // Gestion des icônes du bureau
  loadIconsManager() {
    console.log('🖼️ Chargement du gestionnaire d\'icônes');
    this.state.activeTab = 'icons-manager';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les icônes sont disponibles
    if (typeof window.desktopIcons === 'undefined' && typeof window.DesktopManagerAdmin !== 'undefined' && typeof window.DesktopManagerAdmin.getIcons === 'function') {
      window.desktopIcons = window.DesktopManagerAdmin.getIcons();
    } else if (typeof window.desktopIcons === 'undefined') {
      window.desktopIcons = [];
    }
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestionnaire d'icônes du bureau
      </h3>
      
      <div class="actions-bar" style="margin-bottom:15px;display:flex;gap:10px;">
        <button id="refresh-icons-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          Rafraîchir
        </button>
        <button id="add-icon-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          Ajouter une icône
        </button>
        <button id="save-icons-btn" style="padding:4px 10px;background:#4CAF50;color:white;border:1px solid #388E3C;cursor:pointer;">
          Sauvegarder
        </button>
      </div>
      
      <div id="icons-list" style="margin-top:15px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#ECE9D8;">
              <th style="padding:8px;text-align:left;border:1px solid #ACA899;">Nom</th>
              <th style="padding:8px;text-align:left;border:1px solid #ACA899;">Icône</th>
              <th style="padding:8px;text-align:left;border:1px solid #ACA899;">Action</th>
              <th style="padding:8px;text-align:center;border:1px solid #ACA899;">Actions</th>
            </tr>
          </thead>
          <tbody id="icons-table-body">
            ${this.generateIconsTableRows()}
          </tbody>
        </table>
      </div>
      
      <div id="icon-form-container" style="margin-top:20px;display:none;padding:15px;border:1px solid #ACA899;background:#f5f5f5;">
        <h4 style="margin-top:0;">Ajouter/Modifier une icône</h4>
        <form id="icon-form">
          <div style="margin-bottom:10px;">
            <label for="icon-name" style="display:block;margin-bottom:5px;">Nom de l'icône</label>
            <input type="text" id="icon-name" style="width:100%;padding:5px;border:1px solid #ACA899;">
          </div>
          
          <div style="margin-bottom:10px;">
            <label for="icon-path" style="display:block;margin-bottom:5px;">Chemin de l'icône</label>
            <input type="text" id="icon-path" style="width:100%;padding:5px;border:1px solid #ACA899;">
          </div>
          
          <div style="margin-bottom:10px;">
            <label for="icon-action" style="display:block;margin-bottom:5px;">Action (fonction JavaScript)</label>
            <input type="text" id="icon-action" style="width:100%;padding:5px;border:1px solid #ACA899;">
          </div>
          
          <div style="display:flex;gap:10px;margin-top:15px;">
            <button type="submit" style="padding:4px 10px;background:#4CAF50;color:white;border:1px solid #388E3C;cursor:pointer;">
              Enregistrer
            </button>
            <button type="button" id="cancel-icon-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
              Annuler
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('refresh-icons-btn')?.addEventListener('click', () => this.loadIconsManager());
    document.getElementById('add-icon-btn')?.addEventListener('click', () => this.showIconForm());
    document.getElementById('save-icons-btn')?.addEventListener('click', () => this.saveIcons());
    document.getElementById('cancel-icon-btn')?.addEventListener('click', () => this.hideIconForm());
    document.getElementById('icon-form')?.addEventListener('submit', (e) => this.handleIconFormSubmit(e));
    
    // Ajouter les gestionnaires pour les boutons d'édition et de suppression
    const editButtons = document.querySelectorAll('.edit-icon-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const iconId = btn.getAttribute('data-id');
        if (iconId) this.editIcon(iconId);
      });
    });
    
    const deleteButtons = document.querySelectorAll('.delete-icon-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const iconId = btn.getAttribute('data-id');
        if (iconId) this.deleteIcon(iconId);
      });
    });
  },
  
  // Générer les lignes du tableau d'icônes
  generateIconsTableRows() {
    if (!window.desktopIcons || window.desktopIcons.length === 0) {
      return '<tr><td colspan="4" style="padding:8px;text-align:center;">Aucune icône disponible</td></tr>';
    }
    
    return window.desktopIcons.map((icon, index) => `
      <tr>
        <td style="padding:8px;border:1px solid #ACA899;">${icon.name || 'Sans nom'}</td>
        <td style="padding:8px;border:1px solid #ACA899;">
          ${icon.icon ? `<img src="${icon.icon}" alt="${icon.name}" style="width:24px;height:24px;">` : 'Aucune icône'}
        </td>
        <td style="padding:8px;border:1px solid #ACA899;">${icon.action || 'Aucune action'}</td>
        <td style="padding:8px;border:1px solid #ACA899;text-align:center;">
          <button class="edit-icon-btn" data-id="${index}" style="padding:3px 8px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;margin-right:5px;">
            Éditer
          </button>
          <button class="delete-icon-btn" data-id="${index}" style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;">
            Supprimer
          </button>
        </td>
      </tr>
    `).join('');
  },
  
  // Afficher le formulaire d'icône pour l'ajout
  showIconForm() {
    const formContainer = document.getElementById('icon-form-container');
    if (formContainer) {
      formContainer.style.display = 'block';
      
      // Réinitialiser le formulaire
      document.getElementById('icon-name')?.value = '';
      document.getElementById('icon-path')?.value = '';
      document.getElementById('icon-action')?.value = '';
      
      // Supprimer l'attribut data-id s'il existe
      const form = document.getElementById('icon-form');
      if (form) form.removeAttribute('data-id');
    }
  },
  
  // Cacher le formulaire d'icône
  hideIconForm() {
    const formContainer = document.getElementById('icon-form-container');
    if (formContainer) {
      formContainer.style.display = 'none';
    }
  },
  
  // Éditer une icône existante
  editIcon(iconId) {
    const index = parseInt(iconId);
    if (isNaN(index) || !window.desktopIcons || index >= window.desktopIcons.length) return;
    
    const icon = window.desktopIcons[index];
    const formContainer = document.getElementById('icon-form-container');
    if (formContainer) {
      formContainer.style.display = 'block';
      
      // Remplir le formulaire avec les données de l'icône
      document.getElementById('icon-name')?.value = icon.name || '';
      document.getElementById('icon-path')?.value = icon.icon || '';
      document.getElementById('icon-action')?.value = icon.action || '';
      
      // Stocker l'ID pour la mise à jour
      const form = document.getElementById('icon-form');
      if (form) form.setAttribute('data-id', iconId);
    }
  },
  
  // Supprimer une icône
  deleteIcon(iconId) {
    const index = parseInt(iconId);
    if (isNaN(index) || !window.desktopIcons || index >= window.desktopIcons.length) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette icône ?')) {
      window.desktopIcons.splice(index, 1);
      this.loadIconsManager(); // Recharger pour mettre à jour l'affichage
      this.showNotification('Icône supprimée', 'success');
    }
  },
  
  // Gérer la soumission du formulaire d'icône
  handleIconFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('icon-name')?.value || '';
    const icon = document.getElementById('icon-path')?.value || '';
    const action = document.getElementById('icon-action')?.value || '';
    
    const form = document.getElementById('icon-form');
    const iconId = form?.getAttribute('data-id');
    
    if (iconId) {
      // Mise à jour
      const index = parseInt(iconId);
      if (!isNaN(index) && window.desktopIcons && index < window.desktopIcons.length) {
        window.desktopIcons[index] = { name, icon, action };
        this.showNotification('Icône mise à jour', 'success');
      }
    } else {
      // Ajout
      if (!window.desktopIcons) window.desktopIcons = [];
      window.desktopIcons.push({ name, icon, action });
      this.showNotification('Icône ajoutée', 'success');
    }
    
    this.hideIconForm();
    this.loadIconsManager(); // Recharger pour mettre à jour l'affichage
  },
  
  // Sauvegarder les icônes
  saveIcons() {
    if (typeof window.DesktopManagerAdmin !== 'undefined' && typeof window.DesktopManagerAdmin.saveIcons === 'function') {
      window.DesktopManagerAdmin.saveIcons(window.desktopIcons);
      this.showNotification('Icônes sauvegardées', 'success');
    } else {
      // Fallback si DesktopManagerAdmin n'est pas disponible
      localStorage.setItem('desktop_icons', JSON.stringify(window.desktopIcons));
      this.showNotification('Icônes sauvegardées localement', 'success');
    }
  },
  
  // Gestion du CV avec visualisation PDF
  loadCVManager() {
    console.log('📄 Chargement du gestionnaire de CV');
    this.state.activeTab = 'cv-manager';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les données CV sont disponibles
    if (typeof window.cvData === 'undefined') {
      window.cvData = {
        pdfUrl: '',
        lastUpdated: null
      };
    }
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion du CV
      </h3>
      
      <div style="margin-bottom:20px;">
        <p>Importez et gérez votre CV au format PDF. Les visiteurs pourront le consulter avec la visionneuse intégrée.</p>
      </div>
      
      <div class="cv-form" style="margin-bottom:20px;padding:15px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;">
        <div style="margin-bottom:15px;">
          <label for="cv-pdf" style="display:block;margin-bottom:5px;font-weight:bold;">Fichier PDF du CV</label>
          <input type="text" id="cv-pdf" value="${window.cvData.pdfUrl || ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="cv-pdf-upload" accept="application/pdf" style="display:none;">
            <button type="button" id="cv-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="cv-upload-btn" 
              style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">Upload</button>
          </div>
          
          ${window.cvData.pdfUrl ? `
          <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
            <p style="margin:0 0 5px 0;font-weight:bold;">CV actuel:</p>
            <a href="${window.cvData.pdfUrl}" target="_blank" style="color:#0058a8;">Voir le PDF</a>
            ${window.cvData.lastUpdated ? `<p style="margin:5px 0 0 0;font-size:small;color:#666;">Dernière mise à jour: ${new Date(window.cvData.lastUpdated).toLocaleString()}</p>` : ''}
          </div>
          ` : ''}
        </div>
        
        <button type="button" id="cv-save-btn" 
          style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer
        </button>
      </div>
      
      <div id="cv-preview" style="margin-top:20px;display:${window.cvData.pdfUrl ? 'block' : 'none'};">
        <h4 style="color:#333;border-bottom:1px solid #ddd;padding-bottom:5px;">Aperçu du CV</h4>
        <div id="pdf-viewer-container" style="width:100%;height:500px;border:1px solid #ddd;background:#f9f9f9;"></div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('cv-browse-btn')?.addEventListener('click', () => {
      document.getElementById('cv-pdf-upload')?.click();
    });
    
    document.getElementById('cv-upload-btn')?.addEventListener('click', () => {
      const fileInput = document.getElementById('cv-pdf-upload');
      if (fileInput?.files.length > 0) {
        this.uploadCV();
      } else {
        this.showNotification("Veuillez d'abord sélectionner un fichier PDF", 'warning');
      }
    });
    
    document.getElementById('cv-save-btn')?.addEventListener('click', () => {
      this.saveCV();
    });
    
    // Charger l'aperçu PDF si une URL est disponible
    if (window.cvData.pdfUrl) {
      this.loadCVPreview(window.cvData.pdfUrl);
    }
  },
  
  // Upload du CV
  uploadCV() {
    const fileInput = document.getElementById('cv-pdf-upload');
    const pdfInput = document.getElementById('cv-pdf');
    
    if (!fileInput || !fileInput.files.length) {
      this.showNotification("Veuillez sélectionner un fichier PDF", 'warning');
      return;
    }
    
    const file = fileInput.files[0];
    if (file.type !== 'application/pdf') {
      this.showNotification("Veuillez sélectionner un fichier PDF valide", 'error');
      return;
    }
    
    // Vérifier le token GitHub
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      this.showNotification("Token GitHub manquant. L'upload ne sera pas persistant.", 'warning');
    }
    
    // Marquer le début de l'upload
    this.state.isUploading = true;
    this.showNotification('Upload du CV en cours...', 'info');
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const uploadName = `cv_${timestamp}_${safeName}`;
    const filePath = `cv/${uploadName}`;
    
    // Utiliser la méthode générique d'upload
    this.uploadFileToGitHub(file, filePath, pdfInput, 'CV');
  },
  
  // Sauvegarde des données du CV
  saveCV() {
    const pdfUrl = document.getElementById('cv-pdf')?.value || '';
    
    // Mettre à jour les données
    window.cvData = {
      pdfUrl: pdfUrl,
      lastUpdated: new Date().toISOString()
    };
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Afficher une notification
    this.showNotification('Données du CV sauvegardées', 'success');
    
    // Mettre à jour l'aperçu
    if (pdfUrl) {
      document.getElementById('cv-preview').style.display = 'block';
      this.loadCVPreview(pdfUrl);
    } else {
      document.getElementById('cv-preview').style.display = 'none';
    }
  },
  
  // Chargement de l'aperçu du CV
  loadCVPreview(pdfUrl) {
    if (!pdfUrl) return;
    
    const previewContainer = document.getElementById('pdf-viewer-container');
    if (!previewContainer) return;
    
    // Vérifier si PDFManager est disponible
    if (typeof window.PDFManager === 'undefined') {
      // Charger le script PDF Manager
      const script = document.createElement('script');
      script.src = 'pdf-manager.js';
      script.onload = () => {
        // Une fois chargé, initialiser le viewer
        window.PDFManager.createCVViewer('#pdf-viewer-container', pdfUrl);
      };
      script.onerror = () => {
        this.showNotification("Erreur lors du chargement du gestionnaire PDF", 'error');
        previewContainer.innerHTML = `
          <div style="padding:20px;text-align:center;">
            <p>Impossible de charger la visionneuse PDF.</p>
            <a href="${pdfUrl}" target="_blank" style="color:#0058a8;">Ouvrir le PDF dans un nouvel onglet</a>
          </div>
        `;
      };
      document.head.appendChild(script);
    } else {
      // Utiliser le gestionnaire existant
      window.PDFManager.createCVViewer('#pdf-viewer-container', pdfUrl);
    }
  },
  
  // Création d'une fenêtre legacy (fallback)
  createLegacyWindow(content) {
    // Générer un ID unique pour la fenêtre
    const winId = 'adminpanel_' + Date.now();
    
    // Créer l'élément de fenêtre
    const win = document.createElement('div');
    win.id = winId;
    win.className = 'xp-window';
    win.style.position = 'absolute';
    win.style.width = `${this.config.defaultWidth}px`;
    win.style.height = `${this.config.defaultHeight}px`;
    win.style.left = '150px';
    win.style.top = '100px';
    win.style.zIndex = typeof window.getNextZIndex === 'function' ? window.getNextZIndex() : 9999;
    
    // Construire le contenu HTML de la fenêtre
    win.innerHTML = `
      <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">
        <span style="display:flex;align-items:center;">
          <img src="icons/key.png" alt="Admin" style="width:16px;height:16px;margin-right:6px;">
          <span>Panneau d'administration</span>
        </span>
        <div style="display:flex;">
          <span class="xp-btn min" style="margin:0 2px;cursor:pointer;" onclick="WindowManager.minimizeWindow('${winId}')">-</span>
          <span class="xp-btn max" style="margin:0 2px;cursor:pointer;" onclick="WindowManager.maximizeWindow('${winId}')">□</span>
          <span class="xp-btn close" style="margin:0 2px;cursor:pointer;" onclick="WindowManager.closeWindow('${winId}')">✖</span>
        </div>
      </div>
      
      ${content}
    `;
    
    // Ajouter la fenêtre au document
    document.body.appendChild(win);
    
    // Rendre la fenêtre draggable si la fonction existe
    if (typeof window.makeDraggable === 'function') {
      window.makeDraggable(win, winId);
    }
    
    return win;
  }
};

// Initialiser le gestionnaire quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Initialisation du gestionnaire de panneau d'administration amélioré");
  // Délai pour s'assurer que toutes les dépendances sont chargées
  setTimeout(() => {
    if (window.AdminPanelManager && typeof window.AdminPanelManager.init === 'function') {
      window.AdminPanelManager.init();
    } else {
      console.error("❌ AdminPanelManager n'est pas correctement défini ou sa méthode init n'existe pas");
    }
  }, 300);
});

// Définir une implémentation sécurisée de createAdminPanelWindow dans la portée globale
// qui ne créera pas de boucle de récursion infinie
// Désactivation douce: toujours déléguer vers AdminManager si disponible pour éviter panneaux multiples
window.createAdminPanelWindow = function(editItemId = null, itemType = 'film') {
  console.log('↪️ Redirection createAdminPanelWindow (enhanced) vers AdminManager unifié');
  if (window.AdminManager && typeof window.AdminManager.createPanel === 'function') {
    return window.AdminManager.createPanel(editItemId, itemType);
  }
  if (window.AdminPanelManager && typeof window.AdminPanelManager.createPanel === 'function') {
    return window.AdminPanelManager.createPanel(editItemId, itemType);
  }
  alert('Panneau admin indisponible');
  return null;
};
