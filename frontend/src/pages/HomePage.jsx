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
      padding: '20px',
    }}>
      {/* Outer border container */}
      <div style={{
        border: '8px solid #EBA7A7', // Outer border - darker pink
        padding: '4px',
        borderRadius: '8px',
        position: 'relative',
      }}>
        {/* Inner border container */}
        <div style={{
          border: '8px solid #F5D6D6', // Inner border - lighter pink
          backgroundColor: '#F8F8F8', // Content background
          padding: '40px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          position: 'relative',
          minHeight: '500px',
        }}>
          {/* Corner images */}
          {/* Bandaid - top left */}
          <img 
            src="/src/assets/bandaid.png" 
            alt="Bandaid" 
            style={{ 
              position: 'absolute',
              top: '-20px',
              left: '-20px',
              maxWidth: '180px',
              height: 'auto',
              zIndex: 10,
            }} 
          />
          
          {/* Scope - bottom right */}
          <img 
            src="/src/assets/scope.png" 
            alt="Stethoscope" 
            style={{ 
              position: 'absolute',
              bottom: '-20px',
              right: '-20px',
              maxWidth: '180px',
              height: 'auto',
              zIndex: 10,
            }} 
          />
          
          {/* Dog above title */}
          <img src="/src/assets/dog1.png" alt="Dog" style={{ maxWidth: '250px', height: 'auto' }} />
          
          {/* Title images - center */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}>
            <img src="/src/assets/title1.png" alt="Title 1" style={{ maxWidth: '400px', height: 'auto' }} />
            <img src="/src/assets/title2.png" alt="Title 2" style={{ maxWidth: '400px', height: 'auto' }} />
          </div>
          
          <style>{`
            @keyframes start-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .start-btn-animated {
              cursor: pointer;
              animation: start-pulse 2s ease-in-out infinite;
            }
            .start-btn-animated:hover {
              animation: none;
              transform: scale(1.08);
            }
          `}</style>
          <Link to="/prescreen">
            <img 
              src="/src/assets/start.png" 
              alt="Start" 
              className="start-btn-animated"
              style={{ maxWidth: '200px', height: 'auto' }} 
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
