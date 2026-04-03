# IS113GroupProject6 - Movie Hub Application

A full-stack web application for browsing movies, searching TMDB, maintaining a personal watchlist, and posting movie reviews. Built with **Express.js**, **MongoDB (Mongoose)**, and **EJS** using an MVC-ish structure (`routes/`, `controllers/`, `models/`, `views/`).

## Features
- **Authentication & Sessions**: Register, login, logout (session-based)
- **Movie Browsing**: Home page shows popular movies (cached)
- **Recommendations**: Personalised movie suggestions using linear regression over genre engagement (search history, watchlist, view counts)
- **Search + Search History**: Search TMDB and (when logged in) store/clear search history
- **Watchlist**: Add movies, mark watched/unwatched, remove items
- **Movie Reviews**: Post, update, and delete reviews (login required)
- **Account Management**: Update username, update email, change password, delete account (with cascade deletion)
- **Admin Dashboard**: Manage users and reviews, plus activity-based stats (admin-only)

## Tech Stack
- **Backend**: Express.js (Node.js, CommonJS)
- **Database**: MongoDB with Mongoose ODM
- **Templates**: EJS
- **Auth**: `express-session` + role-based checks
- **External API**: TMDB (The Movie Database)

## Project Structure
```
IS113GroupProject6/
├── controllers/                 # request handlers / page logic
│   ├── account-controller.js
│   ├── admin-controller.js
│   ├── home-controller.js
│   ├── login-controller.js
│   ├── moviereviews-controller.js
│   ├── register-controller.js
│   ├── search-controller.js
│   └── watchlist-controller.js
├── data/                        # API + DB helpers
│   ├── mongo.js
│   ├── movies.js
│   └── recommendations.js
├── middleware/                  # auth checks
│   └── auth-middleware.js
├── models/                      # mongoose models
│   ├── movie-cache-model.js
│   ├── movie-trailer-model.js
│   ├── moviereviews-model.js
│   ├── moviestats-model.js
│   ├── searchHistory-model.js
│   ├── user.js
│   └── watchlist-model.js
├── public/
│   ├── css/
│   │   └── style.css
│   └── index.html
├── routes/                      # express routes
│   ├── account-routes.js
│   ├── admin-routes.js
│   ├── home-routes.js
│   ├── login-routes.js
│   ├── moviereviews-routes.js
│   ├── register-routes.js
│   ├── search-route.js
│   └── watchlist-routes.js
├── views/                       # EJS templates
│   ├── account.ejs
│   ├── admin.ejs
│   ├── change-password.ejs
│   ├── delete-account.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── moviereviews.ejs
│   ├── register.ejs
│   ├── search.ejs
│   ├── update-email.ejs
│   ├── update-username.ejs
│   └── watchlist.ejs
├── server.js                    # main express app
├── package.json
└── config.env                   # environment variables (see below)
```

## Installation
1. **Clone the repository**
```bash
git clone https://github.com/aalricc/IS113GroupProject6.git
cd IS113GroupProject6
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

This app loads env vars from **`config.env`** (project root).

```env
# used by express-session
SECRET=JQBDVHDEGIUFGQUYF3872471648291JDNJN*&@T&;iuehfgiuqfgefuigdhsbfifh

# MongoDB connection string
DB=mongodb+srv://lucasleow2025_db_user:x3kAH8gbmTu5tWZl@main.a7dfili.mongodb.net/is113project?retryWrites=true&w=majority

