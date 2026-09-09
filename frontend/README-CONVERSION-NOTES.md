# Frontend — conversion notes (MERN → Laravel + React)

This React app is almost entirely unchanged. It still talks to the same
REST paths (`/api/auth`, `/api/documents`, `/api/flashcards`, `/api/ai`,
`/api/quizzes`, `/api/progress`) defined in `src/utils/apiPaths.js`, and the
Laravel backend in `../backend` was built to return the same JSON envelope
(`{ success, data, message }`) the Node backend used.

## The only functional change: `_id` → `id`

MongoDB gives every document/subdocument a Mongo-style `_id`. MySQL (via
Eloquent) uses normal auto-increment integer `id`s instead. Every
`something._id` reference in the codebase was changed to `something.id`,
including:

- `document._id`, `flashcardSet._id`, `quiz._id`
- `card._id` (flashcard cards) and `question._id` (quiz questions) — the
  Laravel backend generates a stable UUID `id` for each card/question when
  it's created, stored inside the JSON `cards`/`questions` column, so this
  keeps working exactly like before (star/review a card by id, track
  selected answers by question id, etc.)
- Populated references, e.g. `flashcardSet.documentId._id` →
  `flashcardSet.documentId.id`, and `quiz.document._id` → `quiz.document.id`

No other logic, styling, or component structure was touched.

## Minor cleanup

`DocumentDetailPage.jsx` used `process.env.REACT_APP_API_URL`, which is a
Create-React-App convention that does nothing in this Vite project (it
always fell back to `http://localhost:8000`). It now imports the app's
existing `BASE_URL` constant from `apiPaths.js` instead — same value,
just correctly wired.

## Running it

Nothing changed here — same as before:

```bash
npm install
npm run dev
```

Make sure the Laravel API is running on `http://localhost:8000` (the
default `apiPaths.js` `BASE_URL`), or update that constant if you run it
elsewhere.
