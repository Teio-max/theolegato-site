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
  playOpenSound();
  const winId = 'adminpanel_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.width = '800px';
  win.style.height = '600px';
  win.style.left = (100 + Math.random()*150) + 'px';
  win.style.top = (50 + Math.random()*100) + 'px';
  win.style.zIndex = getNextZIndex();

  // Récupérer le film à éditer si nécessaire
  let filmToEdit = editFilmId ? films.find(f => f.id === editFilmId) : null;
  
  // Formulaire d'ajout/modification
  let formHtml = `<form id="admin-film-form" style="margin-bottom:18px;">
    <h3 style="margin-top:0;">${filmToEdit ? 'Modifier' : 'Ajouter'} un film</h3>
    <label>Titre : <input type="text" name="titre" value="${filmToEdit ? filmToEdit.titre : ''}" required style="width:70%"></label><br><br>
    <label>Note (0-5) : <input type="number" name="note" min="0" max="5" value="${filmToEdit ? filmToEdit.note : 0}" style="width:50px"></label><br><br>
    <label>Critique :<br><textarea name="critique" rows="3" style="width:90%">${filmToEdit ? filmToEdit.critique : ''}</textarea></label><br><br>
    
    <label>Image principale :</label><br>
    <input type="text" name="image" value="${filmToEdit ? filmToEdit.image : ''}" placeholder="URL de l'image" style="width:70%"><br>
    <input type="file" id="film-image-upload" accept="image/*" style="margin:8px 0;">
    <button type="button" onclick="uploadFilmImage()" style="padding:4px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;">📤 Upload & Compress</button>
    <button type="button" onclick="showImageManager('${winId}')" style="padding:4px 12px;background:#e67e22;color:#fff;border:none;border-radius:4px;margin-left:8px;">🗂️ Gérer</button><br><br>
    
    <label>Galerie d'images :</label><br>
    <textarea name="galerie" rows="2" placeholder="URLs séparées par des virgules" style="width:90%">${filmToEdit && filmToEdit.galerie ? filmToEdit.galerie.join(', ') : ''}</textarea><br>
    <input type="file" id="gallery-upload" accept="image/*" multiple style="margin:8px 0;">
    <button type="button" onclick="uploadGalleryImages()" style="padding:4px 12px;background:#9b59b6;color:#fff;border:none;border-radius:4px;">📸 Upload Galerie</button><br><br>
    
    <label>Bande-annonce (URL YouTube) : <input type="text" name="bandeAnnonce" value="${filmToEdit ? filmToEdit.bandeAnnonce : ''}" style="width:70%"></label><br><br>
    <label>Liens critiques (nom|url, un par ligne) :<br><textarea name="liens" rows="2" style="width:90%">${filmToEdit && filmToEdit.liens ? filmToEdit.liens.map(l=>l.nom+'|'+l.url).join('\n') : ''}</textarea></label><br><br>
    <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">${filmToEdit ? 'Enregistrer' : 'Ajouter'}</button>
    ${filmToEdit ? '<button type="button" id="cancel-edit" style="margin-left:12px;">Annuler</button>' : ''}
  </form>`;

  // Tableau des films
  let tableHtml = `<table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
    <tr style="background:#e8f4f8;color:#0058a8;font-weight:bold;"><td>Titre</td><td>Note</td><td>Actions</td></tr>`;
  films.forEach(film => {
    tableHtml += `<tr style="border-bottom:1px solid #ddd;">
      <td>${film.titre}</td>
      <td>${film.note}</td>
      <td>
        <button onclick="editFilmAdmin(${film.id})" style="padding:2px 10px;margin-right:6px;">Éditer</button>
        <button onclick="deleteFilmAdmin(${film.id})" style="padding:2px 10px;color:#fff;background:#e74c3c;border:none;border-radius:4px;">Supprimer</button>
      </td>
    </tr>`;
  });
  tableHtml += '</table>';

  // Onglets d'administration
  let tabsHtml = `
    <div style="display:flex;margin-bottom:18px;border-bottom:2px solid #ccc;padding:4px 4px 0 4px;">
      <button id="tab-films" class="admin-tab active" onclick="switchAdminTab('films', '${winId}')" style="padding:10px 20px;border:none;background:#0058a8;color:#fff;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;">🎬 Films</button>
      <button id="tab-icons" class="admin-tab" onclick="switchAdminTab('icons', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:#333;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;">🖥️ Icônes Bureau</button>
      <button id="tab-home" class="admin-tab" onclick="switchAdminTab('home', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:#333;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;">🏠 Page d'accueil</button>
      <button id="tab-bsod" class="admin-tab" onclick="switchAdminTab('bsod', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:#333;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;">💀 Page d'erreur</button>
      <button id="tab-github" class="admin-tab" onclick="switchAdminTab('github', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:#333;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;">⚙️ GitHub</button>
    </div>
  `;

  win.innerHTML = `
    <div class="xp-titlebar" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/key.png" class="xp-icon" alt=""><span>Administration</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'Admin', 'icons/key.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div style="padding:20px;height:calc(100% - 50px);overflow-y:auto;">
      ${tabsHtml}
      <div id="films-content">
        ${formHtml}
        ${tableHtml}
      </div>
      <div id="icons-content" style="display:none;">
        <form id="admin-icon-form" style="margin-bottom:18px;">
          <h3 style="margin-top:0;">Ajouter une icône</h3>
          <label>Nom : <input type="text" name="iconName" required style="width:70%"></label><br><br>
          <label>Icône (URL) : <input type="text" name="iconIcon" required style="width:70%"></label><br><br>
          <label>Action : <input type="text" name="iconAction" placeholder="createFilmsWindow ou URL" required style="width:70%"></label><br><br>
          <button type="submit" style="background:#0058a8;color:#fff;border:none;padding:8px 16px;border-radius:4px;">Ajouter</button>
        </form>
        
        <h3>Icônes existantes</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="background:#e8f4f8;color:#0058a8;font-weight:bold;"><td>Nom</td><td>Action</td><td>Actions</td></tr>
          ${desktopIcons.map(icon => `
            <tr style="border-bottom:1px solid #ddd;">
              <td>${icon.name}</td>
              <td>${icon.action}</td>
              <td>
                <button onclick="deleteIconAdmin('${icon.id}')" style="padding:2px 10px;color:#fff;background:#e74c3c;border:none;border-radius:4px;">Supprimer</button>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
      <div id="home-content" style="display:none;">
        <form id="admin-home-form" style="margin-bottom:18px;">
          <h3 style="margin-top:0;">Modifier la page d'accueil</h3>
          <label>Nom : <input type="text" name="homeName" value="${homePageConfig?.name || ''}" required style="width:70%"></label><br><br>
          <label>Message de bienvenue : <input type="text" name="welcomeMessage" value="${homePageConfig?.welcomeMessage || ''}" required style="width:70%"></label><br><br>
          <label>Description :<br><textarea name="description" rows="2" style="width:90%">${homePageConfig?.description || ''}</textarea></label><br><br>
          <label>But du site :<br><textarea name="sitePurpose" rows="2" style="width:90%">${homePageConfig?.sitePurpose || ''}</textarea></label><br><br>
          <label>Texte de fin : <input type="text" name="footerText" value="${homePageConfig?.footerText || ''}" style="width:70%"></label><br><br>
          <hr style="margin:18px 0;">
          <h4>Liens sociaux (nom|url, un par ligne) :</h4>
          <textarea name="socialLinks" rows="5" style="width:90%">${(homePageConfig?.socialLinks || []).map(l => l.name + '|' + l.url).join('\n')}</textarea><br><br>
          <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#0058a8;color:#fff;border:none;">Enregistrer</button>
        </form>
      </div>
      <div id="bsod-content" style="display:none;">
        <form id="admin-bsod-form" style="margin-bottom:18px;">
          <h3 style="margin-top:0;">Modifier la page d'erreur Windows XP</h3>
          <label>Titre principal :<br><textarea name="title" rows="2" style="width:90%">${bsodConfig?.title || ''}</textarea></label><br><br>
          <label>Code d'erreur : <input type="text" name="errorCode" value="${bsodConfig?.errorCode || ''}" style="width:70%"></label><br><br>
          <label>Informations techniques :<br><textarea name="technicalInfo" rows="4" style="width:90%">${bsodConfig?.technicalInfo || ''}</textarea></label><br><br>
          <label>Instructions :<br><textarea name="instructions" rows="6" style="width:90%">${bsodConfig?.instructions || ''}</textarea></label><br><br>
          <label>Dump mémoire :<br><textarea name="memoryDump" rows="3" style="width:90%">${bsodConfig?.memoryDump || ''}</textarea></label><br><br>
          <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#0058a8;color:#fff;border:none;">Enregistrer</button>
          <button type="button" onclick="testBSOD()" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#e74c3c;color:#fff;border:none;margin-left:10px;">Tester</button>
        </form>
      </div>
      <div id="github-content" style="display:none;">
        <h3 style="margin-top:0;">⚙️ Configuration GitHub</h3>
        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid #0058a8;">
          <p><strong>🔐 Sauvegarde persistante</strong></p>
          <p>Pour que vos modifications soient sauvegardées de façon permanente, vous devez configurer un token GitHub.</p>
        </div>
        
        <form id="admin-github-form" style="margin-bottom:18px;">
          <label>Token GitHub Personnel :<br>
          <input type="password" name="githubToken" value="${GITHUB_CONFIG.token || ''}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width:90%;padding:8px;margin-top:5px;font-family:monospace;">
          </label><br><br>
          
          <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#0058a8;color:#fff;border:none;">💾 Sauvegarder Token</button>
          <button type="button" onclick="testGitHubConnection()" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#28a745;color:#fff;border:none;margin-left:10px;">🔍 Tester Connexion</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(win);
  makeDraggable(win, winId);

  setupAdminEvents(winId);

  return win;
}

