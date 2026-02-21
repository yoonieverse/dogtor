import { useState } from 'react';
import { Link } from 'react-router-dom';


function ResultsPage() {
  return (
    <div>
      <h1>Results</h1>

      <Link to="/">
        <button> Home  </button>
      </Link>
    </div>
  );
}

export default ResultsPage;
