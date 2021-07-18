kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  connect: 'ws://localhost:8081',
})

const baseURL = `${window.location.origin}${window.location.pathname}`

function health(hp) {
  // these functions will directly assign to the game object
  return {
      hurt(n) {
          hp -= n;
          if (hp <= 0) {
              // trigger a custom event
              this.trigger("death");
          }
      },
      heal(n) {
          hp += n;
      },
      hp() {
          return hp;
      },
  };
}

loadRoot(`${baseURL}assets/`)
loadSound('lowFreqExplosion', 'sci-fi-sounds/Audio/lowFrequency_explosion_001.ogg')
loadSound('thrusterFire', 'sci-fi-sounds/Audio/thrusterFire_000.ogg')
loadSound('laser', 'sci-fi-sounds/Audio/laserSmall_000.ogg')
loadSprite('bg', '/kenney_pixelplatformer/Background/background_purple.png')
loadSprite('ground', '/kenney_pixelplatformer/Tiles/tile_0000.png')
loadSprite('box', '/kenney_pixelplatformer/Tiles/tile_0026.png')
loadSprite('ufo', '/alien-ufo-pack/PNG/shipYellow_manned.png')
loadSprite('bomb', '/kenney_pixelplatformer/Characters/character_0008.png')
loadSprite('walker', '/kenney_pixelplatformer/Tilemap/characters_packed.png', {
  sliceX: 9,
  sliceY: 3.1,
  anims: {
    run: {
      from: 0,
      to: 1.9
    },
    jump: {
      from: 1,
      to: 1.99
    },
    idle: { 
      from: 0,
      to: 0,
    }
  }
})
loadSprite('player', '/kenney_pixelplatformer/Tilemap/characters_packed.png', {
  sliceX: 9,
  sliceY: 3.1,
  anims: {
    run: {
      from: 0,
      to: 1.9
    },
    jump: {
      from: 1,
      to: 1.99
    },
    idle: { 
      from: 0,
      to: 0,
    }
  }
})

const HEIGHT = height()
const JUMP_FORCE = 420
const MOVE_SPEED = 140
const CAM_ROT_SPEED = 0.002

const players = {}

let shots = 5
let jumpCount = 0



