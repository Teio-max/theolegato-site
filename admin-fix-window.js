// Solution complète pour le panneau d'administration avec WindowManager
// et fonctionnalités complètes - Version améliorée

// Sauvegarde de la fonction originale au cas où
window.originalCreateAdminPanelWindow = window.createAdminPanelWindow;

// Nouvelle implémentation utilisant WindowManager
window.createAdminPanelWindow = function(editFilmId = null) {
  // Préparer le contenu de la fenêtre
  let filmToEdit = null;
  if (editFilmId && typeof films !== 'undefined') {
    filmToEdit = films.find(f => f.id === editFilmId);
  }
  
  // Créer le contenu HTML de la fenêtre d'administration
  const content = `
    <div class="admin-panel">
      <div class="admin-toolbar" style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;flex-wrap:wrap;">
        <button id="btn-add-film" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Film</button>
        <button id="btn-list-films" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Films</button>
        <button id="btn-add-manga" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Manga</button>
        <button id="btn-list-mangas" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Mangas</button>
        <button id="btn-manage-tags" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Tags</button>
        <button id="btn-manage-icons" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Icônes</button>
        <button id="btn-github-token" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Token GitHub</button>
        <button id="btn-manage-articles" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Articles</button>
        <button id="btn-manage-cv" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer CV</button>
      </div>
      <div id="admin-content" style="padding:15px;height:calc(100% - 50px);overflow-y:auto;">
        <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
          ${editFilmId ? 'Modifier' : 'Ajouter'} un film
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
            ${editFilmId ? `
            <button type="button" id="film-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Annuler
            </button>
            ` : ''}
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Créer la fenêtre en utilisant WindowManager
  const win = WindowManager.createWindow({
    title: 'Admin Panel',
    icon: 'icons/key.png',
    width: '700px',
    height: '500px',
    content: content
  });
  
  const winId = win.id;
  
  // Configurer les événements après l'ajout au DOM
  setTimeout(() => {
    // Gestion du bouton parcourir
    const browseBtn = document.getElementById(`film-browse-btn`);
    const imageUpload = document.getElementById(`film-image-upload`);
    
    if (browseBtn && imageUpload) {
      browseBtn.addEventListener('click', () => {
        imageUpload.click();
      });
    }
    
    // Gestion du bouton upload
    const uploadBtn = document.getElementById(`film-upload-btn`);
    const imageInput = document.getElementById(`film-image`);
    if (uploadBtn && imageUpload) {
      uploadBtn.addEventListener('click', () => {
        if (imageUpload.files.length > 0) {
          // Utiliser la fonction d'upload existante si elle existe
          if (typeof uploadFilmImage === 'function') {
            uploadFilmImage(winId);
          } else if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
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
    
    // Traitement du formulaire de film
    const form = document.getElementById(`film-form`);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Création de l'objet film
        const filmData = {
          id: filmToEdit ? filmToEdit.id : Date.now(),
          titre: document.getElementById(`film-titre`).value,
          note: parseInt(document.getElementById(`film-note`).value) || 0,
          critique: document.getElementById(`film-critique`).value,
          image: document.getElementById(`film-image`).value,
          bandeAnnonce: document.getElementById(`film-bande-annonce`).value,
          galerie: filmToEdit ? filmToEdit.galerie || [] : [],
          liens: filmToEdit ? filmToEdit.liens || [] : []
        };
        
        // Ajouter ou mettre à jour le film
        if (typeof films !== 'undefined') {
          if (filmToEdit) {
            // Mettre à jour le film existant
            const index = films.findIndex(f => f.id === filmToEdit.id);
            if (index !== -1) {
              films[index] = filmData;
            }
          } else {
            // Ajouter un nouveau film
            films.push(filmData);
          }
          
          // Sauvegarder les données
          if (typeof saveDataToGitHub === 'function') {
            saveDataToGitHub();
            if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
              UIManager.showNotification('Film sauvegardé avec succès sur GitHub', 'success');
            } else {
              alert('Film sauvegardé avec succès sur GitHub');
            }
          } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
            DataManager.saveDataLocally();
            if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
              UIManager.showNotification('Film sauvegardé localement', 'success');
            } else {
              alert('Film sauvegardé localement');
            }
          } else {
            alert("Erreur: Aucune fonction de sauvegarde trouvée");
          }
          
          // Rafraîchir la liste si elle est ouverte
          if (typeof renderFilmsList === 'function') {
            renderFilmsList();
          }
        } else {
          alert("Erreur: La variable 'films' n'est pas définie");
        }
      });
    }
    
    // Gestion du bouton annuler
    const cancelBtn = document.getElementById(`film-cancel-btn`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        WindowManager.closeWindow(winId);
      });
    }
    
    // Gestion des boutons de la barre d'outils
    const addFilmBtn = document.getElementById(`btn-add-film`);
    const listFilmsBtn = document.getElementById(`btn-list-films`);
    const addMangaBtn = document.getElementById(`btn-add-manga`);
    const listMangasBtn = document.getElementById(`btn-list-mangas`);
    const manageTagsBtn = document.getElementById(`btn-manage-tags`);
    const manageIconsBtn = document.getElementById(`btn-manage-icons`);
    const githubTokenBtn = document.getElementById(`btn-github-token`);
    
    if (addFilmBtn) {
      addFilmBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showAddFilmFormImproved();
      });
    }
    
    if (listFilmsBtn) {
      listFilmsBtn.addEventListener('click', () => {
        // Afficher la liste des films à gérer
        showManageFilmsForm();
      });
    }
    
    if (addMangaBtn) {
      addMangaBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showAddMangaFormImproved();
      });
    }
    
    if (listMangasBtn) {
      listMangasBtn.addEventListener('click', () => {
        // Afficher la liste des mangas à gérer
        showManageMangasForm();
      });
    }
    
    if (manageTagsBtn) {
      manageTagsBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showManageTagsFormImproved();
      });
    }
    
    if (manageIconsBtn) {
      manageIconsBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showManageIconsForm();
      });
    }
    
    if (githubTokenBtn) {
      githubTokenBtn.addEventListener('click', () => {
        // Afficher le formulaire de configuration du token GitHub
        showGithubTokenForm();
      });
    }
  }, 100);
  
  return win;
};

// Fonction améliorée pour afficher le formulaire d'ajout de film
function showAddFilmFormImproved() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
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
  
  // Configurer les événements après l'ajout au DOM
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
  
  document.getElementById('add-film-form').addEventListener('submit', function(e) {
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
    
    // Ajouter le nouveau film
    if (typeof films !== 'undefined') {
      films.push(newFilm);
      
      // Sauvegarder les données
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Film ajouté avec succès sur GitHub', 'success');
        } else {
          alert('Film ajouté avec succès sur GitHub');
        }
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Film ajouté localement', 'success');
        } else {
          alert('Film ajouté localement');
        }
      } else {
        alert("Film ajouté mais aucune fonction de sauvegarde trouvée");
      }
      
      // Rafraîchir la liste si elle est ouverte
      if (typeof renderFilmsList === 'function') {
        renderFilmsList();
      }
      
      // Réinitialiser le formulaire
      this.reset();
      
      // Retirer l'aperçu de l'image
      const imagePreview = document.querySelector('div[style*="margin-top:10px"]');
      if (imagePreview) {
        imagePreview.remove();
      }
    } else {
      alert("Erreur: la variable 'films' n'est pas définie");
    }
  });
}

// Fonction pour gérer les films existants
function showManageFilmsForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  let filmsHTML = '';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.films && DataManager.data.films.length) {
    filmsHTML = `
      <div class="films-list" style="margin-bottom:20px;height:350px;overflow-y:auto;border:1px solid #ACA899;padding:10px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#ECE9D8;font-weight:bold;border-bottom:2px solid #ACA899;">
              <th style="padding:8px;text-align:left;">Titre</th>
              <th style="padding:8px;text-align:center;">Note</th>
              <th style="padding:8px;text-align:center;">Image</th>
              <th style="padding:8px;text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    DataManager.data.films.forEach(film => {
      const stars = '★'.repeat(film.note) + '☆'.repeat(5 - film.note);
      
      filmsHTML += `
        <tr style="border-bottom:1px solid #ACA899;">
          <td style="padding:8px;text-align:left;">${film.titre}</td>
          <td style="padding:8px;text-align:center;">${stars}</td>
          <td style="padding:8px;text-align:center;">
            ${film.image ? `<img src="${film.image}" alt="${film.titre}" style="max-width:50px;max-height:50px;">` : 'Aucune'}
          </td>
          <td style="padding:8px;text-align:center;">
            <button class="btn-edit-film" data-id="${film.id}" style="background:#3498db;color:white;border:none;border-radius:3px;padding:2px 8px;margin-right:5px;cursor:pointer;">Éditer</button>
            <button class="btn-delete-film" data-id="${film.id}" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">Supprimer</button>
          </td>
        </tr>
      `;
    });
    
    filmsHTML += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    filmsHTML = '<p>Aucun film trouvé dans la base de données.</p>';
  }
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer les films
    </h3>
    ${filmsHTML}
    <div style="margin-top:15px;">
      <button id="btn-return-add-film" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
        Ajouter un nouveau film
      </button>
    </div>
  `;
  
  // Configurer les événements après l'ajout au DOM
  document.querySelectorAll('.btn-edit-film').forEach(btn => {
    btn.addEventListener('click', function() {
      const filmId = parseInt(this.getAttribute('data-id'));
      editFilm(filmId);
    });
  });
  
  document.querySelectorAll('.btn-delete-film').forEach(btn => {
    btn.addEventListener('click', function() {
      const filmId = parseInt(this.getAttribute('data-id'));
      const film = DataManager.data.films.find(f => f.id === filmId);
      
      if (confirm(`Êtes-vous sûr de vouloir supprimer le film "${film.titre}" ?`)) {
        DataManager.data.films = DataManager.data.films.filter(f => f.id !== filmId);
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
          DataManager.saveDataLocally();
        }
        
        // Rafraîchir la liste
        showManageFilmsForm();
        
        // Rafraîchir la liste des films si elle est ouverte
        if (typeof renderFilmsList === 'function') {
          renderFilmsList();
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Film supprimé avec succès', 'success');
        } else {
          alert('Film supprimé avec succès');
        }
      }
    });
  });
  
  const returnButton = document.getElementById('btn-return-add-film');
  if (returnButton) {
    returnButton.addEventListener('click', () => {
      showAddFilmFormImproved();
    });
  }
}

// Fonction pour éditer un film existant
function editFilm(filmId) {
  if (!DataManager.data.films) return;
  
  const film = DataManager.data.films.find(f => f.id === filmId);
  if (!film) {
    alert('Film non trouvé.');
    return;
  }
  
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Modifier le film "${film.titre}"
    </h3>
    <form id="edit-film-form">
      <div style="margin-bottom:15px;">
        <label for="film-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
        <input type="text" id="film-title" required value="${film.titre}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="film-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
        <input type="number" id="film-note" min="0" max="5" value="${film.note}" style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="film-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
        <textarea id="film-critique" rows="4" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${film.critique || ''}</textarea>
      </div>
      <div style="margin-bottom:15px;">
        <label for="film-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
        <input type="url" id="film-image" value="${film.image || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="film-image-upload" accept="image/*" style="display:none;">
          <button type="button" id="browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Parcourir...
          </button>
          <button type="button" id="upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
        </div>
        
        ${film.image ? `
        <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
          <p style="margin:0 0 5px 0;font-weight:bold;">Image actuelle:</p>
          <img src="${film.image}" alt="Aperçu" style="max-width:200px;max-height:120px;">
        </div>
        ` : ''}
      </div>
      <div style="margin-bottom:15px;">
        <label for="film-trailer" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la bande annonce</label>
        <input type="url" id="film-trailer" value="${film.bandeAnnonce || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer les modifications
        </button>
        <button type="button" id="cancel-edit-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Annuler
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
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
              
              // Mettre à jour l'aperçu de l'image
              const previewImage = document.querySelector('div[style*="margin-top:10px"] img');
              if (previewImage) {
                previewImage.src = url;
              } else {
                // Créer un nouvel aperçu
                const previewDiv = document.createElement('div');
                previewDiv.style.marginTop = '10px';
                previewDiv.style.border = '1px solid #ACA899';
                previewDiv.style.padding = '8px';
                previewDiv.style.background = '#fff';
                
                previewDiv.innerHTML = `
                  <p style="margin:0 0 5px 0;font-weight:bold;">Image uploadée:</p>
                  <img src="${url}" alt="Aperçu" style="max-width:200px;max-height:120px;">
                `;
                
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
  
  document.getElementById('edit-film-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mettre à jour les données du film
    film.titre = document.getElementById('film-title').value;
    film.note = parseInt(document.getElementById('film-note').value) || 0;
    film.critique = document.getElementById('film-critique').value;
    film.image = document.getElementById('film-image').value;
    film.bandeAnnonce = document.getElementById('film-trailer').value;
    
    // Sauvegarder les données
    if (typeof saveDataToGitHub === 'function') {
      saveDataToGitHub();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Film modifié avec succès sur GitHub', 'success');
      } else {
        alert('Film modifié avec succès sur GitHub');
      }
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Film modifié localement', 'success');
      } else {
        alert('Film modifié localement');
      }
    } else {
      alert("Film modifié mais aucune fonction de sauvegarde trouvée");
    }
    
    // Rafraîchir la liste si elle est ouverte
    if (typeof renderFilmsList === 'function') {
      renderFilmsList();
    }
    
    // Retourner à la liste des films
    showManageFilmsForm();
  });
  
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    showManageFilmsForm();
  });
}

// Fonction améliorée pour afficher le formulaire d'ajout de manga
function showAddMangaFormImproved() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Ajouter un nouveau manga
    </h3>
    <form id="add-manga-form">
      <div style="margin-bottom:15px;">
        <label for="manga-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
        <input type="text" id="manga-title" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
        <input type="number" id="manga-note" min="0" max="5" value="0" style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-auteur" style="display:block;margin-bottom:5px;font-weight:bold;">Auteur</label>
        <input type="text" id="manga-auteur" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-statut" style="display:block;margin-bottom:5px;font-weight:bold;">Statut</label>
        <select id="manga-statut" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
          <option value="En pause">En pause</option>
        </select>
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-chapitres" style="display:block;margin-bottom:5px;font-weight:bold;">Nombre de chapitres</label>
        <input type="number" id="manga-chapitres" min="0" style="width:80px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
        <input type="url" id="manga-image" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="manga-image-upload" accept="image/*" style="display:none;">
          <button type="button" id="manga-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Parcourir...
          </button>
          <button type="button" id="manga-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
        </div>
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('manga-browse-btn');
  const imageUpload = document.getElementById('manga-image-upload');
  const uploadBtn = document.getElementById('manga-upload-btn');
  const imageInput = document.getElementById('manga-image');
  
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
          MediaManager.uploadImage(file, 'images/manga').then(url => {
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
  
  document.getElementById('add-manga-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newManga = {
      id: Date.now(),
      titre: document.getElementById('manga-title').value,
      note: parseInt(document.getElementById('manga-note').value) || 0,
      auteur: document.getElementById('manga-auteur').value,
      statut: document.getElementById('manga-statut').value,
      chapitres: parseInt(document.getElementById('manga-chapitres').value) || 0,
      image: document.getElementById('manga-image').value,
      galerie: [],
      liens: []
    };
    
    // Ajouter le nouveau manga
    if (typeof DataManager !== 'undefined') {
      if (!DataManager.data.mangas) {
        DataManager.data.mangas = [];
      }
      
      DataManager.data.mangas.push(newManga);
      
      // Sauvegarder les données
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Manga ajouté avec succès sur GitHub', 'success');
        } else {
          alert('Manga ajouté avec succès sur GitHub');
        }
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Manga ajouté localement', 'success');
        } else {
          alert('Manga ajouté localement');
        }
      } else {
        alert("Manga ajouté mais aucune fonction de sauvegarde trouvée");
      }
      
      // Rafraîchir la liste si elle est ouverte
      if (typeof renderMangaList === 'function') {
        renderMangaList();
      }
      
      // Réinitialiser le formulaire
      this.reset();
      
      // Retirer l'aperçu de l'image
      const imagePreview = document.querySelector('div[style*="margin-top:10px"]');
      if (imagePreview) {
        imagePreview.remove();
      }
    } else {
      alert("Erreur: Le gestionnaire de données n'est pas défini");
    }
  });
}

// Fonction pour gérer les mangas existants
function showManageMangasForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  let mangasHTML = '';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.mangas && DataManager.data.mangas.length) {
    mangasHTML = `
      <div class="mangas-list" style="margin-bottom:20px;height:350px;overflow-y:auto;border:1px solid #ACA899;padding:10px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#ECE9D8;font-weight:bold;border-bottom:2px solid #ACA899;">
              <th style="padding:8px;text-align:left;">Titre</th>
              <th style="padding:8px;text-align:center;">Note</th>
              <th style="padding:8px;text-align:center;">Auteur</th>
              <th style="padding:8px;text-align:center;">Statut</th>
              <th style="padding:8px;text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    DataManager.data.mangas.forEach(manga => {
      const stars = '★'.repeat(manga.note) + '☆'.repeat(5 - manga.note);
      
      mangasHTML += `
        <tr style="border-bottom:1px solid #ACA899;">
          <td style="padding:8px;text-align:left;">${manga.titre}</td>
          <td style="padding:8px;text-align:center;">${stars}</td>
          <td style="padding:8px;text-align:center;">${manga.auteur || '-'}</td>
          <td style="padding:8px;text-align:center;">
            <span style="
              background:${manga.statut === 'En cours' ? '#2ecc71' : (manga.statut === 'Terminé' ? '#3498db' : '#f39c12')};
              color:white;
              padding:2px 6px;
              border-radius:3px;
              font-size:0.9em;
            ">${manga.statut}</span>
          </td>
          <td style="padding:8px;text-align:center;">
            <button class="btn-edit-manga" data-id="${manga.id}" style="background:#3498db;color:white;border:none;border-radius:3px;padding:2px 8px;margin-right:5px;cursor:pointer;">Éditer</button>
            <button class="btn-delete-manga" data-id="${manga.id}" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">Supprimer</button>
          </td>
        </tr>
      `;
    });
    
    mangasHTML += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    mangasHTML = '<p>Aucun manga trouvé dans la base de données.</p>';
  }
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer les mangas
    </h3>
    ${mangasHTML}
    <div style="margin-top:15px;">
      <button id="btn-return-add-manga" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
        Ajouter un nouveau manga
      </button>
    </div>
  `;
  
  // Configurer les événements après l'ajout au DOM
  document.querySelectorAll('.btn-edit-manga').forEach(btn => {
    btn.addEventListener('click', function() {
      const mangaId = parseInt(this.getAttribute('data-id'));
      editManga(mangaId);
    });
  });
  
  document.querySelectorAll('.btn-delete-manga').forEach(btn => {
    btn.addEventListener('click', function() {
      const mangaId = parseInt(this.getAttribute('data-id'));
      const manga = DataManager.data.mangas.find(m => m.id === mangaId);
      
      if (confirm(`Êtes-vous sûr de vouloir supprimer le manga "${manga.titre}" ?`)) {
        DataManager.data.mangas = DataManager.data.mangas.filter(m => m.id !== mangaId);
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
          DataManager.saveDataLocally();
        }
        
        // Rafraîchir la liste
        showManageMangasForm();
        
        // Rafraîchir la liste des mangas si elle est ouverte
        if (typeof renderMangaList === 'function') {
          renderMangaList();
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Manga supprimé avec succès', 'success');
        } else {
          alert('Manga supprimé avec succès');
        }
      }
    });
  });
  
  const returnButton = document.getElementById('btn-return-add-manga');
  if (returnButton) {
    returnButton.addEventListener('click', () => {
      showAddMangaFormImproved();
    });
  }
}

// Fonction pour éditer un manga existant
function editManga(mangaId) {
  if (!DataManager.data.mangas) return;
  
  const manga = DataManager.data.mangas.find(m => m.id === mangaId);
  if (!manga) {
    alert('Manga non trouvé.');
    return;
  }
  
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Modifier le manga "${manga.titre}"
    </h3>
    <form id="edit-manga-form">
      <div style="margin-bottom:15px;">
        <label for="manga-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
        <input type="text" id="manga-title" required value="${manga.titre}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
        <input type="number" id="manga-note" min="0" max="5" value="${manga.note}" style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-auteur" style="display:block;margin-bottom:5px;font-weight:bold;">Auteur</label>
        <input type="text" id="manga-auteur" value="${manga.auteur || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-statut" style="display:block;margin-bottom:5px;font-weight:bold;">Statut</label>
        <select id="manga-statut" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          <option value="En cours" ${manga.statut === 'En cours' ? 'selected' : ''}>En cours</option>
          <option value="Terminé" ${manga.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
          <option value="En pause" ${manga.statut === 'En pause' ? 'selected' : ''}>En pause</option>
        </select>
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-chapitres" style="display:block;margin-bottom:5px;font-weight:bold;">Nombre de chapitres</label>
        <input type="number" id="manga-chapitres" min="0" value="${manga.chapitres || 0}" style="width:80px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="manga-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
        <input type="url" id="manga-image" value="${manga.image || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="manga-image-upload" accept="image/*" style="display:none;">
          <button type="button" id="manga-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Parcourir...
          </button>
          <button type="button" id="manga-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
        </div>
        
        ${manga.image ? `
        <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
          <p style="margin:0 0 5px 0;font-weight:bold;">Image actuelle:</p>
          <img src="${manga.image}" alt="Aperçu" style="max-width:200px;max-height:120px;">
        </div>
        ` : ''}
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer les modifications
        </button>
        <button type="button" id="cancel-edit-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Annuler
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('manga-browse-btn');
  const imageUpload = document.getElementById('manga-image-upload');
  const uploadBtn = document.getElementById('manga-upload-btn');
  const imageInput = document.getElementById('manga-image');
  
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
          MediaManager.uploadImage(file, 'images/manga').then(url => {
            if (url && imageInput) {
              imageInput.value = url;
              
              // Mettre à jour l'aperçu de l'image
              const previewImage = document.querySelector('div[style*="margin-top:10px"] img');
              if (previewImage) {
                previewImage.src = url;
              } else {
                // Créer un nouvel aperçu
                const previewDiv = document.createElement('div');
                previewDiv.style.marginTop = '10px';
                previewDiv.style.border = '1px solid #ACA899';
                previewDiv.style.padding = '8px';
                previewDiv.style.background = '#fff';
                
                previewDiv.innerHTML = `
                  <p style="margin:0 0 5px 0;font-weight:bold;">Image uploadée:</p>
                  <img src="${url}" alt="Aperçu" style="max-width:200px;max-height:120px;">
                `;
                
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
  
  document.getElementById('edit-manga-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mettre à jour les données du manga
    manga.titre = document.getElementById('manga-title').value;
    manga.note = parseInt(document.getElementById('manga-note').value) || 0;
    manga.auteur = document.getElementById('manga-auteur').value;
    manga.statut = document.getElementById('manga-statut').value;
    manga.chapitres = parseInt(document.getElementById('manga-chapitres').value) || 0;
    manga.image = document.getElementById('manga-image').value;
    
    // Sauvegarder les données
    if (typeof saveDataToGitHub === 'function') {
      saveDataToGitHub();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Manga modifié avec succès sur GitHub', 'success');
      } else {
        alert('Manga modifié avec succès sur GitHub');
      }
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Manga modifié localement', 'success');
      } else {
        alert('Manga modifié localement');
      }
    } else {
      alert("Manga modifié mais aucune fonction de sauvegarde trouvée");
    }
    
    // Rafraîchir la liste si elle est ouverte
    if (typeof renderMangaList === 'function') {
      renderMangaList();
    }
    
    // Retourner à la liste des mangas
    showManageMangasForm();
  });
  
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    showManageMangasForm();
  });
}

// Fonction améliorée pour gérer les tags
function showManageTagsFormImproved() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Préparer l'affichage des tags
  let tagsHTML = '<div class="tags-list" style="margin-bottom:20px;max-height:200px;overflow-y:auto;">';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.tags && DataManager.data.tags.length) {
    tagsHTML += `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#ECE9D8;font-weight:bold;border-bottom:2px solid #ACA899;">
            <th style="padding:8px;text-align:left;">Nom</th>
            <th style="padding:8px;text-align:center;">Couleur</th>
            <th style="padding:8px;text-align:center;">Catégorie</th>
            <th style="padding:8px;text-align:center;">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    DataManager.data.tags.forEach(tag => {
      tagsHTML += `
        <tr style="border-bottom:1px solid #ACA899;">
          <td style="padding:8px;text-align:left;">${tag.name}</td>
          <td style="padding:8px;text-align:center;">
            <span style="display:inline-block;width:20px;height:20px;background:${tag.color};border-radius:3px;"></span>
            <span style="font-size:0.8em;color:#555;">${tag.color}</span>
          </td>
          <td style="padding:8px;text-align:center;">${tag.category || 'Non spécifié'}</td>
// Fonction pour gérer les articles
function showManageArticlesForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Préparer la liste des articles existants
  let articlesHTML = '';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.articles && DataManager.data.articles.length) {
    articlesHTML = `
      <div class="articles-list" style="margin-bottom:20px;max-height:200px;overflow-y:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#ECE9D8;font-weight:bold;border-bottom:2px solid #ACA899;">
              <th style="padding:8px;text-align:left;">Titre</th>
              <th style="padding:8px;text-align:center;">Date</th>
              <th style="padding:8px;text-align:center;">PDF</th>
              <th style="padding:8px;text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    DataManager.data.articles.forEach(article => {
      articlesHTML += `
        <tr style="border-bottom:1px solid #ACA899;">
          <td style="padding:8px;text-align:left;">${article.titre}</td>
          <td style="padding:8px;text-align:center;">${article.date || '-'}</td>
          <td style="padding:8px;text-align:center;">
            ${article.pdfUrl ? '<span style="color:green;">✓</span>' : '<span style="color:red;">✕</span>'}
          </td>
          <td style="padding:8px;text-align:center;">
            <button class="btn-edit-article" data-id="${article.id}" style="background:#3498db;color:white;border:none;border-radius:3px;padding:2px 8px;margin-right:5px;cursor:pointer;">Éditer</button>
            <button class="btn-delete-article" data-id="${article.id}" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">Supprimer</button>
          </td>
        </tr>
      `;
    });
    
    articlesHTML += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    articlesHTML = '<p>Aucun article trouvé dans la base de données.</p>';
  }
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer les articles
    </h3>
    ${articlesHTML}
    <h4 style="color:#0058a8;margin-top:15px;margin-bottom:15px;">Ajouter un nouvel article</h4>
    <form id="add-article-form">
      <div style="margin-bottom:15px;">
        <label for="article-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
        <input type="text" id="article-title" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-date" style="display:block;margin-bottom:5px;font-weight:bold;">Date</label>
        <input type="date" id="article-date" style="width:200px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-categorie" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie</label>
        <input type="text" id="article-categorie" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label style="display:block;margin-bottom:5px;font-weight:bold;">PDF de l'article</label>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="article-pdf-upload" accept="application/pdf" style="display:none;">
          <button type="button" id="article-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Sélectionner un PDF
          </button>
          <button type="button" id="article-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
          <span id="article-pdf-name" style="line-height:28px;"></span>
        </div>
        <input type="hidden" id="article-pdf-url">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-description" style="display:block;margin-bottom:5px;font-weight:bold;">Description</label>
        <textarea id="article-description" rows="3" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;"></textarea>
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Ajouter
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('article-browse-btn');
  const pdfUpload = document.getElementById('article-pdf-upload');
  const uploadBtn = document.getElementById('article-upload-btn');
  const pdfName = document.getElementById('article-pdf-name');
  const pdfUrl = document.getElementById('article-pdf-url');
  
  if (browseBtn && pdfUpload) {
    browseBtn.addEventListener('click', () => {
      pdfUpload.click();
    });
  }
  
  if (pdfUpload) {
    pdfUpload.addEventListener('change', () => {
      if (pdfUpload.files.length > 0) {
        pdfName.textContent = pdfUpload.files[0].name;
      }
    });
  }
  
  if (uploadBtn && pdfUpload) {
    uploadBtn.addEventListener('click', () => {
      if (pdfUpload.files.length > 0) {
        if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
          const file = pdfUpload.files[0];
          
          // Montrer un indicateur de chargement
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Chargement...";
          
          MediaManager.uploadImage(file, 'files/articles').then(url => {
            if (url && pdfUrl) {
              pdfUrl.value = url;
              uploadBtn.textContent = "✅ Uploadé";
              uploadBtn.style.background = "#27ae60";
              if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification('PDF uploadé avec succès', 'success');
              }
            }
          }).catch(error => {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Réessayer";
            uploadBtn.style.background = "#e74c3c";
            alert("Erreur lors de l'upload: " + error.message);
          });
        } else {
          alert("Fonctionnalité d'upload non disponible");
        }
      } else {
        alert("Veuillez d'abord sélectionner un fichier PDF");
      }
    });
  }
  
  // Configurer les événements pour les boutons d'édition et de suppression
  document.querySelectorAll('.btn-edit-article').forEach(btn => {
    btn.addEventListener('click', function() {
      const articleId = parseInt(this.getAttribute('data-id'));
      editArticle(articleId);
    });
  });
  
  document.querySelectorAll('.btn-delete-article').forEach(btn => {
    btn.addEventListener('click', function() {
      const articleId = parseInt(this.getAttribute('data-id'));
      const article = DataManager.data.articles.find(a => a.id === articleId);
      
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.titre}" ?`)) {
        DataManager.data.articles = DataManager.data.articles.filter(a => a.id !== articleId);
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
          DataManager.saveDataLocally();
        }
        
        // Rafraîchir la liste
        showManageArticlesForm();
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Article supprimé avec succès', 'success');
        } else {
          alert('Article supprimé avec succès');
        }
      }
    });
  });
  
  // Soumettre le formulaire
  document.getElementById('add-article-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!pdfUrl.value) {
      alert("Veuillez uploader un PDF pour cet article.");
      return;
    }
    
    const newArticle = {
      id: Date.now(),
      titre: document.getElementById('article-title').value,
      date: document.getElementById('article-date').value || new Date().toISOString().split('T')[0],
      categorie: document.getElementById('article-categorie').value || 'Non classé',
      contenu: document.getElementById('article-description').value || '',
      pdfUrl: pdfUrl.value,
      image: ''
    };
    
    // Ajouter le nouvel article
    if (typeof DataManager !== 'undefined') {
      if (!DataManager.data.articles) {
        DataManager.data.articles = [];
      }
      
      DataManager.data.articles.push(newArticle);
      
      // Sauvegarder les données
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Article ajouté avec succès sur GitHub', 'success');
        } else {
          alert('Article ajouté avec succès sur GitHub');
        }
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Article ajouté localement', 'success');
        } else {
          alert('Article ajouté localement');
        }
      } else {
        alert("Article ajouté mais aucune fonction de sauvegarde trouvée");
      }
      
      // Réinitialiser le formulaire
      this.reset();
      pdfName.textContent = "";
      pdfUrl.value = "";
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload";
      uploadBtn.style.background = "#3498db";
      
      // Rafraîchir la liste des articles
      showManageArticlesForm();
    } else {
      alert("Erreur: Le gestionnaire de données n'est pas défini");
    }
  });
}

// Fonction pour éditer un article
function editArticle(articleId) {
  if (!DataManager.data.articles) return;
  
  const article = DataManager.data.articles.find(a => a.id === articleId);
  if (!article) {
    alert('Article non trouvé.');
    return;
  }
  
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Modifier l'article "${article.titre}"
    </h3>
    <form id="edit-article-form">
      <div style="margin-bottom:15px;">
        <label for="article-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
        <input type="text" id="article-title" required value="${article.titre}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-date" style="display:block;margin-bottom:5px;font-weight:bold;">Date</label>
        <input type="date" id="article-date" value="${article.date || ''}" style="width:200px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-categorie" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie</label>
        <input type="text" id="article-categorie" value="${article.categorie || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label style="display:block;margin-bottom:5px;font-weight:bold;">PDF de l'article</label>
        ${article.pdfUrl ? `
          <div style="margin-bottom:10px;padding:5px;background:#f5f5f5;border:1px solid #ddd;border-radius:3px;">
            <p style="margin:0;"><strong>PDF actuel:</strong> 
              <a href="${article.pdfUrl}" target="_blank" style="color:#3498db;text-decoration:none;">${article.pdfUrl.split('/').pop()}</a>
            </p>
          </div>
        ` : ''}
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="article-pdf-upload" accept="application/pdf" style="display:none;">
          <button type="button" id="article-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Changer le PDF
          </button>
          <button type="button" id="article-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
          <span id="article-pdf-name" style="line-height:28px;"></span>
        </div>
        <input type="hidden" id="article-pdf-url" value="${article.pdfUrl || ''}">
      </div>
      <div style="margin-bottom:15px;">
        <label for="article-description" style="display:block;margin-bottom:5px;font-weight:bold;">Description</label>
        <textarea id="article-description" rows="3" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${article.contenu || ''}</textarea>
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer les modifications
        </button>
        <button type="button" id="cancel-edit-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Annuler
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('article-browse-btn');
  const pdfUpload = document.getElementById('article-pdf-upload');
  const uploadBtn = document.getElementById('article-upload-btn');
  const pdfName = document.getElementById('article-pdf-name');
  const pdfUrl = document.getElementById('article-pdf-url');
  
  if (browseBtn && pdfUpload) {
    browseBtn.addEventListener('click', () => {
      pdfUpload.click();
    });
  }
  
  if (pdfUpload) {
    pdfUpload.addEventListener('change', () => {
      if (pdfUpload.files.length > 0) {
        pdfName.textContent = pdfUpload.files[0].name;
      }
    });
  }
  
  if (uploadBtn && pdfUpload) {
    uploadBtn.addEventListener('click', () => {
      if (pdfUpload.files.length > 0) {
        if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
          const file = pdfUpload.files[0];
          
          // Montrer un indicateur de chargement
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Chargement...";
          
          MediaManager.uploadImage(file, 'files/articles').then(url => {
            if (url && pdfUrl) {
              pdfUrl.value = url;
              uploadBtn.textContent = "✅ Uploadé";
              uploadBtn.style.background = "#27ae60";
              if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification('PDF uploadé avec succès', 'success');
              }
            }
          }).catch(error => {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Réessayer";
            uploadBtn.style.background = "#e74c3c";
            alert("Erreur lors de l'upload: " + error.message);
          });
        } else {
          alert("Fonctionnalité d'upload non disponible");
        }
      } else {
        alert("Veuillez d'abord sélectionner un fichier PDF");
      }
    });
  }
  
  document.getElementById('edit-article-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Mettre à jour les données de l'article
    article.titre = document.getElementById('article-title').value;
    article.date = document.getElementById('article-date').value;
    article.categorie = document.getElementById('article-categorie').value;
    article.contenu = document.getElementById('article-description').value;
    
    // Ne mettre à jour l'URL du PDF que si un nouveau fichier a été uploadé
    const newPdfUrl = document.getElementById('article-pdf-url').value;
    if (newPdfUrl && newPdfUrl !== article.pdfUrl) {
      article.pdfUrl = newPdfUrl;
    }
    
    // Sauvegarder les données
    if (typeof saveDataToGitHub === 'function') {
      saveDataToGitHub();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Article modifié avec succès sur GitHub', 'success');
      } else {
        alert('Article modifié avec succès sur GitHub');
      }
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Article modifié localement', 'success');
      } else {
        alert('Article modifié localement');
      }
    } else {
      alert("Article modifié mais aucune fonction de sauvegarde trouvée");
    }
    
    // Retourner à la liste des articles
    showManageArticlesForm();
  });
  
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    showManageArticlesForm();
  });
}
// Fonction pour gérer le CV
function showManageCVForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Vérifier s'il y a déjà un CV
  const cvData = DataManager.data.cv || {};
  const hasCv = cvData.pdfUrl && cvData.pdfUrl.length > 0;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer votre CV
    </h3>
    
    ${hasCv ? `
      <div style="margin-bottom:20px;padding:15px;background:#f5f5f5;border:1px solid #ddd;border-radius:5px;">
        <h4 style="margin-top:0;margin-bottom:10px;">CV actuel</h4>
        <p>
          <a href="${cvData.pdfUrl}" target="_blank" style="color:#3498db;text-decoration:none;font-weight:bold;">
            ${cvData.titre || 'Voir le PDF du CV'}
          </a>
          <br>
          <span style="color:#777;font-size:0.9em;">Dernière mise à jour: ${cvData.dateModification || 'non spécifiée'}</span>
        </p>
        <div style="margin-top:10px;">
          <button id="btn-remove-cv" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:4px 12px;cursor:pointer;">
            Supprimer ce CV
          </button>
        </div>
      </div>
    ` : '<p>Aucun CV n\'a encore été ajouté.</p>'}
    
    <h4 style="color:#0058a8;margin-top:15px;margin-bottom:15px;">
      ${hasCv ? 'Mettre à jour votre CV' : 'Ajouter votre CV'}
    </h4>
    
    <form id="cv-form">
      <div style="margin-bottom:15px;">
        <label for="cv-title" style="display:block;margin-bottom:5px;font-weight:bold;">Titre/Description</label>
        <input type="text" id="cv-title" value="${cvData.titre || ''}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      
      <div style="margin-bottom:15px;">
        <label style="display:block;margin-bottom:5px;font-weight:bold;">Fichier PDF du CV</label>
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="cv-pdf-upload" accept="application/pdf" style="display:none;">
          <button type="button" id="cv-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Sélectionner un PDF
          </button>
          <button type="button" id="cv-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
          <span id="cv-pdf-name" style="line-height:28px;"></span>
        </div>
        <input type="hidden" id="cv-pdf-url" value="${cvData.pdfUrl || ''}">
      </div>
      
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          ${hasCv ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements
  const browseBtn = document.getElementById('cv-browse-btn');
  const pdfUpload = document.getElementById('cv-pdf-upload');
  const uploadBtn = document.getElementById('cv-upload-btn');
  const pdfName = document.getElementById('cv-pdf-name');
  const pdfUrl = document.getElementById('cv-pdf-url');
  
  if (browseBtn && pdfUpload) {
    browseBtn.addEventListener('click', () => {
      pdfUpload.click();
    });
  }
  
  if (pdfUpload) {
    pdfUpload.addEventListener('change', () => {
      if (pdfUpload.files.length > 0) {
        pdfName.textContent = pdfUpload.files[0].name;
      }
    });
  }
  
  if (uploadBtn && pdfUpload) {
    uploadBtn.addEventListener('click', () => {
      if (pdfUpload.files.length > 0) {
        if (typeof MediaManager !== 'undefined' && MediaManager.uploadImage) {
          const file = pdfUpload.files[0];
          
          // Montrer un indicateur de chargement
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Chargement...";
          
          MediaManager.uploadImage(file, 'files/cv').then(url => {
            if (url && pdfUrl) {
              pdfUrl.value = url;
              uploadBtn.textContent = "✅ Uploadé";
              uploadBtn.style.background = "#27ae60";
              if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
                UIManager.showNotification('CV uploadé avec succès', 'success');
              }
            }
          }).catch(error => {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Réessayer";
            uploadBtn.style.background = "#e74c3c";
            alert("Erreur lors de l'upload: " + error.message);
          });
        } else {
          alert("Fonctionnalité d'upload non disponible");
        }
      } else {
        alert("Veuillez d'abord sélectionner un fichier PDF");
      }
    });
  }
  
  // Bouton pour supprimer le CV existant
  const removeBtn = document.getElementById('btn-remove-cv');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      if (confirm("Êtes-vous sûr de vouloir supprimer votre CV actuel ?")) {
        // Supprimer le CV des données
        DataManager.data.cv = {};
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
          DataManager.saveDataLocally();
        }
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('CV supprimé avec succès', 'success');
        } else {
          alert('CV supprimé avec succès');
        }
        
        // Rafraîchir la page
        showManageCVForm();
      }
    });
  }
  
  // Soumettre le formulaire
  document.getElementById('cv-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Vérifier si un PDF a été sélectionné ou s'il y en a déjà un
    if (!pdfUrl.value && !hasCv) {
      alert("Veuillez uploader un PDF pour votre CV.");
      return;
    }
    
    // Mettre à jour les données du CV
    DataManager.data.cv = {
      titre: document.getElementById('cv-title').value || 'Mon CV',
      dateModification: new Date().toISOString().split('T')[0],
      pdfUrl: pdfUrl.value || cvData.pdfUrl
    };
    
    // Sauvegarder les données
    if (typeof saveDataToGitHub === 'function') {
      saveDataToGitHub();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('CV enregistré avec succès sur GitHub', 'success');
      } else {
        alert('CV enregistré avec succès sur GitHub');
      }
    } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
      DataManager.saveDataLocally();
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('CV enregistré localement', 'success');
      } else {
        alert('CV enregistré localement');
      }
    } else {
      alert("CV enregistré mais aucune fonction de sauvegarde trouvée");
    }
    
    // Rafraîchir la page
    showManageCVForm();
  });
}
// Fonction pour créer une fenêtre d'articles
window.createArticlesWindow = function() {
  // Vérifier si des articles existent
  const articles = DataManager.data.articles || [];
  
  let articlesContent = '';
  
  if (articles.length > 0) {
    articlesContent = `
      <div class="articles-list">
        <ul style="list-style-type:none;padding:0;margin:0;">
          ${articles.map(article => `
            <li style="margin-bottom:15px;padding:10px;border:1px solid #ddd;border-radius:5px;background:#f9f9f9;">
              <h3 style="margin-top:0;margin-bottom:5px;color:#0058a8;">${article.titre}</h3>
              <div style="font-size:0.9em;color:#555;margin-bottom:10px;">
                <span>${article.date || 'Date non spécifiée'}</span>
                <span style="margin-left:15px;padding:2px 6px;background:#eee;border-radius:3px;">${article.categorie || 'Non classé'}</span>
              </div>
              <p>${article.contenu || 'Pas de description disponible.'}</p>
              <div style="margin-top:10px;">
                <button onclick="openArticlePdf('${article.pdfUrl}')" style="background:#0058a8;color:white;border:none;border-radius:3px;padding:4px 12px;cursor:pointer;">
                  Lire l'article
                </button>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  } else {
    articlesContent = '<p>Aucun article n\'est disponible pour le moment.</p>';
  }
  
  const win = WindowManager.createWindow({
    title: 'Articles',
    icon: 'icons/article.png',
    width: '700px',
    height: '500px',
    content: `
      <div class="window-articles">
        <h1 style="margin-top:0;color:#0058a8;border-bottom:1px solid #ddd;padding-bottom:10px;">Mes Articles</h1>
        ${articlesContent}
      </div>
    `
  });
  
  return win;
};

// Fonction pour ouvrir un PDF d'article
window.openArticlePdf = function(pdfUrl) {
  if (!pdfUrl) {
    alert("Erreur: URL du PDF non disponible.");
    return;
  }
  
  const win = WindowManager.createWindow({
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
  
  return win;
};

// Fonction pour créer une fenêtre de CV
window.createCVWindow = function() {
  // Vérifier si un CV existe
  const cv = DataManager.data.cv || {};
  
  let cvContent = '';
  
  if (cv.pdfUrl) {
    cvContent = `
      <div style="width:100%;height:calc(100% - 60px);overflow:hidden;">
        <iframe src="${cv.pdfUrl}" style="width:100%;height:100%;border:none;"></iframe>
      </div>
    `;
  } else {
    cvContent = '<p>Aucun CV n\'est disponible pour le moment.</p>';
  }
  
  const win = WindowManager.createWindow({
    title: 'CV',
    icon: 'icons/cv.png',
    width: '800px',
    height: '600px',
    content: `
      <div class="window-cv">
        <h1 style="margin-top:0;color:#0058a8;border-bottom:1px solid #ddd;padding-bottom:10px;">Mon CV</h1>
        ${cvContent}
      </div>
    `
  });
  
  return win;
};
