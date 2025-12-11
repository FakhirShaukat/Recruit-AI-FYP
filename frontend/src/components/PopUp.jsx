import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";

const PopUp = ({ showPopup }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "HR",
    email: "hr@example.com",
  };

  const initials = user.name ? user.name.split(" ").map(n => n[0]).join("") : "HR";
  user.initials = initials.toUpperCase(); 

  if (!showPopup) return null;

  return (
    <div className="fixed top-14 right-10 z-50 ">
      <div className="text-lg rounded-lg flex bg-white shadow-md text-black p-4 w-[15rem] h-[280px] flex-col border-gray-200 border">
        <div className="user-initials w-full p-2 flex flex-col justify-center items-center">
          <h1 className="rounded-full w-14 h-14 pt-3 text-center text-2xl border bg-[#0f1d3d] text-white">
            {user.initials}
          </h1>
          <p className="pt-1 text-[9px]">{user.email}</p>
          <p className="text-2xl text-center mt-4 font-bold">
            Welcome {user.name}
          </p>
        </div>
        <div className="signoutBtn border max-w-[40%] bg-red-600 hover:bg-red-700 transition duration-300 text-white mt-auto rounded-lg">
          <Link to="/" className="flex gap-2 px-2 w-auto items-center">
            <img className="w-3 invert" src={assets.logout} alt="" />
            <button className="text-[9px]">Sign Out</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
