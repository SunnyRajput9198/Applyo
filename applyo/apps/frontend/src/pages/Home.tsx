import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Home() {
    const C = {
  bg: '#0f0f10', surface: '#1a1a1d', surface2: '#242428',
  border: '#2e2e33', accent: '#6ee7b7', accentDim: 'rgba(110,231,183,0.12)',
  text: '#e8e8ea', muted: '#71717a',
};
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async () => {
    if (!question.trim()) return setError('Add a question first');
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) return setError('Need at least 2 options');
    if (new Set(filled).size !== filled.length) return setError('Options must be unique');

    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/api/polls`, {
        question: question.trim(),
        options: filled
      });
      navigate(`/poll/${res.data.pollId}`);
    } catch {
      setError('Something went wrong. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-up">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="mono text-xs px-2 py-1 rounded" 
              style={{ background: C.accent }}>
              BETA
            </span>
            <span className="mono text-xs" style={{ color: 'var(--muted)' }}>
              poll.rooms
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            Create a poll
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Share the link. Watch votes roll in.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 space-y-5" 
          style={{ background: C.accent }}>

          {/* Question */}
          <div>
            <label className="block text-xs font-medium mb-2 mono" 
              style={{ color: 'var(--muted)' }}>
              QUESTION
            </label>
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to know?"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-medium mb-2 mono" 
              style={{ color: 'var(--muted)' }}>
              OPTIONS
            </label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 fade-up-delay-1">
                  <span className="mono text-xs w-5 text-center flex-shrink-0"
                    style={{ color: 'var(--muted)' }}>
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={e => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:opacity-100 opacity-50"
                     style={{ background: C.accent }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                onClick={addOption}
                className="mt-3 text-xs font-medium transition-opacity hover:opacity-100 opacity-60 flex items-center gap-1"
                style={{ color: 'var(--accent)' }}
              >
                <span>+</span> add option
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs py-2 px-3 rounded-lg mono"
              style={{ background: '#ff444420', color: '#ff6b6b' }}>
              ⚠ {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
            style={{ 
              background: 'var(--accent)', 
              color: '#0f0f10',
            }}
          >
            {loading ? 'Creating...' : 'Create poll →'}
          </button>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--muted)' }}>
          No account needed. Results update in real-time.
        </p>
      </div>
    </div>
  );
}