function setupAdminEvents(winId) {
  // Formulaire films
  const filmForm = document.getElementById('admin-film-form');
  if (filmForm) {
    filmForm.onsubmit = function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const filmData = {
        id: parseInt(formData.get('id')) || Date.now(),
        titre: formData.get('titre'),
        note: parseInt(formData.get('note')) || 0,
        critique: formData.get('critique'),
        image: formData.get('image'),
        galerie: formData.get('galerie') ? formData.get('galerie').split(',').map(url => url.trim()).filter(Boolean) : [],
        bandeAnnonce: formData.get('bandeAnnonce'),
        liens: []
      };
      
      // Traiter les liens
      const liensText = formData.get('liens');
      if (liensText) {
        filmData.liens = liensText.split('\n')
          .map(line => {
            const parts = line.split('|');
            if (parts.length === 2) {
              return { nom: parts[0].trim(), url: parts[1].trim() };
            }
            return null;
          })
          .filter(Boolean);
      }
      
      // Modifier un film existant ou en ajouter un nouveau
      const existingIndex = films.findIndex(f => f.id === filmData.id);
      if (existingIndex >= 0) {
        films[existingIndex] = filmData;
      } else {
        films.push(filmData);
      }
      
      saveDataToGitHub();
      showNotification('✅ Film sauvegardé avec succès', 'success');
      closeFilmWindow(winId);
      createAdminPanelWindow();
    };
  }
  
  // Formulaire icônes
  const iconForm = document.getElementById('admin-icon-form');
  if (iconForm) {
    iconForm.onsubmit = function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const iconData = {
        id: 'icon-' + Date.now(),
        name: formData.get('iconName'),
        icon: formData.get('iconIcon'),
        action: formData.get('iconAction'),
        position: { x: 150, y: 50 + desktopIcons.length * 100 }
      };
      
      desktopIcons.push(iconData);
      saveDataToGitHub();
      renderDesktopIcons();
      showNotification('✅ Icône ajoutée avec succès', 'success');
      closeFilmWindow(winId);
      createAdminPanelWindow();
    };
  }
  
  // Formulaire page d'accueil
  const homeForm = document.getElementById('admin-home-form');
  if (homeForm) {
    homeForm.onsubmit = function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      
      homePageConfig.name = formData.get('homeName');
      homePageConfig.welcomeMessage = formData.get('welcomeMessage');
      homePageConfig.description = formData.get('description');
      homePageConfig.sitePurpose = formData.get('sitePurpose');
      homePageConfig.footerText = formData.get('footerText');
      
      // Traiter les liens sociaux
      const socialLinksText = formData.get('socialLinks');
      if (socialLinksText) {
        homePageConfig.socialLinks = socialLinksText.split('\n')
          .map(line => {
            const parts = line.split('|');
            if (parts.length === 2) {
              return { name: parts[0].trim(), url: parts[1].trim() };
            }
            return null;
          })
          .filter(Boolean);
      }
      
      saveDataToGitHub();
      showNotification('✅ Page d\'accueil mise à jour', 'success');
    };
  }
  
  // Formulaire BSOD
  const bsodForm = document.getElementById('admin-bsod-form');
  if (bsodForm) {
    bsodForm.onsubmit = function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      
      bsodConfig.title = formData.get('title');
      bsodConfig.errorCode = formData.get('errorCode');
      bsodConfig.technicalInfo = formData.get('technicalInfo');
      bsodConfig.instructions = formData.get('instructions');
      bsodConfig.memoryDump = formData.get('memoryDump');
      
      saveDataToGitHub();
      showNotification('✅ Page d\'erreur mise à jour', 'success');
    };
  }
  
  // Formulaire GitHub
  const githubForm = document.getElementById('admin-github-form');
  if (githubForm) {
    githubForm.onsubmit = function(e) {
      e.preventDefault();
      const token = this.elements['githubToken'].value;
      
      if (token) {
        localStorage.setItem('github_token', token);
        GITHUB_CONFIG.token = token;
        showNotification('✅ Token GitHub sauvegardé', 'success');
      } else {
        localStorage.removeItem('github_token');
        GITHUB_CONFIG.token = null;
        showNotification('⚠️ Token GitHub supprimé', 'warning');
      }
    };
  }
}

