# 🧑‍💻 Portfolio — Ibrahima Baby

> Portfolio personnel développé avec **Node.js / Express** en architecture **MVC**, déployé sur [ahobaut.fr](https://ahobaut.fr).

![Node.js](https://images.ctfassets.net/aq13lwl6616q/7cS8gBoWulxkWNWEm0FspJ/c7eb42dd82e27279307f8b9fc9b136fa/nodejs_cover_photo_smaller_size.png)
![Express]([https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white](https://miro.medium.com/1*0xWhD2FQZJT84o7jAAkGRg.jpeg)
![Architecture](https://www.codurance.com/hubfs/Imported_Blog_Media/mvc.png)

---

## 📸 Démo

🔗 **Site en ligne** : [https://ahobaut.fr](https://ahobaut.fr)

> capture d'écran  :

---

## ✨ Fonctionnalités

- Présentation des projets personnels et professionnels
- Page de contact fonctionnelle
- Design responsive (mobile & desktop)
- Architecture MVC claire et maintenable
- Rendu côté serveur avec Express + moteur de templates

---

## 🏗️ Architecture MVC

Le projet suit le patron de conception **Model — View — Controller** :

```
portfolio-ibrahima/
│
├── app/
│   ├── controllers/        # Gestion des requêtes HTTP
│   │   ├── homeController.js
│   │   ├── projectController.js
│   │   └── contactController.js
│   │
│   ├── models/             # Données & logique métier
│   │   ├── Project.js
│   │   └── Contact.js
│   │
│   └── views/              # Templates HTML (EJS / Pug / Handlebars)
│       ├── layouts/
│       │   └── main.ejs
│       ├── home.ejs
│       ├── projects.ejs
│       └── contact.ejs
│
├── public/                 # Fichiers statiques
│   ├── css/
│   ├── js/
│   └── images/
│
├── routes/                 # Définition des routes
│   └── index.js
│
├── app.js                  # Point d'entrée Express
├── package.json
└── README.md
```

### Flux d'une requête

```
Utilisateur
    │
    ▼ GET /projets
Controller  ──────►  Model  (récupère les données)
    │                  │
    │◄─────────────────┘ (retourne les données)
    │
    ▼ render('projects', data)
  View  ──────►  HTML final  ──────►  Navigateur
```

---

## 📦 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre avec nodemon (rechargement auto) |
| `npm start` | Démarre en mode production |
| `npm test` | Lance les tests (si configurés) |

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour proposer une amélioration :

1. **Fork** le projet
2. Crée une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commit tes changements : `git commit -m 'feat: ajout de ma fonctionnalité'`
4. Push la branche : `git push origin feature/ma-fonctionnalite`
5. Ouvre une **Pull Request**

---

## 📄 Licence

Ce projet est sous licence **MIT** — voir le fichier [LICENSE](./LICENSE) pour plus de détails.


---

<p align="center">Fait pour Ibrahima Baby</p>
