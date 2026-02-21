import { useState } from 'react';
import { Link } from 'react-router-dom';

function BodyVisual() {
  const [logoError, setLogoError] = useState(false);

  return (
    <div>
      <h1>Body Visual</h1>
      <Link to="/record">
        <button> Next </button>
      </Link>
    </div>
  );
}

export default BodyVisual;
