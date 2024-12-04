import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ProfileSetupModal from './ProfileModal'
import { useAuthContext } from "../../API/UseAuthContext";

export default function HomePage() {
    const [showProfileSetup, setShowProfileSetup] = useState(true);
    const { user, loading } = useAuthContext();
    const [userData, setUserData] = useState({
      email: "",
      name: "",
      username: "",
      gender: ""
    });
    const [apiMessage, setApiMessage] = useState({ type: '', content: '' });

    useEffect(() => {
      if (user) {
        setUserData(prevData => ({
          ...prevData,
          email: user.email || ""
        }));
      }
    }, [user]);

    const SetUserInformation = async (profileData) => {
      try {
        const response = await axios.post('/api/user/SetUserInformation', {
          ...profileData,
          email: user?.email || userData.email
        });
        console.log("API Response:", response.data);
        setApiMessage({ type: 'success', content: 'Profile saved successfully!' });
        return true;
      } catch (error) {
        console.error("Error sending profile data:", error);
        setApiMessage({ type: 'error', content: error.response?.data?.message || 'Failed to save profile data. Please try again.' });
        return false;
      }
    };

    const handleProfileSave = async (profileData) => {
        console.log("Form Data:", profileData);
        
        const success = await SetUserInformation(profileData);
        
        if (success) {
          setUserData(prevUserData => {
              const updatedUserData = {
                  ...prevUserData,
                  ...profileData
              };
              console.log("Updated userData:", updatedUserData);
              return updatedUserData;
          });
        }
    };

    const handleCloseModal = () => {
      setShowProfileSetup(false);
      setApiMessage({ type: '', content: '' });
    };

    if (loading) {
      return <div className="text-center mt-12">Loading...</div>;
    }
    
    return (
        <div className='text-center text-gtb mt-12'>
            <h1>This is the homepage</h1>
            {showProfileSetup && (
                <ProfileSetupModal
                    email={userData.email}
                    onSave={handleProfileSave}
                    apiMessage={apiMessage}
                    onClose={handleCloseModal}
                />
            )}
            {!showProfileSetup && (
                <div>
                    <h2>Profile Information:</h2>
                    <p>Name: {userData.name}</p>
                    <p>Username: {userData.username}</p>
                    <p>Email: {userData.email}</p>
                    <p>Gender: {userData.gender}</p>
                </div>
            )}
        </div>
    )
}

