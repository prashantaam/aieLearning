# AI Learning Assistant — Laravel 12 API

This is a Laravel 12 conversion of the original Node/Express + MongoDB backend.
It exposes the **exact same routes** (`/api/auth`, `/api/documents`,
`/api/flashcards`, `/api/ai`, `/api/quizzes`, `/api/progress`) so the React
frontend in `../frontend` works against it with no changes to `apiPaths.js`.

## What changed vs. the Node version

| Original (Node/Express/Mongo)     | Laravel 12 equivalent                          |
|------------------------------------|-------------------------------------------------|
| Mongoose models                    | Eloquent models (`app/Models`)                  |
| MongoDB (`_id` ObjectId)           | **MySQL**, auto-increment `id` (see note below) |
| JWT (`jsonwebtoken`)               | Laravel Sanctum personal access tokens          |
| `middleware/auth.js` (`protect`)   | `auth:sanctum` middleware                       |
| Multer                             | Laravel's built-in file upload + `storage` disk |
| `pdf-parse`                        | `smalot/pdfparser`                              |
| `@google/genai` SDK                | `App\Services\GeminiService` (Gemini REST API via Laravel's HTTP client) |
| `utils/textChunker.js`             | `App\Services\TextChunkerService` (line-for-line port) |
| Manual `res.json({success, ...})`  | Same JSON envelope, built in each controller    |
| Background PDF processing (fire-and-forget async fn) | `App\Jobs\ProcessDocumentUpload` (queued job, `sync` by default) |

**Note on IDs:** MongoDB documents used `_id`. This Laravel version uses normal
auto-increment integer `id`s. The frontend has been updated (`._id` → `.id`)
to match — see `../frontend/README-CONVERSION-NOTES.md`.

Sub-documents that Mongo auto-assigned an `_id` to (flashcard **cards** and
quiz **questions**, both stored as JSON columns) are given a generated UUID
`id` field when created, so the frontend's existing logic (star/review by
card id, local answer-tracking by question id) keeps working unchanged.

## Requirements

- PHP 8.2+
- Composer
- MySQL 8+ (or MariaDB 10.6+)
- (Optional) A queue worker if you want PDF processing to happen truly async — by default `QUEUE_CONNECTION=sync` runs it inline right after upload.

## Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edit `.env` and set your MySQL credentials:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_learning_assistant
DB_USERNAME=root
DB_PASSWORD=your_password
```

Create the database, then run migrations:

```bash
mysql -u root -p -e "CREATE DATABASE ai_learning_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
php artisan migrate
```

Set your Gemini API key (same key as the old `.env`):

```
GEMINI_API_KEY=your_actual_key
```

Link storage so uploaded PDFs are served publicly (equivalent of the old
`/uploads` static folder):

```bash
php artisan storage:link
```

Run the dev server (matches the old backend's default port 8000, so the
frontend's `BASE_URL = "http://localhost:8000"` needs no changes):

```bash
php artisan serve --port=8000
```

If you want background jobs to actually run asynchronously instead of
inline (`QUEUE_CONNECTION=sync`), set `QUEUE_CONNECTION=database`, run
`php artisan queue:table && php artisan migrate`, then in a separate
terminal: `php artisan queue:work`.

## API contract

Every response keeps the original envelope:

```json
{ "success": true, "data": { ... }, "message": "..." }
```

and errors:

```json
{ "success": false, "error": "message", "statusCode": 400 }
```

Auth uses `Authorization: Bearer <token>` exactly like before — the
`token` returned from `/api/auth/login` and `/api/auth/register` is now a
Sanctum token string instead of a JWT, but it's used identically by the
existing `axiosInstance.js` request interceptor.
