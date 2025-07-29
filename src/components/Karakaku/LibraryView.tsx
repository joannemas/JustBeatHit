"use client";

import React, { useState, useEffect } from "react";
import SongList from "./SongList";
import SongDetailsPanel from "./SongDetailsPanel";
import styles from "@/stylesheets/libraryView.module.scss";
import { LocalSong } from "@/lib/dexie/types";
import { Database } from "~/database.types";

// Hook mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}

export default function LibraryView({ gameId }: { gameId?: string }) {
  const [selectedSong, setSelectedSong] = useState<Database["public"]["Tables"]["song"]["Row"] | LocalSong | null>(null);
  const [mortSubite, setMortSubite] = useState(false);
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);

  // On reset l'affichage du détail si on repasse en desktop
  useEffect(() => {
    if (!isMobile && showDetails) {
      setShowDetails(false);
    }
  }, [isMobile, showDetails]);

  // Lorsqu'on sélectionne une chanson
  const handleSelectSong = (song: Database["public"]["Tables"]["song"]["Row"] | LocalSong) => {
    setSelectedSong(song);
    if (isMobile) {
      setShowDetails(true); // En mobile, afficher le détail au clic
    } else {
      setShowDetails(true); // En desktop aussi maintenant, afficher le détail au clic
    }
  };

  // Pour la sélection automatique en desktop uniquement
  const handleAutoSelectSong = (song: Database["public"]["Tables"]["song"]["Row"] | LocalSong) => {
    if (!isMobile) {
      setSelectedSong(song);
      // Ne pas afficher automatiquement le détail, juste sélectionner
    }
  };

  // Fermer le détail
  const handleCloseDetails = () => {
    setShowDetails(false);
    // On garde selectedSong pour le desktop, on ne la clear pas
  };

  if (isMobile) {
    return (
      <div className={styles.mobileWrapper}>
        {/* 1. Affiche la liste si pas de détail ouvert */}
        {!showDetails && (
          <>
            <h1 className={styles.title}>BIBLIOTHÈQUE</h1>
            <SongList 
              gameId={gameId} 
              onSelectSong={handleSelectSong}
              onAutoSelectSong={handleAutoSelectSong}
              isMobile={isMobile}
            />
          </>
        )}
        {/* 2. Affiche le détail seulement si showDetails ET selectedSong */}
        {showDetails && selectedSong && (
          <div className={styles.detailsPanelMobile} style={{ position: "relative" }}>
            <button
              onClick={handleCloseDetails}
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 10,
                background: "rgba(0,0,0,0.5)",
                border: "none",
                borderRadius: "50%",
                width: 38,
                height: 38,
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Fermer"
            >
              ✕
            </button>
            <SongDetailsPanel
              gameId={gameId}
              song={selectedSong}
              mortSubite={mortSubite}
              setMortSubite={setMortSubite}
            />
          </div>
        )}
      </div>
    );
  }

  // Desktop: affichage modifié
  return (
  <div className={styles.mainRow}>
    <div className={styles.leftColumn}>
      <h1 className={styles.title}>BIBLIOTHÈQUE</h1>
      <SongList 
        gameId={gameId} 
        onSelectSong={handleSelectSong}
        onAutoSelectSong={handleAutoSelectSong}
        isMobile={isMobile}
      />
    </div>
    <div className={styles.rightColumn}>
      {selectedSong && (
        <div style={{ position: "relative" }}>
          {/* Si tu veux que le bouton fermer existe aussi sur desktop */}
          {/* <button ...>✕</button> */}
          <SongDetailsPanel
            gameId={gameId}
            song={selectedSong}
            mortSubite={mortSubite}
            setMortSubite={setMortSubite}
          />
        </div>
      )}
    </div>
  </div>
);
}