const crypto = require("crypto");
const redis = require("redis");
const Bull = require("bull");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// connecting client to redis server
const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

// error handling for redis
redisClient.connect().catch(console.error);

// queues for concurrency
const registration_queue = new Bull("registration", {
  redis: { port: 6379, host: "localhost" },
});

const verification_queue = new Bull("verification", {
  redis: { port: 6379, host: "localhost" },
});

const login_queue = new Bull("login", {
  redis: { port: 6379, host: "localhost" },
});

const logout_queue = new Bull("logout", {
  redis: { port: 6379, host: "localhost" },
});

// otp expiry duration
const OTP_EXPIRY = 120;
const SESSION_EXPIRY = 3600;
// functions
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

async function sendOtpEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration OTP",
      text: `Your OTP is ${otp}. It will expire in 2 minutes.`,
    });
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send OTP email to ${email}:`, error);
    throw error;
  }
}

// queue process to handle multiple client requests for registration
registration_queue.process(async (job) => {
  const { email, password } = job.data;

  try {
    const registrationKey = `registration:${email}`;
    const registrationExists = await redisClient.get(registrationKey);

    if (registrationExists) {
      console.log(`Registration already exists for ${email}`);
      return {
        message: "Registration already in progress. Please check your email",
      };
    }

    const otp = generateOtp();
    await redisClient.set(registrationKey, JSON.stringify({ password, otp }), {
      EX: OTP_EXPIRY,
    });

    const storedData = await redisClient.get(registrationKey);
    console.log(`Stored data for ${email}:`, storedData);

    await sendOtpEmail(email, otp);
    console.log(`OTP sent to ${email}`);
    return { message: "OTP sent to email. Please verify within 2 minutes." };
  } catch (error) {
    console.error(`Error in registration queue process: ${error.message}`);
    throw error;
  }
});

// queue process to handle multiple OTP verifications
verification_queue.process(async (job) => {
  const { email, otp } = job.data;

  try {
    const stored_key = `registration:${email}`;
    const stored_data = await redisClient.get(stored_key);
    if (!stored_data) {
      return { success: false, message: "Your OTP has expired. Please Request a new OTP " };
    }
    const { password: storedPassword, otp: storedOTP } =
      JSON.parse(stored_data);
    if (otp == storedOTP) {
      const newUser = new User({ email, password: storedPassword });
      await newUser.save();
      console.log("User saved successfully:", newUser);
      await redisClient.del(stored_key);
      return { success: true, message: "OTP verified successfully" };
    } else {
      return { success: false, message: "The OTP is Invalid" };
    }
  } catch (error) {
    console.error(`Error in verification queue process: ${error.message}`);
    throw error;
  }
});

login_queue.process(async (job) => {
  const { email, password } = job.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message:
          "This user does not exist. Please check your email or create a new account.",
      };
    }

    const password_match = await bcrypt.compare(password, user.password);
    if (!password_match) {
      return { success: false, message: "Invalid  password credentials" };
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      userId: user._id,
      email: user.email,
    });

    await redisClient.set(`session:${sessionId}`, sessionData, {
      EX: SESSION_EXPIRY,
    });

    const token = jwt.sign({ sessionId }, process.env.JWT_SECRET);

    return { success: true, token, message: "Login successful" };
  } catch (error) {
    console.error(`Error in login queue process: ${error.message}`);
    throw error;
  }
});

logout_queue.process(async (job) => {
  const { sessionId } = job.data;
  try {
    await redisClient.del(`session:${sessionId}`);
    return { success: true, message: "Logout successful" };
  } catch (error) {
    console.error(`Error in logout queue process: ${error.message}`);
    throw error;
  }
});

// user controller defined for authentication
const userController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          message:
            "This user already exists. Please sign in or use a different email to create a new account.",
        });
      }

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
      console.log(
        `Registration job completed result: ${JSON.stringify(result)}`
      );
      res.status(200).json(result);
    } catch (error) {
      console.error("Registration error:", error);
      res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log("from otp", email, otp);
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
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      res
        .status(500)
        .json({ message: "OTP verification failed", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const job = await login_queue.add(
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
      if (result.success) {
        res.cookie("session", result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          sameSite: "strict", // Protect against CSRF
          maxAge: SESSION_EXPIRY * 1000, // Convert seconds to milliseconds
        });
        res.status(200).json({ token: result.token, email: email });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  },
  logout: async (req, res) => {
    try {
      const token = req.cookies.session;
      if (!token) {
        return res.status(400).json({ message: "No session found" });
      }

      let sessionId;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        sessionId = decoded.sessionId;
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const job = await logout_queue.add(
        { sessionId },
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

        res.status(200).json({ message: result.message });
      } else {
        res.status(500).json({ message: "Logout failed" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed", error: error.message });
    }
  },
};

registration_queue.on("error", (error) => {
  console.error("Registration queue error:", error);
});

registration_queue.on("failed", (job, error) => {
  console.error(`Registration job ${job.id} failed:`, error);
});

verification_queue.on("error", (error) => {
  console.error("Verification queue error:", error);
});

verification_queue.on("failed", (job, error) => {
  console.error(`Verification job ${job.id} failed:`, error);
});

module.exports = userController;
