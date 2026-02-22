import { useState } from "react";
import { Link } from "react-router-dom";

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

  //  Delete later
  console.log("Testing...");


  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src="/src/assets/doggy2.png"
          alt="Dogtor logo"
          style={{ maxWidth: "150px" }}
        />
        <h1>Pre-Screening Questionnaire</h1>
        <p style={{ color: "#555" }}>
          This helps us better understand your child’s health.
        </p>
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

      <label>Height:</label>
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

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Link to="/bodyvisual">
          <button style={buttonStyle}>Continue</button>
        </Link>
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