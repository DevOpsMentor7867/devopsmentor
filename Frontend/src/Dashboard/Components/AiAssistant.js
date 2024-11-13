import React from 'react'
import { X } from 'lucide-react'

function AiAssistant({ isOpen, onClose }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Ask AI Assistant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4">
          <textarea 
            placeholder="Ask anything about Docker..."
            className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none"
          />
          <button className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90">
            Send Question
          </button>
        </div>
      </div>
    </div>
  )
}

export default AiAssistant