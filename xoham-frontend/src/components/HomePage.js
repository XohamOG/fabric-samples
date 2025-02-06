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
      fontFamily: "Arial, sans-serif",
    },
    splineBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: -2,
    },
    header: {
      position: "absolute",
      top: "20px",
      left: "20px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      zIndex: 1,
    },
    title: {
      color: "#1E3A8A",
      fontSize: "28px",
      fontWeight: "bold",
      marginRight: "10px",
      fontFamily: "'Montserrat', sans-serif",
    },
    logo: {
      width: "120px",
      height: "auto",
    },
    instituteContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "10px",
      fontWeight: "bold",
      fontSize: "28px",
      color: "#4B5563",
      fontFamily: "'Montserrat', sans-serif",
    },
    instituteLogo: {
      width: "150px", // Adjust size as needed
      height: "auto",
    },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      padding: "40px",
      borderRadius: "12px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      zIndex: 1,
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
      opacity: "0.85",
      transition: "all 0.3s ease-in-out",
    },
    buttonHover: {
      transform: "scale(1.1)",
      opacity: "1",
      boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)",
    },
    link: {
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.homeContainer} onMouseMove={handleMouseMove}>
      {/* Spline Background */}
      <Spline
        scene="https://prod.spline.design/V09Kku2ZzMKZml2Q/scene.splinecode"
        style={styles.splineBackground}
      >
        <div
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateX(-200px)`,
            transition: "transform 0.2s ease-out",
          }}
        />
      </Spline>

      {/* Header with Original Logo */}
      <div style={styles.header}>
        <h1 style={styles.title}>MEDISECURE</h1>
        <img
          src="https://www.creativefabrica.com/wp-content/uploads/2021/01/29/Valentine-Kawaii-Stethoscope-Vector-Graphics-8184507-1.png" // Add your first logo here
          alt="Logo"
          style={styles.logo}
        />
      </div>

      {/* Institute Name with Logo */}
      <div style={styles.instituteContainer}>
        <img
          src="https://vesitrail.ves.ac.in/public/images/logo.png" // Add the second logo for the institute
          alt="Institute Logo"
          style={styles.instituteLogo}
        />
        <span>Vivekanand Education Society Institute of Technology, Mumbai</span>
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
