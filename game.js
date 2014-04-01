// Field x,y object, last object for mouse events
var max, last={x:-1, y:-1}, zoom=10, speed=50, generation=0;

// State variables
var cells=[], initialState=[], isDragging=false, paused=false, interval=false;

// Work with canvases
var field=document.getElementById("field"), context=field.getContext("2d");
var grid=document.getElementById("grid"), g_context=grid.getContext("2d");

// Main game function - creates / kills cells
function tick(){
	// Copy cells for manipulation
	var nextTick=JSON.parse(JSON.stringify(cells));
	
	if (generation==0) initialState=JSON.parse(JSON.stringify(cells));
	
	// Interate through each cell
	for (var y=0;y<=max.y;y++){
		for (var x=0;x<=max.x;x++){
			var neighbors=countNeighbors(x,y);
			if (cells[y][x]==1 && (neighbors<2 || neighbors>3)) nextTick[y][x]=0; // Live cell, <2 || >3 neighbors = dead
			if (cells[y][x]==0 && neighbors==3) nextTick[y][x]=1; // Dead cell, =3 neighbors = alive
		}
	}

	cells=nextTick;
	generation++;
	drawBoard();
}

// -- Sharing functionality --
function getUrlVars() {
	var vars={};
    var parts=window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(m,key,value){
        vars[key]=value;
    });
    return vars;
}

function shareState(){
	var record={}
	for (var y in cells){
		for (var x in cells[y]){
			if (cells[y][x]==1){
				if (record[y]==undefined) record[y]=[];
				record[y].push(x);
			}
		}
	}
	
	document.location="?s="+btoa((JSON.stringify(record)).replace(/"/g,''));
}

function loadSharedState(share){
	var record=JSON.parse((atob(share)).replace(/(\d+)/g,'"$1"'));
	
	for (var y in record){
		if (cells[y]!=undefined){
			for (var val in record[y]){
				var x=record[y][val];
				if (cells[y][x]!=undefined) cells[y][x]=1;
			}
		}
	}
	
	initialState=JSON.parse(JSON.stringify(cells));
}

// Count all 8 neighbors
function countNeighbors(x,y){
	return (y<max.y?cells[y+1][x]:0)+(x<max.x?cells[y][x+1]:0)+(y>0?cells[y-1][x]:0)+(x>0?cells[y][x-1]:0)+(y>0 && x>0?cells[y-1][x-1]:0)+(y<max.y && x<max.x?cells[y+1][x+1]:0)+(y>0 && x<max.x?cells[y-1][x+1]:0)+(y<max.y && x>0?cells[y+1][x-1]:0);
}

// Start tick interval
function startGame(){ if (interval==false) interval=setInterval(tick,speed); }

// Clear tick interval
function stopGame(){ if (interval!=false) clearInterval(interval); interval=false; }

function resetGame(state){
	document.getElementById('generation').innerHTML="";
	generation=0;
	
	// Stop the game and clear cells[]
	stopGame();
	delete cells;
	
	max={
		x:Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom),
		y:Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom)
	}
	
	// Clear all cells
	for (var y=0;y<=max.y;y++){
		cells[y]=[];
		for (var x=0;x<=max.x;x++){
			cells[y][x]=0;
		}
	}
	
	// Re-draw grid and rebind
	drawGrid();
	doBinds();
	
	if (state!=undefined){
		// Oh snap, we need to load the state...
		loadSharedState(state);
		drawBoard();
	}
}

function reloadState(){
	resetGame();
	cells=JSON.parse(JSON.stringify(initialState));
	drawBoard();
}

function drawGrid(){
	// Reset canvas width / height / position
	field.width=(max.x*zoom);grid.width=(max.x*zoom);
	field.height=(max.y*zoom);grid.height=(max.y*zoom);
	field.style.marginLeft="-"+field.width/2+"px";
	grid.style.marginLeft="-"+grid.width/2+"px";
	
	// Draw vertical lines
    for (var x=0.5;x<grid.width;x+=zoom){
		g_context.moveTo(x,0);
		g_context.lineTo(x,field.height);
    } 

	// Draw horizontal lines
    for (var y=0;y<grid.height;y+=zoom){
		g_context.moveTo(0.5, y);
		g_context.lineTo(field.width, y);
    }

	// Draw
    g_context.strokeStyle = "#eee";
    g_context.stroke();
}

