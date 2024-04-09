import React, { useState, useEffect } from 'react';
import './styles.css';
import AppIcon from '../public/images/icon.png'; 
const LocalStorageFormKey = 'userData';
import db from './indexedDB';
import { recordLocation } from './locationService';
import History from './History';
import Map from './Map';
import WebcamCapture from './WebCam';

const FormPage = ({ onSave }) => {
  const [userName, setUserName] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (userName && emergencyContactName && emergencyContactPhone) {
      onSave({ userName, emergencyContactName, emergencyContactPhone });
    } else {
      alert('All fields are required');
    }
  };

  return (
    <div className="form-container">
      <h1>SafeJourney</h1> 
      <img src={AppIcon} alt="SafeJourney" className="app-icon"/>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Emergency Contact Name"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Emergency Contact Phone"
          value={emergencyContactPhone}
          onChange={(e) => setEmergencyContactPhone(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
        <p className="disclaimer">For your safety, please allow us to collect some security information to ensure that we can send an SMS to contact your emergency contacts if danger is detected.</p>
      </form>
    </div>
  );
};

const MainPage = ({ userData, onUpdate }) => {
  const [lastStatus, setLastStatus] = useState(0);

  useEffect(() => {
        const intervalId = setInterval(() => {
            recordLocation(setLastStatus);
        }, lastStatus === 'success' ? userData.regularInterval * 60000 : userData.urgentInterval * 60000);

        return () => clearInterval(intervalId);
    }, [lastStatus, userData.regularInterval, userData.urgentInterval]);
  
  const handleUpdate = () => {
    onUpdate({
      userName: document.getElementById('userName').value,
      emergencyContactName: document.getElementById('emergencyContactName').value,
      emergencyContactPhone: document.getElementById('emergencyContactPhone').value,
      regularInterval: parseInt(document.getElementById('regularInterval').value, 10),
      urgentInterval: parseInt(document.getElementById('urgentInterval').value, 10)
    });
  };

  // Function to simulate sending an emergency SMS
  const handleSendSMS = async (userName, emergencyContactPhone, lastKnownLocation) => {
    const phone = emergencyContactPhone; // Use the emergency contact's phone number dynamically
    const messageBody = `Emergency alert! This is an important message from SafeJourney. Your friend ${userName} might be in danger, their last known location was at ${lastKnownLocation}`;

    try {
        const response = await fetch('http://localhost:3001/send-sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: phone,
                body: messageBody,
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Server Response:', data);
    } catch (error) {
        console.error('Error sending SMS:', error.message);
    }
};

  return (
    <div className="main-container">
      <h1>SafeJourney</h1>
      <img src={AppIcon} alt="SafeJourney" className="app-icon"/>
      <h2 className="settings-heading">Settings</h2>
      <div className="input-group">
        <label htmlFor="userName">Name:</label>
        <input id="userName" type="text" defaultValue={userData.userName} />
      </div>
      <div className="input-group">
        <label htmlFor="emergencyContactName">E. Contact:</label>
        <input id="emergencyContactName" type="text" defaultValue={userData.emergencyContactName} />
      </div>
      <div className="input-group">
        <label htmlFor="emergencyContactPhone">E. Phone:</label>
        <input id="emergencyContactPhone" type="text" defaultValue={userData.emergencyContactPhone} />
      </div>
      <div className="input-group">
        <label htmlFor="regularInterval">Record Interval (min):</label>
        <input id="regularInterval" type="number" defaultValue={userData.regularInterval || 10} />
      </div>
      <div className="input-group">
        <label htmlFor="urgentInterval">Urgent Record Interval (min):</label>
        <input id="urgentInterval" type="number" defaultValue={userData.urgentInterval || 2} />
      </div>
      <div className="action-buttons">
        <button onClick={handleUpdate}>Update Info</button>
        <button onClick={recordLocation}>Send Location</button>
        <button onClick={handleSendSMS}>Send Help SMS</button>
      </div>
      <History /> 
      <Map />
      <WebcamCapture onSave={handleSaveImage} />
    </div>
  );
};

function handleSaveImage(imageSrc) {
  navigator.geolocation.getCurrentPosition(
      async position => {
          await db.images.add({
              imageSrc: imageSrc,
              datetimeStamp: new Date().toISOString(),
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
          });
          console.log("Image data saved successfully to IndexedDB.");
      },
      error => {
          console.error("Error obtaining location:", error);
      },
      { enableHighAccuracy: true }
  );
}

// Setup periodic location recording
const setupLocationRecording = (userData) => {
  setInterval(() => recordLocation(userData), userData.regularInterval * 60000); // Convert minutes to milliseconds
};


export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem(LocalStorageFormKey));
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  const handleSave = (data) => {
    localStorage.setItem(LocalStorageFormKey, JSON.stringify(data));
    setUserData(data);
  };

  const handleUpdate = (data) => {
    localStorage.setItem(LocalStorageFormKey, JSON.stringify(data));
    setUserData(data); // Update local state to reflect changes
  };

  return (
    <div className="App">
      {!userData ? (
        <FormPage onSave={handleSave} />
      ) : (
        <MainPage userData={userData} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
