// List of water spaces, pre-populate list as unoccupied spaces
let isOccupied =[];
for (let i = 1; i < 6; i++) {
  isOccupied[i] = false;
}

//Global "Is the game running or over" boolean
let isGameOver = false;

//Variable for the last enemy rendered, to keep things visually interesting
let lastRendered = '';

//Detects when animations end for animate.css
//https://github.com/daneden/animate.css/issues/644
var animationEnd = (function(el) {
  var animations = {
    animation: 'animationend',
    OAnimation: 'oAnimationEnd',
    MozAnimation: 'mozAnimationEnd',
    WebkitAnimation: 'webkitAnimationEnd',
  };

  for (var t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
})(document.createElement('div'));

/* Class Functions */

/*Enemy*/

// Class for enemies our player must avoid
var Enemy = function(name, y, row, speed, sprite, isLitter) {
    this.name = name;
    this.x = 505;
    this.y = y;
    this.row = row;
    this.speed = speed;
    this.sprite = sprite;
    this.isLitter = isLitter;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x -= this.speed * dt;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/*Marker*/

//Class for the victory markers that indicate which water has been entered
let Marker = function(x) {
  this.x = x;
  this.y = 0;
  this.sprite = 'images/marker-turtle.png';

  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}


/*Player*/

let Player = function(x = 202, y = 404, row = 1, col = 3) {

  //required for engine, not used. Could save memory by removing call in engine?
  this.update = function(dt) {

  }

  //Draw the player in new frame
  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }

  //Return player to starting position
  this.restart = function() {
    this.x = 202;
    this.y = 404;
    this.row = 1;
    this.col = 3;
  }

  this.sprite = 'images/char-turtlr.png';
  this.x = x;
  this.y = y;
  this.row = row;
  this.col = col;
}

/*Actually handles the key presses a player inputs and enacts them on the char-
 *acter. Prevents motion outside of tiles, as well as between water tiles.
 */

Player.prototype.handleInput = function(value) {
  if (value === 'left' && this.col != 1 && this.row != 6) {
    this.x -= 101;
    this.col--;
  }
  if (value === 'up' && this.row != 6) {
    this.y -= 85;
    this.row++;
  }
  if (value === 'right' && this.col != 5 && this.row != 6) {
    this.x += 101;
    this.col++;
  }
  if (value === 'down' && this.row != 1) {
    this.y += 85;
    this.row--;
  }
}

/*Functions*/

//Function to bounce entire canvas
function bounceCanvas() {
  setTimeout(function(){
    document.querySelector('canvas').classList.add('animated', 'bounceIn');
    setTimeout(function(){
      document.querySelector('canvas').classList.remove('animated',
      'bounceIn');
    }, 420);
  }, 0);
}

//Function to restart the game
function restartGame() {
  bounceCanvas();
  isGameOver = false;
  allMarkers = [];
  isOccupied = [];
  allEnemies = [gull, fastLitter, litter, fastGull];
  player.restart();
}

function toggleControls() {
  const controlsLink = document.querySelector('#controls-link');
  const onScreenControls = document.querySelector('#arrows');
  if (controlsLink.classList.contains('hide-controls')) {
    controlsLink.classList.remove('hide-controls');
    controlsLink.classList.add('show-controls');
    controlsLink.innerText = 'Show Controls';
    onScreenControls.style.display = 'none';

  } else {
    controlsLink.classList.add('hide-controls');
    controlsLink.classList.remove('show-controls');
    controlsLink.innerText = 'Hide Controls ';
    onScreenControls.style.display = 'inline-block';
  }
}

//Function to launch info popup
function moreInfo() {
  swal({
    title: '<style>.swal2-popup .swal2-title{color: #3085d6; font-size: ' +
    '3em}</style>Turtlr is an Endangered Species!',
    html: '<img src="images/sea-turtle-plush-transparent.png" alt="Sea Turtle' +
    'plush offered for adoption by the World Wildlife Fund." class="plush">' +
    '<h3>...but you can help by symbolically adopting a loggerhead sea turtle' +
    ' <em>today!</em></h3>',
    background: 'rgba(225, 225, 225, 0.85)',
    showCancelButton: true,
    confirmButtonColor: '#208520',
    cancelButtonColor: '#8e2727',
    confirmButtonText: 'Adopt Now!',
    cancelButtonText: "Keep Playing",
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      window.open('https://gifts.worldwildlife.org/gift-center/' +
      'gifts/Species-Adoptions/Sea-Turtle.aspx');
    }
  });
}

