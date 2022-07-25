const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const updateCitiesJson = require('./services/updateCitiesJson');
const getWeather = require('./services/getWeather');
const formatWeatherData = require('./services/formatWeatherData');

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
        await updateCitiesJson(todayDate);
    } 
    res.send(JSON.parse(cities).cities);   
});
  
app.listen(3000, function () {
    console.log('Server is up on port 3000!')
});