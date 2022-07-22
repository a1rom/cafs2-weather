const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/', function (req, res) {
    console.log(req.body.city);
    getWeather(req.body.city, function (weather) {
        res.render('index', { weather: weather });
    });
    // res.render('index');
});
  
app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

getWeather = function (city, callback) {
    const url = `https://api.meteo.lt/v1/places/${city}`;
    console.log(url);
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        })
        .on('end', () => {
            const weather = JSON.parse(data);
            console.log(weather);
            callback(weather);
        })
        .on('error', (error) => {
            console.log(error);
        });
    });
}