import React from "react";
import { Link } from "react-router-dom";

const Navabr = () => {
  return (
    <>
      <div>
        <div>
          <Link to={"/"}>Home</Link>
          <button className="bg-red-400 text-white p-4">
            <Link to={"/login"}>login</Link>
          </button>
          <button className="bg-red-400 text-white p-4">
            <Link to={"/register"}>register</Link>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navabr;
