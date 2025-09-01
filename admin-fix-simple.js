// Correctif simple pour remplacer entièrement la fonction createAdminPanelWindow

// Attendez que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("📝 Correctif admin chargé - Préparation du remplacement");
  
  // Attendre un peu pour s'assurer que toutes les autres définitions sont chargées
  setTimeout(function() {
    // Sauvegarder l'ancienne fonction au cas où
    if (typeof window.originalCreateAdminPanelWindow === 'undefined' && typeof window.createAdminPanelWindow === 'function') {
      window.originalCreateAdminPanelWindow = window.createAdminPanelWindow;
      console.log("📝 Fonction originale sauvegardée");
    }
    
    // Remplacer la fonction complètement
    window.createAdminPanelWindow = function() {
      console.log("📝 Création de la nouvelle fenêtre d'administration");
      
      // Créer le contenu HTML
      const content = `
        <div class="admin-panel">
          <div class="admin-toolbar" style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;flex-wrap:wrap;">
            <button id="btn-add-film" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Film</button>
            <button id="btn-list-films" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Films</button>
            <button id="btn-add-manga" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Manga</button>
            <button id="btn-list-mangas" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Mangas</button>
            <button id="btn-manage-tags" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Tags</button>
            <button id="btn-manage-icons" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Icônes</button>
            <button id="btn-manage-articles" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Articles</button>
            <button id="btn-manage-cv" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer CV</button>
            <button id="btn-github-token" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Token GitHub</button>
          </div>
          <div id="admin-content" style="padding:15px;height:calc(100% - 50px);overflow-y:auto;">
            <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
              Administration du site
            </h3>
            <p>Bienvenue dans le panneau d'administration. Utilisez les boutons ci-dessus pour gérer le contenu du site.</p>
          </div>
        </div>
      `;
      
      // Créer la fenêtre avec WindowManager
      try {
        const win = WindowManager.createWindow({
          title: 'Admin Panel',
          icon: 'icons/key.png',
          width: '750px',
          height: '550px',
          content: content
        });
        
        // Configurer les événements après l'ajout au DOM
        setTimeout(() => {
          console.log("📝 Configuration des événements de la fenêtre d'administration");
          
          // Bouton Ajouter Film
          const addFilmBtn = document.getElementById('btn-add-film');
          if (addFilmBtn) {
            addFilmBtn.addEventListener('click', () => {
              document.getElementById('admin-content').innerHTML = `
                <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
                  Ajouter un nouveau film
                </h3>
                <form id="add-film-form">
                  <div style="margin-bottom:15px;">
                    <label for="film-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
                    <input type="text" id="film-title" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                  </div>
                  <div style="margin-bottom:15px;">
                    <label for="film-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
                    <input type="number" id="film-note" min="0" max="5" value="0" style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                  </div>
                  <div style="margin-bottom:15px;">
                    <label for="film-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
                    <textarea id="film-critique" rows="4" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;"></textarea>
                  </div>
                  <div style="margin-bottom:15px;">
                    <label for="film-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
                    <input type="url" id="film-image" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                    
                    <div style="display:flex;gap:10px;margin-top:8px;">
                      <input type="file" id="film-image-upload" accept="image/*" style="display:none;">
                      <button type="button" id="browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
                        Parcourir...
                      </button>
                      <button type="button" id="upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
                        Upload
                      </button>
                    </div>
                  </div>
                  <div style="margin-bottom:15px;">
                    <label for="film-trailer" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la bande annonce</label>
                    <input type="url" id="film-trailer" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                  </div>
                  <div style="margin-top:20px;">
                    <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
                      Enregistrer
                    </button>
                  </div>
                </form>
              `;
              
              // Configurer les événements du formulaire...
              setupFilmFormEvents();
            });
          }
          
          // Gérer Films
          const listFilmsBtn = document.getElementById('btn-list-films');
          if (listFilmsBtn) {
            listFilmsBtn.addEventListener('click', () => {
              console.log("📝 Affichage de la liste des films");
              if (typeof DataManager !== 'undefined' && DataManager.data && DataManager.data.films) {
                showFilmsList();
              } else {
                document.getElementById('admin-content').innerHTML = '<p>Aucun film trouvé.</p>';
              }
            });
          }
          
          // Ajouter Manga
          const addMangaBtn = document.getElementById('btn-add-manga');
          if (addMangaBtn) {
            // Commenté pour éviter les conflits avec admin-panel-enhanced.js
            /*
            addMangaBtn.addEventListener('click', () => {
              console.log("📝 Affichage du formulaire d'ajout de manga");
              document.getElementById('admin-content').innerHTML = `
                <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
                  Ajouter un manga
                </h3>
                <p>Formulaire d'ajout de manga en cours de développement...</p>
              `;
            });
            */
          }
          
          // Gérer Mangas
          const listMangasBtn = document.getElementById('btn-list-mangas');
          if (listMangasBtn) {
            // Commenté pour éviter les conflits avec admin-panel-enhanced.js
            /*
            listMangasBtn.addEventListener('click', () => {
              console.log("📝 Affichage de la liste des mangas");
              document.getElementById('admin-content').innerHTML = `
                <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
                  Gérer les mangas
                </h3>
                <p>Liste des mangas en cours de développement...</p>
              `;
            });
            */
          }
          
          // Remarque: La gestion des tags est maintenant gérée par admin-panel-enhanced.js
          // Ce code est conservé pour référence mais désactivé
          /*
          const manageTagsBtn = document.getElementById('btn-manage-tags');
          if (manageTagsBtn) {
            manageTagsBtn.addEventListener('click', () => {
              console.log("📝 Redirection vers le gestionnaire de tags moderne");
              // La fonctionnalité est maintenant dans AdminPanelManager.loadTagsManager()
            });
          }
          */
          
          // Remarque: La gestion des icônes est maintenant gérée par admin-desktop-manager.js
          // Ce code est conservé pour référence mais désactivé
          /*
          const manageIconsBtn = document.getElementById('btn-manage-icons');
          if (manageIconsBtn) {
            manageIconsBtn.addEventListener('click', () => {
              console.log("📝 Redirection vers le gestionnaire d'icônes moderne");
              // La fonctionnalité est maintenant dans DesktopManagerAdmin.loadDesktopManager()
            });
          }
          */
          
          // Remarque: La gestion des articles est maintenant gérée par admin-panel-enhanced.js
          // Ce code est conservé pour référence mais désactivé
          /*
          const manageArticlesBtn = document.getElementById('btn-manage-articles');
          if (manageArticlesBtn) {
            manageArticlesBtn.addEventListener('click', () => {
              console.log("📝 Redirection vers le gestionnaire d'articles moderne");
              // La fonctionnalité est maintenant dans AdminPanelManager.loadArticlesManager()
            });
          }
          */
          
          // Remarque: La gestion du CV est maintenant gérée par admin-panel-enhanced.js
          // Ce code est conservé pour référence mais désactivé
          /*
          const manageCVBtn = document.getElementById('btn-manage-cv');
          if (manageCVBtn) {
            manageCVBtn.addEventListener('click', () => {
              console.log("📝 Redirection vers le gestionnaire de CV moderne");
              // La fonctionnalité est maintenant dans AdminPanelManager.loadCVManager()
            });
          }
          */
          
          // Token GitHub
          const githubTokenBtn = document.getElementById('btn-github-token');
          if (githubTokenBtn) {
            githubTokenBtn.addEventListener('click', () => {
              console.log("📝 Affichage du gestionnaire de token GitHub");
              document.getElementById('admin-content').innerHTML = `
                <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
                  Configuration du Token GitHub
                </h3>
                <p>Configurez votre token GitHub pour sauvegarder les modifications directement sur le repository.</p>
                <div style="margin-bottom:15px;">
                  <label for="github-token" style="display:block;margin-bottom:5px;font-weight:bold;">Token GitHub</label>
                  <input type="password" id="github-token" value="${localStorage.getItem('github_token') || ''}" 
                    style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                  <p style="font-size:0.9em;color:#555;margin-top:5px;">
                    Ce token sera stocké localement sur votre navigateur et utilisé pour les opérations GitHub.
                  </p>
                </div>
                <button id="save-token-btn" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
                  Enregistrer le token
                </button>
              `;
              
              // Configuration du bouton de sauvegarde du token
              const saveTokenBtn = document.getElementById('save-token-btn');
              if (saveTokenBtn) {
                saveTokenBtn.addEventListener('click', () => {
                  const token = document.getElementById('github-token').value;
                  localStorage.setItem('github_token', token);
                  alert('Token GitHub sauvegardé avec succès!');
                });
              }
            });
          }
          
        }, 200);
        
        return win;
      } catch (error) {
        console.error("📝 Erreur lors de la création de la fenêtre d'administration:", error);
        alert("Erreur lors de la création de la fenêtre d'administration. Voir la console pour plus de détails.");
        return null;
      }
    };
    
    console.log("📝 Fonction createAdminPanelWindow remplacée avec succès");
    
    // Fonction helper pour configurer les événements du formulaire d'ajout de film
    window.setupFilmFormEvents = function() {
      const browseBtn = document.getElementById('browse-btn');
      const imageUpload = document.getElementById('film-image-upload');
      const uploadBtn = document.getElementById('upload-btn');
      const imageInput = document.getElementById('film-image');
      
      if (browseBtn && imageUpload) {
        browseBtn.addEventListener('click', () => {
          imageUpload.click();
        });
      }
      
      if (uploadBtn && imageUpload) {
        uploadBtn.addEventListener('click', () => {
          if (imageUpload.files.length > 0) {
            if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
              const file = imageUpload.files[0];
              MediaManager.uploadImage(file).then(url => {
                if (url && imageInput) {
                  imageInput.value = url;
                  
                  // Ajouter un aperçu de l'image
                  const previewDiv = document.createElement('div');
                  previewDiv.style.marginTop = '10px';
                  previewDiv.style.border = '1px solid #ACA899';
                  previewDiv.style.padding = '8px';
                  previewDiv.style.background = '#fff';
                  
                  previewDiv.innerHTML = `
                    <p style="margin:0 0 5px 0;font-weight:bold;">Image uploadée:</p>
                    <img src="${url}" alt="Aperçu" style="max-width:200px;max-height:120px;">
                  `;
                  
                  // Remplacer l'aperçu existant ou ajouter le nouveau
                  const existingPreview = imageInput.parentElement.querySelector('div[style*="margin-top:10px"]');
                  if (existingPreview) {
                    imageInput.parentElement.replaceChild(previewDiv, existingPreview);
                  } else {
                    imageInput.parentElement.appendChild(previewDiv);
                  }
                }
              }).catch(error => {
                alert("Erreur lors de l'upload: " + error.message);
              });
            } else {
              alert("Fonctionnalité d'upload non disponible");
            }
          } else {
            alert("Veuillez d'abord sélectionner une image");
          }
        });
      }
      
      const form = document.getElementById('add-film-form');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const newFilm = {
            id: Date.now(),
            titre: document.getElementById('film-title').value,
            note: parseInt(document.getElementById('film-note').value) || 0,
            critique: document.getElementById('film-critique').value,
            image: document.getElementById('film-image').value,
            bandeAnnonce: document.getElementById('film-trailer').value,
            galerie: [],
            liens: []
          };
          
          // Ajouter le film à la base de données
          if (typeof DataManager !== 'undefined') {
            if (!DataManager.data.films) {
              DataManager.data.films = [];
            }
            
            DataManager.data.films.push(newFilm);
            
            // Sauvegarder les données
            if (typeof DataManager.saveDataLocally === 'function') {
              DataManager.saveDataLocally();
              alert('Film ajouté avec succès!');
              
              // Réinitialiser le formulaire
              this.reset();
            } else {
              alert('Film ajouté, mais impossible de sauvegarder les données.');
            }
          } else {
            alert("Erreur: Le gestionnaire de données n'est pas disponible.");
          }
        });
      }
    };
    
    // Fonction helper pour afficher la liste des films
    window.showFilmsList = function() {
      const adminContent = document.getElementById('admin-content');
      if (!adminContent) return;
      
      let filmsListHTML = '<h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">Liste des films</h3>';
      
      if (DataManager.data.films && DataManager.data.films.length > 0) {
        filmsListHTML += '<table style="width:100%;border-collapse:collapse;">';
        filmsListHTML += '<tr style="background:#ECE9D8;"><th style="padding:8px;text-align:left;">Titre</th><th style="padding:8px;text-align:center;">Note</th><th style="padding:8px;text-align:center;">Actions</th></tr>';
        
        DataManager.data.films.forEach(film => {
          filmsListHTML += `
            <tr style="border-bottom:1px solid #ddd;">
              <td style="padding:8px;">${film.titre}</td>
              <td style="padding:8px;text-align:center;">${film.note}/5</td>
              <td style="padding:8px;text-align:center;">
                <button onclick="editFilm(${film.id})" style="background:#3498db;color:white;border:none;border-radius:3px;padding:2px 8px;margin-right:5px;cursor:pointer;">Éditer</button>
                <button onclick="deleteFilm(${film.id})" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">Supprimer</button>
              </td>
            </tr>
          `;
        });
        
        filmsListHTML += '</table>';
      } else {
        filmsListHTML += '<p>Aucun film n\'a été ajouté.</p>';
      }
      
      filmsListHTML += `
        <div style="margin-top:15px;">
          <button onclick="document.getElementById('btn-add-film').click()" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Ajouter un nouveau film
          </button>
        </div>
      `;
      
      adminContent.innerHTML = filmsListHTML;
    };
    
    // Fonction pour éditer un film
    window.editFilm = function(filmId) {
      // Redirection vers la fonction d'édition de film dans admin-panel-enhanced.js
      if (typeof AdminPanelManager !== 'undefined' && typeof AdminPanelManager.loadFilmForm === 'function') {
        AdminPanelManager.loadFilmForm(filmId);
      } else {
        console.error("AdminPanelManager.loadFilmForm n'est pas disponible");
        alert('Impossible de charger le formulaire d\'édition. Veuillez vérifier la console.');
      }
    };
    
    // Fonction pour supprimer un film
    window.deleteFilm = function(filmId) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce film?')) {
        if (DataManager && DataManager.data && DataManager.data.films) {
          DataManager.data.films = DataManager.data.films.filter(film => film.id !== filmId);
          
          if (typeof DataManager.saveDataLocally === 'function') {
            DataManager.saveDataLocally();
            alert('Film supprimé avec succès!');
            showFilmsList();
          } else {
            alert('Film supprimé, mais impossible de sauvegarder les données.');
          }
        }
      }
    };
    
  }, 500);
});

console.log("📝 Fichier admin-fix-simple.js chargé");
