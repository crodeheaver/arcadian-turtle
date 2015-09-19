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
    init: function() {

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;

        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);

        this.physics.startSystem(Phaser.Physics.ARCADE);

    },
    preload: function() {
        this.load.image('dot', 'assets/dot.png');
        game.load.image('tiles', 'assets/pacman-tiles.png');
        this.load.tilemap('map', 'assets/pacman-map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.spritesheet('bomberman', 'assets/bomberman.png', 35, 52);


    },

    create: function() {
        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('pacman-tiles', 'tiles');
        this.layer = this.map.createLayer('Pacman');
        this.dots = this.add.physicsGroup();
        //  The dots will need to be offset by 6px to put them back in the middle of the grid
            this.dots.setAll('x', 6, false, false, 1);
            this.dots.setAll('y', 6, false, false, 1);
            this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);
        this.player = game.add.sprite(220, 265, 'bomberman', 0);
        this.player.scale.setTo(.5, .5);
        this.player.animations.add('left', [0, 1, 0, 2], 10, true);
        this.player.animations.add('right', [6, 7, 6, 8], 10, true);
        this.player.animations.add('forward', [3, 4, 3, 5], 10, true);
        this.player.animations.add('backward', [9, 10, 9, 11], 10, true);
        this.player.anchor.set(0.5);
        cursors = game.input.keyboard.createCursorKeys();

        //  Bomberman should collide with everything except the safe tile
        this.map.setCollisionByExclusion([this.safetile], true, this.layer);

        this.physics.arcade.enable(this.player);
        this.player.body.setSize(16, 16, 0, 0);


    },
    eatDot: function (player, dot) {

            dot.kill();

            if (this.dots.total === 0)
            {
                this.dots.callAll('revive');
            }

        },

    update: function() {
        var speed = this.speed;
        this.physics.arcade.collide(this.player, this.layer);
            this.physics.arcade.overlap(this.player, this.dots, this.eatDot, null, this);

            this.marker.x = this.math.snapToFloor(Math.floor(this.player.x), this.gridsize) / this.gridsize;
            this.marker.y = this.math.snapToFloor(Math.floor(this.player.y), this.gridsize) / this.gridsize;

        if (cursors.left.isDown) {
            //  Move to the left
            this.player.body.velocity.x = -150;
            this.player.animations.play('left');
        }
        else if (cursors.right.isDown) {
            this.player.body.velocity.x = 150;
            this.player.animations.play('right');
        }
        else if (cursors.up.isDown) {
            this.player.body.velocity.y = -150;
            this.player.animations.play('backward');
        }
        else if (cursors.down.isDown) {
            this.player.body.velocity.y = 150;
            this.player.animations.play('forward');
        }
        else {
            //  Stand still
            this.player.animations.stop();
            this.player.body.velocity.y=0;
            this.player.body.velocity.x=0;
            this.player.frame = 3;
        }
    }
}
game.state.add('Game', Bomberpac, true);