import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import db from './indexedDB'; // Ensure this import points to your Dexie database setup

const WebcamCapture = ({ onSave }) => {
    const webcamRef = React.useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [latestPhoto, setLatestPhoto] = useState(null);
    const [showWebcam, setShowWebcam] = useState(false); // State to toggle webcam view

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        onSave(imageSrc);  // Save the captured image
        setShowWebcam(false);  // Hide the webcam after capturing the image
        fetchLatestPhoto();   // Fetch the latest photo to update the view
    }, [webcamRef, onSave]);

    useEffect(() => {
        fetchLatestPhoto();
    }, []);

    const fetchLatestPhoto = async () => {
        const allPhotos = await db.images.orderBy('datetimeStamp').reverse().toArray();
        if (allPhotos.length > 0) {
            setLatestPhoto(allPhotos[0].imageSrc); // Sets the source of the latest photo
        }
    };

    return (
        <div style={{ marginTop: '60px' }}>
            <h2>Lastest Photo
            </h2>
            <button onClick={() => setShowWebcam(true)}>Activate Camera</button>
            {showWebcam && (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "environment"  // Use the rear-facing camera if available
                    }}
                />
            )}
            {showWebcam && <button onClick={capture}>Capture Photo</button>}
            {imgSrc && <img src={imgSrc} alt="Captured" style={{width: '100%'}} />}
            {latestPhoto && (
                <div>
                    <h3>Latest Photo:</h3>
                    <img src={latestPhoto} alt="Latest Captured" style={{width: '100%', height: 'auto'}} />
                </div>
            )}
        </div>
    );
};

export default WebcamCapture;
