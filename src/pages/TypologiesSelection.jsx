import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useScripts } from "../hooks/useScripts";

const TypologiesSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch client details with immersion data
  const {
    data: client,
    isLoading,
    error,
  } = useQuery({
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

  // Fetch scripts to check if client has any
  const { data: savedScripts = [] } = useScripts(id);

  const handleTypologySelect = (typology) => {
    navigate(`/client/${id}/content`, {
      state: { selectedTypology: typology },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client || !client.immersion_data?.userTypologies) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <p className="text-gray-600 mb-4">
          មិនមានទិន្នន័យ User Typologies។ សូមបង្កើត Immersion ជាមុនសិន។
        </p>
        <button
          onClick={() => navigate(`/client/${id}`)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ត្រលប់ក្រោយ
        </button>
      </div>
    );
  }

  const typologies = client.immersion_data.userTypologies;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate(`/client/${id}`)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              ← ត្រលប់ក្រោយ
            </button>
            {savedScripts.length > 0 && (
              <button
                onClick={() => navigate(`/client/${id}/scripts`)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                <span>📄</span>
                <span>View All Scripts ({savedScripts.length})</span>
              </button>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ជ្រើសរើស User Typology
          </h1>
          <p className="text-gray-600">
            សូមជ្រើសរើស typology ដែលអ្នកចង់បង្កើតមាតិកាសម្រាប់
          </p>
        </div>

        {/* Typologies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {typologies.map((typology, index) => (
            <TypologyCard
              key={index}
              typology={typology}
              index={index + 1}
              onSelect={() => handleTypologySelect(typology)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

const TypologyCard = ({ typology, index, onSelect }) => {
  const colors = [
    { bg: "#fef3c7", border: "#f59e0b", text: "#d97706", hover: "#fde68a" },
    { bg: "#dbeafe", border: "#3b82f6", text: "#1d4ed8", hover: "#bfdbfe" },
    { bg: "#fce7f3", border: "#ec4899", text: "#be185d", hover: "#fbcfe8" },
    { bg: "#dcfce7", border: "#22c55e", text: "#15803d", hover: "#bbf7d0" },
    { bg: "#f3e8ff", border: "#a855f7", text: "#7e22ce", hover: "#e9d5ff" },
    { bg: "#ffedd5", border: "#f97316", text: "#c2410c", hover: "#fed7aa" },
    { bg: "#e0e7ff", border: "#6366f1", text: "#4338ca", hover: "#c7d2fe" },
    { bg: "#fecdd3", border: "#f43f5e", text: "#be123c", hover: "#fda4af" },
    { bg: "#ccfbf1", border: "#14b8a6", text: "#0f766e", hover: "#99f6e4" },
  ];

  const color = colors[(index - 1) % colors.length];

  return (
    <button
      onClick={onSelect}
      className="rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 text-left w-full transform hover:scale-105"
      style={{
        backgroundColor: color.bg,
        borderColor: color.border,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = color.hover)
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = color.bg)}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: color.border }}
        >
          {index}
        </div>
        <h4 className="font-bold text-lg flex-1" style={{ color: color.text }}>
          {typology.typologyName}
        </h4>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">🧠 Mindset</p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.mindset}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            😣 Core Pain
          </p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.corePain}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            ✨ Core Desire
          </p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.coreDesire}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            🎯 Buying Trigger
          </p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.buyingTrigger}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            💡 Best Content Angle
          </p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.bestContentAngle}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-white/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            📢 CTA Style
          </p>
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-2">
            {typology.ctaStyle}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span
          className="inline-block px-4 py-2 rounded-lg font-medium text-sm"
          style={{
            backgroundColor: color.border,
            color: "white",
          }}
        >
          ជ្រើសរើស Typology នេះ →
        </span>
      </div>
    </button>
  );
};

export default TypologiesSelection;
