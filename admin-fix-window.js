// Remplacer la fonction createAdminPanelWindow pour utiliser le WindowManager

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
    <div style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;">
      <button id="btn-add-film" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Film</button>
      <button id="btn-add-manga" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Manga</button>
      <button id="btn-manage-tags" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Tags</button>
    </div>
    
    <div style="padding:15px;height:calc(100% - 80px);overflow-y:auto;">
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
              }
            });
          } else {
            alert("Fonctionnalité d'upload non disponible");
          }
        } else {
          alert("Veuillez d'abord sélectionner une image");
        }
      });
    }
    
    // Traitement du formulaire
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
          } else if (typeof DataManager !== 'undefined' && DataManager.saveDataLocally) {
            DataManager.saveDataLocally();
          }
          
          // Afficher une notification
          if (typeof UIManager !== 'undefined' && UIManager.showNotification) {
            UIManager.showNotification('Film sauvegardé avec succès', 'success');
          } else {
            alert('Film sauvegardé avec succès');
          }
          
          // Rafraîchir la liste si elle est ouverte
          if (typeof renderFilmsList === 'function') {
            renderFilmsList();
          }
        } else {
          alert("Erreur: La variable 'films' n'est pas définie");
        }
        
        // Fermer la fenêtre
        WindowManager.closeWindow(winId);
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
    
    if (addFilmBtn) {
      addFilmBtn.addEventListener('click', () => {
        WindowManager.closeWindow(winId);
        createAdminPanelWindow();
      });
    }
    
    if (addMangaBtn) {
      addMangaBtn.addEventListener('click', () => {
        if (typeof showAddMangaForm === 'function') {
          showAddMangaForm();
        } else {
          alert("Fonctionnalité non disponible");
        }
      });
    }
    
    if (manageTagsBtn) {
      manageTagsBtn.addEventListener('click', () => {
        if (typeof showManageTagsForm === 'function') {
          showManageTagsForm();
        } else {
          alert("Fonctionnalité non disponible");
        }
      });
    }
  }, 100);
  
  return win;
};

// Jouer un son d'ouverture si nécessaire
if (typeof WindowManager !== 'undefined' && WindowManager.playSound) {
  WindowManager.playSound('open');
}

console.log("✅ Fenêtre admin améliorée avec les contrôles WindowManager");