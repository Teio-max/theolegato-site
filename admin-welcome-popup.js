// Module pour configurer le popup de bienvenue dans le panneau d'administration
console.log("🔧 Chargement du module de configuration du popup de bienvenue");

// Étendre AdminManager avec des fonctionnalités de configuration de popup
(function() {
  // Vérifier si AdminManager existe
  if (typeof window.AdminManager === 'undefined') {
    console.error("❌ AdminManager n'est pas défini.");
    return;
  }
  
  // Ajouter la fonction de chargement de la configuration du popup de bienvenue
  AdminManager.loadWelcomePopupConfig = function() {
    console.log("📝 Chargement de la configuration du popup de bienvenue");
    this.state.activeTab = 'welcome-popup';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Obtenir la configuration actuelle
    let config = {
      title: "Bienvenue sur mon site",
      name: "Théo Legato",
      description: "Développeur web et cinéaste passionné. Bienvenue sur mon portfolio où vous découvrirez mes projets, films et articles.",
      buttonText: "Découvrir le site",
      avatarImage: "avatar.jpg",
      socialLinks: [
        { name: 'Letterboxd', icon: 'letterboxd.png', url: 'https://letterboxd.com/theolegato/' },
        { name: 'GitHub', icon: 'icons/github.png', url: 'https://github.com/theolegato' },
        { name: 'LinkedIn', icon: 'icons/linkedin.png', url: 'https://linkedin.com/in/theolegato' },
        { name: 'Twitter', icon: 'icons/twitter.png', url: 'https://twitter.com/theolegato' }
      ]
    };
    
    // Utiliser la configuration depuis DataManager si disponible
    if (window.DataManager && window.DataManager.data && window.DataManager.data.welcomePopupConfig) {
      config = window.DataManager.data.welcomePopupConfig;
    }
    
    // Générer les champs de saisie pour les liens sociaux
    let socialLinksHTML = '';
    if (config.socialLinks && Array.isArray(config.socialLinks)) {
      config.socialLinks.forEach((link, index) => {
        socialLinksHTML += `
          <div class="social-link-item" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 4px; background-color: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 14px;">Lien social ${index + 1}</h4>
              <button class="btn-remove-social" data-index="${index}" style="background: #ff5a52; border: 1px solid #e33e38; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer;">Supprimer</button>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">Nom :</label>
              <input type="text" class="social-name" value="${link.name || ''}" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">URL de l'icône :</label>
              <input type="text" class="social-icon" value="${link.icon || ''}" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">URL du lien :</label>
              <input type="text" class="social-url" value="${link.url || ''}" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
          </div>
        `;
      });
    }
    
    // Générer le HTML du formulaire
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Configuration du Popup de Bienvenue
      </h3>
      
      <div style="display: flex; gap: 20px; margin-bottom: 20px;">
        <div style="flex: 1;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Titre de la fenêtre :</label>
            <input type="text" id="welcome-title" value="${config.title || ''}" style="width: 100%; padding: 8px; border: 1px solid #ACA899;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nom :</label>
            <input type="text" id="welcome-name" value="${config.name || ''}" style="width: 100%; padding: 8px; border: 1px solid #ACA899;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Description :</label>
            <textarea id="welcome-description" style="width: 100%; padding: 8px; border: 1px solid #ACA899; height: 100px;">${config.description || ''}</textarea>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Texte du bouton :</label>
            <input type="text" id="welcome-button-text" value="${config.buttonText || ''}" style="width: 100%; padding: 8px; border: 1px solid #ACA899;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Image avatar (URL) :</label>
            <input type="text" id="welcome-avatar" value="${config.avatarImage || ''}" style="width: 100%; padding: 8px; border: 1px solid #ACA899;">
          </div>
        </div>
        
        <div style="flex: 1; border-left: 1px solid #ccc; padding-left: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0;">Liens sociaux</h4>
            <button id="btn-add-social" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Ajouter un lien</button>
          </div>
          
          <div id="social-links-container">
            ${socialLinksHTML}
          </div>
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: right;">
        <button id="btn-test-welcome" style="background: #2196F3; color: white; border: none; padding: 8px 15px; margin-right: 10px; border-radius: 3px; cursor: pointer;">Tester</button>
        <button id="btn-save-welcome" style="background: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 3px; cursor: pointer;">Enregistrer</button>
      </div>
    `;
    
    // Ajouter les écouteurs d'événements
    this.initWelcomePopupEvents();
  };
  
  // Initialiser les événements pour la configuration du popup
  AdminManager.initWelcomePopupEvents = function() {
    // Ajouter un lien social
    const addSocialBtn = document.getElementById('btn-add-social');
    if (addSocialBtn) {
      addSocialBtn.addEventListener('click', () => {
        const container = document.getElementById('social-links-container');
        if (!container) return;
        
        const index = document.querySelectorAll('.social-link-item').length;
        const newLinkHTML = `
          <div class="social-link-item" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 4px; background-color: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 14px;">Nouveau lien social</h4>
              <button class="btn-remove-social" data-index="${index}" style="background: #ff5a52; border: 1px solid #e33e38; color: white; padding: 2px 6px; border-radius: 3px; cursor: pointer;">Supprimer</button>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">Nom :</label>
              <input type="text" class="social-name" value="" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
            <div style="margin-bottom: 8px;">
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">URL de l'icône :</label>
              <input type="text" class="social-icon" value="" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 3px; font-size: 12px;">URL du lien :</label>
              <input type="text" class="social-url" value="" style="width: 100%; padding: 5px; box-sizing: border-box;">
            </div>
          </div>
        `;
        
        container.innerHTML += newLinkHTML;
        this.initRemoveSocialButtons();
      });
    }
    
    // Initialiser les boutons de suppression existants
    this.initRemoveSocialButtons();
    
    // Enregistrer la configuration
    const saveBtn = document.getElementById('btn-save-welcome');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const config = this.collectWelcomePopupConfig();
        this.saveWelcomePopupConfig(config);
      });
    }
    
    // Tester le popup
    const testBtn = document.getElementById('btn-test-welcome');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        const config = this.collectWelcomePopupConfig();
        this.testWelcomePopup(config);
      });
    }
  };
  
  // Initialiser les boutons de suppression des liens sociaux
  AdminManager.initRemoveSocialButtons = function() {
    const removeButtons = document.querySelectorAll('.btn-remove-social');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Trouver l'élément parent à supprimer
        const socialLinkItem = e.target.closest('.social-link-item');
        if (socialLinkItem) {
          socialLinkItem.remove();
        }
      });
    });
  };
  
  // Collecter la configuration du popup à partir des champs de formulaire
  AdminManager.collectWelcomePopupConfig = function() {
    const title = document.getElementById('welcome-title')?.value || 'Bienvenue sur mon site';
    const name = document.getElementById('welcome-name')?.value || 'Théo Legato';
    const description = document.getElementById('welcome-description')?.value || '';
    const buttonText = document.getElementById('welcome-button-text')?.value || 'Découvrir le site';
    const avatarImage = document.getElementById('welcome-avatar')?.value || 'avatar.jpg';
    
    // Collecter les liens sociaux
    const socialLinks = [];
    const socialItems = document.querySelectorAll('.social-link-item');
    socialItems.forEach(item => {
      const nameInput = item.querySelector('.social-name');
      const iconInput = item.querySelector('.social-icon');
      const urlInput = item.querySelector('.social-url');
      
      if (nameInput && iconInput && urlInput) {
        socialLinks.push({
          name: nameInput.value,
          icon: iconInput.value,
          url: urlInput.value
        });
      }
    });
    
    return {
      title,
      name,
      description,
      buttonText,
      avatarImage,
      socialLinks
    };
  };
  
  // Sauvegarder la configuration dans DataManager
  AdminManager.saveWelcomePopupConfig = function(config) {
    if (!window.DataManager) {
      console.error("❌ DataManager n'est pas disponible");
      alert("Erreur : Impossible d'enregistrer la configuration. DataManager n'est pas disponible.");
      return;
    }
    
    // Mettre à jour les données dans DataManager
    if (!window.DataManager.data) {
      window.DataManager.data = {};
    }
    
    window.DataManager.data.welcomePopupConfig = config;
    
    // Sauvegarder les données
    if (typeof window.DataManager.saveData === 'function') {
      window.DataManager.saveData()
        .then(() => {
          alert("Configuration du popup de bienvenue enregistrée avec succès !");
        })
        .catch(error => {
          console.error("❌ Erreur lors de l'enregistrement:", error);
          alert("Erreur lors de l'enregistrement. Vérifiez la console pour plus de détails.");
        });
    } else {
      alert("Configuration mise à jour. Note: La fonction de sauvegarde permanente n'est pas disponible.");
    }
  };
  
  // Tester le popup avec la configuration actuelle
  AdminManager.testWelcomePopup = function(config) {
    // Sauvegarder temporairement la configuration
    const originalConfig = window.DataManager?.data?.welcomePopupConfig;
    if (window.DataManager && window.DataManager.data) {
      window.DataManager.data.welcomePopupConfig = config;
    }
    
    // Réinitialiser l'état du popup
    window.welcomePopupShown = false;
    
    // Afficher le popup
    if (typeof window.showWelcomePopup === 'function') {
      window.showWelcomePopup();
    } else {
      alert("Erreur: La fonction showWelcomePopup n'est pas disponible");
    }
    
    // Restaurer la configuration originale
    if (window.DataManager && window.DataManager.data) {
      window.DataManager.data.welcomePopupConfig = originalConfig;
    }
  };
  
})();
