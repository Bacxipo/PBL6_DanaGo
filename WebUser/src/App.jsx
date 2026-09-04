import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import DetailPlace from './pages/DetailPlace';
import Personal from './pages/Personal';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore/place/:id" element={<DetailPlace />} />
          <Route path="personal" element={<Personal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
