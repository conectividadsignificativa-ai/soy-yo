import { HashRouter, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/stats" element={<Dashboard />} />
        {/* Fallback for sub-routes if any */}
        <Route path="*" element={<Chat />} />
      </Routes>
    </HashRouter>
  );
}
