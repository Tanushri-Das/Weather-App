import React from "react";

const ForecastCard = ({ item, unit, WeatherTypes }) => {
  const weatherIcon = WeatherTypes.find(
    (weather) => weather.type === item.weather[0].main
  )?.img;
  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-white">
        {new Date(item.dt * 1000).toLocaleDateString()}
      </h3>
      <img src={weatherIcon} alt="Weather icon" className="w-14 mx-auto my-2" />
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
    </div>
  );
};

export default ForecastCard;
