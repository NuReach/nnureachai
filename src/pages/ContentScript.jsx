import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { generateScript, generateSaleScript } from "../lib/gemini";
import {
  useScripts,
  useCreateScript,
  useUpdateScript,
  useDeleteScript,
} from "../hooks/useScripts";

const ContentScript = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { angle, selectedTypology: typologyFromState } = location.state || {};

  const [currentScript, setCurrentScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [editableContent, setEditableContent] = useState("");
  const [selectedTypology] = useState(typologyFromState || null);
  const [scriptType, setScriptType] = useState(null); // 'content' or 'sale'
  const [contentGuidance, setContentGuidance] = useState(""); // User's content preferences

  // Redirect if no typology selected
  useEffect(() => {
    if (!typologyFromState && !selectedTypology) {
      navigate(`/client/${id}/typologies`);
    }
  }, [typologyFromState, selectedTypology, navigate, id]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

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

  const { data: savedScripts = [] } = useScripts(id);
  const [filterByAngle, setFilterByAngle] = useState(true);

  const displayedScripts =
    filterByAngle && angle
      ? savedScripts.filter((s) => s.angle_title === angle.title)
      : savedScripts;
  const createScriptMutation = useCreateScript();
  const updateScriptMutation = useUpdateScript();
  const deleteScriptMutation = useDeleteScript();

  const handleGenerateWithGuidance = async () => {
    if (!client || !angle || !selectedTypology) return;
    setIsGenerating(true);
    try {
      let script;
      if (scriptType === "content") {
        script = await generateScript(
          client,
          angle,
          selectedTypology,
          contentGuidance,
        );
      } else if (scriptType === "sale") {
        script = await generateSaleScript(
          client,
          angle,
          selectedTypology,
          contentGuidance,
        );
      }
      setCurrentScript(script);
      setEditableContent(script);
    } catch (error) {
      console.error("Failed to generate script:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (!selectedTypology) return;
    setScriptType("content");
    if (!client || !angle) return;
    setIsGenerating(true);
    try {
      const script = await generateScript(
        client,
        angle,
        selectedTypology,
        contentGuidance,
      );
      setCurrentScript(script);
      setEditableContent(script);
    } catch (error) {
      console.error("Failed to generate script:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSale = async () => {
    if (!selectedTypology) return;
    setScriptType("sale");
    if (!client || !angle) return;
    setIsGenerating(true);
    try {
      const script = await generateSaleScript(
        client,
        angle,
        selectedTypology,
        contentGuidance,
      );
      setCurrentScript(script);
      setEditableContent(script);
    } catch (error) {
      console.error("Failed to generate script:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !id || !angle || !editableContent) return;

    if (editingScriptId) {
      await updateScriptMutation.mutateAsync({
        id: editingScriptId,
        updates: { content: editableContent, updated_at: new Date() },
      });
      setEditingScriptId(null);
    } else {
      await createScriptMutation.mutateAsync({
        client_id: id,
        user_id: user.id,
        angle_title: angle.title,
        content: editableContent,
        content_typology: selectedTypology?.typologyName || null,
      });
    }
    setCurrentScript("");
    setEditableContent("");
  };

  const handleEdit = (script) => {
    setEditingScriptId(script.id);
    setEditableContent(script.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (scriptId) => {
    if (window.confirm("តើអ្នកប្រាកដថាចង់លុបស្គ្រីបនេះមែនទេ?")) {
      await deleteScriptMutation.mutateAsync({ id: scriptId, clientId: id });
    }
  };

  if (!angle && !editingScriptId && savedScripts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-12 flex flex-col items-center justify-center">
        <h2 className="text-xl mb-4">No angle selected</h2>
        <button
          onClick={() => navigate(`/client/${id}/content`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Back to Content Plan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-light">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() =>
            navigate(`/client/${id}/content`, {
              state: { selectedTypology: typologyFromState },
            })
          }
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors"
        >
          <span>←</span> ត្រឡប់ក្រោយ
        </button>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
          {angle && (
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{angle.icon}</span>
                <div>
                  <h1 className="text-2xl font-medium text-gray-800">
                    {angle.title}
                  </h1>
                  <p className="text-gray-500">{angle.description}</p>
                </div>
              </div>
              {!currentScript && !editingScriptId && (
                <div>
                  {selectedTypology && (
                    <div className="mb-6 space-y-4">
                      {/* Selected Typology Header */}
                      <div className="p-4 bg-linear-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            ✓
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 uppercase tracking-wide">
                              Selected Typology
                            </p>
                            <p className="font-bold text-lg text-blue-700">
                              {selectedTypology.typologyName}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Content Guidance Input */}
                      <div className="p-5 bg-linear-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">✍️</span>
                          <h3 className="font-bold text-indigo-800">
                            Content Guidance (Optional)
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Tell us what you want or don't want in your script.
                          For example: "Include family story", "No mention of
                          price", "Focus on convenience", etc.
                        </p>
                        <textarea
                          value={contentGuidance}
                          onChange={(e) => setContentGuidance(e.target.value)}
                          placeholder="e.g., សូមរួមបញ្ចូលរឿងគ្រួសារ, កុំនិយាយពីតម្លៃ, ផ្តោតលើភាពងាយស្រួល..."
                          className="w-full h-24 p-3 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setScriptType("content");
                        handleGenerateWithGuidance();
                      }}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating
                        ? "កំពុងបង្កើត..."
                        : "បង្កើត Content Script 🤖"}
                    </button>
                    <button
                      onClick={() => {
                        setScriptType("sale");
                        handleGenerateWithGuidance();
                      }}
                      disabled={isGenerating}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isGenerating
                        ? "កំពុងបង្កើត..."
                        : "បង្កើត Sale Script 💰"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(currentScript || editingScriptId) && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-700">
                    {editingScriptId
                      ? "កែសម្រួល Script"
                      : "Script ដែលបានបង្កើត"}
                  </h2>
                  {selectedTypology && (
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full mt-2 inline-block">
                      {selectedTypology.typologyName}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {angle && !editingScriptId && selectedTypology && (
                    <>
                      <button
                        onClick={handleRegenerateContent}
                        disabled={isGenerating}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {isGenerating
                          ? "កំពុងបង្កើតថ្មី..."
                          : "Regenerate Content"}
                      </button>
                      <button
                        onClick={handleRegenerateSale}
                        disabled={isGenerating}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        {isGenerating
                          ? "កំពុងបង្កើតថ្មី..."
                          : "Regenerate Sale"}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                className="w-full h-96 p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans text-lg leading-relaxed"
                placeholder="Content script goes here..."
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-all"
                >
                  {editingScriptId ? "រក្សាទុកការកែប្រែ" : "រក្សាទុកស្គ្រីបនេះ"}
                </button>
                {(currentScript || editingScriptId) && (
                  <button
                    onClick={() => {
                      setCurrentScript("");
                      setEditingScriptId(null);
                      setEditableContent("");
                    }}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                  >
                    បោះបង់
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* List of saved scripts */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">
              តារាងស្គ្រីបដែលបានរក្សាទុក ({displayedScripts.length})
            </h2>
            {angle && (
              <button
                onClick={() => setFilterByAngle(!filterByAngle)}
                className="text-sm text-blue-600 hover:underline"
              >
                {filterByAngle ? "បង្ហាញទាំងអស់" : `បង្ហាញតែ ${angle.title}`}
              </button>
            )}
          </div>
          <div className="grid gap-6">
            {displayedScripts.map((script) => (
              <div
                key={script.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {script.angle_title}
                      </span>
                      {script.content_typology && (
                        <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                          {script.content_typology}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs">
                      រក្សាទុកនៅ:{" "}
                      {new Date(script.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(script)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed max-h-40 overflow-hidden relative">
                  {script.content}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white to-transparent" />
                </div>
                <button
                  onClick={() => handleEdit(script)}
                  className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  មើលស្គ្រីបទាំងស្រុង
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentScript;
