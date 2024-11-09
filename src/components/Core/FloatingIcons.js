import React from 'react'

export default function FloatingIcons() {
  return (
    <div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-gray-700 opacity-20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 24 + 12}px`,
                // transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🐳", "☸️", "☁️", "🐧", "📝", "🖥️", "🔄", "🌍", "🏗️"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
    </div>
  )
}
