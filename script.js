// CONFIGURATION MODULE
const CONFIG = {
  // GitHub configuration
  github: {
    owner: 'Teio-max',
    repo: 'theolegato-site',
    branch: 'main',
    dataFile: 'data.json',
    token: null, // Will be securely loaded
    apiRateLimit: {
      maxRequests: 60,
      timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
      requestCount: 0,
      resetTime: null
    }
  },
  
  // Site configuration with localStorage fallback
  site: {
    theme: localStorage.getItem('site_theme') || 'luna',
    darkMode: localStorage.getItem('dark_mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches,
    zoom: localStorage.getItem('site_zoom') || 'normal',
    highContrast: localStorage.getItem('high_contrast') === 'true',
    autoSave: localStorage.getItem('auto_save') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    debug: localStorage.getItem('debug_mode') === 'true' || false
  }
};

// Sécurité et gestion des tokens
const SecurityManager = {
  initToken() {
    try {
      CONFIG.github.token = sessionStorage.getItem('github_token') || localStorage.getItem('github_token');
      return !!CONFIG.github.token;
    } catch (error) {
      console.error('Error initializing GitHub token', error);
      return false;
    }
  },
  
  isValidTokenFormat(token) {
    return typeof token === 'string' && 
           (token.startsWith('ghp_') || token.startsWith('github_pat_')) && 
           token.length >= 40;
  },
  
  sanitizeHTML(content) {
    if (!content) return '';
    const tempDiv = document.createElement('div');
    tempDiv.textContent = content;
    return tempDiv.innerHTML;
  }
};

// Gestionnaire d'interface utilisateur
const UIManager = {
  domCache: {},
  
  getElement(selector, forceRefresh = false) {
    if (!this.domCache[selector] || forceRefresh) {
      this.domCache[selector] = document.querySelector(selector);
    }
    return this.domCache[selector];
  },
  
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Set attributes
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.setAttribute(key, value);
        }
      });
    }
    
    // Set properties
    if (options.properties) {
      Object.entries(options.properties).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element[key] = value;
        }
      });
    }
    
    // Set styles
    if (options.styles) {
      Object.entries(options.styles).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.style[key] = value;
        }
      });
    }
    
    // Set event listeners
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    
    // Set content
    if (options.content) {
      if (typeof options.content === 'string') {
        element.textContent = options.content;
      } else if (options.content instanceof Node) {
        element.appendChild(options.content);
      }
    }
    
    // Append children
    if (options.children) {
      options.children.forEach(child => {
        element.appendChild(child);
      });
    }
    
    return element;
  },
  
  showNotification(message, type = 'info', duration = 3000) {
    const notification = this.createElement('div', {
      attributes: {
        'class': `notification notification-${type}`,
        'role': 'alert',
        'aria-live': 'polite'
      },
      properties: {
        textContent: message
      }
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },
  
  showLoading(element, message = 'Chargement...') {
    if (!element) return;
    
    element.dataset.originalContent = element.innerHTML;
    
    const loadingHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">${message}</p>
      </div>
    `;
    
    element.innerHTML = loadingHTML;
  },
  
  hideLoading(element) {
    if (!element || !element.dataset.originalContent) return;
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
  }
};

// Gestionnaire de fenêtres Windows XP
const WindowManager = {
  windows: [],
  zIndexCounter: 1000,
  dragData: null,
  
  getNextZIndex() {
    return ++this.zIndexCounter;
  },
  
  registerWindow(winId, options = {}) {
    this.windows.push({
      id: winId,
      minimized: false,
      maximized: false,
      originalDimensions: options.dimensions || null,
      originalPosition: options.position || null,
      type: options.type || 'generic',
      title: options.title || 'Fenêtre',
      icon: options.icon || 'icons/window.png'
    });
    
    return winId;
  },
  
  createWindow(options = {}) {
    const winId = options.id || `window_${Date.now()}`;
    
    // Clone template
    const template = document.getElementById('window-template');
    const win = template.content.cloneNode(true).querySelector('.xp-window');
    
    // Set window properties
    win.id = winId;
    if (options.className) {
      win.classList.add(options.className);
    }
    
    // Position and size
    win.style.left = options.left || (180 + Math.random() * 120) + 'px';
    win.style.top = options.top || (120 + Math.random() * 80) + 'px';
    win.style.width = options.width || '600px';
    win.style.height = options.height || '400px';
    win.style.zIndex = this.getNextZIndex();
    
    // Set title and icon
    const titleBar = win.querySelector('.xp-titlebar');
    const titleSpan = titleBar.querySelector('.xp-title-content span');
    const iconImg = titleBar.querySelector('.xp-title-content img');
    
    titleSpan.textContent = options.title || 'Fenêtre';
    if (options.icon) {
      iconImg.src = options.icon;
    }
    
    // Set content
    const contentContainer = win.querySelector('.window-content');
    if (options.content) {
      if (typeof options.content === 'string') {
        contentContainer.innerHTML = options.content;
      } else if (options.content instanceof Node) {
        contentContainer.appendChild(options.content);
      }
    }
    
    // Add window controls
    this.setupWindowControls(win, winId);
    
    // Register window
    this.registerWindow(winId, {
      dimensions: { width: options.width, height: options.height },
      position: { left: options.left, top: options.top },
      type: options.type,
      title: options.title,
      icon: options.icon
    });
    
    // Add to DOM
    document.body.appendChild(win);
    
    // Focus the window
    this.focusWindow(winId);
    
    // Play sound
    this.playSound('open');
    
    return win;
  },
  
  setupWindowControls(win, winId) {
    // Set up title bar drag
    const titleBar = win.querySelector('.xp-titlebar');
    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.xp-btn')) return;
      this.startDrag(e, winId);
    });
    
    // Window buttons
    const minButton = win.querySelector('.xp-btn.min');
    const maxButton = win.querySelector('.xp-btn.max');
    const closeButton = win.querySelector('.xp-btn.close');
    
    minButton.addEventListener('click', () => {
      this.minimizeWindow(winId);
    });
    
    maxButton.addEventListener('click', () => {
      this.maximizeWindow(winId);
    });
    
    closeButton.addEventListener('click', () => {
      this.closeWindow(winId);
    });
    
    // Focus on click
    win.addEventListener('mousedown', () => {
      this.focusWindow(winId);
    });
    
    // Resize functionality
    const resizeHandle = win.querySelector('.resize-handle');
    this.setupResize(resizeHandle, win, winId);
  },
  
  startDrag(e, winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Focus the window
    this.focusWindow(winId);
    
    // Don't start drag if window is maximized
    const windowInfo = this.windows.find(w => w.id === winId);
    if (windowInfo && windowInfo.maximized) return;
    
    this.dragData = {
      win: win,
      winId: winId,
      offsetX: e.clientX - win.offsetLeft,
      offsetY: e.clientY - win.offsetTop
    };
    
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
    
    document.body.style.userSelect = 'none';
  },
  
  handleDragMove(e) {
    WindowManager.dragMove(e);
  },
  
  handleDragEnd() {
    WindowManager.stopDrag();
  },
  
  dragMove(e) {
    if (!this.dragData) return;
    
    const win = this.dragData.win;
    const winW = win.offsetWidth;
    const winH = win.offsetHeight;
    
    // Calculate boundaries
    const minLeft = 0;
    const minTop = 0;
    const maxLeft = window.innerWidth - winW;
    const maxTop = window.innerHeight - 30 - winH; // account for taskbar
    
    // Calculate new position
    let newLeft = e.clientX - this.dragData.offsetX;
    let newTop = e.clientY - this.dragData.offsetY;
    
    // Keep window within viewport
    newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    newTop = Math.max(minTop, Math.min(newTop, maxTop));
    
    // Apply position
    win.style.left = newLeft + 'px';
    win.style.top = newTop + 'px';
  },
  
  stopDrag() {
    this.dragData = null;
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.body.style.userSelect = '';
  },
  
  setupResize(handle, win, winId) {
    let resizing = false;
    let startX, startY, startW, startH;
    
    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startW = win.offsetWidth;
      startH = win.offsetHeight;
      
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'se-resize';
      
      document.addEventListener('mousemove', moveResize);
      document.addEventListener('mouseup', stopResize);
    });
    
    function moveResize(e) {
      if (!resizing) return;
      
      // Calculate new dimensions with minimum size
      let newW = Math.max(280, startW + (e.clientX - startX));
      let newH = Math.max(180, startH + (e.clientY - startY));
      
      // Apply new dimensions
      win.style.width = newW + 'px';
      win.style.height = newH + 'px';
      
      // Update window state
      const windowInfo = WindowManager.windows.find(w => w.id === winId);
      if (windowInfo) {
        windowInfo.originalDimensions = {
          width: newW + 'px',
          height: newH + 'px'
        };
      }
    }
    
    function stopResize() {
      resizing = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      document.removeEventListener('mousemove', moveResize);
      document.removeEventListener('mouseup', stopResize);
    }
  },
  
  closeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Play close sound
    this.playSound('close');
    
    // Add closing animation
    win.classList.add('window-closing');
    
    // Remove after animation completes
    setTimeout(() => {
      if (win.parentNode) {
        win.parentNode.removeChild(win);
      }
      
      // Remove from taskbar if minimized
      const tab = document.getElementById(`tab-${winId}`);
      if (tab) {
        tab.parentNode.removeChild(tab);
      }
      
      // Unregister the window
      const index = this.windows.findIndex(w => w.id === winId);
      if (index !== -1) {
        this.windows.splice(index, 1);
      }
    }, 300);
  },
  
  minimizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Get window info
    const windowInfo = this.windows.find(w => w.id === winId);
    if (!windowInfo) return;
    
    const taskbarTabs = document.getElementById('minimized-windows');
    
    if (!document.getElementById(`tab-${winId}`)) {
      this.playSound('open');
      
      // Hide window
      win.style.display = 'none';
      windowInfo.minimized = true;
      
      // Create taskbar tab
      const tab = document.createElement('div');
      tab.className = 'taskbar-tab';
      tab.id = `tab-${winId}`;
      tab.setAttribute('role', 'button');
      tab.setAttribute('tabindex', '0');
      
      const iconHtml = `<span class="xp-icon"><img src="${windowInfo.icon}" alt=""></span>`;
      const titleHtml = `<span>${windowInfo.title}</span>`;
      
      tab.innerHTML = iconHtml + titleHtml;
      
      tab.addEventListener('click', () => {
        this.restoreWindow(winId, tab);
      });
      
      taskbarTabs.appendChild(tab);
    }
  },
  
  restoreWindow(winId, tab) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Show the window
    win.style.display = 'flex';
    win.classList.add('window-opening');
    
    // Remove tab from taskbar
    if (tab && tab.parentNode) {
      tab.parentNode.removeChild(tab);
    }
    
    // Update window state
    const windowInfo = this.windows.find(w => w.id === winId);
    if (windowInfo) {
      windowInfo.minimized = false;
    }
    
    // Focus the window
    this.focusWindow(winId);
    
    // Remove animation class after completion
    setTimeout(() => {
      win.classList.remove('window-opening');
    }, 300);
  },
  
  maximizeWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    const windowInfo = this.windows.find(w => w.id === winId);
    if (!windowInfo) return;
    
    if (!windowInfo.maximized) {
      // Store original dimensions and position
      windowInfo.originalDimensions = {
        width: win.style.width,
        height: win.style.height
      };
      
      windowInfo.originalPosition = {
        left: win.style.left,
        top: win.style.top
      };
      
      // Maximize
      win.classList.add('maximized');
      windowInfo.maximized = true;
    } else {
      // Restore original dimensions and position
      win.classList.remove('maximized');
      
      if (windowInfo.originalDimensions) {
        win.style.width = windowInfo.originalDimensions.width;
        win.style.height = windowInfo.originalDimensions.height;
      }
      
      if (windowInfo.originalPosition) {
        win.style.left = windowInfo.originalPosition.left;
        win.style.top = windowInfo.originalPosition.top;
      }
      
      windowInfo.maximized = false;
    }
    
    // Update maximize button icon
    const maxButton = win.querySelector('.xp-btn.max img');
    if (maxButton) {
      maxButton.src = windowInfo.maximized ? 'icons/restore.png' : 'icons/maximize.png';
    }
  },
  
  focusWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    
    // Bring to front
    win.style.zIndex = this.getNextZIndex();
    
    // Update focus class
    document.querySelectorAll('.xp-window').forEach(w => {
      w.classList.remove('window-focused');
    });
    
    win.classList.add('window-focused');
  },
  
  playSound(soundName) {
    const sounds = {
      open: new Audio('sounds/open.wav'),
      close: new Audio('sounds/close.wav'),
      error: new Audio('sounds/error.wav'),
      startup: new Audio('sounds/startup.wav')
    };
    
    try {
      if (sounds[soundName]) {
        sounds[soundName].play().catch(e => {
          console.warn('Sound could not be played:', e);
        });
      }
    } catch (e) {
      console.warn('Sound system error:', e);
    }
  }
};

// Gestionnaire de données
const DataManager = {
  data: {
    films: [],
    articles: [],
    projects: [],
    desktopIcons: []
  },
  
  // Default data (fallback)
  defaultData: {
    films: [
      {
        id: 1,
        titre: 'Blade Runner 2049',
        note: 5,
        critique: 'Une suite magistrale qui respecte l\'œuvre originale tout en développant sa propre identité.',
        image: 'https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_.jpg',
        galerie: [
          'https://via.placeholder.com/420x240?text=Image+1',
          'https://via.placeholder.com/420x240?text=Image+2'
        ],
        bandeAnnonce: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
        liens: [
          { nom: 'Allociné', url: 'https://www.allocine.fr/film/fichefilm_gen_cfilm=219931.html' },
          { nom: 'SensCritique', url: 'https://www.senscritique.com/film/Blade_Runner_2049/12087891' }
        ],
        tags: ['science-fiction', 'dystopie', 'cyberpunk']
      }
    ],
    articles: [
      {
        id: 1,
        titre: "L'avenir du journalisme à l'ère numérique",
        contenu: "Analyse des transformations du métier de journaliste face aux défis numériques. Le journalisme connaît une révolution sans précédent avec l'émergence des réseaux sociaux et l'intelligence artificielle. Comment les professionnels peuvent-ils s'adapter à ces changements tout en préservant les valeurs fondamentales de leur métier ?",
        date: "2025-08-25",
        categorie: "Médias",
        image: "https://via.placeholder.com/800x450?text=Journalisme+Numérique",
        tags: ["journalisme", "numérique", "médias"]
      },
      {
        id: 2,
        titre: "Analyse : le traitement médiatique des conflits internationaux",
        contenu: "Étude comparative de la couverture des conflits internationaux par différents médias et leur influence sur l'opinion publique.",
        date: "2025-08-20",
        categorie: "International",
        image: "https://via.placeholder.com/800x450?text=Médias+et+Conflits",
        tags: ["géopolitique", "médias", "analyse"]
      }
    ],
    projects: [
      {
        id: 1,
        titre: "Enquête sur la gentrification urbaine",
        description: "Projet d'enquête journalistique sur la transformation des quartiers populaires et ses conséquences sociales.",
        status: "En cours",
        date: "2025",
        image: "https://via.placeholder.com/800x450?text=Gentrification+Urbaine",
        liens: [
          { nom: "Document de recherche", url: "#" },
          { nom: "Interviews", url: "#" }
        ]
      }
    ],
    desktopIcons: [
      {
        id: 'icon-articles',
        name: 'Articles',
        icon: 'icons/article.png',
        action: 'createArticlesWindow',
        position: { x: 50, y: 50 }
      },
      {
        id: 'icon-portfolio',
        name: 'Portfolio',
        icon: 'icons/portfolio.png',
        action: 'createPortfolioWindow',
        position: { x: 50, y: 150 }
      },
      {
        id: 'icon-films',
        name: 'Critiques Ciné',
        icon: 'icons/film.png',
        action: 'createFilmsWindow',
        position: { x: 50, y: 250 }
      },
      {
        id: 'icon-cv',
        name: 'CV',
        icon: 'icons/cv.png',
        action: 'createCVWindow',
        position: { x: 50, y: 350 }
      },
      {
        id: 'icon-contact',
        name: 'Contact',
        icon: 'icons/email.png',
        action: 'createContactWindow',
        position: { x: 150, y: 50 }
      }
    ]
  },
  
  // Load default data
  loadDefaultData() {
    this.data = JSON.parse(JSON.stringify(this.defaultData));
    return this.data;
  },
  
  // Initialize data
  initData() {
    // Try to load from localStorage first
    const localData = localStorage.getItem('site_data');
    
    if (localData) {
      try {
        this.data = JSON.parse(localData);
        console.log('Data loaded from localStorage');
        return this.data;
      } catch (e) {
        console.error('Error parsing localStorage data', e);
      }
    }
    
    // Fall back to default data
    return this.loadDefaultData();
  },
  
  // Save data to localStorage
  saveDataLocally() {
    try {
      localStorage.setItem('site_data', JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('Error saving data locally', error);
      return false;
    }
  }
};

// Gestionnaire du bureau
const DesktopManager = {
  // Render desktop icons
  renderDesktopIcons() {
    const desktopContainer = document.querySelector('.desktop-icons');
    if (!desktopContainer) return;
    
    // Use DocumentFragment for batch DOM update
    const fragment = document.createDocumentFragment();
    
    // Clear existing icons
    desktopContainer.innerHTML = '';
    
    // Create and add each icon
    DataManager.data.desktopIcons.forEach(icon => {
      const iconElement = document.createElement('div');
      iconElement.className = 'desktop-icon';
      iconElement.id = icon.id;
      iconElement.setAttribute('tabindex', '0');
      iconElement.style.left = icon.position.x + 'px';
      iconElement.style.top = icon.position.y + 'px';
      
      iconElement.innerHTML = `
        <img src="${icon.icon}" alt="${icon.name}" loading="lazy">
        <span>${icon.name}</span>
      `;
      
      // Add click event
      iconElement.addEventListener('click', (event) => {
        event.stopPropagation();
        this.handleIconClick(icon);
      });
      
      // Add keyboard support
      iconElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleIconClick(icon);
        }
      });
      
      // Add to the fragment
      fragment.appendChild(iconElement);
    });
    
    // Add all icons at once
    desktopContainer.appendChild(fragment);
  },
  
  // Handle desktop icon click
  handleIconClick(icon) {
    console.log(`Icon clicked: ${icon.name}`);
    
    // Execute the corresponding action
    switch (icon.action) {
      case 'createArticlesWindow':
        createArticlesWindow();
        break;
      case 'createPortfolioWindow':
        createPortfolioWindow();
        break;
      case 'createFilmsWindow':
        createFilmsWindow();
        break;
      case 'createCVWindow':
        createCVWindow();
        break;
      case 'createContactWindow':
        createContactWindow();
        break;
      default:
        // Handle external URLs
        if (icon.action.startsWith('http')) {
          window.open(icon.action, '_blank', 'noopener,noreferrer');
        } else if (window[icon.action]) {
          // Call a function by name
          window[icon.action]();
        }
    }
  },
  
  // Make desktop icons draggable
  setupDraggableIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    let activeIcon = null;
    
    icons.forEach(icon => {
      let isDragging = false;
      let startX, startY, startLeft, startTop;
      
      // Mouse events
      icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Left click only
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(icon.style.left) || 0;
        startTop = parseInt(icon.style.top) || 0;
        
        icon.classList.add('dragging');
        e.preventDefault();
        
        activeIcon = icon;
      });
    });
    
    // Document level handlers to improve dragging
    document.addEventListener('mousemove', (e) => {
      if (!activeIcon || !activeIcon.classList.contains('dragging')) return;
      
      const startX = parseInt(activeIcon.dataset.startX || 0);
      const startY = parseInt(activeIcon.dataset.startY || 0);
      const startLeft = parseInt(activeIcon.dataset.startLeft || 0);
      const startTop = parseInt(activeIcon.dataset.startTop || 0);
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      activeIcon.style.left = (startLeft + deltaX) + 'px';
      activeIcon.style.top = (startTop + deltaY) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
  if (activeIcon) {
    activeIcon.classList.remove('dragging');
    
    // Update icon position in data
    const iconId = activeIcon.id;
    const iconData = DataManager.data.desktopIcons.find(icon => icon.id === iconId);
    if (iconData) {
      iconData.position = {
        x: parseInt(activeIcon.style.left) || 0,
        y: parseInt(activeIcon.style.top) || 0
      };
      
      // Save updated positions
      DataManager.saveDataLocally();
    }
    
    activeIcon = null;
  }
});
  } // Fin de la méthode setupDraggableIcons
}; // Fin de l'objet DesktopManager

// Fonctions de création de fenêtres
function createFilmsWindow() {
  const win = WindowManager.createWindow({
    title: 'Films',
    icon: 'icons/film.png',
    content: '<div class="window-films"><h1>Mes Films</h1><div id="films-list"></div></div>'
  });
  
  // Remplir la liste des films
  renderFilmsList();
  
  return win;
}

function createMangaWindow() {
  const win = WindowManager.createWindow({
    title: 'Manga',
    icon: 'icons/key.png',
    content: '<div class="window-films"><h1>Ma Collection Manga</h1><div id="manga-list"></div></div>'
  });
  
  // Remplir la liste des mangas
  renderMangaList();
  
  return win;
}

function createArticlesWindow() {
  return WindowManager.createWindow({
    title: 'Articles',
    icon: 'icons/article.png',
    content: '<div class="window-articles"><h1>Mes Articles</h1><div id="articles-list">Contenu à venir</div></div>'
  });
}

function createPortfolioWindow() {
  return WindowManager.createWindow({
    title: 'Portfolio',
    icon: 'icons/portfolio.png',
    content: '<div class="window-portfolio"><h1>Mon Portfolio</h1><div id="portfolio-content">Contenu à venir</div></div>'
  });
}

function createCVWindow() {
  return WindowManager.createWindow({
    title: 'CV',
    icon: 'icons/cv.png',
    content: '<div class="window-cv"><h1>Mon CV</h1><div id="cv-content">Contenu à venir</div></div>'
  });
}

function createContactWindow() {
  return WindowManager.createWindow({
    title: 'Contact',
    icon: 'icons/email.png',
    content: `
      <div class="window-contact">
        <h1>Contact</h1>
        <form id="contact-form">
          <div class="form-group">
            <label for="name">Nom</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn">Envoyer</button>
        </form>
      </div>
    `
  });
}

function createAdminWindow() {
  const win = WindowManager.createWindow({
    title: 'Admin Panel',
    icon: 'icons/key.png',
    width: '800px',
    height: '600px',
    content: `
      <div class="admin-panel">
        <div class="admin-toolbar">
          <button id="btn-add-film">Ajouter Film</button>
          <button id="btn-add-manga">Ajouter Manga</button>
          <button id="btn-manage-tags">Gérer Tags</button>
        </div>
        <div id="admin-content">
          <h2>Panel d'administration</h2>
          <p>Sélectionnez une action dans la barre d'outils.</p>
        </div>
      </div>
    `
  });
  
  // Ajouter les écouteurs d'événements pour les boutons
  setTimeout(() => {
    document.getElementById('btn-add-film').addEventListener('click', showAddFilmForm);
    document.getElementById('btn-add-manga').addEventListener('click', showAddMangaForm);
    document.getElementById('btn-manage-tags').addEventListener('click', showManageTagsForm);
  }, 100);
  
  return win;
}

// Fonctions de rendu pour les films et mangas
function renderFilmsList() {
  const filmsList = document.getElementById('films-list');
  if (!filmsList) return;
  
  let html = '';
  
  if (DataManager.data.films && DataManager.data.films.length) {
    DataManager.data.films.forEach(film => {
      const stars = '★'.repeat(film.note) + '☆'.repeat(5 - film.note);
      
      html += `
        <div class="film-card" data-id="${film.id}">
          <img class="film-image" src="${film.image || 'https://via.placeholder.com/120x180?text=No+Image'}" alt="${film.titre}">
          <div class="film-details">
            <div class="film-title">${film.titre}</div>
            <div class="film-rating">${stars}</div>
            <div class="film-critique">${film.critique || 'Pas de critique'}</div>
            <div class="film-links">
              ${film.liens ? film.liens.map(lien => `<a href="${lien.url}" target="_blank">${lien.nom}</a>`).join(' | ') : ''}
              ${film.bandeAnnonce ? `<a href="${film.bandeAnnonce}" target="_blank">Bande Annonce</a>` : ''}
            </div>
          </div>
        </div>
      `;
    });
  } else {
    html = '<p>Aucun film trouvé</p>';
  }
  
  filmsList.innerHTML = html;
}

function renderMangaList() {
  const mangaList = document.getElementById('manga-list');
  if (!mangaList) return;
  
  let html = '';
  
  if (DataManager.data.mangas && DataManager.data.mangas.length) {
    DataManager.data.mangas.forEach(manga => {
      const stars = '★'.repeat(manga.note) + '☆'.repeat(5 - manga.note);
      const statusClass = manga.statut === 'Terminé' ? 'completed' : (manga.statut === 'En cours' ? 'ongoing' : 'hiatus');
      
      html += `
        <div class="manga-card" data-id="${manga.id}">
          <img class="manga-image" src="${manga.image || 'https://via.placeholder.com/100x150?text=No+Image'}" alt="${manga.titre}">
          <div class="manga-details">
            <div class="manga-title">${manga.titre}</div>
            <div class="manga-rating">${stars}</div>
            <div class="manga-info">
              <div>Auteur: ${manga.auteur || 'Non spécifié'}</div>
              <div>Chapitres: ${manga.chapitres || '?'}</div>
            </div>
            <div class="manga-status ${statusClass}">${manga.statut || 'Non spécifié'}</div>
          </div>
        </div>
      `;
    });
  } else {
    html = '<p>Aucun manga trouvé</p>';
  }
  
  mangaList.innerHTML = html;
}

// Fonctions pour le panneau d'administration
function showAdminLogin() {
  const loginForm = document.createElement('div');
  loginForm.className = 'admin-login';
  loginForm.innerHTML = `
    <div class="admin-login-form">
      <h2>Administration</h2>
      <input type="password" id="admin-password" placeholder="Mot de passe">
      <button id="btn-admin-login">Connexion</button>
    </div>
  `;
  
  document.body.appendChild(loginForm);
  
  document.getElementById('btn-admin-login').addEventListener('click', () => {
    const password = document.getElementById('admin-password').value;
    if (password === 'sitethéi') { // Mot de passe défini dans le README
      document.body.removeChild(loginForm);
      createAdminWindow();
    } else {
      alert('Mot de passe incorrect');
    }
  });
}

function showAddFilmForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h2>Ajouter un nouveau film</h2>
    <form id="add-film-form">
      <div class="form-group">
        <label for="film-title">Titre</label>
        <input type="text" id="film-title" required>
      </div>
      <div class="form-group">
        <label for="film-note">Note (1-5)</label>
        <input type="number" id="film-note" min="0" max="5" value="0">
      </div>
      <div class="form-group">
        <label for="film-critique">Critique</label>
        <textarea id="film-critique" rows="4"></textarea>
      </div>
      <div class="form-group">
        <label for="film-image">URL de l'image</label>
        <input type="url" id="film-image">
      </div>
      <div class="form-group">
        <label for="film-trailer">URL de la bande annonce</label>
        <input type="url" id="film-trailer">
      </div>
      <button type="submit" class="btn">Enregistrer</button>
    </form>
  `;
  
  document.getElementById('add-film-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newFilm = {
      id: Date.now(), // Utilise un timestamp comme ID unique
      titre: document.getElementById('film-title').value,
      note: parseInt(document.getElementById('film-note').value) || 0,
      critique: document.getElementById('film-critique').value,
      image: document.getElementById('film-image').value,
      bandeAnnonce: document.getElementById('film-trailer').value,
      galerie: [],
      liens: []
    };
    
    // Ajouter le nouveau film
    DataManager.data.films.push(newFilm);
    DataManager.saveDataLocally();
    
    // Rafraîchir la liste si elle est ouverte
    renderFilmsList();
    
    // Notification
    UIManager.showNotification('Film ajouté avec succès', 'success');
    
    // Réinitialiser le formulaire
    this.reset();
  });
}

function showAddMangaForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  adminContent.innerHTML = `
    <h2>Ajouter un nouveau manga</h2>
    <form id="add-manga-form">
      <div class="form-group">
        <label for="manga-title">Titre</label>
        <input type="text" id="manga-title" required>
      </div>
      <div class="form-group">
        <label for="manga-note">Note (1-5)</label>
        <input type="number" id="manga-note" min="0" max="5" value="0">
      </div>
      <div class="form-group">
        <label for="manga-auteur">Auteur</label>
        <input type="text" id="manga-auteur">
      </div>
      <div class="form-group">
        <label for="manga-statut">Statut</label>
        <select id="manga-statut">
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
          <option value="En pause">En pause</option>
        </select>
      </div>
      <div class="form-group">
        <label for="manga-chapitres">Nombre de chapitres</label>
        <input type="number" id="manga-chapitres" min="0">
      </div>
      <div class="form-group">
        <label for="manga-image">URL de l'image</label>
        <input type="url" id="manga-image">
      </div>
      <button type="submit" class="btn">Enregistrer</button>
    </form>
  `;
  
  document.getElementById('add-manga-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newManga = {
      id: Date.now(), // Utilise un timestamp comme ID unique
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
    if (!DataManager.data.mangas) {
      DataManager.data.mangas = [];
    }
    DataManager.data.mangas.push(newManga);
    DataManager.saveDataLocally();
    
    // Rafraîchir la liste si elle est ouverte
    renderMangaList();
    
    // Notification
    UIManager.showNotification('Manga ajouté avec succès', 'success');
    
    // Réinitialiser le formulaire
    this.reset();
  });
}

