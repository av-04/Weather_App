# PM Accelerator - Tech Assessment 1 & 2

This is a full-stack MERN application (MongoDB, Express, React, Node.js) built for the PM Accelerator technical assessment. It allows users to search for weather by location and date range and saves their search history.

## Features

* **Full CRUD:** Users can **Create** new searches, **Read** their history, **Update** searches with notes, and **Delete** them.
* **Real-Time Data:** Uses the OpenWeatherMap Geocoding API to validate locations and the Open-Meteo API to fetch historical and forecast weather.
* **Data Persistence:** All search data is saved to a MongoDB Atlas cloud database.
* **Optional Features Implemented:**
    * **API Integration:** An interactive Google Map is displayed for each location.
    * **Data Export:** Users can export their entire search history as a `.json` or `.csv` file.

## Tech Stack

* **Frontend:** React
* **Backend:** Node.js, Express
* **Database:** MongoDB (with Mongoose)
* **APIs:** OpenWeatherMap (Geocoding), Open-Meteo (Weather Data)

---

## How to Run This Project

### Prerequisites

* [Node.js](https://nodejs.org/en/) installed
* A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
* A free [OpenWeatherMap](https://openweathermap.org/api) API key

### 1. Backend Setup (`/server`)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YourUsername/pma-weather-app.git](https://github.com/YourUsername/pma-weather-app.git)
    cd pma-weather-app/server
    ```

2.  **Install requirements:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    * Create a file named `.env` in the `/server` folder.
    * Copy the contents of `.env.example` into your new `.env` file.
    * Fill in the `MONGO_URI` and `OWM_API_KEY` with your personal keys.

4.  **Run the server:**
    ```bash
    node server.js
    ```
    *The server will be running on `http://localhost:5000` (or your chosen port).*

### 2. Frontend Setup (`/client`)

1.  **Open a new terminal** and navigate to the `/client` folder:
    ```bash
    cd ../client
    ```

2.  **Install requirements:**
    ```bash
    npm install
    ```

3.  **Run the client:**
    ```bash
    npm start
    ```
    *The React app will open in your browser (likely at `http://localhost:3000`).*

### 3. Requirements File

This is a Node.js project. The "requirements" are managed by `package.json` in both the `/client` and `/server` folders. Running `npm install` in each directory (as shown above) will install all necessary libraries and packages.
