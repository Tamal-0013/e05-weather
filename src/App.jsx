import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [currentPage, setCurrentPage] = useState('home')

  useEffect(() => {
    const savedFavorites = localStorage.getItem('weatherFavorite')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('weatherFavorite', JSON.stringify(favorites))
  }, [favorites])

  //add function
  const searchWeather = async() => {
    if(!city) {
      alert("Please enter a city name")
      return
    }

    try {
      const API_KEY = import.meta.env.VITE_WEATHER_API_KEY
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      )

      if (response.status === 404) {
        throw new Error(`City "${city}" not found. Please check the spelling!`)
      }
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.')
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data. Please try again.')
      }

      const data = await response.json()

      //real weather data from API
      const realWeather = {
        city: data.name,
        date: new Date().toLocaleString(),
        temperature: `${data.main.temp} °C`,
        feelsLike: `${data.main.feels_like} °C`,
        wind: `${data.wind.speed} m/s`,
        windGust: `${data.wind.gust || 0} m/s`,
        visibility: `${(data.visibility / 1000).toFixed(1)} km`,
        humidity: `${data.main.humidity} %`,
        pressure: `${data.main.pressure} hPa`,
        precipitation: `${data.rain ? data.rain['1h'] || 0 : 0} mm/h`
      }

      setWeather(realWeather)
      setCurrentPage('home') // Switch to home page after search
    } catch (error) {
      alert('Error: '+ error.message)
    }
  }

  // Add to favorites function
  const addToFavorites = () => {
    if (weather) {
      const isAlreadyFavorite = favorites.some(fav => fav.city === weather.city)

      if (isAlreadyFavorite) {
        alert(`${weather.city} is already in your favorite list!`)
      } else {
        setFavorites([...favorites, weather]);
        alert(`${weather.city} added to favorites!`);
      }
    }
  }

  // Load favorite weather data
  const loadFavorite = (favWeather) => {
    setWeather(favWeather);
    setCity(favWeather.city);
    setCurrentPage('home') // Switch to home page when loading favorite
  }

  const removeFromFavorites = (cityToRemove) => {
    setFavorites(favorites.filter(fav => fav.city !== cityToRemove))
  }

  return (
    <div className="App">
      <header className="header">
        <h1>Weather App</h1>
        <nav>
          <button 
            onClick={() => setCurrentPage('home')}
            className={currentPage === 'home' ? 'active' : ''}
          >HOME</button>
          <button 
            onClick={() => setCurrentPage('favorites')}
            className={currentPage === 'favorites' ? 'active' : ''}
          >FAVOURITES</button>
        </nav>
      </header>

      {/* Show different content based on current page */}
      {currentPage === 'home' && (
        <>
          <div className='search-section'>
            <h2>Search for a weather forecast</h2>
            <div className='search-box'>
              <input 
                type="text"
                placeholder='Which city you are looking for?'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchWeather()} />
              
              <button onClick={searchWeather}>Get Forecast</button>
            </div>
          </div>
          
          {/* Weather Display - Only show last search on home page */}
          {weather && (
            <div className="weather-card">
              <h3>{weather.city}</h3>
              <p className="date">{weather.date}</p>
              <p className="observation">Observation</p>
              
              <div className="weather-grid">
                <div className="weather-item">
                  <strong>Temperature</strong>
                  <div>{weather.temperature}</div>
                </div>
                <div className="weather-item">
                  <strong>Feels like</strong>
                  <div>{weather.feelsLike}</div>
                </div>
                
                <div className="weather-item">
                  <strong>Wind</strong>
                  <div>{weather.wind}</div>
                </div>
                <div className="weather-item">
                  <strong>Wind gust</strong>
                  <div>{weather.windGust}</div>
                </div>
                
                <div className="weather-item">
                  <strong>Visibility</strong>
                  <div>{weather.visibility}</div>
                </div>
                <div className="weather-item">
                  <strong>Humidity</strong>
                  <div>{weather.humidity}</div>
                </div>
                
                <div className="weather-item">
                  <strong>Pressure</strong>
                  <div>{weather.pressure}</div>
                </div>
                <div className="weather-item">
                  <strong>Precipitation</strong>
                  <div>{weather.precipitation}</div>
                </div>
              </div>
              
              <button onClick={addToFavorites} className="add-btn">
                Add to Favorites
              </button>
            </div>
          )}
        </>
      )}

      {currentPage === 'favorites' && (
        <div className="favorites-page">
          <h2>Your Favorite Cities</h2>
          {favorites.length === 0 ? (
            <p className="no-favorites">No favorite cities yet! Search for a city and click "Add to Favorites".</p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((fav, index) => (
                <div key={index} className="favorite-weather-card">
                  <h3>{fav.city}</h3>
                  <div className="weather-info">
                    <p><strong>Temperature:</strong> {fav.temperature}</p>
                    <p><strong>Feels like:</strong> {fav.feelsLike}</p>
                    <p><strong>Humidity:</strong> {fav.humidity}</p>
                    <p><strong>Wind:</strong> {fav.wind}</p>
                  </div>
                  <div className="card-buttons">
                    <button 
                      onClick={() => loadFavorite(fav)}
                      className="load-btn"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => removeFromFavorites(fav.city)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <footer className="footer">
        <p>Weather App ©2025 Created by a NOOB.</p>
      </footer>
    </div>
  )
}

export default App