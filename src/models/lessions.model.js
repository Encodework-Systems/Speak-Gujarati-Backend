module.exports = (mongoose) => {
  const schema = new mongoose.Schema(
    {
      type: {
        type: String,
        default: "",
      },

      lessonId: {
        type: String,
        default: "",
      },

      topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "topics",
        required: true,
      },
      index: {
        type: Number,
        default: 0,
      }
    },
    {
      timestamps: true,
    }
  );

  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  });

  return mongoose.model("lessons", schema);
};