function showManageTagsForm() {
  const adminContent = document.getElementById('admin-content');
  if (!adminContent) return;
  
  // Préparer l'affichage des tags
  let tagsHTML = '<ul class="tags-list">';
  
  if (DataManager.data.tags && DataManager.data.tags.length) {
    DataManager.data.tags.forEach(tag => {
      tagsHTML += `
        <li data-id="${tag.id}">
          <span style="background-color: ${tag.color};" class="tag-color"></span>
          <span class="tag-name">${tag.name}</span>
          <span class="tag-category">(${tag.category})</span>
          <button class="btn-delete-tag" data-id="${tag.id}">✕</button>
        </li>
      `;
    });
  }
  
  tagsHTML += '</ul>';
  
  adminContent.innerHTML = `
    <h2>Gérer les tags</h2>
    ${tagsHTML}
    <h3>Ajouter un nouveau tag</h3>
    <form id="add-tag-form">
      <div class="form-group">
        <label for="tag-name">Nom</label>
        <input type="text" id="tag-name" required>
      </div>
      <div class="form-group">
        <label for="tag-color">Couleur</label>
        <input type="color" id="tag-color" value="#3498db">
      </div>
      <div class="form-group">
        <label for="tag-category">Catégorie</label>
        <input type="text" id="tag-category" placeholder="Ex: genre, année...">
      </div>
      <button type="submit" class="btn">Ajouter</button>
    </form>
  `;
  
  // Ajouter les écouteurs pour la suppression
  document.querySelectorAll('.btn-delete-tag').forEach(btn => {
    btn.addEventListener('click', function() {
      const tagId = this.getAttribute('data-id');
      if (confirm('Êtes-vous sûr de vouloir supprimer ce tag?')) {
        DataManager.data.tags = DataManager.data.tags.filter(tag => tag.id !== tagId);
        DataManager.saveDataLocally();
        showManageTagsForm(); // Rafraîchir la liste
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
    if (!DataManager.data.tags) {
      DataManager.data.tags = [];
    }
    DataManager.data.tags.push(newTag);
    DataManager.saveDataLocally();
    
    // Rafraîchir le formulaire
    showManageTagsForm();
    
    // Notification
    UIManager.showNotification('Tag ajouté avec succès', 'success');
  });
}

// Code d'initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les données
  DataManager.initData();
  
  // Simuler le chargement Windows XP
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    
    // Initialiser l'interface
    DesktopManager.renderDesktopIcons();
    DesktopManager.setupDraggableIcons();
    
    // Jouer le son de démarrage
    WindowManager.playSound('startup');
  }, 3000);
});

