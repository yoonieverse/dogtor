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
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Get prescreening data from location state or sessionStorage
  const getPrescreeningData = () => {
    // First try location state (if navigated directly from prescreening)
    if (location.state?.prescreeningData) {
      // Also save to sessionStorage for persistence
      sessionStorage.setItem('prescreeningData', JSON.stringify(location.state.prescreeningData));
      return location.state.prescreeningData;
    }
    // Fallback to sessionStorage (if navigated from body visual)
    try {
      const stored = sessionStorage.getItem('prescreeningData');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  };

  const prescreeningData = getPrescreeningData();

  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  const hasStartedConversation = useRef(false);

  // Get body parts from sessionStorage
  const getBodyParts = () => {
    try {
      const stored = sessionStorage.getItem('selectedBodyParts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  // Build patient context from prescreening and body visual data
  const getPatientContext = () => {
    const bodyParts = getBodyParts();
    const context = {
      prescreening: prescreeningData || {},
      bodyParts: bodyParts,
    };
    // Debug logging
    console.log('Patient context:', context);
    console.log('Prescreening data:', prescreeningData);
    console.log('Body parts:', bodyParts);
    return context;
  };

  // Text-to-Speech
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Start conversation with greeting
  useEffect(() => {
    if (!hasStartedConversation.current && messages.length === 0) {
      hasStartedConversation.current = true;
      
      // Personalize greeting based on body parts selected
      const bodyParts = getBodyParts();
      let greeting = "Hi! I'm Dogtor 🐶. ";
      
      if (bodyParts && bodyParts.length > 0) {
        const bodyPartLabels = {
          head: 'head', chest: 'chest', tummy: 'tummy',
          'left-arm': 'left arm', 'right-arm': 'right arm',
          'left-hand': 'left hand', 'right-hand': 'right hand',
          'left-leg': 'left leg', 'right-leg': 'right leg',
          'left-foot': 'left foot', 'right-foot': 'right foot',
          eyes: 'eyes', ears: 'ears', nose: 'nose', mouth: 'mouth',
        };
        const partsList = bodyParts.map(p => bodyPartLabels[p] || p).join(' and ');
        greeting += `I see you mentioned something about your ${partsList}. Tell me more about what's going on!`;
      } else {
        greeting += "What brings you here today?";
      }
      
      setMessages([{ sender: "dog", text: greeting }]);
      setTranscript([`Doggy: ${greeting}`]);
      speak(greeting);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Send message and get AI response
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const textToSend = input.trim();
    setInput(""); // clear text box immediately

    // Ignore any late speech results so they don't repopulate the input
    ignoreResultsRef.current = true;
    if (isListening) {
      stopListening();
    }

    // Add user message to chat
    const userMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setTranscript((prev) => [...prev, `User: ${textToSend}`]);

    setIsLoading(true);

    try {
      console.log("Sending message to API:", textToSend);
      // Call API to get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages, // Send conversation history for context
          patientContext: getPatientContext(), // Send patient data from prescreening and body visual
        }),
      });
      
      console.log("Response status:", response.status, response.statusText);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        let errMsg = `Server error (${response.status})`;
        try {
          // Clone the response so we can read it multiple times if needed
          const responseClone = response.clone();
          const errData = await responseClone.json();
          console.error("Backend error response:", errData);
          if (errData && errData.error) {
            errMsg = errData.error;
          } else if (errData && typeof errData === 'string') {
            errMsg = errData;
          }
        } catch (parseError) {
          console.error("Failed to parse error response as JSON:", parseError);
          try {
            const text = await response.text();
            console.error("Response text:", text);
            if (text) {
              errMsg = `Server error (${response.status}): ${text}`;
            }
          } catch (textError) {
            console.error("Failed to read response text:", textError);
            errMsg = `Server error (${response.status}): Unable to read error message`;
          }
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      console.log("Backend response data:", data);
      
      if (!data || !data.reply) {
        throw new Error(data?.error || "Invalid response format from server");
      }
      
      const aiResponse = data.reply;

      // Add AI response to chat
      const dogMessage = { sender: "dog", text: aiResponse };
      setMessages((prev) => [...prev, dogMessage]);
      setTranscript((prev) => [...prev, `Doggy: ${aiResponse}`]);
      speak(aiResponse);
    } catch (error) {
      console.error("Error calling API:", error);
      console.error("Error message:", error.message);
      let errorMessage = "Sorry, I'm having trouble connecting. Please try again.";
      if (error.message) {
        if (error.message === "Failed to fetch") {
          errorMessage = "Could not reach the server. Make sure the backend is running on port 5000 (run 'npm start' in dogtor/backend folder).";
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMessage = "403 Forbidden: Cannot connect to backend. Please:\n1. Open a terminal and run: cd dogtor/backend && npm start\n2. Wait for 'Server running on port 5000'\n3. Test: Open http://localhost:5000 in browser (should show 'Backend is running!')\n4. Restart frontend dev server if you changed vite.config.ts\n5. Try again";
        } else if (error.message.includes("API key") || error.message.includes("Invalid") || error.message.includes("missing")) {
          errorMessage = "Server configuration issue: " + error.message + ". Check backend .env and restart.";
        } else {
          // Always show the actual error message from backend
          errorMessage = error.message;
        }
      }
      setMessages((prev) => [...prev, { sender: "dog", text: errorMessage }]);
      setTranscript((prev) => [...prev, `Doggy: ${errorMessage}`]);
    } finally {
      setIsLoading(false);
    }
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

      <button onClick={sendMessage} disabled={isLoading} style={{ marginLeft: "10px" }}>
        {isLoading ? "Sending..." : "Send"}
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