import { useState } from 'react'
import './GameModeSelector.css'

const GameModeSelector = ({ user, onSelectMode, onBackToLogin }) => {
  const [selectedMode, setSelectedMode] = useState(null)

  const gameModes = [
    {
      id: 'online',
      title: 'Multijugador Online',
      subtitle: 'Juega contra otros jugadores en línea',
      description: 'Conecta con jugadores de todo el mundo, crea salas privadas y disfruta partidas en tiempo real.',
      features: [
        'Partidas en tiempo real',
        'Sistema de ranking global',
        'Estadísticas persistentes',
        'Salas privadas'
      ],
      color: 'primary',
      icon: '🌍'
    },
    {
      id: 'local',
      title: 'Multijugador Local',
      subtitle: 'Juega con un amigo en el mismo dispositivo',
      description: 'Modo clásico para jugar con alguien que esté contigo. Perfecto para pasar un rato divertido.',
      features: [
        'Juego instantáneo',
        'Dos jugadores, un dispositivo',
        'Sin necesidad de conexión',
        'Experiencia nostálgica'
      ],
      color: 'secondary',
      icon: '🏠'
    }
  ]

  const handleModeSelect = (mode) => {
    setSelectedMode(mode)
    setTimeout(() => {
      onSelectMode(mode)
    }, 300)
  }

  return (
    <div className="mode-selector-container">
      <div className="mode-selector-card">
        <div className="mode-selector-header">
          <h2>Selecciona el Modo de Juego</h2>
          <p>¡Hola <strong>{user.username}</strong>! ¿Cómo quieres jugar hoy?</p>
        </div>

        <div className="game-modes-grid">
          {gameModes.map((mode) => (
            <div 
              key={mode.id}
              className={`game-mode-card ${mode.color} ${selectedMode === mode.id ? 'selected' : ''}`}
              onClick={() => handleModeSelect(mode.id)}
            >
              <div className="mode-icon">
                {mode.icon}
              </div>
              
              <div className="mode-content">
                <h3>{mode.title}</h3>
                <p className="mode-subtitle">{mode.subtitle}</p>
                <p className="mode-description">{mode.description}</p>
                
                <ul className="mode-features">
                  {mode.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="mode-action">
                <button className="select-button">
                  {selectedMode === mode.id ? 'Cargando...' : 'Seleccionar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mode-selector-footer">
          <button className="back-button" onClick={onBackToLogin}>
            ← Cambiar Usuario
          </button>
          
          <div className="tips">
            <h4>Consejos:</h4>
            <p>• <strong>Online:</strong> Ideal para competir y mejorar tu ranking</p>
            <p>• <strong>Local:</strong> Perfecto para jugar con amigos y familia</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameModeSelector