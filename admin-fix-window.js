// Solution complète pour le panneau d'administration avec WindowManager
// et fonctionnalités complètes

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
      <div class="admin-toolbar" style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;">
        <button id="btn-add-film" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Film</button>
        <button id="btn-add-manga" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Manga</button>
        <button id="btn-manage-tags" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Tags</button>
        <button id="btn-manage-icons" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Icônes</button>
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
    const addMangaBtn = document.getElementById(`btn-add-manga`);
    const manageTagsBtn = document.getElementById(`btn-manage-tags`);
    const manageIconsBtn = document.getElementById(`btn-manage-icons`);
    
    if (addFilmBtn) {
      addFilmBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showAddFilmFormImproved();
      });
    }
    
    if (addMangaBtn) {
      addMangaBtn.addEventListener('click', () => {
        // Remplacer le contenu du panneau admin
        showAddMangaFormImproved();
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
    } else {
      alert("Erreur: la variable 'films' n'est pas définie");
    }
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
    } else {
      alert("Erreur: Le gestionnaire de données n'est pas défini");
    }
  });
}

// Fonction améliorée pour gérer les tags
function showManageTagsFormImproved() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Préparer l'affichage des tags
  let tagsHTML = '<div class="tags-list" style="margin-bottom:20px;max-height:200px;overflow-y:auto;">';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.tags && DataManager.data.tags.length) {
    DataManager.data.tags.forEach(tag => {
      tagsHTML += `
        <div data-id="${tag.id}" style="display:flex;align-items:center;margin-bottom:5px;padding:5px;background:#f5f5f5;border-radius:3px;">
          <span style="background-color:${tag.color};width:20px;height:20px;display:inline-block;margin-right:10px;border-radius:3px;"></span>
          <span style="font-weight:bold;margin-right:5px;">${tag.name}</span>
          <span style="color:#777;margin-right:auto;">(${tag.category})</span>
          <button class="btn-delete-tag" data-id="${tag.id}" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">✕</button>
        </div>
      `;
    });
  } else {
    tagsHTML += '<p>Aucun tag défini</p>';
  }
  
  tagsHTML += '</div>';
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer les tags
    </h3>
    ${tagsHTML}
    <h4 style="color:#0058a8;margin-top:0;margin-bottom:15px;">Ajouter un nouveau tag</h4>
    <form id="add-tag-form">
      <div style="margin-bottom:15px;">
        <label for="tag-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom</label>
        <input type="text" id="tag-name" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="tag-color" style="display:block;margin-bottom:5px;font-weight:bold;">Couleur</label>
        <input type="color" id="tag-color" value="#3498db" style="width:60px;height:30px;padding:0;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="tag-category" style="display:block;margin-bottom:5px;font-weight:bold;">Catégorie</label>
        <input type="text" id="tag-category" placeholder="Ex: genre, année..." style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Ajouter
        </button>
      </div>
    </form>
  `;
  
  // Ajouter les écouteurs pour la suppression
  document.querySelectorAll('.btn-delete-tag').forEach(btn => {
    btn.addEventListener('click', function() {
      const tagId = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer ce tag?')) {
        if (typeof DataManager !== 'undefined') {
          DataManager.data.tags = DataManager.data.tags.filter(tag => tag.id !== tagId);
          
          // Sauvegarder les données
          if (typeof saveDataToGitHub === 'function') {
            saveDataToGitHub();
          } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
            DataManager.saveDataLocally();
          }
          
          // Rafraîchir le formulaire
          showManageTagsFormImproved();
          
          if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
            UIManager.showNotification('Tag supprimé avec succès', 'success');
          } else {
            alert('Tag supprimé avec succès');
          }
        }
      }
    });
  });
  
  // Écouteur pour l'ajout de tag
  document.getElementById('add-tag-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newTag = {
      id: 'tag-' + Date.now(),
      name: document.getElementById('tag-name').value,
      color: document.getElementById('tag-color').value,
      category: document.getElementById('tag-category').value || 'divers'
    };
    
    // Ajouter le nouveau tag
    if (typeof DataManager !== 'undefined') {
      if (!DataManager.data.tags) {
        DataManager.data.tags = [];
      }
      
      DataManager.data.tags.push(newTag);
      
      // Sauvegarder les données
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
      }
      
      // Rafraîchir le formulaire
      showManageTagsFormImproved();
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Tag ajouté avec succès', 'success');
      } else {
        alert('Tag ajouté avec succès');
      }
    } else {
      alert("Erreur: Le gestionnaire de données n'est pas défini");
    }
  });
}

// Fonction pour gérer les icônes du bureau
function showManageIconsForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Préparer l'affichage des icônes
  let iconsHTML = '<div class="icons-list" style="margin-bottom:20px;max-height:200px;overflow-y:auto;">';
  
  if (typeof DataManager !== 'undefined' && DataManager.data.desktopIcons && DataManager.data.desktopIcons.length) {
    DataManager.data.desktopIcons.forEach(icon => {
      iconsHTML += `
        <div data-id="${icon.id}" style="display:flex;align-items:center;margin-bottom:5px;padding:5px;background:#f5f5f5;border-radius:3px;">
          <img src="${icon.icon}" alt="${icon.name}" style="width:24px;height:24px;margin-right:10px;">
          <span style="font-weight:bold;margin-right:5px;">${icon.name}</span>
          <span style="color:#777;margin-right:auto;">(${icon.action})</span>
          <button class="btn-edit-icon" data-id="${icon.id}" style="background:#3498db;color:white;border:none;border-radius:3px;padding:2px 8px;margin-right:5px;cursor:pointer;">✎</button>
          <button class="btn-delete-icon" data-id="${icon.id}" style="background:#e74c3c;color:white;border:none;border-radius:3px;padding:2px 8px;cursor:pointer;">✕</button>
        </div>
      `;
    });
  } else {
    iconsHTML += '<p>Aucune icône définie</p>';
  }
  
  iconsHTML += '</div>';
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Gérer les icônes du bureau
    </h3>
    ${iconsHTML}
    <h4 style="color:#0058a8;margin-top:0;margin-bottom:15px;">Ajouter une nouvelle icône</h4>
    <form id="add-icon-form">
      <div style="margin-bottom:15px;">
        <label for="icon-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom</label>
        <input type="text" id="icon-name" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="icon-url" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'icône</label>
        <input type="text" id="icon-url" required style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="icon-image-upload" accept="image/*" style="display:none;">
          <button type="button" id="icon-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Parcourir...
          </button>
          <button type="button" id="icon-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
        </div>
      </div>
      <div style="margin-bottom:15px;">
        <label for="icon-action" style="display:block;margin-bottom:5px;font-weight:bold;">Action</label>
        <input type="text" id="icon-action" required placeholder="createFilmsWindow ou URL" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        <small style="color:#777;display:block;margin-top:5px;">
          Utilisez le nom d'une fonction (ex: createFilmsWindow) ou une URL externe (ex: https://example.com)
        </small>
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Ajouter
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('icon-browse-btn');
  const imageUpload = document.getElementById('icon-image-upload');
  const uploadBtn = document.getElementById('icon-upload-btn');
  const iconUrlInput = document.getElementById('icon-url');
  
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
          MediaManager.uploadImage(file, 'icons').then(url => {
            if (url && iconUrlInput) {
              iconUrlInput.value = url;
              
              // Ajouter un aperçu de l'icône
              const previewDiv = document.createElement('div');
              previewDiv.style.marginTop = '10px';
              previewDiv.style.border = '1px solid #ACA899';
              previewDiv.style.padding = '8px';
              previewDiv.style.background = '#fff';
              
              previewDiv.innerHTML = `
                <p style="margin:0 0 5px 0;font-weight:bold;">Icône uploadée:</p>
                <img src="${url}" alt="Aperçu" style="max-width:64px;max-height:64px;">
              `;
              
              // Remplacer l'aperçu existant ou ajouter le nouveau
              const existingPreview = iconUrlInput.parentElement.querySelector('div[style*="margin-top:10px"]');
              if (existingPreview) {
                iconUrlInput.parentElement.replaceChild(previewDiv, existingPreview);
              } else {
                iconUrlInput.parentElement.appendChild(previewDiv);
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
  
  // Ajouter les écouteurs pour la suppression des icônes
  document.querySelectorAll('.btn-delete-icon').forEach(btn => {
    btn.addEventListener('click', function() {
      const iconId = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer cette icône?')) {
        if (typeof DataManager !== 'undefined') {
          DataManager.data.desktopIcons = DataManager.data.desktopIcons.filter(icon => icon.id !== iconId);
          
          // Sauvegarder les données
          if (typeof saveDataToGitHub === 'function') {
            saveDataToGitHub();
          } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
            DataManager.saveDataLocally();
          }
          
          // Rafraîchir les icônes du bureau
          if (typeof DesktopManager !== 'undefined' && DesktopManager.renderDesktopIcons) {
            DesktopManager.renderDesktopIcons();
          }
          
          // Rafraîchir le formulaire
          showManageIconsForm();
          
          if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
            UIManager.showNotification('Icône supprimée avec succès', 'success');
          } else {
            alert('Icône supprimée avec succès');
          }
        }
      }
    });
  });
  
  // Ajouter les écouteurs pour l'édition des icônes
  document.querySelectorAll('.btn-edit-icon').forEach(btn => {
    btn.addEventListener('click', function() {
      const iconId = this.getAttribute('data-id');
      if (typeof DataManager !== 'undefined') {
        const iconToEdit = DataManager.data.desktopIcons.find(icon => icon.id === iconId);
        if (iconToEdit) {
          showEditIconForm(iconToEdit);
        }
      }
    });
  });
  
  // Écouteur pour l'ajout d'icône
  document.getElementById('add-icon-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newIcon = {
      id: 'icon-' + Date.now(),
      name: document.getElementById('icon-name').value,
      icon: document.getElementById('icon-url').value,
      action: document.getElementById('icon-action').value,
      position: { x: 150, y: 50 + (DataManager.data.desktopIcons.length * 100) }
    };
    
    // Ajouter la nouvelle icône
    if (typeof DataManager !== 'undefined') {
      if (!DataManager.data.desktopIcons) {
        DataManager.data.desktopIcons = [];
      }
      
      DataManager.data.desktopIcons.push(newIcon);
      
      // Sauvegarder les données
      if (typeof saveDataToGitHub === 'function') {
        saveDataToGitHub();
      } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
        DataManager.saveDataLocally();
      }
      
      // Rafraîchir les icônes du bureau
      if (typeof DesktopManager !== 'undefined' && DesktopManager.renderDesktopIcons) {
        DesktopManager.renderDesktopIcons();
      }
      
      // Rafraîchir le formulaire
      showManageIconsForm();
      
      if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
        UIManager.showNotification('Icône ajoutée avec succès', 'success');
      } else {
        alert('Icône ajoutée avec succès');
      }
    } else {
      alert("Erreur: Le gestionnaire de données n'est pas défini");
    }
  });
}

// Fonction pour éditer une icône existante
function showEditIconForm(icon) {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
      Modifier l'icône "${icon.name}"
    </h3>
    <form id="edit-icon-form">
      <div style="margin-bottom:15px;">
        <label for="icon-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom</label>
        <input type="text" id="icon-name" required value="${icon.name}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
      </div>
      <div style="margin-bottom:15px;">
        <label for="icon-url" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'icône</label>
        <input type="text" id="icon-url" required value="${icon.icon}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        
        <div style="display:flex;gap:10px;margin-top:8px;">
          <input type="file" id="icon-image-upload" accept="image/*" style="display:none;">
          <button type="button" id="icon-browse-btn" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">
            Parcourir...
          </button>
          <button type="button" id="icon-upload-btn" style="padding:4px 10px;background:#3498db;color:white;border:1px solid #2980b9;cursor:pointer;">
            Upload
          </button>
        </div>
        
        <div style="margin-top:10px;border:1px solid #ACA899;padding:8px;background:#fff;">
          <p style="margin:0 0 5px 0;font-weight:bold;">Icône actuelle:</p>
          <img src="${icon.icon}" alt="Aperçu" style="max-width:64px;max-height:64px;">
        </div>
      </div>
      <div style="margin-bottom:15px;">
        <label for="icon-action" style="display:block;margin-bottom:5px;font-weight:bold;">Action</label>
        <input type="text" id="icon-action" required value="${icon.action}" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        <small style="color:#777;display:block;margin-top:5px;">
          Utilisez le nom d'une fonction (ex: createFilmsWindow) ou une URL externe (ex: https://example.com)
        </small>
      </div>
      <div style="margin-top:20px;">
        <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Enregistrer
        </button>
        <button type="button" id="cancel-edit-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
          Annuler
        </button>
      </div>
    </form>
  `;
  
  // Configurer les événements après l'ajout au DOM
  const browseBtn = document.getElementById('icon-browse-btn');
  const imageUpload = document.getElementById('icon-image-upload');
  const uploadBtn = document.getElementById('icon-upload-btn');
  const iconUrlInput = document.getElementById('icon-url');
  
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
          MediaManager.uploadImage(file, 'icons').then(url => {
            if (url && iconUrlInput) {
              iconUrlInput.value = url;
              
              // Mettre à jour l'aperçu
              const previewImage = iconUrlInput.parentElement.querySelector('div[style*="margin-top:10px"] img');
              if (previewImage) {
                previewImage.src = url;
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
  
  // Écouteur pour l'annulation
  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    showManageIconsForm();
  });
  
  // Écouteur pour la soumission du formulaire
  document.getElementById('edit-icon-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (typeof DataManager !== 'undefined') {
      const iconIndex = DataManager.data.desktopIcons.findIndex(i => i.id === icon.id);
      if (iconIndex !== -1) {
        // Mettre à jour l'icône
        DataManager.data.desktopIcons[iconIndex] = {
          ...DataManager.data.desktopIcons[iconIndex],
          name: document.getElementById('icon-name').value,
          icon: document.getElementById('icon-url').value,
          action: document.getElementById('icon-action').value
        };
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
          DataManager.saveDataLocally();
        }
        
        // Rafraîchir les icônes du bureau
        if (typeof DesktopManager !== 'undefined' && DesktopManager.renderDesktopIcons) {
          DesktopManager.renderDesktopIcons();
        }
        
        // Revenir à la gestion des icônes
        showManageIconsForm();
        
        if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
          UIManager.showNotification('Icône modifiée avec succès', 'success');
        } else {
          alert('Icône modifiée avec succès');
        }
      }
    }
  });
}

// Jouer un son d'ouverture si nécessaire
if (typeof WindowManager !== 'undefined' && WindowManager.playSound) {
  WindowManager.playSound('open');
}

console.log("✅ Fenêtre admin complète chargée avec succès");
