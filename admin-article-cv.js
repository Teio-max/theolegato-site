// Fonctionnalités pour les articles et le CV
// Ce fichier étend admin-all-in-one.js avec les fonctions pour gérer les articles et le CV

console.log("📝 Chargement des fonctionnalités d'articles et CV");

// Fonctions pour la gestion des articles
AdminSimple.openArticleEditor = function(article, win) {
  console.log("📝 Ouverture de l'éditeur d'article");
  
  // Activer l'onglet articles
  this.loadTab('articles', win);
  
  // Stocker l'article en cours d'édition
  this.state.currentEditArticle = article;
  
  // Récupérer les éléments du formulaire
  const titleInput = win.querySelector('#article-title');
  const categorySelect = win.querySelector('#article-category');
  const contentTextarea = win.querySelector('#article-content');
  
  // Si on édite un article existant, remplir le formulaire
  if (article) {
    titleInput.value = article.title || '';
    categorySelect.value = article.category || 'cinema';
    contentTextarea.value = article.content || '';
  } else {
    // Sinon, vider le formulaire
    titleInput.value = '';
    categorySelect.value = 'cinema';
    contentTextarea.value = '';
  }
  
  // Faire défiler jusqu'au formulaire
  win.querySelector('#article-form').scrollIntoView({ behavior: 'smooth' });
};

AdminSimple.saveArticle = function(win) {
  console.log("💾 Sauvegarde de l'article");
  
  // Récupérer les valeurs du formulaire
  const titleInput = win.querySelector('#article-title');
  const categorySelect = win.querySelector('#article-category');
  const contentTextarea = win.querySelector('#article-content');
  
  // Valider les champs obligatoires
  if (!titleInput.value.trim()) {
    alert("Le titre de l'article est obligatoire");
    titleInput.focus();
    return;
  }
  
  if (!contentTextarea.value.trim()) {
    alert("Le contenu de l'article est obligatoire");
    contentTextarea.focus();
    return;
  }
  
  // Créer ou mettre à jour l'article
  const article = this.state.currentEditArticle || { id: Date.now() };
  article.title = titleInput.value.trim();
  article.category = categorySelect.value;
  article.content = contentTextarea.value.trim();
  article.date = article.date || new Date().toISOString().split('T')[0];
  
  // Ajouter ou mettre à jour l'article dans la liste
  if (!this.state.currentEditArticle) {
    this.state.articles.push(article);
  } else {
    const index = this.state.articles.findIndex(a => a.id === article.id);
    if (index !== -1) {
      this.state.articles[index] = article;
    } else {
      this.state.articles.push(article);
    }
  }
  
  // Réinitialiser le formulaire
  titleInput.value = '';
  categorySelect.value = 'cinema';
  contentTextarea.value = '';
  this.state.currentEditArticle = null;
  
  // Mettre à jour l'interface
  this.updateArticlesTabContent(win.querySelector('#articles-tab'));
  
  // Notification
  alert("Article enregistré avec succès !");
};

AdminSimple.updateArticlesTabContent = function(tabElement) {
  const articlesList = tabElement.querySelector('tbody');
  
  if (this.state.articles.length === 0) {
    articlesList.innerHTML = `
      <tr>
        <td colspan="4" style="padding:15px;text-align:center;color:#666;">
          Aucun article disponible. Cliquez sur "Ajouter" pour créer votre premier article.
        </td>
      </tr>
    `;
    return;
  }
  
  articlesList.innerHTML = this.state.articles.map(article => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;">${article.title}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">${article.date}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">${article.category}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">
        <button class="article-action-btn" data-action="edit" data-id="${article.id}" style="background:#0058a8;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
          Modifier
        </button>
        <button class="article-action-btn" data-action="delete" data-id="${article.id}" style="background:#f44336;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
          Supprimer
        </button>
      </td>
    </tr>
  `).join('');
  
  // Ajouter les écouteurs d'événements aux boutons d'action
  const actionButtons = tabElement.querySelectorAll('.article-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const articleId = parseInt(btn.getAttribute('data-id'));
      this.handleArticleAction(action, articleId, tabElement.closest('.admin-window'));
    });
  });
};

AdminSimple.handleArticleAction = function(action, articleId, win) {
  console.log(`📄 Action article: ${action}, ID: ${articleId}`);
  
  const article = this.state.articles.find(a => a.id === articleId);
  
  switch (action) {
    case 'edit':
      if (article) {
        this.openArticleEditor(article, win);
      } else {
        alert(`Article avec ID ${articleId} non trouvé`);
      }
      break;
    case 'delete':
      if (article) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.title}" ?`)) {
          this.state.articles = this.state.articles.filter(a => a.id !== articleId);
          this.updateArticlesTabContent(win.querySelector('#articles-tab'));
        }
      } else {
        alert(`Article avec ID ${articleId} non trouvé`);
      }
      break;
    case 'view-pdf':
      if (article && article.pdfFile) {
        this.viewPdfArticle(article);
      } else {
        alert("Cet article n'a pas de PDF associé.");
      }
      break;
    default:
      console.log(`Action non reconnue: ${action}`);
  }
};

