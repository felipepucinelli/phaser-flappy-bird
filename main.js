// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 530, Phaser.AUTO, 'game_div');
var game_state = {};
var game_score = {};

var initialTween;
var hitSpacebar = false;

var GRAVITY = 1500;
var FLAP = -400;
var PIPE_SPEED = -200;
var PIPE_INTERVAL = 1800;
var GROUND_SPEED = 4;


// Creates a new 'main' state that wil contain the game
game_state.main = function() { };
game_state.main.prototype = {

    // Function called first to load all the assets
    preload: function() {
        // Load the bird sprtesheet, 60x42 is the size of each frame, and 3 is the total number of frames
        this.game.load.spritesheet('bird', 'assets/bird.png', 60, 42, 3);

        // Load the background spirte
        this.game.load.image('background', 'assets/background.png');

        // Load the pipe sprite
        this.game.load.image('pipe', 'assets/pipe.png');

        // Load the pipe hole sprite
        this.game.load.image('pipe-hole-up', 'assets/pipe-hole-up.png');

        // Load the pipe hole sprite
        this.game.load.image('pipe-hole-down', 'assets/pipe-hole-down.png');

        // Load the pipe sprite
        this.game.load.image('ground', 'assets/ground.png');

        //Load the flap sound
        game.load.audio('flap', 'assets/audio/flap.wav');

        //Load the flap sound
        game.load.audio('hurt', 'assets/audio/hurt.wav');

    },

    // Fuction called after 'preload' to setup the game
    create: function() {
        // Display the background on the screen
        this.background = this.game.add.sprite(0, -10, 'background');

        // Display the ground on the screen
        this.ground = game.add.tileSprite(0, 473, 400, 64, 'ground');

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');

        //  Here we add a new animation called 'fly'
        this.bird.animations.add('fly');

        //  And this starts the animation playing by using its key ('fly'), true means it will loop when it finishes
        this.bird.animations.play('fly', 7, true);

        // Bird up and down with a tween
        initialTween = this.game.add.tween(this.bird).to({ y: 260 }, 380, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true);

        // Call the 'flap' function when the spacekey is hit
        var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        space_key.onDown.add(this.flap, this);

        // Create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.createMultiple(20, 'pipe');

        // Create a group of 20 pipes holes
        this.pipesHolesUp = game.add.group();
        this.pipesHolesUp.createMultiple(20, 'pipe-hole-up');

        // Create a group of 20 pipes holes
        this.pipesHolesDown = game.add.group();
        this.pipesHolesDown.createMultiple(20, 'pipe-hole-down');

        // Timer that calls 'addRowOfPipes' ever 1.8 seconds
        this.timer = this.game.time.events.loop(PIPE_INTERVAL, this.addRowOfPipes, this);

        // Add a score label on the top left of the screen
        this.score = 0;
        var style = { font: '32px "Press Start 2P"', fill: '#fff', stroke: '#430', strokeThickness: 8, align: 'center'};
        this.label_score = this.game.add.text(this.game.world.centerX - 20, 30, "0", style);
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            // Add gravity to the bird to make it fall
            this.bird.body.gravity.y = GRAVITY;

            //Pause the initial tween the bird when spacebar is hit.
            initialTween.pause();
            hitSpacebar = true;
        }

        // If the bird overlap any pipes, call 'restartGame'
        this.game.physics.overlap(this.bird, this.pipes, this.restartGame, null, this);
        this.game.physics.overlap(this.bird, this.pipesHolesUp, this.restartGame, null, this);
        this.game.physics.overlap(this.bird, this.pipesHolesDown, this.restartGame, null, this);
        this.birdAngle();

        //Makes the ground 'run'
        this.ground.tilePosition.x -= GROUND_SPEED;
    },

    birdAngle: function () {
        if (hitSpacebar === true) {
          // Change the bird angle when he goes up or down
          if (this.bird.body.velocity.y < 0) {
              this.bird.angle = -15;
          } else {
              if (this.bird.angle <= 90) {
                  this.bird.angle +=2;
              }
          }

        }
    },

    // Make the bird jump
    flap: function() {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = FLAP;

        //Play the flap sound
        this.game.add.audio('flap').play();

    },

    // Restart the gamegit s
    restartGame: function(bird, pipe) {
        //Play the hurt sound everytime you hit a pipe or leave the scene
        this.game.add.audio('hurt').play();

        hitSpacebar = false;

        // Remove the timer
        this.game.time.events.remove(this.timer);

        // Start the 'main' state, which restarts the game
        this.game.state.start('main');
        if (typeof userName !== 'undefined'){
            updateScore();
        };

    },

    // Add a pipe on the screen
    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

         // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = PIPE_SPEED;

        // Kill the pipe when it's no longer visible
        pipe.outOfBoundsKill = true;
    },

    // Add a pipe on the screen
    addOnePipeHoleDown: function(x, y) {
        // Get the first dead pipe of our group
        var pipeHoleDown = this.pipesHolesDown.getFirstDead();

        // Set the new position of the pipe
        pipeHoleDown.reset(x, y);

         // Add velocity to the pipe to make it move left
        pipeHoleDown.body.velocity.x = PIPE_SPEED;

        // Kill the pipe when it's no longer visible
        pipeHoleDown.outOfBoundsKill = true;
    },

    addOnePipeHoleUp: function(x, y) {
        // Get the first dead pipe of our group
        var pipeHoleUp = this.pipesHolesUp.getFirstDead();

        // Set the new position of the pipe
        pipeHoleUp.reset(x, y);

         // Add velocity to the pipe to make it move left
        pipeHoleUp.body.velocity.x = PIPE_SPEED;

        // Kill the pipe when it's no longer visible
        pipeHoleUp.outOfBoundsKill = true;
    },


    // Add a row of 8 pipes with a hole somewhere in the middle
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*6)+2;

        for (var i = 0; i < 10; i++) {
            if (i != hole && i != hole +1 && i != hole -1) {
                if(i == hole - 2) {
                  this.addOnePipeHoleUp(397, i*47);
                } else if (i == hole + 2) {
                  this.addOnePipeHoleDown(397, i*47);
                } else {
                  this.addOnePipe(400, i*47);
                }
            }
        }
        this.score += 1;
        this.label_score.content = this.score;
        game_score.player = {score: this.score}
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);
game.state.start('main');
