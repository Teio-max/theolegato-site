// Solution d'administration "tout-en-un"
// Ce script contient toutes les fonctionnalités nécessaires pour le panneau admin
// sans dépendances externes

console.log("📊 Chargement du module d'administration tout-en-un");

// Définir l'objet AdminSimple pour le panneau d'administration
window.AdminSimple = {
  // Configuration
  config: {
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 650,
    minHeight: 450,
    defaultIcon: 'icons/key.png',
    defaultTitle: 'Panneau d\'administration'
  },
  
  // État interne
  state: {
    activeTab: 'dashboard',
    isInitialized: false,
    films: [],
    articles: [],
    isDataLoaded: false,
    isUploading: false,
    currentEditFilm: null,
    currentEditArticle: null,
    uploadedImage: null,
    uploadedImageName: '',
    galleryImages: [],
    galleryImagesNames: [],
    cv: {
      personalInfo: {
        name: "Théo Legato",
        title: "Développeur Web & Cinéaste",
        email: "contact@theolegato.fr",
        bio: "Passionné par le développement web et le cinéma, je crée des sites web élégants et des expériences cinématographiques uniques."
      },
      experiences: [
        {
          position: "Développeur Web Freelance",
          company: "Auto-entrepreneur",
          period: "2023 - Présent",
          description: "Conception et développement de sites web modernes et responsifs pour divers clients. Utilisation de JavaScript, HTML5/CSS3 et frameworks comme React."
        },
        {
          position: "Assistant Réalisateur",
          company: "Studio Cinéma Indépendant",
          period: "2021 - 2023",
          description: "Collaboration à divers projets de courts-métrages. Gestion de l'équipe technique et participation à la conception visuelle."
        }
      ],
      education: [
        {
          degree: "Master en Cinéma et Audiovisuel",
          school: "Université Paris 8",
          year: "2021"
        },
        {
          degree: "Licence en Informatique",
          school: "Université Paris-Saclay",
          year: "2019"
        }
      ],
      skills: [
        { name: "JavaScript", level: 5 },
        { name: "HTML/CSS", level: 4 },
        { name: "Réalisation vidéo", level: 4 },
        { name: "Adobe Premiere", level: 4 }
      ],
      cvFile: null
    }
  },
  
  // Initialisation
  init() {
    if (this.state.isInitialized) return;
    
    console.log("🚀 Initialisation d'AdminSimple");
    
    // Charger les données si disponibles
    this.loadData();
    
    this.state.isInitialized = true;
  },
  
  // Chargement des données
  loadData() {
    // Essayer de charger les films depuis window.films s'ils existent
    if (typeof window.films !== 'undefined' && Array.isArray(window.films)) {
      this.state.films = window.films;
      console.log(`📊 ${this.state.films.length} films chargés`);
    } else {
      // Utiliser des données fictives pour la démo
      this.state.films = [
        { 
          id: 'film_1', 
          title: 'Film exemple 1', 
          director: 'Réalisateur 1', 
          year: 2023, 
          tags: ['Action', 'Drame'],
          gallery: [
            'https://picsum.photos/id/1/800/600', 
            'https://picsum.photos/id/2/800/600',
            'https://picsum.photos/id/3/800/600'
          ]
        },
        { 
          id: 'film_2', 
          title: 'Film exemple 2', 
          director: 'Réalisateur 2', 
          year: 2024, 
          tags: ['Comédie'],
          gallery: [
            'https://picsum.photos/id/4/800/600',
            'https://picsum.photos/id/5/800/600'
          ]
        }
      ];
      console.log(`📊 Données fictives chargées (${this.state.films.length} films)`);
    }
    
    this.state.isDataLoaded = true;
  },
  
  // Créer une fenêtre d'administration
  createAdminPanel() {
    console.log("🔧 Création du panneau d'administration");
    
    // S'assurer que l'initialisation est faite
    if (!this.state.isInitialized) {
      this.init();
    }
    
    // Créer la fenêtre principale
    const win = document.createElement('div');
    win.id = 'admin-panel-' + Date.now();
    win.className = 'admin-panel-window xp-window';
    win.style.position = 'fixed';
    win.style.top = '50px';
    win.style.left = '50px';
    win.style.width = this.config.defaultWidth + 'px';
    win.style.height = this.config.defaultHeight + 'px';
    win.style.backgroundColor = '#ECE9D8';
    win.style.border = '3px solid #0058a8';
    win.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    win.style.zIndex = '9999';
    win.style.borderRadius = '3px';
    win.style.display = 'flex';
    win.style.flexDirection = 'column';
    win.style.overflow = 'hidden';
    
    // Contenu de la fenêtre
    win.innerHTML = `
      <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:5px 8px;display:flex;justify-content:space-between;align-items:center;user-select:none;cursor:move;">
        <div class="xp-title-content" style="display:flex;align-items:center;">
          <img src="${this.config.defaultIcon}" alt="Admin" style="width:16px;height:16px;margin-right:6px;">
          <span>${this.config.defaultTitle}</span>
        </div>
        <div class="xp-controls" style="display:flex;">
          <button class="xp-btn min" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Minimiser">
            <img src="icons/minimize.png" alt="-" style="width:16px;height:16px;">
          </button>
          <button class="xp-btn max" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Maximiser">
            <img src="icons/maximize.png" alt="□" style="width:16px;height:16px;">
          </button>
          <button class="xp-btn close" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Fermer">
            <img src="icons/close.png" alt="✖" style="width:16px;height:16px;">
          </button>
        </div>
      </div>
      
      <div class="admin-toolbar" style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:5px;display:flex;gap:5px;flex-wrap:wrap;">
        <button class="admin-tab-btn active" data-tab="dashboard" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/window.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Dashboard
        </button>
        <button class="admin-tab-btn" data-tab="films" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/film.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Films
        </button>
        <button class="admin-tab-btn" data-tab="articles" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/article.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Articles
        </button>
        <button class="admin-tab-btn" data-tab="cv" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/cv.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> CV
        </button>
        <button class="admin-tab-btn" data-tab="github" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> GitHub
        </button>
        <button class="admin-tab-btn" data-tab="settings" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
          <img src="icons/info.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"> Paramètres
        </button>
      </div>
      
      <div class="admin-content" style="flex:1;overflow:auto;padding:10px;">
        <!-- Tab Dashboard -->
        <div class="admin-tab-content active" id="dashboard-tab">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Tableau de bord
          </h3>
          
          <div style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
            <div style="flex:1;min-width:150px;background:white;border:1px solid #ddd;border-radius:3px;padding:15px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <img src="icons/film.png" style="width:24px;height:24px;margin-bottom:5px;">
              <h4 style="margin-top:0;color:#333;margin-bottom:5px;">Films</h4>
              <p style="font-size:24px;font-weight:bold;margin:5px 0;color:#0058a8;" class="film-count">${this.state.films.length}</p>
            </div>
            
            <div style="flex:1;min-width:150px;background:white;border:1px solid #ddd;border-radius:3px;padding:15px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <img src="icons/article.png" style="width:24px;height:24px;margin-bottom:5px;">
              <h4 style="margin-top:0;color:#333;margin-bottom:5px;">Articles</h4>
              <p style="font-size:24px;font-weight:bold;margin:5px 0;color:#0058a8;">0</p>
            </div>
            
            <div style="flex:1;min-width:150px;background:white;border:1px solid #ddd;border-radius:3px;padding:15px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <img src="icons/key.png" style="width:24px;height:24px;margin-bottom:5px;">
              <h4 style="margin-top:0;color:#333;margin-bottom:5px;">GitHub</h4>
              <p style="font-size:16px;margin:5px 0;color:#4CAF50;">✓ Configuré</p>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;border-bottom:1px solid #ddd;padding-bottom:5px;">Actions rapides</h4>
            <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:15px;">
              <button class="admin-action-btn" data-action="add-film" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                <img src="icons/film.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Nouveau film
              </button>
              <button class="admin-action-btn" data-action="add-article" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                <img src="icons/article.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Nouvel article
              </button>
              <button class="admin-action-btn" data-action="save-data" style="padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;">
                <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Sauvegarder données
              </button>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;border-bottom:1px solid #ddd;padding-bottom:5px;">Activité récente</h4>
            <ul style="list-style-type:none;padding:0;margin:10px 0;">
              <li style="padding:8px 0;border-bottom:1px solid #eee;">
                <span style="color:#666;font-size:12px;">Aujourd'hui, 10:30</span>
                <p style="margin:2px 0;">Film "Film exemple 2" ajouté</p>
              </li>
              <li style="padding:8px 0;border-bottom:1px solid #eee;">
                <span style="color:#666;font-size:12px;">Hier, 15:45</span>
                <p style="margin:2px 0;">Données sauvegardées sur GitHub</p>
              </li>
              <li style="padding:8px 0;">
                <span style="color:#666;font-size:12px;">28/08/2025, 09:15</span>
                <p style="margin:2px 0;">Film "Film exemple 1" modifié</p>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Tab Films -->
        <div class="admin-tab-content" id="films-tab" style="display:none;">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Gestion des Films
          </h3>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
              <h4 style="margin:0;color:#333;">Liste des films</h4>
              <button class="admin-action-btn" data-action="add-film" style="padding:6px 12px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                <img src="icons/film.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter
              </button>
            </div>
            
            <div style="border:1px solid #ccc;border-radius:3px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#f2f2f2;">
                    <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;">Titre</th>
                    <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;">Réalisateur</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Année</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Galerie</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.state.films.map(film => `
                    <tr style="border-bottom:1px solid #eee;">
                      <td style="padding:8px;">${film.title || 'Sans titre'}</td>
                      <td style="padding:8px;">${film.director || '-'}</td>
                      <td style="padding:8px;text-align:center;">${film.year || '-'}</td>
                      <td style="padding:8px;text-align:center;">${film.tags ? film.tags.join(', ') : '-'}</td>
                      <td style="padding:8px;text-align:center;">
                        <button class="film-action-btn" data-action="edit" data-id="${film.id}" style="background:#0058a8;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
                          Éditer
                        </button>
                        <button class="film-action-btn" data-action="delete" data-id="${film.id}" style="background:#f44336;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
                          Suppr.
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          
          <div style="background:#f8f8f8;border:1px solid #ddd;border-radius:3px;padding:10px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="margin-top:0;color:#333;">Statistiques</h4>
            <p style="margin:5px 0;">Nombre total de films: <strong class="film-count">${this.state.films.length}</strong></p>
            <div style="height:10px;background:#e0e0e0;border-radius:5px;margin:10px 0;overflow:hidden;">
              <div style="height:100%;background:linear-gradient(to right,#0058a8,#2586e7);width:${Math.min(this.state.films.length * 10, 100)}%;"></div>
            </div>
          </div>
        </div>
        
        <!-- Tab Articles -->
        <div class="admin-tab-content" id="articles-tab" style="display:none;">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Gestion des Articles
          </h3>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
              <h4 style="margin:0;color:#333;">Liste des articles</h4>
              <div style="display:flex;gap:8px;">
                <button class="admin-action-btn" data-action="import-pdf-article" style="padding:6px 12px;background:#7952b3;color:white;border:1px solid #613d93;border-radius:3px;cursor:pointer;">
                  <img src="icons/article.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Importer PDF
                </button>
                <button class="admin-action-btn" data-action="add-article" style="padding:6px 12px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                  <img src="icons/article.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter
                </button>
              </div>
            </div>
            <input type="file" id="pdf-article-file" accept=".pdf" style="display:none;">
            
            <div style="border:1px solid #ccc;border-radius:3px;overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <thead>
                  <tr style="background:#f2f2f2;">
                    <th style="padding:8px;text-align:left;border-bottom:1px solid #ddd;">Titre</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Date</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Catégorie</th>
                    <th style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="4" style="padding:15px;text-align:center;color:#666;">
                      Aucun article disponible. Cliquez sur "Ajouter" pour créer votre premier article.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;margin-bottom:10px;">Ajouter un nouvel article</h4>
            <form id="article-form">
              <div style="margin-bottom:15px;">
                <label for="article-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre:</label>
                <input type="text" id="article-title" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" placeholder="Titre de l'article">
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="article-category" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie:</label>
                <select id="article-category" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
                  <option value="cinema">Cinéma</option>
                  <option value="tech">Technologie</option>
                  <option value="art">Art</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="article-content" style="display:block;margin-bottom:5px;font-weight:bold;">Contenu:</label>
                <textarea id="article-content" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;min-height:150px;resize:vertical;" placeholder="Contenu de l'article..."></textarea>
              </div>
              
              <div style="display:flex;justify-content:flex-end;">
                <button type="button" class="admin-action-btn" data-action="save-article" style="padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;">
                  <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Enregistrer l'article
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <!-- Tab CV -->
        <div class="admin-tab-content" id="cv-tab" style="display:none;">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Gestion du CV
          </h3>
          
          <div style="display:flex;gap:20px;">
            <div style="flex:2;">
              <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h4 style="color:#333;margin-top:0;margin-bottom:15px;">Informations personnelles</h4>
                
                <div style="margin-bottom:15px;">
                  <label for="cv-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom complet:</label>
                  <input type="text" id="cv-name" value="Théo Legato" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
                </div>
                
                <div style="margin-bottom:15px;">
                  <label for="cv-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre professionnel:</label>
                  <input type="text" id="cv-title" value="Développeur Web & Cinéaste" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
                </div>
                
                <div style="margin-bottom:15px;">
                  <label for="cv-email" style="display:block;margin-bottom:5px;font-weight:bold;">Email:</label>
                  <input type="email" id="cv-email" value="contact@theolegato.fr" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
                </div>
                
                <div style="margin-bottom:15px;">
                  <label for="cv-bio" style="display:block;margin-bottom:5px;font-weight:bold;">Biographie courte:</label>
                  <textarea id="cv-bio" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;min-height:100px;resize:vertical;">Passionné par le développement web et le cinéma, je crée des sites web élégants et des expériences cinématographiques uniques.</textarea>
                </div>
              </div>
              
              <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                  <h4 style="margin:0;color:#333;">Expériences professionnelles</h4>
                  <button class="admin-action-btn" data-action="add-experience" style="padding:6px 12px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                    <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter
                  </button>
                </div>
                
                <div id="experiences-list">
                  <div class="experience-item" style="border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;">
                    <div style="margin-bottom:10px;">
                      <input type="text" placeholder="Poste occupé" value="Développeur Web Freelance" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
                    </div>
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                      <input type="text" placeholder="Entreprise" value="Auto-entrepreneur" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <input type="text" placeholder="Période" value="2023 - Présent" style="width:180px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                    </div>
                    <textarea placeholder="Description" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;min-height:80px;resize:vertical;">Conception et développement de sites web modernes et responsifs pour divers clients. Utilisation de JavaScript, HTML5/CSS3 et frameworks comme React.</textarea>
                    <div style="text-align:right;margin-top:10px;">
                      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
                    </div>
                  </div>
                  
                  <div class="experience-item" style="border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;">
                    <div style="margin-bottom:10px;">
                      <input type="text" placeholder="Poste occupé" value="Assistant Réalisateur" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
                    </div>
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                      <input type="text" placeholder="Entreprise" value="Studio Cinéma Indépendant" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <input type="text" placeholder="Période" value="2021 - 2023" style="width:180px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                    </div>
                    <textarea placeholder="Description" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;min-height:80px;resize:vertical;">Collaboration à divers projets de courts-métrages. Gestion de l'équipe technique et participation à la conception visuelle.</textarea>
                    <div style="text-align:right;margin-top:10px;">
                      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                  <h4 style="margin:0;color:#333;">Formation</h4>
                  <button class="admin-action-btn" data-action="add-education" style="padding:6px 12px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                    <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter
                  </button>
                </div>
                
                <div id="education-list">
                  <div class="education-item" style="border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;">
                    <div style="margin-bottom:10px;">
                      <input type="text" placeholder="Diplôme" value="Master en Cinéma et Audiovisuel" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
                    </div>
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                      <input type="text" placeholder="École" value="Université Paris 8" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <input type="text" placeholder="Année" value="2021" style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                    </div>
                    <div style="text-align:right;margin-top:10px;">
                      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
                    </div>
                  </div>
                  
                  <div class="education-item" style="border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;">
                    <div style="margin-bottom:10px;">
                      <input type="text" placeholder="Diplôme" value="Licence en Informatique" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
                    </div>
                    <div style="display:flex;gap:10px;margin-bottom:10px;">
                      <input type="text" placeholder="École" value="Université Paris-Saclay" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <input type="text" placeholder="Année" value="2019" style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                    </div>
                    <div style="text-align:right;margin-top:10px;">
                      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="flex:1;">
              <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h4 style="color:#333;margin-top:0;margin-bottom:15px;">Compétences</h4>
                <div id="skills-list">
                  <div style="margin-bottom:10px;">
                    <div style="display:flex;gap:10px;margin-bottom:5px;">
                      <input type="text" value="JavaScript" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <select style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option selected>5</option>
                      </select>
                    </div>
                    <div class="skill-bar" style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
                      <div style="height:100%;background:#0058a8;width:90%;"></div>
                    </div>
                  </div>
                  
                  <div style="margin-bottom:10px;">
                    <div style="display:flex;gap:10px;margin-bottom:5px;">
                      <input type="text" value="HTML/CSS" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <select style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option selected>4</option>
                        <option>5</option>
                      </select>
                    </div>
                    <div class="skill-bar" style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
                      <div style="height:100%;background:#0058a8;width:80%;"></div>
                    </div>
                  </div>
                  
                  <div style="margin-bottom:10px;">
                    <div style="display:flex;gap:10px;margin-bottom:5px;">
                      <input type="text" value="Réalisation vidéo" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <select style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option selected>4</option>
                        <option>5</option>
                      </select>
                    </div>
                    <div class="skill-bar" style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
                      <div style="height:100%;background:#0058a8;width:85%;"></div>
                    </div>
                  </div>
                  
                  <div style="margin-bottom:10px;">
                    <div style="display:flex;gap:10px;margin-bottom:5px;">
                      <input type="text" value="Adobe Premiere" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
                      <select style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option selected>4</option>
                        <option>5</option>
                      </select>
                    </div>
                    <div class="skill-bar" style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
                      <div style="height:100%;background:#0058a8;width:80%;"></div>
                    </div>
                  </div>
                  
                  <div style="margin-top:15px;">
                    <button class="admin-action-btn" data-action="add-skill" style="width:100%;padding:6px 12px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                      <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter une compétence
                    </button>
                  </div>
                </div>
              </div>
              
              <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                <h4 style="color:#333;margin-top:0;margin-bottom:15px;">Téléchargement du CV</h4>
                
                <div style="border:2px dashed #ccc;padding:20px;text-align:center;margin-bottom:15px;background:#f8f8f8;border-radius:3px;">
                  <img src="icons/cv.png" style="width:32px;height:32px;margin-bottom:10px;opacity:0.6;">
                  <p style="margin:5px 0;color:#666;">Déposez un PDF de votre CV ou</p>
                  <button class="admin-action-btn" data-action="upload-cv" style="margin-top:10px;padding:6px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                    Parcourir...
                  </button>
                  <input type="file" id="cv-file" accept=".pdf" style="display:none;">
                </div>
                
                <div id="cv-preview" style="margin-bottom:15px;border:1px solid #ddd;padding:10px;border-radius:3px;background:#f9f9f9;display:none;">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <img src="icons/cv.png" style="width:24px;height:24px;">
                    <div style="flex:1;">
                      <p style="margin:0;font-weight:bold;">CV_TheoLegato.pdf</p>
                      <p style="margin:0;font-size:12px;color:#666;">285 KB - Téléversé le 12/08/2025</p>
                    </div>
                    <button style="background:none;border:none;cursor:pointer;color:#f44336;" title="Supprimer">✕</button>
                  </div>
                </div>
                
                <div style="margin-top:20px;">
                  <button class="admin-action-btn" data-action="generate-cv" style="width:100%;padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;">
                    <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Générer un CV à partir des données
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div style="margin-top:20px;text-align:right;">
            <button class="admin-action-btn" data-action="save-cv" style="padding:8px 20px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;font-size:16px;">
              <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Enregistrer le CV
            </button>
          </div>
        </div>
        
        <!-- Tab GitHub -->
        <div class="admin-tab-content" id="github-tab" style="display:none;">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Configuration GitHub
          </h3>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;">Token d'accès personnel</h4>
            <p style="color:#666;margin-bottom:15px;">Le token GitHub est nécessaire pour sauvegarder vos données.</p>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:5px;font-weight:bold;">Token GitHub:</label>
              <div style="display:flex;gap:5px;">
                <input type="password" id="github-token" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;" placeholder="Entrez votre token GitHub">
                <button class="admin-action-btn" data-action="save-token" style="padding:8px 15px;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                  Sauvegarder
                </button>
              </div>
            </div>
            
            <div style="background:#e8f4fd;border-left:4px solid #0058a8;padding:10px;margin-top:15px;">
              <p style="margin:0;font-size:13px;">Vous pouvez créer un token d'accès personnel sur <a href="https://github.com/settings/tokens" target="_blank" style="color:#0058a8;">github.com/settings/tokens</a></p>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;">Paramètres du dépôt</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:5px;font-weight:bold;">Utilisateur/Organisation:</label>
              <input type="text" id="github-owner" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" placeholder="ex: username" value="Teio-max">
            </div>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:5px;font-weight:bold;">Nom du dépôt:</label>
              <input type="text" id="github-repo" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" placeholder="ex: mon-site" value="theolegato-site">
            </div>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:5px;font-weight:bold;">Branche:</label>
              <input type="text" id="github-branch" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" placeholder="ex: main" value="main">
            </div>
            
            <button class="admin-action-btn" data-action="save-github-settings" style="padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;width:100%;">
              Enregistrer les paramètres
            </button>
          </div>
        </div>
        
        <!-- Tab Settings -->
        <div class="admin-tab-content" id="settings-tab" style="display:none;">
          <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
            Paramètres
          </h3>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;">Apparence</h4>
            
            <div style="margin-bottom:15px;">
              <label style="display:block;margin-bottom:5px;font-weight:bold;">Thème:</label>
              <select style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
                <option value="xp" selected>Windows XP (Défaut)</option>
                <option value="7">Windows 7</option>
                <option value="10">Windows 10</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;">Notifications</h4>
            
            <div style="margin-bottom:10px;">
              <label style="display:flex;align-items:center;cursor:pointer;">
                <input type="checkbox" checked style="margin-right:8px;">
                <span>Activer les notifications sonores</span>
              </label>
            </div>
            
            <div style="margin-bottom:10px;">
              <label style="display:flex;align-items:center;cursor:pointer;">
                <input type="checkbox" checked style="margin-right:8px;">
                <span>Afficher les notifications visuelles</span>
              </label>
            </div>
          </div>
          
          <div style="background:white;border:1px solid #ddd;border-radius:3px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
            <h4 style="color:#333;margin-top:0;">À propos</h4>
            <p style="margin:5px 0;">Version: <strong>1.0.0</strong></p>
            <p style="margin:5px 0;">Développé par: <strong>Théo Legato</strong></p>
            <p style="margin:5px 0;">GitHub Copilot: <strong>✓ Assisté</strong></p>
            
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #eee;">
              <button class="admin-action-btn" data-action="reset-settings" style="padding:8px 15px;background:#f44336;color:white;border:1px solid #d32f2f;border-radius:3px;cursor:pointer;">
                Réinitialiser tous les paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="admin-statusbar" style="background:#ECE9D8;border-top:1px solid #ACA899;padding:5px 10px;font-size:12px;color:#666;">
        <span>Prêt</span>
        <span style="float:right;">Films: <span class="film-count">${this.state.films.length}</span> | Dernière sauvegarde: Aujourd'hui 10:30</span>
      </div>
    `;
    
    // Ajouter au document
    document.body.appendChild(win);
    
    // Activer le drag and drop
    this.makeDraggable(win);
    
    // Ajouter les gestionnaires d'événements
    this.attachEventHandlers(win);
    
    return win;
  },
  
  // Attacher les gestionnaires d'événements
  attachEventHandlers(win) {
    // Gestionnaire pour fermer la fenêtre
    const closeBtn = win.querySelector('.xp-btn.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        win.remove();
      });
    }
    
    // Gestionnaire pour minimiser la fenêtre
    const minBtn = win.querySelector('.xp-btn.min');
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        // Simuler la minimisation
        win.style.display = 'none';
        
        // Créer un élément dans la barre des tâches si elle existe
        const taskbar = document.getElementById('minimized-windows');
        if (taskbar) {
          const item = document.createElement('div');
          item.className = 'taskbar-item';
          item.innerHTML = `
            <img src="${this.config.defaultIcon}" alt="Admin">
            <span>Admin</span>
          `;
          item.addEventListener('click', () => {
            win.style.display = 'flex';
            item.remove();
          });
          taskbar.appendChild(item);
        } else {
          // Fallback si pas de barre des tâches: créer un bouton de restauration
          const restoreBtn = document.createElement('button');
          restoreBtn.textContent = 'Restaurer Admin';
          restoreBtn.style.position = 'fixed';
          restoreBtn.style.bottom = '10px';
          restoreBtn.style.right = '10px';
          restoreBtn.style.zIndex = '9999';
          restoreBtn.addEventListener('click', () => {
            win.style.display = 'flex';
            restoreBtn.remove();
          });
          document.body.appendChild(restoreBtn);
        }
      });
    }
    
    // Gestionnaire pour maximiser la fenêtre
    const maxBtn = win.querySelector('.xp-btn.max');
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        if (win.classList.contains('maximized')) {
          // Restaurer
          win.classList.remove('maximized');
          win.style.top = '50px';
          win.style.left = '50px';
          win.style.width = this.config.defaultWidth + 'px';
          win.style.height = this.config.defaultHeight + 'px';
          maxBtn.querySelector('img').src = 'icons/maximize.png';
        } else {
          // Maximiser
          win.classList.add('maximized');
          win.style.top = '0';
          win.style.left = '0';
          win.style.width = '100%';
          win.style.height = '100%';
          maxBtn.querySelector('img').src = 'icons/resize.png';
        }
      });
    }
    
    // Gestionnaire pour les onglets
    const tabBtns = win.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Mettre à jour l'état actif des boutons
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Mettre à jour l'onglet actif
        const tabName = btn.getAttribute('data-tab');
        this.state.activeTab = tabName;
        
        // Afficher le contenu correspondant
        const tabContents = win.querySelectorAll('.admin-tab-content');
        tabContents.forEach(tab => {
          tab.style.display = 'none';
        });
        
        const activeTab = win.querySelector(`#${tabName}-tab`);
        if (activeTab) {
          activeTab.style.display = 'block';
        }
      });
    });
    
    // Gestionnaire pour les boutons d'action
    const actionBtns = win.querySelectorAll('.admin-action-btn');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.handleAction(action, win);
      });
    });
    
    // Gestionnaire pour les actions sur les films
    const filmBtns = win.querySelectorAll('.film-action-btn');
    filmBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const filmId = btn.getAttribute('data-id');
        this.handleFilmAction(action, filmId, win);
      });
    });
  },
  
  // Gérer les actions générales
  handleAction(action, win) {
    console.log(`🔧 Action: ${action}`);
    
    switch (action) {
      case 'add-film':
        this.openFilmEditor(null, win);
        break;
      case 'add-article':
        this.openArticleEditor(null, win);
        break;
      case 'import-pdf-article':
        this.importPdfArticle(win);
        break;
      case 'save-article':
        this.saveArticle(win);
        break;
      case 'add-experience':
        this.addExperience(win);
        break;
      case 'add-education':
        this.addEducation(win);
        break;
      case 'add-skill':
        this.addSkill(win);
        break;
      case 'upload-cv':
        this.handleCvFileUpload(win);
        break;
      case 'generate-cv':
        this.generateCvFromData(win);
        break;
      case 'save-cv':
        this.saveCvData(win);
        break;
      case 'save-data':
        // Simuler la sauvegarde
        win.querySelector('.admin-statusbar span:first-child').textContent = 'Sauvegarde en cours...';
        setTimeout(() => {
          win.querySelector('.admin-statusbar span:first-child').textContent = 'Sauvegarde terminée avec succès';
          setTimeout(() => {
            win.querySelector('.admin-statusbar span:first-child').textContent = 'Prêt';
          }, 2000);
        }, 1500);
        break;
      case 'save-token':
        const token = win.querySelector('#github-token').value;
        if (token) {
          alert(`Token GitHub enregistré: ${token.substring(0, 4)}...`);
        } else {
          alert("Veuillez entrer un token GitHub");
        }
        break;
      case 'save-github-settings':
        alert("Paramètres GitHub enregistrés");
        break;
      case 'reset-settings':
        if (confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres?")) {
          alert("Paramètres réinitialisés");
        }
        break;
      default:
        console.log(`Action non reconnue: ${action}`);
    }
  },
  
  // Gérer les actions sur les films
  handleFilmAction(action, filmId, win) {
    console.log(`🎬 Action film: ${action}, ID: ${filmId}`);
    
    const film = this.state.films.find(f => f.id === filmId);
    
    switch (action) {
      case 'edit':
        if (film) {
          this.openFilmEditor(film, win);
        } else {
          alert(`Film avec ID ${filmId} non trouvé`);
        }
        break;
      case 'delete':
        if (film && confirm(`Voulez-vous vraiment supprimer le film "${film.title || 'Sans titre'}"?`)) {
          // Simuler la suppression
          this.state.films = this.state.films.filter(f => f.id !== filmId);
          
          // Mettre à jour l'affichage
          win.querySelector('.admin-statusbar span:first-child').textContent = `Film "${film.title}" supprimé`;
          
          // Recharger l'onglet films
          if (this.state.activeTab === 'films') {
            this.loadTab('films', win);
          }
          
          // Mettre à jour le compteur de films
          const filmCountElements = win.querySelectorAll('.film-count');
          filmCountElements.forEach(el => {
            el.textContent = this.state.films.length;
          });
        }
        break;
      default:
        console.log(`Action film non reconnue: ${action}`);
    }
  },
  
  // Ouvrir l'éditeur de film
  openFilmEditor(film, win) {
    console.log(`📝 Ouverture de l'éditeur de film: ${film ? film.title : 'Nouveau film'}`);
    
    // Sauvegarder le film en cours d'édition
    this.state.currentEditFilm = film || null;
    
    // Réinitialiser l'image téléversée et la galerie
    this.state.uploadedImage = null;
    this.state.uploadedImageName = '';
    this.state.galleryImages = film && film.gallery ? [...film.gallery] : [];
    this.state.galleryImagesFiles = [];
    
    // Créer la fenêtre d'édition
    const editorWin = document.createElement('div');
    editorWin.className = 'film-editor-window xp-window';
    editorWin.style.position = 'fixed';
    editorWin.style.top = '80px';
    editorWin.style.left = '100px';
    editorWin.style.width = '650px';
    editorWin.style.height = '700px'; // Hauteur augmentée pour la galerie
    editorWin.style.backgroundColor = '#ECE9D8';
    editorWin.style.border = '3px solid #0058a8';
    editorWin.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    editorWin.style.zIndex = '10000';
    editorWin.style.borderRadius = '3px';
    editorWin.style.display = 'flex';
    editorWin.style.flexDirection = 'column';
    editorWin.style.overflow = 'hidden';
    
    // Titre et ID pour l'affichage
    const filmTitle = film ? film.title || 'Sans titre' : 'Nouveau film';
    const filmId = film ? film.id : 'nouveau_' + Date.now();
    
    // Contenu de la fenêtre
    editorWin.innerHTML = `
      <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:5px 8px;display:flex;justify-content:space-between;align-items:center;user-select:none;cursor:move;">
        <div class="xp-title-content" style="display:flex;align-items:center;">
          <img src="icons/film.png" alt="Film" style="width:16px;height:16px;margin-right:6px;">
          <span>${film ? 'Éditer: ' + filmTitle : 'Nouveau film'}</span>
        </div>
        <div class="xp-controls" style="display:flex;">
          <button class="xp-btn close" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Fermer">
            <img src="icons/close.png" alt="✖" style="width:16px;height:16px;">
          </button>
        </div>
      </div>
      
      <div class="film-editor-content" style="flex:1;overflow:auto;padding:15px;">
        <form id="film-edit-form">
          <input type="hidden" id="film-id" value="${filmId}">
          
          <div style="display:flex;gap:20px;margin-bottom:20px;">
            <div style="flex:1;">
              <div style="margin-bottom:15px;">
                <label for="film-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre du film *</label>
                <input type="text" id="film-title" value="${film ? film.title || '' : ''}" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" required>
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="film-director" style="display:block;margin-bottom:5px;font-weight:bold;">Réalisateur</label>
                <input type="text" id="film-director" value="${film ? film.director || '' : ''}" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="film-year" style="display:block;margin-bottom:5px;font-weight:bold;">Année</label>
                <input type="number" id="film-year" value="${film ? film.year || '' : ''}" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;" min="1900" max="2099">
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="film-tags" style="display:block;margin-bottom:5px;font-weight:bold;">Tags (séparés par des virgules)</label>
                <input type="text" id="film-tags" value="${film && film.tags ? film.tags.join(', ') : ''}" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;">
              </div>
              
              <div style="margin-bottom:15px;">
                <label for="film-description" style="display:block;margin-bottom:5px;font-weight:bold;">Description</label>
                <textarea id="film-description" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;height:80px;resize:vertical;">${film ? film.description || '' : ''}</textarea>
              </div>
            </div>
            
            <div style="width:200px;">
              <div style="margin-bottom:15px;">
                <label style="display:block;margin-bottom:5px;font-weight:bold;">Affiche du film</label>
                <div id="image-preview" style="width:180px;height:250px;border:1px dashed #ccc;margin-bottom:10px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                  ${film && film.poster ? `<img src="${film.poster}" alt="Affiche" style="max-width:100%;max-height:100%;">` : '<span style="color:#666;text-align:center;">Aucune image</span>'}
                </div>
                
                <div>
                  <input type="file" id="film-poster" style="display:none;" accept="image/*">
                  <button type="button" id="upload-btn" style="width:100%;padding:6px 0;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;margin-bottom:5px;">
                    <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Téléverser
                  </button>
                  <button type="button" id="clear-image-btn" style="width:100%;padding:6px 0;background:#f44336;color:white;border:1px solid #d32f2f;border-radius:3px;cursor:pointer;" ${film && film.poster ? '' : 'disabled'}>
                    Supprimer l'image
                  </button>
                </div>
              </div>
              
              <div style="margin-top:20px;background:#f8f8f8;border:1px solid #ddd;border-radius:3px;padding:10px;">
                <h4 style="margin-top:0;color:#333;font-size:14px;">Informations</h4>
                <p style="margin:5px 0;font-size:12px;">ID: ${filmId}</p>
                ${film ? `<p style="margin:5px 0;font-size:12px;">Ajouté le: ${new Date().toLocaleDateString()}</p>` : ''}
              </div>
            </div>
          </div>
          
          <!-- Section Galerie d'images -->
          <div style="margin-bottom:20px;border:1px solid #ddd;border-radius:3px;padding:15px;background:#f8f8f8;">
            <h4 style="margin-top:0;color:#333;margin-bottom:10px;">Galerie d'images</h4>
            
            <div id="gallery-container" style="margin-bottom:15px;">
              <div id="gallery-preview" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px;min-height:120px;border:1px dashed #ccc;padding:10px;background:white;">
                ${this.state.galleryImages && this.state.galleryImages.length > 0 
                  ? this.state.galleryImages.map((img, idx) => `
                    <div class="gallery-item" data-index="${idx}" style="position:relative;width:100px;height:100px;border:2px solid #ddd;overflow:hidden;">
                      <img src="${img}" alt="Image ${idx+1}" style="width:100%;height:100%;object-fit:cover;">
                      <button type="button" class="gallery-delete-btn" data-index="${idx}" style="position:absolute;top:2px;right:2px;width:20px;height:20px;background:rgba(255,0,0,0.7);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
                    </div>
                  `).join('')
                  : '<div style="width:100%;height:100px;display:flex;align-items:center;justify-content:center;color:#888;font-style:italic;">Aucune image dans la galerie</div>'
                }
              </div>
              
              <div style="display:flex;gap:10px;">
                <input type="file" id="gallery-upload" style="display:none;" accept="image/*" multiple>
                <button type="button" id="add-gallery-btn" style="flex:1;padding:6px 0;background:#0058a8;color:white;border:1px solid #003f7d;border-radius:3px;cursor:pointer;">
                  <img src="icons/portfolio.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Ajouter des images
                </button>
              </div>
            </div>
          </div>
          
          <div style="border-top:1px solid #ddd;padding-top:15px;display:flex;justify-content:space-between;">
            <button type="button" id="cancel-btn" style="padding:8px 15px;background:#ECE9D8;color:#333;border:1px solid #ACA899;border-radius:3px;cursor:pointer;">
              Annuler
            </button>
            <button type="submit" id="save-btn" style="padding:8px 15px;background:#4CAF50;color:white;border:1px solid #388E3C;border-radius:3px;cursor:pointer;">
              <img src="icons/key.png" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;filter:brightness(5);"> Enregistrer
            </button>
          </div>
        </form>
      </div>
    `;
    
    // Ajouter au document
    document.body.appendChild(editorWin);
    
    // Rendre draggable
    this.makeDraggable(editorWin);
    
    // Gestionnaire pour fermer
    const closeBtn = editorWin.querySelector('.xp-btn.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir fermer sans enregistrer ?')) {
          editorWin.remove();
        }
      });
    }
    
    // Gestionnaire pour le bouton annuler
    const cancelBtn = editorWin.querySelector('#cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir annuler les modifications ?')) {
          editorWin.remove();
        }
      });
    }
    
    // Gestionnaire pour le téléversement d'image principale
    const uploadBtn = editorWin.querySelector('#upload-btn');
    const fileInput = editorWin.querySelector('#film-poster');
    const imagePreview = editorWin.querySelector('#image-preview');
    const clearImageBtn = editorWin.querySelector('#clear-image-btn');
    
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });
      
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          // Vérifier si c'est une image
          if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
          }
          
          // Vérifier la taille (max 5 Mo)
          if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop volumineuse. Taille maximale: 5 Mo');
            return;
          }
          
          // Sauvegarder l'image
          this.state.uploadedImage = file;
          this.state.uploadedImageName = file.name;
          
          // Afficher l'aperçu
          const reader = new FileReader();
          reader.onload = (event) => {
            imagePreview.innerHTML = `<img src="${event.target.result}" alt="Aperçu" style="max-width:100%;max-height:100%;">`;
            clearImageBtn.disabled = false;
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Gestionnaire pour supprimer l'image principale
    if (clearImageBtn) {
      clearImageBtn.addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
          imagePreview.innerHTML = '<span style="color:#666;text-align:center;">Aucune image</span>';
          this.state.uploadedImage = null;
          this.state.uploadedImageName = '';
          if (fileInput) fileInput.value = '';
          clearImageBtn.disabled = true;
        }
      });
    }
    
    // Gestionnaire pour la galerie d'images
    const galleryUploadBtn = editorWin.querySelector('#add-gallery-btn');
    const galleryFileInput = editorWin.querySelector('#gallery-upload');
    const galleryPreview = editorWin.querySelector('#gallery-preview');
    
    if (galleryUploadBtn && galleryFileInput) {
      galleryUploadBtn.addEventListener('click', () => {
        galleryFileInput.click();
      });
      
      galleryFileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          // Limiter le nombre total d'images (max 10)
          if (this.state.galleryImages.length + files.length > 10) {
            alert('Vous ne pouvez pas ajouter plus de 10 images dans la galerie');
            return;
          }
          
          // Parcourir les fichiers sélectionnés
          Array.from(files).forEach(file => {
            // Vérifier si c'est une image
            if (!file.type.startsWith('image/')) {
              alert(`Le fichier "${file.name}" n'est pas une image valide`);
              return;
            }
            
            // Vérifier la taille (max 5 Mo)
            if (file.size > 5 * 1024 * 1024) {
              alert(`L'image "${file.name}" est trop volumineuse. Taille maximale: 5 Mo`);
              return;
            }
            
            // Créer un aperçu et ajouter à la galerie
            const reader = new FileReader();
            reader.onload = (event) => {
              const imageUrl = event.target.result;
              
              // Ajouter l'image à l'état
              this.state.galleryImages.push(imageUrl);
              this.state.galleryImagesFiles.push(file);
              
              // Ajouter l'élément visuel
              const newIndex = this.state.galleryImages.length - 1;
              
              // Supprimer le message "Aucune image" si c'est la première image
              if (newIndex === 0) {
                galleryPreview.innerHTML = '';
              }
              
              const galleryItem = document.createElement('div');
              galleryItem.className = 'gallery-item';
              galleryItem.dataset.index = newIndex;
              galleryItem.style.position = 'relative';
              galleryItem.style.width = '100px';
              galleryItem.style.height = '100px';
              galleryItem.style.border = '2px solid #ddd';
              galleryItem.style.overflow = 'hidden';
              
              galleryItem.innerHTML = `
                <img src="${imageUrl}" alt="Image ${newIndex+1}" style="width:100%;height:100%;object-fit:cover;">
                <button type="button" class="gallery-delete-btn" data-index="${newIndex}" style="position:absolute;top:2px;right:2px;width:20px;height:20px;background:rgba(255,0,0,0.7);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
              `;
              
              galleryPreview.appendChild(galleryItem);
            };
            
            reader.readAsDataURL(file);
          });
          
          // Réinitialiser l'input pour permettre la sélection des mêmes fichiers
          galleryFileInput.value = '';
        }
      });
    }
    
    // Gestionnaire pour supprimer les images de la galerie
    galleryPreview.addEventListener('click', (e) => {
      if (e.target.classList.contains('gallery-delete-btn')) {
        const index = parseInt(e.target.dataset.index);
        
        if (confirm('Êtes-vous sûr de vouloir supprimer cette image de la galerie ?')) {
          // Supprimer l'image de l'état
          this.state.galleryImages.splice(index, 1);
          if (index < this.state.galleryImagesFiles.length) {
            this.state.galleryImagesFiles.splice(index, 1);
          }
          
          // Rafraîchir l'affichage de la galerie
          this.refreshGalleryPreview(galleryPreview);
        }
      }
    });
    
    // Gestionnaire pour l'enregistrement du formulaire
    const form = editorWin.querySelector('#film-edit-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const id = editorWin.querySelector('#film-id').value;
        const title = editorWin.querySelector('#film-title').value;
        const director = editorWin.querySelector('#film-director').value;
        const year = editorWin.querySelector('#film-year').value;
        const tags = editorWin.querySelector('#film-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const description = editorWin.querySelector('#film-description').value;
        
        // Validation basique
        if (!title) {
          alert('Le titre est obligatoire');
          return;
        }
        
        // Créer ou mettre à jour le film
        const updatedFilm = {
          id: id,
          title: title,
          director: director,
          year: year ? parseInt(year) : null,
          tags: tags,
          description: description,
          gallery: [...this.state.galleryImages] // Copier la galerie
        };
        
        // Traiter l'image principale
        if (this.state.uploadedImage) {
          // Dans un environnement réel, on enverrait l'image au serveur
          // Ici, on simule en utilisant l'URL de données
          const reader = new FileReader();
          reader.onload = (event) => {
            updatedFilm.poster = event.target.result;
            this.saveFilm(updatedFilm, win);
            editorWin.remove();
          };
          reader.readAsDataURL(this.state.uploadedImage);
        } else if (film && film.poster) {
          // Conserver l'image existante sauf si effacée explicitement
          updatedFilm.poster = clearImageBtn.disabled ? null : film.poster;
          this.saveFilm(updatedFilm, win);
          editorWin.remove();
        } else {
          // Aucune image
          this.saveFilm(updatedFilm, win);
          editorWin.remove();
        }
      });
    }
  },
  
  // Rafraîchir l'affichage de la galerie
  refreshGalleryPreview(container) {
    if (this.state.galleryImages.length === 0) {
      container.innerHTML = '<div style="width:100%;height:100px;display:flex;align-items:center;justify-content:center;color:#888;font-style:italic;">Aucune image dans la galerie</div>';
      return;
    }
    
    container.innerHTML = '';
    this.state.galleryImages.forEach((img, idx) => {
      const galleryItem = document.createElement('div');
      galleryItem.className = 'gallery-item';
      galleryItem.dataset.index = idx;
      galleryItem.style.position = 'relative';
      galleryItem.style.width = '100px';
      galleryItem.style.height = '100px';
      galleryItem.style.border = '2px solid #ddd';
      galleryItem.style.overflow = 'hidden';
      
      galleryItem.innerHTML = `
        <img src="${img}" alt="Image ${idx+1}" style="width:100%;height:100%;object-fit:cover;">
        <button type="button" class="gallery-delete-btn" data-index="${idx}" style="position:absolute;top:2px;right:2px;width:20px;height:20px;background:rgba(255,0,0,0.7);color:white;border:none;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>
      `;
      
      container.appendChild(galleryItem);
    });
  },
  
  // Sauvegarder un film
  saveFilm(film, win) {
    console.log(`💾 Sauvegarde du film: ${film.title}`);
    
    const isNewFilm = !this.state.films.some(f => f.id === film.id);
    
    if (isNewFilm) {
      // Ajouter le nouveau film
      this.state.films.push(film);
      win.querySelector('.admin-statusbar span:first-child').textContent = `Film "${film.title}" ajouté${film.gallery && film.gallery.length > 0 ? ` avec ${film.gallery.length} images dans la galerie` : ''}`;
    } else {
      // Mettre à jour le film existant
      this.state.films = this.state.films.map(f => f.id === film.id ? film : f);
      win.querySelector('.admin-statusbar span:first-child').textContent = `Film "${film.title}" mis à jour${film.gallery && film.gallery.length > 0 ? ` avec ${film.gallery.length} images dans la galerie` : ''}`;
    }
    
    // Réinitialiser après 3 secondes
    setTimeout(() => {
      win.querySelector('.admin-statusbar span:first-child').textContent = 'Prêt';
    }, 3000);
    
    // Mettre à jour l'affichage
    if (this.state.activeTab === 'films') {
      this.loadTab('films', win);
    }
    
    // Mettre à jour le compteur de films
    const filmCountElements = win.querySelectorAll('.film-count');
    filmCountElements.forEach(el => {
      el.textContent = this.state.films.length;
    });
  },
  
  // Charger un onglet spécifique
  loadTab(tabName, win) {
    console.log(`📂 Chargement de l'onglet: ${tabName}`);
    
    // Mettre à jour l'état
    this.state.activeTab = tabName;
    
    // Mettre à jour les boutons d'onglet
    const tabBtns = win.querySelectorAll('.admin-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Afficher le contenu correspondant
    const tabContents = win.querySelectorAll('.admin-tab-content');
    tabContents.forEach(tab => {
      if (tab.id === `${tabName}-tab`) {
        tab.style.display = 'block';
        
        // Mise à jour du contenu spécifique à l'onglet
        if (tabName === 'films') {
          this.updateFilmsTabContent(tab);
        }
      } else {
        tab.style.display = 'none';
      }
    });
  },
  
  // Mettre à jour le contenu de l'onglet Films
  updateFilmsTabContent(tabElement) {
    const tableBody = tabElement.querySelector('tbody');
    if (!tableBody) return;
    
    // Générer les lignes du tableau
    let tableContent = '';
    if (this.state.films.length === 0) {
      tableContent = `
        <tr>
          <td colspan="5" style="padding:15px;text-align:center;color:#666;">
            Aucun film disponible. Cliquez sur "Ajouter" pour créer votre premier film.
          </td>
        </tr>
      `;
    } else {
      tableContent = this.state.films.map(film => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px;">${film.title || 'Sans titre'}</td>
          <td style="padding:8px;">${film.director || '-'}</td>
          <td style="padding:8px;text-align:center;">${film.year || '-'}</td>
          <td style="padding:8px;text-align:center;">
            ${film.gallery && film.gallery.length > 0 
              ? `<span style="color:#4CAF50;font-weight:bold;" title="${film.gallery.length} images">✓ Galerie</span>` 
              : '-'}
          </td>
          <td style="padding:8px;text-align:center;">
            <button class="film-action-btn" data-action="edit" data-id="${film.id}" style="background:#0058a8;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
              Éditer
            </button>
            <button class="film-action-btn" data-action="delete" data-id="${film.id}" style="background:#f44336;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
              Suppr.
            </button>
          </td>
        </tr>
      `).join('');
    }
    
    tableBody.innerHTML = tableContent;
    
    // Attacher les gestionnaires d'événements
    const filmBtns = tabElement.querySelectorAll('.film-action-btn');
    filmBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const filmId = btn.getAttribute('data-id');
        this.handleFilmAction(action, filmId, tabElement.closest('.admin-panel-window'));
      });
    });
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
      
      // Ne pas commencer le drag si on clique sur un bouton
      if (e.target.closest('.xp-btn')) return;
      
      // Ne pas faire de drag si la fenêtre est maximisée
      if (element.classList.contains('maximized')) return;
      
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
};

// Exposer une fonction globale simple pour ouvrir le panneau admin
window.openAdminPanel = function() {
  // Utiliser AdminManager si disponible
  if (typeof window.AdminManager !== 'undefined' && typeof window.AdminManager.createPanel === 'function') {
    window.AdminManager.createPanel();
  } 
  // Utiliser WindowManager si disponible
  else if (typeof window.WindowManager !== 'undefined' && typeof window.WindowManager.createAdminPanelWindow === 'function') {
    window.WindowManager.createAdminPanelWindow();
  }
  // Utiliser showAdminTest si disponible
  else if (typeof window.showAdminTest === 'function') {
    window.showAdminTest();
  }
  // Fallback sur AdminSimple
  else {
    window.AdminSimple.createAdminPanel();
  }
};

// Exécuter automatiquement si chargé directement depuis admin-all-in-one.html
if (document.currentScript && document.currentScript.src.includes('admin-all-in-one.js')) {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(window.openAdminPanel, 100);
  } else {
    document.addEventListener('DOMContentLoaded', window.openAdminPanel);
  }
}
