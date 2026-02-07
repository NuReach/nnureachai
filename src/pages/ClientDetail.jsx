import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";
import { generateImmersion } from "../lib/gemini";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState("en");
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [isGeneratingImmersion, setIsGeneratingImmersion] = useState(false);
  const [immersionData, setImmersionData] = useState(null);
  console.log(immersionData);

  const [formData, setFormData] = useState({
    productName: "",
    country: "",
    price: "",
    status: "Active",
    problems: [],
    targetCustomers: "",
    warranty: "",
    promotion: "",
    uniqueness: "",
  });

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

      // Set form data when client is loaded
      setFormData({
        productName: data.product_name,
        country: data.country,
        price: data.price,
        status: data.status || "Active",
        problems: data.problems || [],
        targetCustomers: data.target_customers,
        warranty: data.warranty,
        promotion: data.promotion,
        uniqueness: data.uniqueness,
      });

      // Set immersion data if it exists
      if (data.immersion_data) {
        setImmersionData(data.immersion_data);
      }

      return data;
    },
    enabled: !!id,
  });

  // Update client mutation
  const updateClient = useMutation({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      setIsEditing(false);
      alert("អាប់ដេតជោគជ័យ! ✓");
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      alert("មានបញ្ហាក្នុងការអាប់ដេត។");
    },
  });

  // Delete client mutation
  const deleteClient = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", user?.id] });
      alert("លុបជោគជ័យ! ✓");
      navigate("/projects");
    },
    onError: (error) => {
      console.error("Error deleting client:", error);
      alert("មានបញ្ហាក្នុងការលុប។");
    },
  });

  const handleSave = () => {
    // Validate form
    const newErrors = {};

    if (!formData.productName || !formData.productName.trim()) {
      newErrors.productName = "សូមបញ្ចូលឈ្មោះផលិតផល";
    }

    if (!formData.country || !formData.country.trim()) {
      newErrors.country = "សូមបញ្ចូលប្រទេស";
    }

    if (!formData.price || !formData.price.trim()) {
      newErrors.price = "សូមបញ្ចូលតម្លៃ";
    }

    const validProblems = formData.problems.filter((p) => p && p.trim());
    if (validProblems.length < 3) {
      newErrors.problems = "សូមផ្តល់យ៉ាងតិច ៣ចម្លើយ";
    }

    if (!formData.targetCustomers || !formData.targetCustomers.trim()) {
      newErrors.targetCustomers = "សូមបញ្ចូលអតិថិជនគោលដៅ";
    }

    if (!formData.warranty || !formData.warranty.trim()) {
      newErrors.warranty = "សូមបញ្ចូលការធានា";
    }

    if (!formData.promotion || !formData.promotion.trim()) {
      newErrors.promotion = "សូមបញ្ចូលប្រម៉ូសិន";
    }

    if (!formData.uniqueness || !formData.uniqueness.trim()) {
      newErrors.uniqueness = "សូមបញ្ចូលភាពខុសគ្នា";
    }

    // If there are errors, show them and don't save
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top to see errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Clear errors and save
    setErrors({});
    updateClient.mutate({
      product_name: formData.productName,
      country: formData.country,
      price: formData.price,
      status: formData.status,
      problems: formData.problems.filter((p) => p && p.trim()),
      target_customers: formData.targetCustomers,
      warranty: formData.warranty,
      promotion: formData.promotion,
      uniqueness: formData.uniqueness,
    });
  };

  const handleDelete = () => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបអតិថិជននេះ?")) {
      deleteClient.mutate();
    }
  };

  const handleCreateImmersion = async () => {
    setIsGeneratingImmersion(true);
    try {
      const immersion = await generateImmersion(client);

      // Save immersion data to database
      const { error: updateError } = await supabase
        .from("clients")
        .update({ immersion_data: immersion })
        .eq("id", id);

      if (updateError) {
        console.error("Error saving immersion:", updateError);
        alert("មានបញ្ហាក្នុងការរក្សាទុក Immersion។");
        return;
      }

      setImmersionData(immersion);

      // Invalidate query to refresh client data
      queryClient.invalidateQueries({ queryKey: ["client", id] });

      // Navigate to immersion view page
      navigate(`/client/${id}/immersion`);
    } catch (error) {
      console.error("Error generating immersion:", error);
      alert(
        "មានបញ្ហាក្នុងការបង្កើត Immersion។ សូមពិនិត្យមើល API Key របស់អ្នក។",
      );
    } finally {
      setIsGeneratingImmersion(false);
    }
  };

  const handleShowImmersion = () => {
    navigate(`/client/${id}/immersion`);
  };

  const handleDeleteImmersion = async () => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបទិន្នន័យ Immersion នេះ?")) {
      try {
        const { error: updateError } = await supabase
          .from("clients")
          .update({ immersion_data: null })
          .eq("id", id);

        if (updateError) throw updateError;

        setImmersionData(null);
        queryClient.invalidateQueries({ queryKey: ["client", id] });
        alert("លុប Immersion ជោគជ័យ! ✓");
      } catch (error) {
        console.error("Error deleting immersion:", error);
        alert("មានបញ្ហាក្នុងការលុប Immersion។");
      }
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#cce49e" }}
      >
        <Navbar language={language} setLanguage={setLanguage} />
        <div className="grow flex items-center justify-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: "#297fb2" }}
          ></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#cce49e" }}
      >
        <Navbar language={language} setLanguage={setLanguage} />
        <div className="grow flex items-center justify-center">
          <p className="text-red-500">Error loading client details</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#cce49e" }}
    >
      <Navbar language={language} setLanguage={setLanguage} />

      <main className="grow py-16 px-6" style={{ backgroundColor: "#ffffff" }}>
        <div className="container mx-auto max-w-7xl">
          {/* Header with Back Button */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate("/projects")}
              className="mr-4 px-4 py-2 rounded font-light transition duration-200"
              style={{ backgroundColor: "#e5e7eb", color: "#297fb2" }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#d1d5db")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#e5e7eb")}
            >
              ← ថយក្រោយ
            </button>
            <h1 className="text-4xl font-light" style={{ color: "#297fb2" }}>
              ព័ត៌មានលម្អិតអតិថិជន
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Client Details */}
            <div className="lg:col-span-2">
              <div
                className="bg-white rounded-lg shadow-lg p-8"
                style={{ border: "1px solid #e5e7eb" }}
              >
                {/* Edit/Save Buttons */}
                <div className="flex justify-end gap-4 mb-6">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 rounded font-light transition duration-200"
                      style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
                      onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                      onMouseLeave={(e) => (e.target.style.opacity = "1")}
                    >
                      កែសម្រួល
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          setFormData({
                            productName: client.product_name,
                            country: client.country,
                            price: client.price,
                            status: client.status || "Active",
                            problems: client.problems || [],
                            targetCustomers: client.target_customers,
                            warranty: client.warranty,
                            promotion: client.promotion,
                            uniqueness: client.uniqueness,
                          });
                        }}
                        className="px-6 py-2 rounded font-light transition duration-200"
                        style={{
                          border: "1px solid #297fb2",
                          color: "#297fb2",
                        }}
                      >
                        បោះបង់
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateClient.isPending}
                        className="px-6 py-2 rounded font-light transition duration-200 disabled:opacity-50"
                        style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
                        onMouseEnter={(e) =>
                          !updateClient.isPending &&
                          (e.target.style.opacity = "0.9")
                        }
                        onMouseLeave={(e) =>
                          !updateClient.isPending &&
                          (e.target.style.opacity = "1")
                        }
                      >
                        {updateClient.isPending
                          ? "កំពុងរក្សាទុក..."
                          : "រក្សាទុក"}
                      </button>
                    </>
                  )}
                </div>

                {/* Client Information */}
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      ឈ្មោះផលិតផល *
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={formData.productName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              productName: e.target.value,
                            });
                            if (errors.productName) {
                              setErrors({ ...errors, productName: "" });
                            }
                          }}
                          className="w-full p-3 border rounded font-light"
                          style={{
                            borderColor: errors.productName
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                        {errors.productName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.productName}
                          </p>
                        )}
                      </>
                    ) : (
                      <p
                        className="text-lg font-light"
                        style={{ color: "#1f2937" }}
                      >
                        {client.product_name}
                      </p>
                    )}
                  </div>

                  {/* Country and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block font-light mb-2 text-sm"
                        style={{ color: "#297fb2" }}
                      >
                        ប្រទេស *
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                country: e.target.value,
                              });
                              if (errors.country) {
                                setErrors({ ...errors, country: "" });
                              }
                            }}
                            className="w-full p-3 border rounded font-light"
                            style={{
                              borderColor: errors.country
                                ? "#ef4444"
                                : "#e5e7eb",
                            }}
                          />
                          {errors.country && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.country}
                            </p>
                          )}
                        </>
                      ) : (
                        <p
                          className="text-lg font-light"
                          style={{ color: "#1f2937" }}
                        >
                          {client.country}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="block font-light mb-2 text-sm"
                        style={{ color: "#297fb2" }}
                      >
                        តម្លៃ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full p-3 border rounded font-light"
                          style={{ borderColor: "#e5e7eb" }}
                        />
                      ) : (
                        <p
                          className="text-lg font-light"
                          style={{ color: "#1f2937" }}
                        >
                          {client.price}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      ស្ថានភាព
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full p-3 border rounded font-light"
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        <option value="Active">Active</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                    ) : (
                      <span
                        className="inline-block px-4 py-2 rounded-full text-sm font-light"
                        style={{
                          backgroundColor: "#cce49e",
                          color: "#297fb2",
                        }}
                      >
                        {client.status || "Active"}
                      </span>
                    )}
                  </div>

                  {/* Target Customers */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      អតិថិជនគោលដៅ *
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          value={formData.targetCustomers}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              targetCustomers: e.target.value,
                            });
                            if (errors.targetCustomers) {
                              setErrors({ ...errors, targetCustomers: "" });
                            }
                          }}
                          className="w-full p-3 border rounded font-light h-24"
                          style={{
                            borderColor: errors.targetCustomers
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                        {errors.targetCustomers && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.targetCustomers}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-light" style={{ color: "#6b7280" }}>
                        {client.target_customers}
                      </p>
                    )}
                  </div>

                  {/* Problems */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      បញ្ហាដែលដោះស្រាយ *
                    </label>
                    {isEditing ? (
                      <>
                        <div className="space-y-2">
                          {formData.problems.map((problem, idx) => (
                            <input
                              key={idx}
                              type="text"
                              value={problem}
                              onChange={(e) => {
                                const newProblems = [...formData.problems];
                                newProblems[idx] = e.target.value;
                                setFormData({
                                  ...formData,
                                  problems: newProblems,
                                });
                                if (errors.problems) {
                                  setErrors({ ...errors, problems: "" });
                                }
                              }}
                              className="w-full p-3 border rounded font-light"
                              style={{
                                borderColor: errors.problems
                                  ? "#ef4444"
                                  : "#e5e7eb",
                              }}
                              placeholder={`បញ្ហាទី ${idx + 1}`}
                            />
                          ))}
                        </div>
                        {errors.problems && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.problems}
                          </p>
                        )}
                      </>
                    ) : (
                      <ul
                        className="list-disc list-inside font-light"
                        style={{ color: "#6b7280" }}
                      >
                        {client.problems?.map((problem, idx) => (
                          <li key={idx}>{problem}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Warranty */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      ការធានា *
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          value={formData.warranty}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              warranty: e.target.value,
                            });
                            if (errors.warranty) {
                              setErrors({ ...errors, warranty: "" });
                            }
                          }}
                          className="w-full p-3 border rounded font-light h-20"
                          style={{
                            borderColor: errors.warranty
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                        {errors.warranty && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.warranty}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-light" style={{ color: "#6b7280" }}>
                        {client.warranty}
                      </p>
                    )}
                  </div>

                  {/* Promotion */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      ប្រម៉ូសិន *
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          value={formData.promotion}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              promotion: e.target.value,
                            });
                            if (errors.promotion) {
                              setErrors({ ...errors, promotion: "" });
                            }
                          }}
                          className="w-full p-3 border rounded font-light h-20"
                          style={{
                            borderColor: errors.promotion
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                        {errors.promotion && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.promotion}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-light" style={{ color: "#6b7280" }}>
                        {client.promotion}
                      </p>
                    )}
                  </div>

                  {/* Uniqueness */}
                  <div>
                    <label
                      className="block font-light mb-2 text-sm"
                      style={{ color: "#297fb2" }}
                    >
                      ភាពខុសគ្នា *
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          value={formData.uniqueness}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              uniqueness: e.target.value,
                            });
                            if (errors.uniqueness) {
                              setErrors({ ...errors, uniqueness: "" });
                            }
                          }}
                          className="w-full p-3 border rounded font-light h-24"
                          style={{
                            borderColor: errors.uniqueness
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                        {errors.uniqueness && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.uniqueness}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="font-light" style={{ color: "#6b7280" }}>
                        {client.uniqueness}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <div
                  className="mt-8 pt-6 border-t"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <button
                    onClick={handleDelete}
                    disabled={deleteClient.isPending}
                    className="px-6 py-2 rounded font-light transition duration-200 disabled:opacity-50"
                    style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                    onMouseEnter={(e) =>
                      !deleteClient.isPending &&
                      (e.target.style.opacity = "0.9")
                    }
                    onMouseLeave={(e) =>
                      !deleteClient.isPending && (e.target.style.opacity = "1")
                    }
                  >
                    {deleteClient.isPending ? "កំពុងលុប..." : "លុបអតិថិជន"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Actions */}
            <div className="lg:col-span-1">
              <div
                className="bg-white rounded-lg shadow-lg p-6"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <h2
                  className="text-2xl font-light mb-6"
                  style={{ color: "#297fb2" }}
                >
                  សកម្មភាព
                </h2>

                <div className="space-y-4">
                  {/* Create/Show/Redo Immersion */}
                  {/* Immersion Group */}
                  <div className="p-4 border border-gray-200 rounded-xl bg-white space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#297fb2]">
                        Customer Avatar Immersion
                      </span>
                      <div className="h-px flex-1 bg-blue-50"></div>
                    </div>

                    {!client.immersion_data ? (
                      <button
                        onClick={handleCreateImmersion}
                        disabled={isGeneratingImmersion}
                        className="w-full p-4 rounded-lg font-light transition duration-200 flex items-center justify-between disabled:opacity-50"
                        style={{
                          backgroundColor: "#f0f9ff",
                          border: "1px solid #297fb2",
                        }}
                        onMouseEnter={(e) =>
                          !isGeneratingImmersion &&
                          (e.target.style.backgroundColor = "#e0f2fe")
                        }
                        onMouseLeave={(e) =>
                          !isGeneratingImmersion &&
                          (e.target.style.backgroundColor = "#f0f9ff")
                        }
                      >
                        <div className="text-left">
                          <div
                            className="font-medium"
                            style={{ color: "#297fb2" }}
                          >
                            {isGeneratingImmersion
                              ? "កំពុងបង្កើត..."
                              : "បង្កើត Immersion"}
                          </div>
                          <div className="text-sm" style={{ color: "#6b7280" }}>
                            បង្កើតបទពិសោធន៍អន្តរកម្ម
                          </div>
                        </div>
                        <div className="text-2xl" style={{ color: "#297fb2" }}>
                          {isGeneratingImmersion ? "⏳" : "🎯"}
                        </div>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={handleShowImmersion}
                            className="flex-1 p-4 rounded-lg font-light transition duration-200 flex items-center justify-between"
                            style={{
                              backgroundColor: "#f0f9ff",
                              border: "1px solid #297fb2",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = "#e0f2fe")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = "#f0f9ff")
                            }
                          >
                            <div className="text-left">
                              <div
                                className="font-medium"
                                style={{ color: "#297fb2" }}
                              >
                                បង្ហាញ
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#6b7280" }}
                              >
                                មើល Immersion
                              </div>
                            </div>
                            <div
                              className="text-2xl"
                              style={{ color: "#297fb2" }}
                            >
                              👁️
                            </div>
                          </button>
                          <button
                            onClick={handleCreateImmersion}
                            disabled={isGeneratingImmersion}
                            className="flex-1 p-4 rounded-lg font-light transition duration-200 flex items-center justify-between disabled:opacity-50"
                            style={{
                              backgroundColor: "#fff7ed",
                              border: "1px solid #f97316",
                            }}
                            onMouseEnter={(e) =>
                              !isGeneratingImmersion &&
                              (e.target.style.backgroundColor = "#ffedd5")
                            }
                            onMouseLeave={(e) =>
                              !isGeneratingImmersion &&
                              (e.target.style.backgroundColor = "#fff7ed")
                            }
                          >
                            <div className="text-left">
                              <div
                                className="font-medium"
                                style={{ color: "#f97316" }}
                              >
                                {isGeneratingImmersion
                                  ? "កំពុងបង្កើត..."
                                  : "ធ្វើឡើងវិញ"}
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#6b7280" }}
                              >
                                បង្កើតជាថ្មី
                              </div>
                            </div>
                            <div
                              className="text-2xl"
                              style={{ color: "#f97316" }}
                            >
                              {isGeneratingImmersion ? "⏳" : "🔄"}
                            </div>
                          </button>
                        </div>
                        <button
                          onClick={handleDeleteImmersion}
                          className="w-full py-2 text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition duration-200 flex items-center justify-center gap-2"
                        >
                          <span>🗑️ លុបទិន្នន័យ Immersion</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Other Actions Header */}
                  <div className="flex items-center gap-2 mt-2 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Other Actions
                    </span>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>

                  {/* Create Content */}
                  <button
                    onClick={() => navigate(`/client/${id}/content`)}
                    className="w-full p-4 rounded-lg font-light transition duration-200 flex items-center justify-between"
                    style={{
                      backgroundColor: "#f0fdf4",
                      border: "1px solid #059669",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#dcfce7")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f0fdf4")
                    }
                  >
                    <div className="text-left">
                      <div className="font-medium" style={{ color: "#059669" }}>
                        បង្កើតមាតិកា
                      </div>
                      <div className="text-sm" style={{ color: "#6b7280" }}>
                        បង្កើតមាតិកាទីផ្សារ
                      </div>
                    </div>
                    <div className="text-2xl" style={{ color: "#059669" }}>
                      ✍️
                    </div>
                  </button>

                  {/* Create Branding */}
                  <button
                    onClick={() => navigate(`/client/${id}/branding`)}
                    className="w-full p-4 rounded-lg font-light transition duration-200 flex items-center justify-between"
                    style={{
                      backgroundColor: "#fae8ff",
                      border: "1px solid #a855f7",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f3e8ff")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#fae8ff")
                    }
                  >
                    <div className="text-left">
                      <div className="font-medium" style={{ color: "#a855f7" }}>
                        បង្កើតម៉ាកយីហោ
                      </div>
                      <div className="text-sm" style={{ color: "#6b7280" }}>
                        រចនាអត្តសញ្ញាណម៉ាក
                      </div>
                    </div>
                    <div className="text-2xl" style={{ color: "#a855f7" }}>
                      🎨
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDetail;
