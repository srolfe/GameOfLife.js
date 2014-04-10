var RLE=function(){
	// Converts RLE into multi-dim array
	this.decode=function(rle){
		var pattern=[], count='';
		for (var i=0;i<rle.length;i++){
			var c=rle.charAt(i);
		    if (i==0) pattern.push([]);
			if (!isNaN(c)) count+=''+c;
			else if (c=="$") pattern.push([]);
			else{
				if (c=="b" || c=="o"){
					count=count!=''?parseInt(count):1;
					for (x=0;x<count;x++){
						pattern[pattern.length-1].push(c=="b"?0:1);
					}
				}
				count='';
			}
		}
		
		return pattern;
	}
	
	this.multiDimToState=function(pattern){
		var state={}
		for (var y in pattern){
			for (var x in pattern[y]){
				if (state[y]==undefined) state[y]=[];
				if (pattern[y][x]==1 && state[y].indexOf(x)==-1) state[y].push(x);
			}
		}
		
		return state;
	}
	
	// Converts multi-dim array to rle format
	this.encode=function(arr){
		var rle="", count=0, last;
		for (var y=0;y<arr.length;y++){
			for (var x=0;x<arr[y].length;x++){
				if (last==arr[y][x]) count++;
				else{
					if (last!=undefined) rle+=(count>1?count:"")+(last?"o":"b");
					last=arr[y][x];
					count=1;
				}
				
				if (x==arr[y].length-1) rle+=(count>1?count:"")+(last?"o":"b");
			}
			
            count=0;last=undefined;
			rle+=(y==arr.length-1?"!":"$");
		}
		
		return rle;
	}
	
	this.stateToMultiDim=function(state){
		var multiDim=[];
		
		// First mins/maxes
		var minY,maxY,minX,maxX;
		for (var y in state){
			for (var xRef in state[y]){
				var x=state[y][xRef];
				maxY=(maxY==undefined || y>maxY)?y:maxY; maxX=(maxX==undefined || x>maxX)?x:maxX;
				minY=(minY==undefined || y<minY)?y:minY; minX=(minX==undefined || x<minX)?x:minX;
			}
		}
		
		var width=maxX-minX, height=maxY-minY;
		
		// Populate multiDim
		for (var y=0;y<=height;y++){
			multiDim.push([]);
			for (var x=0;x<=width;x++){
				multiDim[y].push(0);
			}
		}
		
		var adjX=0-minX, adjY=0-minY;
		
		// Iterate through state, record to multiDim at 0,0
		for (var oY in state){
			var y=parseInt(oY)+adjY;
			for (var oX in state[oY]){
				var x=parseInt(state[oY][oX])+adjX;
				multiDim[y][x]=1;
			}
		}
		
		return multiDim;
	}
}