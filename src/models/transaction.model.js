// Export a Mongoose model configuration for a "users_devices" model
module.exports = (mongoose) => {
    // Define the schema for the "users_devices" model
    const schema = new mongoose.Schema({
        // Reference to the user associated with this device
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true, // User ID is required
        },
        productId: {
            type: String,
            default: '', // Default value is 0
        },
        transactionId: {
            type: String,
            default: '', // Default value is 0
        },
        purchaseDate: {
            type: Date,
            default: null, // Default value is 0
        },


    }, {
        timestamps: true, // Automatically add "createdAt" and "updatedAt" timestamps to documents
    });

    // Define how the schema should transform to JSON
    schema.set('toJSON', {
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
    return mongoose.model('transactions', schema);
};