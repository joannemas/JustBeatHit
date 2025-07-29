import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

type TutorialOptions = {
  onStart?: () => void;
  onEnd?: () => void;
};

export const useTutorial = (options: TutorialOptions = {}) => {
  const driverRef = useRef<any>(null);

  useEffect(() => {
    driverRef.current = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminé ✓',
      progressText: 'Étape {{current}} sur {{total}}',
      popoverClass: 'karakaku-tutorial-popover',
      animate: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 4,
      stageRadius: 10,
      popoverOffset: 10,
      onDestroyed: () => {
        localStorage.setItem('karakaku-tutorial-seen', 'true');
        if (options.onEnd) options.onEnd();
      }
    });
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
    // eslint-disable-next-line
  }, []);

  const startTutorial = () => {
    if (!driverRef.current) return;
    if (options.onStart) options.onStart();
    try {
      driverRef.current.destroy();
    } catch (e) { }
    if (options.onStart) options.onStart();

    const steps = [
      {
        element: '[data-tutorial="input-field"]',
        popover: {
          title: '🎵 Zone de Saisie',
          description: 'Écrivez ici les paroles de la chanson en suivant le rythme. Tapez exactement ce qui est affiché pour marquer des points! Pas besoin de taper les espaces ni les caractères spéciaux.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '[data-tutorial="timer-info"]',
        popover: {
          title: '⏳ Compte à rebours',
          description: "Ce compteur indique le temps restant pour compléter la ligne en cours. Attention, si le temps expire, vous perdez des points !",
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '[data-tutorial="escape-info"]',
        popover: {
          title: '⏸️ Menu de Pause',
          description: 'Appuyez sur la touche Échap (Escape) à tout moment pour mettre en pause et accéder aux options du jeu.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '[data-tutorial="score-display"]',
        popover: {
          title: '🏆 Affichage du Score',
          description: "Votre score s'affiche ici en temps réel. Plus vous tapez vite et sans erreur, plus votre multiplicateur augmente!",
          side: 'left',
          align: 'center'
        }
      }
    ];
    driverRef.current.setSteps(steps);
    driverRef.current.drive();
  };

  const hasSeenTutorial = () => {
    return localStorage.getItem('karakaku-tutorial-seen') === 'true';
  };

  const resetTutorial = () => {
    localStorage.removeItem('karakaku-tutorial-seen');
  };

  return {
    startTutorial,
    hasSeenTutorial,
    resetTutorial,
    driver: driverRef.current
  };
};