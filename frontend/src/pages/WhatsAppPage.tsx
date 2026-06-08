import React, { useState, useEffect } from 'react';
import { client } from '../api/client';
import { Shelter } from '../types';
import { Send, Phone } from 'lucide-react';

const WhatsAppPage = () => {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [selectedShelterId, setSelectedShelterId] = useState<number>(1);
  const [message, setMessage] = useState('PEOPLE=300 FOOD=50 WATER=20');
  const [chatLog, setChatLog] = useState<{sender: string, text: string, warnings?: string[]}[]>([
    { sender: 'System', text: 'WhatsApp Gateway connected. Listening for incoming telemetry.' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.getShelters().then(res => setShelters(res.data));
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatLog(prev => [...prev, { sender: 'Shelter', text: message }]);
    setLoading(true);
    
    try {
      const res = await client.parseWhatsApp({ message, shelter_id: selectedShelterId });
      setChatLog(prev => [
        ...prev, 
        { sender: 'AI Parser', text: `Parsed: ${JSON.stringify(res.data.parsed_data)}`, warnings: res.data.warnings }
      ]);
    } catch (e) {
      console.error(e);
      setChatLog(prev => [...prev, { sender: 'System Error', text: 'Failed to process message' }]);
    } finally {
      setMessage('');
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
      {/* Left panel */}
      <div className="glass-card p-4 flex flex-col">
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center">
          <Phone className="mr-2 text-green-500" size={20} />
          Gateway Nodes
        </h3>
        <p className="text-sm text-slate-400 mb-4">Select the shelter node to simulate incoming SMS/WhatsApp messages from.</p>
        
        <div className="space-y-2">
          {shelters.map(s => (
            <button 
              key={s.id}
              onClick={() => setSelectedShelterId(s.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedShelterId === s.id 
                  ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                  : 'bg-navy-900 border-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs opacity-70">ID: SHL-{s.id}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden bg-navy-900/50 relative">
        {/* Chat Header */}
        <div className="bg-navy-800 border-b border-slate-700 p-4">
          <h3 className="font-semibold text-slate-200">
            Node: {shelters.find(s => s.id === selectedShelterId)?.name || 'Unknown'}
          </h3>
          <p className="text-xs text-slate-400">Natural Language Processor Active</p>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatLog.map((log, idx) => (
            <div key={idx} className={`flex flex-col ${log.sender === 'Shelter' ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-slate-500 mb-1 ml-1">{log.sender}</div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                log.sender === 'Shelter' 
                  ? 'bg-green-600 text-white rounded-br-none'
                  : log.sender.includes('System') 
                    ? 'bg-slate-700/50 text-slate-300 border border-slate-600 rounded-bl-none text-sm font-mono'
                    : 'bg-navy-800 border border-slate-600 text-slate-200 rounded-bl-none font-mono text-sm'
              }`}>
                {log.text}
              </div>
              
              {log.warnings && log.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {log.warnings.map((w, wIdx) => (
                    <div key={wIdx} className="bg-danger/20 border border-danger/50 text-danger px-3 py-2 rounded-lg text-xs animate-pulse">
                      ⚠ AI ALERT: {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-navy-800 border-t border-slate-700 flex space-x-2">
          <input 
            type="text" 
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={loading}
            placeholder="Type message simulating shelter..."
            className="flex-1 bg-navy-900 border border-slate-600 rounded-full px-5 py-3 text-slate-200 focus:outline-none focus:border-green-500 transition-colors"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50"
          >
            <Send size={20} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppPage;
