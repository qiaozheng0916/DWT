// src/locationService.js
import db from './indexedDB';

export const recordLocation = async (setLastStatus) => {
  navigator.geolocation.getCurrentPosition(
    async position => {
      const { latitude, longitude } = position.coords;
      const locationData = {
        datetimeStamp: new Date().toISOString(),
        latitude,
        longitude,
        sendStatus: 0 
      };

      try {
        await db.locations.add(locationData);
        console.log("Location data saved successfully to IndexedDB.", locationData);

        // Attempt to send the data to the server
        const response = await fetch('http://localhost:5000/location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(locationData)
        });

        const responseData = await response.json();
        console.log("Server response:", responseData);
        setLastStatus('success');
      } catch (error) {
        console.error("Failed to save location data or send to server:", error);
        setLastStatus('failed');
      }
    },
    error => {
      console.error("Error obtaining location:", error);
      setLastStatus('failed');
    },
    { enableHighAccuracy: true }
  );
}
