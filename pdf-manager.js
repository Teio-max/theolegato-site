// PDFManager - Gestionnaire de visualisation PDF
// Permet de créer une expérience de lecture PDF avec défilement horizontal et double page

const PDFManager = {
  // Configuration
  config: {
    doublePage: true,        // Affichage en double page par défaut
    initialZoom: 1.0,        // Zoom initial
    minZoom: 0.5,            // Zoom minimum
    maxZoom: 2.5,            // Zoom maximum
    pageGap: 10,             // Espace entre les pages en pixels
    showControls: true,      // Afficher les contrôles de navigation
    preloadPages: 2,         // Nombre de pages à précharger
    allowBookmarks: true,    // Autoriser les signets
    pageTransition: true,    // Animation de transition entre les pages
    pageTurnSpeed: 300       // Vitesse de l'animation en ms
  },
  
  // État interne
  state: {
    currentPDFURL: null,     // URL du PDF actuel
    pdf: null,               // Instance du PDF.js
    currentPage: 1,          // Page actuelle
    totalPages: 0,           // Nombre total de pages
    pageRendering: false,    // Indique si une page est en cours de rendu
    pendingOperation: null,  // Opération en attente
    canvas: null,            // Élément canvas
    container: null,         // Conteneur du viewer
    zoom: 1.0,               // Niveau de zoom actuel
    bookmarks: {},           // Signets pour les PDFs
    viewerMode: 'scroll',    // Mode d'affichage : 'scroll' ou 'book'
    containerWidth: 0,       // Largeur du conteneur
    containerHeight: 0,      // Hauteur du conteneur
    isMoving: false,         // Indique si l'utilisateur est en train de faire glisser
    startX: 0,               // Position X de départ du glissement
    startScrollLeft: 0,      // Position de défilement de départ
    touchStartX: 0,          // Position X de départ pour le tactile
    pageViewports: [],       // Viewports pour chaque page
    pageCanvases: [],        // Canvas pour chaque page
    resizeObserver: null     // Observateur de redimensionnement
  },
  
  // Initialisation du gestionnaire
  init(containerSelector) {
    console.log("🚀 Initialisation de PDFManager");
    
    // Vérifier si pdfjsLib est disponible
    if (typeof pdfjsLib === 'undefined') {
      this.loadPDFJSLibrary()
        .then(() => this.setupViewer(containerSelector))
        .catch(error => {
          console.error("Erreur lors du chargement de PDF.js:", error);
          this.showError("Impossible de charger la bibliothèque PDF.js. Veuillez réessayer.");
        });
    } else {
      this.setupViewer(containerSelector);
    }
  },
  
  // Chargement de la bibliothèque PDF.js
  loadPDFJSLibrary() {
    return new Promise((resolve, reject) => {
      // Créer les éléments script pour PDF.js
      const script1 = document.createElement('script');
      script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script1.integrity = 'sha512-tqaIiFJopq4lTBmFlWF0MNzzTpDsHyug8tJaaY0VkcPMEX5n7hqwvau3nPKaUxU0tGKL7v0CI2Og/KA9kiUEg==';
      script1.crossOrigin = 'anonymous';
      script1.referrerPolicy = 'no-referrer';
      
      script1.onload = () => {
        // Une fois PDF.js chargé, charger le worker
        window.pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        // Charger la CSS pour le viewer
        const style = document.createElement('style');
        style.textContent = `
          .pdf-viewer-container {
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #f0f0f0;
            user-select: none;
          }
          
          .pdf-pages-container {
            display: flex;
            height: 100%;
            position: relative;
            transition: transform 0.3s ease;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
          }
          
          .pdf-page-container {
            margin: 0 5px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            background-color: white;
            position: relative;
          }
          
          .pdf-page {
            display: block;
          }
          
          .pdf-controls {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0,0,0,0.5);
            border-radius: 20px;
            padding: 5px 15px;
            display: flex;
            align-items: center;
            z-index: 100;
          }
          
          .pdf-controls button {
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            margin: 0 5px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: background-color 0.2s;
          }
          
          .pdf-controls button:hover {
            background-color: rgba(255,255,255,0.2);
          }
          
          .pdf-page-info {
            color: white;
            margin: 0 10px;
          }
          
          .pdf-loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #333;
            background-color: rgba(255,255,255,0.8);
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          
          /* Mode livre */
          .pdf-viewer-book-mode .pdf-pages-container {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .pdf-viewer-book-mode .pdf-page-spread {
            display: flex;
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            margin: 0 auto;
          }
          
          .pdf-viewer-book-mode .pdf-page-container {
            margin: 0;
            box-shadow: none;
          }
          
          /* Animations */
          @keyframes pageTurn {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          
          .page-turning {
            animation: pageTurn 0.3s ease-in-out;
          }
        `;
        document.head.appendChild(style);
        
        resolve();
      };
      
      script1.onerror = () => {
        reject(new Error("Erreur lors du chargement de PDF.js"));
      };
      
      document.head.appendChild(script1);
    });
  },
  
  // Configuration du visualiseur
  setupViewer(containerSelector) {
    // Trouver le conteneur
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.error(`Conteneur ${containerSelector} non trouvé`);
      return;
    }
    
    this.state.container = container;
    
    // Créer la structure du visualiseur
    container.innerHTML = `
      <div class="pdf-viewer-container">
        <div class="pdf-pages-container"></div>
        <div class="pdf-controls" style="display:none;">
          <button id="pdf-prev-page" title="Page précédente">◀</button>
          <span class="pdf-page-info">Page <span id="pdf-current-page">0</span> / <span id="pdf-total-pages">0</span></span>
          <button id="pdf-next-page" title="Page suivante">▶</button>
          <button id="pdf-zoom-out" title="Zoom arrière">➖</button>
          <span id="pdf-zoom-level">100%</span>
          <button id="pdf-zoom-in" title="Zoom avant">➕</button>
          <button id="pdf-toggle-mode" title="Changer de mode">📖</button>
        </div>
        <div class="pdf-loading" style="display:none;">Chargement...</div>
      </div>
    `;
    
    // Récupérer les éléments
    this.state.pagesContainer = container.querySelector('.pdf-pages-container');
    this.state.controls = container.querySelector('.pdf-controls');
    this.state.loading = container.querySelector('.pdf-loading');
    
    // Initialiser les dimensions du conteneur
    this.updateContainerDimensions();
    
    // Ajouter les gestionnaires d'événements
    this.attachEventListeners();
    
    // Observer les changements de taille du conteneur
    this.setupResizeObserver();
  },
  
  // Chargement d'un PDF
  loadPDF(url) {
    console.log(`📄 Chargement du PDF: ${url}`);
    
    // Vérifier si l'URL est valide
    if (!url) {
      this.showError("URL du PDF non spécifiée");
      return;
    }
    
    // Afficher le chargement
    this.showLoading(true);
    
    // Mettre à jour l'état
    this.state.currentPDFURL = url;
    this.state.currentPage = 1;
    this.state.totalPages = 0;
    this.state.pdf = null;
    this.state.pageViewports = [];
    this.state.pageCanvases = [];
    
    // Vider le conteneur de pages
    this.state.pagesContainer.innerHTML = '';
    
    // Vérifier si pdfjsLib est disponible
    if (typeof pdfjsLib === 'undefined') {
      this.showError("Bibliothèque PDF.js non chargée");
      return;
    }
    
    // Charger le document PDF
    const loadingTask = pdfjsLib.getDocument(url);
    
    loadingTask.promise.then(pdf => {
      console.log(`PDF chargé, ${pdf.numPages} pages`);
      this.state.pdf = pdf;
      this.state.totalPages = pdf.numPages;
      
      // Mettre à jour l'interface
      const totalPagesElement = document.getElementById('pdf-total-pages');
      if (totalPagesElement) {
        totalPagesElement.textContent = pdf.numPages;
      }
      
      // Afficher les contrôles
      if (this.config.showControls) {
        this.state.controls.style.display = 'flex';
      }
      
      // Charger les pages initiales
      this.renderPDFPages();
    }).catch(error => {
      console.error("Erreur lors du chargement du PDF:", error);
      this.showError(`Erreur lors du chargement du PDF: ${error.message}`);
    });
  },
  
  // Rendu des pages du PDF
  renderPDFPages() {
    if (!this.state.pdf) return;
    
    this.showLoading(true);
    
    // Déterminer quelles pages doivent être rendues
    let pagesToRender;
    
    if (this.state.viewerMode === 'book' && this.config.doublePage) {
      // Mode livre (double page)
      pagesToRender = [];
      const startPage = Math.floor((this.state.currentPage - 1) / 2) * 2 + 1;
      pagesToRender.push(startPage);
      
      if (startPage + 1 <= this.state.totalPages) {
        pagesToRender.push(startPage + 1);
      }
    } else {
      // Mode défilement ou page unique
      pagesToRender = [this.state.currentPage];
      
      // Précharger quelques pages supplémentaires
      for (let i = 1; i <= this.config.preloadPages; i++) {
        const nextPage = this.state.currentPage + i;
        if (nextPage <= this.state.totalPages) {
          pagesToRender.push(nextPage);
        }
        
        const prevPage = this.state.currentPage - i;
        if (prevPage >= 1) {
          pagesToRender.push(prevPage);
        }
      }
    }
    
    // Trier les pages pour les rendre dans l'ordre
    pagesToRender.sort((a, b) => a - b);
    
    // Vider le conteneur existant si on est en mode livre
    if (this.state.viewerMode === 'book') {
      this.state.pagesContainer.innerHTML = '';
    }
    
    // Créer un élément pour la propagation (mode livre)
    let pageSpread;
    if (this.state.viewerMode === 'book' && this.config.doublePage) {
      pageSpread = document.createElement('div');
      pageSpread.className = 'pdf-page-spread';
      this.state.pagesContainer.appendChild(pageSpread);
    }
    
    // Rendre chaque page
    const renderPromises = pagesToRender.map(pageNum => {
      return this.renderPage(pageNum, pageSpread);
    });
    
    // Une fois toutes les pages rendues
    Promise.all(renderPromises).then(() => {
      this.showLoading(false);
      
      // Mettre à jour l'interface
      const currentPageElement = document.getElementById('pdf-current-page');
      if (currentPageElement) {
        currentPageElement.textContent = this.state.currentPage;
      }
      
      // Faire défiler jusqu'à la page actuelle en mode défilement
      if (this.state.viewerMode === 'scroll') {
        const pageElement = this.state.pagesContainer.querySelector(`.pdf-page-container[data-page="${this.state.currentPage}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }
    }).catch(error => {
      console.error("Erreur lors du rendu des pages:", error);
      this.showError(`Erreur lors du rendu des pages: ${error.message}`);
    });
  },
  
  // Rendu d'une page spécifique
  renderPage(pageNum, pageSpread = null) {
    return new Promise((resolve, reject) => {
      // Vérifier si la page existe déjà dans le conteneur
      const existingPage = this.state.pagesContainer.querySelector(`.pdf-page-container[data-page="${pageNum}"]`);
      if (existingPage && this.state.viewerMode === 'scroll') {
        resolve();
        return;
      }
      
      // Récupérer la page du PDF
      this.state.pdf.getPage(pageNum).then(page => {
        // Créer un conteneur pour la page
        const pageContainer = document.createElement('div');
        pageContainer.className = 'pdf-page-container';
        pageContainer.dataset.page = pageNum;
        
        // Créer un canvas pour la page
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page';
        pageContainer.appendChild(canvas);
        
        // Obtenir le contexte du canvas
        const context = canvas.getContext('2d');
        
        // Calculer l'échelle en fonction du mode d'affichage
        let scale = this.state.zoom;
        
        // En mode livre, adapter la taille au conteneur
        if (this.state.viewerMode === 'book') {
          let containerWidth = this.state.containerWidth;
          if (this.config.doublePage) {
            containerWidth = containerWidth / 2 - this.config.pageGap;
          }
          
          const viewport = page.getViewport({ scale: 1 });
          scale = containerWidth / viewport.width;
        }
        
        // Obtenir le viewport avec l'échelle
        const viewport = page.getViewport({ scale });
        
        // Définir les dimensions du canvas
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Stocker le viewport pour cette page
        this.state.pageViewports[pageNum] = viewport;
        this.state.pageCanvases[pageNum] = canvas;
        
        // Rendu de la page
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        renderTask.promise.then(() => {
          // Ajouter la page au conteneur approprié
          if (this.state.viewerMode === 'book' && this.config.doublePage && pageSpread) {
            pageSpread.appendChild(pageContainer);
          } else {
            this.state.pagesContainer.appendChild(pageContainer);
          }
          
          resolve();
        }).catch(error => {
          console.error(`Erreur lors du rendu de la page ${pageNum}:`, error);
          reject(error);
        });
      }).catch(error => {
        console.error(`Erreur lors du chargement de la page ${pageNum}:`, error);
        reject(error);
      });
    });
  },
  
  // Navigation vers une page spécifique
  goToPage(pageNum) {
    if (!this.state.pdf) return;
    
    // Valider le numéro de page
    pageNum = Math.max(1, Math.min(pageNum, this.state.totalPages));
    
    // Si on est déjà sur cette page, ne rien faire
    if (pageNum === this.state.currentPage) return;
    
    // Mettre à jour l'état
    this.state.currentPage = pageNum;
    
    // Mettre à jour l'affichage selon le mode
    if (this.state.viewerMode === 'book') {
      this.renderPDFPages();
    } else {
      // En mode défilement, faire défiler jusqu'à la page
      const pageElement = this.state.pagesContainer.querySelector(`.pdf-page-container[data-page="${pageNum}"]`);
      
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      } else {
        // Si la page n'est pas encore rendue, la rendre
        this.renderPDFPages();
      }
      
      // Mettre à jour l'interface
      const currentPageElement = document.getElementById('pdf-current-page');
      if (currentPageElement) {
        currentPageElement.textContent = pageNum;
      }
    }
  },
  
  // Aller à la page précédente
  prevPage() {
    if (this.state.currentPage > 1) {
      if (this.state.viewerMode === 'book' && this.config.doublePage) {
        // En mode livre double page, reculer de 2 pages
        this.goToPage(Math.max(1, this.state.currentPage - 2));
      } else {
        this.goToPage(this.state.currentPage - 1);
      }
    }
  },
  
  // Aller à la page suivante
  nextPage() {
    if (this.state.currentPage < this.state.totalPages) {
      if (this.state.viewerMode === 'book' && this.config.doublePage) {
        // En mode livre double page, avancer de 2 pages
        this.goToPage(Math.min(this.state.totalPages, this.state.currentPage + 2));
      } else {
        this.goToPage(this.state.currentPage + 1);
      }
    }
  },
  
  // Zoom avant
  zoomIn() {
    if (this.state.zoom < this.config.maxZoom) {
      this.setZoom(this.state.zoom + 0.1);
    }
  },
  
  // Zoom arrière
  zoomOut() {
    if (this.state.zoom > this.config.minZoom) {
      this.setZoom(this.state.zoom - 0.1);
    }
  },
  
  // Définir un niveau de zoom
  setZoom(zoomLevel) {
    // Limiter le zoom aux valeurs min et max
    zoomLevel = Math.max(this.config.minZoom, Math.min(zoomLevel, this.config.maxZoom));
    
    // Mettre à jour l'état
    this.state.zoom = zoomLevel;
    
    // Mettre à jour l'interface
    const zoomLevelElement = document.getElementById('pdf-zoom-level');
    if (zoomLevelElement) {
      zoomLevelElement.textContent = `${Math.round(zoomLevel * 100)}%`;
    }
    
    // Mettre à jour les pages
    this.renderPDFPages();
  },
  
  // Basculer entre les modes d'affichage
  toggleViewMode() {
    this.state.viewerMode = this.state.viewerMode === 'scroll' ? 'book' : 'scroll';
    
    // Mettre à jour les classes CSS
    if (this.state.viewerMode === 'book') {
      this.state.container.querySelector('.pdf-viewer-container').classList.add('pdf-viewer-book-mode');
    } else {
      this.state.container.querySelector('.pdf-viewer-container').classList.remove('pdf-viewer-book-mode');
    }
    
    // Réinitialiser le conteneur de pages
    this.state.pagesContainer.innerHTML = '';
    this.state.pagesContainer.scrollLeft = 0;
    
    // Mettre à jour le rendu
    this.renderPDFPages();
  },
  
  // Gestion des événements
  attachEventListeners() {
    // Boutons de navigation
    const prevButton = document.getElementById('pdf-prev-page');
    const nextButton = document.getElementById('pdf-next-page');
    const zoomInButton = document.getElementById('pdf-zoom-in');
    const zoomOutButton = document.getElementById('pdf-zoom-out');
    const toggleModeButton = document.getElementById('pdf-toggle-mode');
    
    if (prevButton) prevButton.addEventListener('click', () => this.prevPage());
    if (nextButton) nextButton.addEventListener('click', () => this.nextPage());
    if (zoomInButton) zoomInButton.addEventListener('click', () => this.zoomIn());
    if (zoomOutButton) zoomOutButton.addEventListener('click', () => this.zoomOut());
    if (toggleModeButton) toggleModeButton.addEventListener('click', () => this.toggleViewMode());
    
    // Défilement avec la molette
    this.state.pagesContainer.addEventListener('wheel', (e) => {
      if (this.state.viewerMode === 'scroll') return; // Le défilement natif s'en occupe
      
      // En mode livre, utiliser la molette pour changer de page
      if (e.deltaX > 0 || e.deltaY > 0) {
        this.nextPage();
      } else if (e.deltaX < 0 || e.deltaY < 0) {
        this.prevPage();
      }
      
      e.preventDefault();
    });
    
    // Gestion du défilement pour détecter la page actuelle en mode scroll
    this.state.pagesContainer.addEventListener('scroll', () => {
      if (this.state.viewerMode !== 'scroll') return;
      
      // Trouver la page la plus visible
      const pageElements = this.state.pagesContainer.querySelectorAll('.pdf-page-container');
      if (!pageElements.length) return;
      
      let mostVisiblePage = null;
      let maxVisibleWidth = 0;
      
      const containerLeft = this.state.pagesContainer.scrollLeft;
      const containerWidth = this.state.pagesContainer.clientWidth;
      const containerRight = containerLeft + containerWidth;
      
      Array.from(pageElements).forEach(pageElement => {
        const rect = pageElement.getBoundingClientRect();
        const pageLeft = pageElement.offsetLeft;
        const pageRight = pageLeft + rect.width;
        
        // Calculer l'intersection
        const overlapLeft = Math.max(containerLeft, pageLeft);
        const overlapRight = Math.min(containerRight, pageRight);
        const overlapWidth = Math.max(0, overlapRight - overlapLeft);
        
        if (overlapWidth > maxVisibleWidth) {
          maxVisibleWidth = overlapWidth;
          mostVisiblePage = parseInt(pageElement.dataset.page);
        }
      });
      
      if (mostVisiblePage && mostVisiblePage !== this.state.currentPage) {
        // Mettre à jour la page actuelle sans re-rendre
        this.state.currentPage = mostVisiblePage;
        
        // Mettre à jour l'interface
        const currentPageElement = document.getElementById('pdf-current-page');
        if (currentPageElement) {
          currentPageElement.textContent = mostVisiblePage;
        }
      }
    }, { passive: true });
    
    // Gestion du glisser-déposer en mode livre
    this.state.pagesContainer.addEventListener('mousedown', (e) => {
      if (this.state.viewerMode !== 'book') return;
      
      this.state.isMoving = true;
      this.state.startX = e.clientX;
      this.state.startScrollLeft = this.state.pagesContainer.scrollLeft;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.state.isMoving) return;
      
      const dx = e.clientX - this.state.startX;
      this.state.pagesContainer.scrollLeft = this.state.startScrollLeft - dx;
    });
    
    document.addEventListener('mouseup', () => {
      this.state.isMoving = false;
    });
    
    // Support tactile
    this.state.pagesContainer.addEventListener('touchstart', (e) => {
      if (this.state.viewerMode !== 'book') return;
      
      this.state.touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    this.state.pagesContainer.addEventListener('touchmove', (e) => {
      if (this.state.viewerMode !== 'book') return;
      
      const touchCurrentX = e.touches[0].clientX;
      const diff = this.state.touchStartX - touchCurrentX;
      
      // Si le mouvement est significatif
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextPage();
        } else {
          this.prevPage();
        }
        
        this.state.touchStartX = touchCurrentX;
      }
    }, { passive: true });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (!this.state.pdf) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          this.prevPage();
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.nextPage();
          e.preventDefault();
          break;
        case '+':
          this.zoomIn();
          e.preventDefault();
          break;
        case '-':
          this.zoomOut();
          e.preventDefault();
          break;
        case 'Home':
          this.goToPage(1);
          e.preventDefault();
          break;
        case 'End':
          this.goToPage(this.state.totalPages);
          e.preventDefault();
          break;
      }
    });
  },
  
  // Mise à jour des dimensions du conteneur
  updateContainerDimensions() {
    if (!this.state.container) return;
    
    const rect = this.state.container.getBoundingClientRect();
    this.state.containerWidth = rect.width;
    this.state.containerHeight = rect.height;
  },
  
  // Configurer l'observateur de redimensionnement
  setupResizeObserver() {
    if (!window.ResizeObserver) return;
    
    this.state.resizeObserver = new ResizeObserver(entries => {
      this.updateContainerDimensions();
      
      // Si un PDF est chargé, mettre à jour le rendu
      if (this.state.pdf) {
        this.renderPDFPages();
      }
    });
    
    this.state.resizeObserver.observe(this.state.container);
  },
  
  // Afficher ou masquer l'indicateur de chargement
  showLoading(show) {
    if (this.state.loading) {
      this.state.loading.style.display = show ? 'block' : 'none';
    }
  },
  
  // Afficher un message d'erreur
  showError(message) {
    console.error("Erreur PDF:", message);
    this.showLoading(false);
    
    // Créer un élément d'erreur s'il n'existe pas
    let errorElement = this.state.container.querySelector('.pdf-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'pdf-error';
      errorElement.style.position = 'absolute';
      errorElement.style.top = '50%';
      errorElement.style.left = '50%';
      errorElement.style.transform = 'translate(-50%, -50%)';
      errorElement.style.color = 'white';
      errorElement.style.backgroundColor = 'rgba(220, 53, 69, 0.85)';
      errorElement.style.padding = '10px 20px';
      errorElement.style.borderRadius = '5px';
      errorElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      errorElement.style.zIndex = '100';
      this.state.container.querySelector('.pdf-viewer-container').appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Masquer après un délai
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  },
  
  // Créer un nouveau visualiseur CV avec un PDF spécifié
  createCVViewer(containerSelector, pdfUrl) {
    this.init(containerSelector);
    
    // Attendre un court instant pour s'assurer que l'initialisation est terminée
    setTimeout(() => {
      this.loadPDF(pdfUrl);
    }, 200);
    
    return {
      refresh: () => this.renderPDFPages(),
      goToPage: (page) => this.goToPage(page),
      prevPage: () => this.prevPage(),
      nextPage: () => this.nextPage(),
      zoomIn: () => this.zoomIn(),
      zoomOut: () => this.zoomOut(),
      toggleViewMode: () => this.toggleViewMode()
    };
  }
};

// Exposer au contexte global
window.PDFManager = PDFManager;
