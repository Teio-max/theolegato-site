// Script pour la fenêtre pop-up de présentation
console.log("🌟 Chargement du module de présentation");

// Variable pour gérer l'état (pop-up déjà affichée ou non)
let welcomePopupShown = false;

// Fonction pour créer et afficher la pop-up de présentation
function showWelcomePopup() {
  // Éviter d'afficher plusieurs fois
  if (welcomePopupShown) return;
  welcomePopupShown = true;
  
  console.log("👋 Affichage de la pop-up de bienvenue");
  
  // Récupérer la configuration
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
  
  // Créer la fenêtre modale
  const welcomeWindow = document.createElement('div');
  welcomeWindow.className = 'xp-window welcome-window';
  welcomeWindow.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    background: #ECE9D8;
    border: 1px solid #000;
    border-radius: 3px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    z-index: 9999;
    font-family: 'Tahoma', sans-serif;
    overflow: hidden;
  `;
  
  // Contenu de la fenêtre
  welcomeWindow.innerHTML = `
    <div class="xp-titlebar" style="
      background: linear-gradient(to right, #0A246A, #A6CAF0);
      padding: 5px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <span style="color: white; font-weight: bold;">${config.title}</span>
      <div style="display: flex; gap: 4px;">
        <button class="xp-btn min-btn" style="
          background: #ffbd44;
          border: 1px solid #dfb243;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #a67c27;
          font-weight: bold;
          font-size: 10px;
          cursor: pointer;
        ">_</button>
        <button class="xp-btn close-btn" style="
          background: #ff5a52;
          border: 1px solid #e33e38;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #9a2b25;
          font-weight: bold;
          font-size: 10px;
          cursor: pointer;
        ">×</button>
      </div>
    </div>
    
    <div style="padding: 20px; display: flex; gap: 20px;">
      <div style="flex: 1;">
        <img src="${config.avatarImage}" alt="${config.name}" style="width: 100%; border: 1px solid #999; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
      </div>
      
      <div style="flex: 2;">
        <h2 style="margin-top: 0; color: #0058a8; font-size: 18px; border-bottom: 1px solid #ACA899; padding-bottom: 5px;">${config.name}</h2>
        
        <p style="margin-bottom: 15px; line-height: 1.5;">
          ${config.description}
        </p>
        
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 14px; color: #333; margin-bottom: 10px;">Me suivre</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;" id="social-links">
            <!-- Les liens sociaux seront ajoutés ici dynamiquement -->
          </div>
        </div>
        
        <div style="text-align: right; margin-top: 10px;">
          <button id="explore-site-btn" style="
            padding: 8px 15px;
            background: #0058a8;
            color: white;
            border: 1px solid #003f7d;
            border-radius: 3px;
            cursor: pointer;
            font-size: 13px;
          ">${config.buttonText}</button>
        </div>
      </div>
    </div>
  `;
  
  // Ajouter la fenêtre au document
  document.body.appendChild(welcomeWindow);
  
  // Rendre la fenêtre draggable
  makeDraggable(welcomeWindow);
  
  // Récupérer les liens sociaux
  const socialLinks = config.socialLinks;
  
  const socialLinksContainer = welcomeWindow.querySelector('#social-links');
  
  socialLinks.forEach(link => {
    const socialButton = document.createElement('a');
    socialButton.href = link.url;
    socialButton.target = '_blank';
    socialButton.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 3px;
      text-decoration: none;
      color: #333;
      font-size: 12px;
      transition: all 0.2s;
    `;
    
    // Créer l'image si l'icône existe
    try {
      const iconImg = document.createElement('img');
      iconImg.src = link.icon;
      iconImg.alt = link.name;
      iconImg.style.width = '16px';
      iconImg.style.height = '16px';
      
      iconImg.onerror = function() {
        // Si l'image n'existe pas, afficher juste le nom
        this.remove();
      };
      
      socialButton.appendChild(iconImg);
    } catch (e) {
      console.log(`Erreur lors du chargement de l'icône ${link.icon}`);
    }
    
    // Ajouter le nom
    const nameSpan = document.createElement('span');
    nameSpan.textContent = link.name;
    socialButton.appendChild(nameSpan);
    
    // Ajouter le bouton au conteneur
    socialLinksContainer.appendChild(socialButton);
    
    // Effet hover
    socialButton.addEventListener('mouseover', () => {
      socialButton.style.backgroundColor = '#e0e0e0';
      socialButton.style.borderColor = '#aaa';
    });
    
    socialButton.addEventListener('mouseout', () => {
      socialButton.style.backgroundColor = '#f0f0f0';
      socialButton.style.borderColor = '#ccc';
    });
  });
  
  // Écouteurs d'événements
  const closeBtn = welcomeWindow.querySelector('.close-btn');
  const minBtn = welcomeWindow.querySelector('.min-btn');
  const exploreBtn = welcomeWindow.querySelector('#explore-site-btn');
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(welcomeWindow);
  });
  
  minBtn.addEventListener('click', () => {
    welcomeWindow.style.display = 'none';
    
    // Créer un bouton dans le dock pour restaurer la fenêtre
    const dockButton = document.createElement('div');
    dockButton.className = 'dock-button';
    dockButton.title = 'Bienvenue';
    dockButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: 40px;
      height: 40px;
      background: #ECE9D8 url('avatar.jpg') center/cover;
      border: 1px solid #ACA899;
      border-radius: 3px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      z-index: 9998;
    `;
    
    document.body.appendChild(dockButton);
    
    dockButton.addEventListener('click', () => {
      welcomeWindow.style.display = 'block';
      document.body.removeChild(dockButton);
    });
  });
  
  exploreBtn.addEventListener('click', () => {
    document.body.removeChild(welcomeWindow);
  });
  
  // Fonction pour rendre un élément draggable
  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const titlebar = element.querySelector('.xp-titlebar');
    
    if (titlebar) {
      titlebar.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
      e = e || window.event;
      
      // Ne pas commencer le drag si on clique sur un bouton
      if (e.target.closest('.xp-btn')) return;
      
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

// Ne pas exécuter automatiquement, laisser script.js l'appeler
// au moment approprié après le chargement du bureau
