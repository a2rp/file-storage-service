# File Storage Service

A practical ExpressJS backend for secure file uploads, local file storage, MongoDB metadata, streaming, downloads, search, filtering, pagination, and file lifecycle management.

## Features

- Single file upload
- Multiple file upload
- `multipart/form-data`
- Multer disk storage
- Unique stored filenames
- Original filename metadata
- File size limits
- Maximum file count limits
- Allowed MIME type validation
- MongoDB file metadata
- Search by filename
- Filter by MIME type
- Filter by extension
- Image-only filtering
- Sorting
- Pagination
- File metadata lookup
- Inline file streaming
- File download
- Physical file deletion
- MongoDB metadata deletion
- Upload cleanup when database operations fail
- Missing physical file handling
- Centralized error handling
- Graceful shutdown
- API testing with `requests.http`

## Tech Stack

- Node.js
- ExpressJS
- MongoDB
- Mongoose
- Multer
- Nodemon

## Supported File Types

```text
image/jpeg
image/png
image/webp
application/pdf
text/plain
application/zip
```

## Upload Limits

Default maximum file size:

```text
10 MB
```

Default maximum files per multi-file request:

```text
5
```

Both limits can be configured through environment variables.

## API Endpoints

### Root

```http
GET /
```

### Health Check

```http
GET /api/v1/health
```

## File Upload

### Upload Single File

```http
POST /api/v1/files/upload
```

Expected field:

```text
file
```

### Upload Multiple Files

```http
POST /api/v1/files/upload/multiple
```

Expected field:

```text
files
```

## File Metadata

### Get All Files

```http
GET /api/v1/files
```

### Get File By ID

```http
GET /api/v1/files/:id
```

## File Access

### View / Stream File

```http
GET /api/v1/files/:id/view
```

### Download File

```http
GET /api/v1/files/:id/download
```

### Delete File

```http
DELETE /api/v1/files/:id
```

## Query Examples

### Pagination

```http
GET /api/v1/files?page=1&limit=5
```

### Search By Filename

```http
GET /api/v1/files?search=test
```

### Filter By MIME Type

```http
GET /api/v1/files?mimeType=application/pdf
```

### Filter By Extension

```http
GET /api/v1/files?extension=pdf
```

### Images Only

```http
GET /api/v1/files?isImage=true
```

### Sort By Size

```http
GET /api/v1/files?sort=size&order=desc
```

## Environment

Create a `.env` file using `.env.example`.

```env
PORT=1198
NODE_ENV=development

MONGODB_URI=mongodb://127.0.0.1:27017/file_storage_service

MAX_FILE_SIZE=10485760
MAX_FILES=5
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Default Port

```text
1198
```

## Storage Flow

```text
Client Upload
     |
     v
Multer Validation
     |
     v
Local uploads/ Folder
     |
     v
Build File Metadata
     |
     v
MongoDB
     |
     v
API Response
```

## Delete Flow

```text
Delete Request
     |
     v
Find Metadata
     |
     v
Delete Physical File
     |
     v
Delete MongoDB Record
     |
     v
Response
```

## Project Structure

```text
file-storage-service/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ config/
â”‚   â”‚   â”œâ”€â”€ database.js
â”‚   â”‚   â””â”€â”€ storage.js
â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â””â”€â”€ file.controllers.js
â”‚   â”œâ”€â”€ middlewares/
â”‚   â”‚   â”œâ”€â”€ errorHandler.middleware.js
â”‚   â”‚   â”œâ”€â”€ notFound.middleware.js
â”‚   â”‚   â””â”€â”€ uploadError.middleware.js
â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â””â”€â”€ file.model.js
â”‚   â”œâ”€â”€ routes/
â”‚   â”‚   â””â”€â”€ file.routes.js
â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â””â”€â”€ file.utils.js
â”‚   â”œâ”€â”€ validators/
â”‚   â”‚   â””â”€â”€ file.validators.js
â”‚   â”œâ”€â”€ app.js
â”‚   â””â”€â”€ server.js
â”œâ”€â”€ uploads/
â”‚   â””â”€â”€ .gitkeep
â”œâ”€â”€ .env.example
â”œâ”€â”€ .gitignore
â”œâ”€â”€ package.json
â”œâ”€â”€ package-lock.json
â”œâ”€â”€ README.md
â””â”€â”€ requests.http
```

## Documentation


## Author

**Ashish Ranjan**

## Links

- Portfolio: https://www.ashishranjan.net
- GitHub: https://github.com/a2rp
- CodePen: https://codepen.io/ash1198
- LinkedIn: https://www.linkedin.com/in/aashishranjan
- Facebook: https://www.facebook.com/theash.ashish/
- YouTube: https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1
- Email: mailto:ash.ranjan09@gmail.com

## Support

- Support: https://a2rp-donation-page.netlify.app/
- Buy Me A Coffee: https://buymeacoffee.com/a2rp
- Patreon: https://patreon.com/a2rp

## License

MIT License
