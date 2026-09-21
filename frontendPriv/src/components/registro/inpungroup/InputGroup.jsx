import React from "react";
import "./Input.css";

const Input = React.forwardRef(({ label, type = "text", ...props }, ref) => {
  return (
    <div className="input-wrapper">
      <label className="input-label">{label}</label>
      <input
        ref={ref}
        type={type}
        className="input"
        {...props} 
      />
    </div>
  );
});

export default Input;
