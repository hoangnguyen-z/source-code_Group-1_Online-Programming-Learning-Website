
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Terminal, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import { simulateCodeExecution } from '../services/geminiService';

interface CodeEditorProps {
  initialCode: string;
  language: string;
  onRun?: (code: string) => void;
  onSubmit?: (code: string) => void;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, language, onRun, onSubmit, onChange, readOnly = false }) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setCode(initialCode);
    setOutput('');
    setStatus('idle');
  }, [initialCode]);

  const handleCodeChange = (newCode: string) => {
    if (!readOnly) {
      setCode(newCode);
      if (onChange) {
        onChange(newCode);
      }
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code on secure sandbox...');
    setStatus('idle');

    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 600));

    const result = await simulateCodeExecution(code, language);
    
    setOutput(result);
    setIsRunning(false);
    
    if (result.toLowerCase().includes('error') || result.toLowerCase().includes('exception')) {
      setStatus('error');
    } else {
      setStatus('success');
    }

    if (onRun) onRun(code);
  };

  return (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <span className="text-xs text-gray-400 font-mono uppercase flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${readOnly ? 'bg-red-500' : 'bg-green-500'}`}></span>
          {language}
        </span>
        <div className="flex gap-2">
          {!readOnly && (
            <button 
              onClick={() => {
                setCode(initialCode);
                if (onChange) onChange(initialCode);
              }}
              className="p-1 text-gray-400 hover:text-white transition"
              title="Reset Code"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition disabled:opacity-50"
          >
            <Play className="w-3 h-3" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          {onSubmit && !readOnly && (
             <button 
             onClick={() => onSubmit(code)}
             className="flex items-center gap-1 bg-primary hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium transition"
           >
             <Save className="w-3 h-3" />
             Submit
           </button>
          )}
        </div>
      </div>

      {/* Editor Area (Mock Monaco) */}
      <div className="flex-1 bg-[#1e1e1e] relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-gray-700 flex flex-col items-end pt-4 text-gray-600 text-sm font-mono pr-2 select-none">
          {Array.from({ length: 20 }).map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          readOnly={readOnly}
          className="w-full h-full pl-12 pt-4 pr-4 bg-[#1e1e1e] text-gray-200 font-mono text-sm resize-none focus:outline-none p-4 leading-6"
          spellCheck={false}
        />
      </div>

      {/* Output Console */}
      <div className="h-40 bg-black border-t border-gray-700 flex flex-col">
        <div className="px-4 py-1 bg-gray-900 text-gray-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            <span>Console Output</span>
          </div>
          {status === 'success' && <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Success</span>}
          {status === 'error' && <span className="text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Error</span>}
        </div>
        <div className="flex-1 p-3 font-mono text-sm text-gray-300 overflow-y-auto whitespace-pre-wrap">
          {output || <span className="text-gray-600 italic">Hit run to see output...</span>}
        </div>
      </div>
    </div>
  );
};
