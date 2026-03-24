module.exports = (mongoose) => {
  const schema = new mongoose.Schema(
    {
      lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lessons",
        required: true,
      },
      personId: {
        type: Number,
        default: 0,
      },
      original: {
        type: String,
        default: "",
      },
      translation: {
        type: String,
        default: "",
      },
      audioPath: {
        type: String,
        default: "",
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

  return mongoose.model("phrases", schema);
};
