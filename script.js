// Configuration GitHub pour la sauvegarde persistante
const GITHUB_CONFIG = {
  owner: 'Teio-max',
  repo: 'theolegato-site',
  branch: 'main',
  dataFile: 'data.json',
  token: null
};

// Initialiser le token depuis localStorage
GITHUB_CONFIG.token = localStorage.getItem('github_token') || null;

// Données de base avec sauvegarde GitHub
let films = [
  {
    id: 1,
    titre: 'Film 1',
    note: 0,
    critique: '',
    image: '',
    galerie: [
      'https://via.placeholder.com/420x240?text=Image+1',
      'https://via.placeholder.com/420x240?text=Image+2'
    ],
    bandeAnnonce: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    liens: [
      { nom: 'Allociné', url: 'https://www.allocine.fr/' },
      { nom: 'SensCritique', url: 'https://www.senscritique.com/' }
    ]
  },
  {
    id: 2,
    titre: 'Film 2',
    note: 0,
    critique: '',
    image: '',
    galerie: [
      'https://via.placeholder.com/420x240?text=Image+1',
      'https://via.placeholder.com/420x240?text=Image+2'
    ],
    bandeAnnonce: '',
    liens: []
  },
  {
    id: 3,
    titre: 'Film 3',
    note: 0,
    critique: '',
    image: '',
    galerie: [],
    bandeAnnonce: '',
    liens: []
  },
  {
    id: 4,
    titre: 'Film 4',
    note: 0,
    critique: '',
    image: '',
    galerie: [],
    bandeAnnonce: '',
    liens: []
  },
  {
    id: 5,
    titre: 'Film 5',
    note: 0,
    critique: '',
    image: '',
    galerie: [],
    bandeAnnonce: '',
    liens: []
  }
];

// Configuration des icônes du bureau
let desktopIcons = [
  {
    id: 'icon-films',
    name: 'Films',
    icon: 'icons/film.png',
    action: 'createFilmsWindow',
    position: { x: 50, y: 50 }
  },
  {
    id: 'icon-manga',
    name: 'Manga',
    icon: 'icons/key.png',
    action: 'createMangaWindow',
    position: { x: 50, y: 150 }
  }
];

// Configuration de la page d'accueil
let homePageConfig = {
  name: 'Théo Van Waas',
  welcomeMessage: 'Bienvenue sur mon site personnel !',
  description: 'Ici tu trouveras mes critiques de films, ma collection manga, mes réseaux et tout ce que j\'aime partager.',
  sitePurpose: 'Centraliser mes passions, mes avis et mes liens favoris dans une interface rétro Windows XP.',
  footerText: 'Site réalisé avec amour et nostalgie 💾',
  socialLinks: [
    { name: 'Instagram', url: 'https://www.instagram.com/theolegato_o?igsh=Z2w5eTVqemNrZHpl' },
    { name: 'Twitter', url: '#' },
    { name: 'Tumblr', url: '#' },
    { name: 'Mangacollec', url: 'https://www.mangacollec.com/user/theolegato/collection' },
    { name: 'Letterboxd', url: 'https://letterboxd.com/tei/' }
  ]
};

// Configuration du BSOD
let bsodConfig = {
  title: 'A problem has been detected and windows has been shut down to prevent damage to your computer.',
  errorCode: 'PAGE_FAULT_IN_NONPAGED_AREA',
  technicalInfo: 'Technical information:\n\n*** STOP: 0x00000050 (0x8872A990, 0x00000001, 0x804F35D8, 0x00000000)\n\n*** win32k.sys - Address 804F35D8 base at 804D7000, DateStamp 3b7d85c3',
  instructions: 'If this is the first time you\'ve seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:\n\nCheck for viruses on your computer. Remove any newly installed hard drives or hard drive controllers. Check your hard drive to make sure it is properly configured and terminated. Run CHKDSK /F to check for hard drive corruption, and then restart your computer.',
  memoryDump: 'Beginning dump of physical memory...\nPhysical memory dump complete.\nContact your system administrator or technical support group for further assistance.'
};

// Fonction de chargement des données depuis GitHub
async function loadDataFromGitHub() {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}?ref=${GITHUB_CONFIG.branch}`);
    
    if (response.ok) {
      const data = await response.json();
      const content = JSON.parse(decodeURIComponent(escape(atob(data.content))));
      
      films = content.films || [];
      desktopIcons = content.desktopIcons || [];
      homePageConfig = content.homePageConfig || {};
      bsodConfig = content.bsodConfig || {};
      
      console.log('✅ Données chargées depuis GitHub');
      return true;
    } else {
      console.warn('⚠️ Impossible de charger depuis GitHub, utilisation des données par défaut');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error);
    return false;
  }
}

// Fonction de sauvegarde sur GitHub
async function saveDataToGitHub() {
  if (!GITHUB_CONFIG.token) {
    console.warn('⚠️ Token GitHub manquant, sauvegarde locale uniquement');
    saveDataLocally();
    return false;
  }

  try {
    // Récupérer le SHA actuel du fichier
    const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}?ref=${GITHUB_CONFIG.branch}`, {
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = null;
    if (getResponse.ok) {
      const currentFile = await getResponse.json();
      sha = currentFile.sha;
    }

    // Préparer les données
    const dataToSave = {
      films,
      desktopIcons,
      homePageConfig,
      bsodConfig
    };

    const content = btoa(unescape(encodeURIComponent(JSON.stringify(dataToSave, null, 2))));

    // Sauvegarder sur GitHub
    const saveResponse = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_CONFIG.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `🔄 Mise à jour des données du site - ${new Date().toLocaleString('fr-FR')}`,
        content: content,
        sha: sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (saveResponse.ok) {
      console.log('✅ Données sauvegardées sur GitHub');
      showNotification('✅ Modifications sauvegardées !', 'success');
      return true;
    } else {
      const error = await saveResponse.json();
      console.error('❌ Erreur lors de la sauvegarde:', error);
      showNotification('❌ Erreur de sauvegarde', 'error');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    showNotification('❌ Erreur de sauvegarde', 'error');
    return false;
  }
}

// Fonction de sauvegarde locale (fallback)
function saveDataLocally() {
  localStorage.setItem('films', JSON.stringify(films));
  localStorage.setItem('desktopIcons', JSON.stringify(desktopIcons));
  localStorage.setItem('homePageConfig', JSON.stringify(homePageConfig));
  localStorage.setItem('bsodConfig', JSON.stringify(bsodConfig));
}

// Fonction de compression d'image
function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir en blob compressé
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Fonction d'upload d'image pour films avec compression et prévisualisation
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
  
  const token = localStorage.getItem('github_token');
  if (!token) {
    alert('Token GitHub requis. Configurez-le dans l\'onglet GitHub.');
    return;
  }
  
  try {
    showNotification('🔄 Compression et upload en cours...', 'info');
    
    // Compresser l'image
    const compressedFile = await compressImage(file);
    const originalSize = (file.size / 1024).toFixed(1);
    const compressedSize = (compressedFile.size / 1024).toFixed(1);
    
    console.log(`📊 Compression: ${originalSize}KB → ${compressedSize}KB`);
    
    // Convertir en base64
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64Content = e.target.result.split(',')[1];
      const fileName = `film_${Date.now()}_affiche.jpg`;
      const filePath = `images/films/${fileName}`;
      
      // Upload vers GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload image film: ${fileName} (${compressedSize}KB)`,
          content: base64Content,
          branch: GITHUB_CONFIG.branch
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.content.download_url;
        
        // Mettre à jour le champ URL et afficher prévisualisation
        const imageInput = document.querySelector('input[name="image"]');
        imageInput.value = imageUrl;
        
        // Créer prévisualisation
        const previewContainer = document.getElementById('image-preview') || createImagePreview();
        previewContainer.innerHTML = `
          <div style="margin-top:10px;padding:10px;border:1px solid #ddd;border-radius:6px;background:#f9f9f9;">
            <strong>✅ Image uploadée:</strong><br>
            <img src="${imageUrl}" alt="Prévisualisation" style="max-width:200px;max-height:150px;margin-top:5px;border-radius:4px;">
            <br><small>Taille: ${compressedSize}KB (compression: ${((1 - compressedFile.size/file.size) * 100).toFixed(1)}%)</small>
          </div>
        `;
        
        showNotification(`✅ Image uploadée et compressée (${compressedSize}KB) !`, 'success');
      } else {
        throw new Error('Échec upload');
      }
    };
    
    reader.readAsDataURL(compressedFile);
    
  } catch (error) {
    console.error('Erreur upload:', error);
    showNotification('❌ Erreur lors de l\'upload', 'error');
  }
}

