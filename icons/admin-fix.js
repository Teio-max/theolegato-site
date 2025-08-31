// Ce fichier restaure l'accès à l'administration

// Fonction qui vérifie le mot de passe admin
window.checkAdminPass = function(winId) {
  const pass = document.getElementById('admin-pass').value;
  if (pass === 'sitethéi') {
    // Fermer la fenêtre de login
    document.getElementById(winId).remove();
    
    // Appeler la fonction du panneau admin
    if (typeof createAdminPanelWindow === 'function') {
      createAdminPanelWindow();
    } else {
      console.log("Fonction createAdminPanelWindow non trouvée, utilisation du fallback");
      createAdminPanelFallback();
    }
  } else {
    document.getElementById('admin-error').textContent = 'Mot de passe incorrect.';
  }
};

// Fonction de secours pour le panneau admin si l'original ne fonctionne pas
function createAdminPanelFallback() {
  const winId = 'adminpanel_' + Date.now();
  const win = document.createElement('div');
  win.className = 'xp-window';
  win.id = winId;
  win.style.position = 'absolute';
  win.style.width = '600px';
  win.style.height = '400px';
  win.style.left = '100px';
  win.style.top = '100px';
  win.style.zIndex = typeof getNextZIndex === 'function' ? getNextZIndex() : 9999;
  
  win.innerHTML = `
    <div class="xp-titlebar" style="background:linear-gradient(to right, #0058a8, #2586e7);">
      <span style="display:flex;align-items:center;padding:5px;">
        <img src="icons/key.png" alt="Admin" style="height:16px;margin-right:5px;">
        <span>Administration</span>
      </span>
      <span style="display:flex;">
        <span class="xp-btn" onclick="document.getElementById('${winId}').remove()">✖</span>
      </span>
    </div>
    <div style="padding:15px;">
      <h2>Panneau d'administration</h2>
      <p>Pour restaurer complètement les fonctionnalités d'administration, vérifiez :</p>
      <ol>
        <li>Que le fichier admin-functions.js est correctement inclus dans votre index.html</li>
        <li>Que la fonction createAdminPanelWindow est définie globalement</li>
      </ol>
      <p>En attendant, utilisez cette interface simplifiée.</p>
      
      <div style="margin-top:20px;">
        <button onclick="showFilmForm()" style="margin:5px;padding:8px 15px;background:#0058a8;color:white;border:none;border-radius:3px;">
          Ajouter un film
        </button>
        <button onclick="showIconForm()" style="margin:5px;padding:8px 15px;background:#0058a8;color:white;border:none;border-radius:3px;">
          Gérer les icônes
        </button>
      </div>
      
      <div id="admin-content-area" style="margin-top:20px;"></div>
    </div>
  `;
  
  document.body.appendChild(win);
  return win;
}

// Afficher le formulaire pour ajouter un film
function showFilmForm() {
  const contentArea = document.getElementById('admin-content-area');
  if (!contentArea) return;
  
  contentArea.innerHTML = `
    <h3>Ajouter un film</h3>
    <form id="simple-film-form">
      <div style="margin-bottom:10px;">
        <label>Titre : <input type="text" id="film-title" required style="width:100%;"></label>
      </div>
      <div style="margin-bottom:10px;">
        <label>Note (0-5) : <input type="number" id="film-note" min="0" max="5" value="0"></label>
      </div>
      <div style="margin-bottom:10px;">
        <label>Critique :<br><textarea id="film-critique" rows="4" style="width:100%;"></textarea></label>
      </div>
      <div style="margin-bottom:10px;">
        <label>Image URL : <input type="text" id="film-image" style="width:100%;"></label>
      </div>
      <button type="submit" style="background:#0058a8;color:white;border:none;padding:8px 15px;border-radius:3px;">
        Enregistrer
      </button>
    </form>
  `;
  
  const form = document.getElementById('simple-film-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Créer un nouveau film
      const newFilm = {
        id: Date.now(),
        titre: document.getElementById('film-title').value,
        note: parseInt(document.getElementById('film-note').value) || 0,
        critique: document.getElementById('film-critique').value,
        image: document.getElementById('film-image').value,
        galerie: [],
        bandeAnnonce: "",
        liens: []
      };
      
      // Ajouter le film à la liste si elle existe
      if (typeof films !== 'undefined') {
        films.push(newFilm);
        
        // Sauvegarder les données
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
          alert('Film ajouté avec succès et sauvegardé sur GitHub!');
        } else if (typeof saveData === 'function') {
          saveData();
          alert('Film ajouté avec succès!');
        } else {
          alert('Film ajouté mais aucune fonction de sauvegarde trouvée.');
        }
        
        form.reset();
      } else {
        alert("Erreur: la variable 'films' n'est pas définie.");
      }
    });
  }
}

