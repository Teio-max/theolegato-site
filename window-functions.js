// Fonctions de création des fenêtres principales
// Ce fichier définit les fonctions de création de fenêtres pour les icônes du bureau

// Création de la fenêtre Films
WindowManager.createFilmsWindow = function() {
  console.log("🎬 Création de la fenêtre Films");
  
  // Générer le contenu HTML pour les films
  let content = `
    <div class="films-container" style="padding: 20px;">
      <h2 style="margin-bottom: 20px; color: #003399;">Ma Collection de Films</h2>
      <div id="films-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
        ${this.generateFilmsContent()}
      </div>
    </div>
  `;
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'Films',
    icon: 'icons/film.png',
    width: 800,
    height: 600,
    content: content
  });
};

// Générer le contenu des films à partir des données
WindowManager.generateFilmsContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.films) {
    return '<p>Aucun film disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque film
  window.DataManager.data.films.forEach(film => {
    const poster = film.poster || 'https://via.placeholder.com/150x200?text=No+Poster';
    content += `
      <div class="film-card" style="border: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 220px; overflow: hidden;">
          <img src="${poster}" alt="${film.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${film.title}</h3>
          <p style="margin: 0; color: #666; font-size: 14px;">${film.year || 'Année inconnue'}</p>
        </div>
      </div>
    `;
  });
  
  return content || '<p>Aucun film disponible pour le moment.</p>';
};

// Création de la fenêtre Articles
WindowManager.createArticlesWindow = function() {
  console.log("📝 Création de la fenêtre Articles");
  
  // Générer le contenu HTML pour les articles
  let content = `
    <div class="articles-container" style="padding: 20px;">
      <h2 style="margin-bottom: 20px; color: #003399;">Mes Articles</h2>
      <div id="articles-list" style="display: flex; flex-direction: column; gap: 15px;">
        ${this.generateArticlesContent()}
      </div>
    </div>
  `;
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'Articles',
    icon: 'icons/article.png',
    width: 700,
    height: 500,
    content: content
  });
};

// Générer le contenu des articles à partir des données
WindowManager.generateArticlesContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.articles) {
    return '<p>Aucun article disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque article
  window.DataManager.data.articles.forEach(article => {
    content += `
      <div class="article-item" style="border: 1px solid #ddd; border-radius: 6px; padding: 15px; background-color: #f9f9f9;">
        <h3 style="margin: 0 0 10px; color: #444;">${article.title}</h3>
        <p style="margin: 0 0 10px; color: #666; font-size: 14px;">Date: ${article.date || 'Non spécifiée'}</p>
        <div style="color: #333; font-size: 15px; line-height: 1.5;">
          ${article.summary || 'Aucun résumé disponible.'}
        </div>
      </div>
    `;
  });
  
  return content || '<p>Aucun article disponible pour le moment.</p>';
};

