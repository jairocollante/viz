console.log(edge)
	
	Promise.all([            
		d3.csv("static/eventtia/d3/tp3_nodelist.csv"),                 
		d3.csv("static/eventtia/d3/tp3_edgelist.csv")
    ]).then(function(data){
    
      createAdjacencyMatrix(data);
    
    });
    function createAdjacencyMatrix(data){
    let nodes = data[0];
    let edges =data[1];
    
    console.log('nodes',nodes);
		
		var width = 400
		var height = 400
		var widthSquare=15
		var widthSquareDiv2=7.5
		
		
		var edgeHash = {};
		edges.forEach(edge =>{
			var id = edge.source + "-" + edge.target
			edgeHash[id] = edge
		})
		console.log(edgeHash)		
		var matrix = []
		let i=1;
		nodes.forEach((source, a) => {		
			if(source.role =="participante"){				
				let j=1;
				nodes.forEach((target, b) => {
					if(target.role =="evento"){						
						var grid = {id: target.id + "-" + source.id, x: j, y: i, weight: 0};
						j++;						
						if(edgeHash[grid.id]){
							grid.weight = edgeHash[grid.id].weight;							
						}						
						matrix.push(grid)
					}				
				})
				i++;
			}
			
		})
		
		console.log(matrix)
		

	var svg = d3.select("svg")
	
	svg.attr("transform","translate(50,50)")

	d3.select("svg").append("g")
		.attr("transform","translate(35,35)")
		.attr("id","adjacencyG")
		.selectAll("rect")
		.data(matrix)
		.enter()
		.append("rect")
		.attr("class","grid")
		.attr("width",widthSquare)
		.attr("height",widthSquare)
		.attr("x", d=> d.x*widthSquare)
		.attr("y", d=> d.y*widthSquare)
		.style("fill-opacity", d=> d.weight * .2)//*/
		
	d3.select("svg")
		.append("g")
		.attr("transform","translate(50,45)")
		.selectAll("text")
		.data(nodeEventos(nodes))
		.enter()
		.append("text")
		.attr("x", (d,i) => i * widthSquare + widthSquareDiv2)
		.text(d => d.id)
		.style("text-anchor","middle")
		.style("font-size","10px")//*/
		
	d3.select("svg")
		.append("g").attr("transform","translate(45,50)")
		.selectAll("text")
		.data(nodeParticipantes(nodes))
		.enter()
		.append("text")
		.attr("y",(d,i) => i * widthSquare + widthSquareDiv2)
		.text(d => d.id)
		.style("text-anchor","end")
		.style("font-size","10px")

	
	d3.selectAll("rect.grid").on("mouseover", gridOver); 
	
	function nodeEventos(nodes){
			return nodes.filter(function (d){ 
				return d.role =="evento";				
			})
	}
	
	function nodeParticipantes(nodes){
			return nodes.filter(function (d){ 
				return d.role =="participante";				
			})
	}
	
	function gridOver(d) {
		d3.selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "3px" : "1px"});
	};
		
    };

