
const express = require('express')
const app = express()
const port = 3000


class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
}


class Session {

  constructor(player, bot, session) {
    this.player = player
    this.bot = bot
    this.session = session
  }
}


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
  io.to(socket.id).emit('sessionInfo', sessionInfo);

  socket.on('disconnect', (reason) => {
    console.log(`Client gone [id=${socket.id}]`)
    delete sessions[socket.id]
  })
})


io.on('updatePlayer', (updatePlayerState) => {
  console.log(`update is here`)
  const currentPlayer = sessions[updatePlayerState['sessionId']]
  console.log(`it is update from user ${currentPlayer}`)
  console.log(`update is ${updatePlayerState}`)
})


// setInterval(() => {
//   io.emit('updatePlayers', backEndPlayers)
// }, 15)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
 