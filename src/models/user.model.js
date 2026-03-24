// Export a Mongoose model configuration for a "user" model

module.exports = (mongoose) => {
  // Define the schema for the "user" model
  const schema = new mongoose.Schema(
    {
      // First name of the user
      provider: {
        type: String,
        enum: ["local", "google", "facebook", "apple"],
        default: "local",
      },
      providerId: {
        type: String,
        sparse: true,
        default: null,
      },
      email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true,
        default: null,
      },
      password: {
        type: String,
        sparse: true,
        default: null,
      },
      isDeleted: {
        type: Number, // 0 = active, 1 = deleted
        enum: [0, 1],
        default: 0,
      },
      fullname: {
        type: String,
        default: "",
      },
      avatar: {
        type: String,
        default:
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      },
      lastLogin: {
        type: Date,
        default: null, // Default value is null
      },
      userToken: {
        type: String,
        default: "",
      },

      // Last action timestamp with a default value of null
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
  return mongoose.model("users", schema);
};
