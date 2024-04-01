import React from "react";

const WeatherCard = ({ apiData, showWeather, unit, toggleUnit }) => {
  return (
    <div className="text-center flex flex-col gap-6 mt-8">
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
      <h3 className="text-2xl font-bold text-white">{showWeather[0]?.type}</h3>
      {apiData && (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-extrabold text-white mb-4">
            {unit === "metric"
              ? apiData?.main?.temp.toFixed(2) + "°C"
              : apiData?.main?.temp.toFixed(2) + "°F"}
          </h2>
          <button
            onClick={toggleUnit}
            className="text-white text-lg border-2 border-white px-6 py-3 rounded-full font-semibold"
          >
            Toggle Unit
          </button>
          <h3 className="text-xl font-bold text-white mt-4">
            Humidity: {apiData?.main?.humidity}%
          </h3>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
