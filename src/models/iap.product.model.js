// Export a Mongoose model configuration for a "users_devices" model
module.exports = (mongoose) => {
  // Define the schema for the "users_devices" model
  const schema = new mongoose.Schema(
    {
      productId: {
        type: String,
        default: "", 
      },
      coinValue: {
        type: Number,
        default: 0, // Default value is 0
      },
      platform: {
        type: Number,
        default: 1, // 1 for ios and 2 for android 
      },
       active: {
        type: Boolean,
        default: true, 
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

  // Attach middleware
  // schema.pre('deleteOne', { document: true }, async function (next) {
  // 	console.log('deleteOne:USER-DEVICE');
  // 	//const db = require('../models');
  // 	next();
  // });

  // Create and return the "users_devices" model based on the schema
  return mongoose.model("iap_products", schema);
};
