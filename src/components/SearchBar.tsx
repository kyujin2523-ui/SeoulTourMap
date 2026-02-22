import React, { useState } from "react";

const CATEGORIES = ["", "history", "food", "nature", "shopping", "culture", "entertainment"];

interface Props {
  onSearch: (query: string, category: string, location: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), category, location.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        style={styles.input}
        type="text"
        placeholder="Search Seoul attractions..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={loading}
      />
      <select
        style={styles.select}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={loading}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c ? c.charAt(0).toUpperCase() + c.slice(1) : "All categories"}
          </option>
        ))}
      </select>
      <input
        style={styles.input}
        type="text"
        placeholder="Neighborhood (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={loading}
      />
      <button style={styles.button} type="submit" disabled={loading || !query.trim()}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    padding: "16px",
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
  },
  input: {
    flex: 1,
    minWidth: "180px",
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  select: {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    background: "#fff",
  },
  button: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    background: "#e63946",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
