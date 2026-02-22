import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
    </div>
  );
}

export default Record;