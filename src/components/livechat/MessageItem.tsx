import Avatar from './Avatar';
import { AMBER, MONO } from './theme';
import { avatarColor } from '../../lib/avatarGen';
import type { ChatMessage } from './types';
import RankBadge from '../achievements/RankBadge';

export default function MessageItem({ message }: { message: ChatMessage }) {
  const nameColor =
    message.author.avatar.type === 'generated'
      ? avatarColor(message.author.avatar.seed)
      : AMBER;

  const sending = message.status === 'sending';

  return (
    <div
      className="chat-msg-in"
      style={{ display: 'flex', gap: 8, padding: '4px 10px', alignItems: 'flex-start' }}
    >
      <Avatar avatar={message.author.avatar} size={24} />
      <div style={{ minWidth: 0, fontFamily: MONO, fontSize: 12, lineHeight: 1.4 }}>
        {message.author.rank && (
          <span style={{ marginRight: 6, verticalAlign: 'middle' }}>
            <RankBadge rank={message.author.rank} tier={message.author.rankTier} compact />
          </span>
        )}
        <span
          style={{
            color: message.isOwn ? AMBER : nameColor,
            fontWeight: 700,
            marginRight: 6,
          }}
        >
          {message.author.nickname}
        </span>
        <span
          style={{
            color: 'rgba(255,255,255,0.85)',
            wordBreak: 'break-word',
            opacity: sending ? 0.55 : 1,
          }}
        >
          {message.text}
        </span>
        {sending && (
          <span className="chat-sending-dots" aria-label="sending">
            <i />
            <i />
            <i />
          </span>
        )}
      </div>
    </div>
  );
}
