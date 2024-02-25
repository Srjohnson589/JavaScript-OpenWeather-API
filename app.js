// Open Weather API credentials

// Helper get current time function for current weather
const get_time = () => {
    let dateObj = new Date();
    hours = dateObj.getHours();
    minutes = dateObj.getMinutes();
    let am_pm;
    if (hours < 12) {
        am_pm = "a.m.";
    } else {
        hours -= 12;
        am_pm = "p.m.";
    }
    formattedTime = hours.toString()
        + ":" + minutes.toString().padStart(2, '0')
        + " " + am_pm;

    return formattedTime;
}

// Helper to get the forecast at noon for next 5 days (gives every 3 hrs)
const find_noons = (lst) => {
    const re = /12:00:00/;
    const noons = [];
    for (index in lst) {
        let date = lst[index].dt_txt;
        if (re.test(date)) {
            let forecast = {
                day: format_date(date),
                temp: Math.round(lst[index].main.temp),
                main: lst[index].weather[0].main,
                icon: lst[index].weather[0].icon
            }
            noons.push(forecast);
        }
    } return noons;
}

// Helper to format forecast date into Day of week]
const format_date = (date) => {
    let d = new Date(date);
    const weekday = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'];
    let day = weekday[d.getDay()];
    return day
}

// **********5 DAY FORECAST***************
const getForecast = async (query) => {
    if (Number(query)) {
        q = `zip=${query}`
    } else {
        q = `q=${query}`
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${q},us&appid=${appid}&units=imperial`);
    const data = await response.json();
    const dict_list = data.list;
    const forecast = find_noons(dict_list);
    return forecast;
};

console.log(getForecast('46617'))

// ***********CURRENT WEATHER***************
const getWeather = async (query) => {
    if (Number(query)) {
        q = `zip=${query}`
    } else {
        q = `q=${query}`
    }
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${q},us&appid=${appid}&units=imperial`);
    const data = await response.json();
    const weather_data = {
        city_name: data.name,
        dt: get_time(),
        temp: Math.round(data.main.temp),
        forecast: data.weather[0].description,
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed),
        icon: data.weather[0].icon
    };
    return weather_data
};


const form = document.querySelector('form');
const current_card = document.querySelector('.current_card');
const forecast_card = document.querySelector('.forecast_card');

const current_card_background = (iconid) => {
    let clear = ['01d', '01n', '02d', '02n'];
    let overcast = ['03d', '03n', '04d', '04n'];
    let rain = ['09d', '09n', '10d', '10n', '11d', '11n', '50d', '50n'];
    let snow = ['13d', '13n'];
    for (item of clear) {
        if (iconid === item){
            return 'clear';
        }
    };
    for (item of overcast) {
        if (iconid === item){
            return 'overcast';
        }
    };
    for (item of rain) {
        if (iconid === item){
            return 'rain';
        }
    };
    for (item of snow) {
        if (iconid === item){
            return 'snow'
        }
    };
    return 'clear';
    };

form.addEventListener('submit', async(event) => {
    event.preventDefault();
    const query = form[0].value.toLowerCase();
    const weather_data = await getWeather(query);
    current_card.innerHTML = `
        <p class="city">${weather_data.city_name} <span>as of ${weather_data.dt}</span></p>
        <div class="temp-img-div">
            <div class="temp-img-div">
                <p class="current_temp">${weather_data.temp}&#176;</p>
                <img class="weather-icon" src="https://openweathermap.org/img/w/${weather_data.icon}.png" alt="${weather_data.forecast}">
            </div>
            <div class="cc_right">
                <p class="description">${weather_data.forecast}</p>
                <p class="feelslike">Feels like: <br> <span>${weather_data.feels_like}&#176;</span></p>
            </div>
        </div>
        <div class="cardfooter">
            <p>Humidity: ${weather_data.humidity}%</p>
            <p>Wind speed: ${weather_data.wind_speed}mph</p>
        </div>
    `;
    let background = current_card_background(weather_data.icon);
    current_card.className = `current_card ${background}`;

    const forecast_data = await getForecast(query);
    forecast_card.innerHTML = ``;
    for (i=0; i<5; i++) {
        let day_card = document.createElement('div');
        day_card.innerHTML = `
            <p class="day">${forecast_data[i].day}</p>
            <img class="weather-icon" src="https://openweathermap.org/img/w/${forecast_data[i].icon}.png" alt="${forecast_data[i].forecast}">
            <p class="forecast_temp">${forecast_data[i].temp}&#176;</p>
            <p class="forecast_desc">${forecast_data[i].main}</p>
        `;
        forecast_card.append(day_card);
        day_card.className += ' day_card';
    };
});