// Afficher le formulaire pour gérer les icônes
function showIconForm() {
  const contentArea = document.getElementById('admin-content-area');
  if (!contentArea) return;
  
  let iconsHtml = '';
  if (typeof desktopIcons !== 'undefined') {
    iconsHtml = '<h4>Icônes existantes</h4><ul>';
    desktopIcons.forEach(icon => {
      iconsHtml += `<li>${icon.name} (${icon.action}) <button onclick="removeIcon('${icon.id}')" style="margin-left:10px;color:white;background:#e74c3c;border:none;border-radius:3px;">Supprimer</button></li>`;
    });
    iconsHtml += '</ul>';
  } else {
    iconsHtml = '<p>La variable desktopIcons n\'est pas définie.</p>';
  }
  
  contentArea.innerHTML = `
    <h3>Gérer les icônes</h3>
    <form id="simple-icon-form">
      <div style="margin-bottom:10px;">
        <label>Nom : <input type="text" id="icon-name" required style="width:100%;"></label>
      </div>
      <div style="margin-bottom:10px;">
        <label>URL de l'icône : <input type="text" id="icon-url" required style="width:100%;"></label>
      </div>
      <div style="margin-bottom:10px;">
        <label>Action : <input type="text" id="icon-action" required placeholder="createFilmsWindow ou URL" style="width:100%;"></label>
      </div>
      <button type="submit" style="background:#0058a8;color:white;border:none;padding:8px 15px;border-radius:3px;">
        Ajouter
      </button>
    </form>
    <div style="margin-top:20px;">
      ${iconsHtml}
    </div>
  `;
  
  const form = document.getElementById('simple-icon-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (typeof desktopIcons !== 'undefined') {
        // Créer une nouvelle icône
        const newIcon = {
          id: 'icon-' + Date.now(),
          name: document.getElementById('icon-name').value,
          icon: document.getElementById('icon-url').value,
          action: document.getElementById('icon-action').value,
          position: { x: 100, y: 100 + desktopIcons.length * 80 }
        };
        
        // Ajouter l'icône à la liste
        desktopIcons.push(newIcon);
        
        // Sauvegarder et rafraîchir
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof saveData === 'function') {
          saveData();
        }
        
        if (typeof renderDesktopIcons === 'function') {
          renderDesktopIcons();
        }
        
        alert('Icône ajoutée avec succès!');
        showIconForm(); // Rafraîchir la liste
      } else {
        alert("Erreur: la variable 'desktopIcons' n'est pas définie.");
      }
    });
  }
}

// Fonction pour supprimer une icône
window.removeIcon = function(iconId) {
  if (typeof desktopIcons !== 'undefined') {
    const index = desktopIcons.findIndex(i => i.id === iconId);
    if (index !== -1) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette icône ?')) {
        desktopIcons.splice(index, 1);
        
        // Sauvegarder et rafraîchir
        if (typeof saveDataToGitHub === 'function') {
          saveDataToGitHub();
        } else if (typeof saveData === 'function') {
          saveData();
        }
        
        if (typeof renderDesktopIcons === 'function') {
          renderDesktopIcons();
        }
        
        showIconForm(); // Rafraîchir la liste
      }
    }
  }
};

console.log("✅ Admin fix loaded - accès admin restauré");
