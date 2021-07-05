kaboom({
  global: true,
  fullscreen: true,
  scale: 3,
})

const baseURL = `${window.location.origin}${window.location.pathname}`

loadRoot(`${baseURL}assets/kenney_pixelplatformer/`)
loadSound('lowFreqExplosion', '../sci-fi-sounds/Audio/lowFrequency_explosion_001.ogg')
loadSound('laser', '../sci-fi-sounds/Audio/laserSmall_000.ogg')
loadSprite('bg', 'Background/Background_purple.png')
loadSprite('ground', 'Tiles/tile_0000.png')
loadSprite('box', 'Tiles/tile_0026.png')
loadSprite('enemy', 'Tilemap/characters_packed.png', {
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
loadSprite('bomb', 'Characters/character_0008.png',)
loadSprite('player', 'Tilemap/characters_packed.png', {
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
    o       o      o wda o o    o               o            


    bbbbbbbb              x           x x       
    
    w
          bbbbbbbbbbbb                            bbbb
  ===================  ==   ===============bbbbb==
  `.trim().split('\n'),
  ], {
    width: 19,
    height: 19,
    pos: vec2(0, 0),
    '=': [
      sprite('ground'),
      solid(),
    ],
    'b': [
      sprite('box'),
      solid(),
      'box'
    ],
    'x': [
      sprite('enemy'),
      color(rgba(1, 1, 0, 1)),
      body(),
      'enemy',
      'killable'
    ],
    'o': [
      sprite('bomb'),
      body(),
      'bomb',
      'enemy',
      'killable',
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
    player.play('idle')
    rot = 0
    jumpCount = 0
  }

  const playerAction = () => {
    if (player.pos.y < HEIGHT - 120 ) {
      camPos(player.pos) 
    } 
  }

  const addLaser = () => {
    const right = player.pos.x <= mousePos().x
    const offsetX = right ? 20 : -20
    const l = add([
      rect(5, 2),
      origin('center'),
      pos((player.pos.x + offsetX), player.pos.y),
      color(0, 1, 1),
      'laser',
    ])
    const dirX = right
      ? MOVE_SPEED
      : -MOVE_SPEED
    l.action(() => l.move(vec2(dirX, 0)))
    wait(2, () => destroy(l))
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
})

start('main')