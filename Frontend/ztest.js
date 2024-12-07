import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../API/UseAuthContext";
import LoadingPage from "./LoadingPage";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

const UserProfile = () => {
  const { user } = useAuthContext();
  const [user2, setUser] = useState({
    name: user.name,
    username: user.username,
    gender: user.gender,
    email: user.email,
    profilePicture: "https://github.com/shadcn.png", // Placeholder image
  });
  

  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: "", content: "" });
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (apiMessage.content) {
      const timer = setTimeout(() => {
        setApiMessage({ type: "", content: "" });
      }, 3000); // Clear message after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [apiMessage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleGenderChange = (e) => {
    setUser((prevUser) => ({
      ...prevUser,
      gender: e.target.value,
    }));
  };

  const toggleEdit = async () => {
    if (isEditing) {
      try {
        const response = await api.post("/user/SetUserInformation", {
          email: user2.email,
          name: user2.name,
          username: user2.username,
          gender: user2.gender,
        });

        console.log("API Response:", response.data);

        setApiMessage({
          type: "success",
          content: "Profile saved successfully!",
        });

        // Update the user state with the response data
        setUser((prevUser) => ({
          ...prevUser,
          ...response.data,
        }));
      } catch (error) {
        console.error("API Error:", error);
        setApiMessage({
          type: "error",
          content: "Failed to save profile. Please try again.",
        });
      }
    } else {
      // Clear the API message when entering edit mode
      setApiMessage({ type: "", content: "" });
    }
    setIsEditing(!isEditing);
  };


  const DeleteUser = async () => {
    if (isEditing) {
      try {
        const response = await api.post("/user/SetUserInformation", {
          email: user2.email,
          name: user2.name,
          username: user2.username,
          gender: user2.gender,
        });

        console.log("API Response:", response.data);

        setApiMessage({
          type: "success",
          content: "Profile saved successfully!",
        });

        // Update the user state with the response data
        setUser((prevUser) => ({
          ...prevUser,
          ...response.data,
        }));
      } catch (error) {
        console.error("API Error:", error);
        setApiMessage({
          type: "error",
          content: "Failed to save profile. Please try again.",
        });
      }
    } else {
      // Clear the API message when entering edit mode
      setApiMessage({ type: "", content: "" });
    }
    setIsEditing(!isEditing);
  };

  if (!isLoaded) {
    return <LoadingPage />;
  }

  return (
    <>
    <div className="fixed inset-0 z-0">
        <img
          src="/homebgc.jpg"
          alt="Background"
          className="w-full h-full object-cover mt-12"
        />
        <div className="absolute  inset-0 bg-black/70 backdrop-blur-sm" />
      </div>
      <div className="max-w-xl mx-auto p-6 border border-[#09D1C7]/60 bg-white/5 rounded-xl mt-16 relative backdrop-blur-sm">
      <div
        className={`flex gap-4 ${
          apiMessage.content ? "justify-between" : "justify-end"
        }  mb-4 z-50`}
        >
        {apiMessage.content && (
          <div
          className={`px-4 py-2 rounded-md text-sm font-medium ${
              apiMessage.type === "success"
                ? "bg-[#80EE98]/20 text-[#80EE98]"
                : "bg-red-500/20 text-red-500"
            }`}
            >
            {apiMessage.content}
          </div>
        )}
        <button
          onClick={toggleEdit}
          className="px-4 py-2 bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] font-medium rounded-md transition-all duration-300"
        >
          {isEditing ? "Save Profile" : "Edit Profile"}
        </button>
        <button
          onClick={() => setShowDeleteAccount(true)}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          Delete User
        </button>
      </div>

      <div className="flex flex-row items-center text-center">
        <div className="w-32 h-32 relative ml-2">
          <img
            src={user2.profilePicture}
            alt={user2.name}
            className="rounded-full w-full h-full object-cover border-4 border-[#80EE98]/20"
            />
        </div>
        <div className="flex flex-col ml-4">
          <h1 className="text-3xl font-bold text-white">{user2.name}</h1>
          <p className="text-[#09D1C7]">@{user2.username}</p>
        </div>
      </div>

      <div className="space-y-6 mt-3">
        <div className="space-y-2">
          <label className="block text-[#09D1C7] text-sm font-medium">
            Name
          </label>
          {isEditing ? (
            <input
            type="text"
            name="name"
            value={user2.name}
            onChange={handleInputChange}
            className="flex-1 bg-transparent border border-[#80EE98]/20 group-hover:border-[#09D1C7]/40 focus:border-[#09D1C7] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#09D1C7] transition-colors w-full"
            />
          ) : (
            <div className="w-full bg-[#1A202C]/50 border border-[#09D1C7]/20 rounded-md px-4 py-2 text-white hover:bg-[#09D1C7]/20">
              {user2.name}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-[#80EE98] text-sm font-medium">
            Username
          </label>
          {isEditing ? (
            <input
            type="text"
            name="username"
            value={user2.username}
              onChange={handleInputChange}
              className="flex-1 bg-transparent border border-[#80EE98]/20 group-hover:border-[#80EE98]/40 focus:border-[#80EE98] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#80EE98] transition-colors w-full"
              />
            ) : (
              <div className="w-full bg-[#1A202C]/50 border border-[#80EE98]/20 rounded-md px-4 py-2 text-white hover:bg-[#80EE98]/20">
              {user2.username}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-[#09D1C7] text-sm font-medium">
            Gender
          </label>
          {isEditing ? (
            <select
            name="gender"
            value={user2.gender}
            onChange={handleGenderChange}
            className="flex-1 bg-transparent border border-[#80EE98]/20 group-hover:border-[#09D1C7]/40 focus:border-[#09D1C7] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#09D1C7] transition-colors w-full"
            >
              <option
                value="Male"
                className="bg-[#1A202C] hover:bg-[#09D1C7]/80 text-white"
                >
                Male
              </option>
              <option
                value="Female"
                className="bg-[#1A202C] hover:bg-[#80EE98]/80 text-white"
              >
                Female
              </option>
            </select>
          ) : (
            <div className="w-full bg-[#1A202C]/50 border border-[#09D1C7]/20 rounded-md px-4 py-2 text-white hover:bg-[#09D1C7]/20">
              {user2.gender}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-[#80EE98] text-sm font-medium">
            Email
          </label>
          <div className="w-full bg-[#1A202C]/50 border border-[#80EE98]/20 rounded-md px-4 py-2 text-white hover:bg-[#80EE98]/20">
            {user2.email}
          </div>
        </div>
      </div>
    </div>

    <AnimatePresence>
          {showDeleteAccount && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-20"
            >
              <div className="bg-gray-900 p-8 rounded-lg shadow-2xl relative max-w-md w-full mx-4">
                <button
                  onClick={() => {
                    
                  }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <h3 className="text-3xl font-bold mb-4 text-gtb">
                  Password Reset
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  To reset your password, enter the email address you use to
                  sign in to your account
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="text-gtb">
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      // value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-white bg-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={isForgotPasswordLoading}
                    />
                  </div>

                  {/* {forgotPasswordStatus && (
                    <p
                      className={`text-sm ${
                        forgotPasswordStatus.success
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {forgotPasswordStatus.message}
                    </p>
                  )} */}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98]"
                    // disabled={!forgotPasswordEmail || isForgotPasswordLoading}
                  >
                    {isForgotPasswordLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCcw size={20} className="animate-spin mr-2" />
                        Sending...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
  );
};

export default UserProfile;
