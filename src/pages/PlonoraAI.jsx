import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, Send, Plus, Trash2, ChevronRight, Loader2,
  TrendingUp, DollarSign, BarChart2, Globe, Shield, BookOpen,
  Copy, Check, RefreshCw, Search, ChevronLeft,
} from 'lucide-react';

const SERVER = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const SUGGESTED_PROMPTS = [
  { icon: TrendingUp,  text: "What is the Fed's current stance and what does it mean for stocks and bonds?" },
  { icon: DollarSign,  text: "How should I think about portfolio allocation in today's rate environment?" },
  { icon: Globe,       text: "How do tariffs and geopolitical tensions typically impact markets?" },
  { icon: BarChart2,   text: "Walk me through how to analyze a company's financial statements like a pro" },
  { icon: Shield,      text: "What are the biggest macro risks to watch right now and how do I hedge?" },
  { icon: BookOpen,    text: "Explain the yield curve, what an inversion means, and why it matters" },
];

const STOCK_QUICK_PROMPTS = [
  'AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'JPM',
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function generateTitle(content) {
  const cleaned = content.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 6).join(' ');
  return words.length > 3 ? words : 'New Conversation';
}

function formatTime(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function MessageContent({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f0e8d8', marginTop: '1rem', marginBottom: '0.5rem' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '0.875rem', fontWeight: 700, color: '#c9a96e', marginTop: '0.75rem', marginBottom: '0.25rem' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={i} className="font-semibold text-white mt-2">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletLines = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        bulletLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 my-2 text-gray-200">
          {bulletLines.map((b, j) => (
            <li key={j} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\./.test(line)) {
      const numLines = [];
      while (i < lines.length && /^\d+\./.test(lines[i])) {
        numLines.push(lines[i].replace(/^\d+\.\s*/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 my-2 text-gray-200">
          {numLines.map((b, j) => (
            <li key={j} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} className="border-gray-700 my-3" />);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
      );
    }
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

export default function PlonoraAI() {
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('planora_ai_chats') || '[]'); } catch { return []; }
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [copied, setCopied] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messages = activeChat?.messages || [];

  useEffect(() => {
    localStorage.setItem('planora_ai_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  function newChat() {
    setActiveChatId(null);
    setStreamBuffer('');
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function deleteChat(id, e) {
    e.stopPropagation();
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  }

  function selectChat(id) {
    setActiveChatId(id);
    setStreamBuffer('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || streaming) return;
    setInput('');

    let chatId = activeChatId;
    let chatMessages = messages;

    if (!chatId) {
      chatId = generateId();
      const newChatObj = {
        id: chatId,
        title: generateTitle(trimmed),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setChats(prev => [newChatObj, ...prev]);
      setActiveChatId(chatId);
      chatMessages = [];
    }

    const userMsg = { role: 'user', content: trimmed, id: generateId(), ts: Date.now() };
    const updatedMessages = [...chatMessages, userMsg];

    setChats(prev => prev.map(c => c.id === chatId
      ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
      : c
    ));

    setStreaming(true);
    setStreamBuffer('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${SERVER}/api/planora-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages.map(m => ({ role: m.role, content: m.content })) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let lineBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
              fullText += json.delta.text;
              setStreamBuffer(fullText);
            }
            if (json.error) throw new Error(json.error);
          } catch {}
        }
      }

      const assistantMsg = { role: 'assistant', content: fullText, id: generateId(), ts: Date.now() };
      setChats(prev => prev.map(c => c.id === chatId
        ? { ...c, messages: [...updatedMessages, assistantMsg], updatedAt: Date.now() }
        : c
      ));
      setStreamBuffer('');
    } catch (e) {
      if (e.name !== 'AbortError') {
        const errMsg = { role: 'assistant', content: `Something went wrong: ${e.message}. Please try again.`, id: generateId(), ts: Date.now(), error: true };
        setChats(prev => prev.map(c => c.id === chatId
          ? { ...c, messages: [...updatedMessages, errMsg], updatedAt: Date.now() }
          : c
        ));
        setStreamBuffer('');
      }
    } finally {
      setStreaming(false);
    }
  }, [input, activeChatId, messages, streaming]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function copyMessage(content, id) {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  const SB = { background: '#231c16', borderRight: '1px solid #2a2018' }
  const RAISE = '#2d2419'
  const B1 = '#2a2018'
  const B2 = '#3d3028'
  const T1 = '#f0e8d8'
  const T2 = '#a89070'
  const T3 = '#6b5540'
  const GOLD = '#c9a96e'
  const BG = '#1a1410'
  const FONT = "'Inter', system-ui, sans-serif"
  const MONO = "'JetBrains Mono', 'Courier New', monospace"

  return (
    <div style={{ display: 'flex', background: BG, color: T1, overflow: 'hidden', height: '100vh', width: '100vw', position: 'fixed', inset: 0, fontFamily: FONT }}>

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <div style={{ width: 256, flexShrink: 0, ...SB, display: 'flex', flexDirection: 'column' }}>
        {/* Back to Terminal */}
        <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${B1}` }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: T3 }}
            onMouseEnter={e => e.currentTarget.style.color = T2}
            onMouseLeave={e => e.currentTarget.style.color = T3}>
            <ChevronLeft size={12} />
            <span style={{ fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Planora Terminal</span>
          </Link>
        </div>

        {/* Branding + New Chat */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${B1}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(201,169,110,0.12)', border: `1px solid rgba(201,169,110,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Brain size={16} color={GOLD} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Planora AI</div>
              <div style={{ fontSize: 11, color: T3 }}>Financial Intelligence</div>
            </div>
          </div>
          <button onClick={newChat} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px 14px', background: GOLD, color: BG, border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: FONT }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
            onMouseLeave={e => e.currentTarget.style.filter = ''}>
            <Plus size={14} />New Conversation
          </button>
        </div>

        {/* Live data badge */}
        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${B1}`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c59', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: T3 }}>Live market data injected</span>
        </div>

        {/* Chat history */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {chats.length === 0 ? (
            <div style={{ textAlign: 'center', color: T3, fontSize: 11, marginTop: 32, padding: '0 16px' }}>Start a conversation to see it here</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {chats.map(chat => (
                <button key={chat.id} onClick={() => selectChat(chat.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, background: activeChatId === chat.id ? RAISE : 'transparent', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (activeChatId !== chat.id) e.currentTarget.style.background = '#251e17' }}
                  onMouseLeave={e => { if (activeChatId !== chat.id) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: activeChatId === chat.id ? T1 : T2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</div>
                    <div style={{ fontSize: 10, color: T3, marginTop: 2, fontFamily: MONO }}>{formatTime(chat.updatedAt)}</div>
                  </div>
                  <button onClick={(e) => deleteChat(chat.id, e)} style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', color: T3, flexShrink: 0, padding: 2 }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = '#8b3a3a' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0 }}>
                    <Trash2 size={11} />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px', borderTop: `1px solid ${B1}`, textAlign: 'center', fontSize: 10, color: T3 }}>
          Institutional Intelligence · Personal Impact
        </div>
      </div>

      {/* ── Main Area ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Empty state */}
        {!activeChat && (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(201,169,110,0.10)', border: `1px solid rgba(201,169,110,0.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Brain size={30} color={GOLD} />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T1, margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}>Planora AI</h1>
            <p style={{ color: T2, textAlign: 'center', maxWidth: 480, marginBottom: 8, fontSize: 13, lineHeight: 1.75 }}>
              Bloomberg Terminal meets BlackRock advisor. Ask anything about markets, stocks, economics, financial planning, or how world events move money.
            </p>
            <p style={{ fontSize: 11, color: GOLD, marginBottom: 36, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c59', display: 'inline-block' }} />
              Live market data · Fed rates · CPI · S&P 500 · Treasury yields injected automatically
            </p>

            {/* Stock quick-analyze */}
            <div style={{ width: '100%', maxWidth: 640, marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: T3, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={11} color={T3} />Quick Stock Analysis — click any ticker or type $TICKER
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STOCK_QUICK_PROMPTS.map(ticker => (
                  <button key={ticker}
                    onClick={() => sendMessage(`Give me a full analysis of $${ticker} — current price, valuation, key fundamentals, strengths, risks, and your outlook.`)}
                    style={{ padding: '6px 14px', background: RAISE, border: `1px solid ${B2}`, color: T2, fontSize: 12, fontFamily: MONO, fontWeight: 600, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.10)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.35)'; e.currentTarget.style.color = GOLD }}
                    onMouseLeave={e => { e.currentTarget.style.background = RAISE; e.currentTarget.style.borderColor = B2; e.currentTarget.style.color = T2 }}>
                    ${ticker}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested prompts */}
            <div style={{ width: '100%', maxWidth: 640 }}>
              <div style={{ fontSize: 10, color: T3, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 10 }}>Suggested Questions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SUGGESTED_PROMPTS.map(({ icon: Icon, text }, i) => (
                  <button key={i} onClick={() => sendMessage(text)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: '#231c16', border: `1px solid ${B2}`, borderRadius: 12, textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = RAISE; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.30)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#231c16'; e.currentTarget.style.borderColor = B2 }}>
                    <Icon size={15} color={GOLD} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13, color: T2, lineHeight: 1.5 }}>{text}</span>
                    <ChevronRight size={13} color={T3} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {activeChat && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, ...(msg.role === 'user' ? { background: GOLD, color: BG } : { background: RAISE, border: `1px solid ${B2}` }) }}>
                    {msg.role === 'user' ? 'You' : <Brain size={14} color={GOLD} />}
                  </div>
                  <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ borderRadius: 16, padding: '12px 16px', ...(msg.role === 'user' ? { background: GOLD, color: BG, borderTopRightRadius: 4 } : msg.error ? { background: 'rgba(139,58,58,0.2)', border: '1px solid rgba(139,58,58,0.4)', color: '#e57373', borderTopLeftRadius: 4 } : { background: '#231c16', border: `1px solid ${B2}`, borderTopLeftRadius: 4 }) }}>
                      {msg.role === 'user' ? (
                        <p style={{ margin: 0, fontSize: 13, fontFamily: FONT }}>{msg.content}</p>
                      ) : (
                        <MessageContent content={msg.content} />
                      )}
                    </div>
                    {msg.role === 'assistant' && !msg.error && (
                      <button onClick={() => copyMessage(msg.content, msg.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: T3, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', fontFamily: FONT }}
                        onMouseEnter={e => e.currentTarget.style.color = T2}
                        onMouseLeave={e => e.currentTarget.style.color = T3}>
                        {copied === msg.id ? <Check size={11} color="#4a7c59" /> : <Copy size={11} />}
                        {copied === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streaming && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, background: RAISE, border: `1px solid ${B2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={14} color={GOLD} />
                  </div>
                  <div style={{ maxWidth: '85%' }}>
                    <div style={{ background: '#231c16', border: `1px solid ${B2}`, borderRadius: 16, borderTopLeftRadius: 4, padding: '12px 16px' }}>
                      {streamBuffer ? (
                        <MessageContent content={streamBuffer} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T3, fontSize: 13 }}>
                          <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                          Fetching live data &amp; analyzing...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ borderTop: `1px solid ${B1}`, background: '#1e1812', padding: '16px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, background: '#231c16', border: `1px solid ${B2}`, borderRadius: 16, padding: '12px 16px', transition: 'border-color 0.15s' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.40)'}
              onBlur={e => e.currentTarget.style.borderColor = B2}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about markets, stocks ($AAPL), economics, or financial planning..."
                rows={1}
                style={{ flex: 1, resize: 'none', minHeight: 24, maxHeight: 160, background: 'transparent', color: T1, fontSize: 13, fontFamily: FONT, border: 'none', outline: 'none', lineHeight: 1.6 }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px' }}
              />
              {streaming ? (
                <button onClick={stopStreaming} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, background: '#8b3a3a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={14} color={T1} />
                </button>
              ) : (
                <button onClick={() => sendMessage()} disabled={!input.trim()}
                  style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 9, border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', background: input.trim() ? GOLD : RAISE, color: input.trim() ? BG : T3, transition: 'all 0.15s' }}>
                  <Send size={14} />
                </button>
              )}
            </div>
            <p style={{ fontSize: 11, color: T3, textAlign: 'center', marginTop: 8, fontFamily: FONT }}>
              Mention <span style={{ fontFamily: MONO, color: T2 }}>$AAPL</span> or any ticker — Planora AI fetches live price &amp; fundamentals automatically · Enter to send
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
