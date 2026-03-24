// Export a Mongoose model configuration for a "user" model

module.exports = (mongoose) => {
  // Define the schema for the "user" model
  const schema = new mongoose.Schema(
    {
      // First name of the user
      zipPhraseID: {
        type: String,
        default: "",
      },
      zipName: {
        type: String,
        default: "",
      },
      phraseValue: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true, // Automatically add "createdAt" and "updatedAt" timestamps to documents
    }
  );
  // schema.index({ mobile: 1, type: 1 }, { unique: true });
  // schema.index({ email: 1, type: 1 }, { unique: true });

  // Define how the schema should transform to JSON
  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  });

  // Create and return the "user" model based on the schema
  return mongoose.model("phrase", schema);
};
