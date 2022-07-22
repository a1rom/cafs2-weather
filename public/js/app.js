// get cities from api
async function getCities() {
    let url = `/api/v1/cities`;
    let response = await fetch(url);
    let cities = await response.json();
    return cities;
}

getCities().then(cities => {
    autocomplete(document.getElementById("city-input"), cities);
})
.catch(error => console.log(error));