# TMDB API key
TMDB_API_KEY=1a5d529ccb58f5db5d1c537364032cd0
```

4. **Start the application**
```bash
npm start
```

5. **Open in your browser**
```text
http://localhost:8000
```

## Usage

### For Users
1. **Browse movies**: Visit the home page (`/`) to view popular movies
2. **Search**: Use `/search?query=...` to search for movies
3. **Create an account**: Register at `/register`, then log in at `/login`
4. **Watchlist**: Manage your watchlist at `/watchlist`
5. **Reviews**: Open a movie page at `/movie-reviews/:id` and post a review when logged in
6. **Account settings**: From `/account`, update your username, email, password, or delete your account

### For Admins
- Visit **`/admin-page`** (requires an authenticated user with `role: "admin"`)
- Manage users (create/update/delete) and delete reviews

## API / Route Endpoints

### Home
- `GET /` - Home page (popular movies + recommendations for logged-in users)
- `POST /clear-movie-cache` - Clears the cached popular movies (admin UI may call this)

### Auth
- `GET /login` - Login page
- `POST /login-attempt` - Login attempt
- `GET /logout` - Logout
- `GET /register` - Register page
- `POST /register-attempt` - Register attempt

### Search
- `GET /search` - Search page (query via `?query=...`)
- `POST /history-clear` - Clear logged-in user's search history

### Watchlist
- `GET /watchlist` - Watchlist page
- `POST /watchlist/createMovie` - Add a movie to watchlist
- `POST /watchlist/removeMovie` - Remove a movie
- `POST /watchlist/markWatched` - Mark watched
- `POST /watchlist/markUnwatched` - Mark unwatched

### Account Management (login required)
- `GET /account/update-username` - Update username page
- `POST /account/update-username` - Update username
- `GET /account/update-email` - Update email page
- `POST /account/update-email` - Update email
- `GET /account/change-password` - Change password page
- `POST /account/change-password` - Change password
- `GET /account/delete-account` - Delete account page
- `POST /account/delete-account` - Delete account (cascades: removes user, reviews, search history, watchlist)

### Movie Reviews
- `GET /movie-reviews/:id` - Movie reviews page
- `POST /movie-reviews/:id` - Create a review (login required)
- `POST /delete-review/:reviewId/:movieId` - Delete a review (login required)
- `POST /update-review/:reviewId/:movieId` - Update a review (login required)

### Admin (login + admin role required)
- `GET /admin-page` - Admin dashboard
- `POST /admin-create-user` - Create user
- `POST /admin-update-user/:id` - Update user
- `POST /admin-delete-user/:id` - Delete user
- `POST /admin-delete-review/:reviewId` - Delete a review

## Database Schema

### User (`models/user.js`)
- username: String (unique, required)
- password: String (required, hashed)
- email: String (unique, required)
- role: String (enum: `user`, `admin`; default: `user`)
- loginAttempt: Number (default: 0)
- lockUntil: Date (default: null)

### Watchlist (`models/watchlist-model.js`)
- username: String (required)
- movieName: String (required)
- rating: Number (optional)
- dateAdded: Date (required, default: now)
- hasWatched: Boolean (required, default: false)
- movieId: Number (required)

### Review (`models/moviereviews-model.js`)
- movieId: String (required, indexed)
- reviewContent: String (required)
- rating: Number (required, min: 1, max: 10)
- userId: String (required)
- username: String (required)
- createdAt: Date (auto via timestamps)
- updatedAt: Date (auto via timestamps)

### SearchHistory (`models/searchHistory-model.js`)
- userId: String (default: empty string)
- query: String (required)
- results: Array (default: empty array)
- resultCount: Number (default: 0)
- searchCount: Number (default: 0)
- searchedAt: Date (default: 0)

### MovieCache (`models/movie-cache-model.js`)
- cacheKey: String (unique, required)
- movies: Array (default: empty array)
- updatedAt: Date (default: now)

### MovieStats (`models/moviestats-model.js`)
- movieId: String (unique, required)
- viewCount: Number (default: 0)
- averageRating: Number (default: null)
- totalReviews: Number (default: 0)

### UserView (`models/moviestats-model.js`)
- userId: String (required, indexed)
- movieId: String (required, indexed)
- viewCount: Number (default: 1, min: 1)
- createdAt: Date (auto via timestamps)
- updatedAt: Date (auto via timestamps)

### MovieTrailer (`models/movie-trailer-model.js`)
- movieId: String (unique, required)
- movieName: String (required)
- trailerName: String (required)
- youtubeKey: String (required)
- createdAt: Date (auto via timestamps)
- updatedAt: Date (auto via timestamps)

