import React from "react";

const Home = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#cce49e" }}
    >
      {/* Navbar */}
      <nav
        style={{ backgroundColor: "#ffffff" }}
        className="border-b border-gray-100 py-6"
      >
        <div className="container mx-auto flex justify-between items-center px-6">
          <div
            style={{ color: "#297fb2" }}
            className="text-3xl font-light tracking-wide"
          >
            Nureach AI
          </div>
          <ul className="flex space-x-8 font-light text-lg">
            <li>
              <a
                href="#"
                style={{ color: "#297fb2" }}
                className="transition duration-200"
                onMouseEnter={(e) => (e.target.style.color = "#cce49e")}
                onMouseLeave={(e) => (e.target.style.color = "#297fb2")}
              >
                Create Avatar
              </a>
            </li>
            <li>
              <a
                href="#"
                style={{ color: "#297fb2" }}
                className="transition duration-200"
                onMouseEnter={(e) => (e.target.style.color = "#cce49e")}
                onMouseLeave={(e) => (e.target.style.color = "#297fb2")}
              >
                Create Content
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        className="grow flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Floating Social Media Emojis */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="emoji-float absolute top-20 left-10 text-5xl opacity-60">
            📱
          </div>
          <div className="emoji-float-slow absolute top-32 right-20 text-6xl opacity-60">
            📸
          </div>
          <div className="emoji-float absolute bottom-40 left-20 text-4xl opacity-60">
            🎵
          </div>
          <div className="emoji-float absolute bottom-20 right-10 text-5xl opacity-60">
            👍
          </div>
          <div className="emoji-float-slow absolute top-1/2 left-1/4 text-4xl opacity-60">
            ❤️
          </div>
          <div className="emoji-float absolute top-3/4 right-1/4 text-5xl opacity-60">
            💬
          </div>
          <div className="emoji-float-slow absolute top-40 left-1/3 text-4xl opacity-60">
            📹
          </div>
          <div className="emoji-float absolute bottom-32 right-1/3 text-5xl opacity-60">
            ✨
          </div>
        </div>

        <div className="text-center px-8 max-w-4xl relative z-10">
          <h1
            className="text-6xl md:text-8xl font-light mb-6 leading-tight"
            style={{ color: "#297fb2" }}
          >
            Welcome to Nureach AI
          </h1>
          <div
            className="w-24 h-1 mx-auto mb-8"
            style={{ backgroundColor: "#cce49e" }}
          ></div>
          <p
            className="text-xl md:text-2xl font-light max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            Empowering your marketing strategy with advanced artificial
            intelligence
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              className="px-10 py-4 rounded font-light text-lg transition duration-200"
              style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Get Started
            </button>
            <button
              className="px-10 py-4 rounded font-light text-lg transition duration-200"
              style={{
                border: "1px solid #297fb2",
                color: "#297fb2",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#297fb2";
                e.target.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#297fb2";
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