// Fonctions de création de fenêtres
function createArticlesWindow() {
  return WindowManager.createWindow({
    title: 'Articles',
    icon: 'icons/article.png',
    content: '<div class="window-articles"><h1>Mes Articles</h1><div id="articles-list"></div></div>'
  });
}

function createPortfolioWindow() {
  return WindowManager.createWindow({
    title: 'Portfolio',
    icon: 'icons/portfolio.png',
    content: '<div class="window-portfolio"><h1>Mon Portfolio</h1><div id="portfolio-content"></div></div>'
  });
}

function createFilmsWindow() {
  return WindowManager.createWindow({
    title: 'Critiques Ciné',
    icon: 'icons/film.png',
    content: '<div class="window-films"><h1>Mes Critiques de Films</h1><div id="films-list"></div></div>'
  });
}

function createCVWindow() {
  return WindowManager.createWindow({
    title: 'CV',
    icon: 'icons/cv.png',
    content: '<div class="window-cv"><h1>Mon CV</h1><div id="cv-content"></div></div>'
  });
}

function createContactWindow() {
  return WindowManager.createWindow({
    title: 'Contact',
    icon: 'icons/email.png',
    content: '<div class="window-contact"><h1>Contact</h1><form id="contact-form"></form></div>'
  });
}
// Code d'initialisation
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les données
  DataManager.initData();
  
  // Simuler le chargement Windows XP
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    
    // Initialiser l'interface
    DesktopManager.renderDesktopIcons();
    DesktopManager.setupDraggableIcons();
    
    // Jouer le son de démarrage
    WindowManager.playSound('startup');
  }, 3000);
  
  // Ajouter un raccourci clavier pour l'administration
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+A pour ouvrir le panneau d'administration
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      showAdminLogin();
    }
  });
  // Fonction pour afficher un écran bleu (BSOD)
