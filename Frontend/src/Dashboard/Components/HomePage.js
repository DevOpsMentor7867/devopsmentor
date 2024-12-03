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

    const SetUserInformation = async (profileData) => {
      try {
        const response = await axios.post('/api/user/SetUserInformation', {
          ...profileData,
          email: user?.email || userData.email
        });
        console.log("API Response:", response.data);
        return true;
      } catch (error) {
        console.error("Error sending profile data:", error);
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
          setShowProfileSetup(false);
        } else {
          // Handle error - you might want to show an error message to the user
          console.log("Failed to save profile data. Please try again.");
        }
    };

    return (
        <div className='text-center text-gtb mt-12'>
            <h1>This is the homepage</h1>
            {showProfileSetup && (
                <ProfileSetupModal
                    email={userData.email}
                    onSave={handleProfileSave}
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

