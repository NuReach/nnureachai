import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { generateBrandingScript, generateBrandingTopics } from "../lib/gemini";

const CreateBranding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState("en");
  const [topic, setTopic] = useState("");
  const [scripts, setScripts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [suggestedTopics, setSuggestedTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

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

  // Fetch saved branding scripts
  const { data: savedScripts } = useQuery({
    queryKey: ["brandingScripts", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branding_scripts")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Load saved scripts into state
  useEffect(() => {
    if (savedScripts) {
      setScripts(savedScripts);
    }
  }, [savedScripts]);

  // Mutation to save script
  const saveScriptMutation = useMutation({
    mutationFn: async (scriptData) => {
      const { data, error } = await supabase
        .from("branding_scripts")
        .insert([scriptData])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandingScripts", id] });
    },
  });

  // Mutation to update script
  const updateScriptMutation = useMutation({
    mutationFn: async ({ scriptId, content }) => {
      const { data, error } = await supabase
        .from("branding_scripts")
        .update({ content })
        .eq("id", scriptId)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandingScripts", id] });
    },
  });

  // Mutation to delete script
  const deleteScriptMutation = useMutation({
    mutationFn: async (scriptId) => {
      const { error } = await supabase
        .from("branding_scripts")
        .delete()
        .eq("id", scriptId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandingScripts", id] });
    },
  });

  const generateTopicSuggestions = async () => {
    if (!client) return;

    setIsLoadingTopics(true);
    try {
      const topics = await generateBrandingTopics(client);
      setSuggestedTopics(topics);
    } catch (error) {
      console.error("Error generating topics:", error);
      alert("មានបញ្ហាក្នុងការបង្កើតប្រធានបទ។");
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const generateScript = async () => {
    if (!topic.trim()) {
      alert("សូមបញ្ចូលប្រធានបទ!");
      return;
    }

    setIsGenerating(true);
    try {
      const text = await generateBrandingScript(topic);

      // Save to database
      await saveScriptMutation.mutateAsync({
        client_id: id,
        user_id: user.id,
        topic: topic,
        content: text,
      });

      setTopic("");
    } catch (error) {
      console.error("Error generating script:", error);
      alert("មានបញ្ហាក្នុងការបង្កើតស្គ្រីប។ សូមពិនិត្យមើល API Key របស់អ្នក។");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (scriptId) => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបស្គ្រីបនេះ?")) {
      try {
        await deleteScriptMutation.mutateAsync(scriptId);
      } catch (error) {
        console.error("Error deleting script:", error);
        alert("មានបញ្ហាក្នុងការលុបស្គ្រីប។");
      }
    }
  };

  const handleEdit = (script) => {
    setEditingId(script.id);
    setEditText(script.content);
  };

  const handleSaveEdit = async (scriptId) => {
    try {
      await updateScriptMutation.mutateAsync({
        scriptId,
        content: editText,
      });
      setEditingId(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating script:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុក។");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#cce49e" }}
    >
      <Navbar language={language} setLanguage={setLanguage} />

      <main className="grow py-16 px-6" style={{ backgroundColor: "#ffffff" }}>
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(`/client/${id}`)}
              className="mr-4 px-4 py-2 rounded font-light transition duration-200"
              style={{ backgroundColor: "#e5e7eb", color: "#a855f7" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d1d5db")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#e5e7eb")}
            >
              ← ថយក្រោយ
            </button>
            <h1 className="text-4xl font-light" style={{ color: "#a855f7" }}>
              បង្កើតស្គ្រីបម៉ាកយីហោ
            </h1>
          </div>

          {/* Client Info Banner */}
          {client && (
            <div
              className="mb-8 p-4 rounded-lg"
              style={{
                backgroundColor: "#fae8ff",
                border: "1px solid #a855f7",
              }}
            >
              <h2 className="text-xl font-light" style={{ color: "#a855f7" }}>
                {client.product_name}
              </h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                {client.country} | {client.price}
              </p>
            </div>
          )}

          {/* Input Section */}
          <div
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center justify-between mb-3">
              <label
                className="block font-light text-lg"
                style={{ color: "#a855f7" }}
              >
                ប្រធានបទស្គ្រីប
              </label>
              <button
                onClick={generateTopicSuggestions}
                disabled={isLoadingTopics || !client}
                className="px-4 py-2 rounded font-light text-sm transition duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: "#f3e8ff",
                  color: "#a855f7",
                  border: "1px solid #a855f7",
                }}
                onMouseEnter={(e) =>
                  !isLoadingTopics &&
                  (e.target.style.backgroundColor = "#e9d5ff")
                }
                onMouseLeave={(e) =>
                  !isLoadingTopics &&
                  (e.target.style.backgroundColor = "#f3e8ff")
                }
              >
                {isLoadingTopics
                  ? "⏳ កំពុងបង្កើត..."
                  : "✨ បង្កើតប្រធានបទដោយ AI"}
              </button>
            </div>

            {/* Suggested Topics */}
            {suggestedTopics.length > 0 && (
              <div className="mb-4">
                <p
                  className="text-sm font-light mb-2"
                  style={{ color: "#6b7280" }}
                >
                  ជ្រើសរើសប្រធានបទដែលបានណែនាំ:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.map((suggested, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTopic(suggested)}
                      className="px-3 py-2 rounded-lg font-light text-sm transition duration-200"
                      style={{
                        backgroundColor:
                          topic === suggested ? "#a855f7" : "#f3e8ff",
                        color: topic === suggested ? "#ffffff" : "#a855f7",
                        border: "1px solid #a855f7",
                      }}
                      onMouseEnter={(e) => {
                        if (topic !== suggested) {
                          e.target.style.backgroundColor = "#e9d5ff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (topic !== suggested) {
                          e.target.style.backgroundColor = "#f3e8ff";
                        }
                      }}
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="បញ្ចូលប្រធានបទសម្រាប់ស្គ្រីប ឬជ្រើសរើសពីប្រធានបទដែលបានណែនាំ"
              className="w-full p-4 border rounded-lg font-light text-lg mb-4"
              style={{ borderColor: "#e5e7eb" }}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isGenerating) {
                  generateScript();
                }
              }}
            />
            <button
              onClick={generateScript}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-4 rounded-lg font-light text-lg transition duration-200 disabled:opacity-50"
              style={{ backgroundColor: "#a855f7", color: "#ffffff" }}
              onMouseEnter={(e) =>
                !isGenerating && (e.target.style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                !isGenerating && (e.target.style.opacity = "1")
              }
            >
              {isGenerating ? "កំពុងបង្កើត..." : "🎨 បង្កើតស្គ្រីប"}
            </button>
          </div>

          {/* Scripts List */}
          <div className="space-y-6">
            {scripts.length === 0 ? (
              <div
                className="text-center py-16 rounded-lg"
                style={{ backgroundColor: "#f9fafb" }}
              >
                <div className="text-6xl mb-4">📝</div>
                <p className="text-xl font-light" style={{ color: "#6b7280" }}>
                  មិនទាន់មានស្គ្រីប
                </p>
                <p className="text-sm font-light" style={{ color: "#9ca3af" }}>
                  បញ្ចូលប្រធានបទនិងចុច "បង្កើតស្គ្រីប"
                </p>
              </div>
            ) : (
              scripts.map((script) => (
                <div
                  key={script.id}
                  className="bg-white rounded-lg shadow-lg p-6"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-xl font-light"
                        style={{ color: "#a855f7" }}
                      >
                        {script.topic}
                      </h3>
                      <p className="text-sm" style={{ color: "#9ca3af" }}>
                        {new Date(script.created_at).toLocaleDateString(
                          "km-KH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {editingId !== script.id && (
                        <>
                          <button
                            onClick={() => handleEdit(script)}
                            className="px-4 py-2 rounded font-light transition duration-200"
                            style={{
                              backgroundColor: "#f3e8ff",
                              color: "#a855f7",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = "#e9d5ff")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = "#f3e8ff")
                            }
                          >
                            ✏️ កែសម្រួល
                          </button>
                          <button
                            onClick={() => handleDelete(script.id)}
                            className="px-4 py-2 rounded font-light transition duration-200"
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = "#fecaca")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = "#fee2e2")
                            }
                          >
                            🗑️ លុប
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {editingId === script.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-4 border rounded-lg font-light mb-4"
                        style={{
                          borderColor: "#a855f7",
                          minHeight: "300px",
                        }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded font-light transition duration-200"
                          style={{
                            border: "1px solid #a855f7",
                            color: "#a855f7",
                          }}
                        >
                          បោះបង់
                        </button>
                        <button
                          onClick={() => handleSaveEdit(script.id)}
                          className="px-4 py-2 rounded font-light transition duration-200"
                          style={{
                            backgroundColor: "#a855f7",
                            color: "#ffffff",
                          }}
                          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                          onMouseLeave={(e) => (e.target.style.opacity = "1")}
                        >
                          រក្សាទុក
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="whitespace-pre-wrap font-light leading-relaxed"
                      style={{ color: "#1f2937" }}
                    >
                      {script.content}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBranding;
