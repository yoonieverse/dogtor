import { useState } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
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
      <img src="/src/assets/doggy1.png" alt="Dogtor logo" style={{ maxWidth: '400px', height: 'auto' }} />
      <h1>dogtor</h1>
      <Link to="/prescreen">
        <button>Start Prescreening</button>
      </Link>
    </div>
  );
}

export default HomePage;
