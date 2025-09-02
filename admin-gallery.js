// Fonction mise à jour pour ouvrir l'éditeur de film avec galerie d'images
function openFilmEditorWithGallery(film, win) {
  console.log(`📝 Ouverture de l'éditeur de film avec galerie: ${film ? film.title : 'Nouveau film'}`);
  
  // Sauvegarder le film en cours d'édition
  AdminSimple.state.currentEditFilm = film || null;
  
  // Réinitialiser l'image téléversée et la galerie
  AdminSimple.state.uploadedImage = null;
  AdminSimple.state.uploadedImageName = '';
  AdminSimple.state.galleryImages = film && film.gallery ? [...film.gallery] : [];
  AdminSimple.state.galleryImagesFiles = [];
  
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
              ${AdminSimple.state.galleryImages && AdminSimple.state.galleryImages.length > 0 
                ? AdminSimple.state.galleryImages.map((img, idx) => `
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
  AdminSimple.makeDraggable(editorWin);
  
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
        AdminSimple.state.uploadedImage = file;
        AdminSimple.state.uploadedImageName = file.name;
        
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
        AdminSimple.state.uploadedImage = null;
        AdminSimple.state.uploadedImageName = '';
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
        if (AdminSimple.state.galleryImages.length + files.length > 10) {
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
            AdminSimple.state.galleryImages.push(imageUrl);
            AdminSimple.state.galleryImagesFiles.push(file);
            
            // Ajouter l'élément visuel
            const newIndex = AdminSimple.state.galleryImages.length - 1;
            
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
        AdminSimple.state.galleryImages.splice(index, 1);
        if (index < AdminSimple.state.galleryImagesFiles.length) {
          AdminSimple.state.galleryImagesFiles.splice(index, 1);
        }
        
        // Rafraîchir l'affichage de la galerie
        refreshGalleryPreview(galleryPreview);
      }
    }
  });
  
  // Fonction pour rafraîchir l'affichage de la galerie
  function refreshGalleryPreview(container) {
    if (AdminSimple.state.galleryImages.length === 0) {
      container.innerHTML = '<div style="width:100%;height:100px;display:flex;align-items:center;justify-content:center;color:#888;font-style:italic;">Aucune image dans la galerie</div>';
      return;
    }
    
    container.innerHTML = '';
    AdminSimple.state.galleryImages.forEach((img, idx) => {
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
  }
  
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
        gallery: [...AdminSimple.state.galleryImages] // Copier la galerie
      };
      
      // Traiter l'image principale
      if (AdminSimple.state.uploadedImage) {
        // Dans un environnement réel, on enverrait l'image au serveur
        // Ici, on simule en utilisant l'URL de données
        const reader = new FileReader();
        reader.onload = (event) => {
          updatedFilm.poster = event.target.result;
          saveFilmWithGallery(updatedFilm, win);
          editorWin.remove();
        };
        reader.readAsDataURL(AdminSimple.state.uploadedImage);
      } else if (film && film.poster) {
        // Conserver l'image existante sauf si effacée explicitement
        updatedFilm.poster = clearImageBtn.disabled ? null : film.poster;
        saveFilmWithGallery(updatedFilm, win);
        editorWin.remove();
      } else {
        // Aucune image
        saveFilmWithGallery(updatedFilm, win);
        editorWin.remove();
      }
    });
  }
}

// Fonction pour sauvegarder un film avec sa galerie
function saveFilmWithGallery(film, win) {
  console.log(`💾 Sauvegarde du film avec galerie: ${film.title}`);
  
  const isNewFilm = !AdminSimple.state.films.some(f => f.id === film.id);
  
  if (isNewFilm) {
    // Ajouter le nouveau film
    AdminSimple.state.films.push(film);
    win.querySelector('.admin-statusbar span:first-child').textContent = `Film "${film.title}" ajouté avec ${film.gallery.length} images`;
  } else {
    // Mettre à jour le film existant
    AdminSimple.state.films = AdminSimple.state.films.map(f => f.id === film.id ? film : f);
    win.querySelector('.admin-statusbar span:first-child').textContent = `Film "${film.title}" mis à jour avec ${film.gallery.length} images`;
  }
  
  // Réinitialiser après 3 secondes
  setTimeout(() => {
    win.querySelector('.admin-statusbar span:first-child').textContent = 'Prêt';
  }, 3000);
  
  // Mettre à jour l'affichage
  if (AdminSimple.state.activeTab === 'films') {
    AdminSimple.loadTab('films', win);
  }
  
  // Mettre à jour le compteur de films
  const filmCountElements = win.querySelectorAll('.film-count');
  filmCountElements.forEach(el => {
    el.textContent = AdminSimple.state.films.length;
  });
}
