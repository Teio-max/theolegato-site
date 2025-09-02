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
    
    // Initialiser les icônes
    this.loadDesktopIcons();
    
    // Dessiner les icônes sur le bureau
    this.renderDesktopIcons();
    
    // Rendre les icônes déplaçables
    this.setupDraggableIcons();
    
    // Attacher les gestionnaires d'événements globaux
    this.attachEvents();
  },
  
  // Chargement des icônes du bureau
  loadDesktopIcons() {
    // Vérifier si les icônes sont déjà définies
    if (typeof window.desktopIcons === 'undefined') {
      // Icônes par défaut - Suppression des icônes Admin et À propos, meilleures positions
      window.desktopIcons = {
        defaultIcons: [
          { id: 'films', name: 'Films', icon: 'icons/film.png', x: 30, y: 30, visible: true },
          { id: 'articles', name: 'Articles', icon: 'icons/article.png', x: 30, y: 160, visible: true },
          { id: 'cv', name: 'CV', icon: 'icons/cv.png', x: 30, y: 290, visible: true },
          { id: 'mangas', name: 'Mangas', icon: 'icons/portfolio.png', x: 30, y: 420, visible: false }
          // Les icônes "Admin" et "À propos" ont été supprimées comme demandé
        ],
        customIcons: []
      };
    }
    
    console.log(`📊 ${window.desktopIcons.defaultIcons.length + window.desktopIcons.customIcons.length} icônes chargées`);
  },
  
  // Rendu des icônes sur le bureau
  renderDesktopIcons() {
    // Vérifier que les icônes sont disponibles
    if (typeof window.desktopIcons === 'undefined') {
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
    const allIcons = [
      ...(window.desktopIcons.defaultIcons || []),
      ...(window.desktopIcons.customIcons || [])
    ].filter(icon => icon.visible);
    
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
    iconElement.dataset.type = icon.id in window.desktopIcons.defaultIcons ? 'default' : 'custom';
    
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
  
  // Gestion du clic sur une icône
  handleIconClick(icon, event) {
    // Sélectionner l'icône
    this.selectIcon(icon.id);
  },
  
  // Gestion du double-clic sur une icône
  handleIconDblClick(icon, event) {
    console.log(`🖱️ Double-clic sur l'icône: ${icon.name}`);
    
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
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.style.backgroundColor = 'transparent';
    });
    
    // Sélectionner l'icône cliquée
    const selectedIcon = document.querySelector(`.desktop-icon[data-id="${iconId}"]`);
    if (selectedIcon) {
      selectedIcon.style.backgroundColor = 'rgba(49, 106, 197, 0.5)';
    }
  },
  
  // Ouvrir une fenêtre personnalisée
  openIconWindow(icon) {
    // Vérifier si WindowManager est disponible
    if (typeof window.WindowManager === 'undefined') {
      console.warn("⚠️ WindowManager non disponible");
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
      console.warn("⚠️ WindowManager non disponible");
      return;
    }
    
    // Mappings d'ID vers les fonctions
    const windowMappings = {
      'films': 'createFilmsWindow',
      'articles': 'createArticlesWindow',
      'mangas': 'createMangasWindow',
      'cv': 'createCVWindow',
      'info': 'createAboutWindow',
      'admin': 'createAdminPanelWindow'
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
          document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.style.backgroundColor = 'transparent';
          });
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
    
    // Gestionnaire pour commencer le déplacement
    const startDrag = (e) => {
      // Seulement le clic gauche
      if (e.button !== 0) return;
      
      // Éviter le déplacement pendant un double-clic
      if (isDragging) return;
      
      // Marquer comme en cours de déplacement
      isDragging = true;
      
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
