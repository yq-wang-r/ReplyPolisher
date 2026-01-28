import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { AIProvider, AppLanguage, ProviderConfig, TRANSLATIONS, DEFAULT_CONFIG, Persona, PERSONA_CONFIG, PERSONA_ORDER } from '../types';
import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: AppLanguage;
  provider: AIProvider;
  config: ProviderConfig;
  defaultPersona: Persona;
  onSave: (newConfig: ProviderConfig) => void;
  onSaveDefaultPersona: (newDefaultPersona: Persona) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  provider,
  config,
  defaultPersona,
  onSave,
  onSaveDefaultPersona
}) => {
  const [localConfig, setLocalConfig] = useState<ProviderConfig>(config);
  const [localDefaultPersona, setLocalDefaultPersona] = useState<Persona>(defaultPersona);
  const t = TRANSLATIONS[language];

  // Sync local state when prop config changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setLocalDefaultPersona(defaultPersona);
    }
  }, [isOpen, config, defaultPersona]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onSaveDefaultPersona(localDefaultPersona);
    onClose();
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG[provider]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {t.settings}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* General Settings Section */}
          <div className="space-y-3">
             <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-900">{t.generalSettings}</h3>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">{t.defaultPersona}</label>
              <div className="relative">
                <select
                  value={localDefaultPersona}
                  onChange={(e) => setLocalDefaultPersona(e.target.value as Persona)}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none bg-gray-50"
                >
                  {PERSONA_ORDER.map(personaId => (
                    <option key={personaId} value={personaId}>
                      {language === AppLanguage.CHINESE ? PERSONA_CONFIG[personaId].labelZh : PERSONA_CONFIG[personaId].label}
                    </option>
                  ))}
                </select>
                 {/* Custom Arrow for select */}
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <hr className="border-gray-100" />

          {/* Provider Config Section */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-900">{t.configFor} {provider}</h3>
              <p className="text-xs text-gray-500">
                {provider === AIProvider.GOOGLE 
                  ? 'Configure your Google Gemini connection.' 
                  : 'Configure any OpenAI-compatible API (SiliconFlow, DeepSeek, local LLMs, etc.).'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">{t.apiKey}</label>
                <input
                  type="password"
                  value={localConfig.apiKey}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  placeholder={t.placeholderKey}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>

              {/* Base URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">{t.baseUrl}</label>
                <input
                  type="text"
                  value={localConfig.baseUrl || ''}
                  onChange={(e) => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                  placeholder={provider === AIProvider.GOOGLE 
                    ? "e.g. https://generativelanguage.googleapis.com (Optional)" 
                    : t.placeholderBaseUrl}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono text-gray-600 bg-gray-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">{t.modelName}</label>
                <input
                  type="text"
                  value={localConfig.model}
                  onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                  placeholder={t.placeholderModel}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-mono text-gray-600 bg-gray-50"
                />
              </div>
            </div>
            
            <div className="pt-2">
               <button
                 onClick={handleReset}
                 className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1 transition-colors"
               >
                 <RotateCcw className="h-3 w-3" />
                 {t.reset}
               </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose} className="h-9 px-4 py-0">
            {t.cancel}
          </Button>
          <Button onClick={handleSave} className="h-9 px-4 py-0">
            {t.save}
          </Button>
        </div>
      </div>
    </div>
  );
};