// Changement d'onglet admin
function switchAdminTab(tab, winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  
  // Mettre à jour les boutons d'onglets
  const tabs = ['films', 'icons', 'home', 'bsod', 'github'];
  tabs.forEach(t => {
    const button = win.querySelector(`#tab-${t}`);
    const content = win.querySelector(`#${t}-content`);
    
    if (button && content) {
      if (t === tab) {
        button.style.background = '#0058a8';
        button.style.color = '#fff';
        content.style.display = 'block';
      } else {
        button.style.background = 'transparent';
        button.style.color = '#333';
        content.style.display = 'none';
      }
    }
  });
}

// Edition d'un film
function editFilmAdmin(id) {
  closeFilmWindow('adminpanel_' + Date.now());
  createAdminPanelWindow(id);
}

// Suppression d'un film
function deleteFilmAdmin(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce film ?')) {
    const index = films.findIndex(f => f.id === id);
    if (index !== -1) {
      films.splice(index, 1);
      saveDataToGitHub();
      showNotification('✅ Film supprimé', 'success');
      
      // Rafraîchir la fenêtre admin
      const adminWindows = document.querySelectorAll('.xp-film-window');
      adminWindows.forEach(win => {
        if (win.innerHTML.includes('Administration')) {
          closeFilmWindow(win.id);
        }
      });
      createAdminPanelWindow();
    }
  }
}

