import React, { useRef, useState } from "react";

const Api_key = "283f90719ecc2d0dd3cb316eb553a072";

const Home = () => {
  const inputRef = useRef(null);
  const [apiData, setApiData] = useState(null);
  const [showWeather, setShowWeather] = useState(null);

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

  const fetchWeather = async () => {
    const URL = `https://api.openweathermap.org/data/2.5/weather?q=${inputRef.current.value}&units=metric&appid=${Api_key}`;
    fetch(URL)
      .then((res) => res.json())
      .then((data) => {
        setApiData(null);
        setShowWeather(
          WeatherTypes.filter(
            (weather) => weather.type === data.weather[0].main
          )
        );
        setApiData(data);
      })
      .catch((err) => {
        console.log(err);
      });
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
          <div className="text-center flex flex-col gap-6 mt-10">
            {apiData && (
              <p className="text-xl font-semibold">
                {apiData?.name + "," + apiData?.sys?.country}
              </p>
            )}
            {showWeather && showWeather.length > 0 && (
              <img
                src={showWeather[0]?.img}
                alt="..."
                className="w-52 mx-auto"
              />
            )}
            {showWeather && (
              <h3 className="text-2xl font-bold text-zinc-800">
                {showWeather[0]?.type}
              </h3>
            )}
            {apiData && (
              <div className="flex flex-col items-center">
                <h2 className="text-4xl font-extrabold">
                  {apiData?.main?.temp + "°C"}
                </h2>
                <h3 className="text-xl font-bold text-zinc-800 mt-4">
                  Humidity: {apiData?.main?.humidity}%
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;