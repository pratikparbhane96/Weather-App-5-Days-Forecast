import React, { useState } from 'react';
import { Search, MapPin, Thermometer, Wind, Droplets, Calendar } from 'lucide-react';

const API_KEY = 'a590330ffd4a60b9d4583f2bc7f59023';

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

interface ForecastData {
  list: Array<{
    dt_txt: string;
    main: {
      temp: number;
    };
    weather: Array<{
      icon: string;
      description: string;
    }>;
  }>;
}

function App() {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    try {
      setError('');
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY}&units=metric`
      );
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}&units=metric`
      );

      if (!weatherResponse.ok || !forecastResponse.ok) {
        throw new Error('Location not found');
      }

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError('Could not find weather data for this location');
      setWeather(null);
      setForecast(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather();
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getFilteredForecast = () => {
    if (!forecast) return [];
    const dailyForecasts = forecast.list.reduce((acc: any[], curr) => {
      const date = curr.dt_txt.split(' ')[0];
      if (!acc.find(item => item.dt_txt.split(' ')[0] === date)) {
        acc.push(curr);
      }
      return acc;
    }, []);
    return dailyForecasts.slice(1, 6); // Next 5 days
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">Weather Forecast</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city name..."
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin className="absolute right-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {weather && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">{weather.name}</h2>
                <div className="flex items-center justify-center md:justify-start mt-4">
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt={weather.weather[0].description}
                    className="w-20 h-20"
                  />
                  <div className="text-5xl font-bold text-gray-800">
                    {Math.round(weather.main.temp)}°C
                  </div>
                </div>
                <p className="text-xl text-gray-600 capitalize mt-2">
                  {weather.weather[0].description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Thermometer size={20} />
                    <span>Feels Like</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {Math.round(weather.main.feels_like)}°C
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Wind size={20} />
                    <span>Wind Speed</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {weather.wind.speed} m/s
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Droplets size={20} />
                    <span>Humidity</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">
                    {weather.main.humidity}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {forecast && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              5-Day Forecast
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {getFilteredForecast().map((day, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="font-bold text-gray-600">{getDayName(day.dt_txt)}</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                    className="w-16 h-16 mx-auto"
                  />
                  <p className="text-xl font-bold text-gray-800">{Math.round(day.main.temp)}°C</p>
                  <p className="text-sm text-gray-600 capitalize">{day.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;