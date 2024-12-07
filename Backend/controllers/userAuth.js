const crypto = require("crypto");
const Bull = require("bull");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const redisClientPool = require("../redis/redis-server");
const {
  sendOtpEmail,
  sendResetPasswordEmail,
  generateOtp,
} = require("../email/send-otp");
const { Namespace } = require("socket.io");
const REDIS_PORT = process.env.REDIS_PORT;
require("dotenv").config();

// Redis queues
const registration_queue = new Bull("registration", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

const verification_queue = new Bull("verification", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

const login_queue = new Bull("login", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

const logout_queue = new Bull("logout", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

const forgot_password_queue = new Bull("forgot_password", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

const reset_password_queue = new Bull("reset_password", {
  redis: { port: REDIS_PORT, host: "localhost" },
});

// Registration queue process
registration_queue.process(async (job) => {
  const { email, password, username, gender } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting registration process for email: ${email}`);

    // Check if user exists by email only
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Debug: User already exists for email: ${email}`);
      return {
        success: false,
        message:
          "This email is already registered. Please login instead of registering again.",
        code: "ALREADY_REGISTERED",
      };
    }

    const otp = generateOtp();
    console.log(`Debug: Generated OTP for ${email}: ${otp}`);

    const registrationKey = `registration:${email}`;
    let retries = 5;
    while (retries > 0) {
      await redisClient.watch(registrationKey);
      const registrationExists = await redisClient.get(registrationKey);

      if (registrationExists) {
        await redisClient.unwatch();
        console.log(`Debug: Registration already in progress for ${email}`);
        return {
          success: false,
          message:
            "Registration already in progress. Please check your email for OTP or try again later.",
          code: "REGISTRATION_IN_PROGRESS",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      console.log(
        `Debug: Storing hashed password for OTP verification: ${hashedPassword.substring(
          0,
          10
        )}...`
      );

      const multi = redisClient.multi();
      multi.set(
        registrationKey,
        JSON.stringify({
          name: "*", // Default name value
          password: hashedPassword,
          otp,
          username: username || email.split("@")[0], // User provided username or default to email prefix
          gender: gender || "*", // User provided gender or default to '*'
        }),
        {
          EX: parseInt(process.env.OTP_EXPIRY) || 300, // Default to 5 minutes
        }
      );
      const results = await multi.exec();

      if (results) {
        console.log(`Debug: Registration data set successfully for ${email}`);
        break;
      } else {
        console.log(`Debug: Race condition detected for ${email}, retrying...`);
        retries--;
        if (retries === 0) {
          return {
            success: false,
            message: "Registration failed due to a conflict. Please try again.",
            code: "REGISTRATION_CONFLICT",
          };
        }
      }
    }

    try {
      await sendOtpEmail(email, otp);
      console.log(`Debug: OTP sent to ${email}`);
    } catch (emailError) {
      console.error(`Error sending OTP email: ${emailError.message}`);
      throw emailError;
    }

    return {
      success: true,
      message: "OTP sent to email. Please verify within 2 minutes.",
      code: "OTP_SENT",
    };
  } catch (error) {
    console.error(`Error in registration queue process: ${error.message}`);
    return {
      success: false,
      message: "Registration failed",
      error: error.message,
      code: "REGISTRATION_ERROR",
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

// Controller functions
const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Attempting to register user: ${email}`);

    const job = await registration_queue.add(
      { email, password },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    const result = await job.finished();
    console.log(`Registration job completed result: ${JSON.stringify(result)}`);

    if (result.success) {
      res.status(200).json(result);
    } else {
      const statusCodes = {
        ALREADY_REGISTERED: 400,
        REGISTRATION_IN_PROGRESS: 409,
        REGISTRATION_ERROR: 500,
        INVALID_PASSWORD_FORMAT: 400,
        REGISTRATION_CONFLICT: 409,
      };
      const statusCode = statusCodes[result.code] || 400;
      res.status(statusCode).json(result);
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
      code: "SYSTEM_ERROR",
    });
  }
};

// Verification queue process
verification_queue.process(async (job) => {
  const { email, otp } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting OTP verification for email: ${email}`);
    const stored_key = `registration:${email}`;
    const stored_data = await redisClient.get(stored_key);

    if (!stored_data) {
      console.log(`Debug: No stored data found for email: ${email}`);
      return {
        success: false,
        message: "OTP has expired or is invalid. Please request a new OTP.",
        code: "INVALID_OTP",
      };
    }

    const {
      name,
      password: storedHashedPassword,
      otp: storedOTP,
      username,
      gender,
    } = JSON.parse(stored_data);

    if (otp !== storedOTP) {
      console.log(`Debug: Incorrect OTP for email: ${email}`);
      return {
        success: false,
        message: "Incorrect OTP. Please try again.",
        code: "WRONG_OTP",
      };
    }

    try {
      // Check if user exists by email only
      const existingUser = await User.findOne({ email }).select("+password");
      if (existingUser) {
        console.log(`Debug: User already exists for email: ${email}`);
        await redisClient.del(stored_key);
        return {
          success: false,
          message:
            "This email is already registered. Please login instead of registering again.",
          code: "ALREADY_REGISTERED",
        };
      }

      const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
      const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
      const defaultProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

      // Create new user with stored data
      const newUser = new User({
        name,
        email,
        password: storedHashedPassword,
        username: username || email.split("@")[0], // User provided username or default to email prefix
        gender: gender || "*", // User provided gender or default to '*'
        ProfilePic:
          gender === "male"
            ? boyProfilePic
            : gender === "female"
            ? girlProfilePic
            : defaultProfilePic,
      });
      console.log(
        `Debug: Decided ProfilePic for ${email}: ${newUser.ProfilePic}`
      );
      await newUser.save();
      console.log(`Debug: User saved successfully for email: ${email}`);

      await redisClient.del(stored_key);
      return {
        success: true,
        message: "Registration completed successfully. You can now login.",
        code: "SUCCESS",
      };
    } catch (error) {
      console.error(`Error saving user: ${error.message}`);
      if (error.code === 11000) {
        console.log(`Debug: Duplicate key error for email: ${email}`);
        await redisClient.del(stored_key);
        return {
          success: false,
          message:
            "This email is already registered. Please login instead of registering again.",
          code: "ALREADY_REGISTERED",
        };
      }
      return {
        success: false,
        message: "An error occurred during registration. Please try again.",
        code: "SAVE_ERROR",
        error: error.message,
      };
    }
  } catch (error) {
    console.error(`Error in verification queue process: ${error.message}`);
    return {
      success: false,
      message: "Verification failed due to a system error. Please try again.",
      code: "SYSTEM_ERROR",
      error: error.message,
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const job = await verification_queue.add(
      { email, otp },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );
    const result = await job.finished();

    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      const statusCodes = {
        ALREADY_REGISTERED: 400,
        INVALID_OTP: 400,
        WRONG_OTP: 400,
        SAVE_ERROR: 500,
        SYSTEM_ERROR: 500,
      };
      const statusCode = statusCodes[result.code] || 400;
      res.status(statusCode).json({
        message: result.message,
        code: result.code,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "OTP verification failed",
      error: error.message,
      code: "SYSTEM_ERROR",
    });
  }
};

// Login queue process
login_queue.process(async (job) => {
  const { email, password, userAgent } = job.data;
  let redisClient = await redisClientPool.borrowClient();
  try {
    console.log(`Debug: Starting login process for email: ${email}`);

    // Explicitly select password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log(`Debug: User not found for email: ${email}`);
      return {
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }

    console.log(
      `Debug: Found user password hash: ${user.password.substring(0, 10)}...`
    );

    // Ensure password is properly trimmed
    const trimmedPassword = password.trim();

    // Use the user model's comparePassword method
    const isMatch = await user.comparePassword(trimmedPassword);
    console.log(`Debug: Password comparison result: ${isMatch}`);

    if (!isMatch) {
      return {
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      sessionId,
      userId: user._id,
      email: user.email,
      userAgent,
      createdAt: Date.now(),
    });

    await redisClient.set(`session:${sessionId}`, sessionData, {
      EX: parseInt(process.env.SESSION_EXPIRY) || 86400, // Default to 24 hours
    });

    const token = jwt.sign({ sessionId, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || "24h",
    });

    return {
      success: true,
      token,
      message: "Login successful",
      code: "LOGIN_SUCCESS",
    };
  } catch (error) {
    console.error(`Debug: Login process error:`, error);
    return {
      success: false,
      message: "Login failed",
      error: error.message,
      code: "LOGIN_ERROR",
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const login = async (req, res) => {
  console.log("Request body in login:", req.body);
  try {
    const { email, password } = req.body;

    const job = await login_queue.add(
      {
        email,
        password,
        userAgent: req.headers["user-agent"],
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    const result = await job.finished();
    if (result.success) {
      res.cookie("session", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(process.env.SESSION_EXPIRY) * 1000, // Ensure SESSION_EXPIRY is defined
      });
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
      }
      res.status(200).json({ user: user });
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Logout queue process
logout_queue.process(async (job) => {
  let redisClient = await redisClientPool.borrowClient();
  const { sessionId, email } = job.data;
  try {
    console.log(`Debug: Starting logout process for email: ${email}`);
    const sessionKey = `session:${sessionId}`;
    const sessionData = await redisClient.get(sessionKey);
    if (!sessionData) {
      console.log(`Debug: Session not found for logout: ${sessionId}`);
      return {
        success: false,
        message: "Session not found",
        code: "SESSION_NOT_FOUND",
      };
    }

    await redisClient.del(sessionKey);

    console.log(`Debug: Logout successful for email: ${email}`);
    return {
      success: true,
      message: "Logout successful",
      code: "LOGOUT_SUCCESS",
    };
  } catch (error) {
    console.error(`Error in logout queue process: ${error.message}`);
    return {
      success: false,
      message: "Logout failed",
      error: error.message,
      code: "LOGOUT_ERROR",
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const logout = async (req, res) => {
  try {
    const token = req.cookies.session;
    if (!token) {
      return res
        .status(400)
        .json({ message: "No session found", code: "NO_SESSION" });
    }

    let sessionId, email;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      sessionId = decoded.sessionId;
      email = decoded.email;
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid token", code: "INVALID_TOKEN" });
    }

    const job = await logout_queue.add(
      { sessionId, email },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    const result = await job.finished();

    if (result.success) {
      res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.setHeader("Clear-Site-Data", '"cookies", "storage"');

      res.status(200).json({ message: result.message, code: result.code });
    } else {
      res.status(500).json({ message: "Logout failed", code: result.code });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({
        message: "Logout failed",
        error: error.message,
        code: "SYSTEM_ERROR",
      });
  }
};

forgot_password_queue.process(async (job) => {
  const { email } = job.data;
  let redisClient;
  try {
    console.log(`Debug: Processing forgot password for: ${email}`);

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Debug: User not found for email: ${email}`);
      return {
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      };
    }

    redisClient = await redisClientPool.borrowClient();

    // Generate a unique token
    const timestamp = Date.now();
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 12);

    // Create Redis key with email and timestamp
    const redisKey = `resetToken:${email}:${timestamp}`;

    // Store token data
    const tokenData = {
      userId: user._id.toString(),
      email: user.email,
      hashedToken,
      expires: timestamp + 120000,
      created: timestamp,
    };

    // Set the token in Redis with proper structure
    await redisClient.set(redisKey, JSON.stringify(tokenData), "EX", 3600);

    // Debug: Verify the key structure
    console.log(`Debug: Stored reset token with key structure:`, redisKey);

    // Clean up old tokens for this email
    const oldTokens = await redisClient.keys(`resetToken:${email}:*`);
    console.log(
      `Debug: Found ${oldTokens.length} existing tokens for ${email}`
    );

    for (const key of oldTokens) {
      if (key !== redisKey) {
        console.log(`Debug: Cleaning up old token:`, key);
        await redisClient.del(key);
      }
    }

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    // Debug: Show current tokens
    const currentTokens = await redisClient.keys(`resetToken:${email}:*`);
    console.log(`Debug: Current tokens for ${email}:`, currentTokens);

    return {
      success: true,
      message: "Password reset email sent reset your password within 2 minutes",
      code: "RESET_EMAIL_SENT",
      resetToken:
        process.env.NODE_ENV === "development" ? resetToken : undefined,
      debug: {
        tokenKey: redisKey,
        currentTokens,
      },
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "Failed to process forgot password request",
      error: error.message,
      code: "FORGOT_PASSWORD_ERROR",
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`Debug: Processing forgot password for: ${email}`);

    const job = await forgot_password_queue.add({ email });
    const result = await job.finished();

    if (result.success) {
      res.status(200).json({
        message: result.message,
        code: result.code,
        resetToken: result.resetToken,
      });
    } else {
      res.status(400).json({
        message: result.message,
        code: result.code,
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({
        message: "Failed to process forgot password request",
        error: error.message,
        code: "FORGOT_PASSWORD_ERROR",
      });
  }
};

reset_password_queue.process(async (job) => {
  const { token, newPassword } = job.data;
  let redisClient;
  try {
    console.log(
      `Debug: Attempting to reset password for token: ${token.substring(
        0,
        10
      )}...`
    );

    redisClient = await redisClientPool.borrowClient();

    const resetTokens = await redisClient.keys("resetToken:*");
    let resetData = null;
    let matchedTokenKey = null;

    for (const tokenKey of resetTokens) {
      const data = await redisClient.get(tokenKey);
      if (data) {
        const parsedData = JSON.parse(data);
        if (
          parsedData.hashedToken &&
          (await bcrypt.compare(token, parsedData.hashedToken))
        ) {
          resetData = parsedData;
          matchedTokenKey = tokenKey;
          break;
        }
      }
    }

    if (!resetData) {
      console.log("Debug: No matching reset token found");
      return {
        success: false,
        message: "Invalid or expired reset token",
        code: "INVALID_RESET_TOKEN",
      };
    }

    const { userId, email, expires } = resetData;

    if (Date.now() > expires) {
      await redisClient.del(matchedTokenKey);
      console.log(`Debug: Token expired for email: ${email}`);
      return {
        success: false,
        message: "Reset token has expired",
        code: "EXPIRED_RESET_TOKEN",
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log(`Debug: User not found for userId: ${userId}`);
      return {
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      };
    }

    user.password = await bcrypt.hash(newPassword.trim(), 12);
    await user.save();

    // Delete the used token
    await redisClient.del(matchedTokenKey);

    // Clean up any other reset tokens for this user
    const otherTokens = resetTokens.filter((t) => t !== matchedTokenKey);
    for (const key of otherTokens) {
      const data = await redisClient.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.email === email) {
          await redisClient.del(key);
          console.log(`Cleaned up additional reset token for email: ${email}`);
        }
      }
    }

    console.log(`Debug: Password reset successfully for email: ${email}`);
    return {
      success: true,
      message: "Password reset successfully",
      code: "PASSWORD_RESET_SUCCESS",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "Password reset failed",
      error: error.message,
      code: "PASSWORD_RESET_ERROR",
    };
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
});

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log(
      `Debug: Attempting to reset password for token: ${token.substring(
        0,
        10
      )}...`
    );

    const job = await reset_password_queue.add({ token, newPassword });
    const result = await job.finished();

    if (result.success) {
      res.status(200).json({
        message: result.message,
        code: result.code,
      });
    } else {
      res.status(400).json({
        message: result.message,
        code: result.code,
      });
    }
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      message: "Password reset failed",
      error: error.message,
      code: "PASSWORD_RESET_ERROR",
    });
  }
};

const deleteUser = async (req, res) => {
  let redisClient;
  try {
    const { email, password } = req.body;
    console.log(`Debug: Attempting to delete user: ${email}`);

    // Find the user in MongoDB
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Authenticate the user
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        code: "INVALID_PASSWORD",
      });
    }

    // Delete user from MongoDB
    await User.findOneAndDelete({ email });

    // Delete user-related data from Redis
    redisClient = await redisClientPool.borrowClient();
    const registrationKey = `registration:${email}`;
    await redisClient.del(registrationKey);

    // Find and delete any active sessions for this user
    const sessionPattern = `session:*`;
    const sessionKeys = await redisClient.keys(sessionPattern);
    for (const key of sessionKeys) {
      const sessionData = await redisClient.get(key);
      const session = JSON.parse(sessionData);
      if (session.email === email) {
        await redisClient.del(key);
      }
    }

    // Delete any reset tokens for this user
    const resetTokenPattern = `resetToken:${email}:*`;
    const resetTokenKeys = await redisClient.keys(resetTokenPattern);
    for (const key of resetTokenKeys) {
      await redisClient.del(key);
    }

    console.log(`Debug: User deleted successfully: ${email}`);
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      code: "USER_DELETED",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
      code: "DELETE_USER_ERROR",
    });
  } finally {
    if (redisClient) {
      await redisClientPool.returnClient(redisClient);
    }
  }
};

const welcomeMessage = (req, res) => {
  try {
    res.status(200).json({ message: "Welcome", code: "WELCOME" });
  } catch (error) {
    console.error("Error in welcomeMessage:", error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message || "Unknown error",
      code: "SYSTEM_ERROR",
    });
  }
};

const checkAuthentication = async (req, res) => {
  try {
    // Optionally access `req.user` if added by the authMiddleware
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.error("Error in checkAuthentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const SetUserInformation = async (req, res) => {
  try {
    const { name, email, username, gender } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user information
    if (name) user.name = name;

    if (username) {
      // Check if the new username is already taken
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser.email !== email) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      user.username = username;
    }

    if (gender) {
      // Validate gender
      if (!["male", "female", "*"].includes(gender.toLowerCase())) {
        return res.status(400).json({ message: "Invalid gender value" });
      }
      user.gender = gender.toLowerCase();
    }

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${name}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${name}`;
    user.ProfilePic = gender === "male" ? boyProfilePic : girlProfilePic;
    // Save the updated user
    await user.save();

    res.status(200).json({
      message: "User information updated successfully",
      user: {
        name: user.name,
        email: user.email,
        username: user.username,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("Error in SetUserInformation:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", details: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  register,
  deleteUser,
  verifyOtp,
  login,
  logout,
  welcomeMessage,
  forgotPassword,
  resetPassword,
  checkAuthentication,
  SetUserInformation,
};
