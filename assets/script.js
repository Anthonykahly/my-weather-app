var apiKey = "d1e2d0763204896fd894698f5c6e27ee"; //API links to the openweathermap for weather information
var currentDay = moment().format('L');
var searchHistoryLi = [];

// Function to call current city conditions
function currentWeather(city) {

    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (cityWeatherResponse) {

        $("#weatherContent").css("display", "block");
        $("#cityDetail").empty();

        var iconCode = cityWeatherResponse.weather[0].icon;
        var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

        var currentLocation = $(`
            <h2 id="currentLocation">
                ${cityWeatherResponse.name} ${currentDay} <img src="${iconURL}" alt="${cityWeatherResponse.weather[0].description}" />
            </h2>
            <p>Temperature: ${cityWeatherResponse.main.temp} °F</p>
            <p>Humidity: ${cityWeatherResponse.main.humidity}\%</p>
            <p>Wind Speed: ${cityWeatherResponse.wind.speed} MPH</p>
        `);

        $("#cityDetail").append(currentLocation);

        // Tracks and shows the UV index
        var lat = cityWeatherResponse.coord.lat;
        var lon = cityWeatherResponse.coord.lon;
        var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: uviQueryURL,
            method: "GET"
        }).then(function (uviResponse) {

            var uvIndex = uviResponse.value;
            var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);

            $("#cityDetail").append(uvIndexP);

            futureCondition(lat, lon);

            // Color codes the UV
            if (uvIndex >= 0 && uvIndex <= 2) {
                $("#uvIndexColor").css("background-color", "#008000").css("color", "white");
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $("#uvIndexColor").css("background-color", "#FFFF00");
            } else if (uvIndex >= 6 && uvIndex <= 7) {
                $("#uvIndexColor").css("background-color", "#ff8c00");
            } else if (uvIndex >= 8 && uvIndex <= 10) {
                $("#uvIndexColor").css("background-color", "#dc143c").css("color", "white");
            } else {
                $("#uvIndexColor").css("background-color", "#ba55d3").css("color", "white");
            };
        });
    });
}

// Function that calls for future city weather conditions
function futureCondition(lat, lon) {

    // 5 day weather forecast
    var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

    $.ajax({
        url: futureURL,
        method: "GET"
    }).then(function (futureResponse) {

        $("#fiveDay").empty();

        for (let i = 1; i < 6; i++) {
            var cityInfo = {
                date: futureResponse.daily[i].dt,
                icon: futureResponse.daily[i].weather[0].icon,
                temp: futureResponse.daily[i].temp.day,
                humidity: futureResponse.daily[i].humidity
            };

            var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
            var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${futureResponse.daily[i].weather[0].main}" />`;

            var futureCard = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currentDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

            $("#fiveDay").append(futureCard);
        }
    });
}

// Search button functionality 
$("#searchBtn").on("click", function (event) {
    event.preventDefault();

    var city = $("#enterCity").val().trim();
    currentWeather(city);
    if (!searchHistoryLi.includes(city)) {
        searchHistoryLi.push(city);
        var searchedCity = $(`
            <li class="li-group-item">${city}</li>
            `);
        $("#searchHistory").append(searchedCity);
    };

    localStorage.setItem("city", JSON.stringify(searchHistoryLi));

});

// When clicked user is presented with current and future conditions for the selected city
$(document).on("click", ".li-group-item", function () {
    var cityList = $(this).text();
    currentWeather(cityList);
});

// Last searched city forecast storage
$(document).ready(function () {
    var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

    if (searchHistoryArr !== null) {
        var lastSearchedIndex = searchHistoryArr.length - 1;
        var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
        currentWeather(lastSearchedCity);

    }
});