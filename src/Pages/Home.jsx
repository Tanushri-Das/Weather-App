import React, { useRef, useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useTransition, animated } from "react-spring";

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

  // Animation transitions for weather data
  const weatherTransition = useTransition(showWeather, {
    from: { opacity: 0, transform: "translateY(-20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-20px)" },
    config: { duration: 500 },
  });

  // Animation transitions for forecast data
  const forecastTransitions = useTransition(forecastData, {
    from: { opacity: 0, transform: "translateY(-20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-20px)" },
    config: { duration: 500 },
  });

  useEffect(() => {
    const cachedData = localStorage.getItem("weatherData");
    if (cachedData) {
      const { apiData, forecastData, showWeather, timestamp } =
        JSON.parse(cachedData);
      const now = new Date().getTime();
      // If the cached data is not expired (less than 1 hour old)
      if (now - timestamp < 3600000) {
        setApiData(apiData);
        setForecastData(forecastData);
        setShowWeather(showWeather);
        return;
      }
    }
    // If no cached data or expired, fetch new weather data
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
            // Clear forecast data
            setForecastData([]);
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
          newUnit === "metric"
            ? ((item.main.temp - 32) * 5) / 9
            : item.main.temp * 1.8 + 32,
      },
    }));
    setForecastData(convertedForecastData);
  };

  useEffect(() => {
    // Update localStorage when apiData or forecastData changes
    if (apiData && forecastData && showWeather) {
      localStorage.setItem(
        "weatherData",
        JSON.stringify({
          apiData,
          forecastData,
          showWeather,
          timestamp: new Date().getTime(),
        })
      );
    }
  }, [apiData, forecastData, showWeather]);

  return (
    <div className="h-full grid place-items-center bg-[#3944bc] w-full sm:w-11/12 2xl:w-2/4 mx-auto md:my-8">
      <div className="w-10/12 py-10 rounded-md">
        <div className="flex items-center justify-between">
          <input
            type="text"
            ref={inputRef}
            placeholder="Enter Your Location"
            className="text-[16px] border-b py-3 ps-4 normal-case border-gray-200 font-semibold flex-1 rounded-full"
          />
          <button
            className="ml-2 focus:outline-none bg-white w-12 h-12 flex justify-center items-center rounded-full"
            onClick={() => {
              fetchWeather();
              inputRef.current.value = "";
            }}
          >
            <FaSearch className="text-[16px]" />
          </button>
        </div>
        <div className="duration-300 delay-75 overflow-hidden">
          {loading ? (
            <div className="grid place-items-center h-full mt-6">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1477/1477009.png"
                alt="..."
                className="w-14 mx-auto mb-2 animate-spin"
              />
            </div>
          ) : (
            weatherTransition(
              (style, item) =>
                item && (
                  <animated.div
                    style={style}
                    className="text-center flex flex-col gap-6 mt-8"
                  >
                    {apiData && (
                      <h3 className="text-3xl text-white font-extrabold">
                        {apiData?.name + " , " + apiData?.sys?.country}
                      </h3>
                    )}
                    <img
                      src={showWeather[0]?.img}
                      alt="..."
                      className="w-20 mx-auto -mt-2 -mb-4"
                    />
                    <h3 className="text-2xl font-bold text-white">
                      {showWeather[0]?.type}
                    </h3>

                    {apiData && (
                      <div className="flex flex-col items-center">
                        <h2 className="text-2xl font-extrabold text-white mb-4">
                          {unit === "metric"
                            ? apiData?.main?.temp.toFixed(2) + "°C"
                            : apiData?.main?.temp.toFixed(2) + "°F"}
                        </h2>
                        <button
                          onClick={toggleUnit}
                          className="text-white text-lg border-2 border-white px-6 py-3 rounded-full font-semibold "
                        >
                          Toggle Unit
                        </button>
                        <h3 className="text-xl font-bold text-white mt-4">
                          Humidity: {apiData?.main?.humidity}%
                        </h3>
                      </div>
                    )}
                  </animated.div>
                )
            )
          )}
        </div>
        <div className="mt-8">
          {!loading && forecastData.length > 0 && (
            <>
              <h2 className="text-3xl font-bold text-center text-white">
                5-Day Forecast
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                {forecastTransitions(
                  (styles, item) =>
                    item && (
                      <animated.div
                        style={styles}
                        key={item.dt}
                        className="text-center"
                      >
                        <h3 className="text-xl font-bold text-white">
                          {new Date(item.dt * 1000).toLocaleDateString()}
                        </h3>
                        <img
                          src={
                            WeatherTypes.find(
                              (weather) => weather.type === item.weather[0].main
                            )?.img
                          }
                          alt="..."
                          className="w-14 mx-auto my-2"
                        />
                        <p className="text-[16px] font-semibold text-white">
                          Temperature : {item.main.temp.toFixed(2)}&deg;
                          {unit === "metric" ? "C" : "F"}
                        </p>
                        <p className="text-[16px] font-semibold text-white mb-1">
                          Humidity : {item.main.humidity}%
                        </p>
                        <p className="text-[16px] font-semibold text-white mb-1">
                          Weather Type : {item.weather[0].main}
                        </p>
                      </animated.div>
                    )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