// Création de la fenêtre CV
WindowManager.createCVWindow = function() {
  console.log("📄 Création de la fenêtre CV");
  
  // Générer le contenu HTML pour le CV
  let content = `
    <div class="cv-container" style="padding: 20px;">
      <h2 style="margin-bottom: 20px; color: #003399;">Mon CV</h2>
      
      <div class="cv-section" style="margin-bottom: 25px;">
        <h3 style="border-bottom: 2px solid #003399; padding-bottom: 5px; color: #003399;">Formation</h3>
        <ul style="list-style-type: none; padding-left: 10px;">
          <li style="margin: 10px 0;">
            <strong>2023 - 2025</strong>: Master en Développement Web - École de l'Innovation Numérique
          </li>
          <li style="margin: 10px 0;">
            <strong>2020 - 2023</strong>: Licence en Informatique - Université de Technologie
          </li>
        </ul>
      </div>
      
      <div class="cv-section" style="margin-bottom: 25px;">
        <h3 style="border-bottom: 2px solid #003399; padding-bottom: 5px; color: #003399;">Expérience Professionnelle</h3>
        <ul style="list-style-type: none; padding-left: 10px;">
          <li style="margin: 10px 0;">
            <strong>2024 - Présent</strong>: Développeur Web Full Stack - TechCompany
            <p style="margin: 5px 0 0 0; color: #555;">Développement d'applications web modernes avec React et Node.js</p>
          </li>
          <li style="margin: 10px 0;">
            <strong>2022 - 2024</strong>: Développeur Front-End - StartupInnovante
            <p style="margin: 5px 0 0 0; color: #555;">Conception et implémentation d'interfaces utilisateur réactives</p>
          </li>
        </ul>
      </div>
      
      <div class="cv-section" style="margin-bottom: 25px;">
        <h3 style="border-bottom: 2px solid #003399; padding-bottom: 5px; color: #003399;">Compétences</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; padding-top: 10px;">
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">JavaScript</span>
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">HTML/CSS</span>
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">React</span>
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">Node.js</span>
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">SQL</span>
          <span style="background-color: #e1e1e1; padding: 5px 10px; border-radius: 15px; font-size: 14px;">Git</span>
        </div>
      </div>
      
      <div class="cv-section">
        <h3 style="border-bottom: 2px solid #003399; padding-bottom: 5px; color: #003399;">Langues</h3>
        <ul style="list-style-type: none; padding-left: 10px;">
          <li style="margin: 10px 0;"><strong>Français</strong>: Langue maternelle</li>
          <li style="margin: 10px 0;"><strong>Anglais</strong>: Courant</li>
          <li style="margin: 10px 0;"><strong>Espagnol</strong>: Intermédiaire</li>
        </ul>
      </div>
    </div>
  `;
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'CV',
    icon: 'icons/cv.png',
    width: 750,
    height: 600,
    content: content
  });
};

// Création de la fenêtre Mangas
WindowManager.createMangasWindow = function() {
  console.log("📚 Création de la fenêtre Mangas");
  
  // Générer le contenu HTML pour les mangas
  let content = `
    <div class="mangas-container" style="padding: 20px;">
      <h2 style="margin-bottom: 20px; color: #003399;">Ma Collection de Mangas</h2>
      <div id="mangas-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px;">
        ${this.generateMangasContent()}
      </div>
    </div>
  `;
  
  // Créer la fenêtre
  return this.createWindow({
    title: 'Mangas',
    icon: 'icons/portfolio.png',
    width: 800,
    height: 600,
    content: content
  });
};

// Générer le contenu des mangas à partir des données
WindowManager.generateMangasContent = function() {
  let content = '';
  
  // Vérifier si les données sont disponibles
  if (typeof window.DataManager === 'undefined' || !window.DataManager.data || !window.DataManager.data.mangas) {
    return '<p>Aucun manga disponible pour le moment.</p>';
  }
  
  // Générer le HTML pour chaque manga
  window.DataManager.data.mangas.forEach(manga => {
    const cover = manga.cover || 'https://via.placeholder.com/150x200?text=No+Cover';
    const status = manga.status || 'unknown';
    let statusClass = '';
    let statusText = '';
    
    // Déterminer la classe et le texte pour le statut
    switch (status.toLowerCase()) {
      case 'finished':
      case 'terminé':
      case 'complete':
        statusClass = 'completed';
        statusText = 'Terminé';
        break;
      case 'ongoing':
      case 'en cours':
        statusClass = 'ongoing';
        statusText = 'En cours';
        break;
      case 'hiatus':
      case 'pause':
        statusClass = 'hiatus';
        statusText = 'En pause';
        break;
      default:
        statusClass = 'unknown';
        statusText = 'Inconnu';
    }
    
    content += `
      <div class="manga-card" style="border: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="height: 220px; overflow: hidden;">
          <img src="${cover}" alt="${manga.title}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 12px;">
          <h3 style="margin: 0 0 8px; font-size: 16px;">${manga.title}</h3>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #666; font-size: 14px;">Volumes: ${manga.volumes || '?'}</span>
            <span class="manga-status ${statusClass}" style="padding: 2px 8px; border-radius: 12px; font-size: 12px;">${statusText}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  return content || '<p>Aucun manga disponible pour le moment.</p>';
};
