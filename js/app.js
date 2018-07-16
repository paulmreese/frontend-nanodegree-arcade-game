// List of water spaces
let isOccupied =[];
for (let i = 1; i < 6; i++) {
  isOccupied[i] = false;
}

//Global "Is the game running or over" boolean
let isGameOver = false;

//Variable for the last enemy rendered, to keep things visually interesting
let lastRendered = '';

//Detects when animations end for animate.css
// See https://github.com/daneden/animate.css/issues/644
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

// Enemies our player must avoid
var Enemy = function(name, y, row, speed, sprite, isLitter) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
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

//Class for the victory markers that indicate which water has been entered
let Marker = function(x) {
  this.x = x;
  this.y = 0;
  this.sprite = 'images/smol-v-turt.png';

  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
let Player = function(x = 202, y = 404, row = 1, col = 3) {

  this.update = function(dt) {

  }
  this.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
  this.restart = function() {
    this.x = 202;
    this.y = 404;
    this.row = 1;
    this.col = 3;
  }
  this.sprite = 'images/char-turtler.png';
  this.x = x;
  this.y = y;
  this.row = row;
  this.col = col;
}

Player.prototype.handleInput = function(value) {
  if (value === 'left' && this.col != 1) {
    this.x -= 101;
    this.col--;
  }
  if (value === 'up' && this.row != 6) {
    this.y -= 85;
    this.row++;
  }
  if (value === 'right' && this.col != 5) {
    this.x += 101;
    this.col++;
  }
  if (value === 'down' && this.row != 1) {
    this.y += 85;
    this.row--;
  }
}

function checkCollisions(player, allEnemies){
  for (let i = 0; i < allEnemies.length; i++) {
    //Checks if the enemy is litter, then determines where the detection
    //boundaries are.
    if ((allEnemies[i].isLitter && allEnemies[i].row == player.row &&
    allEnemies[i].x <= (player.x + 60) && allEnemies[i].x >= (player.x - 70)) ||
    (!allEnemies[i].isLitter && allEnemies[i].row == player.row &&
    allEnemies[i].x <= (player.x + 70) && allEnemies[i].x >= (player.x - 50))){
      //TODO: create death animation, restart
      setTimeout(function(){}, 50);
      player.restart();
    }
    if (allEnemies[i].x < -101) {
      const lastEnemy = allEnemies[i];
      lastEnemy.x = 505;
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
      //console.log(lastEnemy);
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

function checkForWater(col) {
  if (player.row == 6 && !isOccupied[col]) {
    allMarkers[col] = new Marker(player.x);
    isOccupied[col] = true;
    if (isOccupied.filter(x => x).length === 5) {
      //Winning Conditions Met, now let 'em know!
      isGameOver = true;
      player.x = 1000;
      //setTimeout(function(){alert('Con-garts.')}, 50);
      /*setTimeout(function(){
        ctx.rotate(-20*Math.PI/180)
      }, 200);*/
      swal({
        title: '<style>.swal2-popup .swal2-title{color: #3085d6; font-size: ' +
        '3em}</style>Congratulations!',
        text: "You saved Turtlr's family!",
        html: '<img src="images/turtlr-4-dancing.png" alt="Turtlr is happily' +
        ' dancing, victoriously" id="dance" class="flipped animated bounce pulse flip">' +
        `<h3>You saved Turtlr's family!</h3>`,
        background: 'rgba(225, 225, 225, 0.85)',
        showCancelButton: true,
        confirmButtonText: 'Play Again?',
        cancelButtonText: 'Awesome!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          isGameOver = false;
          allMarkers = [];
          isOccupied = [];
          allEnemies = [gull, fastLitter, litter, fastGull];
          player.restart();
        }
      });
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

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let gull = new Enemy('gull', 323, 2, 125, 'images/enemy-gull.png', false);

let fastLitter = new Enemy('fastLitter', 237, 3, 225, 'images/enemy-litter.png',
  true);

let litter = new Enemy('litter', 152, 4, 105, 'images/enemy-litter.png', true);

let fastGull = new Enemy('fastGull', 73, 5, 175, 'images/enemy-gull.png', false);

let allEnemies = [gull, fastLitter, litter, fastGull];

let allMarkers = []

let player = new Player();



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});

document.querySelector('#title').addEventListener('click', function() {
  this.classList.remove('rubberBand');
  setTimeout(function() {
    document.querySelector('#title').classList.add('rubberBand');
  }, 100);
});
