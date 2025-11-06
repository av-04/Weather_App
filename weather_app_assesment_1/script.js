const API_KEY = 'ba9bc44f6cfc9bcda80b06be27a68a52'; // <-- Remember to put your key here


const locationInput = document.getElementById('location-search');
const searchButton = document.getElementById('search-btn');
const locationButton = document.getElementById('location-btn');

const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast-weather');

// NEW: Get references for the modal elements
const infoButton = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const closeModal = document.querySelector('.close-btn');


// --- Step 3: Add event listeners to the buttons ---
searchButton.addEventListener('click', () => {
    const location = locationInput.value;
    if (location) {
        getWeatherByLocation(location);
    }
});

locationButton.addEventListener('click', () => {
    // This uses the browser's built-in geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        }, () => {
            alert('Unable to retrieve your location.');
        });
    } else {
        alert("Your browser does not support geolocation.");
    }
});


// --- Step 4: Function to fetch and display weather by location name/zip ---
function getWeatherByLocation(location) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`;

    // Fetch current weather
    fetch(currentUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            currentWeatherDiv.innerHTML = `<p>Could not fetch weather. Check the location and try again.</p>`;
        });

    // Fetch 5-day forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            forecastDiv.innerHTML = `<p>Could not fetch forecast.</p>`;
        });
}

// --- Step 5: Function to fetch and display weather by coordinates ---
function getWeatherByCoords(lat, lon) {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    // Fetch current weather
    fetch(currentUrl)
        .then(response => response.json())
        .then(data => {
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            currentWeatherDiv.innerHTML = `<p>Could not fetch weather for your location.</p>`;
        });

    // Fetch 5-day forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
            forecastDiv.innerHTML = `<p>Could not fetch forecast.</p>`;
        });
}


// --- Step 6: Function to display the CURRENT weather data ---
function displayCurrentWeather(data) {
    // Check if the API returned an error (e.g., location not found)
    if (data.cod !== 200) {
        currentWeatherDiv.innerHTML = `<p>${data.message}</p>`;
        return;
    }

    const { name } = data;
    const { main, description, icon } = data.weather[0];
    const { temp, humidity, temp_min, temp_max } = data.main;
    const { speed } = data.wind;

    // This creates the HTML to show the weather
    currentWeatherDiv.innerHTML = `
        <p class="location">${name}</p>
        <p class="temp">${Math.round(temp)}°C</p>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        <p class="description">${description}</p>
        <p>High: ${Math.round(temp_max)}°C / Low: ${Math.round(temp_min)}°C</p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind Speed: ${speed} m/s</p>
    `;
}

// --- Step 7: Function to display the 5-DAY forecast ---
function displayForecast(data) {
    // Clear old forecast
    forecastDiv.innerHTML = "";
    
    // The API gives data every 3 hours. We want one per day.
    // We'll get the forecast for 12:00 PM each day.
    const dailyForecasts = data.list.filter(item => {
        return item.dt_txt.includes("12:00:00");
    });

    dailyForecasts.forEach(day => {
        const { dt_txt } = day;
        const { icon, description } = day.weather[0];
        const { temp_max, temp_min } = day.main;

        // Get the day of the week
        const dayName = new Date(dt_txt).toLocaleDateString('en-US', { weekday: 'short' });

        // Create a card for the forecast day
        const card = document.createElement('div');
        card.classList.add('forecast-card');
        card.innerHTML = `
            <p class="day">${dayName}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <p class="temp-high">${Math.round(temp_max)}°C</p>
            <p class="temp-low">${Math.round(temp_min)}°C</p>
        `;
        forecastDiv.appendChild(card);
    });
}

// --- NEW JAVASCRIPT FOR THE MODAL ---

// When the user clicks the info button, show the modal
infoButton.onclick = function() {
    infoModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeModal.onclick = function() {
    infoModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal content, close it
window.onclick = function(event) {
    if (event.target == infoModal) {
        infoModal.style.display = "none";
    }
}