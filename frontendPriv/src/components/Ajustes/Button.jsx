import React from "react";
import "./Button.css";

const Button = ({ text, onClick, className = "", type = "button" }) => {
  return (
    <button
      className={`button ${className}`}
      type={type}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
    >
      {text}
    </button>
  );
};

export default Button;
