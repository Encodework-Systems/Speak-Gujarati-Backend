// Import required libraries and modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const db = require("../../../models");
const fs = require("fs").promises; // Use the promises version of fs
const httpException = require("../../../utils/httpException.utils");
const commonUtils = require("../../../utils/common.utils.js");
var md5 = require("md5");
const {
    validationResult
} = require("express-validator");

const axios = require("axios");

// Define a class called UserController
class UserController {
    //

    register = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            req.body.email = req.body.email.trim();
            const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            // Regular expression to check for a valid mobile (a simple example)
            if (!emailRegex.test(req.body.email)) {
                var errors = [];
                errors.push({
                    location: "body",
                    path: "email",
                    msg: ["Invalid email"],
                });
                errors = commonUtils.mergeErrors(errors);
                throw new httpException(422, "Validation failed", {
                    errors: errors,
                });
            }

            const secretKey = process.env.SECRET_JWT || "";
            // const mSession = await db.mongoose.startSession();

            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                var isExistUser = await db.user.findOne({
                    email: req.body.email,
                });

                if (isExistUser) {
                    var errors = [];
                    errors.push({
                        location: "body",
                        path: "email",
                        msg: [
                            "The email is already associated with an existing account. Please try using a different email.",
                        ],
                    });
                    errors = commonUtils.mergeErrors(errors);
                    throw new httpException(422, "Validation failed", {
                        errors: errors,
                    });
                }

                // SEND OTP TO EMAIL
                // await commonUtils.sendOTPToEmail(req.body.email_or_mobile, otp);

                if (req.body.password !== req.body.confirmPassword) {
                    var errors = [];
                    errors.push({
                        location: "body",
                        path: "password",
                        msg: ["The password and confirmation password must match!!"],
                    });
                    errors = commonUtils.mergeErrors(errors);
                    throw new httpException(422, "Validation failed", {
                        errors: errors,
                    });
                }
                var password = md5(req.body.password);
                let isUserAvailable = new db.user({
                    email: req.body.email,
                    password: password,
                    lastLogin: new Date(),
                    // cityId: req.body.cityId,
                });
                await isUserAvailable.save();

                var response = commonUtils.successRes(201, "Successfully registered.");

                response["data"] = isUserAvailable;

                res.status(response["statuscode"]).send(response);

