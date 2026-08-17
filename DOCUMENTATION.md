# File Storage Service - Documentation

## 1. Overview

File Storage Service is a backend project built with Node.js, ExpressJS, MongoDB, Mongoose, and Multer.

The project demonstrates a complete local file-storage workflow including:

- Single file upload
- Multiple file upload
- File validation
- File size limits
- File count limits
- Local filesystem storage
- MongoDB metadata storage
- Search
- Filtering
- Sorting
- Pagination
- File streaming
- File download
- File deletion
- Cleanup after failed operations
- Centralized error handling
- Graceful shutdown

The project is designed to show how uploaded files and their metadata can be managed safely and cleanly.

---

# 2. Technology Stack

## Node.js

Node.js provides the backend runtime.

It handles:

- File system operations
- HTTP server execution
- Application logic
- Process events
- Streaming
- MongoDB communication

## ExpressJS

ExpressJS provides:

- Routing
- Middleware
- HTTP responses
- Error handling
- JSON request support

## MongoDB

MongoDB stores metadata about uploaded files.

The physical files are stored locally inside the `uploads/` directory.

## Mongoose

Mongoose provides:

- File metadata schema
- Validation
- Queries
- Indexes
- Document models

## Multer

Multer handles:

```text
multipart/form-data
```

requests.

It processes uploaded files before controller logic runs.

---

# 3. Storage Architecture

The project separates physical file storage from metadata storage.

```text
Uploaded File
     |
     v
Multer
     |
     +--------------------+
     |                    |
     v                    v
uploads/ Folder      File Metadata
                          |
                          v
                       MongoDB
```

The actual file contents are stored on disk.

Information describing the file is stored in MongoDB.

---

# 4. Why Metadata Is Stored Separately

A physical file alone does not provide a convenient API-friendly record.

MongoDB stores useful information such as:

```text
Original filename
Stored filename
MIME type
Extension
File size
Storage path
Image flag
Creation time
Update time
```

This makes searching, filtering, sorting, and pagination much easier.

---

# 5. Project Structure

```text
file-storage-service/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── storage.js
│   ├── controllers/
│   │   └── file.controllers.js
│   ├── middlewares/
│   │   ├── errorHandler.middleware.js
│   │   ├── notFound.middleware.js
│   │   └── uploadError.middleware.js
│   ├── models/
│   │   └── file.model.js
│   ├── routes/
│   │   └── file.routes.js
│   ├── utils/
│   │   └── file.utils.js
│   ├── validators/
│   │   └── file.validators.js
│   ├── app.js
│   └── server.js
├── uploads/
│   └── .gitkeep
├── .env
├── .env.example
├── .gitignore
├── DOCUMENTATION.md
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── requests.http
```

---

# 6. `src/server.js`

`server.js` is responsible for application startup and shutdown.

It:

- Loads environment variables
- Connects to MongoDB
- Starts ExpressJS
- Prints useful local URLs
- Handles SIGINT
- Handles SIGTERM
- Handles unexpected failures
- Closes the database connection cleanly

The API starts only after MongoDB connects successfully.

---

# 7. Graceful Shutdown

The application listens for:

```text
SIGINT
SIGTERM
```

The shutdown flow is:

```text
Shutdown Signal
      |
      v
Stop HTTP Server
      |
      v
Close MongoDB
      |
      v
Exit Process
```

This helps avoid abruptly terminating active resources.

---

# 8. `src/config/database.js`

This module manages the MongoDB connection.

The default local URI is:

```text
mongodb://127.0.0.1:27017/file_storage_service
```

The actual URI can be configured with:

```env
MONGODB_URI
```

Keeping database connection logic separate makes the application cleaner.

---

# 9. `src/config/storage.js`

This file configures Multer.

It is responsible for:

- Upload directory
- Unique stored filenames
- Allowed MIME types
- File size limit
- Maximum file count
- Disk storage

This keeps upload configuration out of controllers.

---

# 10. Upload Directory

Physical files are stored in:

```text
uploads/
```

The application ensures this directory exists before uploads begin.

If the directory does not exist, it is created automatically.

---

# 11. Unique Stored Filenames

The original client filename is not used directly as the physical filename.

Instead, the application generates a unique stored filename.

