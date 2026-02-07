import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ language, setLanguage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const translations = {
    en: {
      projects: "Projects",
      createAvatar: "Create Avatar",
      createContent: "Create Content",
    },
    km: {
      projects: "គម្រោង",
      createAvatar: "បង្កើតរូបតំណាង",
      createContent: "បង្កើតមាតិកា",
    },
  };

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "km" : "en");
  };

  return (
    <nav
      style={{ backgroundColor: "#ffffff" }}
      className="border-b border-gray-100 py-6"
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link
          to="/"
          style={{ color: "#297fb2" }}
          className="text-3xl font-light tracking-wide"
        >
          Nureach AI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <ul className="flex space-x-8 font-light text-lg">
            <li>
              <Link
                to="/projects"
                style={{ color: "#297fb2" }}
                className="transition duration-200"
                onMouseEnter={(e) => (e.target.style.color = "#cce49e")}
                onMouseLeave={(e) => (e.target.style.color = "#297fb2")}
              >
                {t.projects}
              </Link>
            </li>
          </ul>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 rounded font-light text-sm transition duration-200"
            style={{
              backgroundColor: "#297fb2",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            {language === "en" ? "ភាសាខ្មែរ" : "English"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ color: "#297fb2" }}
        >
          <span
            className="block w-6 h-0.5"
            style={{ backgroundColor: "#297fb2" }}
          ></span>
          <span
            className="block w-6 h-0.5"
            style={{ backgroundColor: "#297fb2" }}
          ></span>
          <span
            className="block w-6 h-0.5"
            style={{ backgroundColor: "#297fb2" }}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mt-4 px-6 py-4 space-y-4"
          style={{ backgroundColor: "#ffffff" }}
        >
          <Link
            to="/projects"
            style={{ color: "#297fb2" }}
            className="block font-light text-lg transition duration-200"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t.projects}
          </Link>
          <button
            onClick={toggleLanguage}
            className="w-full px-4 py-2 rounded font-light text-sm transition duration-200"
            style={{
              backgroundColor: "#297fb2",
              color: "#ffffff",
            }}
          >
            {language === "en" ? "ភាសាខ្មែរ" : "English"}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
