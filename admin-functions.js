// Gestion des médias et upload d'images
const MediaManager = {
  // Upload d'une image sur GitHub
  async uploadImage(file, directory = 'images/films', maxWidth = 800, quality = 0.85) {
    if (!file || !GITHUB_CONFIG.token) return null;
    
    try {
      // Compresser l'image
      const compressedFile = await this.compressImage(file, maxWidth, quality);
      const fileName = `${directory.split('/').pop()}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const filePath = `${directory}/${fileName}`;
      
      // Convertir en base64 pour GitHub
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async function(e) {
          const base64Content = e.target.result.split(',')[1];
          
          // Upload vers GitHub
          const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_CONFIG.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `📸 Upload: ${fileName}`,
              content: base64Content,
              branch: GITHUB_CONFIG.branch
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            resolve(result.content.download_url);
          } else {
            reject(new Error("Échec de l'upload"));
          }
        };
        reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error("Erreur upload:", error);
      return null;
    }
  },

  // Compression d'image
  compressImage(file, maxWidth = 800, quality = 0.85) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Calculer les nouvelles dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

// Mise à jour de l'interface d'administration
function createAdminPanelWindow(editFilmId = null) {
  // Jouer un son d'ouverture si disponible
  if (typeof playOpenSound === 'function') {
    playOpenSound();
  }
  
  // Générer un ID unique pour la fenêtre
  const winId = 'adminpanel_' + Date.now();
  
  // Créer l'élément de fenêtre
  const win = document.createElement('div');
  win.id = winId;
  win.className = 'xp-window';
  win.style.position = 'absolute';
  win.style.width = '700px';
  win.style.height = '500px';
  win.style.left = '150px';
  win.style.top = '100px';
  win.style.zIndex = typeof getNextZIndex === 'function' ? getNextZIndex() : 9999;
  
  // Récupérer le film à éditer si nécessaire
  let filmToEdit = null;
  if (editFilmId && typeof films !== 'undefined') {
    filmToEdit = films.find(f => f.id === editFilmId);
  }
  
  // Construire le contenu HTML de la fenêtre d'administration
  win.innerHTML = `
    <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:8px 10px;display:flex;justify-content:space-between;align-items:center;">
      <span style="display:flex;align-items:center;">
        <img src="icons/key.png" alt="Admin" style="width:16px;height:16px;margin-right:6px;">
        <span>Admin Panel</span>
      </span>
      <div style="display:flex;">
        <span class="xp-btn min" style="margin:0 2px;cursor:pointer;" onclick="minimizeWindow('${winId}', 'Admin', 'icons/key.png')">-</span>
        <span class="xp-btn max" style="margin:0 2px;cursor:pointer;" onclick="maxFilmWindow('${winId}')">□</span>
        <span class="xp-btn close" style="margin:0 2px;cursor:pointer;" onclick="closeFilmWindow('${winId}')">✖</span>
      </div>
    </div>
    
    <div style="background:#ECE9D8;border-bottom:1px solid #ACA899;padding:10px;display:flex;gap:5px;">
      <button id="${winId}-btn-add-film" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Film</button>
      <button id="${winId}-btn-add-manga" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Ajouter Manga</button>
      <button id="${winId}-btn-manage-tags" style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Gérer Tags</button>
    </div>
    
    <div style="padding:15px;height:calc(100% - 80px);overflow-y:auto;">
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        ${editFilmId ? 'Modifier' : 'Ajouter'} un film
      </h3>
      
      <form id="${winId}-film-form">
        <div style="margin-bottom:15px;">
          <label for="${winId}-titre" style="display:block;margin-bottom:5px;font-weight:bold;">Titre</label>
          <input type="text" id="${winId}-titre" name="titre" value="${filmToEdit ? filmToEdit.titre : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="${winId}-note" style="display:block;margin-bottom:5px;font-weight:bold;">Note (1-5)</label>
          <input type="number" id="${winId}-note" name="note" min="0" max="5" value="${filmToEdit ? filmToEdit.note : 0}" 
            style="width:60px;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="${winId}-critique" style="display:block;margin-bottom:5px;font-weight:bold;">Critique</label>
          <textarea id="${winId}-critique" name="critique" rows="4" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">${filmToEdit ? filmToEdit.critique : ''}</textarea>
        </div>
        
        <div style="margin-bottom:15px;">
          <label for="${winId}-image" style="display:block;margin-bottom:5px;font-weight:bold;">URL de l'image</label>
          <input type="text" id="${winId}-image" name="image" value="${filmToEdit ? filmToEdit.image : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
          
          <div style="display:flex;gap:10px;margin-top:8px;">
            <input type="file" id="${winId}-image-upload" accept="image/*" style="display:none;">
            <button type="button" id="${winId}-browse-btn" 
              style="padding:4px 10px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;">Parcourir...</button>
            <button type="button" id="${winId}-upload-btn" 
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
          <label for="${winId}-bande-annonce" style="display:block;margin-bottom:5px;font-weight:bold;">URL de la bande annonce</label>
          <input type="text" id="${winId}-bande-annonce" name="bandeAnnonce" value="${filmToEdit ? filmToEdit.bandeAnnonce : ''}" 
            style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
        </div>
        
        <div style="margin-top:20px;">
          <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
            ${filmToEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
          ${editFilmId ? `
          <button type="button" id="${winId}-cancel-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
            Annuler
          </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;
  
  // Ajouter la fenêtre au document
  document.body.appendChild(win);
  
  // Rendre la fenêtre draggable si la fonction existe
  if (typeof makeDraggable === 'function') {
    makeDraggable(win, winId);
  }
  
  // Configurer les événements après l'ajout au DOM
  setTimeout(() => {
    // Gestion du bouton parcourir
    const browseBtn = document.getElementById(`${winId}-browse-btn`);
    const imageUpload = document.getElementById(`${winId}-image-upload`);
    
    if (browseBtn && imageUpload) {
      browseBtn.addEventListener('click', () => {
        imageUpload.click();
      });
    }
    
    // Gestion du bouton upload
    const uploadBtn = document.getElementById(`${winId}-upload-btn`);
    if (uploadBtn && imageUpload) {
      uploadBtn.addEventListener('click', () => {
        if (imageUpload.files.length > 0) {
          uploadFilmImage(winId);
        } else {
          alert("Veuillez d'abord sélectionner une image");
        }
      });
    }
    
    // Traitement du formulaire
    const form = document.getElementById(`${winId}-film-form`);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Création de l'objet film
        const filmData = {
          id: filmToEdit ? filmToEdit.id : Date.now(),
          titre: document.getElementById(`${winId}-titre`).value,
          note: parseInt(document.getElementById(`${winId}-note`).value) || 0,
          critique: document.getElementById(`${winId}-critique`).value,
          image: document.getElementById(`${winId}-image`).value,
          bandeAnnonce: document.getElementById(`${winId}-bande-annonce`).value,
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
          } else if (typeof saveData === 'function') {
            saveData();
          }
          
          // Afficher une notification
          if (typeof showNotification === 'function') {
            showNotification('Film sauvegardé avec succès', 'success');
          } else {
            alert('Film sauvegardé avec succès');
          }
        } else {
          alert("Erreur: La variable 'films' n'est pas définie");
        }
        
        // Fermer la fenêtre
        if (typeof closeFilmWindow === 'function') {
          closeFilmWindow(winId);
        } else {
          document.getElementById(winId).remove();
        }
      });
    }
    
    // Gestion du bouton annuler
    const cancelBtn = document.getElementById(`${winId}-cancel-btn`);
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (typeof closeFilmWindow === 'function') {
          closeFilmWindow(winId);
        } else {
          document.getElementById(winId).remove();
        }
      });
    }
    
    // Gestion des boutons de la barre d'outils
    const addFilmBtn = document.getElementById(`${winId}-btn-add-film`);
    const addMangaBtn = document.getElementById(`${winId}-btn-add-manga`);
    const manageTagsBtn = document.getElementById(`${winId}-btn-manage-tags`);
    
    if (addFilmBtn) {
      addFilmBtn.addEventListener('click', () => {
        if (typeof closeFilmWindow === 'function') {
          closeFilmWindow(winId);
        } else {
          document.getElementById(winId).remove();
        }
        createAdminPanelWindow();
      });
    }
    
    if (addMangaBtn && typeof showAddMangaForm === 'function') {
      addMangaBtn.addEventListener('click', () => {
        showAddMangaForm();
      });
    }
    
    if (manageTagsBtn && typeof showManageTagsForm === 'function') {
      manageTagsBtn.addEventListener('click', () => {
        showManageTagsForm();
      });
    }
  }, 100);
  
  return win;
}

// Fonction pour uploader une image
function uploadFilmImage(winId) {
  const imageInput = document.getElementById(`${winId}-image`);
  const fileInput = document.getElementById(`${winId}-image-upload`);
  
  if (!fileInput || !fileInput.files.length) {
    alert("Veuillez sélectionner une image");
    return;
  }
  
  const file = fileInput.files[0];
  
  if (!file.type.startsWith('image/')) {
    alert("Veuillez sélectionner un fichier image valide");
    return;
  }
  
  // Vérifier si le token GitHub est configuré
  if (typeof GITHUB_CONFIG === 'undefined' || !GITHUB_CONFIG.token) {
    alert("Token GitHub manquant. L'upload ne sera pas persistant.");
  }
  
  // Afficher une notification si la fonction existe
  if (typeof showNotification === 'function') {
    showNotification('Upload en cours...', 'info');
  }
  
  // Utiliser la fonction de compression et upload si disponible
  if (typeof compressImage === 'function') {
    // Compresser puis uploader
    compressImage(file, 800, 0.85).then(compressedFile => {
      uploadImageToGitHub(compressedFile, file.name, winId, imageInput);
    }).catch(error => {
      console.error('Erreur compression:', error);
      alert("Erreur lors de la compression de l'image");
    });
  } else {
    // Upload direct sans compression
    uploadImageToGitHub(file, file.name, winId, imageInput);
  }
}

// Fonction pour uploader une image sur GitHub
function uploadImageToGitHub(file, fileName, winId, imageInput) {
  // Vérifier que la configuration GitHub est disponible
  if (typeof GITHUB_CONFIG === 'undefined') {
    alert("Configuration GitHub manquante");
    return;
  }
  
  const token = GITHUB_CONFIG.token;
  if (!token) {
    alert("Token GitHub manquant");
    return;
  }
  
  // Générer un nom de fichier unique
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  const uploadName = `film_${timestamp}_${safeName}`;
  const filePath = `images/films/${uploadName}`;
  
  // Convertir le fichier en base64
  const reader = new FileReader();
  reader.onload = function(e) {
    const base64Content = e.target.result.split(',')[1];
    
    // Appeler l'API GitHub
    fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `📸 Upload image film: ${uploadName}`,
        content: base64Content,
        branch: GITHUB_CONFIG.branch || 'main'
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
      const previewDiv = document.createElement('div');
      previewDiv.style.marginTop = '10px';
      previewDiv.style.border = '1px solid #ACA899';
      previewDiv.style.padding = '8px';
      previewDiv.style.background = '#fff';
      
      previewDiv.innerHTML = `
        <p style="margin:0 0 5px 0;font-weight:bold;">Image uploadée:</p>
        <img src="${data.content.download_url}" alt="Aperçu" style="max-width:200px;max-height:120px;">
      `;
      
      // Remplacer l'aperçu existant ou ajouter le nouveau
      const existingPreview = imageInput.parentElement.querySelector('div[style*="margin-top:10px"]');
      if (existingPreview) {
        imageInput.parentElement.replaceChild(previewDiv, existingPreview);
      } else {
        imageInput.parentElement.appendChild(previewDiv);
      }
      
      // Afficher une notification si la fonction existe
      if (typeof showNotification === 'function') {
        showNotification('Image uploadée avec succès', 'success');
      } else {
        alert("Image uploadée avec succès");
      }
    })
    .catch(error => {
      console.error('Erreur upload:', error);
      
      if (typeof showNotification === 'function') {
        showNotification(`Erreur: ${error.message}`, 'error');
      } else {
        alert(`Erreur lors de l'upload: ${error.message}`);
      }
    });
  };
  
  reader.onerror = function() {
    alert("Erreur lors de la lecture du fichier");
  };
  
  reader.readAsDataURL(file);
}

// Fonction utilitaire pour comprimer une image
function compressImage(file, maxWidth = 800, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calculer les nouvelles dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        blob => resolve(blob),
        file.type,
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
    img.src = URL.createObjectURL(file);
  });
}