// Créer conteneur de prévisualisation
function createImagePreview() {
  const container = document.createElement('div');
  container.id = 'image-preview';
  
  const imageInput = document.querySelector('input[name="image"]');
  imageInput.parentNode.insertBefore(container, imageInput.nextSibling);
  
  return container;
}

// Fonction d'upload d'image dans une fenêtre de film
async function uploadFilmImageInWindow(filmId, winId) {
  const fileInput = document.getElementById(`film-image-upload-${winId}`);
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Veuillez sélectionner une image');
    return;
  }
  
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner un fichier image valide');
    return;
  }
  
  const token = localStorage.getItem('github_token');
  if (!token) {
    alert('Token GitHub requis. Configurez-le dans l\'onglet GitHub.');
    return;
  }
  
  try {
    showNotification('📤 Upload en cours...', 'info');
    
    // Convertir le fichier en base64
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64Content = e.target.result.split(',')[1];
      const fileName = `film_${Date.now()}_${file.name}`;
      const filePath = `images/films/${fileName}`;
      
      // Upload vers GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload image film: ${fileName}`,
          content: base64Content,
          branch: GITHUB_CONFIG.branch
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.content.download_url;
        
        // Mettre à jour le champ URL et l'image du film
        document.getElementById(`imgurl_${winId}`).value = imageUrl;
        const film = films.find(f => f.id === filmId);
        if (film) {
          film.image = imageUrl;
          updateFilmWindow(filmId, winId);
          saveData();
        }
        
        showNotification('✅ Image uploadée avec succès !', 'success');
      } else {
        throw new Error('Échec upload');
      }
    };
    
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('Erreur upload:', error);
    showNotification('❌ Erreur lors de l\'upload', 'error');
  }
}

// Fonction d'upload multiple pour galerie avec compression et prévisualisation
async function uploadGalleryImages() {
  const fileInput = document.getElementById('gallery-upload');
  const files = Array.from(fileInput.files);
  
  if (files.length === 0) {
    alert('Veuillez sélectionner au moins une image');
    return;
  }
  
  const token = localStorage.getItem('github_token');
  if (!token) {
    alert('Token GitHub requis. Configurez-le dans l\'onglet GitHub.');
    return;
  }
  
  try {
    showNotification(`🔄 Compression et upload de ${files.length} image(s)...`, 'info');
    
    const uploadedUrls = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    // Créer ou récupérer le conteneur de prévisualisation
    const previewContainer = document.getElementById('gallery-preview') || createGalleryPreview();
    previewContainer.innerHTML = '<div style="margin-top:10px;"><strong>🔄 Upload en cours...</strong></div>';
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.warn(`Fichier ignoré (pas une image): ${file.name}`);
        continue;
      }
      
      // Compresser l'image
      const compressedFile = await compressImage(file, 600, 0.7); // Plus petite pour galerie
      totalOriginalSize += file.size;
      totalCompressedSize += compressedFile.size;
      
      // Convertir en base64
      const base64Content = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(compressedFile);
      });
      
      const fileName = `gallery_${Date.now()}_${i}_${file.name.split('.')[0]}.jpg`;
      const filePath = `images/films/${fileName}`;
      
      // Upload vers GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload galerie: ${fileName} (${(compressedFile.size/1024).toFixed(1)}KB)`,
          content: base64Content,
          branch: GITHUB_CONFIG.branch
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        uploadedUrls.push(result.content.download_url);
      } else {
        throw new Error(`Échec upload ${file.name}`);
      }
    }
    
    // Ajouter les URLs à la galerie existante
    const galerieTextarea = document.querySelector('textarea[name="galerie"]');
    const existingUrls = galerieTextarea.value.split(',').map(url => url.trim()).filter(url => url);
    const allUrls = [...existingUrls, ...uploadedUrls];
    galerieTextarea.value = allUrls.join(', ');
    
    // Afficher prévisualisation des images uploadées
    const compressionRate = ((1 - totalCompressedSize/totalOriginalSize) * 100).toFixed(1);
    previewContainer.innerHTML = `
      <div style="margin-top:10px;padding:10px;border:1px solid #ddd;border-radius:6px;background:#f9f9f9;">
        <strong>✅ ${uploadedUrls.length} image(s) uploadée(s):</strong><br>
        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;">
          ${uploadedUrls.map(url => `<img src="${url}" alt="Galerie" style="width:80px;height:60px;object-fit:cover;border-radius:3px;">`).join('')}
        </div>
        <small>Taille totale: ${(totalCompressedSize/1024).toFixed(1)}KB (compression: ${compressionRate}%)</small>
      </div>
    `;
    
    showNotification(`✅ ${uploadedUrls.length} image(s) compressées et uploadées !`, 'success');
    
  } catch (error) {
    console.error('Erreur upload galerie:', error);
    showNotification('❌ Erreur lors de l\'upload de la galerie', 'error');
  }
}

// Créer conteneur de prévisualisation galerie
function createGalleryPreview() {
  const container = document.createElement('div');
  container.id = 'gallery-preview';
  
  const galerieTextarea = document.querySelector('textarea[name="galerie"]');
  galerieTextarea.parentNode.insertBefore(container, galerieTextarea.nextSibling);
  
  return container;
}

// Interface de gestion des images uploadées
function showImageManager() {
  const winId = 'image-manager-' + Date.now();
  const win = document.createElement('div');
  win.id = winId;
  win.className = 'xp-film-window';
  win.style.cssText = `
    position: fixed;
    top: 150px;
    left: 200px;
    width: 600px;
    height: 500px;
    background: var(--window-bg);
    border: 2px solid var(--border-main);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: ${getNextZIndex()};
    font-family: var(--font-main);
  `;

  win.innerHTML = `
    <div class="xp-titlebar" style="background:var(--accent);color:#fff;padding:8px 12px;font-weight:bold;cursor:move;display:flex;justify-content:space-between;align-items:center;">
      <span>🗂️ Gestionnaire d'Images</span>
      <button onclick="closeFilmWindow('${winId}')" style="background:none;border:none;color:#fff;font-size:16px;cursor:pointer;">✕</button>
    </div>
    <div style="padding:20px;height:calc(100% - 50px);overflow-y:auto;">
      <div id="image-list-${winId}">
        <div style="text-align:center;padding:20px;">
          <div style="font-size:48px;opacity:0.3;">📸</div>
          <p>Chargement des images...</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(win);
  loadImageList(winId);
  makeDraggable(win);
}

// Charger la liste des images depuis GitHub
async function loadImageList(winId) {
  const token = localStorage.getItem('github_token');
  if (!token) {
    document.getElementById(`image-list-${winId}`).innerHTML = `
      <div style="text-align:center;padding:20px;color:#e74c3c;">
        <div style="font-size:48px;">❌</div>
        <p>Token GitHub requis pour gérer les images</p>
      </div>
    `;
    return;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/images/films`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const files = await response.json();
      const imageFiles = files.filter(file => 
        file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) && file.name !== '.gitkeep'
      );

      let html = `
        <div style="margin-bottom:15px;">
          <strong>📊 ${imageFiles.length} image(s) trouvée(s)</strong>
          <button onclick="refreshImageList('${winId}')" style="float:right;padding:4px 8px;background:#3498db;color:#fff;border:none;border-radius:3px;cursor:pointer;">🔄 Actualiser</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;">
      `;

      imageFiles.forEach(file => {
        const size = (file.size / 1024).toFixed(1);
        html += `
          <div style="border:1px solid #ddd;border-radius:6px;padding:8px;background:#f9f9f9;">
            <img src="${file.download_url}" alt="${file.name}" style="width:100%;height:100px;object-fit:cover;border-radius:4px;margin-bottom:5px;">
            <div style="font-size:11px;margin-bottom:5px;">
              <strong>${file.name}</strong><br>
              <span style="color:#666;">${size}KB</span>
            </div>
            <div style="display:flex;gap:3px;">
              <button onclick="copyImageUrl('${file.download_url}')" style="flex:1;padding:2px 4px;background:#27ae60;color:#fff;border:none;border-radius:2px;font-size:10px;cursor:pointer;">📋 Copier</button>
              <button onclick="deleteImage('${file.name}', '${file.sha}', '${winId}')" style="flex:1;padding:2px 4px;background:#e74c3c;color:#fff;border:none;border-radius:2px;font-size:10px;cursor:pointer;">🗑️ Suppr</button>
            </div>
          </div>
        `;
      });

      html += '</div>';
      document.getElementById(`image-list-${winId}`).innerHTML = html;

    } else {
      throw new Error('Erreur chargement');
    }
  } catch (error) {
    document.getElementById(`image-list-${winId}`).innerHTML = `
      <div style="text-align:center;padding:20px;color:#e74c3c;">
        <div style="font-size:48px;">⚠️</div>
        <p>Erreur lors du chargement des images</p>
      </div>
    `;
  }
}

