/*
 * Command-line module for initialising the server app.
 */
import app from '../app/index.js'
import debug from 'debug'
import http from 'http'

// initialise debug module
const eptoDebug = debug('epto:server')

// normalize a port into a number, string, or false
const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

// event listener for HTTP server "error" event
const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)

    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)

    default:
      throw error
  }
}

// event listener for HTTP server "listening" event
const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  eptoDebug('Listening on ' + bind)
}

// get port from environment and store in Express
const port = normalizePort(process.env.PORT || '3001')
app.set('port', port)

// create HTTP server
const server = http.createServer(app)

// listen on provided port, on all network interfaces
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
