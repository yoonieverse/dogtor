import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const transcript = location.state?.transcript || [];
  const [showPopup, setShowPopup] = useState(false);
  const [prescreeningData, setPrescreeningData] = useState({});
  const [bodyParts, setBodyParts] = useState([]);

  // Get prescreening data and body parts from sessionStorage
  useEffect(() => {
    try {
      const storedPrescreening = sessionStorage.getItem('prescreeningData');
      if (storedPrescreening) {
        setPrescreeningData(JSON.parse(storedPrescreening));
      }
    } catch (e) {
      console.error('Error loading prescreening data:', e);
    }

    try {
      const storedBodyParts = sessionStorage.getItem('selectedBodyParts');
      if (storedBodyParts) {
        setBodyParts(JSON.parse(storedBodyParts));
      }
    } catch (e) {
      console.error('Error loading body parts:', e);
    }
  }, []);

  const bodyPartLabels = {
    head: 'Head', chest: 'Chest', tummy: 'Tummy',
    'left-arm': 'Left Arm', 'right-arm': 'Right Arm',
    'left-hand': 'Left Hand', 'right-hand': 'Right Hand',
    'left-leg': 'Left Leg', 'right-leg': 'Right Leg',
    'left-foot': 'Left Foot', 'right-foot': 'Right Foot',
    eyes: 'Eyes', ears: 'Ears', nose: 'Nose', mouth: 'Mouth',
  };


  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Conversation Transcript", 20, 20);

    doc.setFontSize(12);

    let yPosition = 30;

    transcript.forEach((line) => {
      const splitText = doc.splitTextToSize(line, 170);
      doc.text(splitText, 20, yPosition);
      yPosition += splitText.length * 7;

      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save("conversation_transcript.pdf");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Outer border container */}
      <div
        style={{
          border: "8px solid #EBA7A7",
          padding: "4px",
          borderRadius: "8px",
          position: "relative",
          maxWidth: "800px",
          width: "100%",
        }}
      >
        {/* Inner border container */}
        <div
          style={{
            border: "8px solid #F5D6D6",
            backgroundColor: "#F8F8F8",
            padding: "40px",
            borderRadius: "4px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <style>{`
            @keyframes dog-bounce {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              25% { transform: translateY(-10px) rotate(-5deg); }
              50% { transform: translateY(-5px) rotate(0deg); }
              75% { transform: translateY(-10px) rotate(5deg); }
            }
            .dog-animated {
              animation: dog-bounce 2s ease-in-out infinite;
            }
          `}</style>

          <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Results</h1>

          {/* Dog with animation */}
          <img
            src="/src/assets/dog3.png"
            alt="Dogtor"
            className="dog-animated"
            style={{ width: "180px", height: "auto", marginBottom: "30px" }}
          />

          {/* Prescreening Results */}
          {Object.keys(prescreeningData).length > 0 && (
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #F5D6D6",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#EBA7A7", marginBottom: "15px" }}>
                Prescreening Information
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {prescreeningData.age && (
                  <div>
                    <strong>Age:</strong> {prescreeningData.age}
                  </div>
                )}
                {prescreeningData.weight && (
                  <div>
                    <strong>Weight:</strong> {prescreeningData.weight}
                  </div>
                )}
                {prescreeningData.height && (
                  <div>
                    <strong>Height:</strong> {prescreeningData.height}
                  </div>
                )}
                {prescreeningData.allergies && (
                  <div>
                    <strong>Known Allergies:</strong> {prescreeningData.allergies}
                  </div>
                )}
                {prescreeningData.chronicConditions && (
                  <div>
                    <strong>Chronic Conditions/Medications:</strong> {prescreeningData.chronicConditions}
                  </div>
                )}
                {prescreeningData.healthChanges && (
                  <div>
                    <strong>Major Health Changes:</strong> {prescreeningData.healthChanges}
                  </div>
                )}
                {prescreeningData.weightChanges && (
                  <div>
                    <strong>Weight Changes:</strong> {prescreeningData.weightChanges}
                  </div>
                )}
                {prescreeningData.medications && (
                  <div>
                    <strong>Current Medications:</strong> {prescreeningData.medications}
                  </div>
                )}
                {prescreeningData.pastMedicalHistory && (
                  <div>
                    <strong>Past Medical History:</strong> {prescreeningData.pastMedicalHistory}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Body Analysis Results */}
          {bodyParts.length > 0 && (
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #F5D6D6",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#EBA7A7", marginBottom: "15px" }}>
                Body Analysis
              </h2>
              <div>
                <strong>Selected Body Parts:</strong>{" "}
                {bodyParts.map((part, index) => (
                  <span key={part}>
                    {bodyPartLabels[part] || part}
                    {index < bodyParts.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Diagnosis Prediction */}
          {(bodyParts.length > 0 || Object.keys(prescreeningData).length > 0 || transcript.length > 0) && (
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "2px solid #EBA7A7",
                boxShadow: "0 2px 8px rgba(235, 167, 167, 0.2)",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#EBA7A7", marginBottom: "0", fontSize: "24px" }}>
                🩺 Diagnosis Prediction & Analysis
              </h2>
            </div>
          )}

          {/* Conversation Transcript Summary */}
          {transcript.length > 0 && (
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #F5D6D6",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#EBA7A7", marginBottom: "15px" }}>
                Conversation Summary
              </h2>
              <p style={{ marginBottom: "10px" }}>
                You had a conversation with Dogtor about your health concerns.
              </p>
              <button
                onClick={() => setShowPopup(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: "1px solid #EBA7A7",
                  backgroundColor: "#F5D6D6",
                  color: "#333",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                View Full Transcript
              </button>
            </div>
          )}

          {/* Home Button */}
          <div style={{ marginTop: "20px" }}>
            <img
              src="/src/assets/home.png"
              alt="Home"
              onClick={() => navigate("/")}
              width={150}
              className="home-btn-animated"
              style={{ cursor: "pointer", maxWidth: "200px", height: "auto" }}
            />
          </div>
        </div>
      </div>

      {/* Transcript Popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>Transcript</h2>
            <div
              style={{
                border: "1px solid #ccc",
                padding: "16px",
                whiteSpace: "pre-wrap",
                marginBottom: "16px",
              }}
            >
              {transcript.length > 0 ? (
                transcript.map((line, index) => (
                  <div key={index}>{line}</div>
                ))
              ) : (
                <div>No transcript available.</div>
              )}
            </div>
            <button onClick={generatePDF} style={{ marginRight: "8px" }}>
              Download PDF
            </button>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
