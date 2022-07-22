const display = document.getElementById('display');

async function getCities() {
    let url = `/api/v1/cities`;
    let response = await fetch(url);
    let cities = await response.json();
    return cities;
}

getCities().then(cities => {
    autocomplete(document.getElementById("city-input"), cities);
    display.style.display = "block";
})
.catch(error => console.log(error));

