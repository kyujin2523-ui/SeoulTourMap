import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import PlaceCard from "./components/PlaceCard";
import { getTourRecommendations, TourPlace } from "./api";
import "./App.css";

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;

export default function App() {
  const [places, setPlaces] = useState<TourPlace[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(query: string, category: string, location: string) {
    setLoading(true);
    setError("");
    setPlaces([]);
    setSummary("");

    try {
      const result = await getTourRecommendations({
        query,
        category: category || undefined,
        location: location || undefined,
      });
      setPlaces(result.places);
      setSummary(result.summary);
    } catch (err) {
      setError("Failed to fetch recommendations. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Seoul Tour Map</h1>
        <p style={styles.subtitle}>AI-powered travel recommendations for Seoul</p>
      </header>

      <SearchBar onSearch={handleSearch} loading={loading} />

      <main style={styles.main}>
        {loading && <p style={styles.status}>Finding the best spots for you...</p>}

        {error && <p style={styles.error}>{error}</p>}

        {summary && !loading && (
          <div style={styles.summaryBox}>
            <p style={styles.summaryText}>{summary}</p>
          </div>
        )}

        {places.length > 0 && !loading && (
          <div style={styles.grid}>
            {places.map((place, i) => (
              <PlaceCard key={i} place={place} />
            ))}
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div style={styles.emptyState}>
            <p>Search for places, food, history, or activities in Seoul.</p>
            <p style={styles.examples}>
              Try: <em>"hidden cafes in Hongdae"</em>, <em>"traditional palaces"</em>, <em>"street food markets"</em>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "#f7f7f7",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    background: "#e63946",
    color: "#fff",
    padding: "24px 20px 20px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    opacity: 0.85,
  },
  main: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px 16px",
  },
  status: {
    textAlign: "center",
    color: "#666",
    fontSize: "15px",
  },
  error: {
    textAlign: "center",
    color: "#c62828",
    fontSize: "15px",
  },
  summaryBox: {
    background: "#fff3e0",
    borderLeft: "4px solid #e63946",
    borderRadius: "6px",
    padding: "12px 16px",
    marginBottom: "20px",
  },
  summaryText: {
    margin: 0,
    fontSize: "15px",
    color: "#333",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  emptyState: {
    textAlign: "center",
    color: "#888",
    marginTop: "60px",
    fontSize: "15px",
    lineHeight: 2,
  },
  examples: {
    fontSize: "14px",
    color: "#aaa",
  },
};
