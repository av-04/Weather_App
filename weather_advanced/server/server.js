require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios'); 
const WeatherRequest = require('./models/WeatherRequest');

const app = express();
const PORT = 5000;

const OWM_API_KEY = process.env.OWM_API_KEY;

//Middleware
app.use(cors({ origin: 'http://10.6.61.52:3000' }));
app.use(express.json());

//Database 
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));


//READ (GET) Route
app.get('/api/weather', async (req, res) => {
    try {
        const history = await WeatherRequest.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

app.post('/api/weather', async (req, res) => {
    console.log('Received POST request at /api/weather');
    
    try {
        const { location, startDate, endDate } = req.body;

        // VALIDATE LOCATION (Geocoding)
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${OWM_API_KEY}`;
        const geoResponse = await axios.get(geoUrl);

        if (geoResponse.data.length === 0) {
            // No location found
            return res.status(404).json({ message: `Could not find location: ${location}` });
        }

        const { lat, lon, name, country, state } = geoResponse.data[0];
        const resolvedLocation = `${name}, ${state || ''} ${country}`;

    
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min`;
        const weatherResponse = await axios.get(weatherUrl);

        if (!weatherResponse.data || !weatherResponse.data.daily) {
             return res.status(500).json({ message: "Error fetching weather data." });
        }

        //FORMAT THE WEATHER DATA
        const { time, temperature_2m_max, temperature_2m_min } = weatherResponse.data.daily;
        const formattedWeatherData = time.map((date, index) => {
            return {
                date: date,
                maxTemp: Math.round(temperature_2m_max[index]),
                minTemp: Math.round(temperature_2m_min[index])
            };
        });

        //SAVE TO DATABASE
        const newRecord = new WeatherRequest({
            searchQuery: location,
            resolvedLocation: resolvedLocation, 
            latitude: lat,                     
            longitude: lon,                   
            startDate: startDate,
            endDate: endDate,
            weatherData: formattedWeatherData, 
            userNote: ''
        });

        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);

    } catch (error) {
        console.error('Error in CREATE route:', error.message);
        res.status(500).json({ message: 'Error creating record' });
    }
});

//DELETE Route
app.delete('/api/weather/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await WeatherRequest.findByIdAndDelete(id);
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting record' });
    }
});

//UPDATE Route
app.put('/api/weather/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userNote } = req.body;
        const updatedRecord = await WeatherRequest.findByIdAndUpdate(
            id,
            { userNote: userNote },
            { new: true }
        );
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error updating record' });
    }
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});