// Nouvelle fonction pour importer un article PDF
AdminSimple.importPdfArticle = function(win) {
  console.log("📥 Importation d'un article au format PDF");
  
  const fileInput = win.querySelector('#pdf-article-file');
  
  // Déclencher le clic sur l'input file
  fileInput.click();
  
  fileInput.addEventListener('change', (e) => {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      
      if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF');
        return;
      }
      
      // Demander les informations supplémentaires dans une mini fenêtre modale
      this.showPdfImportModal(win, file);
    }
  }, { once: true }); // Écouter une seule fois pour éviter les doublons
};

// Afficher une fenêtre modale pour compléter les informations de l'article PDF
AdminSimple.showPdfImportModal = function(win, pdfFile) {
  // Créer la fenêtre modale
  const modal = document.createElement('div');
  modal.className = 'xp-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  
  // Contenu de la fenêtre modale
  modal.innerHTML = `
    <div class="xp-modal-content" style="
      background: #ECE9D8;
      border: 1px solid #000;
      border-radius: 3px;
      width: 450px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      padding: 0;
      font-family: 'Tahoma', sans-serif;
      font-size: 11px;
    ">
      <div class="xp-titlebar" style="
        background: linear-gradient(to right, #0A246A, #A6CAF0);
        padding: 5px 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="color: white; font-weight: bold;">Importer un article PDF</span>
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
      <div style="padding: 15px;">
        <p style="margin-top: 0; margin-bottom: 10px;">Fichier PDF sélectionné: <strong>${pdfFile.name}</strong></p>
        <p style="margin-top: 0; margin-bottom: 15px;">Veuillez compléter les informations de l'article :</p>
        
        <div style="margin-bottom: 10px;">
          <label for="pdf-article-title" style="display: block; margin-bottom: 5px; font-weight: bold;">Titre de l'article:</label>
          <input type="text" id="pdf-article-title" style="width: 100%; padding: 5px; border: 1px solid #7B9EBD; border-radius: 2px;" value="${pdfFile.name.replace('.pdf', '')}">
        </div>
        
        <div style="margin-bottom: 15px;">
          <label for="pdf-article-category" style="display: block; margin-bottom: 5px; font-weight: bold;">Catégorie:</label>
          <select id="pdf-article-category" style="width: 100%; padding: 5px; border: 1px solid #7B9EBD; border-radius: 2px;">
            <option value="cinema">Cinéma</option>
            <option value="tech">Technologie</option>
            <option value="art">Art</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label for="pdf-article-description" style="display: block; margin-bottom: 5px; font-weight: bold;">Description courte:</label>
          <textarea id="pdf-article-description" style="width: 100%; padding: 5px; border: 1px solid #7B9EBD; border-radius: 2px; height: 80px; resize: vertical;"></textarea>
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button class="cancel-btn" style="
            padding: 5px 15px;
            background: #ECE9D8;
            border: 1px solid #ACA899;
            border-radius: 3px;
            cursor: pointer;
          ">Annuler</button>
          <button class="import-btn" style="
            padding: 5px 15px;
            background: #0058a8;
            color: white;
            border: 1px solid #003f7d;
            border-radius: 3px;
            cursor: pointer;
          ">Importer</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Écouteurs d'événements
  const closeBtn = modal.querySelector('.close-btn');
  const cancelBtn = modal.querySelector('.cancel-btn');
  const importBtn = modal.querySelector('.import-btn');
  
  const closeModal = () => {
    document.body.removeChild(modal);
  };
  
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  
  importBtn.addEventListener('click', () => {
    const title = modal.querySelector('#pdf-article-title').value.trim();
    const category = modal.querySelector('#pdf-article-category').value;
    const description = modal.querySelector('#pdf-article-description').value.trim();
    
    if (!title) {
      alert("Le titre de l'article est obligatoire");
      return;
    }
    
    // Créer un nouvel article avec le PDF
    const newArticle = {
      id: Date.now(),
      title: title,
      category: category,
      content: description,
      date: new Date().toISOString().split('T')[0],
      pdfFile: pdfFile,
      isPdf: true
    };
    
    // Ajouter l'article à la liste
    this.state.articles.push(newArticle);
    
    // Mettre à jour l'interface
    this.updateArticlesTabContent(win.querySelector('#articles-tab'));
    
    // Fermer la fenêtre modale
    closeModal();
    
    // Notification
    alert("Article PDF importé avec succès !");
  });
};

// Afficher un aperçu du PDF
AdminSimple.viewPdfArticle = function(article) {
  // Dans une application réelle, cette fonction afficherait le PDF dans un visualiseur
  // Ici, nous allons simuler l'ouverture d'un nouvel onglet
  alert(`Aperçu du PDF: ${article.title}\n\nDans une application réelle, cette fonction ouvrirait le PDF dans un visualiseur intégré ou dans un nouvel onglet.`);
};

// Étendre la méthode updateArticlesTabContent pour afficher les articles PDF
const originalUpdateArticlesTabContent = AdminSimple.updateArticlesTabContent;
AdminSimple.updateArticlesTabContent = function(tabElement) {
  const articlesList = tabElement.querySelector('tbody');
  
  if (this.state.articles.length === 0) {
    articlesList.innerHTML = `
      <tr>
        <td colspan="4" style="padding:15px;text-align:center;color:#666;">
          Aucun article disponible. Cliquez sur "Ajouter" pour créer votre premier article.
        </td>
      </tr>
    `;
    return;
  }
  
  articlesList.innerHTML = this.state.articles.map(article => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #ddd;">
        ${article.title}
        ${article.isPdf ? '<span style="margin-left:5px;padding:2px 5px;background:#f0f0f0;border-radius:3px;font-size:11px;color:#666;border:1px solid #ddd;">PDF</span>' : ''}
      </td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">${article.date}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">${article.category}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #ddd;">
        ${article.isPdf ? `
          <button class="article-action-btn" data-action="view-pdf" data-id="${article.id}" style="background:#7952b3;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
            Voir PDF
          </button>
        ` : `
          <button class="article-action-btn" data-action="edit" data-id="${article.id}" style="background:#0058a8;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
            Modifier
          </button>
        `}
        <button class="article-action-btn" data-action="delete" data-id="${article.id}" style="background:#f44336;color:white;border:none;border-radius:3px;padding:3px 8px;margin:0 2px;cursor:pointer;">
          Supprimer
        </button>
      </td>
    </tr>
  `).join('');
  
  // Ajouter les écouteurs d'événements aux boutons d'action
  const actionButtons = tabElement.querySelectorAll('.article-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const articleId = parseInt(btn.getAttribute('data-id'));
      this.handleArticleAction(action, articleId, tabElement.closest('.admin-window'));
    });
  });
};

