// Initialiser l'exposition des données globales
(function() {
  console.log("🔄 Initialisation des données globales");
  
  // S'assurer que les collections sont disponibles globalement
  if (typeof window.films === 'undefined') {
    window.films = [];
  }
  
  if (typeof window.mangas === 'undefined') {
    window.mangas = [];
  }
  
  if (typeof window.articles === 'undefined') {
    window.articles = [];
  }
  
  if (typeof window.tags === 'undefined') {
    window.tags = [];
  }
  
  if (typeof window.cvData === 'undefined') {
    window.cvData = {
      pdfUrl: '',
      lastUpdated: null
    };
  }

  // Exposer GITHUB_CONFIG globalement s'il n'est pas déjà disponible
  if (typeof window.GITHUB_CONFIG === 'undefined') {
    window.GITHUB_CONFIG = {
      owner: 'Teio-max',
      repo: 'theolegato-site',
      branch: 'main',
      dataFile: 'data.json',
      token: localStorage.getItem('github_token') || sessionStorage.getItem('github_token') || null
    };
  }
  
  // Initialiser UIManager s'il n'est pas déjà défini
  if (typeof window.UIManager === 'undefined') {
    window.UIManager = {
      showNotification: function(message, type = 'info', duration = 3000) {
        console.log(`📣 [${type}]: ${message}`);
        
        // Créer une notification visuelle simple
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '4px';
        notification.style.color = '#fff';
        notification.style.zIndex = '10000';
        notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        // Définir la couleur de fond selon le type
        switch (type) {
          case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
          case 'warning':
            notification.style.backgroundColor = '#FF9800';
            break;
          case 'error':
            notification.style.backgroundColor = '#F44336';
            break;
          default: // info
            notification.style.backgroundColor = '#2196F3';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Afficher la notification avec animation
        setTimeout(() => {
          notification.style.opacity = '1';
          notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Cacher et supprimer après un délai
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, duration);
      }
    };
  }
})();

// Définition du gestionnaire de données centralisé
// Ce gestionnaire est exposé globalement et utilisé par tous les modules
window.DataManager = {
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
  
  // Initialiser les données
  initData() {
    console.log("📊 Initialisation des données");
    
    // Charger les données depuis GitHub
    this.loadDataFromGitHub();
  },
  
  // Charger les données depuis GitHub
  loadDataFromGitHub() {
    console.log("🔄 Chargement des données depuis GitHub");
    
    // Vérifier si le token GitHub est configuré
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      console.log("ℹ️ Token GitHub non configuré, utilisation des données locales");
      this.loadDataFromLocal();
      return;
    }
    
    // URL de l'API GitHub
    const apiUrl = `https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/${window.GITHUB_CONFIG.dataFile}`;
    
    // En-têtes de la requête
    const headers = {
      'Authorization': `token ${window.GITHUB_CONFIG.token}`,
      'Accept': 'application/vnd.github.v3.raw'
    };
    
    // Effectuer la requête
    fetch(apiUrl, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur GitHub API: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("✅ Données chargées depuis GitHub");
        
        // Mettre à jour les données globales
        this.updateGlobalData(data);
        
        // Déclencher un événement pour signaler que les données sont chargées
        document.dispatchEvent(new CustomEvent('data:loaded', { detail: data }));
      })
      .catch(error => {
        console.error("❌ Erreur lors du chargement depuis GitHub:", error);
        
        // Fallback: charger depuis localStorage
        this.loadDataFromLocal();
      });
  },
  
  // Load default data
  loadDefaultData() {
    this.data = JSON.parse(JSON.stringify(this.defaultData));
    
    // Update global data references
    this.updateGlobalData(this.data);
    
    return this.data;
  },
  
  // Charger les données depuis localStorage
  loadDataFromLocal() {
    console.log("🔄 Chargement des données depuis localStorage");
    
    try {
      // Récupérer les données depuis localStorage
      const localData = localStorage.getItem('site_data');
      
      if (localData) {
        // Parser les données
        const data = JSON.parse(localData);
        
        // Mettre à jour les données globales
        this.updateGlobalData(data);
        
        console.log("✅ Données chargées depuis localStorage");
        
        // Déclencher un événement pour signaler que les données sont chargées
        document.dispatchEvent(new CustomEvent('data:loaded', { detail: data }));
        return data;
      } else {
        console.log("ℹ️ Aucune donnée locale trouvée, chargement des données par défaut");
        return this.loadDefaultData();
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données locales:", error);
      return this.loadDefaultData();
    }
  },
  
  // Mettre à jour les données globales
  updateGlobalData(data) {
    // Stocker les données dans this.data
    this.data = { ...this.data, ...data };
    
    // Mettre à jour les films
    if (data.films && Array.isArray(data.films)) {
      window.films = data.films;
    }
    
    // Mettre à jour les mangas
    if (data.mangas && Array.isArray(data.mangas)) {
      window.mangas = data.mangas;
    }
    
    // Mettre à jour les articles
    if (data.articles && Array.isArray(data.articles)) {
      window.articles = data.articles;
    }
    
    // Mettre à jour les tags
    if (data.tags && Array.isArray(data.tags)) {
      window.tags = data.tags;
    }
    
    // Mettre à jour les données du CV
    if (data.cvData && typeof data.cvData === 'object') {
      window.cvData = data.cvData;
    }
    
    // Mettre à jour les icônes du bureau
    if (data.desktopIcons && Array.isArray(data.desktopIcons)) {
      window.desktopIcons = data.desktopIcons;
    }
  },
  
  // Save data to localStorage
  saveDataLocally() {
    try {
      // Compile all data
      const dataToSave = {
        films: window.films || this.data.films,
        mangas: window.mangas || this.data.mangas,
        articles: window.articles || this.data.articles,
        tags: window.tags || this.data.tags,
        cvData: window.cvData || this.data.cvData,
        desktopIcons: window.desktopIcons || this.data.desktopIcons
      };
      
      localStorage.setItem('site_data', JSON.stringify(dataToSave));
      console.log("✅ Données enregistrées localement");
      
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'enregistrement des données localement", error);
      
      // Tenter d'enregistrer sans les images pour réduire la taille
      try {
        const dataWithoutImages = { ...this.data };
        
        // Supprimer les galeries d'images
        if (dataWithoutImages.films) {
          dataWithoutImages.films = dataWithoutImages.films.map(film => {
            const { galerie, ...rest } = film;
            return rest;
          });
        }
        
        localStorage.setItem('site_data', JSON.stringify(dataWithoutImages));
        console.log("⚠️ Données enregistrées sans les images");
        return true;
      } catch (e) {
        console.error("❌ Échec de l'enregistrement réduit", e);
        return false;
      }
    }
  },
  
  // Save data to GitHub
  saveDataToGitHub() {
    // Nouvelle implémentation complète utilisant l'API GitHub (PUT /contents)
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
      console.warn('⚠️ Token GitHub manquant: fallback local uniquement');
      return Promise.resolve(this.saveDataLocally());
    }
    const { owner, repo, branch = 'main', dataFile = 'data.json', token } = window.GITHUB_CONFIG;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dataFile}`;

    // Construire l'objet consolidé actuel
    const consolidated = {
      films: window.films || [],
      mangas: window.mangas || [],
      articles: window.articles || [],
      tags: window.tags || [],
      cvData: window.cvData || { pdfUrl: '', lastUpdated: null },
      desktopIcons: window.desktopIcons || this.data.desktopIcons || [],
      welcomePopupConfig: (window.DataManager && window.DataManager.data && window.DataManager.data.welcomePopupConfig) || {},
      lastUpdated: new Date().toISOString()
    };

    // Mettre en cache local immédiatement (optimiste)
    try { localStorage.setItem('site_data', JSON.stringify(consolidated)); } catch(e) { console.warn('Local cache fail:', e.message); }

    const jsonString = JSON.stringify(consolidated, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonString)));

    // Étape 1: récupérer SHA existant (si fichier présent)
    return fetch(`${apiUrl}?ref=${branch}`, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    })
      .then(r => {
        if (r.status === 200) return r.json();
        if (r.status === 404) return { sha: undefined }; // fichier nouveau
        throw new Error('GitHub GET data.json status ' + r.status);
      })
      .then(meta => {
        const body = {
          message: '� Update data.json via admin panel',
            content: base64Content,
            branch,
            sha: meta.sha
        };
        return fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      })
      .then(r => { if(!r.ok) throw new Error('GitHub PUT data.json status '+r.status); return r.json(); })
      .then(resp => {
        console.log('✅ data.json mis à jour sur GitHub');
        if(window.UIManager) UIManager.showNotification('Données synchronisées sur GitHub', 'success');
        return resp;
      })
      .catch(err => {
        console.error('❌ Échec sauvegarde GitHub data.json', err);
        if(window.UIManager) UIManager.showNotification('Sauvegarde GitHub échouée: '+err.message, 'error');
        // Pas de rejet brutal: on renvoie tout de même false
        return false;
      });
  }
};

// ---- Utilitaires upload binaire centralisés (PDF / autres) ----
if (typeof window.fileToBase64Binary !== 'function') {
  window.fileToBase64Binary = async function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const bytes = new Uint8Array(reader.result);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        resolve(btoa(binary));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };
}

if (typeof window.uploadBinaryToGitHub !== 'function') {
  window.uploadBinaryToGitHub = async function(file, pathInRepo) {
    if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) throw new Error('Token GitHub absent');
    const { owner, repo, branch='main', token } = window.GITHUB_CONFIG;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${pathInRepo}`;
    // Récupérer sha si fichier existe
    let sha;
    const head = await fetch(`${apiUrl}?ref=${branch}`, { headers:{ 'Authorization': `token ${token}` } });
    if(head.status === 200){ const meta = await head.json(); sha = meta.sha; }
    const content = await window.fileToBase64Binary(file);
    const resp = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `📄 Upload ${pathInRepo}`,
        content,
        branch,
        sha
      })
    });
    if(!resp.ok) throw new Error('Upload GitHub échec status '+resp.status);
    const json = await resp.json();
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${pathInRepo}`;
    return { meta: json, rawUrl, downloadUrl: json.content?.download_url || rawUrl };
  };
}
// Utilitaire global pour définir / mémoriser le token GitHub de façon centralisée
if (typeof window.setGitHubToken !== 'function') {
  window.setGitHubToken = function(token, remember = true) {
    if (!window.GITHUB_CONFIG) {
      window.GITHUB_CONFIG = { owner:'Teio-max', repo:'theolegato-site', branch:'main', dataFile:'data.json', token:null };
    }
    window.GITHUB_CONFIG.token = token || null;
    try {
      if (token && remember) {
        localStorage.setItem('github_token', token);
      } else if (token) {
        sessionStorage.setItem('github_token', token);
      }
      if (!token) {
        localStorage.removeItem('github_token');
        sessionStorage.removeItem('github_token');
      }
      console.log('🔐 Token GitHub mis à jour (remember=' + remember + ')');
    } catch(e) {
      console.warn('⚠️ Impossible de stocker le token:', e.message);
    }
    return window.GITHUB_CONFIG.token;
  };
}
  
  // Exposer les fonctions de sauvegarde si elles n'existent pas
  if (typeof window.saveDataToGitHub !== 'function') {
    window.saveDataToGitHub = function() {
      return new Promise((resolve, reject) => {
        if (!window.GITHUB_CONFIG || !window.GITHUB_CONFIG.token) {
          reject(new Error("Token GitHub manquant. Veuillez configurer un token pour la sauvegarde."));
          return;
        }
        
        const token = window.GITHUB_CONFIG.token;
        const dataToSave = {
          films: window.films || [],
          mangas: window.mangas || [],
          articles: window.articles || [],
          tags: window.tags || [],
          cvData: window.cvData || { pdfUrl: '', lastUpdated: null },
          lastUpdated: new Date().toISOString()
        };
        
        console.log("💾 Tentative de sauvegarde des données vers GitHub...");
        
        // Vérifier d'abord si le fichier existe pour obtenir le SHA
        fetch(`https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/${window.GITHUB_CONFIG.dataFile}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur GitHub API: ${response.status}`);
          }
          return response.json();
        })
        .then(fileInfo => {
          // Préparer le contenu encodé en base64
          const content = btoa(JSON.stringify(dataToSave, null, 2));
          
          // Mettre à jour le fichier avec le SHA
          return fetch(`https://api.github.com/repos/${window.GITHUB_CONFIG.owner}/${window.GITHUB_CONFIG.repo}/contents/${window.GITHUB_CONFIG.dataFile}`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: '📊 Mise à jour des données du site',
              content: content,
              sha: fileInfo.sha,
              branch: window.GITHUB_CONFIG.branch || 'main'
            })
          });
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur GitHub API: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log("✅ Données sauvegardées avec succès!", data);
          if (window.UIManager && typeof window.UIManager.showNotification === 'function') {
            window.UIManager.showNotification("Données sauvegardées avec succès!", "success");
          }
          resolve(data);
        })
        .catch(error => {
          console.error("❌ Erreur lors de la sauvegarde:", error);
          if (window.UIManager && typeof window.UIManager.showNotification === 'function') {
            window.UIManager.showNotification(`Erreur: ${error.message}`, "error");
          }
          reject(error);
        });
      });
    };
  }
  
  if (typeof window.saveData !== 'function') {
    window.saveData = function() {
      const dataToSave = {
        films: window.films || [],
        mangas: window.mangas || [],
        articles: window.articles || [],
        tags: window.tags || [],
        cvData: window.cvData || { pdfUrl: '', lastUpdated: null },
        lastUpdated: new Date().toISOString()
      };
      
      try {
        localStorage.setItem('site_data', JSON.stringify(dataToSave));
        console.log("✅ Données sauvegardées localement");
        if (window.UIManager && typeof window.UIManager.showNotification === 'function') {
          window.UIManager.showNotification("Données sauvegardées localement", "success");
        }
        return true;
      } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde locale:", error);
        if (window.UIManager && typeof window.UIManager.showNotification === 'function') {
          window.UIManager.showNotification(`Erreur: ${error.message}`, "error");
        }
        return false;
      }
    };
  }
  
  // Charger les données depuis localStorage si elles existent
  const localData = localStorage.getItem('site_data');
  if (localData) {
    try {
      const parsedData = JSON.parse(localData);
      if (parsedData.films && Array.isArray(parsedData.films)) {
        window.films = parsedData.films;
      }
      if (parsedData.mangas && Array.isArray(parsedData.mangas)) {
        window.mangas = parsedData.mangas;
      }
      if (parsedData.articles && Array.isArray(parsedData.articles)) {
        window.articles = parsedData.articles;
      }
      if (parsedData.tags && Array.isArray(parsedData.tags)) {
        window.tags = parsedData.tags;
      }
      if (parsedData.cvData && typeof parsedData.cvData === 'object') {
        window.cvData = parsedData.cvData;
      }
      console.log("📦 Données chargées depuis localStorage");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données locales:", error);
    }
  }
  
  console.log("✅ Initialisation des données globales terminée");
