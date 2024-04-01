import React, { useRef, useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useTransition, animated } from "react-spring";
import WeatherCard from "../Components/WeatherCard/WeatherCard";
import ForecastCard from "../Components/ForecastCard/ForecastCard";

const Api_key = import.meta.env.VITE_apiKey;

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

  const weatherTransition = useTransition(showWeather, {
    from: { opacity: 0, transform: "translateY(-20px)" },
    enter: { opacity: 1, transform: "translateY(0px)" },
    leave: { opacity: 0, transform: "translateY(-20px)" },
    config: { duration: 500 },
  });

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
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    if (inputRef.current.value) {
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
            setForecastData([]);
          } else {
            setShowWeather(
              WeatherTypes.filter(
                (weather) => weather.type === data.weather[0].main
              )
            );
            setApiData(data);
            fetchForecastData(data.coord.lat, data.coord.lon);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
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
          const filteredForecastData = data.list.filter(
            (item, index) => index % 8 === 0 && index < 40
          );
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
                    <WeatherCard
                      apiData={apiData}
                      showWeather={showWeather}
                      unit={unit}
                      toggleUnit={toggleUnit}
                    />
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
                        <ForecastCard
                          item={item}
                          unit={unit}
                          WeatherTypes={WeatherTypes}
                        />
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