// Fonctions pour la gestion du CV
AdminSimple.addExperience = function(win) {
  const experiencesList = win.querySelector('#experiences-list');
  
  const newExperience = document.createElement('div');
  newExperience.className = 'experience-item';
  newExperience.style.cssText = 'border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;';
  
  newExperience.innerHTML = `
    <div style="margin-bottom:10px;">
      <input type="text" placeholder="Poste occupé" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
    </div>
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <input type="text" placeholder="Entreprise" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
      <input type="text" placeholder="Période" style="width:180px;padding:8px;border:1px solid #ccc;border-radius:3px;">
    </div>
    <textarea placeholder="Description" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;min-height:80px;resize:vertical;"></textarea>
    <div style="text-align:right;margin-top:10px;">
      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
    </div>
  `;
  
  experiencesList.appendChild(newExperience);
  
  // Ajouter l'écouteur d'événement pour le bouton de suppression
  newExperience.querySelector('.remove-item').addEventListener('click', function() {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
      experiencesList.removeChild(newExperience);
    }
  });
};

AdminSimple.addEducation = function(win) {
  const educationList = win.querySelector('#education-list');
  
  const newEducation = document.createElement('div');
  newEducation.className = 'education-item';
  newEducation.style.cssText = 'border:1px solid #eee;border-radius:3px;padding:15px;margin-bottom:10px;background:#f9f9f9;';
  
  newEducation.innerHTML = `
    <div style="margin-bottom:10px;">
      <input type="text" placeholder="Diplôme" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:3px;font-weight:bold;">
    </div>
    <div style="display:flex;gap:10px;margin-bottom:10px;">
      <input type="text" placeholder="École" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
      <input type="text" placeholder="Année" style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
    </div>
    <div style="text-align:right;margin-top:10px;">
      <button class="remove-item" style="padding:5px 10px;background:#f44336;color:white;border:none;border-radius:3px;cursor:pointer;">Supprimer</button>
    </div>
  `;
  
  educationList.appendChild(newEducation);
  
  // Ajouter l'écouteur d'événement pour le bouton de suppression
  newEducation.querySelector('.remove-item').addEventListener('click', function() {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      educationList.removeChild(newEducation);
    }
  });
};