Conceptually:

```text
Current Timestamp
      +
Random Bytes
      +
Original Extension
```

Example:

```text
1723900000000-a1b2c3d4e5f6.pdf
```

This reduces filename collisions.

---

# 12. Original Filename

The original filename is still preserved in MongoDB.

For example:

```text
invoice.pdf
```

This lets the application:

- Display the original filename
- Search by original name
- Return the original name during download

without using it as the physical storage filename.

---

# 13. Allowed MIME Types

The project accepts selected file types.

Examples:

```text
image/jpeg
image/png
image/webp
application/pdf
text/plain
application/zip
```

Unsupported MIME types are rejected before upload processing completes.

---

# 14. Why MIME Validation Matters

Accepting every file type can expose the service to unwanted executable or dangerous file uploads.

The project uses a fixed allow-list.

This keeps the accepted upload scope predictable.

---

# 15. File Size Limit

The default maximum file size is:

```text
10 MB
```

Configured through:

```env
MAX_FILE_SIZE=10485760
```

The value is stored in bytes.

---

# 16. Maximum File Count

Multiple-upload requests are limited.

Default:

```text
5 files
```

Configured through:

```env
MAX_FILES=5
```

This prevents one request from uploading an excessive number of files.

---

# 17. Multer Disk Storage

The project uses:

```text
multer.diskStorage()
```

This means Multer writes incoming files directly to the local filesystem.

The storage configuration defines:

```text
destination
filename
```

The destination is the `uploads/` directory.

The filename is generated by the application.

---

# 18. File Model

File:

```text
src/models/file.model.js
```

The MongoDB document contains:

```text
originalName
storedName
mimeType
extension
size
storagePath
isImage
createdAt
updatedAt
```

---

# 19. Why `storagePath` Is Hidden

The physical path is an internal server detail.

The model removes:

```text
storagePath
```

from normal API serialization.

This prevents exposing local filesystem structure unnecessarily.

---

# 20. File Extension

The extension is stored separately.

Examples:

```text
.pdf
.jpg
.txt
```

This makes filtering easier.

Example:

```http
GET /api/v1/files?extension=pdf
```

---

# 21. Image Flag

The model stores:

```text
isImage
```

This value is determined using the MIME type.

Example:

```text
image/jpeg
```

becomes:

```text
isImage = true
```

This allows easy queries such as:

```http
GET /api/v1/files?isImage=true
```

---

# 22. File Utility Module

File:

```text
src/utils/file.utils.js
```

It contains reusable file-related helpers.

The utility provides:

- Extension detection
- Image detection
- File existence check
- Physical file deletion
- Multi-file cleanup
- Human-readable file size
- Metadata construction

---

# 23. File Size Formatting

The API can convert:

```text
1048576 bytes
```

into:

```text
1 MB
```

This makes metadata easier to read.

The actual stored size remains numeric in bytes.

---

# 24. Upload Single File

Endpoint:

```http
POST /api/v1/files/upload
```

Expected multipart field:

```text
file
```

Flow:

```text
Request
   |
   v
Multer
   |
   v
Validate File
   |
   v
Write Physical File
   |
   v
Build Metadata
   |
   v
Save Metadata to MongoDB
   |
   v
Return 201 Response
```

---

# 25. MongoDB Failure Cleanup

A file may already exist on disk before MongoDB metadata creation happens.

If MongoDB insertion fails:

```text
Physical File Exists
      |
      v
MongoDB Save Fails
      |
      v
Delete Physical File
```

This prevents orphan files from being left behind.

---

# 26. Upload Multiple Files

Endpoint:

```http
POST /api/v1/files/upload/multiple
```

Expected multipart field:

```text
files
```

The service:

1. Receives multiple files
2. Validates them through Multer
3. Stores them locally
4. Builds metadata for every file
5. Inserts metadata into MongoDB

---

# 27. Multi-File Failure Cleanup

If database insertion fails after multiple physical files have been written:

```text
Uploaded Files
      |
      v
Database Failure
      |
      v
Cleanup All Uploaded Files
```

The cleanup helper attempts to remove each file.

---

# 28. Get All File Metadata

Endpoint:

```http
GET /api/v1/files
```

