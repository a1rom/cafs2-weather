module.exports = function formatWeatherData(data) {
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