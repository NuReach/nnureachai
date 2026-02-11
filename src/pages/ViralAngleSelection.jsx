import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

const ViralAngleSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedAngle, setSelectedAngle] = useState(null);

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  console.log(user);

  // Fetch client details
  const { data: client } = useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const viralAngles = [
    {
      id: 1,
      title: "The Tutorial Angle",
      description: "Showing a step-by-step process, framework, or acronym",
      icon: "📚",
      color: "#297fb2",
      bgColor: "#f0f9ff",
    },
    {
      id: 2,
      title: "The Comparison Angle",
      description:
        "Compare different actions, methods, or products and their results",
      icon: "⚖️",
      color: "#059669",
      bgColor: "#f0fdf4",
    },
    {
      id: 3,
      title: "The Myth Bust / Common Mistake Angle",
      description: "Share myths or mistakes in your niche and correct them",
      icon: "💥",
      color: "#dc2626",
      bgColor: "#fef2f2",
    },
    {
      id: 4,
      title: "The Do's vs. Don'ts Angle",
      description: "Show the right and wrong ways to do something",
      icon: "✅",
      color: "#ea580c",
      bgColor: "#fff7ed",
    },
    {
      id: 5,
      title: "The Tip / Hack Angle",
      description: "Show a one-off niche tip, lesson, or hack",
      icon: "💡",
      color: "#ca8a04",
      bgColor: "#fefce8",
    },
    {
      id: 6,
      title: "The Transformation Angle",
      description: "Show a client or personal before-and-after result",
      icon: "✨",
      color: "#7c3aed",
      bgColor: "#faf5ff",
    },
    {
      id: 7,
      title: "The Challenge Angle",
      description: "Complete a niche-related challenge",
      icon: "🏆",
      color: "#db2777",
      bgColor: "#fdf2f8",
    },
  ];

  const handleAngleSelect = (angle) => {
    setSelectedAngle(angle.id);
  };

  const handleContinue = () => {
    if (!selectedAngle) {
      alert("Please select a viral angle!");
      return;
    }

    const angle = viralAngles.find((a) => a.id === selectedAngle);
    // Navigate to branding page with selected angle
    navigate(`/client/${id}/branding`, {
      state: { selectedAngle: angle },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#cce49e" }}
    >
      <Navbar language="en" setLanguage={() => {}} />

      <main className="flex-1 py-8 px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(`/client/${id}`)}
              className="text-sm mb-4 hover:underline flex items-center gap-2"
              style={{ color: "#297fb2" }}
            >
              ← Back to Client
            </button>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "#297fb2" }}
            >
              Choose Your Viral Angle
            </h1>
            <p className="text-gray-600">
              {client ? `Branding for ${client.product_name}` : "Loading..."}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Select one of the 7 viral angles to create engaging content for
              your brand
            </p>
          </div>

          {/* Viral Angles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {viralAngles.map((angle) => (
              <div
                key={angle.id}
                onClick={() => handleAngleSelect(angle)}
                className={`p-6 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAngle === angle.id
                    ? "ring-4 ring-offset-2 transform scale-105"
                    : "hover:shadow-lg"
                }`}
                style={{
                  backgroundColor: angle.bgColor,
                  border: `2px solid ${angle.color}`,
                  ...(selectedAngle === angle.id && {
                    ringColor: angle.color,
                  }),
                }}
              >
                {/* Icon and Title */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{angle.icon}</span>
                  <div>
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ color: angle.color }}
                    >
                      Angle #{angle.id}
                    </h3>
                    <h4
                      className="font-semibold"
                      style={{ color: angle.color }}
                    >
                      {angle.title}
                    </h4>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {angle.description}
                </p>

                {/* Selection Indicator */}
                {selectedAngle === angle.id && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: angle.color }}
                    >
                      ✓ SELECTED
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={!selectedAngle}
              className="px-8 py-4 rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105"
              style={{
                backgroundColor: selectedAngle ? "#297fb2" : "#94a3b8",
              }}
            >
              {selectedAngle
                ? "Continue to Branding →"
                : "Select an Angle First"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViralAngleSelection;
