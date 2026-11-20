import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRuntimeConfig } from './runtime-config';
import { UnderConstruction } from './UnderConstruction';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('missing #root element');

/**
 * The page renders at once, and the version arrives with `/config.json`. A
 * page that cannot read it still says what it is, with no version.
 */
function App() {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    loadRuntimeConfig()
      .then((config) => setVersion(config.version))
      .catch((error: unknown) => console.error(error));
  }, []);
  return <UnderConstruction version={version} />;
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
