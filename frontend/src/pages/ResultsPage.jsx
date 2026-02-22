import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { jsPDF } from "jspdf";

function ResultsPage() {
  const location = useLocation();
  const transcript = location.state?.transcript || [];

  useEffect(() => {
    if (transcript.length > 0) {
      generatePDF();
    }
  }, []);

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

      // Add new page if needed
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    });

    doc.save("conversation_transcript.pdf");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Conversation Transcript 📝</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          whiteSpace: "pre-wrap",
        }}
      >
        {transcript.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}

export default ResultsPage;