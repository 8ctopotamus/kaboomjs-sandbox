const ws = require('ws')

const PORT = process.env.PORT || 8081

const server = new ws.Server({ port: PORT })

let lastID = 0
const players = {}

server.on('connection', conn => {
  const id = lastID++

  const broadcast = data => server.clients.forEach(client => {
    if (client !== conn && client.readyState === ws.OPEN) {
      client.send(JSON.stringify({
        type: data.type,
        data: data.data,
        id: id
      }))
    }
  })

  for (const id in players) {
    conn.send(JSON.stringify({
      type: 'ADD_PLAYER',
      data: players[id],
      id,
    }))
  }

  conn.on('message', incoming => {
    const data = JSON.parse(incoming)
    switch(data.type) {
      case 'ADD_PLAYER':
        players[id] = data.data
        broadcast(data)
        break
      case 'UPDATE_PLAYER':
        console.log(data.data.pos)
        players[id].pos = data.data.pos
        broadcast(data)
        break
    }
  })

})

console.log(`ws://localhost:${PORT}`)