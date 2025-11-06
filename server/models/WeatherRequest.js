const mongoose = require('mongoose');

// This is the "blueprint" for the data we will save
const WeatherRequestSchema = new mongoose.Schema({
    searchQuery: { type: String, required: true }, // "Paris" or "90210"
    resolvedLocation: { type: String, required: true }, // "Paris, Île-de-France, France"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },

    // This will be an array of objects
    weatherData: [ 
        {
            date: String,
            maxTemp: Number,
            minTemp: Number,
        }
    ],

    // This is for the UPDATE requirement
    userNote: { type: String, default: '' }, 

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WeatherRequest', WeatherRequestSchema);