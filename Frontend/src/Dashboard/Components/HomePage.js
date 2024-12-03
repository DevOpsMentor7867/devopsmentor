import React, { useState } from 'react'
import axios from 'axios'
import ProfileSetupModal from './ProfileModal'
import { useAuthContext } from "../../API/UseAuthContext";

export default function HomePage() {
    const [showProfileSetup, setShowProfileSetup] = useState(true);
    const { user } = useAuthContext();
    const [userData, setUserData] = useState({
      email: user?.email || "john.doe@devopsmentor.com",
      name: "",
      username: "",
      gender: ""
    });
    const [apiMessage, setApiMessage] = useState({ type: '', content: '' });

    const SetUserInformation = async (profileData) => {
        // setApiMessage({ type: '', content: '' })
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
          // Modal will be closed after a delay, handled in ProfileSetupModal
        } else {
          // Error message is set in SetUserInformation function
        }
    };

    const handleCloseModal = () => {
      setShowProfileSetup(false);
      setApiMessage({ type: '', content: '' });
    };

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
