import { useState } from 'react';
import { Link } from 'react-router-dom';

function PrescreeningPage() {
  const [logoError, setLogoError] = useState(false);

  return (

    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '24px',
      }}>
        <img src="/src/assets/doggy2.png" alt="Dogtor logo" style={{ maxWidth: '200px', height: 'auto' }} />
        <h1>PreScreening</h1>
        <Link to="/bodyvisual">
          <button> continue</button>
        </Link>
      </div>
  );
}

export default PrescreeningPage;