// Copier URL d'image
function copyImageUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    showNotification('📋 URL copiée !', 'success');
  });
}

// Supprimer une image
async function deleteImage(fileName, sha, winId) {
  if (!confirm(`Supprimer l'image ${fileName} ?`)) return;

  const token = localStorage.getItem('github_token');
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/images/films/${fileName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message: `🗑️ Suppression image: ${fileName}`,
        sha: sha,
        branch: GITHUB_CONFIG.branch
      })
    });

    if (response.ok) {
      showNotification('✅ Image supprimée !', 'success');
      loadImageList(winId);
    } else {
      throw new Error('Échec suppression');
    }
  } catch (error) {
    showNotification('❌ Erreur suppression', 'error');
  }
}

// Actualiser liste
function refreshImageList(winId) {
  loadImageList(winId);
}

// Fonction principale de sauvegarde
async function saveData() {
  const success = await saveDataToGitHub();
  if (!success) {
    saveDataLocally();
  }
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    ${type === 'success' ? 'background: #27ae60;' : ''}
    ${type === 'error' ? 'background: #e74c3c;' : ''}
    ${type === 'info' ? 'background: #3498db;' : ''}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Fonction de rendu des icônes du bureau
function renderDesktopIcons() {
  const desktopContainer = document.querySelector('.desktop-icons');
  if (!desktopContainer) return;
  
  desktopContainer.innerHTML = '';
  desktopIcons.forEach(icon => {
    const iconElement = document.createElement('div');
    iconElement.className = 'desktop-icon';
    iconElement.id = icon.id;
    iconElement.tabIndex = 0;
    iconElement.style.left = icon.position.x + 'px';
    iconElement.style.top = icon.position.y + 'px';
    
    iconElement.innerHTML = `
      <img src="${icon.icon}" alt="${icon.name}">
      <span>${icon.name}</span>
    `;
    
    iconElement.onclick = () => {
      if (window[icon.action]) {
        window[icon.action]();
      } else if (icon.action.startsWith('http')) {
        // Lien personnalisé
        window.open(icon.action, '_blank');
      } else {
        console.warn(`Action ${icon.action} non trouvée`);
      }
    };
    
    desktopContainer.appendChild(iconElement);
  });
}

const pageIcons = {
  'accueil': '🏠',
  'monpc': '💻',
  'films': '🎬',
  'film': '🎬',
};

function setTitle() {
  // Ne rien changer à l'icône xp-icon pour garder l'avatar
  const el = document.getElementById('xp-title');
  if (el) el.textContent = 'Mes Liens';
  // Onglets XP : effet sélectionné
  ['accueil','monpc','films'].forEach(tab => {
    const tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.classList.remove('selected');
  });
}

function renderStars(note, id, winId) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star" onclick="setNoteWindow(${id},${i},'${winId}')" style="cursor:pointer; color:${i <= note ? '#eab308' : '#bbb'}; font-size:1.6em;">★</span>`;
  }
  return stars;
}

function navigate(page, id) {
  const content = document.getElementById('content');
  setTitle();
  if (page === 'accueil') {
    content.innerHTML = '<h2>Bienvenue sur le site !</h2><p>Sélectionne une rubrique dans la navigation ci-dessus.</p>';
  } else if (page === 'monpc') {
    content.innerHTML = `
      <h2>Mon PC</h2>
      <table class="pc-specs">
        <tr><th>GPU</th><td>MSI NVIDIA GeForce RTX 5080 16G Ventus 3X OC Plus</td></tr>
        <tr><th>CPU</th><td>Ryzen 7 9800X3D</td></tr>
        <tr><th>Carte mère</th><td>ASUS TUF Gaming B650-PLUS</td></tr>
        <tr><th>RAM</th><td>32 Go Corsair Vengeance DDR5 6000 MHz CL30 AMD Expo</td></tr>
        <tr><th>PSU</th><td>MSI MPG A100G</td></tr>
        <tr><th>Boîtier</th><td>Fractal North Charcoal Black Mesh</td></tr>
        <tr><th>Ventirad</th><td>Dark Rock Pro 5</td></tr>
        <tr><th>Ventilos</th><td>BeQuiet Silent Wings 4</td></tr>
      </table>
    `;
  } else if (page === 'films') {
    setTitle('Films', 'films');
    let html = '<h2>Films</h2><div class="film-list">';
    films.forEach(film => {
      html += `<div class="film-item" onclick="createFilmWindow(${film.id})">${film.titre}</div>`;
    });
    html += '</div>';
    content.innerHTML = html;
  }
}

function createFilmWindow(id) {
  playOpenSound();
  const film = films.find(f => f.id === id);
  if (!film) return;
  const winId = 'filmwin_' + id + '_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (100 + Math.random()*200) + 'px';
  win.style.top = (100 + Math.random()*100) + 'px';
  win.style.zIndex = getNextZIndex();

  // Carrousel d'images
  let galerieHtml = '';
  let mainImg = film.galerie && film.galerie.length > 0 ? film.galerie[0] : film.image;
  if (film.galerie && film.galerie.length > 0) {
    galerieHtml = `
      <div class="film-carousel" style="display:flex;align-items:center;justify-content:center;margin-bottom:10px;gap:8px;">
        <button class="carousel-btn" onclick="prevImgGal('${winId}')" style="font-size:1.5em;padding:0 10px;">&#8592;</button>
        <img id="${winId}_mainimg" src="${mainImg}" alt="Image du film" class="film-main-img" style="max-width:90%;border-radius:8px;display:block;" />
        <button class="carousel-btn" onclick="nextImgGal('${winId}')" style="font-size:1.5em;padding:0 10px;">&#8594;</button>
      </div>
    `;
  } else {
    galerieHtml = `<img id="${winId}_mainimg" src="${mainImg}" alt="Image du film" class="film-main-img" style="max-width:90%;border-radius:8px;display:block;margin-bottom:10px;" />`;
  }

  let liensHtml = '';
  if (film.liens && film.liens.length > 0) {
    liensHtml = '<div class="film-links">Liens critiques : ';
    film.liens.forEach(lien => {
      liensHtml += `<a href="${lien.url}" target="_blank">${lien.nom}</a> `;
    });
    liensHtml += '</div>';
  }
  let bandeAnnonceHtml = '';
  if (film.bandeAnnonce) {
    bandeAnnonceHtml = `<div class="film-bande-annonce"><a href="${film.bandeAnnonce}" target="_blank">🎬 Voir la bande-annonce</a></div>`;
  }
  win.innerHTML = `
    <div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/film.png" class="xp-icon" alt=""><span>${film.titre}</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', '${film.titre}', 'icons/film.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="film-detail" id="${winId}_content">
      ${galerieHtml}
      <hr class="xp-hr">
      <div class="note">Note : ${renderStars(film.note, film.id, winId)}</div>
      <div class="critique">${film.critique || 'Aucune critique pour le moment.'}</div>
      <hr class="xp-hr">
      ${bandeAnnonceHtml}
      ${liensHtml}
    </div>
  `;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);

  // Carrousel JS
  if (film.galerie && film.galerie.length > 0) {
    win.dataset.galIndex = '0';
    win.dataset.galLength = film.galerie.length;
    win.dataset.filmId = film.id;
  }
}
window.prevImgGal = function(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  const film = films.find(f => f.id == win.dataset.filmId);
  let idx = parseInt(win.dataset.galIndex || '0');
  idx = (idx - 1 + film.galerie.length) % film.galerie.length;
  win.dataset.galIndex = idx;
  document.getElementById(winId + '_mainimg').src = film.galerie[idx];
}
window.nextImgGal = function(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  const film = films.find(f => f.id == win.dataset.filmId);
  let idx = parseInt(win.dataset.galIndex || '0');
  idx = (idx + 1) % film.galerie.length;
  win.dataset.galIndex = idx;
  document.getElementById(winId + '_mainimg').src = film.galerie[idx];
}

