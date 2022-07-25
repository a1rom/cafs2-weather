const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const diacritics = require('diacritic');
const updateCitiesJson = require('./services/updateCitiesJson');

const https = require('node:https');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.route('/').
    get((req, res) => {
        res.render('index');
    })
    .post((req, res) => {
        console.log(req.body.city);
        // let bla = checkIfCityValid(req.body.city);
        // console.log('bla kuku', bla);
        // if (!bla.includes(req.body.city)) {
        //     req.body.city = "Vilnius";
        // }
        getWeather(req.body.city, (weather) => {
            if (weather.error) {
                res.render('index', { error: weather.error });
            } else {
                weather = formatWeatherData(weather);
                res.render('result', { weatherNow: weather.now });
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

function getWeather(city, callback) {    
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
    let nowDateHour = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds())).toISOString().substring(0,13).replace('T', ' ') + ':00:00';
    weather.cityName = data.place.name;
    weather.location = {
        "lat": data.place.coordinates.latitude, 
        "long": data.place.coordinates.longitude};
    weather.forecasts = data.forecastTimestamps;
    weather.now = weather.forecasts.find(forecast => forecast.forecastTimeUtc == nowDateHour);
    weather.now.airTemperature = Math.round(weather.now.airTemperature);
    weather.now.date = weather.now.forecastTimeUtc.substring(0,10);
    weather.now.time = weather.now.forecastTimeUtc.substring(11,16);
    weather.now.cityName = data.place.name;
    weather.now.windDirectionLetter = getWindDirectionLetter(weather.now.windDirection);
    return weather;
}

function getWindDirectionLetter(direction) {
    let directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    let directionIndex = Math.round(direction / 22.5);
    return directions[directionIndex];
}

// function checkIfCityValid(input) {
//     let file = fs.readFile('./resources/cities.json', { encoding: 'utf8'});
//     let cities = JSON.parse(file).cities;
//     let validCities = [];
//     cities.forEach(city => {
//         if (city.name.toLowerCase().includes(input.toLowerCase())) {
//             validCities.push(city.name);
//         }
//     }
//     );
//     return validCities;
// }

    // cities = JSON.parse(file);
    // console.log('my input in f', input)
    // if (cities.cities.includes(input)) {
    //     console.log('city found i have returened true');
    //     return true;
    // }


