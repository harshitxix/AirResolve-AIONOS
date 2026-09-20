import React from 'react';
import { User, Plane, Award, Mail, Phone, Ticket, Calendar, AlertTriangle, Clock, MapPin, History } from 'lucide-react';

const ContextPanel = ({ customer, booking }) => {
  const getTierBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'gold':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'silver':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('cancel')) {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-700',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
      };
    }
    if (s.includes('delay')) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: <Clock className="w-3.5 h-3.5 text-emerald-600" />
    };
  };

  return (
    <div className="h-full flex flex-col gap-3.5 overflow-hidden">
      {/* Passenger Profile Card */}
      <div className="console-card p-4 shrink-0 flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Passenger Profile</h2>
          </div>
          {customer && (
            <span className={`badge-subtle border ${getTierBadge(customer.loyalty_tier)}`}>
              <Award className="w-3 h-3" />
              {customer.loyalty_tier}
            </span>
          )}
        </div>

        {customer ? (
          <div className="space-y-3">
            <div>
              <p className="text-base font-bold text-slate-900 tracking-tight">{customer.name}</p>
              <p className="text-xs text-slate-400 font-medium">Verified Identity</p>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <History className="w-3.5 h-3.5 text-slate-400" /> 12-Month Flights:
              </span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                {customer.travel_history_flights_12m} trips
              </span>
            </div>

            {customer.prior_complaint && (
              <div className="bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">
                  <strong>Prior Record:</strong> {customer.prior_complaint}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 flex flex-col items-center justify-center">
            <User className="w-8 h-8 mb-1.5 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-medium">Select a scenario above to load customer dossier</p>
          </div>
        )}
      </div>

      {/* Flight Dossier Card (Fills remaining height with internal scroll) */}
      <div className="console-card p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 shrink-0 mb-3">
          <Ticket className="w-4 h-4 text-sky-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Flight Context</h2>
        </div>

        {booking ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-0.5">
            {/* PNR & Flight code header */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">PNR Reference</p>
                <p className="text-sm font-mono font-bold text-sky-700 tracking-wider">{booking.pnr}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Flight No.</p>
                <p className="text-sm font-bold text-slate-800">{booking.flight}</p>
              </div>
            </div>

            {/* Route & Date */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>{booking.route}</span>
              </div>
              <div className="flex items-center gap-2 pl-5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.date} · Dep: {booking.scheduled_departure}</span>
              </div>
            </div>

            {/* Live Status Pill Card */}
            {(() => {
              const badge = getStatusBadge(booking.status);
              return (
                <div className={`p-2.5 rounded-xl border ${badge.bg}`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {badge.icon}
                    <span>{booking.status}</span>
                  </div>
                  {booking.reason && (
                    <p className="text-[11px] mt-1 opacity-90 leading-tight">
                      <strong>Reason:</strong> {booking.reason}
                    </p>
                  )}
                  {booking.new_departure && (
                    <p className="text-[11px] mt-1 font-semibold">
                      Estimated Departure: {booking.new_departure}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-6">
            <Plane className="w-8 h-8 mb-1.5 text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-medium">No active flight booking attached</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextPanel;