function minimizeWindow(winId, title, iconUrl) {
  const win = document.getElementById(winId);
  const taskbarTabs = document.getElementById('minimized-windows');

  if (win && !document.getElementById('tab-' + winId)) {
    playOpenSound();
    // Calcul de la translation vers la barre des tâches
    const winRect = win.getBoundingClientRect();
    const taskbar = document.getElementById('taskbar');
    const taskbarRect = taskbar.getBoundingClientRect();
    // On vise le centre de la barre des tâches
    const targetX = (taskbarRect.left + taskbarRect.width / 2) - (winRect.left + winRect.width / 2);
    const targetY = (taskbarRect.top + taskbarRect.height / 2) - (winRect.top + winRect.height / 2);
    win.style.transition = 'transform 0.38s cubic-bezier(.4,1.6,.6,1), opacity 0.32s';
    win.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.5)`;
    win.style.opacity = '0';
    win.style.pointerEvents = 'none';
    setTimeout(() => {
      win.style.display = 'none';
      win.style.transition = '';
      win.style.transform = '';
      win.style.opacity = '';
      win.style.pointerEvents = '';
      const tab = document.createElement('div');
      tab.className = 'taskbar-tab';
      tab.id = 'tab-' + winId;
      let iconStyle = (winId === 'container') ? 'border-radius:3px; object-fit:cover;' : '';
      const iconHtml = `<img src="${iconUrl}" alt="" style="width:16px; height:16px; ${iconStyle}">`;
      tab.innerHTML = `<span class="xp-icon">${iconHtml}</span><span>${title}</span>`;
      tab.onclick = () => {
        win.style.display = 'block';
        win.classList.add('window-opening');
        setTimeout(() => win.classList.remove('window-opening'), 220);
        taskbarTabs.removeChild(tab);
      };
      taskbarTabs.appendChild(tab);
    }, 370);
  }
}

function createFilmsWindow() {
  playOpenSound();
  const winId = 'filmswin_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (120 + Math.random()*200) + 'px';
  win.style.top = (80 + Math.random()*100) + 'px';
  win.style.zIndex = getNextZIndex();
  let html = `<div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
    <span class="xp-title-content"><img src="icons/film.png" class="xp-icon" alt=""><span>Films</span></span>
    <span class="xp-buttons">
      <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'Films', 'icons/film.png')"><img src="icons/minimize.png" alt="Min"></span>
      <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
      <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
    </span>
  </div>`;
  html += '<div class="film-list" id="'+winId+'_content">';
  html += '<a href="https://letterboxd.com/tei/" target="_blank" class="big-link" style="margin-bottom:18px; padding:0;"><img src="letterboxd.png" alt="Letterboxd" style="height:54px; width:auto; display:block; margin:auto;"></a>';
  films.forEach(film => {
    html += `<div class="film-item" onclick="createFilmWindow(${film.id})">${film.titre}</div>`;
  });
  html += '</div>';
  win.innerHTML = html;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);
}

function createAboutWindow() {
  playOpenSound();
  const winId = 'aboutwin_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (160 + Math.random()*120) + 'px';
  win.style.top = (120 + Math.random()*80) + 'px';
  win.style.zIndex = getNextZIndex();
  win.innerHTML = `
    <div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/info.png" class="xp-icon" alt=""><span>À propos</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'À propos', 'icons/info.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="film-detail" style="text-align:left;max-width:480px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:18px;">
        <img src="avatar.jpg" alt="Avatar" style="width:72px;height:72px;border-radius:12px;border:3px solid var(--border-main);box-shadow:0 2px 8px var(--shadow);margin-bottom:8px;">
        <h2 style="margin:0;">Théo Van Waas</h2>
      </div>
      <p><strong>Bienvenue sur mon site personnel !</strong><br>
      Ici tu trouveras mes critiques de films, ma collection manga, mes réseaux et tout ce que j’aime partager.<br><br>
      <strong>But du site :</strong> Centraliser mes passions, mes avis et mes liens favoris dans une interface rétro Windows XP.<br><br>
      <strong>Contact & réseaux :</strong></p>
      <ul style="margin-left:18px;">
        <li><a href="https://www.instagram.com/theolegato_o?igsh=Z2w5eTVqemNrZHpl" target="_blank">Instagram</a></li>
        <li><a href="#" target="_blank">Twitter</a></li>
        <li><a href="#" target="_blank">Tumblr</a></li>
        <li><a href="https://www.mangacollec.com/user/theolegato/collection" target="_blank">Mangacollec</a></li>
        <li><a href="https://letterboxd.com/tei/" target="_blank">Letterboxd</a></li>
      </ul>
      <p style="font-size:0.98em;color:#888;margin-top:18px;">Site réalisé avec amour et nostalgie 💾</p>
    </div>
  `;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);
}

function createMangaWindow() {
  playOpenSound();
  const winId = 'mangawin_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (140 + Math.random()*200) + 'px';
  win.style.top = (100 + Math.random()*100) + 'px';
  win.style.zIndex = getNextZIndex();
  win.innerHTML = `
    <div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/key.png" class="xp-icon" alt=""><span>Manga</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'Manga', 'icons/key.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="film-detail" style="text-align:center;max-width:480px;margin:0 auto;">
      <h2 style="margin:0 0 18px 0;">Ma Collection Manga</h2>
      <a href="https://www.mangacollec.com/user/theolegato/collection" target="_blank" class="big-link" style="margin-bottom:18px; padding:0;">
        <img src="mangacollec.png" alt="Mangacollec" style="height:54px; width:auto; display:block; margin:auto;">
      </a>
      <p>Découvre ma collection manga sur Mangacollec !</p>
      <div style="margin-top:18px;">
        <h3>Mes séries préférées :</h3>
        <ul style="text-align:left; margin-left:18px;">
          <li>One Piece</li>
          <li>Dragon Ball</li>
          <li>Naruto</li>
          <li>Bleach</li>
          <li>Et bien d'autres...</li>
        </ul>
      </div>
    </div>
  `;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);
}

function createAdminLoginWindow() {
  playOpenSound();
  const winId = 'adminwin_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (180 + Math.random()*120) + 'px';
  win.style.top = (120 + Math.random()*80) + 'px';
  win.style.zIndex = getNextZIndex();
  win.innerHTML = `
    <div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/key.png" class="xp-icon" alt=""><span>Admin</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'Admin', 'icons/key.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="film-detail" style="text-align:center;max-width:340px;margin:0 auto;">
      <h2 style="margin:0 0 18px 0;">Connexion admin</h2>
      <input type="password" id="admin-pass" placeholder="Mot de passe" style="width:80%;padding:8px;font-size:1.1em;border-radius:6px;border:1.5px solid var(--border-main);margin-bottom:12px;">
      <br>
      <button onclick="checkAdminPass('${winId}')" style="padding:8px 22px;font-size:1.1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">Se connecter</button>
      <div id="admin-error" style="color:#e74c3c;margin-top:10px;font-size:0.98em;"></div>
    </div>
  `;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);
}
window.checkAdminPass = function(winId) {
  const pass = document.getElementById('admin-pass').value;
  if (pass === 'sitethéi') { // Mot de passe personnalisé
    document.getElementById(winId).remove();
    createAdminPanelWindow();
  } else {
    document.getElementById('admin-error').textContent = 'Mot de passe incorrect.';
  }
}

function createAdminPanelWindow(editFilmId = null) {
  playOpenSound();
  const winId = 'adminpanel_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-film-window window-opening';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.left = (200 + Math.random()*120) + 'px';
  win.style.top = (120 + Math.random()*80) + 'px';
  win.style.zIndex = getNextZIndex();

  // Formulaire d'ajout/modification
  let filmToEdit = editFilmId ? films.find(f => f.id === editFilmId) : null;
  let formHtml = `<form id="admin-film-form" style="margin-bottom:18px;">
    <h3 style="margin-top:0;">${filmToEdit ? 'Modifier' : 'Ajouter'} un film</h3>
    <label>Titre : <input type="text" name="titre" value="${filmToEdit ? filmToEdit.titre : ''}" required style="width:70%"></label><br><br>
    <label>Note (0-5) : <input type="number" name="note" min="0" max="5" value="${filmToEdit ? filmToEdit.note : 0}" style="width:50px"></label><br><br>
    <label>Critique :<br><textarea name="critique" rows="3" style="width:90%">${filmToEdit ? filmToEdit.critique : ''}</textarea></label><br><br>
    <label>Image principale :</label><br>
    <input type="text" name="image" value="${filmToEdit ? filmToEdit.image : ''}" placeholder="URL de l'image" style="width:70%"><br>
    <input type="file" id="film-image-upload" accept="image/*" style="margin:8px 0;">
    <button type="button" onclick="uploadFilmImage()" style="padding:4px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;">📤 Upload & Compress</button>
    <button type="button" onclick="showImageManager()" style="padding:4px 12px;background:#e67e22;color:#fff;border:none;border-radius:4px;margin-left:8px;">🗂️ Gérer</button><br><br>
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
    <tr style="background:var(--accent-light);color:var(--accent);font-weight:bold;"><td>Titre</td><td>Note</td><td>Actions</td></tr>`;
  films.forEach(film => {
    tableHtml += `<tr style="border-bottom:1px solid var(--border-main);">
      <td>${film.titre}</td>
      <td>${film.note}</td>
      <td>
        <button onclick="editFilmAdmin(${film.id})" style="padding:2px 10px;margin-right:6px;">Éditer</button>
        <button onclick="deleteFilmAdmin(${film.id})" style="padding:2px 10px;color:#fff;background:#e74c3c;border:none;border-radius:4px;">Supprimer</button>
      </td>
    </tr>`;
  });
  tableHtml += '</table>';

  // Onglets pour Films, Icônes, Page d'accueil, BSOD et GitHub
  let tabsHtml = `
    <div style="display:flex;margin-bottom:18px;border-bottom:2px solid var(--border-main);background:var(--accent-light);border-radius:8px 8px 0 0;padding:4px 4px 0 4px;">
      <button id="tab-films" class="admin-tab active" onclick="switchAdminTab('films', '${winId}')" style="padding:10px 20px;border:none;background:var(--accent);color:#fff;cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;transition:all 0.2s ease;box-shadow:0 2px 4px rgba(0,0,0,0.1);">🎬 Films</button>
      <button id="tab-icons" class="admin-tab" onclick="switchAdminTab('icons', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:var(--text);cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;transition:all 0.2s ease;">🖥️ Icônes Bureau</button>
      <button id="tab-home" class="admin-tab" onclick="switchAdminTab('home', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:var(--text);cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;transition:all 0.2s ease;">🏠 Page d'accueil</button>
      <button id="tab-bsod" class="admin-tab" onclick="switchAdminTab('bsod', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:var(--text);cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;transition:all 0.2s ease;">💀 Page d'erreur</button>
      <button id="tab-github" class="admin-tab" onclick="switchAdminTab('github', '${winId}')" style="padding:10px 20px;border:none;background:transparent;color:var(--text);cursor:pointer;border-radius:6px 6px 0 0;font-weight:bold;transition:all 0.2s ease;">⚙️ GitHub</button>
    </div>
  `;

  // Contenu des icônes
  let iconsHtml = `
    <div id="icons-content" style="display:none;">
      <form id="admin-icon-form" style="margin-bottom:18px;">
        <h3 style="margin-top:0;">Ajouter une icône</h3>
        <label>Nom : <input type="text" name="iconName" required style="width:70%"></label><br><br>
        <label>Icône (URL) : <input type="text" name="iconUrl" required style="width:70%"></label><br><br>
        <label>Action : <select name="iconAction" style="width:70%">
          <option value="createFilmsWindow">Films</option>
          <option value="createMangaWindow">Manga</option>
          <option value="createAboutWindow">À propos</option>
          <option value="custom">Lien personnalisé</option>
        </select></label><br><br>
        <label id="customUrlLabel" style="display:none;">URL personnalisée : <input type="text" name="customUrl" style="width:70%"></label><br><br>
        <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">Ajouter</button>
      </form>
      <hr style="margin:18px 0;">
      <h3 style="margin-bottom:8px;">Icônes du bureau</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
        <tr style="background:var(--accent-light);color:var(--accent);font-weight:bold;"><td>Nom</td><td>Action</td><td>Actions</td></tr>
  `;
  
  desktopIcons.forEach(icon => {
    iconsHtml += `<tr style="border-bottom:1px solid var(--border-main);">
      <td>${icon.name}</td>
      <td>${icon.action}</td>
      <td>
        <button onclick="deleteIconAdmin('${icon.id}')" style="padding:2px 10px;color:#fff;background:#e74c3c;border:none;border-radius:4px;">Supprimer</button>
      </td>
    </tr>`;
  });
  iconsHtml += '</table></div>';

  // Contenu de la page d'accueil
  let homeHtml = `
    <div id="home-content" style="display:none;">
      <form id="admin-home-form" style="margin-bottom:18px;">
        <h3 style="margin-top:0;">Modifier la page d'accueil</h3>
        <label>Nom : <input type="text" name="homeName" value="${homePageConfig?.name || 'Théo Van Waas'}" required style="width:70%"></label><br><br>
        <label>Message de bienvenue : <input type="text" name="welcomeMessage" value="${homePageConfig?.welcomeMessage || 'Bienvenue sur mon site personnel !'}" required style="width:70%"></label><br><br>
        <label>Description :<br><textarea name="description" rows="2" style="width:90%">${homePageConfig?.description || 'Ici tu trouveras mes critiques de films, ma collection manga, mes réseaux et tout ce que j\'aime partager.'}</textarea></label><br><br>
        <label>But du site :<br><textarea name="sitePurpose" rows="2" style="width:90%">${homePageConfig?.sitePurpose || 'Centraliser mes passions, mes avis et mes liens favoris dans une interface rétro Windows XP.'}</textarea></label><br><br>
        <label>Texte de fin : <input type="text" name="footerText" value="${homePageConfig?.footerText || 'Site réalisé avec amour et nostalgie 💾'}" style="width:70%"></label><br><br>
        <hr style="margin:18px 0;">
        <h4>Liens sociaux (nom|url, un par ligne) :</h4>
        <textarea name="socialLinks" rows="5" style="width:90%">${(homePageConfig?.socialLinks || []).map(l => l.name + '|' + l.url).join('\n')}</textarea><br><br>
        <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">Enregistrer</button>
      </form>
    </div>
  `;

  // Contenu du BSOD
  let bsodHtml = `
    <div id="bsod-content" style="display:none;">
      <form id="admin-bsod-form" style="margin-bottom:18px;">
        <h3 style="margin-top:0;">Modifier la page d'erreur Windows XP</h3>
        <label>Titre principal :<br><textarea name="title" rows="2" style="width:90%">${bsodConfig?.title || 'A problem has been detected and windows has been shut down to prevent damage to your computer.'}</textarea></label><br><br>
        <label>Code d'erreur : <input type="text" name="errorCode" value="${bsodConfig?.errorCode || 'PAGE_FAULT_IN_NONPAGED_AREA'}" style="width:70%"></label><br><br>
        <label>Informations techniques :<br><textarea name="technicalInfo" rows="4" style="width:90%">${bsodConfig?.technicalInfo || 'Technical information:\\n\\n*** STOP: 0x00000050 (0x8872A990, 0x00000001, 0x804F35D8, 0x00000000)\\n\\n*** win32k.sys - Address 804F35D8 base at 804D7000, DateStamp 3b7d85c3'}</textarea></label><br><br>
        <label>Instructions :<br><textarea name="instructions" rows="6" style="width:90%">${bsodConfig?.instructions || 'If this is the first time you\'ve seen this Stop error screen, restart your computer. If this screen appears again, follow these steps:\\n\\nCheck for viruses on your computer. Remove any newly installed hard drives or hard drive controllers. Check your hard drive to make sure it is properly configured and terminated. Run CHKDSK /F to check for hard drive corruption, and then restart your computer.'}</textarea></label><br><br>
        <label>Dump mémoire :<br><textarea name="memoryDump" rows="3" style="width:90%">${bsodConfig?.memoryDump || 'Beginning dump of physical memory...\\nPhysical memory dump complete.\\nContact your system administrator or technical support group for further assistance.'}</textarea></label><br><br>
        <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">Enregistrer</button>
        <button type="button" onclick="testBSOD()" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#e74c3c;color:#fff;border:none;margin-left:10px;">Tester</button>
      </form>
    </div>
  `;

  // Contenu GitHub
  let githubHtml = `
    <div id="github-content" style="display:none;">
      <h3 style="margin-top:0;">⚙️ Configuration GitHub</h3>
      <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;border-left:4px solid var(--accent);">
        <p><strong>🔐 Sauvegarde persistante</strong></p>
        <p>Pour que vos modifications soient sauvegardées de façon permanente, vous devez configurer un token GitHub.</p>
      </div>
      
      <form id="admin-github-form" style="margin-bottom:18px;">
        <label>Token GitHub Personnel :<br>
        <input type="password" name="githubToken" value="${GITHUB_CONFIG.token || ''}" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" style="width:90%;padding:8px;margin-top:5px;font-family:monospace;">
        </label><br><br>
        
        <div style="background:#fff3cd;padding:12px;border-radius:6px;margin:10px 0;border-left:4px solid #ffc107;">
          <p style="margin:0;"><strong>📝 Comment créer un token :</strong></p>
          <ol style="margin:8px 0 0 18px;padding:0;">
            <li>Allez sur <a href="https://github.com/settings/tokens" target="_blank">GitHub → Settings → Developer settings → Personal access tokens</a></li>
            <li>Cliquez sur "Generate new token (classic)"</li>
            <li>Cochez les permissions : <code>repo</code> (accès complet au repository)</li>
            <li>Copiez le token généré et collez-le ci-dessus</li>
          </ol>
        </div>
        
        <button type="submit" style="padding:7px 18px;font-size:1em;border-radius:6px;background:var(--accent);color:#fff;border:none;">💾 Sauvegarder Token</button>
        <button type="button" onclick="testGitHubConnection()" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#28a745;color:#fff;border:none;margin-left:10px;">🔍 Tester Connexion</button>
        <button type="button" onclick="loadDataFromGitHub().then(() => location.reload())" style="padding:7px 18px;font-size:1em;border-radius:6px;background:#17a2b8;color:#fff;border:none;margin-left:10px;">🔄 Recharger Données</button>
      </form>
      
      <div style="background:#d4edda;padding:12px;border-radius:6px;border-left:4px solid #28a745;">
        <p style="margin:0;"><strong>✅ Statut :</strong> ${GITHUB_CONFIG.token ? '🟢 Token configuré' : '🔴 Token manquant'}</p>
        <p style="margin:8px 0 0 0;"><strong>📁 Repository :</strong> ${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}</p>
        <p style="margin:8px 0 0 0;"><strong>📄 Fichier de données :</strong> ${GITHUB_CONFIG.dataFile}</p>
      </div>
    </div>
  `;

  win.innerHTML = `
    <div class="xp-titlebar xp-titlebar-film" onmousedown="startDrag(event, '${winId}')">
      <span class="xp-title-content"><img src="icons/key.png" class="xp-icon" alt=""><span>Administration</span></span>
      <span class="xp-buttons">
        <span class="xp-btn min" data-tooltip="Réduire" onclick="minimizeWindow('${winId}', 'Admin', 'icons/key.png')"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" data-tooltip="Agrandir" onclick="maxFilmWindow('${winId}')"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" data-tooltip="Fermer" onclick="closeFilmWindow('${winId}')"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="film-detail" style="text-align:left;max-width:600px;margin:0 auto;">
      ${tabsHtml}
      <div id="films-content">
        ${formHtml}
        <hr style="margin:18px 0;">
        <h3 style="margin-bottom:8px;">Liste des films</h3>
        ${tableHtml}
      </div>
      ${iconsHtml}
      ${homeHtml}
      ${bsodHtml}
      ${githubHtml}
    </div>
  `;
  document.body.appendChild(win);
  win.onmousedown = () => win.style.zIndex = getNextZIndex();
  addResizeHandle(win);
  makeDraggable(win, winId);

  // Gestion du formulaire films
  win.querySelector('#admin-film-form').onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const galerie = data.galerie ? data.galerie.split(',').map(s=>s.trim()).filter(Boolean) : [];
    const liens = data.liens ? data.liens.split('\n').map(l=>{
      const [nom, url] = l.split('|');
      return { nom: (nom||'').trim(), url: (url||'').trim() };
    }).filter(l=>l.nom && l.url) : [];
    if (filmToEdit) {
      // Modification
      filmToEdit.titre = data.titre;
      filmToEdit.note = parseInt(data.note)||0;
      filmToEdit.critique = data.critique;
      filmToEdit.image = data.image;
      filmToEdit.galerie = galerie;
      filmToEdit.bandeAnnonce = data.bandeAnnonce;
      filmToEdit.liens = liens;
    } else {
      // Ajout
      const newId = films.length ? Math.max(...films.map(f=>f.id))+1 : 1;
      films.push({
        id: newId,
        titre: data.titre,
        note: parseInt(data.note)||0,
        critique: data.critique,
        image: data.image,
        galerie,
        bandeAnnonce: data.bandeAnnonce,
        liens
      });
    }
    saveData(); // Sauvegarder les données
    win.remove();
    createAdminPanelWindow();
  };

  // Gestion du formulaire icônes
  win.querySelector('#admin-icon-form').onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const newId = 'icon-' + Date.now();
    const action = data.iconAction === 'custom' ? data.customUrl : data.iconAction;
    
    desktopIcons.push({
      id: newId,
      name: data.iconName,
      icon: data.iconUrl,
      action: action,
      position: { x: 50 + (desktopIcons.length * 100), y: 50 + (desktopIcons.length * 100) }
    });
    
    saveData();
    renderDesktopIcons();
    win.remove();
    createAdminPanelWindow();
  };

  // Gestion du formulaire page d'accueil
  win.querySelector('#admin-home-form').onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    const socialLinks = data.socialLinks ? data.socialLinks.split('\n').map(l => {
      const [name, url] = l.split('|');
      return { name: (name||'').trim(), url: (url||'').trim() };
    }).filter(l => l.name && l.url) : [];
    
    homePageConfig.name = data.homeName;
    homePageConfig.welcomeMessage = data.welcomeMessage;
    homePageConfig.description = data.description;
    homePageConfig.sitePurpose = data.sitePurpose;
    homePageConfig.footerText = data.footerText;
    homePageConfig.socialLinks = socialLinks;
    
    saveData();
    updateMainWindow();
    win.remove();
    createAdminPanelWindow();
  };

  // Gestion du formulaire BSOD
  win.querySelector('#admin-bsod-form').onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    
    bsodConfig.title = data.title;
    bsodConfig.errorCode = data.errorCode;
    bsodConfig.technicalInfo = data.technicalInfo;
    bsodConfig.instructions = data.instructions;
    bsodConfig.memoryDump = data.memoryDump;
    
    saveData();
    win.remove();
    createAdminPanelWindow();
  };

  // Gestion du formulaire GitHub
  win.querySelector('#admin-github-form').onsubmit = function(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(this).entries());
    
    if (data.githubToken) {
      localStorage.setItem('github_token', data.githubToken);
      GITHUB_CONFIG.token = data.githubToken;
      showNotification('✅ Token GitHub sauvegardé !', 'success');
    } else {
      localStorage.removeItem('github_token');
      GITHUB_CONFIG.token = null;
      showNotification('🗑️ Token GitHub supprimé', 'info');
    }
    
    win.remove();
    createAdminPanelWindow();
  };

  // Gestion du select pour URL personnalisée
  win.querySelector('select[name="iconAction"]').onchange = function() {
    const customLabel = win.querySelector('#customUrlLabel');
    if (this.value === 'custom') {
      customLabel.style.display = 'block';
    } else {
      customLabel.style.display = 'none';
    }
  };

  if (win.querySelector('#cancel-edit')) {
    win.querySelector('#cancel-edit').onclick = function() {
      win.remove();
      createAdminPanelWindow();
    };
  }
}
window.editFilmAdmin = function(id) {
  // Ferme toutes les fenêtres admin panel avant d'ouvrir la nouvelle
  document.querySelectorAll('.xp-film-window').forEach(w => {
    if (w.innerHTML.includes('Administration')) w.remove();
  });
  createAdminPanelWindow(id);
}
window.deleteFilmAdmin = function(id) {
  if (confirm('Supprimer ce film ?')) {
    const idx = films.findIndex(f => f.id === id);
    if (idx !== -1) films.splice(idx, 1);
    saveData(); // Sauvegarder les données
    // Ferme toutes les fenêtres admin panel avant d'ouvrir la nouvelle
    document.querySelectorAll('.xp-film-window').forEach(w => {
      if (w.innerHTML.includes('Administration')) w.remove();
    });
    createAdminPanelWindow();
  }
}

window.deleteIconAdmin = function(id) {
  if (confirm('Supprimer cette icône ?')) {
    const idx = desktopIcons.findIndex(i => i.id === id);
    if (idx !== -1) desktopIcons.splice(idx, 1);
    saveData();
    renderDesktopIcons();
    // Ferme toutes les fenêtres admin panel avant d'ouvrir la nouvelle
    document.querySelectorAll('.xp-film-window').forEach(w => {
      if (w.innerHTML.includes('Administration')) w.remove();
    });
    createAdminPanelWindow();
  }
}

window.switchAdminTab = function(tab, winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  
  // Mise à jour des onglets
  win.querySelectorAll('.admin-tab').forEach(t => {
    t.style.background = 'transparent';
    t.style.color = 'var(--text)';
    t.style.boxShadow = 'none';
  });
  win.querySelector('#tab-' + tab).style.background = 'var(--accent)';
  win.querySelector('#tab-' + tab).style.color = '#fff';
  win.querySelector('#tab-' + tab).style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  // Affichage du contenu avec animation
  const filmsContent = win.querySelector('#films-content');
  const iconsContent = win.querySelector('#icons-content');
  const homeContent = win.querySelector('#home-content');
  const githubContent = win.querySelector('#github-content');
  
  console.log('Switching to tab:', tab);
  console.log('Films content found:', !!filmsContent);
  console.log('Icons content found:', !!iconsContent);
  console.log('Home content found:', !!homeContent);
  console.log('GitHub content found:', !!githubContent);
  
  // Masquer tous les contenus
  if (filmsContent) filmsContent.style.display = 'none';
  if (iconsContent) iconsContent.style.display = 'none';
  if (homeContent) homeContent.style.display = 'none';
  if (githubContent) githubContent.style.display = 'none';
  
  // Afficher le contenu sélectionné
  if (tab === 'films' && filmsContent) {
    filmsContent.style.display = 'block';
    filmsContent.style.animation = 'slideInFromTop 0.3s ease-out';
  } else if (tab === 'icons' && iconsContent) {
    iconsContent.style.display = 'block';
    iconsContent.style.animation = 'slideInFromTop 0.3s ease-out';
  } else if (tab === 'home' && homeContent) {
    homeContent.style.display = 'block';
    homeContent.style.animation = 'slideInFromTop 0.3s ease-out';
  } else if (tab === 'bsod') {
    const bsodContent = win.querySelector('#bsod-content');
    if (bsodContent) {
      bsodContent.style.display = 'block';
      bsodContent.style.animation = 'slideInFromTop 0.3s ease-out';
    }
  } else if (tab === 'github' && githubContent) {
    githubContent.style.display = 'block';
    githubContent.style.animation = 'slideInFromTop 0.3s ease-out';
  }
}

window.testBSOD = function() {
  showBSOD();
}

// Fonction pour tester la connexion GitHub
window.testGitHubConnection = async function() {
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

let zIndexCounter = 1000;
function getNextZIndex() {
  return ++zIndexCounter;
}

// Drag & drop pour les fenêtres films
let dragData = null;
window.startDrag = function(e, winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  dragData = {
    win: win,
    offsetX: e.clientX - win.offsetLeft,
    offsetY: e.clientY - win.offsetTop
  };
  document.onmousemove = dragMove;
  document.onmouseup = stopDrag;
};
function dragMove(e) {
  if (!dragData) return;
  const win = dragData.win;
  const winW = win.offsetWidth;
  const winH = win.offsetHeight;
  const minLeft = 0;
  const minTop = 0;
  const maxLeft = window.innerWidth - winW;
  const maxTop = window.innerHeight - winH;
  let newLeft = e.clientX - dragData.offsetX;
  let newTop = e.clientY - dragData.offsetY;
  // Limiter aux bords de l'écran
  newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
  newTop = Math.max(minTop, Math.min(newTop, maxTop));
  win.style.left = newLeft + 'px';
  win.style.top = newTop + 'px';
}
function stopDrag() {
  dragData = null;
  document.onmousemove = null;
  document.onmouseup = null;
}

// Ajout d'une poignée de redimensionnement à chaque fenêtre
function addResizeHandle(win) {
  if (win.querySelector('.resize-handle')) return;
  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  win.appendChild(handle);
  let resizing = false;
  let startX, startY, startW, startH;
  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = win.offsetWidth;
    startH = win.offsetHeight;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', function(e) {
    if (!resizing) return;
    let newW = Math.max(280, startW + (e.clientX - startX));
    let newH = Math.max(180, startH + (e.clientY - startY));
    win.style.width = newW + 'px';
    win.style.height = newH + 'px';
  });
  document.addEventListener('mouseup', function() {
    resizing = false;
    document.body.style.userSelect = '';
  });
}

// Rendre toutes les fenêtres déplaçables (y compris la principale)
function makeDraggable(win, winId) {
  const bar = win.querySelector('.xp-titlebar');
  if (!bar) return;
  bar.onmousedown = function(e) { startDrag(e, winId); };
}

// Préparation des sons XP
const sndOpen = new Audio('open.wav');
const sndClose = new Audio('close.wav');
const sndStartup = new Audio('startup.wav');
const sndError = new Audio('error.wav');

function playOpenSound() { try { sndOpen.currentTime = 0; sndOpen.play(); } catch(e){} }
function playCloseSound() { try { sndClose.currentTime = 0; sndClose.play(); } catch(e){} }
function playStartupSound() { try { sndStartup.currentTime = 0; sndStartup.play(); } catch(e){} }
function playErrorSound() { try { sndError.currentTime = 0; sndError.play(); } catch(e){} }

function showBSOD() {
  const bsod = document.createElement('div');
  bsod.className = 'bsod';
  bsod.innerHTML = `
    <p>${bsodConfig.title}</p>
    <p>${bsodConfig.errorCode}</p>
    <p>${bsodConfig.technicalInfo.replace(/\n/g, '<br>')}</p>
    <p>${bsodConfig.instructions.replace(/\n/g, '<br>')}</p>
    <p>${bsodConfig.memoryDump.replace(/\n/g, '<br>')}</p>
    <div style="margin-top: 20px; text-align: center;">
      <button onclick="hideBSOD()" style="background: #0000a8; color: #fff; border: 1px solid #fff; padding: 10px 20px; cursor: pointer; font-family: 'Lucida Console', monospace;">Retour au site</button>
    </div>
  `;
  document.body.appendChild(bsod);
  document.body.style.overflow = 'hidden';
}

function hideBSOD() {
  const bsod = document.querySelector('.bsod');
  if (bsod) {
    bsod.remove();
    document.body.style.overflow = '';
  }
}

window.closeFilmWindow = function(winId) {
  playCloseSound();
  const win = document.getElementById(winId);
  if (win) win.remove();
};
window.minFilmWindow = function(winId) {
  const content = document.getElementById(winId + '_content');
  if (content) content.style.display = (content.style.display === 'none' ? '' : 'none');
};
window.maxFilmWindow = function(winId) {
  const win = document.getElementById(winId);
  if (!win) return;
  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.width = '';
    win.style.height = '';
  } else {
    win.classList.add('maximized');
    win.style.width = '98vw';
    win.style.height = '98vh';
    win.style.left = '0';
    win.style.top = '0';
  }
};

window.setNoteWindow = function(id, note, winId) {
  const film = films.find(f => f.id === id);
  if (film) {
    film.note = note;
    updateFilmWindow(id, winId);
    saveData(); // Sauvegarder après modification
  }
};
window.updateImageWindow = function(id, winId) {
  const url = document.getElementById('imgurl_' + winId).value;
  const film = films.find(f => f.id === id);
  if (film) {
    film.image = url;
    updateFilmWindow(id, winId);
    saveData(); // Sauvegarder après modification
  }
};
window.updateCritiqueWindow = function(id, winId) {
  const critique = document.getElementById('critique_' + winId).value;
  const film = films.find(f => f.id === id);
  if (film) {
    film.critique = critique;
    updateFilmWindow(id, winId);
    saveData(); // Sauvegarder après modification
  }
};
function updateFilmWindow(id, winId) {
  const film = films.find(f => f.id === id);
  if (!film) return;
  const content = document.getElementById(winId + '_content');
  if (!content) return;
  content.innerHTML = `
    <div class="note">Note : ${renderStars(film.note, film.id, winId)}</div>
    <div class="critique">${film.critique || 'Aucune critique pour le moment.'}</div>
    <div style="margin-top:18px;">
      <label>Image :</label><br>
      <input type="text" id="imgurl_${winId}" value="${film.image}" placeholder="URL de l'image" style="width:60%"><br>
      <input type="file" id="film-image-upload-${winId}" accept="image/*" style="margin:8px 0;">
      <button type="button" onclick="uploadFilmImageInWindow(${film.id}, '${winId}')" style="padding:4px 12px;background:#3498db;color:#fff;border:none;border-radius:4px;">📤 Upload</button>
      <button onclick="updateImageWindow(${film.id},'${winId}')" style="margin-left:8px;">Mettre à jour</button>
    </div>
    <div id="imgpreview_${winId}">${film.image ? `<img src="${film.image}" alt="Image du film">` : ''}</div>
    <div style="margin-top:18px;">
      <label>Critique :<br><textarea id="critique_${winId}" rows="5" style="width:100%">${film.critique}</textarea></label>
      <button onclick="updateCritiqueWindow(${film.id},'${winId}')">Enregistrer</button>
    </div>
  `;
  if (film.image) document.getElementById('imgpreview_' + winId).innerHTML = `<img src="${film.image}" alt="Image du film">`;
}

function updateMainWindow() {
  const winId = 'container';
  const mainWin = document.getElementById(winId);
  
  // Générer les liens sociaux
  let socialLinksHtml = '';
  (homePageConfig?.socialLinks || []).forEach(link => {
    socialLinksHtml += `<li><a href="${link.url}" target="_blank">${link.name}</a></li>`;
  });
  
  mainWin.innerHTML = `
    <div class="xp-titlebar" id="xp-titlebar">
      <span class="xp-title-content">
        <span class="xp-icon" id="xp-icon"><img src="avatar.jpg" alt="Avatar" style="border-radius:6px; object-fit:cover; vertical-align:middle;"></span>
        <span id="xp-title">Mes Liens</span>
      </span>
      <span class="xp-buttons">
        <button id="admin-btn" title="Admin" data-tooltip="Admin" style="background:none;border:none;cursor:pointer;font-size:1.3em;margin-right:8px;"><img src="icons/key.png" alt="Admin"></button>
        <button id="toggle-dark" title="Mode sombre" data-tooltip="Mode sombre" style="background:none;border:none;cursor:pointer;font-size:1.3em;margin-right:8px;">🌙</button>
        <span class="xp-btn min" id="btn-min" data-tooltip="Réduire"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" id="btn-max" data-tooltip="Agrandir"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" id="btn-close" data-tooltip="Fermer"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="avatar">
      <img src="avatar.jpg" alt="Avatar" />
    </div>
    <h1>${homePageConfig?.name || 'Théo Van Waas'}</h1>
    <div class="about-section">
      <p><strong>${homePageConfig?.welcomeMessage || 'Bienvenue sur mon site personnel !'}</strong><br>
      ${homePageConfig?.description || 'Ici tu trouveras mes critiques de films, ma collection manga, mes réseaux et tout ce que j\'aime partager.'}<br><br>
      <strong>But du site :</strong> ${homePageConfig?.sitePurpose || 'Centraliser mes passions, mes avis et mes liens favoris dans une interface rétro Windows XP.'}<br><br>
      <strong>Contact & réseaux :</strong></p>
      <ul style="margin-left:18px;">
        ${socialLinksHtml}
      </ul>
      <p style="font-size:0.98em;color:#888;margin-top:18px;">${homePageConfig?.footerText || 'Site réalisé avec amour et nostalgie 💾'}</p>
    </div>
    <div id="content"></div>
  `;
  
  // Re-attacher les événements immédiatement
  setTimeout(() => {
    attachMainWindowEvents();
  }, 50);
}

function attachMainWindowEvents() {
  console.log('Attaching main window events...');
  
  const adminBtn = document.getElementById('admin-btn');
  const toggleDark = document.getElementById('toggle-dark');
  const btnMin = document.getElementById('btn-min');
  const btnMax = document.getElementById('btn-max');
  const btnClose = document.getElementById('btn-close');
  
  console.log('Found elements:', { adminBtn: !!adminBtn, toggleDark: !!toggleDark, btnMin: !!btnMin, btnMax: !!btnMax, btnClose: !!btnClose });
  
  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      console.log('Admin button clicked');
      createAdminLoginWindow();
    });
  }
  
  if (toggleDark) {
    toggleDark.addEventListener('click', () => {
      console.log('Toggle dark clicked');
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', '1');
        toggleDark.textContent = '☀️';
      } else {
        localStorage.setItem('dark-mode', '0');
        toggleDark.textContent = '🌙';
      }
    });
  }
  
  if (btnMin) {
    btnMin.addEventListener('click', () => {
      console.log('Minimize clicked');
      minimizeWindow('container', 'Mes Liens', 'avatar.jpg');
    });
  }
  
  if (btnMax) {
    btnMax.addEventListener('click', () => {
      console.log('Maximize clicked');
      maxFilmWindow('container');
    });
  }
  
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      console.log('Close clicked');
      playErrorSound();
      showBSOD();
    });
  }
}

function createMainWindow() {
  const winId = 'container';
  const mainWin = document.getElementById(winId);
  mainWin.innerHTML = `
    <div class="xp-titlebar" id="xp-titlebar">
      <span class="xp-title-content">
        <span class="xp-icon" id="xp-icon"><img src="avatar.jpg" alt="Avatar" style="border-radius:6px; object-fit:cover; vertical-align:middle;"></span>
        <span id="xp-title">Mes Liens</span>
      </span>
      <span class="xp-buttons">
        <button id="admin-btn" title="Admin" data-tooltip="Admin" style="background:none;border:none;cursor:pointer;font-size:1.3em;margin-right:8px;"><img src="icons/key.png" alt="Admin"></button>
        <button id="toggle-dark" title="Mode sombre" data-tooltip="Mode sombre" style="background:none;border:none;cursor:pointer;font-size:1.3em;margin-right:8px;">🌙</button>
        <span class="xp-btn min" id="btn-min" data-tooltip="Réduire"><img src="icons/minimize.png" alt="Min"></span>
        <span class="xp-btn max" id="btn-max" data-tooltip="Agrandir"><img src="icons/maximize.png" alt="Max"></span>
        <span class="xp-btn close" id="btn-close" data-tooltip="Fermer"><img src="icons/close.png" alt="Close"></span>
      </span>
    </div>
    <div class="avatar">
      <img src="avatar.jpg" alt="Avatar" />
    </div>
    <h1>Théo Van Waas</h1>
    <div class="about-section">
      <p><strong>Bienvenue sur mon site personnel !</strong><br>
      Ici tu trouveras mes critiques de films, ma collection manga, mes réseaux et tout ce que j’aime partager.<br><br>
      <strong>But du site :</strong> Centraliser mes passions, mes avis et mes liens favoris dans une interface rétro Windows XP.<br><br>
      <strong>Contact & réseaux :</strong></p>
      <ul style="margin-left:18px;">
        <li><a href="https://www.instagram.com/theolegato_o?igsh=Z2w5eTVqemNrZHpl" target="_blank">Instagram</a></li>
        <li><a href="#" target="_blank">Twitter</a></li>
        <li><a href="#" target="_blank">Tumblr</a></li>
        <li><a href="https://www.mangacollec.com/user/theolegato/collection" target="_blank">Mangacollec</a></li>
        <li><a href="https://letterboxd.com/tei/" target="_blank">Letterboxd</a></li>
      </ul>
      <p style="font-size:0.98em;color:#888;margin-top:18px;">Site réalisé avec amour et nostalgie 💾</p>
    </div>
    <div id="content"></div>
  `;
  mainWin.classList.add('xp-film-window', 'msn-style');
  mainWin.style.position = 'absolute';
  mainWin.style.left = 'calc(50vw - 220px)';
  mainWin.style.top = '80px';
  mainWin.style.zIndex = getNextZIndex();
  addResizeHandle(mainWin);
  makeDraggable(mainWin, 'container');
}

// Gestion des info-bulles (tooltips)
let tooltipElement;
document.addEventListener('mouseover', function(e) {
  const target = e.target.closest('[data-tooltip]');
  if (target) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'js-tooltip';
    tooltipElement.textContent = target.getAttribute('data-tooltip');
    document.body.appendChild(tooltipElement);
    const targetRect = target.getBoundingClientRect();
    tooltipElement.style.left = targetRect.left + (targetRect.width / 2) - (tooltipElement.offsetWidth / 2) + 'px';
    tooltipElement.style.top = targetRect.top - tooltipElement.offsetHeight - 8 + 'px';
  }
});
document.addEventListener('mouseout', function(e) {
  if (tooltipElement && tooltipElement.parentNode) {
    tooltipElement.parentNode.removeChild(tooltipElement);
    tooltipElement = null;
  }
});

window.onload = async () => {
  playStartupSound();
  if (!document.getElementById('container')) {
    alert('Erreur : la div #container est introuvable dans le HTML !');
    return;
  }
  
  try {
    // Charger les données depuis GitHub au démarrage
    await loadDataFromGitHub();
    
    createMainWindow();
    console.log('createMainWindow exécutée');

    // Rendu des icônes du bureau avec le nouveau système
    renderDesktopIcons();
    
    // Attendre un peu que le DOM soit prêt
    setTimeout(() => {
      attachMainWindowEvents();
      console.log('Events attached after delay');
    }, 100);

  } catch (e) {
    alert('Erreur lors de la création de la fenêtre Mes Liens : ' + e.message);
    console.error(e);
  }
}; 