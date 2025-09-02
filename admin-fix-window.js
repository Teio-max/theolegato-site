// Ce fichier a été créé pour remplacer temporairement admin-fix-window.js 
// qui contient de nombreuses erreurs de syntaxe.
// L'original est conservé sous le nom admin-fix-window.js.bak

// Redirection vers les gestionnaires modernes
function showManageArticlesForm() {
  if (typeof AdminPanelManager !== 'undefined' && typeof AdminPanelManager.loadArticlesManager === 'function') {
    AdminPanelManager.loadArticlesManager();
  } else {
    console.error("AdminPanelManager.loadArticlesManager n'est pas disponible");
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <h3 style="color:#0058a8;">Gestionnaire d'articles</h3>
        <p>Le gestionnaire d'articles moderne n'est pas disponible. Veuillez vérifier que le fichier admin-panel-enhanced.js est bien chargé.</p>
      `;
    }
  }
}

function showManageTagsForm() {
  if (typeof AdminPanelManager !== 'undefined' && typeof AdminPanelManager.loadTagsManager === 'function') {
    AdminPanelManager.loadTagsManager();
  } else {
    console.error("AdminPanelManager.loadTagsManager n'est pas disponible");
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <h3 style="color:#0058a8;">Gestionnaire de tags</h3>
        <p>Le gestionnaire de tags moderne n'est pas disponible. Veuillez vérifier que le fichier admin-panel-enhanced.js est bien chargé.</p>
      `;
    }
  }
}

function showManageIconsForm() {
  if (typeof AdminPanelManager !== 'undefined' && typeof AdminPanelManager.loadIconsManager === 'function') {
    AdminPanelManager.loadIconsManager();
  } else {
    console.error("AdminPanelManager.loadIconsManager n'est pas disponible");
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <h3 style="color:#0058a8;">Gestionnaire d'icônes</h3>
        <p>Le gestionnaire d'icônes moderne n'est pas disponible. Veuillez vérifier que le fichier admin-panel-enhanced.js est bien chargé.</p>
      `;
    }
  }
}

function showManageCVForm() {
  if (typeof AdminPanelManager !== 'undefined' && typeof AdminPanelManager.loadCVManager === 'function') {
    AdminPanelManager.loadCVManager();
  } else {
    console.error("AdminPanelManager.loadCVManager n'est pas disponible");
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
      adminContent.innerHTML = `
        <h3 style="color:#0058a8;">Gestionnaire de CV</h3>
        <p>Le gestionnaire de CV moderne n'est pas disponible. Veuillez vérifier que le fichier admin-panel-enhanced.js est bien chargé.</p>
      `;
    }
  }
}

// Fonctions pour les fenêtres
window.createArticlesWindow = function() {
  if (typeof WindowManager !== 'undefined' && typeof WindowManager.createWindow === 'function') {
    const articles = DataManager.data.articles || [];
    let content = articles.length > 0 
      ? '<div class="window-articles"><h1>Mes Articles</h1><div class="articles-list"><ul>' +
        articles.map(a => `<li><h3>${a.titre}</h3><p>${a.contenu || ''}</p></li>`).join('') +
        '</ul></div></div>'
      : '<p>Aucun article n\'est disponible pour le moment.</p>';
      
    return WindowManager.createWindow({
      title: 'Articles',
      icon: 'icons/article.png',
      width: '700px',
      height: '500px',
      content: content
    });
  } else {
    console.error("WindowManager n'est pas disponible");
    return null;
  }
};

window.openArticlePdf = function(pdfUrl) {
  if (!pdfUrl) {
    alert("Erreur: URL du PDF non disponible.");
    return;
  }
  
  if (typeof WindowManager !== 'undefined' && typeof WindowManager.createWindow === 'function') {
    return WindowManager.createWindow({
      title: 'Lecture d\'article',
      icon: 'icons/article.png',
      width: '800px',
      height: '600px',
      content: `<iframe src="${pdfUrl}" style="width:100%;height:100%;border:none;"></iframe>`
    });
  } else {
    console.error("WindowManager n'est pas disponible");
    return null;
  }
};

window.createCVWindow = function() {
  if (typeof WindowManager !== 'undefined' && typeof WindowManager.createWindow === 'function') {
    const cv = DataManager.data.cv || {};
    let content = cv.pdfUrl
      ? `<iframe src="${cv.pdfUrl}" style="width:100%;height:100%;border:none;"></iframe>`
      : '<p>Aucun CV n\'est disponible pour le moment.</p>';
      
    return WindowManager.createWindow({
      title: 'CV',
      icon: 'icons/cv.png',
      width: '800px',
      height: '600px',
      content: content
    });
  } else {
    console.error("WindowManager n'est pas disponible");
    return null;
  }
};

// Configuration des événements pour le panneau admin
document.addEventListener('DOMContentLoaded', function() {
  // Configurer les gestionnaires d'événements pour le panneau d'administration
  const manageArticlesBtn = document.getElementById('btn-manage-articles');
  const manageTagsBtn = document.getElementById('btn-manage-tags');
  const manageCVBtn = document.getElementById('btn-manage-cv');
  const manageIconsBtn = document.getElementById('btn-manage-icons');

  if (manageArticlesBtn) {
    manageArticlesBtn.addEventListener('click', () => {
      // Remplacer le contenu du panneau admin
      showManageArticlesForm();
    });
  }

  if (manageTagsBtn) {
    manageTagsBtn.addEventListener('click', () => {
      // Remplacer le contenu du panneau admin
      showManageTagsForm();
    });
  }

  if (manageCVBtn) {
    manageCVBtn.addEventListener('click', () => {
      // Remplacer le contenu du panneau admin
      showManageCVForm();
    });
  }

  if (manageIconsBtn) {
    manageIconsBtn.addEventListener('click', () => {
      // Rediriger vers le gestionnaire d'icônes moderne dans admin-desktop-manager.js
      if (typeof DesktopManagerAdmin !== 'undefined' && typeof DesktopManagerAdmin.loadDesktopManager === 'function') {
        DesktopManagerAdmin.loadDesktopManager.call(AdminPanelManager);
      } else {
        console.error("DesktopManagerAdmin.loadDesktopManager n'est pas disponible");
        // Message de fallback en cas d'erreur
        const adminContent = document.getElementById('admin-content');
        if (adminContent) {
          adminContent.innerHTML = `
            <h3 style="color:#0058a8;">Gérer les icônes du bureau</h3>
            <p>Le gestionnaire d'icônes moderne n'est pas disponible. Veuillez vérifier que le fichier admin-desktop-manager.js est bien chargé.</p>
          `;
        }
      }
    });
  }
});
