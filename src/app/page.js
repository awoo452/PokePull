"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

const formatMetric = (value, unit) => {
  if (typeof value !== "number") {
    return "—";
  }

  return `${value}${unit}`;
};

const formatFromDeci = (value, unit) => {
  if (typeof value !== "number") {
    return "—";
  }

  return `${(value / 10).toFixed(1)}${unit}`;
};

const buildApiPath = ({ rangeOriginal }) => {
  const params = new URLSearchParams();
  params.set("persist", "false");

  if (rangeOriginal) {
    params.set("range", "original");
  }

  return `/api/pokemon?${params.toString()}`;
};

export default function Home() {
  const [pokemon, setPokemon] = useState(null);
  const [history, setHistory] = useState([]);
  const [rangeOriginal, setRangeOriginal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hintText = rangeOriginal
    ? "Persist disabled. Range: Original 151."
    : "Persist disabled. Range: All Pokemon.";

  const fetchPokemon = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(buildApiPath({ rangeOriginal }), {
        cache: "no-store",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = payload?.error || `Request failed (${response.status})`;
        throw new Error(message);
      }

      setPokemon(payload);
      const entry = {
        id: payload?.id ?? "?",
        name: payload?.name || "Unknown",
      };
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== entry.id);
        return [entry, ...filtered].slice(0, 3);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const image =
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites?.front_default ||
    null;

  const types = useMemo(
    () =>
      (pokemon?.types || [])
        .map((entry) => entry?.type?.name || entry?.name)
        .filter(Boolean),
    [pokemon]
  );

  const isRateLimited = error.includes("429");

  return (
    <div className={styles.page}>
      <main className={styles.card}>
        <header className={styles.header}>
          <p className={styles.kicker}>PokePull</p>
          <h1>One button. One random Pokemon.</h1>
          <p className={styles.subtitle}>
            One-button random Pokemon pulls from the Rails API only Pokemon App.
          </p>
        </header>

        <section className={styles.controls}>
          <div className={styles.controlsRow}>
            <button
              className={styles.cta}
              type="button"
              onClick={fetchPokemon}
              disabled={loading}
            >
              {loading ? "Fetching..." : "Fetch a Pokemon"}
            </button>
            <button
              className={
                rangeOriginal
                  ? `${styles.toggle} ${styles.toggleActive}`
                  : styles.toggle
              }
              type="button"
              aria-pressed={rangeOriginal}
              onClick={() => setRangeOriginal((prev) => !prev)}
            >
              Original 151
            </button>
          </div>
          <p className={styles.hint}>{hintText}</p>
        </section>

        <section className={styles.results}>
          {error ? (
            <div className={styles.errorCard}>
              <p className={styles.errorTitle}>Couldn’t reach the API.</p>
              <p className={styles.error}>{error}</p>
              {isRateLimited ? (
                <p className={styles.errorHint}>
                  Rate limit hit. Wait a minute and try again.
                </p>
              ) : null}
              <button
                type="button"
                className={styles.retry}
                onClick={fetchPokemon}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          ) : null}

          {loading && !pokemon ? (
            <div className={styles.skeletonCard} aria-hidden="true">
              <div className={styles.skeletonTop}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} />
              </div>
              <div className={styles.skeletonGrid}>
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonBlock} />
                <div className={styles.skeletonBlock} />
              </div>
              <div className={styles.skeletonImage} />
            </div>
          ) : null}

          {pokemon ? (
            <div className={styles.pokemonCard}>
              <div className={styles.pokemonTop}>
                <div>
                  <p className={styles.label}>Name</p>
                  <h2 className={styles.name}>{pokemon.name || "Unknown"}</h2>
                </div>
                <div className={styles.badge}>#{pokemon.id ?? "?"}</div>
              </div>

              <div className={styles.detailGrid}>
                <div>
                  <p className={styles.label}>Height</p>
                  <p className={styles.value}>
                    {formatFromDeci(pokemon.height, " m")}
                  </p>
                  <p className={styles.subvalue}>
                    {formatMetric(pokemon.height, " dm")}
                  </p>
                </div>
                <div>
                  <p className={styles.label}>Weight</p>
                  <p className={styles.value}>
                    {formatFromDeci(pokemon.weight, " kg")}
                  </p>
                  <p className={styles.subvalue}>
                    {formatMetric(pokemon.weight, " hg")}
                  </p>
                </div>
                <div>
                  <p className={styles.label}>Types</p>
                  <div className={styles.typeRow}>
                    {types.length
                      ? types.map((type) => (
                          <span key={type} className={styles.typePill}>
                            {type}
                          </span>
                        ))
                      : "—"}
                  </div>
                </div>
              </div>

              <div className={styles.sprite}>
                {image ? (
                  <img
                    src={image}
                    alt={pokemon.name || "Pokemon sprite"}
                    loading="lazy"
                  />
                ) : (
                  <p className={styles.muted}>No sprite available.</p>
                )}
              </div>
            </div>
          ) : null}

          {!pokemon && !loading && !error ? (
            <p className={styles.empty}>Tap the button to see your first pull.</p>
          ) : null}

          <div className={styles.history}>
            <p className={styles.historyLabel}>Recent pulls</p>
            <div className={styles.historyRow}>
              {history.length
                ? history.map((entry) => (
                    <div key={`${entry.id}-${entry.name}`} className={styles.historyChip}>
                      <span className={styles.historyId}>#{entry.id}</span>
                      <span className={styles.historyName}>{entry.name}</span>
                    </div>
                  ))
                : "No history yet."}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
