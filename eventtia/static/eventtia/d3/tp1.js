
let circle = d3.select("#viz").selectAll("circle");
circle.style("fill", "steelblue");
circle.attr("r", 30);

dibujaMapa();

function dibujaMapa(datosPar){
  
    var format = d3.format(",.2s");
    var limiteSupe;
    
    if( seleccion == 1) limiteSupe = valueAsis;
    else limiteSupe = valueDepo;

    const hierarchy = (data) => d3.hierarchy(
        {key: "", values:data},
        d => d.values)
        .eachBefore((d) => {    
            d.data.name = d.children ? d.data.key : ""; 
            d.data.name = d.data.name.toLowerCase()
            d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
        })
        .sum(d => +d.total_deposits)
        .sort((a,b) => b.value - a.value);

    
    const treeData = d3.nest()
    .key(d => d.account_name.trim())
    .key(d => d.event_name.trim())
    .entries(datosPar.filter(d => d.total_deposits < limiteSupe ));
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, 7))
    
    const treemapData = layout(hierarchy(treeData));
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, width*3/4])
        .style("font", "10px sans-serif");
    
    const leaf = svg.selectAll("g.leaf")
      .data(treemapData.leaves().filter(d=> d.x1-d.x0>0.5)) 
      .join("g")
        .attr("class", "leaf")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
  
    
    leaf.append("title")
        .text(d => `${d.ancestors().reverse()
              .map(d => d.data.name).join("/")}\n${format(d.value)}`);
              
  
    leaf.append("rect")
        .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.key); })
        .attr("fill-opacity", 0.6)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);
    
    leaf.filter(d => d.x1-d.x0 > 30) 
      .call( leaf => {
        leaf.append("clipPath")
            .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
          .append("use")
            .attr("xlink:href", d => d.leafUid.href);
  
        leaf.append("text")
            .attr("clip-path", d => d.clipUid)
          .selectAll("tspan")
          .data(d => d.ancestors().reverse()
                  .slice(1)
                  .map(d => d.data.name)
                  .concat(format(d.value)))
          .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .text(d => d);
      })
    
    const innerNodes = svg.selectAll("g.inner")
      .data(treemapData.descendants().filter(d=> d.children && d.depth<=2 && d.x1-d.x0>20))
      .join("g")
        .attr("class", "inner")
        .style("pointer-events", "none")
        .style("cursor", "none")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
            
    innerNodes.append("rect")
      .style("fill", "none")
      .style("stroke", "#333")
      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);
    
    innerNodes.append("clipPath")
      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
      .append("use")
      .attr("xlink:href", d => d.leafUid.href);
  
    innerNodes.append("text")
      .attr("clip-path", d => d.clipUid)
      .attr("y", d => d.depth === 1 ? 30 : (d.y1 - d.y0)/2 )
      .attr("x", d => (d.x1 - d.x0)/2 )
      .style("text-anchor", "middle")
      .style("font-size", "3em")
      .attr("fill-opacity", 0.3)
      .style("stroke", "white")
      .style("stroke-width", d => d.depth === 1 ? 1: 0.5)
      .text(d => d.data.name);
    
    
  
    return svg.node();
  }