let path = require('path')
let express = require('express')
let conf = require('../conf')

let app = require('express')()
let server = require('http').Server(app)
let io = require('socket.io')(server)

let servers = require('./server-group')()
let router = require('./router')(servers)

// Start server
server.listen(conf.port, '127.0.0.1', function () {
  console.log('Server listening on port', conf.port)
})

// Add ./public
app.use(express.static(path.join(__dirname, 'public')))
app.use(router)

// Socket.io real-time updates
io.on('connection', function (socket) {
  console.log('Socket.io connection')

  function emitChange () {
    socket.emit('change', { monitors: servers.list() })
  }

  servers.on('change', emitChange)
  emitChange()

  socket.on('stop', (id) => servers.stop(id))
  socket.on('start', (id) => servers.start(id))
})
