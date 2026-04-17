'use client';

import { useState, useEffect } from 'react';
import { Settings, X, Save, Loader2 } from 'lucide-react';
import { getLLMConfig, setLLMConfig } from '@/lib/aiService';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettings({ isOpen, onClose }: AISettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gpt-4o-mini');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const config = getLLMConfig();
      setApiKey(config.apiKey);
      setModelName(config.modelName);
      setBaseUrl(config.baseUrl);
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    setLLMConfig({ apiKey, modelName, baseUrl });
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: 'Say "Connection successful!" if you can hear me.' }],
          max_tokens: 50,
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'Connection successful!' });
      } else {
        const error = await response.text();
        setTestResult({ success: false, message: `Error: ${response.status} - ${error}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: `Connection failed: ${error}` });
    }

    setIsTesting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span className="font-semibold text-slate-800">AI Settings</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-slate-500 mt-1">Your API key is stored locally in your browser</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-slate-500 mt-1">OpenAI-compatible API endpoint</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Model Name
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-slate-500 mt-1">e.g., gpt-4o-mini, gpt-4o, claude-3-sonnet</p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={handleTest}
            disabled={isTesting || !apiKey.trim()}
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
