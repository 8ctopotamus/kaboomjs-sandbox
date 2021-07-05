kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
})

const baseURL = `${window.location.origin}${window.location.pathname}`

loadRoot(`${baseURL}assets/`)
loadSound('lowFreqExplosion', 'sci-fi-sounds/Audio/lowFrequency_explosion_001.ogg')
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

let rot = 0
let jumpCount = 0

layers(['bg', 'main'], 'main')

scene('main', () => {
  add([
    sprite('bg'),
    layer('bg'),
    scale(width() / 5, height() / 5),
    origin('center'),
  ])
  
  camIgnore(['bg'])

  addLevel([...`
  u




  u                  u
  
  o       o        o     u               
                                

    bbbbbbbb       x       
    
     
          bb             bbbb
  ===========  == ====bbbbb==
  `.trim()
   .split('\n')
   .map(s => s.trim())
  ], {
    width: 18,
    height: 19,
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
      'killable'
    ]
  })

  const player = add([
    sprite('player', { animSpeed: 0.2 }),
    origin('center'),
    pos(100, -10),
    scale(-1, 1),
    body(),
    'player',
    'killable',
    {
      dir: 'right',
    }
  ])
  
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
  }
  
  const jump = () => {
    player.play('jump')
    if (player.grounded() || jumpCount < 2) {
      player.jump(JUMP_FORCE) 
      jumpCount++
    }
  }
  
  const playerIdle = () => {
    rot = 0
    jumpCount = 0
    player.play('idle')
  }

  const playerAction = () => {
    camPos(player.pos) 
    // player has fallen
    if (player.pos.y < HEIGHT - 200 ) {}
  }

  const addLaser = () => {
    const diffX = (mousePos().x - player.pos.x)
    const diffY = (mousePos().y - player.pos.y)
    const above = player.pos.y <= mousePos().y
    const right = player.pos.x <= mousePos().x 
    const moveX = right ? MOVE_SPEED : -MOVE_SPEED
    const shootingStraight = Math.abs(diffY) < 10
    const offsetX = right ? 20 : -20
    const offsetY = !shootingStraight ? above ? 20 : -20 : 0
    const tangent = diffY / diffX
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

  const shoot = () => {
    play('laser')
    addLaser()
  }

  const handleBoxTouched = (p, b) => b.use(body())

  const handlePlayerEnemyCollide = (p, e) => {
    play('lowFreqExplosion')
    camShake(12)
    restart()
  }

  const restart = () => go('main')

  player.action(playerAction)
  player.on('grounded', playerIdle)

  // input
  keyDown('left', () => movePlayer('left'))
  keyDown('right', () => movePlayer('right'))
  keyDown('a', () => movePlayer('left'))
  keyDown('d', () => movePlayer('right'))
  keyPress('w', jump)
  keyRelease('a', () => playerIdle())
  keyRelease('d', () => playerIdle())
  keyRelease('left', () => playerIdle())
  keyRelease('right', () => playerIdle())
  keyPress('space', jump)
  mouseClick(shoot)

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


  const ufoShoot = u => {
    const b = add([
      rect(5, 5),
      pos(u.pos.x, u.pos.y),
      color(.6, .6, 0)
    ])
    u.action(() => b.move(vec2(player.pos.x - u.pos.x, player.pos.y - u.pos.y)))
    wait(.25, () => b.use('laser'))
    wait(2, () => destroy(b))
    return b
  }

  
  
  loop(6, () => {
    every('ufo', u => {
      const laser = ufoShoot(u)
      
    })
  })
})


start('main')