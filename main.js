// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');
var game_state = {};
var initialTween;

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };
game_state.main.prototype = {

    // Function called first to load all the assets
    preload: function() {
        // Load the background spirte
        this.game.load.image('background', 'assets/background.png');

        // Load the bird sprtesheet, 60x42 is the size of each frame, and 3 is the total number of frames
        this.game.load.spritesheet('bird', 'assets/bird.png', 60, 42, 3);

        // Load the pipe sprite
        this.game.load.image('pipe', 'assets/pipe.png');
    },

    // Fuction called after 'preload' to setup the game
    create: function() {
        // Display the background on the screen
        this.bird = this.game.add.sprite(0, 0, 'background');

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

        // Timer that calls 'addRowOfPipes' ever 1.8 seconds
        this.timer = this.game.time.events.loop(1800, this.addRowOfPipes, this);

        // Add a score label on the top left of the screen
        this.score = 0;
        var style = { font: "30px Arial", fill: "#ffffff" };
        this.label_score = this.game.add.text(20, 20, "0", style);
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false) {
            this.restartGame();
        }

        if(this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            // Add gravity to the bird to make it fall
            this.bird.body.gravity.y = 1000;
            //Pause the initial tween the bird when spacebar is hit.
            initialTween.pause();
            this.bird.angle = -15;

        } else {
            this.bird.angle = 15;
        }
        // If the bird overlap any pipes, call 'restartGame'
        this.game.physics.overlap(this.bird, this.pipes, this.restartGame, null, this);
    },

    // Make the bird jump
    flap: function() {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
    },

    // Restart the game
    restartGame: function(bird, pipe) {
        // Remove the timer
        this.game.time.events.remove(this.timer);

        // Start the 'main' state, which restarts the game
        this.game.state.start('main');
    },

    // Add a pipe on the screen
    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

         // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Kill the pipe when it's no longer visible
        pipe.outOfBoundsKill = true;
    },

    // Add a row of 8 pipes with a hole somewhere in the middle
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*7)+1;

        for (var i = 0; i < 10; i++)
            if (i != hole && i != hole +1 && i != hole -1)
                this.addOnePipe(400, i*50);

        this.score += 1;
        this.label_score.content = this.score;
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);
game.state.start('main');
