import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import zxcvbn from "zxcvbn";
import NavBar from "../Core/NavBar";
import { Link } from "react-router-dom";
import FloatingIcons from "../Core/FloatingIcons";
import { VerifyOTP } from "../../Hooks/VerifyOTP";
import { RegisterUser } from "../../Hooks/RegisterUser";


export default function SignUp() {
  const [showOTP, setShowOTP] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ["", "", "", "", "", ""],
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: signupData,
  });

  const password = watch("password", "");

  const handleInputChange = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleOTPChange = (index, value) => {
    const newOTP = [...signupData.otp];
    newOTP[index] = value;
    setSignupData((prev) => ({ ...prev, otp: newOTP }));

    if (value !== "" && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const getPasswordStrength = (password) => {
    const result = zxcvbn(password);
    return result.score; // 0 to 4
  };

  const renderPasswordStrength = (password) => {
    const strength = getPasswordStrength(password);
    const width = `${(strength / 4) * 100}%`;
    let color = "bg-red-500";
    if (strength > 2) color = "bg-yellow-500";
    if (strength > 3) color = "bg-green-500";

    return (
      <div className="mt-1">
        <div className="h-1 w-full bg-gray-300 rounded-full">
          <div
            className={`h-1 ${color} rounded-full transition-all duration-300 ease-in-out`}
            style={{ width }}
          ></div>
        </div>
        <p className="text-xs mt-1 text-gray-400">
          {strength === 0 && "Very Weak"}
          {strength === 1 && "Weak"}
          {strength === 2 && "Fair"}
          {strength === 3 && "Good"}
          {strength === 4 && "Strong"}
        </p>
      </div>
    );
  };


  const { signup } = RegisterUser();
  const onSubmit = async () => {
    console.log(signupData);
    await signup(signupData.name, signupData.email, signupData.password);
    setShowOTP(true);
  };

  
  const { PostSignup, signupError, signupIsLoading } = VerifyOTP();
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = signupData.otp.join("");
  
    if (otpValue.length < 6 || otpValue.includes(" ")) {
      setOtpError("OTP must be 6 digits long and all fields must be filled.");
      setSignupData((prev) => ({ ...prev, otp: ["", "", "", "", "", ""] }));
    } else {
      console.log("OTP :", otpValue);
      setOtpError("");
  
      await PostSignup(signupData.email, otpValue);
    }
  };
  

  return (
    <>
      <NavBar />
      <FloatingIcons />
      <div className="min-h-screen  flex items-center justify-center  bg-gray-900 text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 relative z-10 -mt-24">
          <h2 className="text-3xl font-bold mb-6 text-center text-customGreen">
            Start Learning Today
          </h2>
          <h2 className="text-2xl font-bold mb-6 text-center">
            Create An Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <Controller
                name="name"
                control={control}
                rules={{
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters long",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    value={signupData.name}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e, setSignupData);
                    }}
                  />
                )}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    value={signupData.email}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e, setSignupData);
                    }}
                  />
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Password
              </label>
              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  validate: (value) => {
                    return (
                      [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].every(
                        (pattern) => pattern.test(value)
                      ) ||
                      "Must include lower, upper, number, and special chars"
                    );
                  },
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    value={signupData.password}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e, setSignupData);
                    }}
                  />
                )}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
              {password && renderPasswordStrength(password)}
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm Password
              </label>
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    value={signupData.confirmPassword}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange(e, setSignupData);
                    }}
                  />
                )}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-customGreen text-white py-2 rounded-md hover:bg-greenhover transition-colors"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-customGreen hover:underline">
              Log In
            </Link>
          </p>
        </div>

        <AnimatePresence>
          {showOTP && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-50 z-20"
            >
              <div className="bg-gray-800 p-8 rounded-lg shadow-2xl relative max-w-lg">
                <button
                  onClick={() => setShowOTP(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
                <h3 className="text-xl font-bold mb-4">Verify Your Account</h3>
                <p className="text-sm text-gray-400 mb-4">
                  We've sent a one-time password to {signupData.email}. Please enter it
                  below to complete your registration.
                </p>
                <div className="flex justify-between mb-6">
                  {signupData.otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-red-500 text-xs mb-4">{otpError}</p>
                )}
                {signupError && <div className="text-red-500 text-xs mb-4">{signupError}</div>}
                <button
                  disabled={signupIsLoading}
                  onClick={handleVerifyOTP}
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Verify OTP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}