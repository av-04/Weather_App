import React, { useState, useEffect } from 'react';
import './App.css'; 

const API_URL = 'http://10.6.61.52:5000/api/weather';

function App() {
    // --- All your existing state variables ---
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [history, setHistory] = useState([]);
    const [currentResult, setCurrentResult] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [error, setError] = useState('');

    // --- Data Fetching (READ) ---
    useEffect(() => {
        fetch(API_URL).then(res => res.json()).then(data => setHistory(data));
    }, []);

    // --- All your existing functions (handleSubmit, handleDelete, etc.) ---
    const handleSubmit = (event) => {
        event.preventDefault();
        setError(''); 
        setCurrentResult(null);

        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, startDate, endDate })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => { throw new Error(err.message) });
            }
            return res.json();
        })
        .then(newRecord => {
            setHistory([newRecord, ...history]); 
            setCurrentResult(newRecord); 
            setLocation(''); setStartDate(''); setEndDate('');
        })
        .catch(err => {
            console.error('Error creating record:', err);
            setError(err.message); 
        });
    };

    const handleDelete = (id) => {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(() => {
            setHistory(prevHistory => prevHistory.filter(record => record._id !== id));
        })
        .catch(err => console.error('Error deleting record:', err));
    };

    const openUpdateModal = (record) => {
        setCurrentRecord(record);    
        setNoteText(record.userNote || ''); 
        setIsModalOpen(true);        
    };

    const closeUpdateModal = () => {
        setIsModalOpen(false);
        setCurrentRecord(null);
        setNoteText('');
    };

    const handleUpdateNote = () => {
        if (!currentRecord) return; 
        const id = currentRecord._id;
        
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userNote: noteText })
        })
        .then(res => res.json())
        .then(updatedRecord => {
            setHistory(prevHistory =>
                prevHistory.map(record =>
                    record._id === id ? updatedRecord : record
                )
            );
            closeUpdateModal(); 
        })
        .catch(err => console.error('Error updating record:', err));
    };

    // --- Helper components (WeatherList, LocationMap) ---
    const WeatherList = ({ weatherData }) => {
        return (
            <div className="weather-list">
                {weatherData.map(day => (
                    <div key={day.date} className="weather-list-item">
                        <span>{day.date}</span>
                        <span>{day.maxTemp}° / {day.minTemp}°</span>
                    </div>
                ))}
            </div>
        );
    };
    
    const LocationMap = ({ lat, lon }) => {
        const mapSrc = `https://maps.google.com/maps?q=${lat},${lon}&hl=en&z=11&output=embed`;
        return (
            <div className="map-container">
                <iframe
                    title="Location Map"
                    src={mapSrc}
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: '8px' }}
                    allowFullScreen=""
                    loading="lazy"
                ></iframe>
            </div>
        );
    };

    // --- NEW: Data Export Functions ---
    
    // This is a generic helper function to trigger a download
    const downloadFile = (data, fileName, fileType) => {
        const blob = new Blob([data], { type: fileType });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // 1. Export to JSON
    const handleExportJson = () => {
        const data = JSON.stringify(history, null, 2); // 'null, 2' makes it pretty-printed
        downloadFile(data, 'weather-history.json', 'application/json');
    };

    // 2. Export to CSV
    const handleExportCsv = () => {
        // CSVs can't handle nested data well, so we "flatten" it.
        // One row for each DAY of each search.
        let csvContent = "SearchQuery,ResolvedLocation,Note,Date,MaxTemp,MinTemp\n";

        history.forEach(record => {
            const { searchQuery, resolvedLocation, userNote, weatherData } = record;
            
            weatherData.forEach(day => {
                const row = [
                    `"${searchQuery}"`,
                    `"${resolvedLocation}"`,
                    `"${userNote || ''}"`,
                    day.date,
                    day.maxTemp,
                    day.minTemp
                ].join(',');
                csvContent += row + "\n";
            });
        });

        downloadFile(csvContent, 'weather-history.csv', 'text/csv');
    };


    // --- The UI (What you see) ---
    return (
        <div className="app-container">
            <h1>Advanced Weather App</h1>
            
            <form onSubmit={handleSubmit} className="location-input">
                <input type="text" placeholder="Enter City or Zip" value={location} onChange={e => setLocation(e.target.value)} required />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                <button type="submit">Search</button>
            </form>

            {error && (
                <div className="error-message">Error: {error}</div>
            )}

            {currentResult && (
                <div id="current-weather">
                    <h3>New Result</h3>
                    <p>Location: {currentResult.resolvedLocation}</p>
                    <WeatherList weatherData={currentResult.weatherData} />
                    <LocationMap lat={currentResult.latitude} lon={currentResult.longitude} />
                </div>
            )}

            {/* --- UPDATED: Added Header and Export Buttons --- */}
            <div className="history-header">
                <h2>Search History</h2>
                <div className="export-buttons">
                    <button onClick={handleExportJson} className="btn btn-export-json">Export JSON</button>
                    <button onClick={handleExportCsv} className="btn btn-export-csv">Export CSV</button>
                </div>
            </div>
            {/* --- END OF UPDATE --- */}
            
            <div id="forecast-weather">
                {history.length === 0 ? (
                    <p>No history yet.</p>
                ) : (
                    history.map(record => (
                        <div key={record._id} className="forecast-card">
                            <p className="day">{record.resolvedLocation}</p>
                            <WeatherList weatherData={record.weatherData} />
                            <LocationMap lat={record.latitude} lon={record.longitude} />
                            
                            {record.userNote && (
                                <p className="user-note">Note: {record.userNote}</p>
                            )}
                            
                            <div className="forecast-card-actions">
                                <button onClick={() => openUpdateModal(record)} className="btn btn-edit">Edit</button>
                                <button onClick={() => handleDelete(record._id)} className="btn btn-delete">Delete</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* The Update Modal UI */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit Note</h2>
                        <p>For: {currentRecord.resolvedLocation}</p>
                        <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows="4" />
                        <div className="modal-actions">
                            <button onClick={handleUpdateNote}>Save</button>
                            <button onClick={closeUpdateModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;