//Function to check for collisions between player and other objects
function checkCollisions(player, allEnemies){

  for (let i = 0; i < allEnemies.length; i++) {

    //Checks if the enemy is litter, then determines where the detection
    //boundaries are.
    if ((allEnemies[i].isLitter && allEnemies[i].row == player.row &&
    allEnemies[i].x <= (player.x + 60) && allEnemies[i].x >= (player.x - 70)) ||
    (!allEnemies[i].isLitter && allEnemies[i].row == player.row &&
    allEnemies[i].x <= (player.x + 70) && allEnemies[i].x >= (player.x - 50))){

      //death animation, restart
      bounceCanvas();
      player.restart();

    }

    //If an enemy leaves the screen, replace it with another
    if (allEnemies[i].x < -101) {
      const lastEnemy = allEnemies[i];
      lastEnemy.x = 505;

      /*assign variables to file links, checks which was rendered last.
       *Prevents one type of enemy from becoming the only enemy
       */
      const gullFile = 'images/enemy-gull.png';
      const litterFile = 'images/enemy-litter.png';
      let thisSprite = '';
      if (lastRendered == gullFile) {
        thisSprite = litterFile;
        lastRendered = litterFile;
      } else {
        thisSprite = gullFile;
        lastRendered = gullFile;
      }

      /*Creates a pseudo-random pattern of enemies, varying their speed Based
       *on their current row, as well as the last enemy to leave the screen,
       *keeping the total number of enemies on screen under 8 at all times
       */
      if (allEnemies.length < 7 && allEnemies[i].row > 4 && !isGameOver) {
        const extraEnemy = new Enemy(lastEnemy.name, (lastEnemy.y + 170),
          (lastEnemy.row - 2), (lastEnemy.speed * 1.15), thisSprite,
          lastEnemy.isLitter);
        allEnemies.push(extraEnemy);
      } else if (allEnemies.length < 8 && allEnemies[i].row < 5 &&
        !isGameOver) {
        const slowEnemy = new Enemy(lastEnemy.name, (lastEnemy.y - 85),
          (lastEnemy.row + 1), lastEnemy.speed * 0.75, thisSprite,
          lastEnemy.isLitter);
        allEnemies.push(slowEnemy);
      } else if (allEnemies.length < 9 && allEnemies[i].row == 2 &&
        !isGameOver) {
        const topEnemy = new Enemy(lastEnemy.name, (lastEnemy.y - 255), 5,
          lastEnemy.speed * 1.50, thisSprite, lastEnemy.isLitter);
        allEnemies.push(topEnemy);
      } else {
        allEnemies.splice(i, 1);
      }
    }
  }
}

//Function to check if the player has reached water

function checkForWater(col) {
  if (player.row == 6 && !isOccupied[col]) {

    //adds a new marker when water is reached, and notes it in isOccupied array
    allMarkers[col] = new Marker(player.x);
    isOccupied[col] = true;

    //checks if all five water tiles have been reached
    if (isOccupied.filter(x => x).length === 5) {

      //Winning Conditions Met, now let 'em know!
      isGameOver = true;

      //hide player character
      player.x = 1000;

      //Sweet alert 2 victory notification
      swal({
        title: '<style>.swal2-popup .swal2-title{color: #3085d6; font-size: ' +
        '3em}</style>Congratulations!',
        text: "You saved Turtlr's family!",
        html: '<img src="images/turtlr-4-dancing.png" alt="Turtlr is happily' +
        ' dancing, victoriously" id="dance" class="flipped animated bounce pulse flip">' +
        `<h3>You saved Turtlr's family!</h3>`,
        background: 'rgba(225, 225, 225, 0.85)',
        showCancelButton: true,
        confirmButtonColor: '#208520',
        cancelButtonColor: '#8e2727',
        confirmButtonText: 'Play Again!',
        cancelButtonText: "I'm Done.",
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          restartGame();
        }
      });

      //Makes Turtlr Dance
      document.getElementById('dance').addEventListener(animationEnd, function(e) {
        e.target.removeEventListener(e.type, arguments.callee);
        e.target.classList.remove('flipped', 'animated', 'bounce', 'pulse', 'flip', 'tada');
        e.target.classList.add('tada', 'animated');
      });

    } else {
      player.restart();
    }
  }
}

/*Instantiate Objects*/

//Enemy Objects
let gull = new Enemy('gull', 323, 2, 125, 'images/enemy-gull.png', false);

let fastLitter = new Enemy('fastLitter', 237, 3, 225, 'images/enemy-litter.png',
  true);

let litter = new Enemy('litter', 152, 4, 105, 'images/enemy-litter.png', true);

let fastGull = new Enemy('fastGull', 73, 5, 175, 'images/enemy-gull.png', false);

// All enemy objects in an array called allEnemies
let allEnemies = [gull, fastLitter, litter, fastGull];

//Array to hold all markers for water tiles reached
let allMarkers = []

// Place the player object in a variable called player
let player = new Player();

/*Event Listeners*/

// This listens for key presses and sends the keys to Player.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

//This listens for clicks on the Turtlr title
document.querySelector('#title').addEventListener('click', function() {
  this.classList.remove('rubberBand');
  setTimeout(function() {
    document.querySelector('#title').classList.add('rubberBand');
  }, 100);
});

//This listens for clicks on dancing Turtlr
document.addEventListener('click', function(e) {
  if (e.target === document.getElementById('dance')) {
    e.target.classList.remove('tada', 'animated');
    e.target.classList.add('flipped', 'animated', 'bounce', 'pulse', 'flip', 'tada');
    document.getElementById('dance').addEventListener(animationEnd, function(e) {
      e.target.removeEventListener(e.type, arguments.callee);
      e.target.classList.remove('flipped', 'animated', 'bounce', 'pulse', 'flip', 'tada');
      e.target.classList.add('tada', 'animated');
    });
  }
});
