import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Welcome from '@/pages/Welcome';
import MapPage from '@/pages/MapPage';
import LevelPage from '@/pages/LevelPage';
import CharacterPage from '@/pages/CharacterPage';
import ShopPage from '@/pages/ShopPage';
import CollectionPage from '@/pages/CollectionPage';
import ParentPage from '@/pages/ParentPage';
import DuoPage from '@/pages/DuoPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/level/:id" element={<LevelPage />} />
          <Route path="/character" element={<CharacterPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/parent" element={<ParentPage />} />
          <Route path="/duo" element={<DuoPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
