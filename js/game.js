// Game controller
var Game=function(cellState){
	// Private variables
	var cells, initialState={}, generation=0;
	
	// Instantiate Cells, or use our cellState reference
	if (cellState!=undefined){
		cells=cellState;
		initialState=new Cells(cells.state);
	}else{
		cells=new Cells();
	}
	
	// Getters
	this.get={
		initialState: function(){
			return initialState;
		},
		
		generation: function(){
			return generation;
		}
	}
	
	// Setters
	this.set={
		cells: function(newCells){
			if (newCells!=undefined){
				cells=newCells;
				initialState=new Cells(cells.state);
			}
			
			generation=0;
		}
	}
	
	// Exposed functions
	this.tick=function(newCells){
		var nextTick=newCells;
		if (generation==0) initialState=new Cells(cells.state);

		// Iterate through each cell
		for (var y in cells.state){
			y=parseInt(y);
			
			for (var xRef in cells.state[y]){
				x=parseInt(cells.state[y][xRef]);
				var neighbors=_countNeighbors(x,y);
				
				// Live cell, <2 || >3 neighbors = dead
                if (neighbors<2 || neighbors>3) nextTick.disable(x,y);
				
				// Check all neighbors for life creation scenario
				var matches=_checkDeadNeighbors(x,y);
				if (matches.length>0){
					for (var i in matches){
						var match=matches[i];
						nextTick.enable(match[0],match[1]);
					}
                }
			}
		}

		cells=nextTick;
		generation++;
		
		//return cells; // Always keep the controller informed of the current state
	}
	
	// Private functions
	function _checkDeadNeighbors(x,y){
		var recreate=[];
		
		if (!cells.isEnabled(x-1,y-1) && _countNeighbors(x-1,y-1)==3) recreate.push([x-1,y-1]); // TL
		if (!cells.isEnabled(x,y-1) && _countNeighbors(x,y-1)==3) recreate.push([x,y-1]); // TM
		if (!cells.isEnabled(x+1,y-1) && _countNeighbors(x+1,y-1)==3) recreate.push([x+1,y-1]); // TR
		
		if (!cells.isEnabled(x-1,y) && _countNeighbors(x-1,y)==3) recreate.push([x-1,y]); // ML
		if (!cells.isEnabled(x+1,y) && _countNeighbors(x+1,y)==3) recreate.push([x+1,y]); // MR
		
		if (!cells.isEnabled(x-1,y+1) && _countNeighbors(x-1,y+1)==3) recreate.push([x-1,y+1]); // BL
		if (!cells.isEnabled(x,y+1) && _countNeighbors(x,y+1)==3) recreate.push([x,y+1]); // BM
		if (!cells.isEnabled(x+1,y+1) && _countNeighbors(x+1,y+1)==3) recreate.push([x+1,y+1]); // BR
        
		return recreate;
	}
	
	function _countNeighbors(x,y){
		var total=0;
        
		if (cells.isEnabled(x-1,y-1)) total++; // TL
		if (cells.isEnabled(x,y-1)) total++; // TM
		if (cells.isEnabled(x+1,y-1)) total++; // TR
		
		if (cells.isEnabled(x-1,y)) total++; // ML
		if (cells.isEnabled(x+1,y)) total++; // MR
		
		if (cells.isEnabled(x-1,y+1)) total++; // BL
		if (cells.isEnabled(x,y+1)) total++; // BM
		if (cells.isEnabled(x+1,y+1)) total++; // BR
        
		return total;
	}
	
	if (cellState!=undefined) cells=cellState;
}