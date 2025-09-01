// Module de gestion du panneau d'administration pour le bureau
// Extension pour l'Admin Panel Manager

// Fonction à ajouter à l'objet AdminPanelManager
const DesktopManagerAdmin = {
  // Chargement du gestionnaire du bureau
  loadDesktopManager() {
    console.log('🖥️ Chargement du gestionnaire de bureau');
    this.state.activeTab = 'desktop-manager';
    
    const contentDiv = document.getElementById('admin-content');
    if (!contentDiv) return;
    
    // Vérifier si les icônes du bureau sont disponibles
    if (typeof window.desktopIcons === 'undefined') {
      window.desktopIcons = {
        defaultIcons: [
          { id: 'films', name: 'Films', icon: 'icons/film.png', x: 20, y: 20, visible: true },
          { id: 'articles', name: 'Articles', icon: 'icons/article.png', x: 20, y: 100, visible: true },
          { id: 'cv', name: 'CV', icon: 'icons/cv.png', x: 20, y: 180, visible: true },
          { id: 'mangas', name: 'Mangas', icon: 'icons/portfolio.png', x: 20, y: 260, visible: false },
          { id: 'info', name: 'À propos', icon: 'icons/info.png', x: 20, y: 340, visible: true }
        ],
        customIcons: []
      };
    }
    
    // Générer le HTML
    contentDiv.innerHTML = `
      <h3 style="color:#0058a8;margin-top:0;border-bottom:1px solid #ACA899;padding-bottom:5px;margin-bottom:15px;">
        Gestion du bureau
      </h3>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="desktop-preview-section">
          <h4 style="color:#333;margin-top:0;">Aperçu du bureau</h4>
          
          <div class="desktop-preview" style="border:1px solid #ACA899;border-radius:3px;height:500px;position:relative;background-image:url('fond.jpg');background-size:cover;background-position:center;overflow:hidden;">
            ${this.generateDesktopPreview()}
          </div>
          
          <div style="margin-top:15px;">
            <button id="restore-defaults-btn" style="background:#ECE9D8;border:1px solid #ACA899;padding:6px 12px;border-radius:3px;cursor:pointer;">
              Restaurer les icônes par défaut
            </button>
          </div>
        </div>
        
        <div class="desktop-manager-section">
          <h4 style="color:#333;margin-top:0;">Gestion des icônes</h4>
          
          <div class="icons-list" style="border:1px solid #ACA899;border-radius:3px;max-height:300px;overflow-y:auto;margin-bottom:15px;">
            <div style="background:#ECE9D8;padding:8px;font-weight:bold;display:grid;grid-template-columns:40px auto 80px 80px;">
              <div>Icône</div>
              <div>Nom</div>
              <div>Visible</div>
              <div>Actions</div>
            </div>
            
            <div id="icons-container">
              ${this.generateIconsList()}
            </div>
          </div>
          
          <h4 style="color:#333;margin-top:15px;">Ajouter/Modifier une icône</h4>
          
          <form id="icon-form" style="border:1px solid #ACA899;border-radius:3px;padding:15px;background:#f8f8f8;">
            <input type="hidden" id="icon-id" value="">
            <input type="hidden" id="icon-type" value="custom">
            
            <div style="margin-bottom:15px;">
              <label for="icon-name" style="display:block;margin-bottom:5px;font-weight:bold;">Nom</label>
              <input type="text" id="icon-name" name="name" 
                style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;" required>
            </div>
            
            <div style="margin-bottom:15px;">
              <label for="icon-path" style="display:block;margin-bottom:5px;font-weight:bold;">Icône</label>
              <select id="icon-path" name="icon" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                <option value="icons/film.png">Film</option>
                <option value="icons/article.png">Article</option>
                <option value="icons/cv.png">CV</option>
                <option value="icons/portfolio.png">Portfolio</option>
                <option value="icons/info.png">Info</option>
                <option value="icons/email.png">Email</option>
                <option value="icons/window.png">Fenêtre</option>
              </select>
            </div>
            
            <div style="margin-bottom:15px;">
              <label for="icon-action" style="display:block;margin-bottom:5px;font-weight:bold;">Action</label>
              <select id="icon-action" name="action" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                <option value="window">Ouvrir une fenêtre</option>
                <option value="link">Ouvrir un lien</option>
                <option value="function">Exécuter une fonction</option>
              </select>
            </div>
            
            <div id="action-window-options" style="margin-bottom:15px;">
              <label for="icon-window" style="display:block;margin-bottom:5px;font-weight:bold;">Fenêtre à ouvrir</label>
              <select id="icon-window" name="window" style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;">
                <option value="films">Films</option>
                <option value="articles">Articles</option>
                <option value="mangas">Mangas</option>
                <option value="cv">CV</option>
                <option value="about">À propos</option>
                <option value="custom">Personnalisée</option>
              </select>
            </div>
            
            <div id="action-link-options" style="margin-bottom:15px;display:none;">
              <label for="icon-link" style="display:block;margin-bottom:5px;font-weight:bold;">Lien</label>
              <input type="url" id="icon-link" name="link" 
                style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;"
                placeholder="https://exemple.com">
            </div>
            
            <div id="action-function-options" style="margin-bottom:15px;display:none;">
              <label for="icon-function" style="display:block;margin-bottom:5px;font-weight:bold;">Fonction</label>
              <input type="text" id="icon-function" name="function" 
                style="width:100%;padding:5px;border:1px solid #ACA899;border-radius:3px;"
                placeholder="nomDeLaFonction">
            </div>
            
            <div style="margin-bottom:15px;">
              <label for="icon-visible" style="font-weight:bold;display:flex;align-items:center;cursor:pointer;">
                <input type="checkbox" id="icon-visible" name="visible" checked
                  style="margin-right:8px;cursor:pointer;">
                Visible sur le bureau
              </label>
            </div>
            
            <div style="margin-top:15px;">
              <button type="submit" style="background:#0058a8;color:white;border:1px solid #003f7d;padding:6px 12px;border-radius:3px;cursor:pointer;">
                Enregistrer
              </button>
              <button type="button" id="icon-reset-btn" style="margin-left:10px;padding:6px 12px;border-radius:3px;cursor:pointer;">
                Nouveau
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Ajouter les gestionnaires d'événements
    this.initDesktopManagerEvents();
  },
  
  // Génération de l'aperçu du bureau
  generateDesktopPreview() {
    // Combiner les icônes par défaut et personnalisées
    const allIcons = [
      ...(window.desktopIcons?.defaultIcons || []),
      ...(window.desktopIcons?.customIcons || [])
    ].filter(icon => icon.visible);
    
    if (allIcons.length === 0) {
      return '<div style="padding:15px;text-align:center;color:white;text-shadow:1px 1px 2px rgba(0,0,0,0.7);">Aucune icône visible</div>';
    }
    
    return allIcons.map(icon => `
      <div class="desktop-icon-preview" data-id="${icon.id}" 
        style="position:absolute;left:${icon.x}px;top:${icon.y}px;width:70px;height:70px;display:flex;flex-direction:column;align-items:center;cursor:move;">
        <img src="${icon.icon}" alt="${icon.name}" style="width:32px;height:32px;margin-bottom:5px;">
        <div style="color:white;text-align:center;font-size:12px;text-shadow:1px 1px 2px rgba(0,0,0,0.7);white-space:nowrap;">
          ${icon.name}
        </div>
      </div>
    `).join('');
  },
  
  // Génération de la liste des icônes
  generateIconsList() {
    // Créer un tableau de toutes les icônes
    const allIcons = [
      ...((window.desktopIcons?.defaultIcons || []).map(icon => ({...icon, type: 'default'}))),
      ...((window.desktopIcons?.customIcons || []).map(icon => ({...icon, type: 'custom'})))
    ];
    
    if (allIcons.length === 0) {
      return '<div style="padding:15px;text-align:center;">Aucune icône disponible</div>';
    }
    
    // Tri des icônes par nom
    const sortedIcons = [...allIcons].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '')
    );
    
    return sortedIcons.map(icon => `
      <div class="icon-item" data-id="${icon.id}" data-type="${icon.type || 'default'}" 
        style="padding:8px;border-top:1px solid #ACA899;display:grid;grid-template-columns:40px auto 80px 80px;align-items:center;">
        <div>
          <img src="${icon.icon}" alt="${icon.name}" style="width:24px;height:24px;">
        </div>
        <div style="overflow:hidden;text-overflow:ellipsis;">
          ${icon.name || 'Sans nom'} ${icon.type === 'default' ? '(défaut)' : ''}
        </div>
        <div>
          <label style="display:flex;align-items:center;cursor:pointer;">
            <input type="checkbox" class="icon-visible-toggle" data-id="${icon.id}" data-type="${icon.type || 'default'}"
              ${icon.visible ? 'checked' : ''} style="margin-right:5px;cursor:pointer;">
            Visible
          </label>
        </div>
        <div>
          <button class="edit-icon-btn" data-id="${icon.id}" data-type="${icon.type || 'default'}" 
            style="padding:3px 8px;background:#ECE9D8;border:1px solid #ACA899;cursor:pointer;${icon.type === 'default' ? 'opacity:0.6;' : ''}">
            Éditer
          </button>
          ${icon.type !== 'default' ? `
            <button class="delete-icon-btn" data-id="${icon.id}" data-type="${icon.type || 'default'}" 
              style="padding:3px 8px;background:#f44336;color:white;border:1px solid #d32f2f;cursor:pointer;margin-left:5px;">
              X
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  },
  
  // Initialisation des événements pour le gestionnaire de bureau
  initDesktopManagerEvents() {
    // Formulaire d'icône
    document.getElementById('icon-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveIcon();
    });
    
    // Bouton de réinitialisation
    document.getElementById('icon-reset-btn')?.addEventListener('click', () => {
      this.resetIconForm();
    });
    
    // Bouton de restauration des valeurs par défaut
    document.getElementById('restore-defaults-btn')?.addEventListener('click', () => {
      this.restoreDefaultIcons();
    });
    
    // Changer les options selon l'action sélectionnée
    document.getElementById('icon-action')?.addEventListener('change', (e) => {
      this.updateActionOptions(e.target.value);
    });
    
    // Boutons d'édition
    document.querySelectorAll('.edit-icon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const iconId = e.target.dataset.id;
        const iconType = e.target.dataset.type;
        this.editIcon(iconId, iconType);
      });
    });
    
    // Boutons de suppression
    document.querySelectorAll('.delete-icon-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const iconId = e.target.dataset.id;
        const iconType = e.target.dataset.type;
        this.confirmDeleteIcon(iconId, iconType);
      });
    });
    
    // Commutateurs de visibilité
    document.querySelectorAll('.icon-visible-toggle').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const iconId = e.target.dataset.id;
        const iconType = e.target.dataset.type;
        this.toggleIconVisibility(iconId, iconType, e.target.checked);
      });
    });
    
    // Rendre les icônes déplaçables dans la prévisualisation
    this.initDraggableIcons();
  },
  
  // Rendre les icônes déplaçables
  initDraggableIcons() {
    const iconElements = document.querySelectorAll('.desktop-icon-preview');
    const desktopPreview = document.querySelector('.desktop-preview');
    
    if (!desktopPreview) return;
    
    iconElements.forEach(icon => {
      let isDragging = false;
      let offsetX, offsetY;
      
      icon.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - icon.getBoundingClientRect().left;
        offsetY = e.clientY - icon.getBoundingClientRect().top;
        icon.style.zIndex = 1000;
        icon.style.opacity = 0.8;
        e.preventDefault();
      });
      
      desktopPreview.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const previewRect = desktopPreview.getBoundingClientRect();
        let newX = e.clientX - previewRect.left - offsetX;
        let newY = e.clientY - previewRect.top - offsetY;
        
        // Limiter aux dimensions du conteneur
        newX = Math.max(0, Math.min(newX, previewRect.width - icon.offsetWidth));
        newY = Math.max(0, Math.min(newY, previewRect.height - icon.offsetHeight));
        
        // Mettre à jour la position
        icon.style.left = `${newX}px`;
        icon.style.top = `${newY}px`;
      });
      
      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        
        isDragging = false;
        icon.style.zIndex = 1;
        icon.style.opacity = 1;
        
        // Enregistrer la nouvelle position
        const iconId = icon.dataset.id;
        const newX = parseInt(icon.style.left);
        const newY = parseInt(icon.style.top);
        this.updateIconPosition(iconId, newX, newY);
      });
    });
  },
  
  // Mise à jour de la position d'une icône
  updateIconPosition(iconId, x, y) {
    if (!window.desktopIcons) return;
    
    // Chercher dans les icônes par défaut
    let foundInDefault = false;
    if (window.desktopIcons.defaultIcons) {
      const defaultIcon = window.desktopIcons.defaultIcons.find(icon => icon.id === iconId);
      if (defaultIcon) {
        defaultIcon.x = x;
        defaultIcon.y = y;
        foundInDefault = true;
      }
    }
    
    // Chercher dans les icônes personnalisées si non trouvé
    if (!foundInDefault && window.desktopIcons.customIcons) {
      const customIcon = window.desktopIcons.customIcons.find(icon => icon.id === iconId);
      if (customIcon) {
        customIcon.x = x;
        customIcon.y = y;
      }
    }
    
    // Sauvegarder les changements
    this.saveAllData();
  },
  
  // Mettre à jour les options selon le type d'action
  updateActionOptions(action) {
    const windowOptions = document.getElementById('action-window-options');
    const linkOptions = document.getElementById('action-link-options');
    const functionOptions = document.getElementById('action-function-options');
    
    // Cacher toutes les options
    windowOptions.style.display = 'none';
    linkOptions.style.display = 'none';
    functionOptions.style.display = 'none';
    
    // Afficher les options selon l'action sélectionnée
    switch (action) {
      case 'window':
        windowOptions.style.display = 'block';
        break;
      case 'link':
        linkOptions.style.display = 'block';
        break;
      case 'function':
        functionOptions.style.display = 'block';
        break;
    }
  },
  
  // Réinitialisation du formulaire d'icône
  resetIconForm() {
    document.getElementById('icon-id').value = '';
    document.getElementById('icon-type').value = 'custom';
    document.getElementById('icon-name').value = '';
    document.getElementById('icon-path').value = 'icons/window.png';
    document.getElementById('icon-action').value = 'window';
    document.getElementById('icon-window').value = 'custom';
    document.getElementById('icon-link').value = '';
    document.getElementById('icon-function').value = '';
    document.getElementById('icon-visible').checked = true;
    
    // Mettre à jour les options d'action
    this.updateActionOptions('window');
  },
  
  // Édition d'une icône
  editIcon(iconId, iconType) {
    if (!window.desktopIcons) return;
    
    let icon = null;
    
    // Chercher l'icône dans la liste appropriée
    if (iconType === 'default' && window.desktopIcons.defaultIcons) {
      icon = window.desktopIcons.defaultIcons.find(i => i.id === iconId);
    } else if (iconType === 'custom' && window.desktopIcons.customIcons) {
      icon = window.desktopIcons.customIcons.find(i => i.id === iconId);
    }
    
    if (!icon) return;
    
    // Remplir le formulaire
    document.getElementById('icon-id').value = icon.id;
    document.getElementById('icon-type').value = iconType;
    document.getElementById('icon-name').value = icon.name || '';
    document.getElementById('icon-path').value = icon.icon || 'icons/window.png';
    document.getElementById('icon-visible').checked = icon.visible !== false;
    
    // Définir l'action et les options associées
    let action = 'window';
    if (icon.link) action = 'link';
    if (icon.function) action = 'function';
    document.getElementById('icon-action').value = action;
    
    document.getElementById('icon-window').value = icon.window || 'custom';
    document.getElementById('icon-link').value = icon.link || '';
    document.getElementById('icon-function').value = icon.function || '';
    
    // Mettre à jour les options d'action
    this.updateActionOptions(action);
  },
  
  // Sauvegarde d'une icône
  saveIcon() {
    const iconId = document.getElementById('icon-id').value;
    const iconType = document.getElementById('icon-type').value;
    const iconName = document.getElementById('icon-name').value;
    const iconPath = document.getElementById('icon-path').value;
    const iconAction = document.getElementById('icon-action').value;
    const iconVisible = document.getElementById('icon-visible').checked;
    
    // Créer l'objet icône de base
    const iconData = {
      id: iconId || 'icon_' + Date.now(),
      name: iconName,
      icon: iconPath,
      visible: iconVisible,
      x: 20,
      y: 20
    };
    
    // Ajouter les propriétés selon l'action
    switch (iconAction) {
      case 'window':
        iconData.window = document.getElementById('icon-window').value;
        break;
      case 'link':
        iconData.link = document.getElementById('icon-link').value;
        break;
      case 'function':
        iconData.function = document.getElementById('icon-function').value;
        break;
    }
    
    // S'assurer que window.desktopIcons existe
    if (typeof window.desktopIcons === 'undefined') {
      window.desktopIcons = {
        defaultIcons: [],
        customIcons: []
      };
    }
    
    // Ajouter ou mettre à jour l'icône
    if (iconId) {
      if (iconType === 'default' && window.desktopIcons.defaultIcons) {
        // Mettre à jour une icône par défaut
        const index = window.desktopIcons.defaultIcons.findIndex(i => i.id === iconId);
        if (index !== -1) {
          // Conserver la position existante
          iconData.x = window.desktopIcons.defaultIcons[index].x || 20;
          iconData.y = window.desktopIcons.defaultIcons[index].y || 20;
          window.desktopIcons.defaultIcons[index] = iconData;
        }
      } else if (iconType === 'custom' && window.desktopIcons.customIcons) {
        // Mettre à jour une icône personnalisée
        const index = window.desktopIcons.customIcons.findIndex(i => i.id === iconId);
        if (index !== -1) {
          // Conserver la position existante
          iconData.x = window.desktopIcons.customIcons[index].x || 20;
          iconData.y = window.desktopIcons.customIcons[index].y || 20;
          window.desktopIcons.customIcons[index] = iconData;
        } else {
          // Ajouter comme nouvelle icône personnalisée
          window.desktopIcons.customIcons.push(iconData);
        }
      }
    } else {
      // Ajouter une nouvelle icône personnalisée
      if (!window.desktopIcons.customIcons) {
        window.desktopIcons.customIcons = [];
      }
      window.desktopIcons.customIcons.push(iconData);
    }
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Afficher une notification
    this.showNotification('Icône sauvegardée avec succès', 'success');
    
    // Réinitialiser le formulaire
    this.resetIconForm();
    
    // Actualiser l'interface
    this.loadDesktopManager();
  },
  
  // Basculer la visibilité d'une icône
  toggleIconVisibility(iconId, iconType, isVisible) {
    if (!window.desktopIcons) return;
    
    if (iconType === 'default' && window.desktopIcons.defaultIcons) {
      const icon = window.desktopIcons.defaultIcons.find(i => i.id === iconId);
      if (icon) {
        icon.visible = isVisible;
      }
    } else if (iconType === 'custom' && window.desktopIcons.customIcons) {
      const icon = window.desktopIcons.customIcons.find(i => i.id === iconId);
      if (icon) {
        icon.visible = isVisible;
      }
    }
    
    // Sauvegarder les données
    this.saveAllData();
    
    // Actualiser l'aperçu du bureau
    const desktopPreview = document.querySelector('.desktop-preview');
    if (desktopPreview) {
      desktopPreview.innerHTML = this.generateDesktopPreview();
      this.initDraggableIcons();
    }
  },
  
  // Confirmation de suppression d'une icône
  confirmDeleteIcon(iconId, iconType) {
    if (!window.desktopIcons || iconType !== 'custom') return;
    
    const icon = window.desktopIcons.customIcons?.find(i => i.id === iconId);
    if (!icon) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'icône "${icon.name}" ?`)) {
      // Supprimer l'icône
      const index = window.desktopIcons.customIcons.findIndex(i => i.id === iconId);
      if (index !== -1) {
        window.desktopIcons.customIcons.splice(index, 1);
        
        // Sauvegarder les données
        this.saveAllData();
        
        // Afficher une notification
        this.showNotification('Icône supprimée avec succès', 'success');
        
        // Actualiser l'interface
        this.loadDesktopManager();
      }
    }
  },
  
  // Restauration des icônes par défaut
  restoreDefaultIcons() {
    if (confirm('Êtes-vous sûr de vouloir restaurer les icônes par défaut ? Les icônes personnalisées seront conservées.')) {
      window.desktopIcons = {
        defaultIcons: [
          { id: 'films', name: 'Films', icon: 'icons/film.png', x: 20, y: 20, visible: true },
          { id: 'articles', name: 'Articles', icon: 'icons/article.png', x: 20, y: 100, visible: true },
          { id: 'cv', name: 'CV', icon: 'icons/cv.png', x: 20, y: 180, visible: true },
          { id: 'mangas', name: 'Mangas', icon: 'icons/portfolio.png', x: 20, y: 260, visible: false },
          { id: 'info', name: 'À propos', icon: 'icons/info.png', x: 20, y: 340, visible: true }
        ],
        customIcons: window.desktopIcons?.customIcons || []
      };
      
      // Sauvegarder les données
      this.saveAllData();
      
      // Afficher une notification
      this.showNotification('Icônes par défaut restaurées avec succès', 'success');
      
      // Actualiser l'interface
      this.loadDesktopManager();
    }
  }
};

// Ajouter ces méthodes à l'objet AdminPanelManager
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    // S'assurer que AdminPanelManager est disponible
    if (typeof window.AdminPanelManager !== 'undefined') {
      // Copier toutes les méthodes
      Object.assign(window.AdminPanelManager, DesktopManagerAdmin);
      console.log('🖥️ Gestionnaire de bureau ajouté au panneau d\'administration');
    }
  }, 600);
});
