import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { getSessionId } from '../Utils/session';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const C = {
  bg: '#0f0f10',
  surface: '#1a1a1d',
  surface2: '#242428',
  border: '#2e2e33',
  accent: '#6ee7b7',
  accentDim: 'rgba(110,231,183,0.12)',
  text: '#e8e8ea',
  muted: '#71717a',
  error: '#ff6b6b',
  errorBg: 'rgba(255,68,68,0.12)',
};

interface Result { option: string; votes: number; }
interface Poll {
  id: number;
  question: string;
  options: string[];
  results: Result[];
  totalVotes: number;
}

export default function PollView() {
  const { id } = useParams<{ id: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const sessionId = getSessionId();

  useEffect(() => {
    fetchPoll();
    const socket: Socket = io(API_URL);
    socket.emit('join-poll', parseInt(id!));
    socket.on('vote-update', (data) => {
      setPoll(prev => prev ? { ...prev, results: data.results, totalVotes: data.totalVotes } : prev);
    });
    return () => { socket.disconnect(); };
  }, [id]);

  const fetchPoll = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/polls/${id}`);
      setPoll(res.data);
    } catch {
      setError('Poll not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selected === null) return;
    try {
      setVoting(true);
      setError('');
      await axios.post(`${API_URL}/api/polls/${id}/vote`, { optionIndex: selected, sessionId });
      setHasVoted(true);
    } catch (err: any) {
      if (err.response?.data?.error === 'You have already voted') {
        setHasVoted(true);
      } else {
        setError('Failed to submit. Try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPct = (votes: number) =>
    poll && poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

  const winnerIdx = poll?.totalVotes
    ? poll.results.reduce((best, r, i, arr) => r.votes > arr[best].votes ? i : best, 0)
    : -1;

  if (loading) return (
    <div style={{ color: C.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
      loading poll...
    </div>
  );

  if (!poll) return (
    <div style={{ textAlign: 'center', color: C.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>
      🗳 {error}
    </div>
  );

  return (
    <div className="fade-up" style={{ width: '100%', maxWidth: 440 }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ color: C.muted, fontSize: 12 }}>poll.rooms</span>
          <span className="mono" style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 999,
            background: C.accentDim, color: C.accent
          }}>● live</span>
        </div>
        <button onClick={copyLink} className="mono" style={{
          fontSize: 11, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
          background: copied ? C.accentDim : C.surface2,
          color: copied ? C.accent : C.muted,
          border: `1px solid ${C.border}`,
        }}>
          {copied ? '✓ copied' : '↗ share'}
        </button>
      </div>

      {/* Card */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: 24,
      }}>
        {/* Question */}
        <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', lineHeight: 1.3 }}>
          {poll.question}
        </h2>
        <p className="mono" style={{ color: C.muted, fontSize: 11, margin: '0 0 24px 0' }}>
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? 's' : ''} cast
        </p>

        {/* Voting */}
        {!hasVoted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {poll.options.map((option, i) => (
              <button key={i} onClick={() => setSelected(i)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                textAlign: 'left', width: '100%', transition: 'all 0.15s',
                background: selected === i ? C.accentDim : C.surface2,
                border: `1px solid ${selected === i ? C.accent : C.border}`,
                color: selected === i ? C.accent : C.text,
                fontSize: 14,
              }}>
                <span className="mono" style={{ color: C.muted, fontSize: 11, minWidth: 16 }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            ))}
          </div>
        ) : (
          /* Results */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {poll.results.map((result, i) => {
              const pct = getPct(result.votes);
              const isWinner = i === winnerIdx && poll.totalVotes > 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ color: C.muted, fontSize: 11 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span style={{ color: C.text, fontSize: 14 }}>{result.option}</span>
                      {isWinner && (
                        <span className="mono" style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 4,
                          background: C.accentDim, color: C.accent
                        }}>leading</span>
                      )}
                    </div>
                    <span className="mono" style={{ color: C.muted, fontSize: 11 }}>{pct}%</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, borderRadius: 99, background: C.surface2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      borderRadius: 99,
                      background: isWinner ? C.accent : C.border,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mono" style={{
            fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: 16,
            background: C.errorBg, color: C.error
          }}>⚠ {error}</p>
        )}

        {/* CTA */}
        {!hasVoted ? (
          <button onClick={handleVote} disabled={selected === null || voting} style={{
            width: '100%', padding: '12px', borderRadius: 12, border: 'none',
            fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 14,
            background: C.accent, color: '#0f0f10', cursor: selected === null ? 'not-allowed' : 'pointer',
            opacity: selected === null || voting ? 0.45 : 1, transition: 'opacity 0.15s',
          }}>
            {voting ? 'submitting...' : 'Submit vote →'}
          </button>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: '12px', borderRadius: 12, background: C.accentDim,
          }}>
            <span style={{ color: C.accent, fontSize: 14 }}>✓</span>
            <span style={{ color: C.accent, fontSize: 14, fontWeight: 500 }}>
              Vote recorded. Results are live.
            </span>
          </div>
        )}
      </div>

      <p className="mono" style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 16 }}>
        results update instantly for all viewers
      </p>
    </div>
  );
}