const express = require('express')
const app = express()
const port = 3000


// creating socket.io server
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)


app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {

}

io.on('connection', (socket) => {
  console.log('connected')
  players[socket.id] = {
    x: 100,
    y: 100
  }
  console.log(players)
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
 