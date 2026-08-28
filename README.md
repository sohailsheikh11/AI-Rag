# AI RAG Document Assistant

An AI-powered document assistant that allows users to upload PDF documents, process them asynchronously, and ask questions about their documents using Retrieval-Augmented Generation (RAG).

## Features

- Upload PDF documents
- Extract text from PDFs
- Split documents into chunks
- Generate embeddings for document chunks
- Store embeddings in MongoDB
- Perform vector search
- Chat with uploaded documents
- General AI chat
- Save conversations and messages
- Delete conversations
- Background document processing using BullMQ
- Track document processing status

- ## Architecture

```text
Frontend
   |
   | HTTP Request
   v
Node.js / Express API
   |
   +----> MongoDB
   |
   +----> Redis / BullMQ
             |
             v
        Document Worker
             |
             +--> Extract PDF text
             |
             +--> Create chunks
             |
             +--> Generate embeddings
             |
             +--> Store chunks
```

Add your technology stack

```markdown
## Tech Stack

### Frontend
- React
- Next.js
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### AI / RAG
- Gemini
- Embeddings
- Vector Search

### Background Processing
- Redis
- BullMQ

### Storage
- MongoDB
- Local file storage

## Installation & Setup

### Prerequisites

Make sure the following are installed on your system:

* [Node.js](https://nodejs.org/)
* npm
* MongoDB
* Redis
* Git
```

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd AI-Rag


### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

> Never commit your `.env` file or expose your API keys.

### 3. Start Redis

Make sure Redis is running locally on:

```text
localhost:6379
```

### 4. Start the Backend Server

From the `backend` directory:

```bash
npm run dev
```

The backend server will run on:

```text
http://localhost:8080
```

### 5. Start the Document Worker

Open a new terminal and navigate to the backend directory:

```bash
cd backend
npm run worker
```

The worker listens to the BullMQ `document-processing` queue and processes uploaded documents in the background.

### 6. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the URL provided by the frontend development server.

### 7. Verify the Setup

Once everything is running, the application should have the following components:

```text
Frontend
   │
   ▼
Backend API
   │
   ├── MongoDB
   │
   └── Redis
          │
          ▼
     BullMQ Worker
```

Upload a PDF from the frontend to verify that document processing is working correctly.

