// Board view
var Board=function(x,y,width,height,zoom){
	var zoom=zoom, view={x:x,y:y,width:width,height:height};
	
	var field=document.getElementById("field"), context=field.getContext("2d");
	var grid=document.getElementById("grid"), g_context=grid.getContext("2d");
	var mmap=document.getElementById("minimap"), mmap_context=mmap.getContext("2d");
	var generationField=document.getElementById('generation');
	
	this.draw={
		grid:function(){
			// Reset canvas width / height / position
			field.width=(view.width*zoom); grid.width=(view.width*zoom); mmap.width=view.width+25;
			field.height=(view.height*zoom); grid.height=(view.height*zoom); mmap.height=view.height+25;
			field.style.marginLeft="-"+field.width/2+"px";
			grid.style.marginLeft="-"+grid.width/2+"px";
			
			// Fix minimap margins
			mmap.style.marginRight=(self.innerWidth-field.width)/2+"px";
			mmap.style.marginBottom=(self.innerHeight-(field.height+50))/2+"px";
			
			g_context.beginPath();

			// Draw vertical lines
		    for (var x=0.5;x<grid.width;x+=zoom){
				g_context.moveTo(x,0);
				g_context.lineTo(x,field.height);
		    } 

			// Draw horizontal lines
		    for (var y=0.5;y<grid.height;y+=zoom){
				g_context.moveTo(0.5,y);
				g_context.lineTo(field.width,y);
		    }
			
			// Stoke and save the grid
			g_context.strokeStyle="#eee";
			g_context.stroke();
			g_context.save();
			
			// Draw origin lines
			g_context.beginPath();
			var xZero=0-view.x, yZero=0-view.y;
			
			// Draw horizontal
			if (yZero>=view.y && yZero<=view.height){
				g_context.moveTo(0.5,yZero*10);
				g_context.lineTo(field.width,yZero*10);
			}
			
			// Draw vertical
			if (xZero>=view.x && xZero<=view.width){
				g_context.moveTo(xZero*10,0);
				g_context.lineTo(xZero*10,field.height);
			}
			
			// Stroke and save
			g_context.strokeStyle="#666";
			g_context.stroke();
			g_context.save();
			
			this.overview();
		},
		
		board:function(state,generation,cellHistory){
			// Reset field
			field.width=(view.width*zoom);field.height=(view.height*zoom);

			generationField.innerHTML=(generation==undefined)?"":"["+generation+"]";

			if (cellHistory!=undefined){
				// Draw the history first
				var g=cellHistory.length; var generationMap={};
				for (var i=cellHistory.length;i>=0;i--){
					// Newest drawn first
					var historyState=cellHistory[i];
					for (var y in historyState){
						if (generationMap[y]==undefined) generationMap[y]=[];
					
						for (var xRef in historyState[y]){
							var x=historyState[y][xRef];
						
							if (generationMap[y].indexOf(x)==-1){
								generationMap[y].push(x);
								this.cellHistory(x,y,g,cellHistory.length);
							}
						}
					}
				
					g--;
				}
			}
			
			// Draw each cell
			for (var y in state){
				for (var xRef in state[y]){
					var x=state[y][xRef];
					this.cell(x,y,1);
				}
			}
			
			// Save this generation
			context.save();
			
			this.overview(state);
		},
		
		// Break this up, draw when grid is drawn + state different canvas =)
		overview:function(state){
			// Reset map
			mmap.width=mmap.width;mmap.height=mmap.height;
			
			// Draw border with shadow
			mmap_context.shadowColor='#999';
			mmap_context.shadowBlur=5;
			mmap_context.shadowOffsetX=0;
			mmap_context.shadowOffsetY=0;
			mmap_context.fillStyle="#999";
			mmap_context.fillRect(5,5,mmap.width-10,mmap.height-10);
			mmap_context.fill();
			
			// Disable shadow
			mmap_context.shadowBlur=0;
			
			// Draw minimap container
			mmap_context.fillStyle="#fff";
			mmap_context.fillRect(6,6,mmap.width-12,mmap.height-12);
			mmap_context.fill();
			
			// Calculate the viewport - 1/4 the size
			var mmap_viewport={
				x:mmap.width/2-((view.width/4)/2),
				y:mmap.height/2-((view.height/4)/2),
				width:view.width/4,
				height:view.height/4
			}
			
			// Draw viewport border
			mmap_context.fillStyle="#6593C7"
			mmap_context.fillRect(mmap_viewport.x-0.5,mmap_viewport.y-0.5,mmap_viewport.width+1,mmap_viewport.height+1);
			mmap_context.fill();
			
			// Draw viewport
			mmap_context.fillStyle="#FAFDFF"
			mmap_context.fillRect(mmap_viewport.x,mmap_viewport.y,mmap_viewport.width,mmap_viewport.height);
			mmap_context.fill();

			// Move cells to viewport, display if in view or map
			var adj_x=view.x+mmap_viewport.x, adj_y=view.y+mmap_viewport.y;
			
			for (var y in state){
				y=parseInt(y);
				for (var xRef in state[y]){
					var x=parseInt(state[y][xRef]);
					if ((((y/4)+adj_y)>=7 && ((x/4)+adj_x)>=7) && (((y/4)+adj_y)<(mmap.height-7) && ((x/4)+adj_x)<(mmap.width-7))){
						mmap_context.fillStyle = "#000";
						mmap_context.fillRect((x/4)+adj_x,(y/4)+adj_y,0.25,0.25);
						mmap_context.fill();
					}
				}
			}
			
			// Draw origin lines
			// First, figure out if the origin lies in the minimap
			//mmap_context.beginPath();
			//var xZero=0-view.x, yZero=0-view.y;
			
			/*mmap_context.beginPath();
			var xZero=0-view.x, yZero=0-view.y;
			
			// Draw horizontal
			if (yZero>=view.y && yZero<=view.height){
				g_context.moveTo(0.5,yZero*10);
				g_context.lineTo(field.width,yZero*10);
			}
			
			// Draw vertical
			if (xZero>=view.x && xZero<=view.width){
				g_context.moveTo(xZero*10,0);
				g_context.lineTo(xZero*10,field.height);
			}
			
			// Stroke and save
			g_context.strokeStyle="#666";
			g_context.stroke();
			g_context.save();*/

			// Save
			mmap_context.save();
		},
		
		cell:function(x,y,state){
			if (state==1){
				context.fillStyle="#000";
				context.fillRect(x*zoom,y*zoom,zoom,zoom);
				context.fill();
			}else{
				context.clearRect(x*zoom,y*zoom,zoom,zoom)
			}
		},
		
		cellHistory:function(x,y,g,maxG){
			//console.log(g);
			//console.log(1-(0.01*g));
			context.fillStyle="rgba(200,200,200,"+((1.00/maxG)*g)+")";
			context.fillRect(x*zoom,y*zoom,zoom,zoom);
			context.fill();
		}
	}
}