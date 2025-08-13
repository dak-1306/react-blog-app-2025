import React from "react";
import "./Spinner.css";

const Spinner = ({ size = "medium", color = "primary" }) => {
  return (
    <div className={`spinner spinner--${size} spinner--${color}`}>
      <div className="spinner__circle"></div>
    </div>
  );
};

export default Spinner;
