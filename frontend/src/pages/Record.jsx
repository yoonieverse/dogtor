import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

function Record() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [isListening, setIsListening] = useState(false);

  // Mascot Questions
  const questions = [
    "Hi! I'm Doggy 🐶 What brings you here today?",
    "How are you feeling right now?",
    "Is there anything specific you'd like to share?",
  ];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);

  // Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Ask next question
  useEffect(() => {
    if (questionIndex < questions.length) {
      const question = questions[questionIndex];

      setMessages((prev) => [...prev, { sender: "dog", text: question }]);
      setTranscript((prev) => [...prev, `Doggy: ${question}`]);
      speak(question);
    }
  }, [questionIndex]);

  // Send typed message
  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setTranscript((prev) => [...prev, `User: ${input}`]);

    setInput("");
    setQuestionIndex((prev) => prev + 1);
  };

  // Voice Recognition
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.start();

    setIsListening(true);

    recognitionRef.current.onresult = (event) => {
      const speechText = event.results[0][0].transcript;

      setMessages((prev) => [...prev, { sender: "user", text: speechText }]);
      setTranscript((prev) => [...prev, `User: ${speechText}`]);

      setIsListening(false);
      setQuestionIndex((prev) => prev + 1);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };
  };

  // Finish and go to results page
  const finishConversation = () => {
    navigate("/result", {
      state: { transcript },
    });
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
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Talk to Doggy 🐶</h1>

      <img
        src="/doggy.png"
        alt="Mascot"
        style={{ width: "150px", marginBottom: "20px" }}
      />

      {/* Chat Box */}
      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "10px 0",
            }}
          >
            <b>{msg.sender === "user" ? "You" : "Doggy"}:</b> {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your response..."
        style={{ padding: "8px", width: "60%" }}
      />

      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
        Send
      </button>

      <button
        onClick={startListening}
        style={{ marginLeft: "10px" }}
      >
        🎤 {isListening ? "Listening..." : "Speak"}
      </button>

      <div style={{ marginTop: "20px" }}>
        
        <button onClick={finishConversation}>
          Finish & View Results
        </button>
      </div>

      {showTranscriptPopup && (
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
          onClick={() => setShowTranscriptPopup(false)}
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
                <div>No transcript yet. Continue the conversation.</div>
              )}
            </div>
            <button onClick={generatePDF} style={{ marginRight: "8px" }}>
              Download PDF
            </button>
            <button onClick={() => setShowTranscriptPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Record;