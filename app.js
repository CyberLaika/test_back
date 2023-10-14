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

const sessions = {}

io.on('connection', (socket) => {
  console.log('connected')
  const player = new Player(500 * Math.random(), 500 * Math.random())
  const bot = new Player(500 * Math.random(), 500 * Math.random())
  sessions[socket.id] = new Session(player, bot, socket.id)



  const sessionInfo = {
    playerX: player.x,
    playerY: player.y,
    botX: bot.x,
    botY: bot.y,
  }
  console.log(sessionInfo)

  io.emit('sessionInfo', sessionInfo)
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
 