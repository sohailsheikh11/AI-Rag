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
