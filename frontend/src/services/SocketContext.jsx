import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket debe usarse dentro de SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const serverUrl = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : `http://${window.location.hostname}:3000`

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setConnected(true)

      const savedUser = localStorage.getItem('tic_tac_toe_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          newSocket.emit('register_user', { username: userData.username })
          newSocket.on('user_registered', (data) => {
            localStorage.setItem('tic_tac_toe_user', JSON.stringify(data.user))
          })
        } catch (error) {
          localStorage.removeItem('tic_tac_toe_user')
        }
      }
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      setConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    connected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
