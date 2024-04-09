// Map.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import db from './indexedDB';

const Map = () => {
    const [locations, setLocations] = useState([]);
    // London
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]); 
    // Shanghai(for test)
    // const [mapCenter, setMapCenter] = useState([30, 121]); 

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const data = await db.locations.toArray();
                if (data.length > 0) {
                    const center = getCenter(data);
                    setMapCenter(center);
                    setLocations(data);
                } else {
                    console.log("No data found in database");
                }
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            }
        };
        
        fetchLocations();
    }, []);

    // Function to calculate the geographic center of all markers
    const getCenter = (locations) => {
        const latitudes = locations.map(loc => loc.latitude);
        const longitudes = locations.map(loc => loc.longitude);
        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
        return [avgLat, avgLng];
    };

    return (
        <div style={{ height: '300px', marginBottom: '20px' }}>
            <h2>Map</h2>
            <MapContainer center={mapCenter} zoom={10} style={{ height: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {locations.map(loc => (
                    <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                        <Popup>
                            You are here: ({loc.latitude}, {loc.longitude}). <br /> Recorded: {loc.datetimeStamp}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
