import React from "react";
import { Link } from "react-router-dom";
import "./LabelLog.css";

const RedirectLabel = ({ textBefore, linkText, to }) => {
  return (
    <div className="redirect-label">
      <span>{textBefore} </span>
      <Link to={to}>{linkText}</Link>
    </div>
  );
};

export default RedirectLabel;
