import { avatarCells, avatarColor } from '../../lib/avatarGen';
import type { AvatarData } from './types';

interface AvatarProps {
  avatar: AvatarData;
  size?: number;
}

export default function Avatar({ avatar, size = 32 }: AvatarProps) {
  const ring = '1px solid rgba(249,206,15,0.3)';

  if (avatar.type === 'photo') {
    return (
      <img
        src={avatar.dataUrl}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: ring,
          flexShrink: 0,
        }}
      />
    );
  }

  const cells = avatarCells(avatar.seed);
  const color = avatarColor(avatar.seed);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 5 5"
      style={{
        borderRadius: '50%',
        background: '#0a1510',
        border: ring,
        filter: `drop-shadow(0 0 2px ${color})`,
        flexShrink: 0,
      }}
    >
      {cells.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={color} />
          ) : null,
        ),
      )}
    </svg>
  );
}
