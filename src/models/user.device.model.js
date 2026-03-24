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
        // Operating System Name
        osName: {
            type: String,
            default: '', // Default value is an empty string
        },

        // Operating System Version
        osVersion: {
            type: String,
            default: '', // Default value is an empty string
        },
        // Device Information
        deviceInfo: {
            type: String,
            default: '', // Default value is an empty string
        },
        // MAC Address of the device
        macAddress: {
            type: String,
            default: '', // Default value is an empty string
        },
        // IP Address of the device
        ipAddress: {
            type: String,
            default: '', // Default value is an empty string
        },
        // App Version installed on the device
        appVersion: {
            type: String,
            default: '', // Default value is an empty string
        },
        // Notification Token for the device
        notificationToken: {
            type: String,
            default: '', // Default value is an empty string
        },
        // Online status of the device with a default value of false
        isOnline: {
            type: Boolean,
            default: false, // Default value is false
        },
        // Timestamp for the last online time with a default value of null
        lastOnlineTime: {
            type: Date,
            default: null, // Default value is null
        },
        // Timestamp for the last offline time with a default value of null
        lastOfflineTime: {
            type: Date,
            default: null, // Default value is null
        },
        // Timestamp for the last action with a default value of null
        lastAction: {
            type: Date,
            default: null, // Default value is null
        },
        // Number of action associated with the user (default: 0)
        noOfActions: {
            type: Number,
            default: 0, // Default value is 0
        },
        isLogout: {
            type: Boolean,
            default: false,
        },
        isForceLogout: {
            type: Boolean,
            default: false,
        },
        logoutDateTime: {
            type: Date,
            default: null, // Default value is null
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
    return mongoose.model('users_devices', schema);
};