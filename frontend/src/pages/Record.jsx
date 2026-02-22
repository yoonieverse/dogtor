import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import { useLocation } from "react-router-dom";

function Record() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const ignoreResultsRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const location = useLocation();

  const { prescreeningData } = location.state || {};


  // Mascot Questions
  const questions = [
    "Hi! I'm Dogster. What brings you here today?",
    "How are you feeling right now?",
    "Where does it hurt?",
  ];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  const askedIndexRef = useRef(-1);

  // Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Ask next question
  useEffect(() => {
    if (questionIndex < questions.length && askedIndexRef.current !== questionIndex) {
      askedIndexRef.current = questionIndex;
      const question = questions[questionIndex];

      setMessages((prev) => [...prev, { sender: "dog", text: question }]);
      setTranscript((prev) => [...prev, `Doggy: ${question}`]);
      speak(question);
    }
  }, [questionIndex]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Send typed message
  const sendMessage = () => {
    if (!input.trim()) return;

    const textToSend = input.trim();
    setInput(""); // clear text box immediately

    // Ignore any late speech results so they don't repopulate the input
    ignoreResultsRef.current = true;
    if (isListening) {
      stopListening();
    }

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setTranscript((prev) => [...prev, `User: ${textToSend}`]);
    setQuestionIndex((prev) => prev + 1);
  };

  // Stop listening and clear timeout
  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Voice Recognition
  const startListening = () => {
    // If already listening, stop it manually
    if (isListening && recognitionRef.current) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true; // get live transcript while speaking
    recognitionRef.current.continuous = true;
    recognitionRef.current.start();

    ignoreResultsRef.current = false;
    setInput(""); // clear so live transcript fills the box
    setIsListening(true);

    // Set up silence timeout - stop listening after 5 seconds of silence
    const resetSilenceTimeout = () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 5000); // 5 seconds of silence
    };

    // Start the silence timeout
    resetSilenceTimeout();

    recognitionRef.current.onresult = (event) => {
      if (ignoreResultsRef.current) return;

      // Reset silence timeout whenever we get any result (user is speaking)
      resetSilenceTimeout();

      // Build full transcript from all results (interim + final)
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript;
        if (i < event.results.length - 1) fullText += " ";
      }

      // Show real-time transcription in the text box as the user speaks
      setInput(fullText);
    };

    recognitionRef.current.onerror = () => {
      stopListening();
    };

    recognitionRef.current.onend = () => {
      stopListening();
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