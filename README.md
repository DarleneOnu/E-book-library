# Ebook Library (Upload + Download)

A simple local ebook library web app.

## Run

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open in your browser:
- http://localhost:3000

## API
- `POST /upload` (multipart/form-data field name: `ebook`)
- `GET /files` -> JSON list of uploaded files
- `GET /download/:filename` -> downloads a file

## Uploads
Files are stored in `./uploads`.

