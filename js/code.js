function domReady(callback) {
	document.readyState==='interactive' || document.readyState ==='complete' ? callback() : document.addEventListener('DOMContentLoaded', callback)
}
domReady(function () {
	(function() {
		if(typeof document!=='undefined' && typeof document.getElementsByClassName!=='function') {
			document.getElementsByClassName = function (val) {
				var classList = [];
				if(typeof val !=='string' && val.length<1) {
					return 'Value must be a string and have a length of at least one';
				}
				var elementList = document.getElementsByTagName('*');
				elementList = Array.prototype.slice.call(elementList);
				elementList.forEach(function(el) {
					if(el.getAttribute('class') && el.getAttribute('class')===val) {
						classList.push(el);
					}
				})
			return classList;
			}
		}
	}())
	var iterated = 0;
	var nodeCache = {};
  var gridCellNodeObject=[],
	rows=24,
	cols=24,
	grid = new Array(rows),
	nextGrid = new Array(rows),
  gameRunning = false,
  startButton = document.getElementById('start'),
  clearButton = document.getElementById('clear'),
	frag = document.createDocumentFragment(),
	gridContainer = document.getElementById('gridContainer'),
	table = document.createElement('table');
	table.id = 'mainTable';

	// Initialize the application
  init();

	function init() {
  	if(!gridContainer){
  		console.error('There should be a div with an id of gridContainer');
  	}
		createTableData();
		for(var i=0;i<rows;i++) {
			grid[i]=new Array(cols);
			nextGrid[i]=new Array(cols);
		}
		resetGrid();
		buttonListeners();
	}

  function applyRules(row,col) {
    var a = row-1,b=row,c=row+1,x=col-1,y=col,z=col+1;
    var neighbors = [];
    var litNeighbords;
    var currentCell = !!grid[row][col];

    switch (true) {
      case (row===0 && col===0):
        neighbors=[grid[b][z],grid[c][y],grid[c][z]];
        break;
      case (row===0 && col === 23):
        neighbors = [grid[b][x],grid[c][x],grid[c][y]];
        break;
      case (row===23 && col===0):
        neighbors = [grid[a][y],grid[a][z],grid[b][z]];
        break;
      case (row===23 && row ===23):
        neighbors = [grid[a][x],grid[b][x],grid[a][y]];
        break;
      case (row===0):
        neighbors = [grid[c][x],grid[b][x],grid[b][z],grid[c][z],grid[c][y]];
        break;
      case (row===23):
        neighbors = [grid[a][x],grid[b][x],grid[b][z],grid[a][z],grid[a][y]];
        break;
      case (col === 0):
        neighbors = [grid[c][z],grid[c][y],grid[b][z],grid[a][z],grid[a][y]];
        break;
      case (col===23):
        neighbors = [grid[a][x],grid[a][y],grid[b][x],grid[c][x],grid[c][y]];
        break;
      default:
        neighbors = [grid[a][x],grid[a][y],grid[a][z],grid[b][x],grid[b][z],grid[c][x],grid[c][y],grid[c][z]];
        break;
    }
    litNeighbors = neighbors.reduce((a,b)=>{return a + b});
    updateGrids(row,col,litNeighbors);
  }

  function updateGrids(row,col,litNeighbors) {
    switch (true) {
      case ((!grid[row][col]) && (litNeighbors===3)):
        nextGrid[row][col]=1;
        break;
      case (!!grid[row][col] && litNeighbors<2):
        nextGrid[row][col]=0;
        break;
      case (!!grid[row][col] && (litNeighbors===2 || litNeighbors===3)):
        nextGrid[row][col]=1;
        break;
      case (!!grid[row][col] && litNeighbors>3):
        nextGrid[row][col]=0;
        break;
      default:
        nextGrid[row][col]=grid[row][col];
        break;        
    }
    if(row === 23 && col===23) {
      grid = nextGrid;
      updateInterface();
      var timer = setTimeout(function() {
      	if(gameRunning) {
      		checkGrids()	
      	}
      }, 200);
    }  

  }

  function updateInterface() {
    var idToCheck,nodeToUpdate;
    for(var i = 0; i<rows; i++) {
      for(var j = 0; j<cols; j++) {
        idToCheck = i + '_' + j;
        // Let's cache the DOM node so it only has to be retrieved
      	if(!!nodeCache[idToCheck]) {
      		nodeToUpdate = nodeCache[idToCheck];
      	}else{
  	      nodeToUpdate = document.getElementById(idToCheck);
	        nodeCache[idToCheck] = nodeToUpdate;
      	}
        nodeToUpdate.className = !!grid[i][j]?'live':'dead';
      }
    }
  }
 
  function updateButtonText(val) {
  	// This function is super bloated. Way too much code here.
  	var buttonLabel;
  	if(typeof val === 'string') {
  		buttonLabel = val;
  	}else{
  		buttonLabel = 'Resume';
  	}
  	if(!gameRunning) {
	  	gameRunning = !gameRunning;
  		startButton.textContent = 'Pause';
  		checkGrids()
  	}else{
  		gameRunning = !gameRunning;
  		startButton.textContent = buttonLabel;
  	}
  }

	function checkGrids() {
		var currRow, currCol, newGriddle;
		for(var i=0;i<grid.length;i++) {
			for(var j=0;j<grid[i].length;j++) {
          applyRules(i,j);
			}
		}
	}

  function resetGrid() {
  	var liveCells;
  	if(gameRunning) {
		 	updateButtonText('Start');
  	}else{
  		startButton.textContent = 'Start';
  	}
		for (var i = 0; i < rows; i++) {
			for (var j = 0; j < cols; j++) {
				grid[i][j] = 0;
				nextGrid[i][j] = 0;
			}
		}
    liveCells = Array.prototype.slice.call(document.getElementsByClassName('live'));
    liveCells.forEach((el) => {
      el.className='dead';
    })
  }

  function buttonListeners() {
    startButton.addEventListener('click',updateButtonText,false)
    clearButton.addEventListener('click',resetGrid,false);
  }

	function createTableData() {
		for(var i=0;i<rows;i++){
			var newRow = document.createElement('tr');
			for(var j=0;j<cols;j++) {
				var newTd = document.createElement('td');
				newTd.className = 'dead';
				newTd.id = i + '_' + j;
				newTd.addEventListener('click',toggleLife)
        gridCellNodeObject.push(newTd);
				newRow.appendChild(newTd);
			}
			table.appendChild(newRow);
		}
		frag.appendChild(table);
		gridContainer.appendChild(frag);

	}

	function toggleLife() {
		var rowcol = this.id.split('_');
		var row = rowcol[0], col=rowcol[1];
		var alive = this.className==='live'?true:false;
		if(alive) {
			this.className='dead';
			grid[row][col]=0;
		}else{
			this.className='live';
			grid[row][col]=1;
		}
	}
	
})