function drawBoard(){
	// Reset field
	field.width=(max.x*zoom);field.height=(max.y*zoom);
	
	document.getElementById('generation').innerHTML="["+generation+"]";
	
	// Draw each cell
	for (var y in cells){
		for (var x in cells[y]){
			if (cells[y][x]==1){
			    context.fillRect(x*zoom,y*zoom,zoom,zoom);
				context.strokeStyle='#000';
			    context.stroke();
			}
		}
	}
}

function doBinds(){
	document.getElementById('grid').onmousedown=function(){
	    isDragging=true; // Handle dragging
		if (interval!=false){ paused=true; stopGame(); } // Pause the game while adding cells
		
		// Get X,Y
	    var x=event.pageX-field.offsetLeft,y=event.pageY-field.offsetTop;

	    // Increments of 10... Round down to a ten
	    x=(x-(x%zoom))/zoom;y=(y-(y%zoom))/zoom;
		
		// Record last, so we're not duplicating events
		last.x=x;last.y=y;
	    makeBox(x,y);
	}
	
	document.getElementById('grid').ontouchmove=function(){
		event.preventDefault();
		
		for (var i in event.targetTouches){
			if (interval!=false){ paused=true; stopGame(); } // Pause the game while adding cells
			
			var touch=event.targetTouches[i];
			
			// Get X,Y
		    var x=touch.pageX-field.offsetLeft,y=touch.pageY-field.offsetTop;

		    // Increments of 10... Round down to a ten
		    x=(x-(x%zoom))/zoom;y=(y-(y%zoom))/zoom;
		
			// Record last, so we're not duplicating events
			if (last.x!=x || last.y!=y){
				last={x:x,y:y}
				makeBox(x,y);
			}
		}
	};

	document.onmouseup=function(){
		isDragging=false; // Dragging
		if (paused){ paused=false; startGame(); } // Unpause game after adding cells
	};

	document.getElementById('grid').onmousemove=function(){
		event.preventDefault();
		
		// Get X,Y
	    var x=event.pageX-field.offsetLeft,y=event.pageY-field.offsetTop;

	    // Increments of 10... Round down to a ten
	    x=(x-(x%zoom))/zoom;y=(y-(y%zoom))/zoom;
		
	    if (isDragging){
			if (last.x!=x || last.y!=y){
				last={x:x,y:y}
				makeBox(x,y);
			}
		}
	};
	
	window.onresize=function(){
		zoomField(0);
	}
}

function zoomField(factor){
	zoom+=parseInt(factor);
	if (zoom<10) zoom=10;
	
	if (interval!=false){ paused=true; stopGame(); }
	
	max={
		x:Math.floor(((self.innerWidth-(self.innerWidth%zoom))-50)/zoom),
		y:Math.floor(((self.innerHeight-(self.innerHeight%zoom))-100)/zoom)
	}
	
	// Re-draw grid and rebind
	drawGrid();
	doBinds();
	
	// Clear all cells > zoom... Add cells if needed
	// One at a time... First, kill all unneeded cells
	for (var y in cells){
		for (var x in cells){
			if (x>max.x) delete cells[y][x];
		}
		
		if (y>max.y) delete cells[y];
	}
	
	for (var y=0;y<=max.y;y++){
		if (cells[y]==undefined) cells[y]=[];
		for (var x=0;x<=max.x;x++){
			if (cells[y][x]==undefined) cells[y][x]=0;
		}
	}
	
	// Draw board
	drawBoard();
	
	if (paused){ paused=false; startGame(); } 
}

function setSpeed(factor){
	var speedButton=document.getElementById('speedBut');
	var speedField=document.getElementById('speed');
	var speedInput=document.getElementById('speedSet');
	
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
	
		if (interval!=false){
			stopGame();
			startGame();
		}
	}
}

function makeBox(x,y){
	// Flip-flop
	if (cells[y][x]==0){
		cells[y][x]=1;
		context.strokeStyle = "#ddd";
	    context.fillRect(x*zoom,y*zoom,zoom,zoom);
	    context.stroke();
	}else{
		cells[y][x]=0;
		context.clearRect(x*zoom,y*zoom,zoom,zoom)
	}
}

// Setup the game
if (getUrlVars()["s"]!=undefined){
	resetGame(getUrlVars()["s"]);
}else{
	resetGame();
}