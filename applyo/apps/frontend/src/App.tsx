import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PollView from './pages/Pollview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/poll/:id" element={<PollView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;