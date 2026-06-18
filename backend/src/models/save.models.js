import { model, Schema } from "mongoose";

const saveSchema = new Schema(
  {
    savedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    isSaved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Save = model("Save", saveSchema);
