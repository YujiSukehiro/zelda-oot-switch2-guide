import { Compass } from 'lucide-react';

export interface MapLegendProps {
  defaultOpen?: boolean;
  isZoraThawed?: boolean;
}

export function MapLegend({ defaultOpen = false, isZoraThawed = false }: MapLegendProps) {
  return (
    <details className="map-legend" data-testid="map-legend" open={defaultOpen || undefined}>
      <summary className="map-legend__summary" aria-label="Toggle Hyrule map legend">
        <Compass size={14} aria-hidden="true" />
        <span>Map Legend</span>
      </summary>

      <div className="map-legend__body">
        <div>
          <p className="map-legend__section-title">Pins &amp; Status</p>
          <div className="map-legend__grid">
            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="var(--map-node-fill)"
                  stroke="var(--biome-field)"
                  strokeWidth="1.8"
                />
              </svg>
              <span>Overworld (21)</span>
            </div>

            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <polygon
                  points="5.5,2 10.5,2 14,5.5 14,10.5 10.5,14 5.5,14 2,10.5 2,5.5"
                  fill="var(--map-node-fill)"
                  stroke="var(--biome-dungeon)"
                  strokeWidth="1.6"
                />
              </svg>
              <span>Dungeon (9)</span>
            </div>

            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <polygon
                  points="8,1.8 14.2,8 8,14.2 1.8,8"
                  fill="var(--map-node-fill)"
                  stroke="var(--biome-water)"
                  strokeWidth="1.6"
                />
              </svg>
              <span>Mini-Dungeon (3)</span>
            </div>

            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <polygon
                  points="8,1.4 9.9,6.1 14.6,8 9.9,9.9 8,14.6 6.1,9.9 1.4,8 6.1,6.1"
                  fill="var(--map-node-fill)"
                  stroke="var(--biome-special)"
                  strokeWidth="1.4"
                />
              </svg>
              <span>Fallen Foes Hub</span>
            </div>

            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect
                  x="1"
                  y="3"
                  width="14"
                  height="10"
                  rx="5"
                  fill="var(--map-ready-pill-bg)"
                  stroke="var(--map-ready-pill-border)"
                  strokeWidth="1.4"
                />
              </svg>
              <span>+N Ready Now</span>
            </div>

            <div className="map-legend__item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="var(--color-triforce)"
                  stroke="var(--bg-canvas)"
                  strokeWidth="1.2"
                />
                <path
                  d="M5.4 8.2 L7.2 10 L10.8 6"
                  fill="none"
                  stroke="var(--text-inverse)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>100% Triforce</span>
            </div>
          </div>
        </div>

        <div>
          <p className="map-legend__section-title">Routes &amp; Switch 2 Shortcuts</p>
          <div className="map-legend__grid">
            <div className="map-legend__item">
              <span className="map-legend__swatch-line map-legend__swatch-line--road" aria-hidden="true" />
              <span>Road / Bridge</span>
            </div>

            <div className="map-legend__item">
              <span className="map-legend__swatch-line map-legend__swatch-line--forest" aria-hidden="true" />
              <span>Lost Woods Warp</span>
            </div>

            <div className="map-legend__item">
              <span className="map-legend__swatch-line map-legend__swatch-line--water" aria-hidden="true" />
              <span>
                Zora Dive {isZoraThawed ? '(Thawed!)' : '(Thaws Post-Water)'}
              </span>
            </div>

            <div className="map-legend__item">
              <span className="map-legend__swatch-line map-legend__swatch-line--tether" aria-hidden="true" />
              <span>Dungeon Tether</span>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
