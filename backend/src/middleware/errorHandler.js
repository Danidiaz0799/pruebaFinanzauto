function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: err.message
    });
  }

  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'Error de base de datos',
      error: 'Violación de restricción de datos'
    });
  }

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Error de conexión a la base de datos',
      error: 'Servicio no disponible'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl,
    method: req.method
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};