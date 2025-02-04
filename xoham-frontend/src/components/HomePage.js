import React, { useState } from "react";
import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";

function Home() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event) => {
    const { clientX, clientY } = event;
    const xRotation = (clientY / window.innerHeight) * 30 - 15;
    const yRotation = (clientX / window.innerWidth) * 30 - 15;
    setRotation({ x: xRotation, y: yRotation });
  };

  const styles = {
    homeContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      position: "relative",
      overflow: "hidden",
    },
    splineBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -2, // Keeps it behind other elements
    },
    header: {
      position: "absolute",
      top: "20px",
      left: "20px",
      display: "flex",
      alignItems: "center",
      zIndex: 1,
    },
    title: {
      color: "blue",
      fontSize: "24px",
      fontWeight: "bold",
      marginRight: "10px",
    },
    logo: {
      width: "120px",
      height: "auto",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.9)", // Semi-transparent
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      zIndex: 1, // Ensures it's above the background
    },
    button: {
      padding: "16px 32px",
      fontSize: "20px",
      cursor: "pointer",
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#007BFF",
      color: "white",
      fontWeight: "bold",
      width: "250px",
      opacity: "0.85", // Slightly translucent
      transition: "all 0.3s ease-in-out",
    },
    buttonHover: {
      transform: "scale(1.1)", // Enlarge on hover
      opacity: "1",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)", // Adds a hover shadow effect
    },
    link: {
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.homeContainer} onMouseMove={handleMouseMove}>
      {/* Spline Background (Now Interactive) */}
      <Spline
        scene="https://prod.spline.design/V09Kku2ZzMKZml2Q/scene.splinecode"
        style={styles.splineBackground}
      >
        {/* Apply rotation and translation to offset the 3D object to the left */}
        <div
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateX(-200px)`,
            transition: "transform 0.2s ease-out",
          }}
        />
      </Spline>

      {/* Header with Logo */}
      <div style={styles.header}>
        <h1 style={styles.title}>MEDISECURE</h1>
        <img
          src="https://www.creativefabrica.com/wp-content/uploads/2021/01/29/Valentine-Kawaii-Stethoscope-Vector-Graphics-8184507-1.png"
          alt="Logo"
          style={styles.logo}
        />
      </div>

      {/* Centered Card with Options */}
      <div style={styles.card}>
        {["Hospital", "Patient", "Insurance"].map((option, index) => (
          <Link to={`/${option.toLowerCase()}`} style={styles.link} key={option}>
            <button
              style={{
                ...styles.button,
                ...(rotation.x !== 0 || rotation.y !== 0 ? styles.buttonHover : {}),
              }}
            >
              {option}
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
