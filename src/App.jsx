import { useState } from 'react';
import LandingPage from './components/LandingPage';
import MissionControl from './pages/MissionControl';

function App() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <MissionControl />;
  }

  return <LandingPage onEnterApp={() => setShowApp(true)} />;
}

export default App;
