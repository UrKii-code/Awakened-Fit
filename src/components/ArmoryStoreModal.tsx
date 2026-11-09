import React, { useState } from 'react';
import { CosmeticItem, COSMETIC_STORE_ITEMS } from '../data/store';
import { 
  X, 
  Coins, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  ShoppingBag, 
  Lock 
} from 'lucide-react';

interface ArmoryStoreModalProps {
  currentTokens: number;
  ownedItemIds: string[];
  equippedAuraId: string | null;
  onPurchase: (item: CosmeticItem) => void;
  onEquip: (itemId: string) => void;
  onClose: () => void;
}

export const ArmoryStoreModal: React.FC<ArmoryStoreModalProps> = ({
  currentTokens,
  ownedItemIds,
  equippedAuraId,
  onPurchase,
  onEquip,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'aura' | 'frame' | 'title'>('all');

  const filteredItems = COSMETIC_STORE_ITEMS.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#090e1f] border border-amber-500/30 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base font-['Cinzel',serif] text-slate-100">
                Hunter Token Armory
              </h2>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>Earned via physical workouts</span>
                <span>•</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {currentTokens} Tokens Available
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Anti-Pay-to-Win Ethical Notice (Spec Principle) */}
        <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-800/40 flex items-center gap-2 text-xs text-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Zero Pay-to-Win Pledge:</strong> Hunter Tokens cannot be bought with real money. Cosmetics and auras reflect genuine sweat and consistency.
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-950/60 overflow-x-auto text-xs font-mono">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'aura', label: 'Aura Radiance' },
            { id: 'frame', label: 'Crest Frames' },
            { id: 'title', label: 'Honor Titles' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-2 rounded-t-lg transition border-b-2 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Store Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map(item => {
            const isOwned = ownedItemIds.includes(item.id);
            const isEquipped = equippedAuraId === item.id;
            const canAfford = currentTokens >= item.tokenPrice;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition ${
                  isEquipped
                    ? 'bg-amber-950/20 border-amber-400 ring-1 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : isOwned
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: item.previewColor, boxShadow: item.glowEffect }}
                      />
                      <span className="font-bold text-xs text-slate-100">{item.name}</span>
                    </div>

                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-300">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{item.tokenPrice} T</span>
                  </div>

                  <div>
                    {isEquipped ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => onEquip(item.id)}
                        className="px-3.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => onPurchase(item)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {canAfford ? 'Acquire' : 'Need Tokens'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