scene('main', () => {
  
  layers(['bg', 'main', 'ui'], 'main')

  add([
    sprite('bg'),
    layer('bg'),
    scale(width() / 5, height() / 5),
    origin('center'),
  ])
  
  camIgnore(['bg'])

  addLevel([
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '     =====            ',
    '                      ',
    '                      ',
    '              bbbb    ',
    '                  u   ',
    '     u                ',
    '                      ',
    '                      ',
    '      bb              ',
    '        bb            ',
    '                      ',
    '              u       ',
    '                      ',
    '             =======  ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '                      ',
    '  =======             ',
    '                      ',
    '                     ',
    '                      ',
    '                      ',
    '====      ====     ===',
  ], {
    width: 22,
    height: 22,
    pos: vec2(0, 0),
    '=': [
      sprite('ground'),
      solid(),
      'ground',
    ],
    'b': [
      sprite('box'),
      solid(),
      'box'
    ],
    'x': [
      sprite('walker'),
      color(rgba(1, 1, 0, 1)),
      body(),
      'walker',
      'enemy',
      'killable',
      { dir: 'left' }
    ],
    'o': [
      sprite('bomb'),
      body(),
      'bomb',
      'enemy',
      'killable',
    ], 
    'u': [
      sprite('ufo'),
      scale(0.19),
      'ufo',
      'enemy',
      'killable',
      'patrol', 
    ]
  })

  const playerDef = [
    sprite('player', { animSpeed: 0.2 }),
    origin('center'),
    scale(-1, 1),
    body(),
    'player',
    'killable',
    health(12),
    {
      dir: 'right',
    }
  ]

  const player = add([
    ...playerDef, 
    pos(Math.floor(Math.random() * (500 - 100) + 100, -10))
  ])

  send('ADD_PLAYER', { pos: player.pos })

  recv('ADD_PLAYER', data => {
    players[data.id] = add([
      ...playerDef,
      pos(data.pos),
    ])
  })

  recv('UPDATE_PLAYER', (id, data) => {
    if (players[id]) {
      console.log(moving)
      players[id].pos = vec2(data.pos)
    }
  })

  const sendUpdate = () => send('UPDATE_PLAYER', {
    pos: player.pos
  })
  
  const movePlayer = dir => { 
    player.dir = dir
    if (player.grounded() && player.curAnim() !== 'run')
      player.play('run')
    if (dir === 'left') {
      player.flipX(1)
      player.move(-MOVE_SPEED, 0)
    } else {
      player.flipX(-1)
      player.move(MOVE_SPEED, 0)
    }
    sendUpdate()
  }
  
  const jump = () => {
    player.play('jump')
    if (jumpCount < 2) {
      let jf = JUMP_FORCE
      if (jumpCount === 1) {
        const sfx = play('thrusterFire')
        jf += 200
        let opacity = 1
        const thrust = add([
          rect(8, 15),
          pos(player.pos.x, player.pos.y - (player.height / 2.5)),
          origin('top'),
          color(rgba(1, 1, 0, opacity)),
        ])
        thrust.action(() => {
          thrust.pos = vec2(player.pos.x, player.pos.y + 10)
          opacity -= 0.04
          thrust.color = rgba(1, 1, 0, opacity)
        })
        wait(0.25, () => {
          sfx.stop()
          destroy(thrust)
        })
      } else {
        play('laser', { detune: 1200 })
      }
      player.jump(jf) 
      jumpCount++
    }
  }
  
  const playerIdle = grounded => {
    player.play('idle')
    if (grounded) {
      jumpCount = 0
    }
  }

  const playerAction = () => {
    camPos(player.pos) 
    // player has fallen
    // if (player.pos.y > HEIGHT - 300 ) {
    //   console.log('you lose')
    // }
  }

  const addLaser = () => {
    const diffX = mousePos().x - player.pos.x
    const diffY = mousePos().y - player.pos.y
    const above = player.pos.y <= mousePos().y
    const right = player.pos.x <= mousePos().x 
    const moveX = right ? MOVE_SPEED : -MOVE_SPEED
    const shootingStraight = Math.abs(diffY) < 10
    const offsetX = right ? 20 : -20
    const offsetY = !shootingStraight ? above ? 20 : -20 : 0
    const tangent = diffY / diffX
    play('laser')
    const l = add([
      rect(10, 3),
      origin('center'),
      rotate(-tangent),
      pos((player.pos.x + offsetX), (player.pos.y + offsetY)),
      color(0, 1, 1),
      'laser',
    ])
    const trajectory = vec2(moveX * 2, diffY * 2)
    l.action(() => l.move(trajectory))
    wait(1, () => destroy(l))
  }

  const playerShoot = () => {
    addLaser()
  }

  const handleBoxTouched = (p, b) => wait(.25, () => b.use(body()))

  const handlePlayerEnemyCollide = (p, e) => {
    play('lowFreqExplosion')
    camShake(12)
    // restart()
    const tempCol = player.color
    player.color = rgba(1, 0, 0, 1)
    player.hurt(1)
    wait(.5, () => player.color = tempCol)
  }

  const restart = () => go('main')

  player.action(playerAction)
  player.on('grounded', () => playerIdle(true))

  // input
  keyDown('left', () => movePlayer('left'))
  keyDown('right', () => movePlayer('right'))
  keyDown('a', () => movePlayer('left'))
  keyDown('d', () => movePlayer('right'))
  keyPress('up', jump)
  keyPress('w', jump)
  keyRelease('a', () => playerIdle())
  keyRelease('d', () => playerIdle())
  keyRelease('left', () => playerIdle())
  keyRelease('right', () => playerIdle())
  mouseClick(playerShoot)

  // collisions
  collides('player', 'box', handleBoxTouched)
  collides('player', 'enemy', handlePlayerEnemyCollide)
  collides('laser', 'killable', (l, k) => {
    play('lowFreqExplosion')
    destroy(l)
    destroy(k)
  })
  collides("walker", "box", (w, b) => {
    w.dir === 'left' ? w.dir = 'right' : w.dir = 'left'
  });
  
  // listeners
  on('update', 'walker', w => {
    const goingLeft = w.dir === 'left'
    const x = goingLeft ? -MOVE_SPEED : MOVE_SPEED
    if (time() > 1 && !w.grounded()) {
      goingLeft ? w.dir = 'right' : w.dir = 'left'
    }
    w.move(x / 3, 0)
  })

  action('ufo', ufo => {
    const dir = ufo.dir === 'right' ? MOVE_SPEED : -MOVE_SPEED
    ufo.move(vec2(dir/4, 0))
  })

  const ufoShoot = u => {
    const b = add([
      rect(5, 5),
      pos(u.pos.x, u.pos.y),
      color(.6, .6, 0)
    ])
    play('laser', { detune: -1200 })
    const x = player.pos.x - u.pos.x
    const y = player.pos.y - u.pos.y
    u.action(() => b.move(vec2(x, y)))
    wait(.25, () => b.use('laser'))
    wait(2, () => destroy(b))
    return b
  }
  
  loop(3, () => {
    every('ufo', u => {
      // ufoShoot(u)
      u.dir = u.dir === 'right' ? 'left' : 'right'
    })
  })
})


start('main')