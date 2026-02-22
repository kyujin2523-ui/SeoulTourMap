import React from "react";
import { TourPlace } from "../api";

const CATEGORY_COLORS: Record<string, string> = {
  history: "#6d4c41",
  food: "#e65100",
  nature: "#2e7d32",
  shopping: "#6a1b9a",
  culture: "#1565c0",
  entertainment: "#c62828",
};

interface Props {
  place: TourPlace;
}

export default function PlaceCard({ place }: Props) {
  const color = CATEGORY_COLORS[place.category] || "#555";

  return (
    <div style={styles.card}>
      <div style={{ ...styles.categoryBadge, background: color }}>
        {place.category}
      </div>
      <h3 style={styles.name}>{place.name}</h3>
      {place.address && <p style={styles.address}>{place.address}</p>}
      <p style={styles.description}>{place.description}</p>
      <div style={styles.tipsBox}>
        <strong>Tip:</strong> {place.tips}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  categoryBadge: {
    display: "inline-block",
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  name: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a1a1a",
  },
  address: {
    margin: 0,
    fontSize: "13px",
    color: "#888",
  },
  description: {
    margin: 0,
    fontSize: "14px",
    color: "#444",
    lineHeight: 1.5,
  },
  tipsBox: {
    fontSize: "13px",
    color: "#555",
    background: "#f5f5f5",
    borderRadius: "6px",
    padding: "8px 12px",
    lineHeight: 1.4,
  },
};
