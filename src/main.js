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

const JUMP_FORCE = 420
const MOVE_SPEED = 140

scene('main', () => {
  add([
    sprite('bg'),
    scale(width() / 5, height() / 5),
    origin('center'),
  ])

  const map = addLevel([
    '                          ',
    '                          ',
    '                 x        ',
    '                          ',
    '  bbbbbbbbbbbb            ', 
    '                          ',
    '              bbbbb       ',
    '                          ',
    '   =====           bbbbb  ',
    '                          ',
    '                          ',
    '         ===              ',
    '                          ',
    'bbbbbbbbb====   === bbbb===',
    '                          ',
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
    console.log(player)
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
  
  let rot = 0
  const CAM_ROT_SPEED = 0.002
  const jump = () => player.jump(JUMP_FORCE) 
  const playerIdle = () => player.play('idle')
  const playerAction = () => {
    player.angle -= rot
    camRot(rot)
    camPos(player.pos)
    if (!player.grounded()) {
      player.dir === 'right'
        ? rot += CAM_ROT_SPEED
        : rot -= CAM_ROT_SPEED
    } else {
      rot = 0
    }
  }

  keyPress('space', jump)
  keyRelease('left', () => playerIdle())
  keyRelease('right', () => playerIdle())
  keyDown('left', () => movePlayer('left'))
  keyDown('right', () => movePlayer('right'))
  player.action(playerAction)

  const handleBoxTouched = (p, b) => b.use(body())

  const handlePlayerEnemyCollide = (p, e) => {
    camShake(12)
  }

  collides('player', 'box', handleBoxTouched)
  collides('player', 'enemy', handlePlayerEnemyCollide)
})

start('main')