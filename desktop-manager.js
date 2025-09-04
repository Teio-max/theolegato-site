// Desktop Manager - Gestionnaire d'icônes du bureau
// Module pour gérer les icônes du bureau Windows XP-like

const DesktopManager = {
  // Configuration par défaut
  config: {
    defaultIconSize: 96,  // Icônes plus grandes
    spacing: 30          // Espacement plus grand
  },
  
  // Initialisation du gestionnaire
  init() {
    console.log("🖥️ Initialisation du gestionnaire de bureau");
  if (this._initialized) { console.log('ℹ️ DesktopManager déjà initialisé'); return; }
  this._initialized = true;
    
    // Initialiser les icônes
    this.loadDesktopIcons();
    
    // Dessiner les icônes sur le bureau
    this.renderDesktopIcons();
    
    // Rendre les icônes déplaçables
  this.setupDraggableIcons();
  // Attacher les événements globaux (dé-sélection clic sur bureau, resize, ...)
  this.attachEvents();

  // (Simplifié) On ignore pour l'instant toute fusion dynamique tant que le core est instable
  },
  
  // Chargement des icônes du bureau
  loadDesktopIcons() {
    window.desktopIcons = {
      defaultIcons: [
        { id: 'films', name: 'Films', icon: 'icons/film.png', x: 30, y: 30, visible: true, window: 'films' },
        { id: 'articles', name: 'Articles', icon: 'icons/article.png', x: 30, y: 160, visible: true, window: 'articles' },
        { id: 'cv', name: 'CV', icon: 'icons/cv.png', x: 30, y: 290, visible: true, window: 'cv' },
        { id: 'mangas', name: 'Mangas', icon: 'icons/portfolio.png', x: 30, y: 420, visible: true, window: 'mangas' }
      ],
      customIcons: []
    };
    // Appliquer positions précédentes de la session (non persistantes)
    try {
      const sessionPos = sessionStorage.getItem('session_icon_positions');
      if (sessionPos) {
        const posObj = JSON.parse(sessionPos);
        [...window.desktopIcons.defaultIcons, ...window.desktopIcons.customIcons].forEach(ic => {
          if (posObj[ic.id]) { ic.x = posObj[ic.id].x; ic.y = posObj[ic.id].y; }
        });
        console.log('♻️ Positions icônes restaurées depuis la session');
      }
    } catch(e) { console.warn('⚠️ Restauration positions session échouée:', e.message); }
    console.log(`📊 4 icônes chargées (jeu fixe)`);
  },
  
  // Rendu des icônes sur le bureau
  renderDesktopIcons() {
    // Vérifier que les icônes sont disponibles
    if (!window.desktopIcons || !Array.isArray(window.desktopIcons.defaultIcons)) {
      this.loadDesktopIcons();
    }
    
    // Obtenir l'élément desktop s'il existe
    const desktop = document.getElementById('desktop');
    if (!desktop) {
      console.warn("⚠️ Élément #desktop non trouvé");
      return;
    }
    
    // Nettoyer les icônes existantes
    const existingIcons = desktop.querySelectorAll('.desktop-icon');
    existingIcons.forEach(icon => icon.remove());
    
    // Obtenir toutes les icônes visibles
    let defaults = window.desktopIcons.defaultIcons || [];
    let customs = window.desktopIcons.customIcons || [];
    if (Array.isArray(window.desktopIcons) && !defaults.length && !customs.length) {
      customs = window.desktopIcons; // fallback brut
    }
    const allIcons = [...defaults, ...customs].filter(icon => icon && icon.visible !== false);
    if(!allIcons.length) {
      console.warn('⚠️ Aucune icône à afficher (liste vide)');
    }
    
    // Créer les éléments d'icône
    allIcons.forEach(icon => {
      this.createDesktopIcon(icon, desktop);
    });
  },
  
  // Création d'une icône sur le bureau
  createDesktopIcon(icon, container) {
    // Créer l'élément d'icône
    const iconElement = document.createElement('div');
    iconElement.className = 'desktop-icon';
    iconElement.dataset.id = icon.id;
  // Correction : utilisation d'une recherche dans le tableau au lieu de l'opérateur "in" (qui ne fonctionne que sur les index numériques)
  const baseList = Array.isArray(window.desktopIcons?.defaultIcons) ? window.desktopIcons.defaultIcons : [];
  iconElement.dataset.type = baseList.some(i => i.id === icon.id) ? 'default' : 'custom';
    
    // Définir la position
    iconElement.style.position = 'absolute';
    iconElement.style.left = `${icon.x}px`;
    iconElement.style.top = `${icon.y}px`;
    iconElement.style.width = '100px'; // Augmentation de la largeur
    iconElement.style.height = '110px'; // Augmentation de la hauteur
    iconElement.style.display = 'flex';
    iconElement.style.flexDirection = 'column';
    iconElement.style.alignItems = 'center';
    iconElement.style.cursor = 'pointer';
    iconElement.style.padding = '5px';
    iconElement.style.boxSizing = 'border-box';
    
    // Définir le contenu HTML avec des icônes plus grandes
    iconElement.innerHTML = `
      <img src="${icon.icon}" alt="${icon.name}" style="width:48px;height:48px;margin-bottom:8px;">
      <div class="icon-label" style="color:white;text-align:center;font-size:14px;text-shadow:1px 1px 3px rgba(0,0,0,0.9);white-space:nowrap;max-width:90px;overflow:hidden;text-overflow:ellipsis;">
        ${icon.name}
      </div>
  <span class="icon-badge" style="position:absolute;top:4px;right:6px;width:10px;height:10px;border-radius:50%;background:#d10000;box-shadow:0 0 0 1px rgba(255,255,255,.6),0 0 4px rgba(0,0,0,.6);display:none;"></span>
    `;
    
    // Ajouter l'événement de clic
    iconElement.addEventListener('click', (e) => {
      this.handleIconClick(icon, e);
    });
    
    // Ajouter l'événement de double-clic
    iconElement.addEventListener('dblclick', (e) => {
      this.handleIconDblClick(icon, e);
    });
    
    // Ajouter l'icône au conteneur
    container.appendChild(iconElement);
    
    return iconElement;
  },

  // Afficher / cacher badge (ex: modifications non sauvegardées)
  setIconBadge(iconId, visible) {
    const el = document.querySelector(`.desktop-icon[data-id='${iconId}'] .icon-badge`);
    if (el) el.style.display = visible ? 'block' : 'none';
  },
  
  // Gestion du clic sur une icône
  handleIconClick(icon, event) {
    // Sélectionner l'icône
  this.selectIcon(icon.id);
    if (location.search.includes('debugIcons=1')) {
      // mode debug: ouverture sur simple clic
      this.handleIconDblClick(icon, event);
    }
  },
  
  // Gestion du double-clic sur une icône
  handleIconDblClick(icon, event) {
    console.log(`🖱️ Double-clic sur l'icône: ${icon.name}`);
    // Animation d'ouverture rapide (scale + petit flash défini en CSS)
    const el = event.currentTarget || document.querySelector(`.desktop-icon[data-id='${icon.id}']`);
    if (el) {
      el.classList.add('double-open');
      setTimeout(() => el.classList.remove('double-open'), 260);
    }
  console.log('🔍 Tentative ouverture fenêtre pour', icon.window || icon.id);
    
    // Déterminer l'action à effectuer
    if (icon.window) {
      // Ouvrir une fenêtre
      this.openIconWindow(icon);
    } else if (icon.link) {
      // Ouvrir un lien
      window.open(icon.link, '_blank');
    } else if (icon.function && typeof window[icon.function] === 'function') {
      // Exécuter une fonction
      window[icon.function]();
    } else {
      // Action par défaut basée sur l'ID
      this.openDefaultWindow(icon.id);
    }
  },
  
  // Sélectionner une icône
  selectIcon(iconId) {
  // Désélectionner toutes les icônes
  document.querySelectorAll('.desktop-icon.selected').forEach(icon => icon.classList.remove('selected'));
  // Sélectionner l'icône cliquée
  const selectedIcon = document.querySelector(`.desktop-icon[data-id="${iconId}"]`);
  if (selectedIcon) selectedIcon.classList.add('selected');
  },
  
  // Ouvrir une fenêtre personnalisée
  openIconWindow(icon) {
    // Vérifier si WindowManager est disponible
    if (typeof window.WindowManager === 'undefined') {
      console.warn("⚠️ WindowManager non disponible (retry dans 300ms)");
      setTimeout(()=> this.openIconWindow(icon), 300);
      return;
    }
    
    // Déterminer le type de fenêtre à ouvrir
    switch (icon.window) {
      case 'films':
        window.WindowManager.createFilmsWindow();
        break;
      case 'articles':
        window.WindowManager.createArticlesWindow();
        break;
      case 'mangas':
        window.WindowManager.createMangasWindow();
        break;
      case 'cv':
        window.WindowManager.createCVWindow();
        break;
      case 'about':
        window.WindowManager.createAboutWindow();
        break;
      case 'custom':
        // Fenêtre personnalisée
        window.WindowManager.createWindow({
          title: icon.name,
          icon: icon.icon,
          width: 600,
          height: 400,
          content: `<div style="padding:15px;"><h3>${icon.name}</h3><p>Contenu personnalisé</p></div>`
        });
        break;
      default:
        // Essayer d'ouvrir une fenêtre par défaut
        this.openDefaultWindow(icon.id);
    }
  },
  
  // Ouvrir une fenêtre par défaut basée sur l'ID
  openDefaultWindow(iconId) {
    // Vérifier si WindowManager est disponible
    if (typeof window.WindowManager === 'undefined') {
      console.warn("⚠️ WindowManager non disponible (retry dans 300ms)");
      return setTimeout(()=> this.openDefaultWindow(iconId), 300);
    }
    
    // Chercher l'icône pour voir si elle a une propriété window explicite
    let iconObj = (window.desktopIcons.defaultIcons || []).concat(window.desktopIcons.customIcons || []).find(i => i.id === iconId);
    if (iconObj && iconObj.window) {
      console.log(`🔗 Ouverture via propriété window='${iconObj.window}' pour l'icône ${iconId}`);
      switch(iconObj.window) {
        case 'films': return window.WindowManager.createFilmsWindow();
        case 'articles': return window.WindowManager.createArticlesWindow();
        case 'mangas': return window.WindowManager.createMangasWindow();
        case 'cv': return window.WindowManager.createCVWindow();
      }
    }

    // Mappings d'ID vers les fonctions
    const windowMappings = {
      films: 'createFilmsWindow',
      articles: 'createArticlesWindow',
      mangas: 'createMangasWindow',
      cv: 'createCVWindow',
      info: 'createAboutWindow',
      admin: 'createAdminPanelWindow'
    };
    
    // Appeler la fonction correspondante si elle existe
    const functionName = windowMappings[iconId];
    if (functionName && typeof window.WindowManager[functionName] === 'function') {
      window.WindowManager[functionName]();
    } else {
      console.warn(`⚠️ Aucune fenêtre associée à l'ID: ${iconId}`);
    }
  },
  
  // Attacher les gestionnaires d'événements globaux
  attachEvents() {
    // Gestionnaire pour le clic sur le bureau (désélectionner)
    const desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.addEventListener('click', (e) => {
        // Ne désélectionner que si le clic est directement sur le bureau
        if (e.target === desktop) {
          document.querySelectorAll('.desktop-icon.selected').forEach(icon => icon.classList.remove('selected'));
        }
      });
    }
    
    // Écouter les changements de taille de la fenêtre
    window.addEventListener('resize', () => {
      // Vérifier les positions des icônes
      this.checkIconPositions();
    });
  },
  
  // Vérifier et ajuster les positions des icônes
  checkIconPositions() {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;
    
    const desktopRect = desktop.getBoundingClientRect();
    const desktopWidth = desktopRect.width;
    const desktopHeight = desktopRect.height;
    
    // Vérifier chaque icône
    document.querySelectorAll('.desktop-icon').forEach(iconElement => {
      const iconId = iconElement.dataset.id;
      const iconType = iconElement.dataset.type;
      
      // Trouver les données de l'icône
      let icon = null;
      if (iconType === 'default') {
        icon = window.desktopIcons.defaultIcons.find(i => i.id === iconId);
      } else {
        icon = window.desktopIcons.customIcons.find(i => i.id === iconId);
      }
      
      if (!icon) return;
      
      // Vérifier et ajuster la position horizontale
      if (icon.x + 70 > desktopWidth) {
        icon.x = desktopWidth - 80;
        iconElement.style.left = `${icon.x}px`;
      }
      
      // Vérifier et ajuster la position verticale
      if (icon.y + 80 > desktopHeight) {
        icon.y = desktopHeight - 90;
        iconElement.style.top = `${icon.y}px`;
      }
    });
  },
  
  // Ajouter une icône personnalisée au bureau
  addCustomIcon(iconData) {
    if (!iconData.id) {
      iconData.id = 'icon_' + Date.now();
    }
    
    // Valeurs par défaut
    const defaultIcon = {
      name: 'Nouvelle icône',
      icon: 'icons/window.png',
      x: 20,
      y: 20,
      visible: true,
      window: 'custom'
    };
    
    // Fusionner avec les valeurs par défaut
    const newIcon = {...defaultIcon, ...iconData};
    
    // Ajouter à la liste des icônes personnalisées
    if (!window.desktopIcons.customIcons) {
      window.desktopIcons.customIcons = [];
    }
    
    window.desktopIcons.customIcons.push(newIcon);
    
    // Redessiner les icônes
    this.renderDesktopIcons();
    
    return newIcon;
  },
  
  // Supprimer une icône personnalisée
  removeCustomIcon(iconId) {
    if (!window.desktopIcons.customIcons) return false;
    
    const initialLength = window.desktopIcons.customIcons.length;
    window.desktopIcons.customIcons = window.desktopIcons.customIcons.filter(icon => icon.id !== iconId);
    
    // Vérifier si une icône a été supprimée
    if (window.desktopIcons.customIcons.length < initialLength) {
      // Redessiner les icônes
      this.renderDesktopIcons();
      return true;
    }
    
    return false;
  },
  
  // Mettre à jour une icône existante
  updateIcon(iconId, iconType, updateData) {
    let iconArray = iconType === 'default' ? window.desktopIcons.defaultIcons : window.desktopIcons.customIcons;
    
    const iconIndex = iconArray.findIndex(icon => icon.id === iconId);
    if (iconIndex === -1) return false;
    
    // Mettre à jour les propriétés
    iconArray[iconIndex] = {...iconArray[iconIndex], ...updateData};
    
    // Redessiner les icônes
    this.renderDesktopIcons();
    
    return true;
  },
  
  // Rendre les icônes déplaçables
  setupDraggableIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    
    icons.forEach(icon => {
      this.makeIconDraggable(icon);
    });
    
    console.log(`🖱️ ${icons.length} icônes rendues déplaçables`);
  },
  
  // Fonction pour rendre une icône déplaçable
  makeIconDraggable(icon) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let startTime = 0;
    let hasMovedDuringDrag = false;
    
    // Gestionnaire pour commencer le déplacement
    const startDrag = (e) => {
      // Seulement le clic gauche
      if (e.button !== 0) return;
      
      // Éviter le déplacement pendant un double-clic
      if (isDragging) return;
      
      // Marquer comme en cours de déplacement et enregistrer l'heure
      isDragging = true;
      startTime = Date.now();
      hasMovedDuringDrag = false;
      
      // Calculer l'offset par rapport au coin supérieur gauche de l'icône
      const rect = icon.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      
      // Ajouter une classe pour le style durant le déplacement
      icon.classList.add('dragging');
      
      // Éviter que d'autres événements n'interfèrent
      e.preventDefault();
      
      // Ajouter les gestionnaires temporaires
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDrag);
    };
    
    // Gestionnaire pour le déplacement
    const drag = (e) => {
      if (!isDragging) return;
      
      // Marquer comme ayant été déplacé
      hasMovedDuringDrag = true;
      
      // Obtenir les dimensions du bureau
      const desktop = document.getElementById('desktop');
      const desktopRect = desktop.getBoundingClientRect();
      
      // Calculer la nouvelle position relative au bureau
      let newX = e.clientX - desktopRect.left - offsetX;
      let newY = e.clientY - desktopRect.top - offsetY;
      
      // Limiter dans les bords du bureau
      const iconWidth = icon.offsetWidth;
      const iconHeight = icon.offsetHeight;
      
      newX = Math.max(0, Math.min(desktopRect.width - iconWidth, newX));
      newY = Math.max(0, Math.min(desktopRect.height - iconHeight, newY));
      
      // Appliquer la nouvelle position
      icon.style.left = `${newX}px`;
      icon.style.top = `${newY}px`;
      
      // Mettre à jour les coordonnées dans les données
      const iconId = icon.dataset.id;
      const iconType = icon.dataset.type;
      
      // Mettre à jour les coordonnées stockées
      if (iconType === 'default') {
        const iconObj = window.desktopIcons.defaultIcons.find(i => i.id === iconId);
        if (iconObj) {
          iconObj.x = newX;
          iconObj.y = newY;
        }
      } else {
        const iconObj = window.desktopIcons.customIcons.find(i => i.id === iconId);
        if (iconObj) {
          iconObj.x = newX;
          iconObj.y = newY;
        }
      }
    };
    
    // Gestionnaire pour arrêter le déplacement
    const stopDrag = (e) => {
      if (!isDragging) return;
      
      // Marquer comme plus en déplacement
      isDragging = false;
      
      // Enlever la classe de style
      icon.classList.remove('dragging');
      
      // Supprimer les gestionnaires temporaires
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', stopDrag);
      
      // Si l'icône a été déplacée, on persiste immédiatement la position
      if (hasMovedDuringDrag) {
        // Sauvegarde uniquement en session (pas GitHub, pas localStorage persistant)
        try {
          const positions = {};
          [...window.desktopIcons.defaultIcons, ...window.desktopIcons.customIcons].forEach(ic => positions[ic.id] = { x: ic.x, y: ic.y });
          sessionStorage.setItem('session_icon_positions', JSON.stringify(positions));
          // Indication discrète
          if (!this._lastSessionSave || Date.now()-this._lastSessionSave>3000) {
            console.log('💾 Positions icônes (session) mises à jour');
            this._lastSessionSave = Date.now();
          }
        } catch(e) { console.warn('⚠️ Sauvegarde session positions échouée:', e.message); }
      }
      // Ouverture désormais uniquement via double-clic (comportement Windows classique)
    };
    
    // Attacher le gestionnaire d'événement
    icon.addEventListener('mousedown', startDrag);
  },
  
  // Obtenir toutes les icônes disponibles
  getAllIcons() {
    return {
      defaultIcons: window.desktopIcons.defaultIcons || [],
      customIcons: window.desktopIcons.customIcons || []
    };
  }
};

// Exposer le gestionnaire globalement
window.DesktopManager = DesktopManager;

// Initialiser après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  // Délai pour s'assurer que toutes les dépendances sont chargées
  setTimeout(() => {
    DesktopManager.init();
  }, 500);
});
