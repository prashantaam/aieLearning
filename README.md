# AI Learning Assistant — Laravel 12 + React

Converted from the original MERN (Node/Express + MongoDB + React) stack.

- `backend/`  — Laravel 12 API (MySQL, Sanctum auth, Gemini AI service). See `backend/README.md` for setup.
- `frontend/` — The original React app, lightly adjusted for the new backend. See `frontend/README-CONVERSION-NOTES.md` for what changed.

## Quick start

1. **Backend**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   # set your MySQL credentials + GEMINI_API_KEY in .env
   php artisan migrate
   php artisan storage:link
   php artisan serve --port=8000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The frontend's `BASE_URL` (in `src/utils/apiPaths.js`) already points to
`http://localhost:8000`, matching the Laravel dev server above.
