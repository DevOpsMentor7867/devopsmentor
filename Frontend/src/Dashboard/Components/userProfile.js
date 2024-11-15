import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: 'John Doe',
    role: 'DevOps Enthusiast',
    email: 'john.doe@devopsmentor.com',
    labs: 15,
    quizzes: 42,
    tools: 28
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex items-center justify-center h-screen ">
      <div className={`w-full max-w-4xl bg-gray-800/50 rounded-lg shadow-2xl overflow-hidden transition-all duration-1000 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Floating Header */}
        <div className={`bg-gray-900/70 p-8 border-b border-cyan-800 relative z-10 shadow-lg transition-all duration-1000 delay-300 ease-in-out ${isLoaded ? 'opacity-100 -translate-y-2' : 'opacity-0 -translate-y-10'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">{user.name}</h1>
              <p className="text-2xl text-cyan-400">{user.role}</p>
            </div>
            <button 
              onClick={toggleEdit}
              className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={`p-8 pt-12 transition-all duration-1000 delay-500 ease-in-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-2 text-cyan-400">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <p className="text-xl text-white">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-cyan-400">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                ) : (
                  <p className="text-xl text-white">{user.email}</p>
                )}
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{user.labs}</p>
                  <p className="text-lg text-cyan-400">Labs</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{user.quizzes}</p>
                  <p className="text-lg text-cyan-400">Quizzes</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-white">{user.tools}</p>
                  <p className="text-lg text-cyan-400">Tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
