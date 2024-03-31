import React, { useRef, useState, useEffect } from "react";

const Api_key = "283f90719ecc2d0dd3cb316eb553a072";

const Home = () => {
  const inputRef = useRef(null);
  const [apiData, setApiData] = useState(null);
  const [showWeather, setShowWeather] = useState(null);
  const [unit, setUnit] = useState("metric");
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const WeatherTypes = [
    {
      type: "Clear",
      img: "https://cdn-icons-png.flaticon.com/512/6974/6974833.png",
    },
    {
      type: "Rain",
      img: "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
    },
    {
      type: "Snow",
      img: "https://cdn-icons-png.flaticon.com/512/642/642102.png",
    },
    {
      type: "Clouds",
      img: "https://cdn-icons-png.flaticon.com/512/414/414825.png",
    },
    {
      type: "Haze",
      img: "https://cdn-icons-png.flaticon.com/512/1197/1197102.png",
    },
    {
      type: "Smoke",
      img: "https://cdn-icons-png.flaticon.com/512/4380/4380458.png",
    },
    {
      type: "Mist",
      img: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
    },
    {
      type: "Drizzle",
      img: "https://cdn-icons-png.flaticon.com/512/3076/3076129.png",
    },
  ];

  useEffect(() => {
    // Fetch weather data for the user's current location when the component mounts
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (inputRef.current.value) {
      // If the user has provided a location, fetch weather data for that location
      const URL = `https://api.openweathermap.org/data/2.5/weather?q=${inputRef.current.value}&units=${unit}&appid=${Api_key}`;
      setLoading(true);
      fetch(URL)
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          if (data.cod === "404" || data.cod === "400") {
            setShowWeather([
              {
                type: "Location Not Found",
                img: "https://cdn-icons-png.flaticon.com/512/4275/4275497.png",
              },
            ]);
            setApiData(null);
          } else {
            setShowWeather(
              WeatherTypes.filter(
                (weather) => weather.type === data.weather[0].main
              )
            );
            setApiData(data);
            // Fetch 5-day forecast data after fetching main weather data
            fetchForecastData(data.coord.lat, data.coord.lon);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      // If the user has not provided a location, use geolocation to fetch weather data for their current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${Api_key}`;
          setLoading(true);
          fetch(URL)
            .then((res) => res.json())
            .then((data) => {
              setLoading(false);
              setShowWeather(
                WeatherTypes.filter(
                  (weather) => weather.type === data.weather[0].main
                )
              );
              setApiData(data);
              // Fetch 5-day forecast data after fetching main weather data
              fetchForecastData(latitude, longitude);
            })
            .catch((err) => {
              console.log(err);
              setLoading(false);
            });
        },
        (error) => {
          console.log(error);
          setLoading(false);
        }
      );
    }
  };

  const fetchForecastData = async (latitude, longitude) => {
    const URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${Api_key}`;
    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        if (data.cod === "200") {
          // Filter forecast data for next 5 days
          const filteredForecastData = data.list.filter(
            (item, index) => index % 8 === 0 && index < 40
          );
          // Convert temperature values to the selected unit
          const convertedForecastData = filteredForecastData.map((item) => ({
            ...item,
            main: {
              ...item.main,
              temp:
                unit === "metric"
                  ? item.main.temp
                  : (item.main.temp * 9) / 5 + 32,
            },
          }));
          setForecastData(convertedForecastData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    if (apiData) {
      let updatedTemp;
      if (newUnit === "imperial") {
        updatedTemp = (apiData.main.temp * 9) / 5 + 32;
      } else {
        updatedTemp = ((apiData.main.temp - 32) * 5) / 9;
      }
      setApiData({
        ...apiData,
        main: {
          ...apiData.main,
          temp: updatedTemp,
        },
      });
    }
    // Convert forecast data to the selected unit
    const convertedForecastData = forecastData.map((item) => ({
      ...item,
      main: {
        ...item.main,
        temp:
          newUnit === "metric" ? item.main.temp : (item.main.temp * 9) / 5 + 32,
      },
    }));
    setForecastData(convertedForecastData);
  };

  return (
    <div className="h-screen grid place-items-center">
      <div className="bg-white w-96 p-4 rounded-md">
        <div className="flex items-center justify-between">
          <input
            type="text"
            ref={inputRef}
            placeholder="Enter Your Location"
            className="text-xl border-b p-1 border-gray-200 font-semibold uppercase flex-1"
          />
          <button onClick={fetchWeather}>
            <img
              src="https://cdn-icons-png.flaticon.com/512/758/758651.png"
              alt="..."
              className="w-8"
            />
          </button>
        </div>
        <div
          className={`duration-300 delay-75  overflow-hidden ${
            showWeather ? "h-[30rem]" : "h-0"
          }`}
        >
          {loading ? (
            <div className="grid place-items-center h-full">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1477/1477009.png"
                alt="..."
                className="w-14 mx-auto mb-2 animate-spin"
              />
            </div>
          ) : (
            showWeather && (
              <div className="text-center flex flex-col gap-6 mt-10">
                {apiData && (
                  <p className="text-xl font-semibold">
                    {apiData?.name + "," + apiData?.sys?.country}
                  </p>
                )}
                <img
                  src={showWeather[0]?.img}
                  alt="..."
                  className="w-52 mx-auto"
                />
                <h3 className="text-2xl font-bold text-zinc-800">
                  {showWeather[0]?.type}
                </h3>

                {apiData && (
                  <div className="flex flex-col items-center">
                    <div className="flex justify-center items-center">
                      <h2 className="text-4xl font-extrabold">
                        {unit === "metric"
                          ? apiData?.main?.temp.toFixed(2) + "°C"
                          : apiData?.main?.temp.toFixed(2) + "°F"}
                      </h2>
                      <button
                        onClick={toggleUnit}
                        className="text-blue-500 font-semibold ml-4"
                      >
                        Toggle Unit
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-800 mt-4">
                      Humidity: {apiData?.main?.humidity}%
                    </h3>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">5-Day Forecast</h2>
          <div className="grid grid-cols-1 gap-4">
            {forecastData.map((item, index) => (
              <div key={index} className="text-center">
                <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
                <img
                  src={
                    WeatherTypes.find(
                      (weather) => weather.type === item.weather[0].main
                    )?.img
                  }
                  alt="..."
                  className="w-12 mx-auto"
                />
                <p>
                  Temperature: {item.main.temp.toFixed(2)}&deg;
                  {unit === "metric" ? "C" : "F"}
                </p>
                <p>Humidity: {item.main.humidity}%</p>
                <p>Weather Type: {item.weather[0].main}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
