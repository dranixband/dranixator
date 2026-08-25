import { useEffect, useMemo, useState } from 'react';
import type { AchievementCategory, AchievementDef } from '../../achievements/types';
import { useAchievements } from '../../hooks/useAchievements';
import { useEscapeToClose } from '../../hooks/useEscapeToClose';
import { track } from '../../achievements/bus';
import { MONO, AMBER, PANEL_BG, PANEL_BORDER, PANEL_SHADOW } from '../livechat/theme';
import { TIER_COLOR } from './tokens';
import AchievementCard from './AchievementCard';
import AchievementPopover from './AchievementPopover';
import CircuitMap from './CircuitMap';
import RankBadge from './RankBadge';

type Filter = 'all' | 'unlocked' | 'locked';

const CATEGORY_LABEL: Record<AchievementCategory, string> = {
  firstSteps: '🚀 FIRST STEPS',
  mastery: '🎓 MASTERY',
  volume: '📈 VOLUME',
  paths: '🛣️ PATHS & CHIPS',
  sabotage: '💥 SABOTAGE',
  repair: '🔧 REPAIR',
  perfection: '🎯 PERFECTION',
  social: '📻 SOCIAL',
  collection: '🏆 COLLECTION',
  time: '🌙 TIME',
  absurd: '👀 ABSURD',
};

export default function AchievementsPanel() {
  const { panelOpen, closePanel, state, rank, catalog } = useAchievements();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<AchievementDef | null>(null);

  useEffect(() => {
    if (panelOpen) track({ kind: 'panel_opened' });
  }, [panelOpen]);

  useEscapeToClose(closePanel, panelOpen);

  const unlockedCount = Object.keys(state.unlocked).length;
  const total = catalog.length;
  const pct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  const cats = useMemo(
    () => Array.from(new Set(catalog.map((d) => d.category))) as AchievementCategory[],
    [catalog],
  );

  if (!panelOpen) return null;

  const show = (d: AchievementDef) => {
    const isUnlocked = state.unlocked[d.id] != null;
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  };

  const scrollToCat = (cat: AchievementCategory) => {
    document.getElementById(`ach-cat-${cat}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      onClick={closePanel}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 24, background: 'rgba(0,0,0,0.6)', overflowY: 'auto' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(760px, 100%)', fontFamily: MONO, color: '#e8f0ea', background: PANEL_BG, border: PANEL_BORDER, borderRadius: 14, boxShadow: PANEL_SHADOW, padding: 18 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: AMBER, fontSize: 18 }}>🏆 ACHIEVEMENTS</h2>
          <button onClick={closePanel} style={{ background: 'none', border: 'none', color: AMBER, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <RankBadge rank={rank.isLegend ? 'LEGEND' : rank.rank} tier={rank.tier} />
          <span style={{ fontSize: 13, color: AMBER }}>{state.xp} Ω</span>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Unlocked {unlockedCount} / {total} ({pct}%)</span>
          {rank.nextRank && (
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              to {rank.nextRank.toUpperCase()}: {rank.omegaIntoRank} / {rank.omegaForNext} Ω
            </span>
          )}
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, marginTop: 8 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: AMBER, borderRadius: 3 }} />
        </div>

        {/* Circuit map */}
        <div style={{ marginTop: 14, border: '1px solid rgba(249,206,15,0.12)', borderRadius: 10, padding: 6 }}>
          <CircuitMap catalog={catalog} unlocked={state.unlocked} onSelectCategory={scrollToCat} />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {(['all', 'unlocked', 'locked'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontFamily: MONO, fontSize: 11, textTransform: 'uppercase', color: filter === f ? '#0c1a12' : AMBER, background: filter === f ? AMBER : 'transparent', border: `1px solid ${AMBER}`, borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sections */}
        {cats.map((cat) => {
          const defs = catalog.filter((d) => d.category === cat && show(d));
          if (defs.length === 0) return null;
          const got = catalog.filter((d) => d.category === cat && state.unlocked[d.id] != null).length;
          const all = catalog.filter((d) => d.category === cat).length;
          return (
            <section key={cat} id={`ach-cat-${cat}`} style={{ marginTop: 18 }}>
              <h3 style={{ fontSize: 12, color: TIER_COLOR.gold, borderBottom: '1px solid rgba(249,206,15,0.15)', paddingBottom: 4 }}>
                {CATEGORY_LABEL[cat]} · {got}/{all}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {defs.map((d) => (
                  <AchievementCard key={d.id} def={d} unlocked={state.unlocked[d.id] != null} onClick={() => setSelected(d)} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <AchievementPopover def={selected} unlockedAt={state.unlocked[selected.id]} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
