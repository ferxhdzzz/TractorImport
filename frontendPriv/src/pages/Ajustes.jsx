import React from "react";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import ProfileCard from "../components/Ajustes/ProfileCard";
import BackgroundRectangle from "../components/Ajustes/BackgroundRectangle";
import "../styles/Ajustes.css";



const Ajustes = () => {
  return (
    <div className="ajustes-page">
      <Sidebar />
      <div className="ajustes-container">
        <TopBar />
        <div className="ajustes-content">
          {/* Rectángulo detrás de la card */}
          <BackgroundRectangle />
          <ProfileCard />
        </div>
      </div>
    </div>
  );
};

export default Ajustes;