AdminSimple.addSkill = function(win) {
  const skillsList = win.querySelector('#skills-list');
  
  const newSkill = document.createElement('div');
  newSkill.style.cssText = 'margin-bottom:10px;';
  
  newSkill.innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:5px;">
      <input type="text" placeholder="Compétence" style="flex:1;padding:8px;border:1px solid #ccc;border-radius:3px;">
      <select style="width:100px;padding:8px;border:1px solid #ccc;border-radius:3px;">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3" selected>3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    </div>
    <div class="skill-bar" style="height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
      <div style="height:100%;background:#0058a8;width:60%;"></div>
    </div>
  `;
  
  // Insérer avant le bouton d'ajout
  const addSkillBtn = skillsList.querySelector('[data-action="add-skill"]').parentNode;
  skillsList.insertBefore(newSkill, addSkillBtn);
  
  // Mettre à jour la barre de compétence lorsque le niveau change
  const select = newSkill.querySelector('select');
  const skillBar = newSkill.querySelector('.skill-bar > div');
  
  select.addEventListener('change', function() {
    const level = parseInt(this.value);
    const percentage = (level / 5) * 100;
    skillBar.style.width = `${percentage}%`;
  });
};

AdminSimple.handleCvFileUpload = function(win) {
  const fileInput = win.querySelector('#cv-file');
  const cvPreview = win.querySelector('#cv-preview');
  
  // Déclencher le clic sur l'input file
  fileInput.click();
  
  fileInput.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      
      if (file.type !== 'application/pdf') {
        alert('Veuillez sélectionner un fichier PDF');
        return;
      }
      
      // Stocker le fichier
      AdminSimple.state.cv.cvFile = file;
      
      // Afficher l'aperçu
      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      const fileSize = Math.round(file.size / 1024);
      
      cvPreview.style.display = 'block';
      cvPreview.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="icons/cv.png" style="width:24px;height:24px;">
          <div style="flex:1;">
            <p style="margin:0;font-weight:bold;">${file.name}</p>
            <p style="margin:0;font-size:12px;color:#666;">${fileSize} KB - Téléversé le ${dateStr}</p>
          </div>
          <button style="background:none;border:none;cursor:pointer;color:#f44336;" title="Supprimer">✕</button>
        </div>
      `;
      
      // Ajouter l'écouteur d'événement pour supprimer le fichier
      cvPreview.querySelector('button').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
          AdminSimple.state.cv.cvFile = null;
          cvPreview.style.display = 'none';
          fileInput.value = '';
        }
      });
    }
  }, { once: true }); // Écouter une seule fois pour éviter les doublons
};

