kaboom({
  global: true,
  fullscreen: true,
  scale: 3,
})

loadRoot('../assets/kenney_pixelplatformer/')
loadSprite('bg', 'Background/Background_purple.png')
loadSprite('ground', 'Tiles/tile_0000.png')
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
    scale(width() / 2, height() / 2),
    origin('topleft'),
  ])

  const map = addLevel([
    '                          ',
    '                          ',
    '              x           ',
    '                          ',
    '                          ',
    '                          ',
    '                          ',
    '                          ',
    '   =====                  ',
    '                          ',
    '                          ',
    '         ===              ',
    '                          ',
    '===============   ===     ',
    '                          ',
  ], {
    width: 19,
    height: 19,
    pos: vec2(0, 0),
    '=': [
      sprite('ground'),
      solid(),
    ],
    'x': [
      sprite('enemy'),
      color(rgba(1, 1, 0, 1)),
      body(),
    ]
  })

  const player = add([
    sprite('player', { animSpeed: 0.2 }),
    origin('center'),
    pos(100, -10),
    scale(-1, 1),
    body(),
  ])

  const jump = () => {
    player.play("jump");
    player.jump(JUMP_FORCE)
  }

  const movePlayer = dir => { 
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

  const playerIdle = () => player.play('idle')
  const playerAction = () => {

  }

  keyPress('space', jump)
  keyRelease('left', () => playerIdle())
  keyRelease('right', () => playerIdle())
  keyDown('left', () => movePlayer('left'))
  keyDown('right', () => movePlayer('right'))

  player.action(playerAction)

  // level
  add([
    rect(width(), 12),
    pos(0, 280),
    origin('topleft'),
    solid(),
    color(rgba(0, 1, 1, 0.5))
  ])
})

start('main')