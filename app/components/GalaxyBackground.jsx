"use client";

import { useEffect, useState } from "react";

export default function GalaxyBackground() {
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);

  useEffect(() => {
    const starArray = Array.from({ length: window.innerWidth > 1200 ? 120 : 60 }).map(() => ({
      top: `${Math.random() * 300}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
    }));

    const shootingArray = Array.from({ length: 15 }).map((_, i) => ({
      top: `${Math.random() * 300}%`,
      left: `${Math.random() * 83}%`,
      animationDelay: `${i * 0.6 + Math.random() * 2}s`,
    }));

    setStars(starArray);
    setShootingStars(shootingArray);
  }, []);

  useEffect(() => {
  const handleVisibility = () => {
    const stars = document.querySelectorAll(".shooting-star, .star");
    stars.forEach((el) => {
      el.style.animationPlayState = document.hidden ? "paused" : "running";
    });
  };
  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);


  return (
    <div
      className="fixed inset-0 w-screen min-h-screen overflow-hidden -z-10"
      style={{
        background:
          "radial-gradient(circle at 30% 50%, #150032 0%, #060016 60%, #000 100%)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        animation: "galaxyShift 50s ease-in-out infinite",
      }}
    >
      {/* Stars */}
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            animationDelay: s.animationDelay,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((s, i) => (
        <div
          key={i}
          className="shooting-star"
          style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            animationDelay: s.animationDelay,
          }}
        />
      ))}

      <style jsx global>{`
        @keyframes galaxyShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .star {
          width: 2px;
          height: 2px;
          background: white;
          opacity: 0.6;
          border-radius: 50%;
          animation: twinkle 4s infinite ease-in-out alternate;
          will-change: transform, opacity;
        }

        @keyframes twinkle {
          0% {
            opacity: 0.2;
          }
          100% {
            opacity: 0.8;
          }
        }

        .shooting-star {
          width: 100px;
          height: 2px;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.8) 20%,
            rgba(160, 120, 255, 0.6) 60%,
            rgba(255, 120, 200, 0) 100%
          );
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
          opacity: 0;
          animation: diagonalShoot 3s ease-out infinite,
            shimmer 1.5s ease-in-out infinite;
        }

        @keyframes diagonalShoot {
          0% {
            transform: translate(-30px, -30px) rotate(45deg) scaleX(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          50% {
            transform: translate(150px, 150px) rotate(45deg) scaleX(0.5);
            opacity: 0.8;
          }
          80% {
            transform: translate(250px, 250px) rotate(45deg) scaleX(0.15);
            opacity: 0.3;
          }
          100% {
            transform: translate(450px, 450px) rotate(45deg) scaleX(0);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0%,
          100% {
            filter: brightness(1)
              drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
          }
          50% {
            filter: brightness(1.3)
              drop-shadow(0 0 12px rgba(255, 255, 255, 0.9));
          }
        }
      `}</style>
    </div>
  );
}