// Suppression d'une icône du bureau
function deleteIconAdmin(id) {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette icône ?')) {
    const index = desktopIcons.findIndex(i => i.id === id);
    if (index !== -1) {
      desktopIcons.splice(index, 1);
      saveDataToGitHub();
      renderDesktopIcons();
      showNotification('✅ Icône supprimée', 'success');
      
      // Rafraîchir la fenêtre admin
      const adminWindows = document.querySelectorAll('.xp-film-window');
      adminWindows.forEach(win => {
        if (win.innerHTML.includes('Administration')) {
          closeFilmWindow(win.id);
        }
      });
      createAdminPanelWindow();
    }
  }
}

// Upload d'image pour un film
async function uploadFilmImage() {
  const fileInput = document.getElementById('film-image-upload');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Veuillez sélectionner une image');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image valide');
    return;
  }
  
  try {
    showNotification('🔄 Compression et upload en cours...', 'info');
    
    const imageUrl = await MediaManager.uploadImage(file, 'images/films');
    if (imageUrl) {
      // Mettre à jour le champ URL
      const imageInput = document.querySelector('input[name="image"]');
      if (imageInput) {
        imageInput.value = imageUrl;
        
        // Ajouter prévisualisation
        const previewDiv = document.createElement('div');
        previewDiv.innerHTML = `
          <div style="margin-top:10px;padding:10px;border:1px solid #ddd;border-radius:6px;background:#f9f9f9;">
            <strong>✅ Image uploadée:</strong><br>
            <img src="${imageUrl}" alt="Prévisualisation" style="max-width:200px;max-height:150px;margin-top:5px;border-radius:4px;">
          </div>
        `;
        
        const currentPreview = document.getElementById('image-preview');
        if (currentPreview) {
          currentPreview.parentNode.replaceChild(previewDiv, currentPreview);
        } else {
          imageInput.parentNode.insertBefore(previewDiv, imageInput.nextSibling);
        }
        previewDiv.id = 'image-preview';
      }
      
      showNotification('✅ Image uploadée avec succès!', 'success');
    } else {
      throw new Error('Upload échoué');
    }
    
  } catch (error) {
    console.error('Erreur upload:', error);
    showNotification('❌ Erreur lors de l\'upload', 'error');
  }
}

// Test de la connexion GitHub
async function testGitHubConnection() {
  if (!GITHUB_CONFIG.token) {
    showNotification('❌ Token GitHub manquant', 'error');
    return;
  }
  
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}`, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (response.ok) {
      showNotification('✅ Connexion GitHub réussie !', 'success');
    } else {
      showNotification('❌ Erreur de connexion GitHub', 'error');
    }
  } catch (error) {
    showNotification('❌ Erreur de connexion', 'error');
  }
}

// Test de l'écran bleu
function testBSOD() {
  showBSOD();
}
