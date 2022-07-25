const diacritics = require('diacritic');
const https = require('node:https');

module.exports = function getWeather(city, callback) {    
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