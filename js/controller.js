angular.module('controller', [])

.controller('MainCtrl', function($scope, $ionicSideMenuDelegate, $ionicPopup) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.steps = 0;
  $scope.theme = 'positive';
  $scope.levelCoef1 = 5;
  $scope.levelCoef2 = 8;

  $scope.changeLevel = function(level) {
    if (level === 0) {
      $scope.levelCoef1 = 10;
      $scope.levelCoef2 = 10;
    } else if (level === 1) {
      $scope.levelCoef1 = 5;
      $scope.levelCoef2 = 10;
    } else if (level === 2) {
      $scope.levelCoef1 = 5;
      $scope.levelCoef2 = 3;
    } else if (level === 3) {
      $scope.levelCoef1 = 3;
      $scope.levelCoef2 = 2;
    }
    $scope.level = level;
    $scope.run();
  };

  function Board(ctx) {
    var self = this;
    this.numOfBlocks = 11;
    this.radius = 20;
    this.horizontalOffset = 20;
    this.verticalOffset = 30;
    this.startAngle = 0;
    this.endAngle = Math.PI * 2;
    this.ctx = ctx;
    this.grid = 0;
    this.div = document.getElementById("canvas");
    this.height = 36;
    this.width = 48;
    this.x = 0;
    this.y = 0;
    this.cat = 0;
    this.lock = false;
    this.img = 0;
    this.create = function() {
      self.setUpGrid();
      self.pickRandomDone();
      self.initCat();
      self.img = new Image();
      self.img.src = 'cat.png';
      self.img.onload = function() {
        self.draw();
      };
    };
    this.setUpGrid = function() {
      self.grid = [];
      for (var i = 0; i < self.numOfBlocks; i++) {
        self.grid[i] = [];
        for (var j = 0; j < self.numOfBlocks; j++) {
          if (j % 2) {
            self.x = self.width * i + self.horizontalOffset + (self.width / 2);
          } else {
            self.x = self.width * i + self.horizontalOffset;
          }
          self.y = self.height * j + self.horizontalOffset;
          self.grid[i][j] = new Circle(self.x, self.y + self.verticalOffset, self.radius);
        }
      }
    };
    this.pickRandomDone = function() {
      // pick random number of dots between 8 and 12
      var now = new Date();
      var seed = now.getSeconds();
      var numOfDotsAtStart = Math.floor(Math.random(seed) * $scope.levelCoef1 + $scope.levelCoef2);
      for (var k = 0; k < numOfDotsAtStart; k++) {
        var i, j;
        // Make sure that a random dot is not in the center of the board
        do {
          i = Math.floor(Math.random() * self.numOfBlocks);
          j = Math.floor(Math.random() * self.numOfBlocks);
        }
        while (i === Math.floor(self.numOfBlocks / 2) && j === Math.floor(self.numOfBlocks / 2));
        self.grid[i][j].updateColor();
      }
    };
    // main draw loop
    this.draw = function() {
      self.ctx.clearRect(0, 0, 550, 430);
      for (var i = 0; i < self.numOfBlocks; i++) {
        for (var j = 0; j < self.numOfBlocks; j++) {
          self.ctx.beginPath();
          if (self.grid[i][j].fill === true) {
            self.ctx.fillStyle = 'rgb(78,134,237)';
          } else {
            self.ctx.fillStyle = 'rgb(180,200,210)';
          }
          self.ctx.arc(self.grid[i][j].getPosition().x, self.grid[i][j].getPosition().y, self.radius, self.startAngle, self.endAngle, self.clockwise);
          self.ctx.fill();
        }
      }
      self.ctx.drawImage(self.img, self.cat.x - 18, self.cat.y - 45);
    };
    this.updateCircle = function(position) {
      var circleUpdated = false;
      for (var i = 0; i < self.numOfBlocks; i++) {
        for (var j = 0; j < self.numOfBlocks; j++) {
          if (self.grid[i][j].isInPosition(position) && !self.grid[i][j].fill && !self.grid[i][j].hasCat) {
            self.grid[i][j].updateColor();
            self.draw();
            circleUpdated = true;
          }
        }
      }
      return circleUpdated;
    };
    this.initCat = function() {
      var column = Math.floor(self.numOfBlocks / 2);
      var row = Math.floor(self.numOfBlocks / 2);
      self.cat = new Cat(column, row);
      self.updateCat(column, row);
      self.cat.updateCatCoordinate(self.grid[column][row].getPosition());
    };
    this.updateCat = function(col, row, previousLoc) {
      self.grid[col][row].addCat();
      self.cat.updateCatPosition(col, row);
      if (previousLoc !== undefined) {
        self.grid[previousLoc.col][previousLoc.row].removeCat();
      }
    };
    // move cat according to available positions
    // handle case if game is won or lost
    this.moveCat = function() {
      self.lock = true;
      var winLoseObject = self.findAvailablePositions();
      if (!(winLoseObject.winGame || winLoseObject.loseGame)) {
        self.determineCatDirection();
      }
      return winLoseObject;
    };
    // find available positions to determine if game is won or lost
    // if there are no positions, the game is won
    // if cat is at the edge of the board, the game is lost
    this.findAvailablePositions = function() {
      var currentPosition = self.cat.getCurrentCatPosition();
      if (currentPosition.row === 0 || currentPosition.row === self.numOfBlocks - 1 || currentPosition.col === 0 || currentPosition.col === self.numOfBlocks - 1) {
        return {
          winGame: false,
          loseGame: true
        };
      }
      if (currentPosition.row % 2) {
        self.availableLocations = [{
          row: currentPosition.row - 1,
          col: currentPosition.col,
          isAvailable: true
        }, {
          row: currentPosition.row - 1,
          col: currentPosition.col + 1,
          isAvailable: true
        }, {
          row: currentPosition.row,
          col: currentPosition.col - 1,
          isAvailable: true
        }, {
          row: currentPosition.row,
          col: currentPosition.col + 1,
          isAvailable: true
        }, {
          row: currentPosition.row + 1,
          col: currentPosition.col,
          isAvailable: true
        }, {
          row: currentPosition.row + 1,
          col: currentPosition.col + 1,
          isAvailable: true
        }];
      } else {
        self.availableLocations = [{
          row: currentPosition.row - 1,
          col: currentPosition.col - 1,
          isAvailable: true
        }, {
          row: currentPosition.row - 1,
          col: currentPosition.col,
          isAvailable: true
        }, {
          row: currentPosition.row,
          col: currentPosition.col - 1,
          isAvailable: true
        }, {
          row: currentPosition.row,
          col: currentPosition.col + 1,
          isAvailable: true
        }, {
          row: currentPosition.row + 1,
          col: currentPosition.col - 1,
          isAvailable: true
        }, {
          row: currentPosition.row + 1,
          col: currentPosition.col,
          isAvailable: true
        }];
      }
      var placesLeft = false;
      for (var i = 0; i < self.availableLocations.length; i++) {
        var colLocation = self.availableLocations[i].col;
        var rowLocation = self.availableLocations[i].row;
        //alert("available: " + colLocation + ", " + rowLocation);
        placesLeft = placesLeft || !self.grid[colLocation][rowLocation].fill;
        if (self.grid[colLocation][rowLocation].fill) {
          self.availableLocations[i].isAvailable = false;
        }
      }
      return {
        winGame: !placesLeft,
        loseGame: false
      };
    };
    // determine direction of the cat given the current position and the available paths
    // calculate the position of where the cat should go
    this.determineCatDirection = function() {
      var currentPosition = self.cat.getCurrentCatPosition();
      var shortestPaths = self.getListOfShortestPaths();
      var direction = 0;
      var moveToColumn = 0;
      var moveToRow = 0;
      // Get random shortestPath, second block
      if (shortestPaths.length === 0) {
        do {
          direction = Math.floor(Math.random() * 6);
        }
        while (self.availableLocations[direction].isAvailable === false);
        moveToColumn = self.availableLocations[direction].col;
        moveToRow = self.availableLocations[direction].row;
      } else {
        var block = shortestPaths[Math.floor(Math.random() * shortestPaths.length)][1];
        moveToColumn = block.x;
        moveToRow = block.y;
        direction = self.getDirection(currentPosition, {
          col: moveToColumn,
          row: moveToRow
        });
      }
      var positionShift = 0;
      switch (direction) {
        case 0:
          positionShift = {
            x: self.width / -2,
            y: self.height * -1
          };
          break;
        case 1:
          positionShift = {
            x: self.width / 2,
            y: self.height * -1
          };
          break;
        case 2:
          positionShift = {
            x: self.width * -1,
            y: 0
          };
          break;
        case 3:
          positionShift = {
            x: self.width,
            y: 0
          };
          break;
        case 4:
          positionShift = {
            x: self.width / -2,
            y: self.height
          };
          break;
        case 5:
          positionShift = {
            x: self.width / 2,
            y: self.height
          };
          break;
        default:
          positionShift = {
            x: 0,
            y: 0
          };
      }
      $scope.steps ++;
      $scope.$apply();
      self.updateCat(moveToColumn, moveToRow, currentPosition);
      self.loopCatMovement(positionShift, self.cat.getCurrentCatCoordinate().x);
    };
    this.getListOfShortestPaths = function() {
      var currentPosition = self.cat.getCurrentCatPosition();
      var start = [currentPosition.col, currentPosition.row];
      var destination = [];
      var pathList = [];
      var path = [];
      var currentShortest = 130;
      for (var i = 0; i < self.numOfBlocks; i++) {
        if (self.isLegalDestination(0, i)) {
          destination = [0, i];
          path = a_star(start, destination, self.grid, self.numOfBlocks);
          if (path.length < currentShortest && path.length !== 0) {
            pathList = [];
            pathList.push(path);
            currentShortest = path.length;
          } else if (path.length === currentShortest) {
            pathList.push(path);
          }
        }
        if (self.isLegalDestination(self.numOfBlocks - 1, i)) {
          destination = [self.numOfBlocks - 1, i];
          path = a_star(start, destination, self.grid, self.numOfBlocks);
          if (path.length < currentShortest && path.length !== 0) {
            pathList = [];
            pathList.push(path);
            currentShortest = path.length;
          } else if (path.length === currentShortest) {
            pathList.push(path);
          }
        }
      }
      for (var j = 1; j < self.numOfBlocks - 1; j++) {
        if (self.isLegalDestination(j, 0)) {
          destination = [j, 0];
          path = a_star(start, destination, self.grid, self.numOfBlocks);
          if (path.length < currentShortest && path.length !== 0) {
            pathList = [];
            pathList.push(path);
            currentShortest = path.length;
          } else if (path.length === currentShortest) {
            pathList.push(path);
          }
        }
        if (self.isLegalDestination(j, self.numOfBlocks - 1)) {
          destination = [j, self.numOfBlocks - 1];
          path = a_star(start, destination, self.grid, self.numOfBlocks);
          if (path.length < currentShortest && path.length !== 0) {
            pathList = [];
            pathList.push(path);
            currentShortest = path.length;
          } else if (path.length === currentShortest) {
            pathList.push(path);
          }
        }
      }
      //alert("currentShortest: " + currentShortest + " numberPaths: " + pathList.length);
      //alert(pathList.length);
      return pathList;
    };
    this.isLegalDestination = function(col, row) {
      //alert(col + ", " + row + " " + !self.grid[col][row].fill);
      return !self.grid[col][row].fill;
    };
    this.getDirection = function(currentSquare, newSquare) {
      var columnDifference = newSquare.col - currentSquare.col;
      var rowDifference = newSquare.row - currentSquare.row;
      //alert (columnDifference + ", " + rowDifference);
      if (currentSquare.row % 2) {
        if (rowDifference === -1) {
          if (columnDifference === 0) return 0;
          else if (columnDifference === 1) return 1;
        } else if (rowDifference === 0) {
          if (columnDifference === -1) return 2;
          else if (columnDifference === 1) return 3;
        } else if (rowDifference === 1) {
          if (columnDifference === 0) return 4;
          else if (columnDifference === 1) return 5;
        }
      } else {
        if (rowDifference === -1) {
          if (columnDifference === -1) return 0;
          else if (columnDifference === 0) return 1;
        } else if (rowDifference === 0) {
          if (columnDifference === -1) return 2;
          else if (columnDifference === 1) return 3;
        } else if (rowDifference === 1) {
          if (columnDifference === -1) return 4;
          else if (columnDifference === 0) return 5;
        }
      }
      return "YOU FAIL!";
    };
    // loop the cat draw movement until it reaches it's destination
    // hold the lock until movement is complete, to prevent mouse clicks from taking action
    this.loopCatMovement = function(positionShift, currentCatX) {
      if (positionShift.x < 0) {
        if (self.cat.x > positionShift.x + currentCatX) {
          self.cat.updateCatCoordinate({
            x: positionShift.x / 12,
            y: positionShift.y / 12
          });
          self.draw();
          setTimeout(function() {
            self.loopCatMovement(positionShift, currentCatX);
          }, 24);
        } else {
          self.lock = false;
        }
      } else {
        if (self.cat.x < positionShift.x + currentCatX) {
          self.cat.updateCatCoordinate({
            x: positionShift.x / 12,
            y: positionShift.y / 12
          });
          self.draw();
          setTimeout(function() {
            self.loopCatMovement(positionShift, currentCatX);
          }, 24);
        } else {
          self.lock = false;
        }
      }
    };
  }

  function a_star(start, destination, board, width) {
    //Create start and destination as true nodes
    start = new node(start[0], start[1], -1, -1, -1, -1);
    destination = new node(destination[0], destination[1], -1, -1, -1, -1);

    var open = []; //List of open nodes (nodes to be inspected)
    var closed = []; //List of closed nodes (nodes we've already inspected)

    var g = 0; //Cost from start to current node
    var h = heuristic(start, destination); //Cost from current node to destination
    var f = g+h; //Cost from start to destination going through the current node

    //Push the start node onto the list of open nodes
    open.push(start); 

    //Keep going while there's nodes in our open list
    while (open.length > 0) {
      //Find the best open node (lowest f value)

      //Alternately, you could simply keep the open list sorted by f value lowest to highest,
      //in which case you always use the first node
      var best_cost = open[0].f;
      var best_node = 0;

      for (var i = 1; i < open.length; i++){
        if (open[i].f < best_cost) {
          best_cost = open[i].f;
          best_node = i;
        }
      }

      //Set it as our current node
      var current_node = open[best_node];

      //Check if we've reached our destination
      if (current_node.x == destination.x && current_node.y == destination.y){
        var path = [destination]; //Initialize the path with the destination node

        //Go up the chain to recreate the path 
        while (current_node.parent_index != -1) {
          current_node = closed[current_node.parent_index];
          path.unshift(current_node);
        }

        return path;
      }
      
      //Remove the current node from our open list
      open.splice(best_node, 1);

      //Push it onto the closed list
      closed.push(current_node);

      //Expand our current node (look in all 8 directions)
      var min = 0;
      var max = 0;
      var availableLocations = [];
      
      // x is the column
      if (current_node.y % 2) {
        availableLocations = [{y:current_node.y - 1, x:current_node.x},
                              {y:current_node.y - 1, x:current_node.x + 1},
                              {y:current_node.y, x:current_node.x - 1},
                              {y:current_node.y, x:current_node.x + 1},
                              {y:current_node.y + 1, x:current_node.x},
                              {y:current_node.y + 1, x:current_node.x + 1}
                             ];
      }
      else {
        availableLocations = [{y:current_node.y - 1, x:current_node.x - 1},
                              {y:current_node.y - 1, x:current_node.x},
                              {y:current_node.y, x:current_node.x - 1},
                              {y:current_node.y, x:current_node.x + 1},
                              {y:current_node.y + 1, x:current_node.x - 1},
                              {y:current_node.y + 1, x:current_node.x}
                             ];
      }
      
      for (var j = 0; j < availableLocations.length; j++) {
        var new_node_x = availableLocations[j].x;
        var new_node_y = availableLocations[j].y;
        if (((0 <= new_node_x && new_node_x < width) && (0 <= new_node_y && new_node_y < width) && !board[new_node_x][new_node_y].fill) || (destination.x == new_node_x && destination.y == new_node_y)) {
          //document.write("(" + new_node_x + ", " + new_node_y + ") " + !board[new_node_x][new_node_y].fill);
          //See if the node is already in our closed list. If so, skip it.
          var found_in_closed = false;
          for (var i in closed) {
            if (closed[i].x == new_node_x && closed[i].y == new_node_y) {
            found_in_closed = true;
            break;
            }
          }

          if (found_in_closed) {
            continue;
          }

          //See if the node is in our open list. If not, use it.
          var found_in_open = false;
          for (var i in open) {
            if (open[i].x == new_node_x && open[i].y == new_node_y) {
              found_in_open = true;
              break;
            }
          }

          if (!found_in_open) {
            var new_node = new node(new_node_x, new_node_y, closed.length-1, -1, -1, -1);

            new_node.g = current_node.g + Math.floor(Math.sqrt(Math.pow(new_node.x-current_node.x, 2)+Math.pow(new_node.y-current_node.y, 2)));
            new_node.h = heuristic(new_node, destination);
            new_node.f = new_node.g+new_node.h;

            open.push(new_node);
          }
        }
      }
    }
    return [];
  }

  function heuristic(current_node, destination){
    //Find the straight-line distance between the current node and the destination.
    return Math.floor(Math.sqrt(Math.pow(current_node.x-destination.x, 2)+Math.pow(current_node.y-destination.y, 2)));
  }

  function node(x, y, parent_index, g, h, f) {
    this.x = x;
    this.y = y;
    this.parent_index = parent_index;
    this.g = g;
    this.h = h;
    this.g = f;
  }

  function getMouseButton(e) {
    return (e ? e.which : window.event.button);
  }

  function Circle(x, y, r) {
    var self = this;
    this.radius = r;
    this.x = x;
    this.y = y;
    this.pos = {
      x: x,
      y: y
    };
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.debug = "";
    this.fill = false;
    this.hasCat = false;
    this.parent = null;
    this.updateColor = function() {
      self.fill = true;
    };
    this.isInPosition = function(position) {
      var isCorrectWidth = ((self.x - self.radius + 3) < position.x) && (position.x < (self.x + self.radius - 3));
      var isCorrectHeight = ((self.y - self.radius + 3) < position.y) && (position.y < (self.y + self.radius - 3));
      return isCorrectWidth && isCorrectHeight;
    };
    this.getPosition = function() {
      return self.pos;
    };
    this.addCat = function() {
      self.hasCat = true;
    };
    this.removeCat = function() {
      self.hasCat = false;
    };
  }

  function Cat(column, row) {
    var self = this;
    this.col = column;
    this.row = row;
    this.x = 0;
    this.y = 0;
    this.updateCatPosition = function(col, row) {
      self.col = col;
      self.row = row;
    };
    this.updateCatCoordinate = function(position) {
      self.x += position.x;
      self.y += position.y;
    };
    this.getCurrentCatPosition = function() {
      return {
        col: self.col,
        row: self.row
      };
    };
    this.getCurrentCatCoordinate = function() {
      return {
        x: self.x,
        y: self.y
      };
    };
  }

  function Game(ctx) {
    var self = this;
    this.ctx = ctx;
    this.board = new Board(ctx);
    this.run = function() {
      self.start();
    };
    this.start = function() {
      self.createBoard();
      self.registerMouse();
    };
    this.onMouseDown = function(event) {
      if (self.board.lock) {
        return;
      }
      if (getMouseButton(event) == 1) {
        self.onLeftClick(event);
      }
    };
    // When the left mouse button is clicked, find the position.
    this.onLeftClick = function(e) {
      var canvas = self.board.div;
      var scroll = document.body.scrollTop;
      var winLose = 0;
      for (var posX = 0, posY = 0; canvas; canvas = canvas.offsetParent) {
        posX += canvas.offsetLeft;
        posY += canvas.offsetTop;
      }
      if (self.board.updateCircle({
        x: e.clientX - posX,
        y: e.clientY - (posY - scroll)
      })) {
        winLose = self.board.moveCat();
        if (winLose.winGame) {
          self.winGame();
        } else if (winLose.loseGame) {
          self.loseGame();
        }
      }
    };
    this.registerMouse = function() {
      self.board.div.onmousedown = self.onMouseDown;
      self.board.div.onclick = function() {
        return false;
      };
      self.board.div.ondblclick = function() {
        return false;
      };
      self.board.div.oncontextmenu = function() {
        return false;
      };
    };
    this.createBoard = function() {
      self.board.create();
    };
    this.winGame = function() {
      $ionicPopup.alert({
        title: 'Woohoo!',
        content: 'Budy, you win by ' + $scope.steps + ' Steps!'
      }).then(function(res) {
        $scope.run();
      });
    };
    this.loseGame = function() {
      $ionicPopup.alert({
        title: 'Ops!',
        content: 'Budy, try again!'
      }).then(function(res) {
        $scope.run();
      });
    };
  }

  $scope.run = function() {
    setTimeout(function() {
      $scope.steps = 0;
      var canvas = document.getElementById('canvas');
      var ctx = canvas.getContext('2d');
      var game = new Game(ctx);
      game.run();
    }, 300);
  };

  function supports_canvas() {
    return !!document.createElement('canvas').getContext;
  }

  function checkCanvas() {
    if (!supports_canvas()) {
      return false;
    } else {
      var dummy_canvas = document.createElement('canvas');
      var context = dummy_canvas.getContext('2d');
      return typeof context.fillText == 'function';
    }
  }

  function startUp() {
    if (checkCanvas()) {
      $scope.run();
    } else {
      alert("Sorry, but your browser does not support the canvas tag.");
    }
  }

  angular.element(document).ready(function() {
    startUp();
  });

});