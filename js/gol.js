// Main controller - manages interactions between game and view
var GameOfLife=function(cellState){
	// State variables, mainly for GUI manipulation
	var isDragging=false, last={x:-1, y:-1}, interval=false, paused=false, zoom=10, speed=50;
	var cellHistory=[];
	
	// Setup our objects - cells, game, board
	var rle=new RLE();
	var cells=(cellState!=undefined)?new Cells(rle.multiDimToState(rle.decode((cellState)))):new Cells();
	var game=new Game(cells);
	var board=new Board(0, 0, Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom), Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom),zoom);
	
	// Setup board
	board.draw.grid();
	if (cellState!=undefined){
		centerCells();
		board.draw.board(cells.state);
	}
	
	function recordCellHistory(){
		if (cellHistory.length>=100){
			cellHistory.shift();
		}
		
		cellHistory.push(cells.state);
	}
	
	function start(){
		if (interval==false) interval=setInterval(function(){
			recordCellHistory();
			cells=new Cells(cells.state);
			game.tick(cells);
			board.draw.board(cells.state,game.get.generation(),cellHistory);
		},speed); 
	}
	
	function stop(){
		if (interval!=false) clearInterval(interval); interval=false;
	}
	
	function setSpeed(factor){
		var speedButton=document.getElementById('speedBut'), speedField=document.getElementById('speed'), speedInput=document.getElementById('speedSet');
		
		// Fancy GUI manipulation
		if (factor==undefined){
			speedButton.style.padding="4px";
			speedField.style.display="none";
			speedInput.style.display="inline";
			speedInput.onblur="setSpeed(this.value);"
			speedInput.value=speedField.innerHTML;
		}else{
			if (speedField.style.display=="none"){
				speedInput.onblur="";
				speedButton.style.padding="";
				speedField.style.display="inline";
				speedInput.style.display="none";
			
				speed=parseInt(factor);
			}else{
				speed+=parseInt(factor);
			}
		
			if (speed<10) speed=10;
			speedField.innerHTML=speed;
	
			if (interval!=false){ stop(); start(); }
		}
	}
	
	function zoomField(factor){
		zoom=zoom<10 || (zoom==10 && factor<0)?(factor<0?zoom-1:zoom+1):(factor<0?zoom-10:zoom+10);
		if (zoom<2) zoom=2;
	
		board=new Board(0,0,Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom),Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom),zoom);
		board.draw.grid();
		board.draw.board(cells.state,game.get.generation(),cellHistory);
	}
	
	// Bind buttons
	document.getElementById('playButton').onclick=function(){ start(); }
	document.getElementById('stopButton').onclick=function(){ stop(); }
	document.getElementById('centerButton').onclick=function(){ centerCells(); }
	document.getElementById('reloadButton').onclick=function(){ loadInitialState(); }
	document.getElementById('resetButton').onclick=function(){ resetGame(); }
	document.getElementById('shareState').onclick=function(){ share(); }
	
	document.getElementById('speedUp').onclick=function(){ setSpeed(10); }
	document.getElementById('speedDown').onclick=function(){ setSpeed(-10); }
	
	document.getElementById('zoomUp').onclick=function(){ zoomField(1); }
	document.getElementById('zoomDown').onclick=function(){ zoomField(-1); }
	
	// Method behind viewport manipulation:
	// 	clicking picks up the viewport
	// 	mouse centers in viewport
	// 	moving in any direction causes the view to move in that direction
	// 	farther from the center = faster moving
	
	// Mouse / touch events
	document.getElementById('grid').onmousedown=function(evt){ handleMouse(evt); } // Setup dragging, handle click events
	document.getElementById('grid').onmousemove=function(evt){ handleMouse(evt); } // Handle dragging
	document.getElementById('grid').ontouchmove=function(evt){ handleMouse(evt); } // Handle touches - NEEDS touchended (like mouseup)
	document.onmouseup=function(){ isDragging=false; if (paused){ paused=false; start(); } }; // Unset dragging and unpause game
	
	// Window events - resize board
	window.onresize=function(){
		board=new Board(0,0,Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom),Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom),zoom);
		board.draw.grid();
		board.draw.board(cells.state,game.get.generation(),cellHistory);
	}
	
	// Handle most mouse events
	function handleMouse(event){
		event.preventDefault();
		if (event.type=="mousedown") isDragging=true; // Handle dragging
		if (event.type!="mousemove") if (interval!=false){ paused=true; stop(); } // Pause the game while adding cells
		
		// Force event to appear as a touch
		if (event.targetTouches==undefined) event.targetTouches=[{pageX:event.pageX,pageY:event.pageY}];
		
		for (var i in event.targetTouches){
			// Figure out X,Y in viewport
			var touch=event.targetTouches[i];
			var coord={x:touch.pageX-field.offsetLeft,y:touch.pageY-field.offsetTop}
			coord.x=(coord.x-(coord.x%zoom))/zoom; coord.y=(coord.y-(coord.y%zoom))/zoom;
			
			// Handle dragging, last checks and record the cell
			if (isDragging || event.type!="mousemove"){
				if ((last.x!=coord.x || last.y!=coord.y) || event.type=="mousedown"){
					last={x:coord.x,y:coord.y}
					cells.flip(coord.x,coord.y);
					board.draw.cell(coord.x,coord.y,cells.isEnabled(coord.x,coord.y));
					board.draw.overview(cells.state);
				}
			}
		}
	}
	
	// Handle cell centering
	function centerCells(){
		var view={
			max:{
				x:Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom),
				y:Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom)
			}
		}
		
		cells.center(view);
		game.set.cells();
		board.draw.board(cells.state,undefined,cellHistory);
	}
	
	// Handle reloads
	function loadInitialState(){
		cellHistory=[];
		stop();
		
		// Get, save and set initial state
		var initialState=game.get.initialState();
		cells=new Cells(initialState.state);
		game.set.cells(cells);
		
		// Draw
		board.draw.board(cells.state,undefined,cellHistory);
	}
	
	// Reset game
	function resetGame(){
		cellHistory=[];
		stop();
		
		cells=new Cells();
		game.set.cells(cells);
		board.draw.board(cells.state,undefined,cellHistory);
	}
	
	function share(){
		var rleStr=rle.encode(rle.stateToMultiDim(cells.state));
		
		window.location="?q="+(rleStr);
	}
}