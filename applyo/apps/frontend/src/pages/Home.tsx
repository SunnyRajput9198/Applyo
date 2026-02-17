import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const C = {
  bg: '#0f0f10', surface: '#1a1a1d', surface2: '#242428',
  border: '#2e2e33', accent: '#6ee7b7', accentDim: 'rgba(110,231,183,0.12)',
  text: '#e8e8ea', muted: '#71717a', error: '#ff6b6b', errorBg: 'rgba(255,68,68,0.12)',
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addOption = () => { if (options.length < 6) setOptions([...options, '']); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, j) => j !== i)); };
  const updateOption = (i: number, v: string) => { const u = [...options]; u[i] = v; setOptions(u); };

  const handleSubmit = async () => {
    if (!question.trim()) return setError('Add a question first');
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) return setError('Need at least 2 options');
    if (new Set(filled).size !== filled.length) return setError('Options must be unique');
    try {
      setLoading(true); setError('');
      const res = await axios.post(`${API_URL}/api/polls`, { question: question.trim(), options: filled });
      navigate(`/poll/${res.data.pollId}`);
    } catch { setError('Failed to create poll. Is the server running?'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
      backgroundImage: 'linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)',
      backgroundSize: '32px 32px', fontFamily: "'Sora', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 11, padding: '3px 8px', borderRadius: 999, background: C.accentDim, color: C.accent }}>BETA</span>
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted }}>poll.rooms</span>
          </div>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Create a poll</h1>
          <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Share the link. Watch votes roll in.</p>
        </div>

        {/* Card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24 }}>

          {/* Question */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>QUESTION</label>
            <input
              type="text" value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to know?"
              style={{
                width: '100%', background: C.surface2, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '12px 16px', color: C.text, fontSize: 14,
                outline: 'none', fontFamily: "'Sora', sans-serif", boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'monospace', fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>OPTIONS</label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: C.muted, width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                <input
                  type="text" value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  style={{
                    flex: 1, background: C.surface2, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14,
                    outline: 'none', fontFamily: "'Sora', sans-serif",
                  }}
                  onFocus={e => e.target.style.borderColor = C.accent}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} style={{
                    width: 28, height: 28, borderRadius: 8, border: 'none',
                    background: C.surface2, color: C.muted, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>×</button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button onClick={addOption} style={{
                marginTop: 4, background: 'none', border: 'none',
                color: C.accent, fontSize: 12, cursor: 'pointer',
                fontFamily: "'Sora', sans-serif", padding: 0, opacity: 0.8,
              }}>+ add option</button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontFamily: 'monospace', fontSize: 12, padding: '8px 12px', borderRadius: 8, marginBottom: 16, background: C.errorBg, color: C.error }}>
              ⚠ {error}
            </p>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 12, border: 'none',
            background: C.accent, color: '#0f0f10', fontWeight: 600, fontSize: 14,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            fontFamily: "'Sora', sans-serif", transition: 'opacity 0.15s',
          }}>
            {loading ? 'Creating...' : 'Create poll →'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: C.muted, marginTop: 16 }}>
          No account needed. Results update in real-time.
        </p>
      </div>
    </div>
  );
}