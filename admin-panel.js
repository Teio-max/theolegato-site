/**
 * Admin Panel - Consolidated administration system
 * Replaces admin-fix-simple.js, admin-fix-window.js, and admin-functions.js
 * Provides complete management for films, mangas, tags, icons, articles, CV, and GitHub configuration
 */

// Admin Panel Configuration
const AdminConfig = {
  initialized: false,
  currentSection: 'home'
};

// Media Manager for file uploads
const AdminMediaManager = {
  // Upload an image to GitHub
  async uploadImage(file, directory = 'images/films', maxWidth = 800, quality = 0.85) {
    try {
      if (!file) throw new Error('No file provided');
      
      // Compress image first
      const compressedFile = await this.compressImage(file, maxWidth, quality);
      
      // Generate filename with timestamp
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const fileName = `film_${timestamp}_affiche.${extension}`;
      
      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Content = reader.result.split(',')[1];
            
            // Check if GitHub token is available
            const token = localStorage.getItem('github_token') || sessionStorage.getItem('github_token');
            if (!token) {
              throw new Error('Token GitHub non configuré');
            }
            
            // Upload to GitHub
            const response = await fetch(`https://api.github.com/repos/Teio-max/theolegato-site/contents/${directory}/${fileName}`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: `Upload image: ${fileName}`,
                content: base64Content,
                branch: 'main'
              })
            });
            
            if (!response.ok) {
              throw new Error(`Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            resolve(result.content.download_url);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  },

  // Compress image before upload
  compressImage(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// Main Admin Panel Class
class AdminPanel {
  constructor() {
    this.currentWindow = null;
    this.setupEventHandlers();
  }

  // Create the main admin panel window
  createWindow() {
    console.log("🔧 Creating consolidated admin panel window");
    
    const content = `
      <div class="admin-panel">
        <div class="admin-toolbar">
          <button id="btn-add-film" data-section="add-film">Ajouter Film</button>
          <button id="btn-manage-films" data-section="manage-films">Gérer Films</button>
          <button id="btn-add-manga" data-section="add-manga">Ajouter Manga</button>
          <button id="btn-manage-mangas" data-section="manage-mangas">Gérer Mangas</button>
          <button id="btn-manage-tags" data-section="manage-tags">Gérer Tags</button>
          <button id="btn-manage-icons" data-section="manage-icons">Gérer Icônes</button>
          <button id="btn-manage-articles" data-section="manage-articles">Gérer Articles</button>
          <button id="btn-manage-cv" data-section="manage-cv">Gérer CV</button>
          <button id="btn-github-config" data-section="github-config">Config GitHub</button>
        </div>
        
        <div id="admin-content">
          <h3>Administration du site</h3>
          <p>Bienvenue dans le panneau d'administration unifié. Utilisez les boutons ci-dessus pour gérer le contenu du site.</p>
        </div>
      </div>
    `;

    try {
      this.currentWindow = WindowManager.createWindow({
        title: 'Admin Panel - Gestion Complète',
        icon: 'icons/key.png',
        width: '900px',
        height: '650px',
        content: content
      });

      // Setup event handlers after window creation
      setTimeout(() => this.setupWindowEventHandlers(), 100);
      
      return this.currentWindow;
    } catch (error) {
      console.error('Error creating admin window:', error);
      return null;
    }
  }

  // Setup event handlers for the admin panel
  setupEventHandlers() {
    // Global event handlers can be set up here if needed
  }

  // Setup event handlers for window controls
  setupWindowEventHandlers() {
    const toolbar = document.querySelector('.admin-toolbar');
    if (!toolbar) return;

    toolbar.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' && e.target.dataset.section) {
        this.showSection(e.target.dataset.section);
        
        // Update active button
        toolbar.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      }
    });
  }

  // Show different sections of the admin panel
  showSection(section) {
    const content = document.getElementById('admin-content');
    if (!content) return;

    AdminConfig.currentSection = section;

    switch (section) {
      case 'add-film':
        this.showAddFilmForm(content);
        break;
      case 'manage-films':
        this.showManageFilms(content);
        break;
      case 'add-manga':
        this.showAddMangaForm(content);
        break;
      case 'manage-mangas':
        this.showManageMangas(content);
        break;
      case 'manage-tags':
        this.showManageTags(content);
        break;
      case 'manage-icons':
        this.showManageIcons(content);
        break;
      case 'manage-articles':
        this.showManageArticles(content);
        break;
      case 'manage-cv':
        this.showManageCV(content);
        break;
      case 'github-config':
        this.showGitHubConfig(content);
        break;
      default:
        this.showHome(content);
    }
  }

  // Show home/welcome screen
  showHome(content) {
    content.innerHTML = `
      <h3>Administration du site</h3>
      <p>Bienvenue dans le panneau d'administration unifié. Utilisez les boutons ci-dessus pour gérer le contenu du site.</p>
      <div style="margin-top: 20px;">
        <h4>Fonctionnalités disponibles :</h4>
        <ul>
          <li><strong>Gestion des Films :</strong> Ajout, modification, suppression avec images et critiques</li>
          <li><strong>Gestion des Mangas :</strong> Ajout, modification, suppression avec métadonnées complètes</li>
          <li><strong>Gestion des Tags :</strong> Organisation par catégories</li>
          <li><strong>Gestion des Icônes :</strong> Personnalisation du bureau</li>
          <li><strong>Gestion des Articles :</strong> Upload PDF avec visualisation</li>
          <li><strong>Gestion du CV :</strong> Upload et visualisation PDF</li>
          <li><strong>Configuration GitHub :</strong> Token pour sauvegarde automatique</li>
        </ul>
      </div>
    `;
  }

  // Show add film form
  showAddFilmForm(content, editFilmId = null) {
    const isEdit = editFilmId !== null;
    let filmData = {};
    
    if (isEdit && DataManager.data.films) {
      filmData = DataManager.data.films.find(f => f.id === editFilmId) || {};
    }

    content.innerHTML = `
      <h3>${isEdit ? 'Modifier' : 'Ajouter'} un film</h3>
      <form id="film-form">
        <div class="form-group">
          <label for="film-title">Titre *</label>
          <input type="text" id="film-title" value="${filmData.titre || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="film-note">Note (1-5)</label>
          <select id="film-note">
            ${[0,1,2,3,4,5].map(n => `<option value="${n}" ${filmData.note === n ? 'selected' : ''}>${n === 0 ? 'Non notée' : '★'.repeat(n)}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="film-critique">Critique</label>
          <textarea id="film-critique" rows="4">${filmData.critique || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label>Image d'affiche</label>
          <div class="image-upload">
            <input type="file" id="film-image-file" accept="image/*" style="display: none;">
            <button type="button" id="film-browse-btn">Sélectionner une image</button>
            <button type="button" id="film-upload-btn">Uploader</button>
            <span id="film-image-status"></span>
          </div>
          <input type="hidden" id="film-image-url" value="${filmData.image || ''}">
          ${filmData.image ? `<img src="${filmData.image}" alt="Aperçu" style="max-width: 200px; margin-top: 10px;">` : ''}
        </div>
        
        <div class="form-group">
          <label for="film-trailer">Bande-annonce (URL)</label>
          <input type="url" id="film-trailer" value="${filmData.bandeAnnonce || ''}">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'} le film</button>
          <button type="button" class="btn-secondary" onclick="AdminPanel.instance.showSection('manage-films')">Annuler</button>
        </div>
      </form>
    `;

    this.setupFilmFormHandlers(isEdit, editFilmId);
  }

  // Setup film form event handlers
  setupFilmFormHandlers(isEdit, editFilmId) {
    const form = document.getElementById('film-form');
    const browseBtn = document.getElementById('film-browse-btn');
    const uploadBtn = document.getElementById('film-upload-btn');
    const fileInput = document.getElementById('film-image-file');
    const imageStatus = document.getElementById('film-image-status');

    // File browse handler
    browseBtn?.addEventListener('click', () => fileInput.click());

    // File upload handler
    uploadBtn?.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Veuillez sélectionner une image d\'abord.');
        return;
      }

      try {
        imageStatus.textContent = 'Upload en cours...';
        uploadBtn.disabled = true;
        
        const imageUrl = await AdminMediaManager.uploadImage(file, 'images/films');
        
        document.getElementById('film-image-url').value = imageUrl;
        imageStatus.innerHTML = `<span style="color: green;">✓ Image uploadée avec succès</span>`;
        
        // Show preview
        const existingPreview = content.querySelector('img[alt="Aperçu"]');
        if (existingPreview) {
          existingPreview.src = imageUrl;
        } else {
          imageStatus.innerHTML += `<br><img src="${imageUrl}" alt="Aperçu" style="max-width: 200px; margin-top: 10px;">`;
        }
      } catch (error) {
        imageStatus.innerHTML = `<span style="color: red;">❌ Erreur: ${error.message}</span>`;
      } finally {
        uploadBtn.disabled = false;
      }
    });

    // Form submit handler
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveFilm(isEdit, editFilmId);
    });
  }

  // Save film data
  saveFilm(isEdit, editFilmId) {
    const filmData = {
      id: isEdit ? editFilmId : Date.now(),
      titre: document.getElementById('film-title').value,
      note: parseInt(document.getElementById('film-note').value) || 0,
      critique: document.getElementById('film-critique').value,
      image: document.getElementById('film-image-url').value,
      bandeAnnonce: document.getElementById('film-trailer').value,
      galerie: isEdit ? (DataManager.data.films.find(f => f.id === editFilmId)?.galerie || []) : [],
      liens: isEdit ? (DataManager.data.films.find(f => f.id === editFilmId)?.liens || []) : []
    };

    try {
      if (!DataManager.data.films) {
        DataManager.data.films = [];
      }

      if (isEdit) {
        const index = DataManager.data.films.findIndex(f => f.id === editFilmId);
        if (index !== -1) {
          DataManager.data.films[index] = filmData;
        }
      } else {
        DataManager.data.films.push(filmData);
      }

      // Save data
      this.saveData();
      
      // Show success message
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification(`Film ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
      } else {
        alert(`Film ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
      }

      // Return to film management
      this.showSection('manage-films');
      
    } catch (error) {
      console.error('Error saving film:', error);
      alert('Erreur lors de la sauvegarde du film');
    }
  }

  // Show manage films section
  showManageFilms(content) {
    const films = DataManager.data.films || [];
    
    let filmsHTML = `
      <h3>Gérer les films</h3>
      <div style="margin-bottom: 15px;">
        <button class="btn-primary" onclick="AdminPanel.instance.showSection('add-film')">Ajouter un nouveau film</button>
      </div>
    `;

    if (films.length > 0) {
      filmsHTML += `
        <table class="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Note</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      films.forEach(film => {
        const stars = '★'.repeat(film.note) + '☆'.repeat(5 - film.note);
        filmsHTML += `
          <tr>
            <td>${film.titre}</td>
            <td>${stars}</td>
            <td>${film.image ? `<img src="${film.image}" alt="${film.titre}" style="max-width: 50px; max-height: 50px;">` : 'Aucune'}</td>
            <td>
              <button class="btn-edit" onclick="AdminPanel.instance.showAddFilmForm(document.getElementById('admin-content'), ${film.id})">Modifier</button>
              <button class="btn-delete" onclick="AdminPanel.instance.deleteFilm(${film.id})">Supprimer</button>
            </td>
          </tr>
        `;
      });

      filmsHTML += '</tbody></table>';
    } else {
      filmsHTML += '<p>Aucun film trouvé dans la base de données.</p>';
    }

    content.innerHTML = filmsHTML;
  }

  // Delete film
  deleteFilm(filmId) {
    const film = DataManager.data.films?.find(f => f.id === filmId);
    if (!film) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le film "${film.titre}" ?`)) {
      DataManager.data.films = DataManager.data.films.filter(f => f.id !== filmId);
      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification('Film supprimé avec succès', 'success');
      } else {
        alert('Film supprimé avec succès');
      }
      
      this.showSection('manage-films');
    }
  }

  // Show add manga form
  showAddMangaForm(content, editMangaId = null) {
    const isEdit = editMangaId !== null;
    let mangaData = {};
    
    if (isEdit && DataManager.data.mangas) {
      mangaData = DataManager.data.mangas.find(m => m.id === editMangaId) || {};
    }

    content.innerHTML = `
      <h3>${isEdit ? 'Modifier' : 'Ajouter'} un manga</h3>
      <form id="manga-form">
        <div class="form-group">
          <label for="manga-title">Titre *</label>
          <input type="text" id="manga-title" value="${mangaData.titre || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="manga-author">Auteur</label>
          <input type="text" id="manga-author" value="${mangaData.auteur || ''}">
        </div>
        
        <div class="form-group">
          <label for="manga-note">Note (1-5)</label>
          <select id="manga-note">
            ${[0,1,2,3,4,5].map(n => `<option value="${n}" ${mangaData.note === n ? 'selected' : ''}>${n === 0 ? 'Non notée' : '★'.repeat(n)}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="manga-status">Statut</label>
          <select id="manga-status">
            <option value="En cours" ${mangaData.statut === 'En cours' ? 'selected' : ''}>En cours</option>
            <option value="Terminé" ${mangaData.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
            <option value="Abandonné" ${mangaData.statut === 'Abandonné' ? 'selected' : ''}>Abandonné</option>
            <option value="En attente" ${mangaData.statut === 'En attente' ? 'selected' : ''}>En attente</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="manga-chapters">Nombre de chapitres</label>
          <input type="number" id="manga-chapters" value="${mangaData.chapitres || 0}" min="0">
        </div>
        
        <div class="form-group">
          <label for="manga-critique">Critique</label>
          <textarea id="manga-critique" rows="4">${mangaData.critique || ''}</textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'} le manga</button>
          <button type="button" class="btn-secondary" onclick="AdminPanel.instance.showSection('manage-mangas')">Annuler</button>
        </div>
      </form>
    `;

    this.setupMangaFormHandlers(isEdit, editMangaId);
  }

  // Setup manga form handlers
  setupMangaFormHandlers(isEdit, editMangaId) {
    const form = document.getElementById('manga-form');
    
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveManga(isEdit, editMangaId);
    });
  }

  // Save manga data
  saveManga(isEdit, editMangaId) {
    const mangaData = {
      id: isEdit ? editMangaId : Date.now(),
      titre: document.getElementById('manga-title').value,
      auteur: document.getElementById('manga-author').value,
      note: parseInt(document.getElementById('manga-note').value) || 0,
      statut: document.getElementById('manga-status').value,
      chapitres: parseInt(document.getElementById('manga-chapters').value) || 0,
      critique: document.getElementById('manga-critique').value,
      image: isEdit ? (DataManager.data.mangas.find(m => m.id === editMangaId)?.image || '') : '',
      galerie: isEdit ? (DataManager.data.mangas.find(m => m.id === editMangaId)?.galerie || []) : [],
      genre: isEdit ? (DataManager.data.mangas.find(m => m.id === editMangaId)?.genre || []) : []
    };

    try {
      if (!DataManager.data.mangas) {
        DataManager.data.mangas = [];
      }

      if (isEdit) {
        const index = DataManager.data.mangas.findIndex(m => m.id === editMangaId);
        if (index !== -1) {
          DataManager.data.mangas[index] = mangaData;
        }
      } else {
        DataManager.data.mangas.push(mangaData);
      }

      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification(`Manga ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
      } else {
        alert(`Manga ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
      }

      this.showSection('manage-mangas');
      
    } catch (error) {
      console.error('Error saving manga:', error);
      alert('Erreur lors de la sauvegarde du manga');
    }
  }

  // Show manage mangas section
  showManageMangas(content) {
    const mangas = DataManager.data.mangas || [];
    
    let mangasHTML = `
      <h3>Gérer les mangas</h3>
      <div style="margin-bottom: 15px;">
        <button class="btn-primary" onclick="AdminPanel.instance.showSection('add-manga')">Ajouter un nouveau manga</button>
      </div>
    `;

    if (mangas.length > 0) {
      mangasHTML += `
        <table class="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Note</th>
              <th>Statut</th>
              <th>Chapitres</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      mangas.forEach(manga => {
        const stars = '★'.repeat(manga.note) + '☆'.repeat(5 - manga.note);
        mangasHTML += `
          <tr>
            <td>${manga.titre}</td>
            <td>${manga.auteur || 'Non spécifié'}</td>
            <td>${stars}</td>
            <td>${manga.statut}</td>
            <td>${manga.chapitres}</td>
            <td>
              <button class="btn-edit" onclick="AdminPanel.instance.showAddMangaForm(document.getElementById('admin-content'), ${manga.id})">Modifier</button>
              <button class="btn-delete" onclick="AdminPanel.instance.deleteManga(${manga.id})">Supprimer</button>
            </td>
          </tr>
        `;
      });

      mangasHTML += '</tbody></table>';
    } else {
      mangasHTML += '<p>Aucun manga trouvé dans la base de données.</p>';
    }

    content.innerHTML = mangasHTML;
  }

  // Delete manga
  deleteManga(mangaId) {
    const manga = DataManager.data.mangas?.find(m => m.id === mangaId);
    if (!manga) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le manga "${manga.titre}" ?`)) {
      DataManager.data.mangas = DataManager.data.mangas.filter(m => m.id !== mangaId);
      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification('Manga supprimé avec succès', 'success');
      } else {
        alert('Manga supprimé avec succès');
      }
      
      this.showSection('manage-mangas');
    }
  }

  // Show manage tags section
  showManageTags(content) {
    const tags = DataManager.data.tags || [];
    
    content.innerHTML = `
      <h3>Gérer les tags</h3>
      <div style="margin-bottom: 15px;">
        <form id="add-tag-form" style="display: inline-flex; gap: 10px; align-items: center;">
          <input type="text" id="new-tag-name" placeholder="Nom du tag" required>
          <input type="color" id="new-tag-color" value="#0058a8" title="Couleur du tag">
          <button type="submit" class="btn-primary">Ajouter Tag</button>
        </form>
      </div>
      
      <div class="tags-container">
        ${tags.length > 0 ? this.renderTagsList(tags) : '<p>Aucun tag créé pour le moment.</p>'}
      </div>
    `;

    this.setupTagsHandlers();
  }

  // Render tags list
  renderTagsList(tags) {
    return `
      <div class="tags-list">
        ${tags.map(tag => `
          <div class="tag-item" style="background-color: ${tag.color}20; border: 1px solid ${tag.color};">
            <span class="tag-name" style="color: ${tag.color};">${tag.name}</span>
            <button class="btn-delete-small" onclick="AdminPanel.instance.deleteTag('${tag.id}')" title="Supprimer">×</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Setup tags handlers
  setupTagsHandlers() {
    const form = document.getElementById('add-tag-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTag();
    });
  }

  // Add new tag
  addTag() {
    const name = document.getElementById('new-tag-name').value.trim();
    const color = document.getElementById('new-tag-color').value;
    
    if (!name) return;

    const tag = {
      id: Date.now().toString(),
      name: name,
      color: color,
      created: new Date().toISOString()
    };

    if (!DataManager.data.tags) {
      DataManager.data.tags = [];
    }

    // Check if tag already exists
    if (DataManager.data.tags.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      alert('Ce tag existe déjà');
      return;
    }

    DataManager.data.tags.push(tag);
    this.saveData();
    
    if (UIManager && UIManager.showNotification) {
      UIManager.showNotification('Tag ajouté avec succès', 'success');
    }

    this.showSection('manage-tags');
  }

  // Delete tag
  deleteTag(tagId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tag ?')) {
      DataManager.data.tags = DataManager.data.tags.filter(t => t.id !== tagId);
      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification('Tag supprimé avec succès', 'success');
      }
      
      this.showSection('manage-tags');
    }
  }

  // Show manage icons section
  showManageIcons(content) {
    content.innerHTML = `
      <h3>Gérer les icônes du bureau</h3>
      <p>Cette section permet de personnaliser les icônes affichées sur le bureau.</p>
      <div class="info-box">
        <h4>Fonctionnalités en développement :</h4>
        <ul>
          <li>Ajout d'icônes personnalisées</li>
          <li>Réorganisation des icônes</li>
          <li>Personnalisation des liens</li>
          <li>Gestion des permissions d'accès</li>
        </ul>
      </div>
      <p><em>Cette fonctionnalité sera implémentée dans une prochaine version.</em></p>
    `;
  }

  // Show manage articles section
  showManageArticles(content) {
    const articles = DataManager.data.articles || [];
    
    content.innerHTML = `
      <h3>Gérer les articles PDF</h3>
      <div style="margin-bottom: 15px;">
        <button class="btn-primary" onclick="AdminPanel.instance.showAddArticleForm()">Ajouter un nouvel article</button>
      </div>
      
      <div class="articles-container">
        ${articles.length > 0 ? this.renderArticlesList(articles) : '<p>Aucun article n\'a été ajouté pour le moment.</p>'}
      </div>
    `;
  }

  // Render articles list
  renderArticlesList(articles) {
    return `
      <div class="articles-list">
        ${articles.map(article => `
          <div class="article-item">
            <h4>${article.titre}</h4>
            <p><strong>Date:</strong> ${article.date || 'Non spécifiée'}</p>
            <p><strong>Catégorie:</strong> ${article.categorie || 'Non classé'}</p>
            <p>${article.contenu || 'Pas de description disponible.'}</p>
            <div class="article-actions">
              <button class="btn-primary" onclick="AdminPanel.instance.openArticlePdf('${article.pdfUrl}')">Lire l'article</button>
              <button class="btn-edit" onclick="AdminPanel.instance.editArticle(${article.id})">Modifier</button>
              <button class="btn-delete" onclick="AdminPanel.instance.deleteArticle(${article.id})">Supprimer</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Show add article form
  showAddArticleForm(editId = null) {
    const content = document.getElementById('admin-content');
    const isEdit = editId !== null;
    let articleData = {};
    
    if (isEdit && DataManager.data.articles) {
      articleData = DataManager.data.articles.find(a => a.id === editId) || {};
    }

    content.innerHTML = `
      <h3>${isEdit ? 'Modifier' : 'Ajouter'} un article</h3>
      <form id="article-form">
        <div class="form-group">
          <label for="article-title">Titre *</label>
          <input type="text" id="article-title" value="${articleData.titre || ''}" required>
        </div>
        
        <div class="form-group">
          <label for="article-category">Catégorie</label>
          <input type="text" id="article-category" value="${articleData.categorie || ''}">
        </div>
        
        <div class="form-group">
          <label for="article-content">Description</label>
          <textarea id="article-content" rows="3">${articleData.contenu || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label>PDF de l'article</label>
          <div class="file-upload">
            <input type="file" id="article-pdf-file" accept="application/pdf" style="display: none;">
            <button type="button" id="article-browse-btn">Sélectionner un PDF</button>
            <button type="button" id="article-upload-btn">Uploader</button>
            <span id="article-pdf-status"></span>
          </div>
          <input type="hidden" id="article-pdf-url" value="${articleData.pdfUrl || ''}">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">${isEdit ? 'Mettre à jour' : 'Ajouter'} l'article</button>
          <button type="button" class="btn-secondary" onclick="AdminPanel.instance.showSection('manage-articles')">Annuler</button>
        </div>
      </form>
    `;

    this.setupArticleFormHandlers(isEdit, editId);
  }

  // Setup article form handlers
  setupArticleFormHandlers(isEdit, editId) {
    const form = document.getElementById('article-form');
    const browseBtn = document.getElementById('article-browse-btn');
    const uploadBtn = document.getElementById('article-upload-btn');
    const fileInput = document.getElementById('article-pdf-file');
    const pdfStatus = document.getElementById('article-pdf-status');

    browseBtn?.addEventListener('click', () => fileInput.click());

    uploadBtn?.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Veuillez sélectionner un fichier PDF d\'abord.');
        return;
      }

      // For now, show a placeholder - PDF upload would need specific implementation
      pdfStatus.innerHTML = '<span style="color: orange;">⚠️ Upload PDF en cours d\'implémentation</span>';
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveArticle(isEdit, editId);
    });
  }

  // Save article
  saveArticle(isEdit, editId) {
    const articleData = {
      id: isEdit ? editId : Date.now(),
      titre: document.getElementById('article-title').value,
      categorie: document.getElementById('article-category').value,
      contenu: document.getElementById('article-content').value,
      pdfUrl: document.getElementById('article-pdf-url').value,
      date: isEdit ? (DataManager.data.articles.find(a => a.id === editId)?.date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0]
    };

    try {
      if (!DataManager.data.articles) {
        DataManager.data.articles = [];
      }

      if (isEdit) {
        const index = DataManager.data.articles.findIndex(a => a.id === editId);
        if (index !== -1) {
          DataManager.data.articles[index] = articleData;
        }
      } else {
        DataManager.data.articles.push(articleData);
      }

      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification(`Article ${isEdit ? 'modifié' : 'ajouté'} avec succès`, 'success');
      } else {
        alert(`Article ${isEdit ? 'modifié' : 'ajouté'} avec succès`);
      }

      this.showSection('manage-articles');
      
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Erreur lors de la sauvegarde de l\'article');
    }
  }

  // Open article PDF
  openArticlePdf(pdfUrl) {
    if (!pdfUrl) {
      alert("Erreur: URL du PDF non disponible.");
      return;
    }
    
    WindowManager.createWindow({
      title: 'Lecture d\'article',
      icon: 'icons/article.png',
      width: '800px',
      height: '600px',
      content: `
        <div style="width:100%;height:100%;overflow:hidden;">
          <iframe src="${pdfUrl}" style="width:100%;height:100%;border:none;"></iframe>
        </div>
      `
    });
  }

  // Edit article
  editArticle(articleId) {
    this.showAddArticleForm(articleId);
  }

  // Delete article
  deleteArticle(articleId) {
    const article = DataManager.data.articles?.find(a => a.id === articleId);
    if (!article) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.titre}" ?`)) {
      DataManager.data.articles = DataManager.data.articles.filter(a => a.id !== articleId);
      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification('Article supprimé avec succès', 'success');
      } else {
        alert('Article supprimé avec succès');
      }
      
      this.showSection('manage-articles');
    }
  }

  // Show manage CV section
  showManageCV(content) {
    const cvData = DataManager.data.cv || {};
    const hasCv = cvData.pdfUrl && cvData.pdfUrl.length > 0;

    content.innerHTML = `
      <h3>Gérer votre CV</h3>
      
      ${hasCv ? `
        <div class="current-cv">
          <h4>CV actuel</h4>
          <p><strong>Titre:</strong> ${cvData.titre}</p>
          <p><strong>Dernière modification:</strong> ${cvData.dateModification}</p>
          <div style="margin: 10px 0;">
            <button class="btn-primary" onclick="AdminPanel.instance.openCvPdf('${cvData.pdfUrl}')">Visualiser le CV</button>
          </div>
        </div>
      ` : '<p>Aucun CV n\'a encore été ajouté.</p>'}
      
      <h4>${hasCv ? 'Mettre à jour votre CV' : 'Ajouter votre CV'}</h4>
      
      <form id="cv-form">
        <div class="form-group">
          <label for="cv-title">Titre/Description</label>
          <input type="text" id="cv-title" value="${cvData.titre || 'Mon CV'}">
        </div>
        
        <div class="form-group">
          <label>Fichier PDF du CV</label>
          <div class="file-upload">
            <input type="file" id="cv-pdf-file" accept="application/pdf" style="display: none;">
            <button type="button" id="cv-browse-btn">Sélectionner un PDF</button>
            <button type="button" id="cv-upload-btn">Uploader</button>
            <span id="cv-pdf-status"></span>
          </div>
          <input type="hidden" id="cv-pdf-url" value="${cvData.pdfUrl || ''}">
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">Enregistrer le CV</button>
        </div>
      </form>
    `;

    this.setupCVFormHandlers();
  }

  // Setup CV form handlers
  setupCVFormHandlers() {
    const form = document.getElementById('cv-form');
    const browseBtn = document.getElementById('cv-browse-btn');
    const uploadBtn = document.getElementById('cv-upload-btn');
    const fileInput = document.getElementById('cv-pdf-file');
    const pdfStatus = document.getElementById('cv-pdf-status');

    browseBtn?.addEventListener('click', () => fileInput.click());

    uploadBtn?.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert('Veuillez sélectionner un fichier PDF d\'abord.');
        return;
      }

      // For now, show a placeholder - PDF upload would need specific implementation
      pdfStatus.innerHTML = '<span style="color: orange;">⚠️ Upload PDF en cours d\'implémentation</span>';
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCV();
    });
  }

  // Save CV
  saveCV() {
    const pdfUrl = document.getElementById('cv-pdf-url').value;
    const currentCv = DataManager.data.cv || {};
    
    if (!pdfUrl && !currentCv.pdfUrl) {
      alert("Veuillez uploader un PDF pour votre CV.");
      return;
    }

    const cvData = {
      titre: document.getElementById('cv-title').value || 'Mon CV',
      dateModification: new Date().toISOString().split('T')[0],
      pdfUrl: pdfUrl || currentCv.pdfUrl
    };

    try {
      DataManager.data.cv = cvData;
      this.saveData();
      
      if (UIManager && UIManager.showNotification) {
        UIManager.showNotification('CV enregistré avec succès', 'success');
      } else {
        alert('CV enregistré avec succès');
      }

      this.showSection('manage-cv');
      
    } catch (error) {
      console.error('Error saving CV:', error);
      alert('Erreur lors de la sauvegarde du CV');
    }
  }

  // Open CV PDF
  openCvPdf(pdfUrl) {
    if (!pdfUrl) {
      alert("Erreur: URL du PDF non disponible.");
      return;
    }
    
    WindowManager.createWindow({
      title: 'Mon CV',
      icon: 'icons/cv.png',
      width: '800px',
      height: '600px',
      content: `
        <div style="width:100%;height:100%;overflow:hidden;">
          <iframe src="${pdfUrl}" style="width:100%;height:100%;border:none;"></iframe>
        </div>
      `
    });
  }

  // Show GitHub configuration section
  showGitHubConfig(content) {
    const currentToken = localStorage.getItem('github_token') || sessionStorage.getItem('github_token') || '';
    const tokenMasked = currentToken ? '●'.repeat(40) : '';

    content.innerHTML = `
      <h3>Configuration GitHub</h3>
      <p>Configurez votre token GitHub pour activer la sauvegarde automatique des données.</p>
      
      <div class="info-box">
        <h4>Instructions :</h4>
        <ol>
          <li>Allez sur GitHub → Settings → Developer settings → Personal access tokens</li>
          <li>Créez un nouveau token avec les permissions 'Contents' et 'Metadata'</li>
          <li>Copiez le token et collez-le ci-dessous</li>
        </ol>
      </div>
      
      <form id="github-config-form">
        <div class="form-group">
          <label for="github-token">Token GitHub</label>
          <input type="password" id="github-token" placeholder="${tokenMasked || 'Collez votre token ici...'}" style="font-family: monospace;">
          <small>Le token est stocké localement et de manière sécurisée</small>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="persist-token" ${currentToken && localStorage.getItem('github_token') ? 'checked' : ''}> 
            Sauvegarder le token (persistant entre les sessions)
          </label>
          <small>Si non coché, le token sera supprimé à la fermeture du navigateur</small>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary">Enregistrer le token</button>
          <button type="button" class="btn-secondary" onclick="AdminPanel.instance.testGitHubConnection()">Tester la connexion</button>
          ${currentToken ? '<button type="button" class="btn-delete" onclick="AdminPanel.instance.clearGitHubToken()">Supprimer le token</button>' : ''}
        </div>
      </form>
      
      <div id="github-status" style="margin-top: 15px;"></div>
    `;

    this.setupGitHubConfigHandlers();
  }

  // Setup GitHub config handlers
  setupGitHubConfigHandlers() {
    const form = document.getElementById('github-config-form');
    
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveGitHubToken();
    });
  }

  // Save GitHub token
  saveGitHubToken() {
    const token = document.getElementById('github-token').value.trim();
    const persist = document.getElementById('persist-token').checked;
    const status = document.getElementById('github-status');

    if (!token) {
      status.innerHTML = '<span style="color: red;">❌ Veuillez entrer un token</span>';
      return;
    }

    // Basic token validation
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      status.innerHTML = '<span style="color: orange;">⚠️ Format de token invalide (doit commencer par ghp_ ou github_pat_)</span>';
      return;
    }

    try {
      // Clear existing tokens
      localStorage.removeItem('github_token');
      sessionStorage.removeItem('github_token');

      // Store new token
      if (persist) {
        localStorage.setItem('github_token', token);
      } else {
        sessionStorage.setItem('github_token', token);
      }

      status.innerHTML = '<span style="color: green;">✓ Token enregistré avec succès</span>';
      
      // Clear the input
      document.getElementById('github-token').value = '';
      
      // Refresh the section to show updated status
      setTimeout(() => this.showSection('github-config'), 1000);
      
    } catch (error) {
      console.error('Error saving GitHub token:', error);
      status.innerHTML = '<span style="color: red;">❌ Erreur lors de l\'enregistrement</span>';
    }
  }

  // Test GitHub connection
  async testGitHubConnection() {
    const status = document.getElementById('github-status');
    const token = localStorage.getItem('github_token') || sessionStorage.getItem('github_token');

    if (!token) {
      status.innerHTML = '<span style="color: red;">❌ Aucun token configuré</span>';
      return;
    }

    status.innerHTML = '<span style="color: blue;">🔄 Test de la connexion...</span>';

    try {
      const response = await fetch('https://api.github.com/repos/Teio-max/theolegato-site', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        status.innerHTML = '<span style="color: green;">✓ Connexion GitHub réussie</span>';
      } else {
        status.innerHTML = `<span style="color: red;">❌ Erreur de connexion: ${response.status}</span>`;
      }
    } catch (error) {
      status.innerHTML = `<span style="color: red;">❌ Erreur de connexion: ${error.message}</span>`;
    }
  }

  // Clear GitHub token
  clearGitHubToken() {
    if (confirm('Êtes-vous sûr de vouloir supprimer le token GitHub ?')) {
      localStorage.removeItem('github_token');
      sessionStorage.removeItem('github_token');
      
      const status = document.getElementById('github-status');
      status.innerHTML = '<span style="color: orange;">⚠️ Token supprimé</span>';
      
      setTimeout(() => this.showSection('github-config'), 1000);
    }
  }

  // Save data using existing DataManager
  saveData() {
    try {
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
      } else if (typeof saveData === 'function') {
        saveData();
      } else {
        console.warn('No save function available');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}

// Global instance
AdminPanel.instance = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log("🔧 Admin Panel consolidated system loaded");
  
  // Initialize the admin panel instance
  AdminPanel.instance = new AdminPanel();
  
  // Replace the global createAdminPanelWindow function
  window.createAdminPanelWindow = function(editFilmId = null) {
    console.log("🔧 Creating admin panel via global function");
    
    if (!AdminPanel.instance) {
      AdminPanel.instance = new AdminPanel();
    }
    
    const window = AdminPanel.instance.createWindow();
    
    // If editFilmId is provided, directly show the edit form
    if (editFilmId) {
      setTimeout(() => {
        AdminPanel.instance.showAddFilmForm(document.getElementById('admin-content'), editFilmId);
      }, 200);
    }
    
    return window;
  };
  
  // Backup original functions if they exist
  if (typeof window.originalCreateAdminPanelWindow === 'undefined') {
    window.originalCreateAdminPanelWindow = window.createAdminPanelWindow;
  }
});

console.log("🔧 Admin Panel consolidated script loaded successfully");