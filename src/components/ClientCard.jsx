import React from "react";
import { useNavigate } from "react-router-dom";

const ClientCard = ({ client }) => {
  const navigate = useNavigate();

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return { bg: "#cce49e", text: "#297fb2" };
      case "In Progress":
        return { bg: "#fef3c7", text: "#d97706" };
      case "Completed":
        return { bg: "#d1fae5", text: "#059669" };
      case "On Hold":
        return { bg: "#fee2e2", text: "#dc2626" };
      default:
        return { bg: "#e5e7eb", text: "#6b7280" };
    }
  };

  const statusColors = getStatusColor(client.status);

  return (
    <div
      onClick={() => navigate(`/client/${client.id}`)}
      className="rounded-lg overflow-hidden shadow-lg transition duration-300 hover:shadow-xl hover:scale-105 hover:cursor-pointer"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Card Header/Image */}
      <div
        className="h-48 flex items-center justify-center"
        style={{ backgroundColor: "#cce49e" }}
      >
        <div className="text-6xl" style={{ color: "#297fb2" }}>
          📋
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title and Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-light" style={{ color: "#297fb2" }}>
            {client.product_name}
          </h3>
          <span
            className="px-3 py-1 rounded-full text-xs font-light"
            style={{
              backgroundColor: statusColors.bg,
              color: statusColors.text,
            }}
          >
            {client.status || "Active"}
          </span>
        </div>

        {/* Country */}
        <p
          className="font-light mb-2 line-clamp-1"
          style={{ color: "#6b7280" }}
        >
          <strong>ប្រទេស:</strong> {client.country}
        </p>

        {/* Price */}
        <p
          className="font-light mb-2 line-clamp-1"
          style={{ color: "#6b7280" }}
        >
          <strong>តម្លៃ:</strong> {client.price}
        </p>

        {/* Target Customers */}
        <p className="font-light mb-2" style={{ color: "#6b7280" }}>
          <strong>អតិថិជនគោលដៅ:</strong>{" "}
          <p className="line-clamp-3">{client.target_customers}</p>
        </p>

        {/* Problems List */}
        {/* {client.problems && client.problems.length > 0 && (
          <div className="mt-3">
            <p className="font-light text-sm" style={{ color: "#297fb2" }}>
              បញ្ហាដែលដោះស្រាយ:
            </p>
            <ul
              className="list-disc list-inside text-sm font-light"
              style={{ color: "#6b7280" }}
            >
              {client.problems.slice(0, 3).map((problem, idx) => (
                <li key={idx}>{problem}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ClientCard;
