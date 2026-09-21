import React from "react";
import { Link } from "react-router-dom";
import "./LabelCont.css";

const InlineRedirectLabel = ({ text, to }) => {
  return (
    <div className="inline-redirect-label">
      <Link to={to}>{text}</Link>
    </div>
  );
};

export default InlineRedirectLabel;