AdminSimple.generateCvFromData = function(win) {
  // Cette fonction simule la génération d'un PDF à partir des données du CV
  // Dans une implémentation réelle, vous utiliseriez une bibliothèque comme jsPDF
  
  alert("Génération du CV en PDF simulée.\n\nDans une application réelle, cette fonctionnalité générerait un PDF à partir des informations du formulaire.");
  
  const cvPreview = win.querySelector('#cv-preview');
  cvPreview.style.display = 'block';
  
  // Afficher un aperçu simulé
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  
  cvPreview.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="icons/cv.png" style="width:24px;height:24px;">
      <div style="flex:1;">
        <p style="margin:0;font-weight:bold;">CV_${this.state.cv.personalInfo.name.replace(' ', '_')}.pdf</p>
        <p style="margin:0;font-size:12px;color:#666;">156 KB - Généré le ${dateStr}</p>
      </div>
      <button style="background:none;border:none;cursor:pointer;color:#f44336;" title="Supprimer">✕</button>
    </div>
  `;
  
  // Ajouter l'écouteur d'événement pour supprimer le fichier
  cvPreview.querySelector('button').addEventListener('click', function() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fichier ?')) {
      AdminSimple.state.cv.cvFile = null;
      cvPreview.style.display = 'none';
    }
  });
};

AdminSimple.saveCvData = function(win) {
  console.log("💾 Sauvegarde des données du CV");
  
  // Récupérer les informations personnelles
  this.state.cv.personalInfo.name = win.querySelector('#cv-name').value.trim();
  this.state.cv.personalInfo.title = win.querySelector('#cv-title').value.trim();
  this.state.cv.personalInfo.email = win.querySelector('#cv-email').value.trim();
  this.state.cv.personalInfo.bio = win.querySelector('#cv-bio').value.trim();
  
  // Récupérer les expériences professionnelles
  this.state.cv.experiences = [];
  const experienceItems = win.querySelectorAll('#experiences-list .experience-item');
  experienceItems.forEach(item => {
    const inputs = item.querySelectorAll('input');
    const textarea = item.querySelector('textarea');
    
    if (inputs[0].value.trim()) {
      this.state.cv.experiences.push({
        position: inputs[0].value.trim(),
        company: inputs[1].value.trim(),
        period: inputs[2].value.trim(),
        description: textarea.value.trim()
      });
    }
  });
  
  // Récupérer les formations
  this.state.cv.education = [];
  const educationItems = win.querySelectorAll('#education-list .education-item');
  educationItems.forEach(item => {
    const inputs = item.querySelectorAll('input');
    
    if (inputs[0].value.trim()) {
      this.state.cv.education.push({
        degree: inputs[0].value.trim(),
        school: inputs[1].value.trim(),
        year: inputs[2].value.trim()
      });
    }
  });
  
  // Récupérer les compétences
  this.state.cv.skills = [];
  const skillItems = win.querySelectorAll('#skills-list > div:not(:last-child)');
  skillItems.forEach(item => {
    const input = item.querySelector('input');
    const select = item.querySelector('select');
    
    if (input && input.value.trim()) {
      this.state.cv.skills.push({
        name: input.value.trim(),
        level: parseInt(select.value)
      });
    }
  });
  
  // Notification
  alert("Données du CV enregistrées avec succès !");
  
  // Mettre à jour la barre d'état
  const statusbar = win.querySelector('.admin-statusbar span:first-child');
  statusbar.textContent = 'CV enregistré avec succès';
  setTimeout(() => {
    statusbar.textContent = 'Prêt';
  }, 2000);
};

// Étendre la fonction loadTab pour charger dynamiquement le contenu des onglets Articles et CV
const originalLoadTab = AdminSimple.loadTab;
AdminSimple.loadTab = function(tabName, win) {
  // Appeler la fonction originale
  originalLoadTab.call(this, tabName, win);
  
  // Charger dynamiquement le contenu des onglets
  if (tabName === 'articles') {
    this.updateArticlesTabContent(win.querySelector('#articles-tab'));
  }
  
  // Ajouter des écouteurs d'événements pour les boutons de suppression dans le CV
  if (tabName === 'cv') {
    // Ajouter des écouteurs pour les boutons de suppression existants
    win.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', function() {
        const parentItem = this.closest('.experience-item, .education-item');
        if (parentItem && confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
          parentItem.parentNode.removeChild(parentItem);
        }
      });
    });
    
    // Ajouter l'écouteur pour le bouton d'upload de CV
    const uploadCvBtn = win.querySelector('[data-action="upload-cv"]');
    const cvFileInput = win.querySelector('#cv-file');
    
    if (uploadCvBtn && cvFileInput) {
      uploadCvBtn.addEventListener('click', () => {
        AdminSimple.handleCvFileUpload(win);
      });
    }
  }
};

console.log("✅ Fonctionnalités d'articles et CV chargées avec succès");
