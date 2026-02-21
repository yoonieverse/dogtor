import type { ComponentType, FC } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import Prescreen from './pages/PrescreeningPage';
import Result from './pages/ResultsPage';

const App: FC = () => {
  const HomeComponent = Home as ComponentType;
  const PrescreenComponent = Prescreen as ComponentType;
  const ResultComponent = Result as ComponentType;

  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomeComponent />} />
        <Route path='/prescreen' element={<PrescreenComponent />} />
        <Route path='/result' element={<ResultComponent />} />
      </Routes>
    </Router>
  );
};

export default App;