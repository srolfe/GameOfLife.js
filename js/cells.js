// Cell model
var Cells=function(cellState){
	this.state={};
	this.seedCells=function(cellState){
		this.state=copyCells(cellState);
	}
	
	// Copy our JSON cell representation
	function copyCells(original){
		var duplicate={};
		
		for (var y in original){
			duplicate[y]=[];
			for (var xRef in original[y]){
				duplicate[y].push(original[y][xRef]);
			}
		}
		
		return duplicate;
	}
	
	// Cell manipulation
	this.enable=function(x,y){
		if (this.state[y]==undefined) this.state[y]=[];
		if (!this.isEnabled(x,y)) this.state[y].push(x);
	}
	
	this.disable=function(x,y){
        if (this.isEnabled(x,y)){
            if (this.state[y].length==1){
                delete this.state[y];
            }else{
                this.state[y].splice(this.state[y].indexOf(x),1);
            }
        }
	}
		
	this.flip=function(x,y){
		if (this.isEnabled(x,y)){
			this.disable(x,y);
		}else{
			this.enable(x,y);
		}
	}
	
	this.isEnabled=function(x,y){
		if (this.state[y]!=undefined && this.state[y].indexOf(x)>-1){
			return true;
		}else{
			return false;
		}
	}
	
	// Cell centering on a viewport
	this.center=function(view){
		// Figure out current pattern bounds
		var minY,maxY,minX,maxX;
		for (var y in this.state){
			for (var xRef in this.state[y]){
				var x=this.state[y][xRef];
				maxY=(maxY==undefined || y>maxY)?y:maxY; maxX=(maxX==undefined || x>maxX)?x:maxX;
				minY=(minY==undefined || y<minY)?y:minY; minX=(minX==undefined || x<minX)?x:minX;
			}
		}
	
		// We've got min's and maxes... Find width/height of pattern
		var width=maxX-minX, height=maxY-minY;
		var center_y=view.max.y/2, center_x=view.max.x/2;
		
		// -- NEEDS UPDATING FOR VIEWPORT: max and mins of current view
	
		// Adjust pattern to fit at center - subtract width from center, figure out manipulation from minX
		var adjust_x=center_x-(width/2); adjust_x=Math.floor(adjust_x-minX);
		var adjust_y=center_y-(height/2); adjust_y=Math.floor(adjust_y-minY);
		
		// Manipulate state into newState
		var newState={};
		for (var y in this.state){
			for (var xRef in this.state[y]){
				var x=this.state[y][xRef];
				var newX=parseInt(x)+parseInt(adjust_x), newY=parseInt(y)+parseInt(adjust_y);
				
				if (newState[newY]==undefined) newState[newY]=[];
				if (newState[newY].indexOf(newX)==-1) newState[newY].push(newX);
			}
		}
		
		// Apply new state
		this.state=newState;
	}
	
	if (cellState!=undefined) this.seedCells(cellState);
}