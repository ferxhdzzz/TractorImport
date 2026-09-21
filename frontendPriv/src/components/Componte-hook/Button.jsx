import React from "react";

const Button = ({ type = "button", children, className, onClick }) => {
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      style={{ backgroundColor: "#4C8F3F" }}
    >
      {children}
    </button>
  );
};

export default Button;
