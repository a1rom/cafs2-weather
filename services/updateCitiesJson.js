const axios = require('axios');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');

module.exports = async function updateCitiesJson(todayDate) {
    axios.get('https://api.meteo.lt/v1/places')
        .then(response => {
            let cities = response.data.map(city => city.name);
            fsPromises.writeFile('./resources/cities.json', JSON.stringify({ date: todayDate, cities: cities }));
        })
        .catch(error => console.log(error));
}