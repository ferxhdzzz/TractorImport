// components/HeroButton.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./HeroButton.css";

const HeroButton = ({ children, to = "/productos" }) => {
  return (
    <NavLink to={to} className="hero-button">
      {children}
    </NavLink>
  );
};

export default HeroButton;