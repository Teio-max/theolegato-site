// Module pour initialiser l'application de manière cohérente
// Assure que tous les modules sont initialisés dans le bon ordre

const AppInitializer = {
  // État de l'initialisation
  state: {
    initialized: false,
    modules: {
      errorHandler: false,
      windowManager: false,
      dataManager: false,
      mediaManager: false,
      pdfManager: false,
      desktopManager: false,
      adminPanel: false
    }
  },
  
  // Initialiser l'application
  init: function() {
    console.log("🚀 Initialisation de l'application");
    
    // Vérifier si l'application est déjà initialisée
    if (this.state.initialized) {
      console.log("⚠️ L'application est déjà initialisée");
      return;
    }
    
    // Initialiser les modules dans l'ordre
    this.initErrorHandler();
    this.initConfig();
    this.initDataManager();
    this.initWindowManager();
    this.initMediaManager();
    this.initPDFManager();
    this.initDesktopManager();
    
    // Marquer l'application comme initialisée
    this.state.initialized = true;
    
    // Déclencher l'événement d'initialisation complète
    this.dispatchInitCompletedEvent();
  },

  // Initialiser le gestionnaire d'erreurs
  initErrorHandler: function() {
    console.log("🛡️ Initialisation du gestionnaire d'erreurs");
    
    if (this.state.modules.errorHandler) {
      console.log("⚠️ Le gestionnaire d'erreurs est déjà initialisé");
      return;
    }
    
    // Vérifier que ErrorHandler existe
    if (typeof ErrorHandler !== 'undefined' && typeof ErrorHandler.init === 'function') {
      ErrorHandler.init();
      this.state.modules.errorHandler = true;
    } else {
      console.error("❌ ErrorHandler n'est pas disponible!");
    }
  },
  
  // Initialiser la configuration globale
  initConfig: function() {
    console.log("⚙️ Initialisation de la configuration");
    
    // Vérifier si la configuration existe déjà
    if (typeof window.CONFIG === 'undefined') {
      window.CONFIG = {
        site: {
          title: "Site Portfolio Théo",
          theme: localStorage.getItem('site_theme') || 'luna',
          darkMode: localStorage.getItem('dark_mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches,
          zoom: localStorage.getItem('site_zoom') || 'normal',
          autoSave: localStorage.getItem('auto_save') === 'true',
          debug: localStorage.getItem('debug_mode') === 'true' || false
        },
        github: {
          owner: 'Teio-max',
          repo: 'theolegato-site',
          branch: 'main',
          dataFile: 'data.json',
          token: localStorage.getItem('github_token') || null
        }
      };
    }
    
    // S'assurer que GITHUB_CONFIG est disponible globalement
    if (typeof window.GITHUB_CONFIG === 'undefined') {
      window.GITHUB_CONFIG = {
        owner: 'Teio-max',
        repo: 'theolegato-site',
        branch: 'main',
        dataFile: 'data.json',
        token: localStorage.getItem('github_token') || sessionStorage.getItem('github_token') || null
      };
    }
  },
  
  // Configuration supplémentaire
  getConfig: function() {
    return {
      site: {
        theme: localStorage.getItem('site_theme') || 'luna',
        darkMode: localStorage.getItem('dark_mode') === 'true' || window.matchMedia('(prefers-color-scheme: dark)').matches,
        zoom: localStorage.getItem('site_zoom') || 'normal',
        autoSave: localStorage.getItem('auto_save') === 'true',
        debug: localStorage.getItem('debug_mode') === 'true' || false
      },
      github: {
        owner: 'Teio-max',
        repo: 'theolegato-site',
        branch: 'main',
        dataFile: 'data.json'
      }
    };
  },
  
  // Initialiser le gestionnaire de données
  initDataManager: function() {
    console.log("📊 Initialisation du gestionnaire de données");
    
    if (this.state.modules.dataManager) {
      console.log("⚠️ Le gestionnaire de données est déjà initialisé");
      return;
    }
    
    // S'assurer que les collections sont disponibles globalement
    window.films = window.films || [];
    window.mangas = window.mangas || [];
    window.articles = window.articles || [];
    window.tags = window.tags || [];
    window.cvData = window.cvData || { pdfUrl: '', lastUpdated: null };
    window.desktopIcons = window.desktopIcons || {
      defaultIcons: [
        { id: 'films', name: 'Films', icon: 'icons/film.png', x: 20, y: 20, visible: true },
        { id: 'articles', name: 'Articles', icon: 'icons/article.png', x: 20, y: 100, visible: true },
        { id: 'cv', name: 'CV', icon: 'icons/cv.png', x: 20, y: 180, visible: true },
        { id: 'mangas', name: 'Mangas', icon: 'icons/portfolio.png', x: 20, y: 260, visible: false },
        { id: 'info', name: 'À propos', icon: 'icons/info.png', x: 20, y: 340, visible: true }
      ],
      customIcons: []
    };
    
    // Vérifier que DataManager existe
    if (typeof window.DataManager !== 'undefined' && typeof window.DataManager.initData === 'function') {
      // Charger les données
      window.DataManager.initData();
      this.state.modules.dataManager = true;
    } else {
      console.error("❌ DataManager n'est pas disponible!");
    }
  },
  
  // Initialiser le gestionnaire de fenêtres
  initWindowManager: function() {
    console.log("🪟 Initialisation du gestionnaire de fenêtres");
    
    if (this.state.modules.windowManager) {
      console.log("⚠️ Le gestionnaire de fenêtres est déjà initialisé");
      return;
    }
    
    // Vérifier que WindowManager existe
    if (typeof WindowManager !== 'undefined') {
      // WindowManager n'a pas besoin d'initialisation explicite pour le moment
      this.state.modules.windowManager = true;
    } else {
      console.error("❌ WindowManager n'est pas disponible!");
    }
  },
  
  // Initialiser le gestionnaire de médias
  initMediaManager: function() {
    console.log("🎬 Initialisation du gestionnaire de médias");
    
    if (this.state.modules.mediaManager) {
      console.log("⚠️ Le gestionnaire de médias est déjà initialisé");
      return;
    }
    
    // Vérifier que MediaManager existe
    if (typeof MediaManager !== 'undefined' && typeof MediaManager.init === 'function') {
      MediaManager.init();
      this.state.modules.mediaManager = true;
    } else {
      console.log("ℹ️ MediaManager n'est pas disponible ou n'a pas besoin d'initialisation");
    }
  },
  
  // Initialiser le gestionnaire de PDF
  initPDFManager: function() {
    console.log("📄 Initialisation du gestionnaire de PDF");
    
    if (this.state.modules.pdfManager) {
      console.log("⚠️ Le gestionnaire de PDF est déjà initialisé");
      return;
    }
    
    // Vérifier que PDFManager existe
    if (typeof PDFManager !== 'undefined' && typeof PDFManager.init === 'function') {
      PDFManager.init();
      this.state.modules.pdfManager = true;
    } else {
      console.log("ℹ️ PDFManager n'est pas disponible ou n'a pas besoin d'initialisation");
    }
  },
  
  // Initialiser le gestionnaire de bureau
  initDesktopManager: function() {
    console.log("🖥️ Initialisation du gestionnaire de bureau");
    
    if (this.state.modules.desktopManager) {
      console.log("⚠️ Le gestionnaire de bureau est déjà initialisé");
      return;
    }
    
    // Vérifier que DesktopManager existe
    if (typeof DesktopManager !== 'undefined') {
      // Rendre les icônes du bureau
      if (typeof DesktopManager.renderDesktopIcons === 'function') {
        DesktopManager.renderDesktopIcons();
      }
      
      // Configurer les icônes glissables
      if (typeof DesktopManager.setupDraggableIcons === 'function') {
        DesktopManager.setupDraggableIcons();
      }
      
      this.state.modules.desktopManager = true;
    } else {
      console.error("❌ DesktopManager n'est pas disponible!");
    }
  },
  
  // Simuler le chargement Windows XP
  simulateStartup: function(delay = 3000) {
    console.log(`🖥️ Démarrage de Windows XP (délai: ${delay}ms)`);
    
    // Progresser la barre de chargement
    const progressBar = document.querySelector('.loading-progress');
    if (progressBar) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        if (progress >= 100) clearInterval(interval);
      }, delay / 50);
    }
    
    // Afficher le bureau après le délai
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      const desktop = document.getElementById('desktop');
      
      if (loadingScreen) loadingScreen.style.display = 'none';
      if (desktop) desktop.style.display = 'block';
      
      // Jouer le son de démarrage
      if (window.WindowManager) {
        window.WindowManager.playSound('startup');
      }
    }, delay);
  },
  
  // Déclencher un événement pour signaler que l'initialisation est terminée
  dispatchInitCompletedEvent: function() {
    console.log("✅ Initialisation de l'application terminée");
    
    // Créer et dispatcher l'événement
    const event = new CustomEvent('app:initialized', {
      detail: {
        timestamp: Date.now(),
        modules: { ...this.state.modules }
      }
    });
    
    document.dispatchEvent(event);
    
    // Afficher le bureau et masquer l'écran de chargement
    setTimeout(() => {
      const loadingScreen = document.getElementById('loading-screen');
      const desktop = document.getElementById('desktop');
      
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
          if (desktop) {
            desktop.style.display = 'block';
            setTimeout(() => {
              desktop.style.opacity = '1';
            }, 100);
          }
        }, 500);
      } else if (desktop) {
        desktop.style.display = 'block';
        setTimeout(() => {
          desktop.style.opacity = '1';
        }, 100);
      }
      
      // Jouer le son de démarrage
      if (typeof WindowManager !== 'undefined' && typeof WindowManager.playSound === 'function') {
        WindowManager.playSound('startup');
      }
    }, 1000);
  }
};

// Exposer le module globalement
window.AppInitializer = AppInitializer;

// Initialiser l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  // Attendre un court instant pour s'assurer que tous les scripts sont chargés
  setTimeout(function() {
    AppInitializer.init();
  }, 100);
  
  // Ajouter un raccourci clavier pour l'administration
  document.addEventListener('keydown', function(e) {
    // Ctrl+Shift+A pour ouvrir le panneau d'administration
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      if (typeof window.showAdminLogin === 'function') {
        window.showAdminLogin();
      }
    }
  });
});
