// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Configure Express
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Google Maps API key (replace with your own)
const GOOGLE_MAPS_API_KEY = 'AIzaSyAV9WZZSco82LmSOTD4CAgXFSahKfctzcg';

// Route: Home page
app.get('/', (req, res) => {
    res.render('index');
});

// Route: Search for restaurants
app.post('/search', async (req, res) => {
    const city = req.body.city;
    const criterion = req.body.criterion;

    try {
        // Geocoding API to get city coordinates
        const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
            params: {
                address: city,
                key: GOOGLE_MAPS_API_KEY,
            },
        }); 

        // Check if results exist
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            console.error('City not found!');
            return res.status(404).send('City not found. Please try a different city.');
        }

        const location = geoResponse.data.results[0].geometry.location;

        // Places API to find restaurants based on criteria
        const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json`, {
            params: {
                location: `${location.lat},${location.lng}`,
                radius: 5000, // Radius in meters
                type: 'restaurant',
                keyword: criterion,
                key: GOOGLE_MAPS_API_KEY,
            },
        });

        const restaurants = placesResponse.data.results;
        if (!restaurants || restaurants.length === 0) {
            return res.status(404).send(`No restaurants found for "${criterion}" in ${city}.`);
        }

        res.render('results', { city, criterion, restaurants });
    } catch (error) {
        console.error('Error fetching data from Google API:', error.response?.data || error.message);
        res.status(500).send('An error occurred while processing your request.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
