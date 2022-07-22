const express = require('express');
// import express from 'express';
const bodyParser = require('body-parser');
// import bodyParser from 'body-parser';
const https = require('node:https');
// import https from 'https';
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const diacritics = require('diacritic');

const updateCitiesJson = require('./services/updateCitiesJson');


const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.route('/').
    get((req, res) => {
        res.render('index');
    })
    .post((req, res) => {
        console.log(req.body.city);
        getWeather(req.body.city, function (weather) {
            if (weather.error) {
                res.render('index', { error: weather.error });
            } else {
                weather = formatWeatherData(weather);
                // console.log(weather)
                res.render('index', { weather: weather });
            }
        });
    });

app.get('/api/v1/cities', async function (req, res) { 
    let cities = await fsPromises.readFile('./resources/cities.json', { encoding: 'utf8'});
    let todayDate = new Date().toISOString().substring(0,10);
    if (JSON.parse(cities).date != todayDate || JSON.parse(cities).cities.length == 0) {
        // console.log('need to update the cities');
        await updateCitiesJson(todayDate);
    } 
    res.send(JSON.parse(cities).cities);   
});
  
app.listen(3000, function () {
    console.log('Server is up on port 3000!')
});

let getWeather = function (city, callback) {    
    city = diacritics.clean(city);
    const url = `https://api.meteo.lt/v1/places/${city.toLowerCase()}/forecasts/long-term`;
    console.log(url);
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        })
        .on('end', () => {
            const weather = JSON.parse(data);
            callback(weather);
        })
        .on('error', (error) => {
            console.log(error);
        });
    });
};

function formatWeatherData(data) {
    let weather = {};
    weather.cityName = data.place.name;
    weather.location = {
        "lat": data.place.coordinates.latitude, 
        "long": data.place.coordinates.longitude};
    weather.forecasts = data.forecastTimestamps;
    return weather;
}

