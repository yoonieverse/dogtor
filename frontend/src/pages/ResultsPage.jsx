import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const transcript = location.state?.transcript || [];
  const [showPopup, setShowPopup] = useState(false);

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
    <div style={{ padding: "30px" }}>
      <h1>Results</h1>

      <button onClick={() => setShowPopup(true)}>
        View transcript
      </button>

      <button onClick={() => navigate("/")}>
        Home
      </button>

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