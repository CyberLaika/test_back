import { createRequire } from "module";
const require = createRequire(import.meta.url);

const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')
const express = require('express')
const app = express()
const port = 3000

import * as util from "util";
import { promisify } from "util";

const log = console.log.bind(console);
const exec = promisify(loadModel);

// Top level await works now


async function loadModel() {
  return await tf.loadLayersModel('file:///home/cyberserver/forge/multiplayer-game-starter-main/tfjsmodelv1/model.json')
}

let model = await exec();

// let model = await loadModel();

function predict(playerX, playerY, bot1X, bot1Y, bot2X, bot2Y) {
  return model.predict(tf.tensor2d(pointsData, [1, 6])).dataSync();
}

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
  }
}

class Session {
  constructor(player, bot1, bot2, session) {
    this.player = player
    this.bot1 = bot1
    this.bot2 = bot2
    this.session = session
    this.gameIsOver = false
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
  const player = new Player(500 * Math.random(), 500 * Math.random())
  const bot1 = new Player(500 * Math.random(), 500 * Math.random())
  const bot2 = new Player(500 * Math.random(), 500 * Math.random())
  sessions[socket.id] = new Session(player, bot1, bot2, socket.id)

  const sessionInfo = {
    playerX: player.x,
    playerY: player.y,
    bot1X: bot1.x,
    bot1Y: bot1.y,
    bot2X: bot2.x,
    bot2Y: bot2.y,
  }
  io.to(socket.id).emit('sessionInfo', sessionInfo);

  socket.on('disconnect', (reason) => {
    console.log(`Client gone [id=${socket.id}]`)
    delete sessions[socket.id]
  })

  socket.on('updatePlayer', ({ x, y }) => {
    sessions[socket.id].player.x = x
    sessions[socket.id].player.y = y
  })
})


function predictMove(id, delta1X, delta1Y, delta2X, delta2Y){
 if (sessions[id].gameIsOver){
      return
    }
    // if ((deltaX * deltaX + deltaY *deltaY) < 49){
    if (false){
      io.to(id).emit('gameOver')
      sessions[id].gameIsOver = true
      return
    }
    sessions[id].bot1.x += delta1X*Math.random()*60
    sessions[id].bot1.y += delta1Y*Math.random()*60
    sessions[id].bot2.x += delta2X*Math.random()*60
    sessions[id].bot2.y += delta2Y*Math.random()*60
    io.to(id).emit('updateBot', (
      {
        x1: sessions[id].bot1.x,
        y1: sessions[id].bot1.y,
        x2: sessions[id].bot2.x,
        y2: sessions[id].bot2.y
      }
      ));
}


setInterval(() => {
  for (const id in sessions){
    let res = predict(
      [
        sessions[id].player.x,
        sessions[id].player.y,
        sessions[id].bot1.x,
        sessions[id].bot1.y,
        sessions[id].bot2.x,
        sessions[id].bot2.y
      ]
      )
    predictMove(id, res[0], res[1], res[2], res[3])
    console.log(res)
  }
}, 15)


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


// function predictMove(id){
//  if (sessions[id].gameIsOver){
//       return
//     }
//     let deltaX = sessions[id].player.x - sessions[id].bot.x
//     let deltaY = sessions[id].player.y - sessions[id].bot.y
//     if ((deltaX * deltaX + deltaY *deltaY) < 49){
//       io.to(id).emit('gameOver')
//       sessions[id].gameIsOver = true
//       return
//     }
//     if (deltaX > 0) {
//       sessions[id].bot.x += Math.min(1, deltaX)
//     } else {
//        sessions[id].bot.x += Math.max(-1, deltaX)
//     }
//     if (deltaY > 0) {
//       sessions[id].bot.y += Math.min(1, deltaY)
//     } else {
//        sessions[id].bot.y += Math.max(-1, deltaY)
//     }

//     io.to(id).emit('updateBot', ({x: sessions[id].bot.x, y: sessions[id].bot.y}));
// }
//  