                // await mSession.commitTransaction();
            } catch (error) {
                //   await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                //await mSession.endSession();
            }
        }
    };

    login = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            //const mSession = await db.mongoose.startSession();
            // console.log("secret key time executed:  ", 1);

            const secretKey = process.env.SECRET_JWT || "";

            try {
                //   await mSession.startTransaction();
                /// BATCH PROCESS START
                var isExistUser = await db.user.findOne({
                    email: req.body.email,
                });

                // console.log("Check existing USer executed:  ", 2);

                //.session(mSession);

                if (isExistUser) {
                    var password = md5(req.body.password);
                    if (password == isExistUser.password) {
                        await db.user.findByIdAndUpdate(isExistUser._id, {
                            lastLogin: new Date(),
                        });

                        const expiresIn = 24 * 30 * 365 * 2;
                        var token = jwt.sign({
                                userId: isExistUser._id,
                            },
                            secretKey, {
                                expiresIn: expiresIn + "h",
                            }
                        );

                        var response = commonUtils.successRes(200, "Successfully login.");
                        response["token"] = token;
                        response["data"] = isExistUser;
                        res.status(response["statuscode"]).send(response);
                        //await mSession.commitTransaction();
                    } else {
                        var errors = [];
                        errors.push({
                            location: "body",
                            path: "email",
                            msg: [
                                "The password entered is incorrect. Please recheck and try again.",
                            ],
                        });
                        errors = commonUtils.mergeErrors(errors);
                        throw new httpException(422, "Validation failed", {
                            errors: errors,
                        });
                    }
                } else {
                    var errors = [];
                    errors.push({
                        location: "body",
                        path: "email",
                        msg: [
                            "The email is not associated with any account. Please recheck the email and try again.",
                        ],
                    });
                    errors = commonUtils.mergeErrors(errors);
                    throw new httpException(422, "Validation failed", {
                        errors: errors,
                    });
                }
            } catch (error) {
                //  await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                // await mSession.endSession();
            }
        }
    };

    forgetPassword = async(req, res, next) => {
        const {
            email
        } = req.body;

        if (!email || typeof email !== "string") {
            throw new httpException(400, "Validation failed", {
                errors: {
                    email: ["Email is required and must be a string."],
                },
            });
        }

        try {
            const user = await db.user.findOne({
                email: email.trim()
            });

            if (!user) {
                throw new httpException(404, "User not found", {
                    errors: {
                        email: [
                            "The email address you entered is not registered with us. Please use the email you used during registration.",
                        ],
                    },
                });
            }

            // 1. Generate new random password
            const newPassword = Math.random().toString(36).slice(-8); // e.g., 8-char string
            //Math.random(); // 👉 0.84357648267394
            //Math.random().toString(36); // 👉 "0.ixz9q7a4e"
            //"0.ixz9q7a4e".slice(-8); // 👉 "z9q7a4e" (pick last 8 char)

            // 2. Update user's password in DB (after hashing)
            const hashedPassword = md5(newPassword);
            await db.user.findByIdAndUpdate(user._id, {
                password: hashedPassword,
            });

            // 3. Send the email
            const emailResponse = await axios.post(
                "http://localhost:3133/send-email", {
                    email: user.email,
                    subject: "Your New Password",
                    body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🔒 Password Reset</h2>
            <p>Hello ${user.fullname || "User"},</p>
            <p>Your new password is:</p>
            <div style="background-color: #e8f0fe; padding: 15px; border-radius: 8px; font-size: 18px; color: #111; font-weight: bold; text-align: center;">
              ${newPassword}
            </div>
            <p style="margin-top: 20px;">Please login and change your password immediately.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">This is an automated message. Do not reply.</p>
          </div>
        `,
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            var response = commonUtils.successRes(
                200,
                "A new password has been sent to your email. Please check your inbox to log in to your account."
            );
            res.status(response["statuscode"]).send(response);
        } catch (error) {
            if (error.statuscode !== undefined) {
                throw new httpException(error.statuscode, error.msg, error.data);
            } else {
                throw new httpException(500, "Something went wrong", {
                    errors: error,
                });
            }
        }
    };

    changePassword = async(req, res, next) => {
        const {
            oldPassword,
            newPassword
        } = req.body;
        if (!oldPassword || !newPassword) {
            throw new httpException(400, "Validation failed", {
                errors: {
                    oldPassword: !oldPassword ? ["Old password is required."] : undefined,
                    newPassword: !newPassword ? ["New password is required."] : undefined,
                },
            });
        }

        try {
            const user = await db.user.findById(req.currentUser._id);
            if (!user) {
                throw new httpException(404, "User not found!");
            }
            console.log("Old Password", md5(oldPassword));
            if (md5(oldPassword) !== user.password) {
                throw new httpException(400, "Old password is incorrect", {
                    errors: {
                        oldPassword: ["Old Password is incorrect"]
                    },
                });
            }

            user.password = md5(newPassword);
            await user.save();

            var response = commonUtils.successRes(
                200,
                "Password changed successfully."
            );

            res.status(response["statuscode"]).send(response);
        } catch (error) {
            if (error.statuscode !== undefined) {
                throw new httpException(error.statuscode, error.msg, error.data);
            } else {
                throw new httpException(500, "Something went wrong", {
                    errors: error,
                });
            }
        }
    };

    saveUserDeviceInfo = async(userId, req) => {
        const clientIP = req.connection.remoteAddress;

        const isUserDeviceAvailable = new db.user.device({
            userId: userId,
            ipAddress: clientIP,
            appVersion: req.body.appVersion || "",
            deviceInfo: req.body.deviceInfo || "",
            osName: req.body.osName || "",
            osVersion: req.body.osVersion || "",
            macAddress: req.body.macAddress || "",
        });

        await isUserDeviceAvailable.save();

        return isUserDeviceAvailable;
    };

    profile = async(req, res, next) => {
        var response = commonUtils.successRes(200, "profile");
        response["data"] = req.currentUser;

        //  await mSession.commitTransaction();
        res.status(response["statuscode"]).send(response);
    };

    logout = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            //const mSession = await db.mongoose.startSession();
            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                await db.user.device.findByIdAndUpdate(req.currentUserDevice._id, {
                    isLogout: true,
                    notificationToken: "",
                });

                await db.user.findByIdAndUpdate(req.currentUserDevice._id, {
                    oneSignalToken: null,
                });

                var response = commonUtils.successRes(200, "Successfully logout");

                //  await mSession.commitTransaction();
                res.status(response["statuscode"]).send(response);
            } catch (error) {
                // await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                // await mSession.endSession();
            }
        }
    };

    delete = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            //const mSession = await db.mongoose.startSession();
            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                await db.user.device.deleteMany({
                    userId: req.currentUser._id,
                });
                await db.user.deleteOne({
                    _id: req.currentUser._id,
                });

                var response = commonUtils.successRes(
                    200,
                    "Successfully deleted account"
                );

                //  await mSession.commitTransaction();
                res.status(response["statuscode"]).send(response);
            } catch (error) {
                // await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                // await mSession.endSession();
            }
        }
    };

    googleLogin = async(req, res, next) => {
        const secretKey = process.env.SECRET_JWT || "";
        try {


            const googleResponse = await axios.get('https://oauth2.googleapis.com/tokeninfo?id_token=' + req.body.access_token);


            console.log("google response", googleResponse.data);
            req.body.email = googleResponse.data.email;
            req.body.fullname =
                googleResponse.data.given_name + googleResponse.data.family_name;

            req.body.providerId = googleResponse.data.sub;

            var isExistUser = await db.user.findOne({
                email: req.body.email,
            });
            let token;
            if (isExistUser) {
                await db.user.findByIdAndUpdate(isExistUser._id, {
                    lastLogin: new Date(),
                });

                var isExistUser = await db.user.findById(isExistUser._id);

                const expiresIn = 24 * 30 * 365 * 2;
                token = jwt.sign({
                        userId: isExistUser._id,
                    },
                    secretKey, {
                        expiresIn: expiresIn + "h",
                    }
                );
            }

            const password = md5(req.body.providerId + process.env.SECRET_JWT || "");
            let isUserAvailable = new db.user({
                fullname: req.body.fullname,
                provider: "google",
                providerId: req.body.providerId,
                email: req.body.email,
                password: password,
                lastLogin: new Date(),
            });

            await isUserAvailable.save();
            var isExistUser = await db.user.findById(isUserAvailable._id);

            const expiresIn = 24 * 30 * 365 * 2;
            token = jwt.sign({
                    userId: isExistUser._id,
                },
                secretKey, {
                    expiresIn: expiresIn + "h",
                }
            );

            var response = commonUtils.successRes(200, "Successfully login.");
            response["token"] = token;
            response["data"] = isExistUser;
            res.status(response["statuscode"]).send(response);
        } catch (error) {
            if (error.statuscode !== undefined) {
                throw new httpException(error.statuscode, error.msg, error.data);
            } else {
                console.log(error);
                throw new httpException(500, "Something went wrong", {
                    errors: error,
                });
            }
        }
    };

    facebookLogin = async(req, res, next) => {
        const secretKey = process.env.SECRET_JWT || "";
        try {
            const {
                access_token
            } = req.body;
            if (!access_token)
                throw new httpException(400, "Missing Facebook access token");
            const fbResponse = await axios.get(
                `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`
            );

            const {
                id: providerId,
                email,
                name: fullname
            } = fbResponse.data;

            if (!email) {
                throw new httpException(400, "Email not provided by Facebook");
            }

            let user = await db.user.findOne({
                email
            });

            if (user) {
                await db.user.findByIdAndUpdate(user._id, {
                    lastLogin: new Date()
                });
            }

            const password = md5(providerId + process.env.SECRET_JWT || "");

            user = new db.user({
                fullname,
                provider: "facebook",
                providerId,
                email,
                password,
                lastLogin: new Date(),
            });

            await user.save();

            const expiresIn = 24 * 30 * 365 * 2;
            const token = jwt.sign({
                    userId: user._id,
                },
                secretKey, {
                    expiresIn: expiresIn + "h",
                }
            );

            const response = commonUtils.successRes(200, "Successfully login.");
            response["token"] = token;
            response["data"] = user;
            res.status(response["statuscode"]).send(response);
        } catch (error) {}
    };

    appleLogin = async(req, res, next) => {};

    getZipMD5 = async(req, res, next) => {
        var errors = validationResult(req);

        // var md5sData = [
        //   { zipName: "lesson4_1_zip", value: "3ced2411a48076baec9b9cb5830f183b" },
        //   { zipName: "travel_zip", value: "1760f8b9ef29fab33b6d46f21456e97c" },
        //   { zipName: "lesson10_2_zip", value: "14b2d5407a632caace88bab1cdda90bf" },
        //   { zipName: "lesson7_3_zip", value: "66146fd9c07673e96ecff70af1f03495" },
        //   { zipName: "lesson2_2_zip", value: "426cfefd85026fc252f2a1143affc154" },
        //   { zipName: "lesson4_2_zip", value: "9a61787f0d1c9a3d89fc2277180dc071" },
        //   { zipName: "lesson6_4_zip", value: "48952fa1f21140999b13b453bd9f4d15" },
        //   { zipName: "lesson12_4_zip", value: "866cfdececbcf34905057722c2c65706" },
        //   { zipName: "lesson3_5_zip", value: "476d57819692b7254eca551608b5b5ee" },
        //   { zipName: "lesson11_1_zip", value: "7600ea12f7a825d1aebe23dd6c4ac1a5" },
        //   { zipName: "lesson7_1_zip", value: "cc962bdda589220d7a1057720216c091" },
        //   { zipName: "lesson101_1_zip", value: "24f2b8f27d0418c7ac0c4a86609ae799" },
        //   { zipName: "lesson11_4_zip", value: "b26f6e4b414758f1ea6f00f9ff6bbe91" },
        //   { zipName: "lesson12_1_zip", value: "8075289a41793bb2ab3ca893e94da051" },
        //   { zipName: "lesson13_5_zip", value: "3746edb1076b52910c5f6d60f970ad3b" },
        //   { zipName: "lesson14_1_zip", value: "9b7621782a41964453397214a9bdb022" },
        //   { zipName: "lesson11_2_zip", value: "8c1f3a543708b693a37daca43afcede9" },
        //   { zipName: "lesson8_3_zip", value: "5f3ac66de86c9b83c450851bc17494b4" },
        //   { zipName: "lesson2_5_zip", value: "a9ee60fe65909f555a2cbaaf2abab6fd" },
        //   { zipName: "lesson8_6_zip", value: "c7832741b4835649b67a28d1ebb494d3" },
        //   { zipName: "lesson5_4_zip", value: "76a0266c6e7b19b8b61ce08f1005909a" },
        //   { zipName: "lesson6_3_zip", value: "2b51401b7df4694060abeed82f791890" },
        //   { zipName: "lesson2_8_zip", value: "4d92c28f84c2b22a774d385da98842a0" },
        //   { zipName: "lesson11_3_zip", value: "a589d2a6ff4628df7a3063ee0d22f43e" },
        //   { zipName: "lesson3_2_zip", value: "eb1a9f4ceaf01b78ffbda0634a4cf634" },
        //   { zipName: "lesson14_5_zip", value: "20af47924d540336378db40abee8afef" },
        //   { zipName: "lesson2_4_zip", value: "043f6cddcf6c12eda5c0f7701141bce0" },
        //   { zipName: "lesson3_4_zip", value: "67e8c3cbfeaa00795016397759892cc8" },
        //   { zipName: "lesson14_3_zip", value: "2b36cd632e5a475d59efa66d9c69d1c0" },
        //   { zipName: "lesson12_2_zip", value: "68343fd224a23aaed3f636bc9299f467" },
        //   { zipName: "lesson9_2_zip", value: "13044c96bdf2c99b6ca04f60e37fe6c4" },
        //   { zipName: "lesson2_7_zip", value: "acc78796451a4408796d475ffd7fe934" },
        //   { zipName: "lesson1_4_zip", value: "ece2bb249a6b4455e18e0377d9680054" },
        //   { zipName: "lesson13_3_zip", value: "f71ef103556500d7501e776418ce76c5" },
        //   { zipName: "lesson3_3_zip", value: "2a157377e30a23017e254eece063d98a" },
        //   { zipName: "lesson9_3_zip", value: "465c9c1baa9310b24789edb20bc386b3" },
        //   { zipName: "lesson6_1_zip", value: "01672f32a0fd2dfb23152b5ebbdf7318" },
        //   { zipName: "lesson7_5_zip", value: "3514221a8f7fc6ccc8ce0f70b7971b00" },
        //   { zipName: "lesson2_11_zip", value: "ac518899735f7056b6edf50a4a78a4e3" },
        //   { zipName: "lesson5_2_zip", value: "420a713a212caae9036b546eece14e80" },
        //   { zipName: "lesson5_1_zip", value: "1f7cb5e4decc60356581a005dca8c4b9" },
        //   { zipName: "lesson10_1_zip", value: "637a1d23ea4445d8ad1d7d6f7bcc12ab" },
        //   { zipName: "lesson14_4_zip", value: "1c1eda4cac456753e55c4e10c47a303a" },
        //   { zipName: "lesson2_3_zip", value: "84039e7b296b1cf58ed632fb35c00176" },
        //   { zipName: "lesson10_3_zip", value: "22750ac9880055a77276c7b137912f35" },
        //   { zipName: "lesson13_2_zip", value: "07dbf8816d4947795dc5525439ed2d93" },
        //   { zipName: "lesson1_2_zip", value: "64514f094667f623d600f7cb450489a0" },
        //   { zipName: "lesson12_5_zip", value: "f7f8f6fc4c0a1c4478bbf2e50f6701b6" },
        //   { zipName: "lesson5_3_zip", value: "ffd772f077d26862853891c06f61b0fc" },
        //   { zipName: "lesson9_4_zip", value: "bb6214e3733b7e885a8eafb1136e9167" },
        //   { zipName: "lesson13_4_zip", value: "c66e8cbd2cef13f1811b7485c5ad82a6" },
        //   { zipName: "lesson8_4_zip", value: "c3798e170f7960b6fa7bf6799ec00466" },
        //   { zipName: "lesson7_4_zip", value: "6fbd2764dfd3ad1a1b9bb1ea256e39d3" },
        //   { zipName: "topics_zip", value: "b47b3597c913a6693c75bc3e73a1f766" },
        //   { zipName: "lesson8_5_zip", value: "6e5f8564f434cd245c546f88030922b8" },
        //   { zipName: "lesson12_3_zip", value: "6d3d62f54bd5766678e4256b968751fb" },
        //   { zipName: "lesson13_1_zip", value: "ec19477a839ed5580c10c5f42e02a6c8" },
        //   { zipName: "lesson8_1_zip", value: "c8aad36b76d39cf80d8c40dbfdfffcab" },
        //   { zipName: "lesson7_2_zip", value: "3ce382b63c548227a8a6309465798d50" },
        //   { zipName: "lesson2_10_zip", value: "a1e531fd1ba81bbe05d9f02e6da30f0a" },
        //   { zipName: "lesson4_3_zip", value: "05c3505c20b2442f62b3db7b2df6c345" },
        //   { zipName: "lesson2_1_zip", value: "c2a5c281a7c248d89beef331a4530eb7" },
        //   { zipName: "lesson1_3_zip", value: "511ebcb8b06d0caf5c29266492046dd3" },
        //   { zipName: "lesson3_1_zip", value: "22faa85144c2b83207ceebd90f23f1cb" },
        //   { zipName: "lesson14_2_zip", value: "c7b2a38f1f18688a379cef7481ed7369" },
        //   { zipName: "lesson6_2_zip", value: "37f4be93e62c4efa107980e2a3e6e3cb" },
        //   { zipName: "lesson8_2_zip", value: "1d963f7296051815da8bbcc27ac54060" },
        //   { zipName: "lesson12_6_zip", value: "f08a3e0f14ba7d9b2f9ac1b873279850" },
        //   { zipName: "lesson1_1_zip", value: "d61e44f50f3f12268a1a6277add3e573" },
        //   { zipName: "lesson9_1_zip", value: "de6cdb470860fe256ee2a89e7cebad00" },
        //   { zipName: "lesson2_6_zip", value: "01493d7159dd39752518ba7f8067c1e8" },
        //   { zipName: "lesson1_5_zip", value: "0355c2e42575dfbc7cadf35d35db3f24" },
        //   { zipName: "lesson2_9_zip", value: "9587f28657a05d9055a7f5ca9d31abf5" },
        // ];

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                var getZipValue = await db.md5s.find({});

                var data = [];

                getZipValue.forEach((element) => {
                    data.push({
                        zipName: element.zipName,
                        value: element.value,
                    });
                });

                var response = commonUtils.successRes(
                    200,
                    "Zip values have been fetched successfully."
                );

                response["data"] = data;

                // await db.md5s.insertMany(md5sData);

                res.status(response["statuscode"]).send(response);
            } catch (error) {
                //   await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                //await mSession.endSession();
            }
        }
    };

    getZipPhrase = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                var getZipValue = await db.phrase.find({});

                var data = [];

                getZipValue.forEach((element) => {
                    data.push({
                        zipName: element.zipName,
                        phraseValue: element.phraseValue,
                        zipPhraseID: element.zipPhraseID,
                    });
                });

                var response = commonUtils.successRes(
                    200,
                    "Phrase values have been fetched successfully."
                );

                response["data"] = data;

                res.status(response["statuscode"]).send(response);
            } catch (error) {
                //   await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                //await mSession.endSession();
            }
        }
    };

    getWordOfTheDay = async(req, res, next) => {
        // await db.wordOfTheDay.insertOne({
        //   date: "27-10-2025",
        //   zipPhraseID: "lesson12_2_30",
        // });

        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START
                const today = new Date();
                const dd = String(today.getDate()).padStart(2, "0");
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const yyyy = String(today.getFullYear());
                const dateStr = `${dd}-${mm}-${yyyy}`;
                var getWord = await db.wordOfTheDay.findOne({
                    date: dateStr,
                });
                var data = null;
                if (getWord) {
                    const getPhrase = await db.phrase.findOne({
                        zipPhraseID: getWord.zipPhraseID,
                    });

                    data = {
                        zipName: getPhrase.zipName,
                        phraseValue: getPhrase.phraseValue,
                        zipPhraseID: getPhrase.zipPhraseID,
                    };
                }

                // getZipValue.forEach((element) => {
                //   data.push({
                //     zipName: element.zipName ,
                //     phraseValue: element.phraseValue,
                //     zipPhraseID: element.zipPhraseID,
                //   });
                // });

                var response = commonUtils.successRes(
                    200,
                    "Phrase values have been fetched successfully."
                );

                response["data"] = data;

                res.status(response["statuscode"]).send(response);
            } catch (error) {
                //   await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                //await mSession.endSession();
            }
        }
    };
    updateUserToken = async(req, res, next) => {
        var errors = validationResult(req);

        // Check if there are validation errors
        if (!errors.isEmpty()) {
            errors = commonUtils.mergeErrors(errors.errors);
            throw new httpException(400, "Validation failed", {
                errors: errors,
            });
        } else {
            // const mSession = await db.mongoose.startSession();

            try {
                //  await mSession.startTransaction();
                /// BATCH PROCESS START

                const incomingToken = req.body.userToken || null;

                // ensure current user exists
                const user = await db.user.findById(
                    req.currentUser && req.currentUser._id
                );
                console.log("USER", user);
                if (!user) {
                    throw new httpException(404, "User not found");
                }

                // update the correct field and save
                user.userToken = incomingToken || "";
                await user.save();

                var response = commonUtils.successRes(
                    200,
                    "Successfully updated user token."
                );
                response["data"] = user;

                res.status(response["statuscode"]).send(response);

                // await mSession.commitTransaction();
            } catch (error) {
                //   await mSession.abortTransaction();
                if (error.statuscode !== undefined) {
                    throw new httpException(error.statuscode, error.msg, error.data);
                } else {
                    throw new httpException(500, "Something went wrong", {
                        errors: error,
                    });
                }
            } finally {
                //await mSession.endSession();
            }
        }
    };
}
// Export an instance of the UserController class
module.exports = new UserController();