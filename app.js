const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')
const express = require('express')
const app = express()
const port = 3000

async function loadModel() {
  return await tf.loadLayersModel('file:///home/cyberserver/forge/multiplayer-game-starter-main/tfjsmodelv0/model.json')
}


function loadModelSync() {
  return tf.loadLayersModel('file:///home/cyberserver/forge/multiplayer-game-starter-main/tfjsmodelv0/model.json')
}

let model = loadModel()

let modelSync

async function predict(model, pointsData) {
  // pointsData -> List[float] как тебе такая типизация //заебись
  return (await model).predict(tf.tensor2d(pointsData, [1, 4])).dataSync();
}

function predictSync(model, pointsData) {
  // pointsData -> List[float] как тебе такая типизация //заебись
  return modelSync.predict(tf.tensor2d(pointsData, [1, 4])).dataSync();
}


async function makePredict(playerX, playerY, botX, botY) {
  return await predict(model, [playerX,playerY, botX,botY])
}

function makePredictSync(playerX, playerY, botX, botY) {
  return predictSync(modelSync, [playerX,playerY, botX,botY])
}

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
  }
}

let PredictWork = true


class Session {

  constructor(player, bot, session) {
    this.player = player
    this.bot = bot
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


io.on('connection', async (socket) => {
  let result = await makePredict(0.1,0.1,0.2,0.2)
  console.log('connected')
  console.log(result)
  modelSync = await loadModel()
  let result2 = await makePredictSync(0.1,0.1,0.2,0.2)
  console.log('predict2')
  console.log(result2)
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
    PredictWork = false
    console.log(`Client gone [id=${socket.id}]`)
    delete sessions[socket.id]
  })

  socket.on('updatePlayer', ({ x, y }) => {
    let currentPlayer = sessions[socket.id]
    sessions[socket.id].player.x = x
    sessions[socket.id].player.y = y
  })
})

function predictMove(id){
 if (sessions[id].gameIsOver){
      return
    }
    let deltaX = sessions[id].player.x - sessions[id].bot.x
    let deltaY = sessions[id].player.y - sessions[id].bot.y
    if ((deltaX * deltaX + deltaY *deltaY) < 49){
      io.to(id).emit('gameOver')
      sessions[id].gameIsOver = true
      return
    }
    if (deltaX > 0) {
      sessions[id].bot.x += Math.min(1, deltaX)
    } else {
       sessions[id].bot.x += Math.max(-1, deltaX)
    }
    if (deltaY > 0) {
      sessions[id].bot.y += Math.min(1, deltaY)
    } else {
       sessions[id].bot.y += Math.max(-1, deltaY)
    }

    io.to(id).emit('updateBot', ({x: sessions[id].bot.x, y: sessions[id].bot.y}));
}

function predictMoveNeuro(deltaX, deltaY){
 if (sessions[id].gameIsOver){
      return
    }
    if ((deltaX * deltaX + deltaY *deltaY) < 49){
      io.to(id).emit('gameOver')
      sessions[id].gameIsOver = true
      return
    }
    sessions[id].bot.x += deltaX
    sessions[id].bot.y += deltaY
    io.to(id).emit('updateBot', ({x: sessions[id].bot.x, y: sessions[id].bot.y}));
}


setInterval(() => {
  for (const id in sessions){
    let res = makePredictSync(sessions[id].player.x/500, sessions[id].player.y/500, sessions[id].bot.x/500, sessions[id].bot.y/500)
    predictMoveNeuro(res[0], res[1])
    console.log(res)
  }
}, 15)


// async function waitUntil(condition) {
//   const hui = await makePredict()

//   return await new Promise(resolve => {
//     const interval = setInterval(() => {
//       if (!condition) {  
//         clearInterval(interval)
//       };
//     }, 15);
//   });
// }

// let run = async ()=>{
//   while(true){
//     for (const id in sessions){
//          predictMove(id)
//          let res = await makePredict(sessions[id].player.x/2000, sessions[id].player.y/2000, sessions[id].bot.x/2000, sessions[id].bot.y/2000)
//          console.log("насру внутри run")
//          console.log(res)
//       }
//     await delay(15);
//   }
// }

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
 