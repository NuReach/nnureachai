import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import {
  useScripts,
  useUpdateScript,
  useDeleteScript,
} from "../hooks/useScripts";

const AllScripts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editingScriptId, setEditingScriptId] = useState(null);
  const [editableContent, setEditableContent] = useState("");

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
  const updateScriptMutation = useUpdateScript();
  const deleteScriptMutation = useDeleteScript();

  const handleEdit = (script) => {
    setEditingScriptId(script.id);
    setEditableContent(script.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!editingScriptId || !editableContent) return;

    await updateScriptMutation.mutateAsync({
      id: editingScriptId,
      updates: { content: editableContent, updated_at: new Date() },
    });
    setEditingScriptId(null);
    setEditableContent("");
  };

  const handleDelete = async (scriptId) => {
    if (window.confirm("តើអ្នកប្រាកដថាចង់លុបស្គ្រីបនេះមែនទេ?")) {
      await deleteScriptMutation.mutateAsync({ id: scriptId, clientId: id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/client/${id}/typologies`)}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
          >
            ← ត្រឡប់ក្រោយ
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Saved Scripts
          </h1>
          <p className="text-gray-600">
            ស្គ្រីបទាំងអស់ដែលបានរក្សាទុកសម្រាប់ {client?.product_name}
          </p>
        </div>

        {/* Edit Script Section */}
        {editingScriptId && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              កែសម្រួល Script
            </h2>
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-96 p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-sans text-lg leading-relaxed"
              placeholder="Content script goes here..."
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-all"
              >
                រក្សាទុកការកែប្រែ
              </button>
              <button
                onClick={() => {
                  setEditingScriptId(null);
                  setEditableContent("");
                }}
                className="text-gray-500 hover:text-gray-700 font-medium px-8 py-3"
              >
                បោះបង់
              </button>
            </div>
          </div>
        )}

        {/* Scripts Grid */}
        <div className="grid gap-6">
          {savedScripts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                មិនមានស្គ្រីបដែលបានរក្សាទុកនៅឡើយទេ។
              </p>
              <button
                onClick={() => navigate(`/client/${id}/typologies`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                បង្កើតស្គ្រីបថ្មី
              </button>
            </div>
          ) : (
            savedScripts.map((script) => (
              <div
                key={script.id}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
                      {script.angle_title}
                    </span>
                    <p className="text-gray-400 text-xs">
                      រក្សាទុកនៅ:{" "}
                      {new Date(script.created_at).toLocaleDateString("km-KH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {script.updated_at &&
                      script.updated_at !== script.created_at && (
                        <p className="text-gray-400 text-xs">
                          កែប្រែចុងក្រោយ:{" "}
                          {new Date(script.updated_at).toLocaleDateString(
                            "km-KH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </p>
                      )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(script)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="កែសម្រួល"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(script.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="លុប"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed max-h-60 overflow-hidden relative">
                  {script.content}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-white to-transparent" />
                </div>
                <button
                  onClick={() => handleEdit(script)}
                  className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                >
                  មើលស្គ្រីបទាំងស្រុង
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AllScripts;
