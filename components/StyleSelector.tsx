import React, { useState, useRef, useEffect } from 'react';
import { Persona, PERSONA_CONFIG, AppLanguage, TRANSLATIONS, PERSONA_ORDER } from '../types';
import { Check, ChevronDown } from 'lucide-react';

interface StyleSelectorProps {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
  disabled?: boolean;
  language: AppLanguage;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
  selectedPersona, 
  onSelect,
  disabled,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];
  const selectedConfig = PERSONA_CONFIG[selectedPersona];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: Persona) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <label className="text-sm font-medium text-gray-700 block">
        {t.selectPersona}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between p-3 
            bg-white border rounded-xl shadow-sm transition-all text-left
            ${isOpen ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-400'}
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-center gap-3 overflow-hidden">
             <span className="text-xl flex-shrink-0">{selectedConfig.icon}</span>
             <div className="flex flex-col min-w-0">
               <span className="text-sm font-semibold text-gray-900 truncate">
                 {language === AppLanguage.CHINESE ? selectedConfig.labelZh : selectedConfig.label}
               </span>
               <span className="text-xs text-gray-500 truncate">
                 {language === AppLanguage.CHINESE ? selectedConfig.descriptionZh : selectedConfig.description}
               </span>
             </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="custom-scrollbar absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black ring-opacity-5">
            <div className="p-1">
              {PERSONA_ORDER.map((personaId) => {
                const config = PERSONA_CONFIG[personaId];
                const isSelected = selectedPersona === config.id;
                return (
                  <button
                    key={config.id}
                    onClick={() => handleSelect(config.id)}
                    className={`
                      w-full flex items-center justify-between p-2.5 rounded-lg mb-0.5 transition-colors
                      ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-xl flex-shrink-0">{config.icon}</span>
                      <div className="text-left flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                          {language === AppLanguage.CHINESE ? config.labelZh : config.label}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {language === AppLanguage.CHINESE ? config.descriptionZh : config.description}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};