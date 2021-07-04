kaboom({
  global: true,
  fullscreen: true,
  scale: 3,
})

loadRoot('../assets/kenney_pixelplatformer/')
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

scene('main', () => {
  add([
    sprite('bg'),
    scale(width() / 5, height() / 5),
    origin('center'),
  ])



  addLevel([
    ...`

    bbbbbbbbbbbb              x           x x       
    
          bbbbbbbbbbbb                         bbbbb
  ===================  ==   ===============bbbbb============   =================bbbb================
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
    ]
  })

  const player = add([
    sprite('player', { animSpeed: 0.2 }),
    origin('center'),
    pos(100, -10),
    scale(-1, 1),
    body(),
    'player',
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

  keyDown('left', () => movePlayer('left'))
  keyDown('right', () => movePlayer('right'))
  keyDown('a', () => movePlayer('left'))
  keyDown('d', () => movePlayer('right'))
  keyPress('w', jump)
  keyPress('space', jump)

  keyRelease('a', () => playerIdle())
  keyRelease('d', () => playerIdle())
  keyRelease('left', () => playerIdle())
  keyRelease('right', () => playerIdle())

  player.action(playerAction)
  player.on('grounded', playerIdle)

  const handleBoxTouched = (p, b) => b.use(body())

  const handlePlayerEnemyCollide = (p, e) => {
    camShake(12)
    restart()
  }

  const restart = () => player.pos = vec2(200, 0)

  collides('player', 'box', handleBoxTouched)
  collides('player', 'enemy', handlePlayerEnemyCollide)
})

start('main')