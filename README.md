# 🌿 Tourist Destination – Travel App

A full-stack web application where travellers can discover, share and remember beautiful places. Users can post destinations with photos, like and comment on them, and search by place name or location.

**🔗 Live demo:** https://tourist-destination-app-pac2.onrender.com

> The app is hosted on Render's free tier, so the first load may take up to a minute while the server wakes up.

---

## ✨ Features

- **User accounts** – register and log in with token-based authentication
- **Browse destinations** – anyone can view the destination list without logging in
- **Add a destination** – place name, location, weather, Google Maps link, description and visitor information, with **multiple photos**
- **Edit a destination** – update details and add more photos (only the person who posted it can edit or delete)
- **Likes, comments and shares** – logged-in users can like, comment on and share destinations
- **Search** – find places by name or location
- **Visitor information and comments** – shown only to logged-in users
- **User profile** – country, state and district saved for each user
- **Cloud photo storage** – photos are stored on Cloudinary so they persist across deployments

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL |
| Frontend | HTML, CSS, JavaScript (Fetch API) |
| Authentication | DRF Token Authentication |
| Media storage | Cloudinary |
| Static files | WhiteNoise |
| Hosting | Render |

## 📸 Screenshots

<!-- Add your screenshots to a /screenshots folder and update the paths below -->

| Home | Destinations | Add Destination |
|---|---|---|
| ![Home](screenshots/home.png) | ![Destinations](screenshots/destinations.png) | ![Add](screenshots/add-destination.png) |

## 📁 Project Structure

```
├── Travel/                  # Django project settings and root URLs
├── Tourist_Destinations/    # Main app: models, serializers, views, API URLs
├── templates/               # HTML pages
├── static/                  # CSS, JavaScript and images
├── manage.py
└── requirements.txt
```

## 🔌 API Endpoints

| Method | Endpoint | Description | Login required |
|---|---|---|---|
| POST | `/api/users/` | Register a new user | No |
| POST | `/api/users/login/` | Log in and receive a token | No |
| GET | `/api/destinations/` | List destinations (supports `?search=`) | No |
| POST | `/api/destinations/` | Add a destination with photos | Yes |
| GET | `/api/destinations/{id}/` | View one destination | No |
| PATCH | `/api/destinations/{id}/` | Update a destination or add photos | Owner only |
| DELETE | `/api/destinations/{id}/` | Delete a destination | Owner only |
| POST | `/api/destinations/{id}/like/` | Like or unlike a destination | Yes |
| POST | `/api/destinations/{id}/share/` | Increase the share count | Yes |
| GET, POST | `/api/destinations/{id}/comments/` | View or add comments | Yes |

Authenticated requests send the header: `Authorization: Token <your_token>`

## 🚀 Run Locally

**Prerequisites:** Python 3.10+, PostgreSQL, and a free [Cloudinary](https://cloudinary.com) account.

1. **Clone the repository**
   ```bash
   git clone https://github.com/suruthikaJeyaram/tourist-destination-travel-app.git
   cd tourist-destination-travel-app
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   source venv/bin/activate     # macOS / Linux
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file** in the project root (next to `manage.py`):
   ```env
   SECRET_KEY=your-secret-key
   DEBUG=True
   DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/DB_NAME
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```

5. **Allow local hosts** – make sure `localhost` and `127.0.0.1` are listed in `ALLOWED_HOSTS` in `Travel/settings.py`.

6. **Run migrations and start the server**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser   # optional, for the admin panel
   python manage.py runserver
   ```

7. Open **http://127.0.0.1:8000/** in your browser.

## ☁️ Deployment (Render)

1. Push the code to GitHub and create a **Web Service** on Render connected to the repository.
2. Set the **Build Command** to install dependencies, collect static files and run migrations, for example:
   ```bash
   pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   ```
3. Set the **Start Command**, for example: `gunicorn Travel.wsgi`
4. Add these **Environment Variables** in the Render dashboard: `SECRET_KEY`, `DEBUG` (set to `False`), `DATABASE_URL` and `CLOUDINARY_URL`.

> Never commit your `.env` file or real keys to GitHub.

## 🔮 Future Improvements

- Delete individual photos while editing a destination
- User profile page with the destinations they have posted
- Pagination for the destinations list
- Image compression before upload

## 👩‍💻 Author

**Suruthika** – Python Full Stack Developer
GitHub: [@suruthikaJeyaram](https://github.com/suruthikaJeyaram)
