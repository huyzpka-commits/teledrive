import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Library from './pages/Library';
import MediaPlayer from './pages/MediaPlayer';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/player/:id" element={<MediaPlayer />} />
      </Routes>
    </Layout>
  );
}

export default App;
