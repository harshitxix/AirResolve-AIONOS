import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import ContextPanel from './components/ContextPanel';
import ResolutionPanel from './components/ResolutionPanel';
import { Plane, ShieldCheck, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SESSION_ID = "demo-" + Math.floor(Math.random() * 100000);
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function App() {
  const [customer, setCustomer] = useState(null);
  const [booking, setBooking] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      content: 'Hello! I am AirResolve AI, your automated flight resolution assistant. How can I assist you with your booking today?'
    }
  ]);
  const [agentState, setAgentState] = useState({});
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const loadScenario = async (scenario) => {
    setLoadingScenario(true);
    setActiveScenario(scenario);
    setMessages([
      {
        role: 'agent',
        content: 'Hello! I am AirResolve AI. I have retrieved your booking information. How can I help resolve your flight today?'
      }
    ]);
    setAgentState({});

    try {
      const response = await axios.post(`${API_BASE}/load_scenario?scenario=${scenario}&session_id=${SESSION_ID}`);
      setCustomer(response.data.customer);
      setBooking(response.data.booking);
    } catch (e) {
      console.error(e);
      alert("Failed to load scenario. Please ensure the backend server is running.");
    }
    setLoadingScenario(false);
  };

  const handleReset = () => {
    setCustomer(null);
    setBooking(null);
    setActiveScenario(null);
    setAgentState({});
    setMessages([
      {
        role: 'agent',
        content: 'Hello! I am AirResolve AI, your automated flight resolution assistant. How can I assist you with your booking today?'
      }
    ]);
  };

  const handleSendMessage = async (text) => {
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsResolving(true);

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        user_input: text,
        session_id: SESSION_ID,
        customer_context: customer,
        booking_context: booking,
        messages: newMessages.slice(0, -1)
      });

      const data = response.data;
      setMessages([...newMessages, { role: 'agent', content: data.response }]);
      if (data.customer) setCustomer(data.customer);
      if (data.booking) setBooking(data.booking);

      setAgentState({
        policy_result: data.policy_result,
        actions_taken: data.actions_taken,
        requires_escalation: data.requires_escalation,
        escalation_reason: data.escalation_reason
      });
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMessages,
        {
          role: 'agent',
          content: "Sorry, I'm having trouble connecting to the resolution engine. Please ensure the backend is running."
        }
      ]);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800 overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center shadow-sm shadow-sky-500/20 text-white">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">AirResolve AI</h1>
              <span className="bg-sky-50 border border-sky-200/80 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Console v2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Customer Support & Disruption Resolution Workbench</p>
          </div>
        </div>

        {/* Quick Scenario Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline-block">Preload Demo:</span>
          
          <button
            onClick={() => loadScenario('priya')}
            disabled={loadingScenario}
            className={`btn-scenario ${activeScenario === 'priya' ? 'btn-scenario-active' : ''}`}
            title="Flight Cancelled scenario"
          >
            {loadingScenario && activeScenario === 'priya' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
            <span>Priya</span>
            <span className="text-[11px] font-normal text-slate-500 hidden md:inline">(Cancelled)</span>
          </button>

          <button
            onClick={() => loadScenario('arvind')}
            disabled={loadingScenario}
            className={`btn-scenario ${activeScenario === 'arvind' ? 'btn-scenario-active' : ''}`}
            title="4-Hour Delay scenario"
          >
            {loadingScenario && activeScenario === 'arvind' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
            <span>Arvind</span>
            <span className="text-[11px] font-normal text-slate-500 hidden md:inline">(4h Delay)</span>
          </button>

          <button
            onClick={() => loadScenario('meher')}
            disabled={loadingScenario}
            className={`btn-scenario ${activeScenario === 'meher' ? 'btn-scenario-active' : ''}`}
            title="6-Hour Delay scenario"
          >
            {loadingScenario && activeScenario === 'meher' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            )}
            <span>Meher</span>
            <span className="text-[11px] font-normal text-slate-500 hidden md:inline">(6h Delay)</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1"></div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <main className="flex-1 min-h-0 p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* Left Column: Context & Passenger Dossier (3 cols) */}
        <section className="lg:col-span-3 h-full flex flex-col overflow-hidden min-h-0">
          <ContextPanel customer={customer} booking={booking} />
        </section>

        {/* Center Column: Interactive Resolution Chat (6 cols) */}
        <section className="lg:col-span-6 h-full flex flex-col overflow-hidden min-h-0">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isResolving={isResolving}
            customer={customer}
          />
        </section>

        {/* Right Column: Policy Engine & Action Validation (3 cols) */}
        <section className="lg:col-span-3 h-full flex flex-col overflow-hidden min-h-0">
          <ResolutionPanel state={agentState} />
        </section>
      </main>
    </div>
  );
}

export default App;
