import React from "react";
import "./Snowfall.scss";

const SNOWFLAKES = Array.from({ length: 70 }, (_, index) => index);

const Snowfall = () => (
  <div className="snowfall" aria-hidden="true">
    {SNOWFLAKES.map((flake) => (
      <span key={flake} className="snowflake" />
    ))}
  </div>
);

export default Snowfall;