This endpoint returns metadata, not physical file contents.

It supports:

- Search
- MIME filtering
- Extension filtering
- Image filtering
- Sorting
- Pagination

---

# 29. Search

Example:

```http
GET /api/v1/files?search=invoice
```

The search runs against:

```text
originalName
```

using case-insensitive matching.

---

# 30. MIME Type Filtering

Example:

```http
GET /api/v1/files?mimeType=application/pdf
```

Only matching MIME types are returned.

---

# 31. Extension Filtering

Example:

```http
GET /api/v1/files?extension=pdf
```

The application normalizes:

```text
pdf
```

into:

```text
.pdf
```

before building the MongoDB filter.

---

# 32. Image Filtering

Example:

```http
GET /api/v1/files?isImage=true
```

This uses the stored Boolean field:

```text
isImage
```

---

# 33. Sorting

Example:

```http
GET /api/v1/files?sort=size&order=desc
```

Supported sort fields include:

```text
originalName
mimeType
extension
size
createdAt
updatedAt
```

Sort direction supports:

```text
asc
desc
```

---

# 34. Pagination

Example:

```http
GET /api/v1/files?page=2&limit=5
```

Skip is calculated as:

```text
(page - 1) × limit
```

Example:

```text
page = 3
limit = 5

skip = 10
```

---

# 35. Pagination Metadata

Responses include:

```json
{
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3
}
```

This helps API clients build paginated interfaces.

---

# 36. Get File Metadata By ID

Endpoint:

```http
GET /api/v1/files/:id
```

The route validates the MongoDB ObjectId first.

If no metadata exists:

```text
404
```

is returned.

---

# 37. File ID Validation

The validator uses Mongoose ObjectId validation before controller logic.

Invalid values such as:

```text
invalid-id
```

return:

```text
400 Bad Request
```

before a database query is attempted.

---

# 38. View File

Endpoint:

```http
GET /api/v1/files/:id/view
```

This endpoint streams the physical file inline.

Headers include values such as:

```text
Content-Type
Content-Length
Content-Disposition
```

The browser may display supported file types directly.

Examples:

```text
Images
PDF
Text
```

depending on client support.

---

# 39. File Streaming

The project uses:

```text
fs.createReadStream()
```

instead of reading the entire file into memory before sending it.

Flow:

```text
Physical File
      |
      v
Read Stream
      |
      v
HTTP Response
```

Streaming is more appropriate for file delivery than loading the entire file into memory.

---

# 40. Download File

Endpoint:

```http
GET /api/v1/files/:id/download
```

The file is returned using its original client filename.

Example:

```text
Stored filename:
1723900000-abcd1234.pdf

Downloaded filename:
invoice.pdf
```

This separates internal storage naming from user-facing naming.

---

# 41. Physical File Existence Check

Before download or streaming, the service checks whether the physical file still exists.

Possible condition:

```text
MongoDB metadata exists
but
physical file is missing
```

The API returns a clear 404 instead of attempting to stream a nonexistent file.

---

# 42. Delete File

Endpoint:

```http
DELETE /api/v1/files/:id
```

The delete flow is:

```text
Find Metadata
      |
      v
Delete Physical File
      |
      v
Delete MongoDB Record
      |
      v
Return Response
```

---

# 43. Missing File During Delete

The delete utility treats:

```text
ENOENT
```

as the physical file already being absent.

The MongoDB metadata can still be removed.

The response includes:

```text
physicalFileRemoved
```

to indicate whether a physical file was actually deleted.

---

# 44. Upload Error Middleware

File:

```text
src/middlewares/uploadError.middleware.js
```

Multer produces specific upload errors.

This middleware converts them into consistent JSON responses.

---

# 45. File Too Large

Multer code:

```text
LIMIT_FILE_SIZE
```

The application converts this into a readable API message showing the configured maximum size.

---

# 46. Too Many Files

Multer code:

```text
LIMIT_FILE_COUNT
```

The API returns the configured maximum allowed number of files.

---

# 47. Unexpected File Field

Multer may produce:

```text
LIMIT_UNEXPECTED_FILE
```

This can occur when:

- The wrong multipart field is used
- Too many files are supplied to a restricted endpoint

The middleware converts this into a clear 400 response.

