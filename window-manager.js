// WindowManager - Gestionnaire avancé de fenêtres pour le site
// Permet de créer et gérer facilement des fenêtres style Windows XP

const WindowManager = {
  // Configuration
  config: {
    defaultWidth: 600,
    defaultHeight: 400,
    defaultZIndex: 9000,
    titleBarHeight: 30,
    sounds: {
      open: 'sounds/open.wav',
      close: 'sounds/close.wav',
      error: 'sounds/error.wav'
    }
  },
  
  // État du gestionnaire
  state: {
    windows: {},
    activeWindow: null,
    nextZIndex: 9000,
    dragInfo: null
  },
  
  // Initialisation du gestionnaire
  init() {
    console.log("🚀 Initialisation de WindowManager");
    
    // Écouter les clics sur le document pour gérer la fenêtre active
    document.addEventListener('mousedown', this.handleDocumentClick.bind(this));
    
    // Exposer les fonctions utiles globalement
    window.getNextZIndex = this.getNextZIndex.bind(this);
    window.closeFilmWindow = this.closeWindow.bind(this);
    window.minimizeWindow = this.minimizeWindow.bind(this);
    window.maxFilmWindow = this.maximizeWindow.bind(this);
    window.makeDraggable = this.makeDraggable.bind(this);
  },
  
  // Création d'une nouvelle fenêtre
  createWindow(options = {}) {
    const {
      title = 'Fenêtre',
      icon = 'icons/window.png',
      content = '',
      width = this.config.defaultWidth,
      height = this.config.defaultHeight,
      x = Math.max(50, Math.floor(Math.random() * (window.innerWidth - 400))),
      y = Math.max(50, Math.floor(Math.random() * (window.innerHeight - 300))),
      resizable = true,
      maximizable = true,
      minimizable = true,
      closable = true,
      modal = false,
      minWidth = 200,
      minHeight = 150,
      onClose = null
    } = options;
    
    // Générer un ID unique pour la fenêtre
    const winId = 'win_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // Créer l'élément de fenêtre
    const win = document.createElement('div');
    win.id = winId;
    win.className = 'xp-window';
    win.style.position = 'absolute';
    win.style.width = width;
    win.style.height = height;
    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
    win.style.zIndex = this.getNextZIndex();
    win.dataset.minWidth = minWidth;
    win.dataset.minHeight = minHeight;
    
    // Construire le contenu HTML de la fenêtre
    win.innerHTML = `
      <div class="xp-titlebar" style="background:linear-gradient(to right,#0058a8,#2586e7,#83b3ec);color:white;padding:5px 8px;display:flex;justify-content:space-between;align-items:center;user-select:none;">
        <div class="xp-title-content" style="display:flex;align-items:center;">
          <img src="${icon}" alt="" style="width:16px;height:16px;margin-right:6px;">
          <span>${title}</span>
        </div>
        <div class="xp-controls" style="display:flex;">
          ${minimizable ? `<button class="xp-btn min" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Minimiser">
            <img src="icons/minimize.png" alt="-" style="width:16px;height:16px;">
          </button>` : ''}
          ${maximizable ? `<button class="xp-btn max" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Maximiser">
            <img src="icons/maximize.png" alt="□" style="width:16px;height:16px;">
          </button>` : ''}
          ${closable ? `<button class="xp-btn close" style="margin:0 2px;cursor:pointer;background:none;border:none;width:22px;height:22px;padding:0;display:flex;align-items:center;justify-content:center;" aria-label="Fermer">
            <img src="icons/close.png" alt="✖" style="width:16px;height:16px;">
          </button>` : ''}
        </div>
      </div>
      <div class="window-content" style="height:calc(100% - 30px);overflow:auto;">
        ${content}
      </div>
      ${resizable ? `<div class="resize-handle" style="position:absolute;bottom:0;right:0;width:16px;height:16px;cursor:nwse-resize;background:url('icons/resize.png') no-repeat;background-position:bottom right;"></div>` : ''}
    `;
    
    // Ajouter la fenêtre au document
    document.body.appendChild(win);
    
    // Enregistrer la fenêtre dans l'état
    this.state.windows[winId] = {
      element: win,
      options: {
        ...options,
        id: winId,
        originalWidth: width,
        originalHeight: height,
        originalX: x,
        originalY: y,
        isMaximized: false,
        isMinimized: false
      }
    };
    
    // Rendre la fenêtre active
    this.setActiveWindow(winId);
    
    // Configurer les gestionnaires d'événements
    this.setupWindowEvents(winId, onClose);
    
    // Jouer le son d'ouverture
    this.playSound('open');
    
    return win;
  },
  
  // Configuration des événements de la fenêtre
  setupWindowEvents(winId, onClose) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Gestion du clic sur la barre de titre pour l'activation
    const titlebar = win.querySelector('.xp-titlebar');
    if (titlebar) {
      titlebar.addEventListener('mousedown', (e) => {
        // Ne pas traiter les clics sur les boutons
        if (e.target.closest('.xp-btn')) return;
        
        this.setActiveWindow(winId);
        this.startDrag(winId, e);
      });
    }
    
    // Gestion des boutons
    const closeBtn = win.querySelector('.xp-btn.close');
    const minBtn = win.querySelector('.xp-btn.min');
    const maxBtn = win.querySelector('.xp-btn.max');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        // Si une fonction onClose est définie, l'appeler
        if (typeof onClose === 'function') {
          const shouldClose = onClose();
          if (shouldClose === false) return;
        }
        
        this.closeWindow(winId);
      });
    }
    
    if (minBtn) {
      minBtn.addEventListener('click', () => {
        this.minimizeWindow(winId);
      });
    }
    
    if (maxBtn) {
      maxBtn.addEventListener('click', () => {
        this.maximizeWindow(winId);
      });
    }
    
    // Gestion du redimensionnement
    const resizeHandle = win.querySelector('.resize-handle');
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.startResize(winId, e);
      });
    }
    
    // Gestion du clic sur le contenu pour l'activation
    const content = win.querySelector('.window-content');
    if (content) {
      content.addEventListener('mousedown', () => {
        this.setActiveWindow(winId);
      });
    }
  },
  
  // Démarrer le déplacement d'une fenêtre
  startDrag(winId, e) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Si la fenêtre est maximisée, ne pas permettre le déplacement
    const winInfo = this.state.windows[winId];
    if (winInfo && winInfo.options.isMaximized) return;
    
    e.preventDefault();
    
    // Enregistrer les informations initiales
    const rect = win.getBoundingClientRect();
    this.state.dragInfo = {
      winId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top
    };
    
    // Ajouter les gestionnaires d'événements temporaires
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
    
    // Utiliser la fonction liée pour maintenir le contexte this
    this.handleDragMove = this.handleDragMove.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
  },
  
  // Gestion du déplacement pendant le drag
  handleDragMove(e) {
    if (!this.state.dragInfo) return;
    
    const { winId, startX, startY, startLeft, startTop } = this.state.dragInfo;
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Calculer la nouvelle position
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    win.style.left = `${startLeft + dx}px`;
    win.style.top = `${startTop + dy}px`;
  },
  
  // Fin du déplacement
  handleDragEnd() {
    // Supprimer les gestionnaires d'événements temporaires
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    
    // Réinitialiser les informations de déplacement
    this.state.dragInfo = null;
  },
  
  // Démarrer le redimensionnement d'une fenêtre
  startResize(winId, e) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    e.preventDefault();
    
    // Enregistrer les informations initiales
    const rect = win.getBoundingClientRect();
    const minWidth = parseInt(win.dataset.minWidth) || 200;
    const minHeight = parseInt(win.dataset.minHeight) || 150;
    
    this.state.resizeInfo = {
      winId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      minWidth,
      minHeight
    };
    
    // Ajouter les gestionnaires d'événements temporaires
    document.addEventListener('mousemove', this.handleResizeMove);
    document.addEventListener('mouseup', this.handleResizeEnd);
    
    // Utiliser la fonction liée pour maintenir le contexte this
    this.handleResizeMove = this.handleResizeMove.bind(this);
    this.handleResizeEnd = this.handleResizeEnd.bind(this);
    
    // Mettre la fenêtre en premier plan
    this.setActiveWindow(winId);
  },
  
  // Gestion du déplacement pendant le redimensionnement
  handleResizeMove(e) {
    if (!this.state.resizeInfo) return;
    
    const { winId, startX, startY, startWidth, startHeight, minWidth, minHeight } = this.state.resizeInfo;
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Calculer les nouvelles dimensions
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    const newWidth = Math.max(minWidth, startWidth + dx);
    const newHeight = Math.max(minHeight, startHeight + dy);
    
    win.style.width = `${newWidth}px`;
    win.style.height = `${newHeight}px`;
  },
  
  // Fin du redimensionnement
  handleResizeEnd() {
    // Supprimer les gestionnaires d'événements temporaires
    document.removeEventListener('mousemove', this.handleResizeMove);
    document.removeEventListener('mouseup', this.handleResizeEnd);
    
    // Réinitialiser les informations de redimensionnement
    this.state.resizeInfo = null;
  },
  
  // Fermer une fenêtre
  closeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Jouer le son de fermeture
    this.playSound('close');
    
    // Supprimer la fenêtre du DOM
    win.remove();
    
    // Supprimer la fenêtre de l'état
    delete this.state.windows[winId];
    
    // Réinitialiser la fenêtre active si nécessaire
    if (this.state.activeWindow === winId) {
      this.state.activeWindow = null;
      
      // Activer la fenêtre suivante si elle existe
      const windowIds = Object.keys(this.state.windows);
      if (windowIds.length > 0) {
        this.setActiveWindow(windowIds[windowIds.length - 1]);
      }
    }
  },
  
  // Minimiser une fenêtre
  minimizeWindow(winId, title = null, icon = 'icons/window.png') {
    const win = document.getElementById(winId);
    if (!win) return;
    
    const winInfo = this.state.windows[winId];
    if (!winInfo) return;
    
    // Marquer la fenêtre comme minimisée
    winInfo.options.isMinimized = true;
    
    // Cacher la fenêtre
    win.style.display = 'none';
    
    // Ajouter à la barre des tâches si elle existe
    const taskbar = document.getElementById('minimized-windows');
    if (taskbar) {
      // Utiliser le titre fourni ou celui de la fenêtre
      const windowTitle = title || winInfo.options.title || 'Fenêtre';
      const windowIcon = icon || winInfo.options.icon || 'icons/window.png';
      
      const taskbarItem = document.createElement('div');
      taskbarItem.className = 'taskbar-item';
      taskbarItem.dataset.winId = winId;
      taskbarItem.innerHTML = `
        <img src="${windowIcon}" alt="">
        <span>${windowTitle}</span>
      `;
      
      taskbarItem.addEventListener('click', () => {
        this.restoreWindow(winId);
      });
      
      taskbar.appendChild(taskbarItem);
    }
  },
  
  // Restaurer une fenêtre minimisée
  restoreWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    const winInfo = this.state.windows[winId];
    if (!winInfo) return;
    
    // Marquer la fenêtre comme non minimisée
    winInfo.options.isMinimized = false;
    
    // Afficher la fenêtre
    win.style.display = 'block';
    
    // Retirer de la barre des tâches si elle existe
    const taskbar = document.getElementById('minimized-windows');
    if (taskbar) {
      const taskbarItem = taskbar.querySelector(`[data-win-id="${winId}"]`);
      if (taskbarItem) {
        taskbarItem.remove();
      }
    }
    
    // Activer la fenêtre
    this.setActiveWindow(winId);
  },
  
  // Maximiser une fenêtre
  maximizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    const winInfo = this.state.windows[winId];
    if (!winInfo) return;
    
    // Si la fenêtre est déjà maximisée, la restaurer
    if (winInfo.options.isMaximized) {
      // Restaurer les dimensions et la position d'origine
      win.style.top = `${winInfo.options.originalY}px`;
      win.style.left = `${winInfo.options.originalX}px`;
      win.style.width = winInfo.options.originalWidth;
      win.style.height = winInfo.options.originalHeight;
      
      // Mettre à jour l'icône du bouton
      const maxBtn = win.querySelector('.xp-btn.max img');
      if (maxBtn) {
        maxBtn.src = 'icons/maximize.png';
        maxBtn.alt = '□';
      }
      
      // Marquer la fenêtre comme non maximisée
      winInfo.options.isMaximized = false;
    } else {
      // Sauvegarder les dimensions et la position actuelles
      const rect = win.getBoundingClientRect();
      winInfo.options.originalX = rect.left;
      winInfo.options.originalY = rect.top;
      winInfo.options.originalWidth = win.style.width;
      winInfo.options.originalHeight = win.style.height;
      
      // Maximiser la fenêtre
      win.style.top = '0';
      win.style.left = '0';
      win.style.width = '100%';
      win.style.height = `calc(100% - ${this.hasTaskbar() ? '30px' : '0px'})`;
      
      // Mettre à jour l'icône du bouton
      const maxBtn = win.querySelector('.xp-btn.max img');
      if (maxBtn) {
        maxBtn.src = 'icons/restore.png';
        maxBtn.alt = '❐';
      }
      
      // Marquer la fenêtre comme maximisée
      winInfo.options.isMaximized = true;
    }
    
    // Activer la fenêtre
    this.setActiveWindow(winId);
  },
  
  // Définir la fenêtre active
  setActiveWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Mettre à jour l'état
    this.state.activeWindow = winId;
    
    // Mettre à jour le z-index
    win.style.zIndex = this.getNextZIndex();
    
    // Mettre à jour les classes
    Object.keys(this.state.windows).forEach(id => {
      const w = document.getElementById(id);
      if (w) {
        if (id === winId) {
          w.classList.add('active');
        } else {
          w.classList.remove('active');
        }
      }
    });
  },
  
  // Obtenir le prochain z-index
  getNextZIndex() {
    this.state.nextZIndex += 1;
    return this.state.nextZIndex;
  },
  
  // Gestion du clic sur le document
  handleDocumentClick(e) {
    // Vérifier si le clic est en dehors de toutes les fenêtres
    const isOutsideAllWindows = !e.target.closest('.xp-window');
    
    if (isOutsideAllWindows) {
      // Réinitialiser la fenêtre active
      this.state.activeWindow = null;
    }
  },
  
  // Vérifier si le taskbar existe
  hasTaskbar() {
    return !!document.getElementById('taskbar');
  },
  
  // Jouer un son
  playSound(soundName) {
    const soundUrl = this.config.sounds[soundName];
    if (!soundUrl) return;
    
    // Vérifier si les fonctions de son sont disponibles
    if (typeof playOpenSound === 'function' && soundName === 'open') {
      playOpenSound();
    } else if (typeof playCloseSound === 'function' && soundName === 'close') {
      playCloseSound();
    } else if (typeof playErrorSound === 'function' && soundName === 'error') {
      playErrorSound();
    } else {
      // Fallback à l'API Audio standard
      try {
        const audio = new Audio(soundUrl);
        audio.play().catch(err => console.log('Erreur de lecture audio:', err));
      } catch (error) {
        console.log('Erreur lors de la lecture du son:', error);
      }
    }
  },
  
  // Rendre une fenêtre draggable (compatibilité avec l'ancien système)
  makeDraggable(element, id) {
    if (!element || !id) return;
    
    const titlebar = element.querySelector('.xp-titlebar') || element.querySelector('.window-header');
    if (!titlebar) return;
    
    titlebar.addEventListener('mousedown', (e) => {
      // Ne pas traiter les clics sur les boutons
      if (e.target.closest('.xp-btn') || e.target.closest('button')) return;
      
      e.preventDefault();
      
      // Mettre la fenêtre au premier plan
      element.style.zIndex = this.getNextZIndex();
      
      // Enregistrer la position initiale
      const rect = element.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = rect.left;
      const startTop = rect.top;
      
      // Fonctions de déplacement
      const handleMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        element.style.left = `${startLeft + dx}px`;
        element.style.top = `${startTop + dy}px`;
      };
      
      const handleUp = () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    });
  }
};

// Ajouter la fonction createAdminPanelWindow
WindowManager.createAdminPanelWindow = function() {
  console.log("🔧 Création de la fenêtre du panneau d'administration");
  
  if (typeof window.AdminManager !== 'undefined') {
    // Utiliser AdminManager si disponible
    return window.AdminManager.createPanel();
  } else if (typeof window.createAdminPanelWindow === 'function' && window.createAdminPanelWindow !== WindowManager.createAdminPanelWindow) {
    // Utiliser la fonction originale si disponible
    return window.createAdminPanelWindow();
  } else {
    // Créer une fenêtre simple avec un message d'erreur
    const errorContent = `
      <div style="padding:20px;text-align:center;">
        <h3 style="color:#cc0000;">Erreur de chargement</h3>
        <p>Le module d'administration n'est pas disponible.</p>
        <p>Veuillez vérifier que le fichier admin-unified.js est correctement chargé.</p>
      </div>
    `;
    
    return this.createWindow({
      title: 'Panneau d\'administration',
      icon: 'icons/key.png',
      width: 500,
      height: 300,
      content: errorContent
    });
  }
};

// Initialiser le gestionnaire quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Initialisation de WindowManager");
  WindowManager.init();
});
