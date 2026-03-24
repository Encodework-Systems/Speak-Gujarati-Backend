// Import required modules and libraries
const db = require('../models'); // Import the database models
const httpException = require('../utils/httpException.utils'); // Import a custom HTTP exception handler
const jwt = require('jsonwebtoken'); // Import JSON Web Token library
const dotenv = require('dotenv'); // Import the dotenv library for environment variables
dotenv.config(); // Load environment variables from a .env file

// Create an authentication middleware function that can take roles as parameters
const auth = async (token) => {
	try {
		const secretKey = process.env.SECRET_JWT || ''; // Get the secret key from environment variables
		// Verify the token using the secret key
		const decoded = jwt.verify(token, secretKey);
		if (!decoded) {
			return false;
		}
		// Find the user associated with the decoded token
		const user = await db.user.findOne({
			_id: decoded.userId,
		});

		const userDevice = await db.user.device.findOne({
			_id: decoded.userDeviceId,
		});
		// Throw an exception if the user is not found
		if (!user || !userDevice) {
			return false;
		}

		if (userDevice.isLogout == 1) {
			return false;
		}

		var returnObject = {
			currentUser: user,
			currentUserDevice: userDevice,
		};

		return returnObject;
	} catch (e) {
		return false;
	}
};

module.exports = auth; // Export the auth middleware for use in routes
