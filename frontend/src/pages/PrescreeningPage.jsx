import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function PrescreeningPage() {
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    allergies: "",
    chronicConditions: "",
    healthChanges: "",
    weightChanges: "",
    medications: "",
    pastMedicalHistory: "",
  });

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    const prescreeningData = {...formData};
    // Store in sessionStorage so it persists through navigation
    sessionStorage.setItem('prescreeningData', JSON.stringify(prescreeningData));
    navigate("/record", { state: { prescreeningData } });
  };

  const handleContinue = () => {
    // Save prescreening data before navigating to body visual
    sessionStorage.setItem('prescreeningData', JSON.stringify(formData));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Outer border container */}
      <div style={{
        border: '8px solid #EBA7A7', // Outer border - darker pink
        padding: '4px',
        borderRadius: '8px',
        position: 'relative',
        maxWidth: '800px',
        width: '100%',
      }}>
        {/* Inner border container */}
        <div style={{
          border: '8px solid #F5D6D6', // Inner border - lighter pink
          backgroundColor: '#F8F8F8', // Content background
          padding: '40px',
          borderRadius: '4px',
          position: 'relative',
        }}>
          {/* Prescreening image at top */}
          <div style={{ textAlign: "center", marginBottom: "30px", position: "relative", display: "inline-block", width: "100%" }}>
            {/* Dog on left side */}
            <img
              src="/src/assets/dog2.png"
              alt="Dog"
              style={{
                position: "absolute",
                left: "48px",
                top: "42%",
                transform: "translateY(-50%)",
                maxWidth: "150px",
                height: "auto",
                zIndex: 10,
              }}
            />
            <img
              src="/src/assets/prescreening.png"
              alt="Prescreening"
              style={{ maxWidth: "600px", height: "auto", marginBottom: "5px" }}
            />
          </div>

          <div
            style={{
              backgroundColor: "#f4f9ff",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "25px",
              fontSize: "14px",
            }}
          >
            ⚠️ Please do NOT include private information such as your child's
            name, social security number, home address, or insurance ID.
          </div>

          {/* Basic Info */}
          <h3>Basic Information</h3>

          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Weight (lbs or kg):</label>
          <input
            type="text"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Height (cm):</label>
          <input
            type="text"
            name="height"
            value={formData.height}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Known Allergies:</label>
          <textarea
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            style={inputStyle}
          />

          {/* Health Questions */}
          <h3>Health Questions</h3>

          <label>
            1. Does your child have any chronic conditions or take daily
            medication?
          </label>
          <textarea
            name="chronicConditions"
            value={formData.chronicConditions}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>
            2. Has there been any major changes in your child's health (illness,
            surgeries, hospital visits)?
          </label>
          <textarea
            name="healthChanges"
            value={formData.healthChanges}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>
            3. Has your child experienced any recent, unexplained weight loss or
            gain?
          </label>
          <textarea
            name="weightChanges"
            value={formData.weightChanges}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Current Medications (if any):</label>
          <textarea
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            style={inputStyle}
          />

          <label>Relevant Past Medical History:</label>
          <textarea
            name="pastMedicalHistory"
            value={formData.pastMedicalHistory}
            onChange={handleChange}
            style={inputStyle}
          />

          <style>{`
            @keyframes next-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .next-btn-animated {
              cursor: pointer;
              animation: next-pulse 2s ease-in-out infinite;
            }
            .next-btn-animated:hover {
              animation: none;
              transform: scale(1.08);
            }
          `}</style>
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Link to="/bodyvisual" onClick={handleContinue}>
              <img 
                src="/src/assets/nextbutton.png" 
                alt="Next" 
                className="next-btn-animated"
                style={{ maxWidth: '200px', height: 'auto' }} 
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginBottom: "15px",
  marginTop: "5px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#4a90e2",
  color: "white",
  cursor: "pointer",
};

export default PrescreeningPage;
