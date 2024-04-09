// History.js
import React, { useEffect, useState } from 'react';
import db from './indexedDB';

const History = () => {
    const [records, setRecords] = useState([]);

    const fetchRecords = async () => {
        const allRecords = await db.locations.toArray();
        setRecords(allRecords);
    };

    useEffect(() => {
        fetchRecords();
    }, []); // Fetch records on component mount

    return (
        <div className="history-container">
            <h2>History</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date/Time</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map(record => (
                            <tr key={record.id}>
                                <td>{record.datetimeStamp}</td>
                                <td>{record.latitude.toFixed(6)}</td>
                                <td>{record.longitude.toFixed(6)}</td>
                                <td>{record.sendStatus === 1 ? 'Success' : 'Failed'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;
