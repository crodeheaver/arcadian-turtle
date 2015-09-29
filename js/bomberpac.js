/* globals Phaser */
var game = new Phaser.Game(448, 496, Phaser.AUTO);

var Bomberpac = function(game) {
    this.map = null;
    this.layer = null;
    this.player = null;

    this.safetile = 14;
    this.gridsize = 16;

    this.speed = 150;
    this.threshold = 3;

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.directions = [null, null, null, null, null];
    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];

    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;

}

Bomberpac.prototype = {
    fireRate: 1000,
    nextFire: 0,
    hit: 0,
    nextHit: 0,
    text: null,
    lives:3,
    init: function() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.physics.startSystem(Phaser.Physics.ARCADE);

    },
    preload: function() {
        this.load.image('dot', 'assets/dot.png');
        this.load.spritesheet('explosion', 'assets/explosions.png', 16, 16, 35, 0, 1);

        game.load.image('tiles', 'assets/pacman-tiles.png');
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.spritesheet('bomberman', 'assets/bomberman.png', 35, 52);
        game.load.spritesheet('ghosts', 'assets/ghosts.png', 32, 32);
        game.load.image('bomb', 'assets/bomb.png');


    },

    create: function() {

        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');
        this.layer = this.map.createLayer('Pacman');

        //  Our bomb group
        this.bombs = game.add.group();
        this.bombs.enableBody = true;
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this.bombs.createMultiple(3, 'bomb');
        //this.bombs.scale.setTo(.8,.8);
        this.bombs.setAll('scale.x', .8);
        this.bombs.setAll('scale.y', .8);
        this.bombs.setAll('anchor.x', 0.5);
        this.bombs.setAll('anchor.y', 0.5);
        this.bombs.setAll('outOfBoundsKill', true);
        this.bombs.setAll('checkWorldBounds', true);

        //center explosion group
        this.centerExplosion = game.add.group();
        this.centerExplosion.enableBody = true;
        this.centerExplosion.physicsBodyType = Phaser.Physics.ARCADE;
        this.centerExplosion.createMultiple(3, 'explosion', 5);
        this.centerExplosion.setAll('scale.x', 1.5);
        this.centerExplosion.setAll('scale.y', 1.5);
        this.centerExplosion.setAll('anchor.x', 0.5);
        this.centerExplosion.setAll('anchor.y', 0.5);
        this.centerExplosion.setAll('outOfBoundsKill', true);
        this.centerExplosion.setAll('checkWorldBounds', true);

        //right explosion group
        this.rightExplosion = game.add.group();
        this.rightExplosion.enableBody = true;
        this.rightExplosion.physicsBodyType = Phaser.Physics.ARCADE;
        this.rightExplosion.createMultiple(3, 'explosion', 2);
        this.rightExplosion.setAll('scale.x', 1.5);
        this.rightExplosion.setAll('scale.y', 1.5);
        this.rightExplosion.setAll('anchor.x', 0.5);
        this.rightExplosion.setAll('anchor.y', 0.5);
        this.rightExplosion.setAll('outOfBoundsKill', true);
        this.rightExplosion.setAll('checkWorldBounds', true);

        //left explosion group
        this.leftExplosion = game.add.group();
        this.leftExplosion.enableBody = true;
        this.leftExplosion.physicsBodyType = Phaser.Physics.ARCADE;
        this.leftExplosion.createMultiple(3, 'explosion', 7);
        this.leftExplosion.setAll('scale.x', 1.5);
        this.leftExplosion.setAll('scale.y', 1.5);
        this.leftExplosion.setAll('anchor.x', 0.5);
        this.leftExplosion.setAll('anchor.y', 0.5);
        this.leftExplosion.setAll('outOfBoundsKill', true);
        this.leftExplosion.setAll('checkWorldBounds', true);

        //top explosion group
        this.topExplosion = game.add.group();
        this.topExplosion.enableBody = true;
        this.topExplosion.physicsBodyType = Phaser.Physics.ARCADE;
        this.topExplosion.createMultiple(3, 'explosion', 8);
        this.topExplosion.setAll('scale.x', 1.5);
        this.topExplosion.setAll('scale.y', 1.5);
        this.topExplosion.setAll('anchor.x', 0.5);
        this.topExplosion.setAll('anchor.y', 0.5);
        this.topExplosion.setAll('outOfBoundsKill', true);
        this.topExplosion.setAll('checkWorldBounds', true);

        //bottom explosion group
        this.bottomExplosion = game.add.group();
        this.bottomExplosion.enableBody = true;
        this.bottomExplosion.physicsBodyType = Phaser.Physics.ARCADE;
        this.bottomExplosion.createMultiple(3, 'explosion', 0);
        this.bottomExplosion.setAll('scale.x', 1.5);
        this.bottomExplosion.setAll('scale.y', 1.5);
        this.bottomExplosion.setAll('anchor.x', 0.5);
        this.bottomExplosion.setAll('anchor.y', 0.5);
        this.bottomExplosion.setAll('outOfBoundsKill', true);
        this.bottomExplosion.setAll('checkWorldBounds', true);

        //dots
        this.dots = this.add.physicsGroup();
        //  The dots will need to be offset by 6px to put them back in the middle of the grid
        this.dots.setAll('x', 6, false, false, 1);
        this.dots.setAll('y', 6, false, false, 1);

        this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);

        this.player = game.add.sprite(220, 280, 'bomberman', 0);
        this.player.scale.setTo(.8, .8);
        this.player.animations.add('left', [0, 1, 0, 2], 10, true);
        this.player.animations.add('right', [6, 7, 6, 8], 10, true);
        this.player.animations.add('forward', [3, 4, 3, 5], 10, true);
        this.player.animations.add('backward', [9, 10, 9, 11], 10, true);
        this.player.anchor.set(0.5);
        this.cursors = game.input.keyboard.createCursorKeys();
        
        //add red ghost
        this.redGhost = game.add.sprite(191,230,'ghosts',0);
        this.redGhost.animations.add('left', [6, 7], 5, true);
        this.redGhost.animations.add('right', [4,5],5, true);
        this.redGhost.animations.add('forward', [0,1],5, true);
        this.redGhost.animations.add('backward', [2, 3], 5, true);
        this.redGhost.anchor.set(0.5);
        this.redGhost.animations.play('backward');
        
        //add pink ghost
        this.pinkGhost = game.add.sprite(221,230,'ghosts',0);
        this.pinkGhost.animations.add('left', [14, 15], 5, true);
        this.pinkGhost.animations.add('right', [12,13],5, true);
        this.pinkGhost.animations.add('forward', [8,9],5, true);
        this.pinkGhost.animations.add('backward', [10, 11], 5, true);
        this.pinkGhost.anchor.set(0.5);
        this.pinkGhost.animations.play('backward');
        
        //add blue ghost
        this.blueGhost = game.add.sprite(253,230,'ghosts',0);
        this.blueGhost.animations.add('left', [22, 23], 5, true);
        this.blueGhost.animations.add('right', [20,21],5, true);
        this.blueGhost.animations.add('forward', [16,17],5, true);
        this.blueGhost.animations.add('backward', [18, 19], 5, true);
        this.blueGhost.anchor.set(0.5);
        this.blueGhost.animations.play('backward');
        
        //add yellow ghost
        this.yellowGhost = game.add.sprite(224,198,'ghosts',0);
        this.yellowGhost.animations.add('left', [30, 31], 5, true);
        this.yellowGhost.animations.add('right', [28,29],5, true);
        this.yellowGhost.animations.add('forward', [24,25],5, true);
        this.yellowGhost.animations.add('backward', [26, 27], 5, true);
        this.yellowGhost.anchor.set(0.5);
        this.yellowGhost.animations.play('backward');

        //  Bomberman should collide with everything except the safe tile
        this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        this.physics.arcade.enable(this.player);
        this.player.body.setSize(20, 20, 0, 0);

        this.text = game.add.text(20, 20, "Lives: " + this.lives, {
            font: "10px Arial",
            fill: "#ff0044",
            align: "left"
        });

        this.fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);




    },
    collectDot: function(player, dot) {

        dot.kill();

        if (this.dots.total === 0) {
            this.dots.callAll('revive');
        }

    },
    explodeBomb: function() {
        this.kill();

    },
    createExplosion: function() {
        this.center.reset(this.player.x, this.player.y);

        this.left.reset(this.player.x - 23, this.player.y);
        this.right.reset(this.player.x + 23, this.player.y);

        this.top.reset(this.player.x, this.player.y + 23);
        this.bottom.reset(this.player.x, this.player.y - 23);
    },
    destroyExplosion: function() {
        this.center.kill();

        this.left.kill();
        this.right.kill();

        this.top.kill();
        this.bottom.kill();
    },

    fire: function() {


        if (game.time.now > this.nextFire && this.bombs.countDead() > 0) {
            this.nextFire = game.time.now + this.fireRate;

            var bomb = this.bombs.getFirstExists(false);
            //debugger;
            var bombx = this.player.x,
                bomby = this.player.y;
            bomb.reset(bombx, bomby);
            var explosion = {
                center: this.centerExplosion.getFirstExists(false),
                left: this.leftExplosion.getFirstExists(false),
                right: this.rightExplosion.getFirstExists(false),
                top: this.topExplosion.getFirstExists(false),
                bottom: this.bottomExplosion.getFirstExists(false),
                player: {
                    x: this.player.x,
                    y: this.player.y
                }
            };


            game.time.events.add(Phaser.Timer.SECOND * 1.5, this.explodeBomb, bomb);
            game.time.events.add(Phaser.Timer.SECOND * 1.5, this.createExplosion, explosion);
            game.time.events.add(Phaser.Timer.SECOND * 3.5, this.destroyExplosion, explosion);

        }

    },
    loseLife: function() {
        if(this.lives > 0){
            this.player.reset(220, 280);
            this.lives -=1;
            this.text.text = "Lives: " + this.lives;
        }
        else{
            this.player.reset(220, 280);
            this.lives = 3;
            this.text.text = "Lives: " + this.lives;
            this.dots.callAll('revive');
        }
    },

    update: function() {
        var speed = this.speed;
        this.physics.arcade.collide(this.player, this.layer);
        this.physics.arcade.overlap(this.player, this.dots, this.collectDot, null, this);

        this.physics.arcade.overlap(this.player, this.centerExplosion, this.loseLife, null, this);
        this.physics.arcade.overlap(this.player, this.topExplosion, this.loseLife, null, this);
        this.physics.arcade.overlap(this.player, this.bottomExplosion, this.loseLife, null, this);
        this.physics.arcade.overlap(this.player, this.leftExplosion, this.loseLife, null, this);
        this.physics.arcade.overlap(this.player, this.rightExplosion, this.loseLife, null, this);


        //this.marker.x = this.math.snapToFloor(Math.floor(this.player.x), this.gridsize) / this.gridsize;
        //this.marker.y = this.math.snapToFloor(Math.floor(this.player.y), this.gridsize) / this.gridsize;

        if (this.cursors.left.isDown) {
            //  Move to the left
            this.player.body.velocity.x = -150;
            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 150;
            this.player.animations.play('right');
        }
        else if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -150;
            this.player.animations.play('backward');
        }
        else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = 150;
            this.player.animations.play('forward');
        }
        else {
            //  Stand still
            this.player.animations.stop();
            this.player.body.velocity.y = 0;
            this.player.body.velocity.x = 0;
            this.player.frame = 3;
        }

        if (this.fireButton.isDown) {
            //  Boom!
            this.fire();
        }
    }
}
game.state.add('Game', Bomberpac, true);