---

# 48. Unsupported File Type

The custom Multer filter rejects file types not present in the allow-list.

Example:

```text
application/octet-stream
```

for an executable test file is rejected.

---

# 49. Centralized Error Handler

File:

```text
src/middlewares/errorHandler.middleware.js
```

The error handler covers:

- Invalid MongoDB IDs
- Mongoose validation failures
- Duplicate database values
- Filesystem permissions
- Missing files
- Custom application errors
- Unexpected failures

---

# 50. Filesystem Errors

Examples:

```text
EACCES
EPERM
```

represent filesystem permission problems.

They are converted into consistent server-error responses.

---

# 51. Missing Filesystem Resource

Error code:

```text
ENOENT
```

means a file or path does not exist.

The centralized handler can convert this into:

```text
404 Physical file not found
```

---

# 52. 404 Middleware

Unknown routes eventually reach:

```text
notFound.middleware.js
```

Example:

```http
GET /api/v1/not-found
```

returns a structured 404 response.

---

# 53. `src/app.js`

The ExpressJS application configures:

```text
JSON parser
Root route
Health route
File routes
Upload error middleware
404 middleware
Central error middleware
```

Middleware order is intentional.

---

# 54. Middleware Order

The effective order is:

```text
Request
   |
   v
JSON Middleware
   |
   v
File Routes
   |
   v
Upload Error Handler
   |
   v
404 Handler
   |
   v
Central Error Handler
```

Upload-specific failures need to be handled before the generic error layer.

---

# 55. Health Endpoint

Endpoint:

```http
GET /api/v1/health
```

It provides basic information such as:

```text
status
service
version
uptime
timestamp
```

---

# 56. Environment Variables

The project uses:

```env
PORT
NODE_ENV
MONGODB_URI
MAX_FILE_SIZE
MAX_FILES
```

These values allow behavior to change without modifying source code.

---

# 57. `.env`

The real `.env` is local configuration.

It is ignored by Git.

Example:

```env
PORT=1198
MONGODB_URI=mongodb://127.0.0.1:27017/file_storage_service
MAX_FILE_SIZE=10485760
MAX_FILES=5
```

---

# 58. `.env.example`

`.env.example` documents the required environment variables.

It can safely be committed because it should not contain real production secrets.

---

# 59. `.gitignore`

The project excludes:

```text
node_modules
.env
actual uploaded files
debug logs
OS files
editor settings
```

---

# 60. Why Uploaded Files Are Ignored

The repository should contain source code, not runtime user uploads.

Therefore:

```gitignore
uploads/*
```

ignores physical files.

---

# 61. Why `.gitkeep` Exists

Git does not track empty folders.

The project uses:

```text
uploads/.gitkeep
```

so the upload directory structure remains present in the repository.

Actual uploaded files remain ignored.

---

# 62. Request Validation

File:

```text
src/validators/file.validators.js
```

It validates:

- MongoDB file IDs
- Search values
- MIME filters
- Extension filters
- Image filter
- Sort field
- Sort order
- Page
- Limit

---

# 63. Maximum Pagination Limit

The service restricts:

```text
limit
```

to a maximum of:

```text
100
```

This prevents clients from requesting an unnecessarily large metadata result set in one request.

---

# 64. API Status Codes

Important status codes include:

```text
200 OK
Successful read, stream, download, or delete

201 Created
Successful upload

400 Bad Request
Invalid upload or query

404 Not Found
Metadata, route, or physical file missing

409 Conflict
Database uniqueness conflict

500 Internal Server Error
Unexpected server or filesystem failure
```

---

# 65. `requests.http`

The repository includes:

```text
requests.http
```

for direct testing.

It covers:

- Root
- Health
- Single upload
- Multiple upload
- File list
- Pagination
- Search
- MIME filtering
- Extension filtering
- Image filtering
- Sorting
- Metadata by ID
- View
- Download
- Delete
- Invalid ID
- Missing upload
- Unsupported type
- Invalid query
- Invalid route

---

# 66. Local Test Files

The upload requests reference paths such as:

```text
./sample-files/test.pdf
```

These paths are examples.

They should be replaced with real local files when testing.

---

# 67. Single Upload Lifecycle

