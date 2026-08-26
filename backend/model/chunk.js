import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
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
      filename: String,
      chunkIndex: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Chunk = mongoose.model("Chunk", chunkSchema);

export default Chunk;