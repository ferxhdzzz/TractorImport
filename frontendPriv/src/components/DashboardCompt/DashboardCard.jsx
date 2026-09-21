import React from "react";
import "../../styles/DashboardCss/dashboardCard.css";

const DashboardCard = ({ value, label, img }) => {
  return (
    <div className="dashboard-card3">
      <div className="card-content">
        <div className="card-value">{value}</div>
        <div className="card-label">{label}</div>
      </div>
      {img && (
        <img 
          src={img} 
          alt={label} 
          className="card-image"
        />
      )}
    </div>
  );
};

export default DashboardCard;
