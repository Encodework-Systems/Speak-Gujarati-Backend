// Export a Mongoose model configuration for a "users_devices" model
module.exports = (mongoose) => {
  // Define the schema for the "users_devices" model
  const schema = new mongoose.Schema(
    {
      // Reference to the user associated with this device
      originalTransactionId: {
        type: String,
        default: "", // Default value is 0
      },
      transactionDate: {
        type: String,
        default: "", // Default value is 0
      },
      expiryDate: {
        type: String,
        default: "", // Default value is 0
      },
      amount: {
        type: String,
        default: "", // Default value is 0
      },
      currency: {
        type: String,
        default: "", // Default value is 0
      },
    },
    {
      timestamps: true, // Automatically add "createdAt" and "updatedAt" timestamps to documents
    }
  );

  // Define how the schema should transform to JSON
  schema.set("toJSON", {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
    },
  });

  return mongoose.model("subscription", schema);
};
