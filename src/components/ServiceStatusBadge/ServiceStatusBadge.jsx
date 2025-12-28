import React from "react";
import "./ServiceStatusBadge.scss";

const ServiceStatusBadge = ({ status, dropRate, showDropRate = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "stable":
        return {
          label: "Ổn định",
          className: "status-stable",
          icon: "✓"
        };
      case "dropping":
        return {
          label: "Tuột nhiều",
          className: "status-dropping",
          icon: "⚠"
        };
      case "slow":
        return {
          label: "Chậm",
          className: "status-slow",
          icon: "⏱"
        };
      case "maintenance":
        return {
          label: "Bảo trì",
          className: "status-maintenance",
          icon: "🔧"
        };
      default:
        return {
          label: "Ổn định",
          className: "status-stable",
          icon: "✓"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`service-status-badge ${config.className}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-label">{config.label}</span>
      {showDropRate && dropRate > 0 && status === "dropping" && (
        <span className="drop-rate">({dropRate}% tuột)</span>
      )}
    </div>
  );
};

export default ServiceStatusBadge;

