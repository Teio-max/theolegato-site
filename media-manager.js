// MediaManager - Gestionnaire avancé de médias pour le site
// Permet de gérer facilement l'upload, la compression et l'affichage des images

const MediaManager = {
  // Configuration
  config: {
    uploadDirectories: {
      films: 'images/films',
      mangas: 'images/mangas',
      articles: 'images/articles',
      icons: 'icons'
    },
    compression: {
      defaultMaxWidth: 800,
      defaultQuality: 0.85,
      thumbnailMaxWidth: 400,
      thumbnailQuality: 0.7
    },
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // État du gestionnaire
  state: {
    uploads: {},
    pendingUploads: 0
  },
  
  // Initialiser le gestionnaire
  init() {
    console.log("🚀 Initialisation de MediaManager");
  },
  
  // Vérifier si un fichier est une image valide
  isValidImage(file) {
    if (!file) return false;
    return this.config.allowedTypes.includes(file.type);
  },
  
  // Générer un nom de fichier sécurisé et unique
  generateSafeFileName(file, prefix = '') {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    return `${prefix}${timestamp}_${safeName}`;
  },
  
  // Comprimer une image
  async compressImage(file, maxWidth = this.config.compression.defaultMaxWidth, quality = this.config.compression.defaultQuality) {
    if (!file) {
      throw new Error("Aucun fichier fourni pour la compression");
    }
    
    if (!this.isValidImage(file)) {
      throw new Error("Le fichier n'est pas une image valide");
    }
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Déterminer le type MIME de sortie
        let outputType = file.type;
        if (outputType === 'image/png' && quality < 1) {
          // Convertir les PNG en JPEG pour une meilleure compression si qualité < 1
          outputType = 'image/jpeg';
        }
        
        canvas.toBlob(
          blob => resolve(new File([blob], file.name, { type: outputType })),
          outputType,
          quality
        );
      };
      
      img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
      img.src = URL.createObjectURL(file);
    });
  },
  
  // Créer une miniature d'une image
  async createThumbnail(file) {
    return this.compressImage(
      file,
      this.config.compression.thumbnailMaxWidth,
      this.config.compression.thumbnailQuality
    );
  },
  
  // Uploader une image sur GitHub
  async uploadImage(file, directory = this.config.uploadDirectories.films, maxWidth = this.config.compression.defaultMaxWidth, quality = this.config.compression.defaultQuality) {
    if (!file) {
      throw new Error("Aucun fichier fourni pour l'upload");
    }
    
    if (!this.isValidImage(file)) {
      throw new Error("Le fichier n'est pas une image valide");
    }
    
    // Vérifier la configuration GitHub
    if (typeof GITHUB_CONFIG === 'undefined' || !GITHUB_CONFIG.token) {
      throw new Error("Configuration GitHub manquante ou token non défini");
    }
    
    try {
      // Incrémenter le compteur d'uploads en attente
      this.state.pendingUploads++;
      
      // Compresser l'image
      const compressedFile = await this.compressImage(file, maxWidth, quality);
      
      // Générer un nom de fichier sécurisé
      const dirName = directory.split('/').pop();
      const fileName = this.generateSafeFileName(file, `${dirName}_`);
      const filePath = `${directory}/${fileName}`;
      
      // Convertir en base64 pour GitHub
      const base64Content = await this.fileToBase64(compressedFile);
      
      // Préparer l'ID d'upload pour le suivi
      const uploadId = `upload_${Date.now()}`;
      this.state.uploads[uploadId] = {
        status: 'pending',
        fileName,
        filePath,
        startTime: Date.now()
      };
      
      // Appeler l'API GitHub
      const response = await fetch(`https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_CONFIG.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `📸 Upload: ${fileName}`,
          content: base64Content,
          branch: GITHUB_CONFIG.branch || 'main'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
      }
      
      const result = await response.json();
      
      // Mettre à jour le statut de l'upload
      this.state.uploads[uploadId] = {
        ...this.state.uploads[uploadId],
        status: 'success',
        endTime: Date.now(),
        downloadUrl: result.content.download_url
      };
      
      // Décrémenter le compteur d'uploads en attente
      this.state.pendingUploads--;
      
      return result.content.download_url;
    } catch (error) {
      // Décrémenter le compteur d'uploads en attente
      this.state.pendingUploads--;
      console.error("Erreur upload:", error);
      throw error;
    }
  },
  
  // Convertir un fichier en Base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Content = e.target.result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  },
  
  // Uploader plusieurs images
  async uploadMultipleImages(files, directory = this.config.uploadDirectories.films, maxWidth = this.config.compression.defaultMaxWidth, quality = this.config.compression.defaultQuality) {
    if (!files || files.length === 0) {
      throw new Error("Aucun fichier fourni pour l'upload multiple");
    }
    
    const uploadPromises = Array.from(files).map(file => {
      if (this.isValidImage(file)) {
        return this.uploadImage(file, directory, maxWidth, quality)
          .then(url => ({ file: file.name, url, success: true }))
          .catch(error => ({ file: file.name, error: error.message, success: false }));
      } else {
        return Promise.resolve({ file: file.name, error: "Type de fichier non supporté", success: false });
      }
    });
    
    return Promise.all(uploadPromises);
  },
  
  // Créer un aperçu d'image
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      if (!this.isValidImage(file)) {
        reject(new Error("Le fichier n'est pas une image valide"));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  },
  
  // Insérer un aperçu d'image dans un élément
  async insertImagePreview(file, container) {
    if (!container) {
      throw new Error("Aucun conteneur fourni pour l'aperçu");
    }
    
    try {
      const previewUrl = await this.createImagePreview(file);
      
      // Créer l'élément d'aperçu
      const previewElement = document.createElement('div');
      previewElement.className = 'image-preview';
      previewElement.style.marginTop = '10px';
      previewElement.style.border = '1px solid #ACA899';
      previewElement.style.padding = '8px';
      previewElement.style.background = '#fff';
      
      previewElement.innerHTML = `
        <p style="margin:0 0 5px 0;font-weight:bold;">Aperçu de l'image:</p>
        <img src="${previewUrl}" alt="Aperçu" style="max-width:200px;max-height:120px;">
      `;
      
      // Vider le conteneur puis ajouter l'aperçu
      container.innerHTML = '';
      container.appendChild(previewElement);
      
      return previewUrl;
    } catch (error) {
      console.error("Erreur aperçu:", error);
      throw error;
    }
  },
  
  // Vérifier si des uploads sont en cours
  hasActiveUploads() {
    return this.state.pendingUploads > 0;
  },
  
  // Obtenir le nombre d'uploads en cours
  getPendingUploadsCount() {
    return this.state.pendingUploads;
  }
};

// Initialiser le gestionnaire quand le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
  console.log("🚀 Initialisation de MediaManager");
  MediaManager.init();
});
