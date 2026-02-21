import { useState } from 'react';
import { Link } from 'react-router-dom';

function Record() {
  const [logoError, setLogoError] = useState(false);

  return (
    <div>
      <h1>Record</h1>
      <Link to="/result">
        <button> Next </button>
      </Link>
    </div>
  );
}

export default Record;
