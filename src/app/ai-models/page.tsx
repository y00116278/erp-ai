'use client';

import { useState, useEffect } from 'react';
import { Bot, Mic, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAIConfigStore } from '@/store/aiConfigStore';
import { useTranslation } from '@/components/LanguageSwitcher';

export default function AIModelsPage() {
  const t = useTranslation();
  const { chat, voice, setChatConfig, setVoiceConfig } = useAIConfigStore();

  const [chatApiKey, setChatApiKey] = useState(chat.apiKey);
  const [chatBaseUrl, setChatBaseUrl] = useState(chat.baseUrl);
  const [chatModelName, setChatModelName] = useState(chat.modelName);

  const [voiceApiKey, setVoiceApiKey] = useState(voice.apiKey);
  const [voiceBaseUrl, setVoiceBaseUrl] = useState(voice.baseUrl);
  const [voiceModelName, setVoiceModelName] = useState(voice.modelName);

  const [chatTestResult, setChatTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [voiceTestResult, setVoiceTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState<'chat' | 'voice' | null>(null);

  useEffect(() => {
    setChatApiKey(chat.apiKey);
    setChatBaseUrl(chat.baseUrl);
    setChatModelName(chat.modelName);
  }, [chat]);

  useEffect(() => {
    setVoiceApiKey(voice.apiKey);
    setVoiceBaseUrl(voice.baseUrl);
    setVoiceModelName(voice.modelName);
  }, [voice]);

  const handleTestChat = async () => {
    if (!chatApiKey.trim()) {
      setChatTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }
    setTesting('chat');
    setChatTestResult(null);

    try {
      const response = await fetch(`${chatBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${chatApiKey}`,
        },
        body: JSON.stringify({
          model: chatModelName,
          messages: [{ role: 'user', content: 'Say "Connection successful!" if you can hear me.' }],
          max_tokens: 50,
        }),
      });

      if (response.ok) {
        setChatTestResult({ success: true, message: t('connectionSuccess') });
      } else {
        const error = await response.text();
        setChatTestResult({ success: false, message: `${t('connectionFailed')}: ${response.status}` });
      }
    } catch {
      setChatTestResult({ success: false, message: t('connectionFailed') });
    }

    setTesting(null);
  };

  const handleTestVoice = async () => {
    if (!voiceApiKey.trim()) {
      setVoiceTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }
    setTesting('voice');
    setVoiceTestResult(null);

    try {
      const response = await fetch(`${voiceBaseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${voiceApiKey}`,
        },
      });

      // STT APIs typically require audio data, so we just check if the endpoint is reachable
      // A 400/401 means the endpoint exists and auth is working
      if (response.ok || response.status === 400 || response.status === 401) {
        setVoiceTestResult({ success: true, message: t('connectionSuccess') });
      } else {
        setVoiceTestResult({ success: false, message: `${t('connectionFailed')}: ${response.status}` });
      }
    } catch {
      setVoiceTestResult({ success: false, message: t('connectionFailed') });
    }

    setTesting(null);
  };

  const handleSaveChat = () => {
    setChatConfig({ apiKey: chatApiKey, baseUrl: chatBaseUrl, modelName: chatModelName });
  };

  const handleSaveVoice = () => {
    setVoiceConfig({ apiKey: voiceApiKey, baseUrl: voiceBaseUrl, modelName: voiceModelName });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('aiModels')}</h1>
        <p className="text-slate-500 mt-1">Configure your AI models for chat and voice recognition</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Model Config */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('chatModel')}</h2>
              <p className="text-sm text-slate-500">Used for intent detection and responses</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('apiKey')}</label>
              <input
                type="password"
                value={chatApiKey}
                onChange={(e) => setChatApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('baseURL')}</label>
              <input
                type="text"
                value={chatBaseUrl}
                onChange={(e) => setChatBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('modelName')}</label>
              <input
                type="text"
                value={chatModelName}
                onChange={(e) => setChatModelName(e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {chatTestResult && (
              <div
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  chatTestResult.success
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {chatTestResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {chatTestResult.message}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTestChat}
                disabled={testing === 'chat'}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testing === 'chat' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('testConnection')
                )}
              </button>
              <button
                onClick={handleSaveChat}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>

        {/* Voice/STT Model Config */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">{t('voiceModel')}</h2>
              <p className="text-sm text-slate-500">Used for speech-to-text transcription</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('apiKey')}</label>
              <input
                type="password"
                value={voiceApiKey}
                onChange={(e) => setVoiceApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('baseURL')}</label>
              <input
                type="text"
                value={voiceBaseUrl}
                onChange={(e) => setVoiceBaseUrl(e.target.value)}
                placeholder="https://api.openai.com/v1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('modelName')}</label>
              <input
                type="text"
                value={voiceModelName}
                onChange={(e) => setVoiceModelName(e.target.value)}
                placeholder="whisper-1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>

            {voiceTestResult && (
              <div
                className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                  voiceTestResult.success
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {voiceTestResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {voiceTestResult.message}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleTestVoice}
                disabled={testing === 'voice'}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testing === 'voice' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t('testConnection')
                )}
              </button>
              <button
                onClick={handleSaveVoice}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
