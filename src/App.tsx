import { ALL_SECRETS, METADATA, OVERWORLD_REGIONS, DUNGEON_AND_SPECIAL_REGIONS } from './data';
import { computeGlobalProgress } from './lib/gating';
import { usePlayerProgress } from './lib/storage';

export function App() {
  const { state } = usePlayerProgress();
  const progress = computeGlobalProgress(state);

  return (
    <main style={{ padding: 'var(--space-6)', maxWidth: 960, margin: '0 auto' }}>
      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', color: 'var(--color-triforce)' }}>
          {METADATA.game.title} — {METADATA.game.edition}
        </h1>
        <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--text-secondary)' }}>
          Interactive Hyrule Map &amp; Requirement-Gated Secrets Guide ({OVERWORLD_REGIONS.length}{' '}
          Overworld Regions + {DUNGEON_AND_SPECIAL_REGIONS.length} Dungeons/Hubs ·{' '}
          {ALL_SECRETS.length} Normalized Secrets · {progress.readyNowTotal} Ready Now)
        </p>
      </header>
    </main>
  );
}

export default App;
