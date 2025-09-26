# 🎮 Tic-Tac-Toe Full-Stack

Una aplicación completa de Tic-Tac-Toe multijugador desarrollada con Node.js y React con Vite.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuario
- **Vite** - Herramienta de desarrollo rápida
- **Socket.IO Client** - Comunicación en tiempo real

### Backend
- **Node.js** - Entorno de ejecución JavaScript
- **Express** - Framework web minimalista
- **Socket.IO** - WebSockets para tiempo real
- **PostgreSQL** - Base de datos relacional
- **Docker** - Containerización

### Infraestructura
- **Docker Compose** - Orquestación de contenedores
- **Nginx** - Servidor web y proxy reverso
- **PostgreSQL 15** - Base de datos en contenedor

## 📋 Características

- ✅ **Multijugador Online** con WebSockets en tiempo real
- ✅ **Multijugador Local** para jugar en el mismo dispositivo
- ✅ **Sistema de ranking** y estadísticas online
- ✅ **Panel de administración**
- ✅ **Interfaz responsive** y moderna
- ✅ **Arquitectura full-stack containerizada**
- ✅ **Base de datos persistente**

### 🎮 Modos de Juego

#### 🌐 Multijugador Online
- Jugar contra otros jugadores conectados desde cualquier lugar
- Crear salas privadas o unirse a salas existentes
- Sistema de ranking global
- Estadísticas persistentes en base de datos
- Comunicación en tiempo real con WebSockets

#### 👥 Multijugador Local
- Jugar con un otro usuario en el mismo dispositivo
- Estadísticas locales guardadas en el navegador
- Sin necesidad de conexión a internet para jugar

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### 🐳 Instalación con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd pruebaFinanzauto
   ```

2. **Iniciar la aplicación**
   ```bash
   # Usando Docker Compose
   docker-compose build
   docker-compose up -d
   ```

3. **Acceder a la aplicación**
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - Base de datos: puerto 5432

4. **Detener la aplicación**
   ```bash

   # Usando Docker Compose
   docker-compose down
   ```

## � Estructura del Proyecto

```
pruebaFinanzauto/
├── 📁 backend/                 # Servidor Node.js
│   ├── 📁 src/
│   │   ├── server.js          # Punto de entrada del servidor
│   │   ├── 📁 controllers/    # Controladores de rutas
│   │   ├── 📁 database/       # Modelos y conexión BD
│   │   ├── 📁 middleware/     # Middlewares personalizados
│   │   ├── 📁 routes/         # Definición de rutas API
│   │   └── 📁 websocket/      # Lógica de WebSockets
│   ├── database_init.sql      # Script de inicialización BD
│   └── package.json          # Dependencias del backend
├── 📁 frontend/               # Aplicación React
│   ├── 📁 src/
│   │   ├── App.jsx           # Componente principal
│   │   ├── 📁 components/    # Componentes de React
│   │   │   ├── Login.jsx         # Pantalla de login
│   │   │   ├── GameModeSelector.jsx  # Selector de modo de juego
│   │   │   ├── GameLobby.jsx     # Lobby online
│   │   │   ├── GameBoard.jsx     # Tablero online
│   │   │   ├── LocalGameBoard.jsx    # Tablero local
│   │   │   └── AdminPanel.jsx    # Panel administrativo
│   │   ├── 📁 services/      # Servicios y contextos
│   │   └── 📁 styles/        # Archivos CSS
│   ├── nginx.conf          # Configuración Nginx
│   └── package.json        # Dependencias del frontend
├── .env.docker             #
├── docker-compose.yml      # Orquestación de servicios
├── Dockerfile            # Imagen Docker del frontend y backend
├── package.json           # Scripts principales del proyecto
└── README.md             # Este archivo
```

## 🎯 Scripts Disponibles

### Scripts de Docker
```bash
npm run docker:build    # Construir imágenes Docker
npm run docker:up       # Iniciar contenedores
npm run docker:down     # Detener contenedores
npm run docker:logs     # Ver logs de contenedores
npm run docker:restart  # Reiniciar servicios
```

## 🌐 API Endpoints

### Estadísticas y Administración
- `GET /api/stats/admin` - Estadísticas para administración
- `GET /api/ranking` - Ranking global de jugadores
- `GET /api/recent-games` - Partidas recientes

### WebSocket Events
- `register_user` - Registrar usuario en el sistema
- `create_room` - Crear sala de juego
- `join_room` - Unirse a una sala existente
- `make_move` - Realizar movimiento en el tablero
- `get_available_rooms` - Obtener salas disponibles
- `get_player_stats` - Obtener estadísticas del jugador
- `leave_game` - Abandonar partida actual

#### Eventos de Notificación en Tiempo Real
- `new_room_available` - Notifica cuando se crea una nueva sala
- `room_no_longer_available` - Notifica cuando una sala se ocupa

## Comunicación Frontend-Backend

### Arquitectura de Comunicación

La aplicación utiliza **dos tipos de comunicación**:

#### 📡 **WebSockets (Socket.IO)** - Tiempo Real
- **Puerto**: 3000 (mismo que el backend)
- **Propósito**: Comunicación bidireccional para el juego en tiempo real
- **Uso**: Login, salas de juego, movimientos, estadísticas dinámicas

#### 🌐 **HTTP REST API** - Datos Estáticos
- **Puerto**: 3000/api
- **Propósito**: Consultas de datos administrativos
- **Uso**: Panel de administración (ranking, estadísticas, partidas recientes)

### Compatibilidad Multi-dispositivo

La aplicación detecta automáticamente si está ejecutándose en:
- **localhost** → Se conecta a `http://localhost:3000`
- **Red local** → Se conecta a `http://[IP_LOCAL]:3000`

Esto permite jugar entre diferentes dispositivos en la misma red.

## 🔧 Configuración

### Variables de Entorno (Docker)
La aplicación utiliza el archivo `.env.docker` para la configuración de producción:
```env
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=tic_tac_toe_db
DB_USER=postgres
DB_PASSWORD=postgres123
CORS_ORIGIN=http://localhost
```

### Configuración de Base de Datos
La base de datos se inicializa automáticamente con el script `database_init.sql` que incluye:
- Tablas de usuarios
- Tablas de partidas
- Índices optimizados
- Datos de ejemplo

## Solución de Problemas


### Problemas con contenedores
```bash
# Ver logs de la aplicación
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Reconstruir imágenes
docker-compose build --no-cache

# Limpiar todo y empezar de nuevo
docker-compose down -v
docker-compose up -d
```

### Problemas con la base de datos
```bash
# Ver logs de PostgreSQL
docker-compose logs postgres

# Reiniciar solo la base de datos
docker-compose restart postgres

# Resetear base de datos (⚠️ borra todos los datos)
docker-compose down -v
docker-compose up postgres -d
```

## 👨‍💻 Autor

Steven Diaz
