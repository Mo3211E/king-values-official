"use client";

import { useState } from "react";
import MobileCompactUnitCard from "./MobileCompactUnitCard";
import MobileUnitPickerModal from "./MobileUnitPickerModal";

export default function MobileTradeBox({ title, units, setUnits }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const totalValue = units.reduce((sum, u) => {
    const n = Number(u.Value);
    return Number.isFinite(n) ? sum + n : sum;
  }, 0);

  const handleAddUnit = (unit) => {
    setUnits((prev) => [...prev, unit]);
    setPickerOpen(false);
  };

  const handleRemoveUnit = (index) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-[rgba(5,0,20,0.9)] p-3 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <div className="text-xs text-white/70">
          Total:{" "}
          <span className="font-bold text-[#f9cb9c]">
            {totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => setPickerOpen(true)}
        className="w-full mb-1 px-3 py-2 rounded-xl text-sm font-semibold border border-[rgba(210,180,255,0.7)] bg-[linear-gradient(135deg,rgba(35,0,70,0.95),rgba(15,0,35,0.9))] shadow-[0_0_12px_rgba(190,150,255,0.4)] active:scale-95"
      >
        + Add Unit
      </button>

      {/* Units grid */}
      <div className="max-h-[260px] overflow-y-auto pr-1 grid grid-cols-2 gap-2">
        {units.length === 0 ? (
          <p className="text-[0.85rem] text-white/60 col-span-2 text-center mt-2">
            No units added yet. Tap &ldquo;+ Add Unit&rdquo; to begin.
          </p>
        ) : (
          units.map((u, idx) => (
            <div key={`${u.Name}-${idx}`} className="relative">
              {/* Red X top-right */}
              <button
                className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 rounded-full bg-black/80 border border-red-400 text-[0.8rem] text-red-300 flex items-center justify-center shadow-[0_0_10px_rgba(255,80,80,0.7)]"
                onClick={() => handleRemoveUnit(idx)}
              >
                ✕
              </button>
              <MobileCompactUnitCard u={u} />
            </div>
          ))
        )}
      </div>

      {pickerOpen && (
        <MobileUnitPickerModal
          onClose={() => setPickerOpen(false)}
          onSelect={handleAddUnit}
        />
      )}
    </div>
  );
}
