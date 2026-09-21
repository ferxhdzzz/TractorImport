// src/components/Recuperacion/BackArrow.jsx
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./BackArrow.css";

const BackArrow = ({ to = "/", className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <div className={`back-arrow ${className}`} onClick={handleClick}>
      <FaArrowLeft size={20} />
    </div>
  );
};

export default BackArrow;
