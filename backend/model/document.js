import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
    },
    fileHash:{
      type: String, 
      required: true
    },
    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    metadata: {
      source: String,
      filename: String,
      page: Number,
      chunkIndex: Number,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({fileHash: 1})

const Document = mongoose.model("Document", documentSchema);

export default Document;