import React, { useState } from 'react';
import { XMarkIcon, ClipboardDocumentListIcon } from './Icons';

interface ManualModeModalProps {
  prompt: string;
  context?: string;
  onRespond: (response: string) => void;
  onCancel: () => void;
}

const ManualModeModal: React.FC<ManualModeModalProps> = ({ prompt, context, onRespond, onCancel }) => {
    const [response, setResponse] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = () => {
        if (response.trim()) {
            onRespond(response.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content w-full max-w-3xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-sky-400">Manual AI Request</h2>
                    <button onClick={onCancel} className="p-1 rounded-md hover:bg-slate-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-4 overflow-y-auto pr-2">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-slate-300">Prompt to send to AI {context && <span className="text-amber-400 font-semibold">(Context: {context})</span>}</label>
                            <button onClick={handleCopy} className="flex items-center text-sm text-slate-400 hover:text-sky-400 disabled:opacity-50" disabled={copied}>
                                <ClipboardDocumentListIcon className="w-4 h-4 mr-1" />
                                {copied ? 'Copied!' : 'Copy Prompt'}
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={prompt}
                            rows={12}
                            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-sm font-mono"
                        />
                    </div>

                    <div>
                        <label htmlFor="manualResponse" className="block text-sm font-medium text-slate-300 mb-1">
                            Paste AI Response here
                        </label>
                        <textarea
                            id="manualResponse"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={12}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 focus:ring-sky-500 focus:border-sky-500 text-sm"
                            placeholder="Paste the full response from your external AI tool here..."
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-md text-sm transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={!response.trim()} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md text-sm transition-colors disabled:opacity-50">
                        Submit Response
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualModeModal;