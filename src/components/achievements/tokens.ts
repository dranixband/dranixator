import type { RankTier } from '../../achievements/types';

export const TIER_COLOR: Record<RankTier, string> = {
  bronze: '#cd7f32',
  silver: '#cfd4da',
  gold: '#f9ce0f',
  platinum: '#1ba6c4',
  legend: '#1ba6c4',
};

export const TIER_GLOW: Record<RankTier, string> = {
  bronze: 'none',
  silver: 'none',
  gold: '0 0 12px rgba(249,206,15,0.55)',
  platinum: '0 0 14px rgba(27,166,196,0.6)',
  legend: '0 0 16px rgba(27,166,196,0.7)',
};
