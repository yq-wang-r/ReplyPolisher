import React, { useState, useEffect, useRef } from 'react';
import { Wand2, Copy, Eraser, CheckCircle2, MessageSquareQuote, BrainCircuit, Languages, Cpu, Settings } from 'lucide-react';
import { Persona, AppLanguage, TRANSLATIONS, PERSONA_CONFIG, AIProvider, ProviderConfig, DEFAULT_CONFIG } from './types';
import { polishText } from './services/geminiService';
import { Button } from './components/Button';
import { StyleSelector } from './components/StyleSelector';
import { SettingsModal } from './components/SettingsModal';

// --- Helper Component: Auto-Expanding Textarea ---
interface AutoTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (val: string) => void;
  minHeight?: string;
}

const AutoTextarea: React.FC<AutoTextareaProps> = ({ value, onValueChange, className, minHeight = "50px", style, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto'; // Reset to re-calculate shrink
      el.style.height = `${Math.max(el.scrollHeight, parseInt(minHeight))}px`;
    }
  }, [value, minHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={`overflow-hidden resize-none transition-height duration-100 ease-out ${className}`}
      rows={1}
      style={{ ...style, minHeight }}
      {...props}
    />
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [contextText, setContextText] = useState('');
  const [inputText, setInputText] = useState('');
  const [thoughtsText, setThoughtsText] = useState('');
  const [outputText, setOutputText] = useState('');
  
  // Configuration State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Load Default Persona from LocalStorage
  const [defaultPersona, setDefaultPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem('replyPolisher_defaultPersona');
    return (saved as Persona) || Persona.BOSS;
  });

  const [selectedPersona, setSelectedPersona] = useState<Persona>(defaultPersona);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(AppLanguage.CHINESE);
  const [provider, setProvider] = useState<AIProvider>(AIProvider.GOOGLE);
  
  const [appConfig, setAppConfig] = useState<Record<AIProvider, ProviderConfig>>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('replyPolisherConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration check: if old config has SILICONFLOW key, map it to OPENAI?
        // Simple approach: just merge with defaults. If user had valid 'SiliconFlow (DeepSeek)' key, it matches the new enum value if we changed the enum string value?
        // Note: Enum values are strings. AIProvider.OPENAI = 'OpenAI Compatible'.
        // If the saved config used the old enum value 'SiliconFlow (DeepSeek)', it might be lost if we don't migrate.
        // However, standard merge usually keeps unknown keys. We just need to ensure OPENAI key is populated.
        
        // We will just re-initialize if the new key is missing
        const merged = { ...DEFAULT_CONFIG, ...parsed };
        
        // Manual migration if needed (optional but good for UX)
        // If 'SiliconFlow (DeepSeek)' exists in parsed but 'OpenAI Compatible' doesn't
        if (parsed['SiliconFlow (DeepSeek)'] && !parsed['OpenAI Compatible']) {
             merged[AIProvider.OPENAI] = parsed['SiliconFlow (DeepSeek)'];
        }
        
        return merged;
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const t = TRANSLATIONS[language];
  const isPolishDisabled = !inputText.trim() || isLoading;

  // Persist config changes
  useEffect(() => {
    localStorage.setItem('replyPolisherConfig', JSON.stringify(appConfig));
  }, [appConfig]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === AppLanguage.ENGLISH ? AppLanguage.CHINESE : AppLanguage.ENGLISH);
  };

  const toggleProvider = () => {
    setProvider(prev => prev === AIProvider.GOOGLE ? AIProvider.OPENAI : AIProvider.GOOGLE);
  };

  const updateConfig = (newProviderConfig: ProviderConfig) => {
    setAppConfig(prev => ({
      ...prev,
      [provider]: newProviderConfig
    }));
  };
  
  const updateDefaultPersona = (newDefault: Persona) => {
    setDefaultPersona(newDefault);
    localStorage.setItem('replyPolisher_defaultPersona', newDefault);
  };

  const handlePolish = async () => {
    if (isPolishDisabled) return;

    setIsLoading(true);
    setOutputText('');
    try {
      const result = await polishText(
        inputText, 
        contextText, 
        thoughtsText, 
        selectedPersona, 
        language, 
        provider,
        appConfig[provider] // Pass the specific config for the active provider
      );
      setOutputText(result);
    } catch (error) {
      console.error(error);
      setOutputText('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    setContextText('');
    setInputText('');
    setThoughtsText('');
    setOutputText('');
    setIsCopied(false);
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isPolishDisabled && !isSettingsOpen) {
          handlePolish();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputText, contextText, thoughtsText, selectedPersona, isLoading, language, isPolishDisabled, provider, appConfig, isSettingsOpen]);

  return (
    <div className={`min-h-screen bg-gray-50/50 py-6 px-4 flex justify-center transition-all ${language === AppLanguage.CHINESE ? 'font-sc' : 'font-sans'}`}>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        provider={provider}
        config={appConfig[provider]}
        defaultPersona={defaultPersona}
        onSave={updateConfig}
        onSaveDefaultPersona={updateDefaultPersona}
      />

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Settings Button */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-primary-600 transition-colors text-gray-500"
          title={t.settings}
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Provider Toggle */}
        <button 
          onClick={toggleProvider}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border transition-colors text-xs font-semibold
            ${provider === AIProvider.OPENAI 
              ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-600'}
          `}
          title={`Current Provider: ${provider}`}
        >
          <Cpu className="h-3.5 w-3.5" />
          {provider === AIProvider.OPENAI ? 'OpenAI' : 'Gemini'}
        </button>

        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-primary-600 transition-colors text-xs font-semibold text-gray-600"
        >
          <Languages className="h-3.5 w-3.5" />
          {language === AppLanguage.ENGLISH ? '中文模式' : 'English'}
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-6 mt-6">
        
        {/* Compact Header */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <div className={`p-1.5 rounded-lg shadow-md transition-colors ${provider === AIProvider.OPENAI ? 'bg-purple-600' : 'bg-primary-600'}`}>
              <MessageSquareQuote className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t.title}
            </h1>
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100/80">
          <div className="p-5 md:p-6 space-y-5">
            
            {/* Input Group */}
            <div className="space-y-4">
              
              <div className="flex justify-between items-end">
                 <h2 className="text-base font-semibold text-gray-900">{t.messageDetails}</h2>
                 {(inputText || contextText || thoughtsText) && (
                  <button 
                    onClick={handleClear}
                    className="text-xs font-medium text-gray-400 hover:text-red-500 flex items-center transition-colors px-2 py-1 rounded hover:bg-red-50"
                  >
                    <Eraser className="h-3 w-3 mr-1" />
                    {t.clearAll}
                  </button>
                )}
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 flex items-center gap-2 uppercase tracking-wide">
                  {t.contextLabel}
                </label>
                <AutoTextarea
                  minHeight="48px"
                  className="w-full p-3 text-sm text-gray-700 placeholder-gray-400 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-all"
                  placeholder={t.contextPlaceholder}
                  value={contextText}
                  onValueChange={setContextText}
                />
              </div>

              {/* Draft */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {t.draftLabel}
                </label>
                <AutoTextarea
                  minHeight="80px"
                  className="w-full p-3 text-base text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-all shadow-sm"
                  placeholder={t.draftPlaceholder}
                  value={inputText}
                  onValueChange={setInputText}
                  autoFocus
                />
              </div>

              {/* Thoughts */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-indigo-400 flex items-center gap-1 uppercase tracking-wide">
                  <BrainCircuit className="h-3 w-3" />
                  {t.thoughtsLabel}
                </label>
                <AutoTextarea
                  minHeight="48px"
                  className="w-full p-3 text-sm text-gray-700 placeholder-indigo-300/60 bg-indigo-50/40 border border-indigo-100 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-20 transition-all"
                  placeholder={t.thoughtsPlaceholder}
                  value={thoughtsText}
                  onValueChange={setThoughtsText}
                />
              </div>

            </div>

            {/* Persona Dropdown */}
            <div className="relative z-50">
              <StyleSelector 
                selectedPersona={selectedPersona} 
                onSelect={setSelectedPersona} 
                disabled={isLoading}
                language={language}
              />
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                onClick={handlePolish} 
                isLoading={isLoading} 
                disabled={!inputText.trim()}
                fullWidth
                className={`h-12 text-base shadow-lg ${provider === AIProvider.OPENAI ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20' : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/20'}`}
              >
                {!isLoading && <Wand2 className="mr-2 h-4 w-4" />}
                {isLoading ? t.polishing : t.polishButton}
              </Button>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                {t.proTip}
              </p>
            </div>

          </div>
        </div>

        {/* Output Section - Only shows when there is result */}
        {outputText && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 pb-10">
            <div className={`bg-white rounded-xl shadow-lg border overflow-hidden relative ${provider === AIProvider.OPENAI ? 'border-purple-100' : 'border-primary-100'}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${provider === AIProvider.OPENAI ? 'bg-purple-500' : 'bg-primary-500'}`}></div>
              <div className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{t.polishedResult}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t.personaLabel}: {language === AppLanguage.CHINESE ? PERSONA_CONFIG[selectedPersona].labelZh : PERSONA_CONFIG[selectedPersona].label}
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500">
                        {provider === AIProvider.OPENAI 
                           ? (appConfig[AIProvider.OPENAI].model || 'DeepSeek-V3')
                           : (appConfig[AIProvider.GOOGLE].model || 'Gemini 3 Flash')
                        }
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={handleCopy}
                    className="shrink-0 h-8 text-xs px-3"
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1.5 text-green-600" />
                        <span className="text-green-600">{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1.5" />
                        {t.copy}
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {outputText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;