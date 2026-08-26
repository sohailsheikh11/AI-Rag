import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    fileHash: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


const Document = mongoose.model("Document", documentSchema);

export default Document;