function showBSOD(error = null) {
  const bsodConfig = DataManager.data.bsodConfig || {
    title: "ERREUR SYSTÈME",
    errorCode: "ERROR_UNEXPECTED_FAILURE",
    technicalInfo: "Information technique:\n\n*** STOP: 0x00000050 (0x8872A990, 0x00000001, 0x804F35D8, 0x00000000)",
    instructions: "Redémarrez votre ordinateur. Si cette erreur persiste, contactez l'administrateur système.",
    memoryDump: "Beginning dump of physical memory...\nPhysical memory dump complete.\nContact your system administrator for assistance."
  };
  
  const bsod = document.createElement('div');
  bsod.className = 'bsod';
  bsod.innerHTML = `
    <div class="bsod-content">
      <div class="bsod-header typewriter">
        <h1>${bsodConfig.title}</h1>
      </div>
      <div class="bsod-error typewriter">
        <p>${bsodConfig.errorCode}</p>
      </div>
      <div class="bsod-technical typewriter">
        <pre>${bsodConfig.technicalInfo}</pre>
        ${error ? `<pre>Error details: ${error.message || 'Unknown error'}</pre>` : ''}
      </div>
      <div class="bsod-instructions typewriter">
        <p>${bsodConfig.instructions}</p>
      </div>
      <div class="bsod-dump typewriter">
        <pre>${bsodConfig.memoryDump}</pre>
      </div>
      <div class="bsod-continue">
        <button id="bsod-restart-btn">Redémarrer</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(bsod);
  
  // Ajouter un écouteur pour le bouton de redémarrage
  setTimeout(() => {
    document.getElementById('bsod-restart-btn').addEventListener('click', () => {
      document.body.removeChild(bsod);
      location.reload();
    });
  }, 2000);
}
  // Ajouter un raccourci clavier pour l'administration
document.addEventListener('keydown', function(e) {
  // Ctrl+Shift+A pour ouvrir le panneau d'administration
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    showAdminLogin();
  }
});
});
