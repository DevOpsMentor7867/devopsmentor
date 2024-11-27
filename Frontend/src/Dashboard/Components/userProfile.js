import React, { useState, useEffect } from "react";

const UserProfile = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    role: "DevOps Enthusiast",
    email: "john.doe@devopsmentor.com",
    labs: 15,
    quizzes: 42,
    tools: 28,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => setIsLoaded(true), 500); // Delay for better UX
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex-1">
      {/* Profile Section */}
      <div className="relative p-6">
        <div className="absolute inset-0 opacity-5" />
        <div className="relative">
          {isLoaded ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Profile</h2>
                <button
                  onClick={toggleEdit}
                  className="px-4 py-2 bg-gradient-to-r from-[#80EE98] to-[#09D1C7] text-[#1A202C] hover:from-[#09D1C7] hover:to-[#80EE98] font-medium rounded-md transition-all duration-300"
                >
                  {isEditing ? "Save" : "Edit Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#1A202C]/50 border border-[#80EE98]/20 hover:bg-[#80EE98]/10 transition-colors rounded-lg">
                  <div className="p-6">
                    <h3 className="text-[#80EE98] text-sm font-medium mb-2">Name</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-[#80EE98] text-white text-lg focus:outline-none w-full"
                      />
                    ) : (
                      <p className="text-white text-lg">{user.name}</p>
                    )}
                  </div>
                </div>
                <div className="bg-[#1A202C]/50 border border-[#09D1C7]/20 hover:bg-[#09D1C7]/10 transition-colors rounded-lg">
                  <div className="p-6">
                    <h3 className="text-[#09D1C7] text-sm font-medium mb-2">Email</h3>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        className="bg-transparent border-b border-[#09D1C7] text-white text-lg focus:outline-none w-full"
                      />
                    ) : (
                      <p className="text-white text-lg">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Labs", key: "labs", color: "#80EE98" },
                  { label: "Quizzes", key: "quizzes", color: "#09D1C7" },
                  { label: "Tools", key: "tools", color: "#80EE98" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`bg-[${item.color}]/5 border border-[${item.color}]/20 hover:bg-[${item.color}]/15 transition-colors group rounded-lg`}
                  >
                    <div className="p-6 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          name={item.key}
                          value={user[item.key]}
                          onChange={handleInputChange}
                          className={`text-4xl font-bold text-[${item.color}] bg-transparent text-center w-full focus:outline-none`}
                        />
                      ) : (
                        <p className={`text-4xl font-bold text-[${item.color}] mb-2`}>
                          {user[item.key]}
                        </p>
                      )}
                      <h3 className="text-white/80 text-sm font-medium">{item.label}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-white text-center py-10">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
