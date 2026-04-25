import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Chat />} />
        <Route path="/stats" element={<Dashboard />} />
        <Route path="*" element={<Chat />} />
      </Routes>
    </Router>
  );
}
