import { model, Schema } from "mongoose";

const noteSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Note = model("Note", noteSchema);
