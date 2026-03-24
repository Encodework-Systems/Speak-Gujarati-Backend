
module.exports = (mongoose) => {
  const schema = new mongoose.Schema(
    {
      original: {
        type: String,
        default: "",
    },
      translation: {
        type: String,
        default: "",
      },
      imagePath: {
        type: String,
        default: "",
      },
      isFree: {
        type: Boolean,
        default: false,
      },
      hasVocabulary: {
        type: Boolean,
        default: false,
      },
      active: {
        type: Boolean,
        default: false,
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

  return mongoose.model("topics", schema);
};