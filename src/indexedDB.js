// indexedDB.js

import Dexie from 'dexie';

const db = new Dexie('SafetyAppDB');
db.version(1).stores({
    locations: '++id, datetimeStamp, latitude, longitude, sendStatus', // Existing table
    images: '++id, imageSrc, datetimeStamp, latitude, longitude' // Ensure this is correctly defined
});

export default db;

