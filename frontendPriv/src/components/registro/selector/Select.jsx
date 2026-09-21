import React from "react";
import "./Select.css";

const PhoneInput = ({ label, name, value, onChange, country, onCountryChange }) => {
  return (
    <div className="input-wrapperr">
      <label className="input-label">{label}</label>
      <div className="phone-input-container">
        <select className="country-select" value={country} onChange={onCountryChange}>
          <option value="sv">+503</option>
          <option value="us">+1</option>
        </select>
        <input
          type="text"
          className="phone-input"
          name={name}
          value={value}
          onChange={onChange}
          placeholder=""
        />
      </div>
    </div>
  );
};

export default PhoneInput;