```text
multipart/form-data
       |
       v
Multer
       |
       v
Validate MIME
       |
       v
Validate Size
       |
       v
Generate Stored Name
       |
       v
Write File
       |
       v
Create MongoDB Metadata
       |
       v
201 Response
```

---

# 68. Download Lifecycle

```text
File ID
   |
   v
Validate ObjectId
   |
   v
Find MongoDB Record
   |
   v
Check Physical File
   |
   v
Send Download
```

---

# 69. Delete Lifecycle

```text
File ID
   |
   v
Find Metadata
   |
   v
Delete Disk File
   |
   v
Delete MongoDB Record
   |
   v
Return Result
```

---

# 70. Why Local Storage Is Used

This project focuses on file-storage backend fundamentals.

Local storage makes concepts easy to understand:

- Multipart upload
- Physical file creation
- Metadata persistence
- Streaming
- Downloads
- Cleanup
- File lifecycle

Cloud object storage can later replace the local storage layer while preserving much of the same API architecture.

---

# 71. Storage Abstraction

Upload configuration is isolated inside:

```text
src/config/storage.js
```

This prevents Multer storage details from spreading across routes and controllers.

A future storage implementation could change without redesigning the entire application structure.

---

# 72. Metadata vs File Content

The project intentionally separates:

```text
File Content
```

from:

```text
File Metadata
```

Physical content belongs to storage.

Metadata belongs to the database.

This is an important file-storage architecture concept.

---

# 73. Data Consistency

One of the central challenges in file-storage systems is keeping:

```text
Filesystem
```

and:

```text
Database
```

consistent.

The project addresses this through cleanup behavior.

Example:

```text
File written
Database save fails
      |
      v
Delete file
```

This reduces orphan resources.

---

# 74. Security Considerations

The project demonstrates several basic protections:

- MIME allow-list
- File size limits
- File count limits
- Unique storage names
- Internal path hiding
- Input validation
- Pagination limits
- Consistent error handling

These controls reduce common mistakes in upload endpoints.

---

# 75. Important Production Considerations

A real public production file-storage system may additionally require:

- Authentication
- Authorization
- Malware scanning
- Cloud object storage
- Signed URLs
- Encryption
- CDN delivery
- Storage quotas
- Audit logs
- Backup policies

Those concerns are outside this repository's focused scope.

---

# 76. Development

Install dependencies:

```bash
npm install
```

Ensure MongoDB is running.

Start the development server:

```bash
npm run dev
```

Default URL:

```text
http://localhost:1198
```

---

# 77. Production

Run:

```bash
npm start
```

The application uses Node.js directly without Nodemon.

---

# 78. Main Concepts Demonstrated

After studying this project, the following should be clear:

- Multipart file uploads
- Multer configuration
- Single-file uploads
- Multi-file uploads
- MIME validation
- File-size limits
- File-count limits
- Local disk storage
- Unique file naming
- Metadata persistence
- MongoDB file metadata
- Search
- Filtering
- Sorting
- Pagination
- File streaming
- File downloads
- Physical file deletion
- Metadata deletion
- Failure cleanup
- Filesystem errors
- Upload-specific errors
- File lifecycle management

---

# 79. Summary

The main architecture can be summarized as:

```text
Upload Request
      |
      v
Multer
      |
      v
Validation
      |
      v
Physical Storage
      |
      v
MongoDB Metadata
      |
      v
File APIs
      |
      +---- Metadata
      |
      +---- Stream
      |
      +---- Download
      |
      +---- Delete
```

The project demonstrates how a backend can manage both physical files and database metadata while keeping the two systems synchronized.

---

# 80. Links

- Portfolio: https://www.ashishranjan.net
- GitHub: https://github.com/a2rp
- CodePen: https://codepen.io/ash1198
- LinkedIn: https://www.linkedin.com/in/aashishranjan
- Facebook: https://www.facebook.com/theash.ashish/
- YouTube: https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1
- Email: mailto:ash.ranjan09@gmail.com

# 81. Support

- Support: https://a2rp-donation-page.netlify.app/
- Buy Me A Coffee: https://buymeacoffee.com/a2rp
- Patreon: https://patreon.com/a2rp

---

# 82. License

This project is licensed under the MIT License.
