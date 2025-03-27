import { useState } from "react";
import { FaBell, FaEnvelope } from "react-icons/fa";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between py-4 px-6 bg-white shadow-md relative">
      {/* Left Section - Title */}
      <h1 className="text-xl font-semibold"></h1>

      {/* Right Section - Icons and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification & Messages */}
        <div className="relative">
          <FaEnvelope className="w-6 h-6 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
        </div>
        
        <div className="relative">
          <FaBell className="w-6 h-6 text-gray-600 cursor-pointer" />
          <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
        </div>

        {/* Profile Image */}
        <div className="relative flex items-center cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-300"
          />
          <span className="ml-2 text-lg">▾</span>
        </div>
      </div>
      
      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-6 top-16 bg-white shadow-lg rounded-lg p-4 w-48">
          <ul className="space-y-3">
            <li className="cursor-pointer hover:text-blue-500">Edit Profile</li>
            <li className="cursor-pointer hover:text-blue-500">Change Password</li>
            <li className="cursor-pointer hover:text-blue-500">Manage Notification</li>
          </ul>
        </div>
      )}
    </nav>
  );
}
