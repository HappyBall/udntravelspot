
dataPath = 'data/';
dataFile = 'travel_spot_mod_final.json';
dataUrl = dataPath + dataFile;

var default_yr = '2005';
var default_mn = 1;
var now_yr = default_yr;
var now_mn = default_mn;

var filter_now = 1;

var width = 1050,
    height = 900,
    format = d3.format(",d");
    //color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(5);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");

var node = svg.selectAll(".node");
var _root = 0;

d3.json(dataUrl, function(error, root) {
	// console.log(classes(root));
	//console.debug(JSON.stringify(root));
  _root = root;
  node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root, default_yr, default_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      // .on("mouseover", function(){d3.select(this).attr("stroke-width", "2px")});

  node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("class", function(d) { return d.className; });

  node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { 
        if (d.value >= 200000)
          return d.spotName.substring(0, d.r / 3); 
        else return null;
      });
});


// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(data, yr_str, mn_int) {
      var newDataSet = []; 
			var classname ;
			var peoNum ;
			//console.log(data[0]['97']);  
			for(var obj in data) { 
				//console.table(obj);
        switch(data[obj]['Class']) {
            case "公營遊憩區":
              classname = 'aa';
              break;
            case "民營遊憩區":
              classname = 'bb';
              break;
            case "海水浴場":
              classname = 'cc';
              break;
            case "古蹟、歷史建物":
              classname = 'dd';
              break;
            case "寺廟":
              classname = 'ee';
              break;
            case "國家公園":
              classname = 'ff';
              break;
            case "國家風景區":
              classname = 'gg';
              break;
            case "森林遊樂區":
              classname = 'hh';
              break;
            case "縣級風景特定區":
              classname = 'ii';
              break;
            case "其他":
              classname = 'jj';
              break;
            default:
              classname = 'jj'
        }

        // console.log(yr_str);
        // console.log(mn_int);
				if(data[obj][yr_str][mn_int - 1] != -1) peoNum = data[obj][yr_str][mn_int - 1];
				else peoNum = 0;

				newDataSet.push({className: classname, spotName: data[obj]['Scenic_Spots'], value: peoNum});
				
			} 

			return {children: newDataSet}; 
}

d3.select(self.frameElement).style("height", height + "px");

$(function() {
  $( "#slider" ).slider({
    value:0,
    min: 0,
    max: 118,
    step: 1,
    slide: function( event, ui ) {
      // console.log(ui.value);
      var val = ui.value;
      now_yr = (Math.floor(val / 12)) + 2005;
      now_mn = (Math.floor(val / 12) == 0)? (val % 12) + 1 :(val % 12) + 1;
      $( "#date-display" ).text( now_yr + " 年 " + now_mn + " 月" );
      drawOverall();

    }
  });
  $( "#date-display" ).text("2005 年 1 月");
});

$("#overall-btn").click(function(){
  if (filter_now == 1);
  else{
    filter_now = 1;
    drawOverall();
    d3.select("#slider").transition().style("opacity", 1);
    d3.select("#icons").transition().style("opacity", 1);
  }
});

$("#class-btn").click(function(){
  if (filter_now == 2);
  else{
    filter_now = 2;
    d3.select("#slider").transition().style("opacity", 0);
    d3.select("#icons").transition().style("opacity", 0);
    d3.select("svg").transition().style("opacity", 0).remove();
  }
});

$("#region-btn").click(function(){
  if (filter_now == 3);
  else{
    filter_now = 3;
    d3.select("#slider").transition().style("opacity", 0);
    d3.select("#icons").transition().style("opacity", 0);
    d3.select("svg").transition().style("opacity", 0).remove();
  }
});

function drawOverall(){
      d3.select("svg").remove();

      svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");

    
      node = svg.selectAll(".node")
      .data(bubble.nodes(classes(_root, now_yr.toString(), now_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

      node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });

      node.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("class", function(d) { return d.className; });

      node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { 
        if (d.value >= 200000)
          return d.spotName.substring(0, d.r / 3); 
        else return null;
      });
}

function drawByClass(){

}

function getClassIdx(str){
    switch(str) {

    case "公營遊憩區":
            return 0;
            break;
        case "民營遊憩區":
            return 1;
            break;
        case "海水浴場":
            return 2;
            break;
        case "古蹟、歷史建物":
            return 3;
            break;
        case "寺廟":
            return 4;
            break;
        case "國家公園":
            return 5;
            break;
        case "國家風景區":
            return 6;
            break;
        case "森林遊樂區":
            return 7;
            break;
        case "縣級風景特定區":
            return 8;
            break;
        case "其他":
            return 9;
            break;
      default:
      return 9;
    }
  }

  function getYY(index){
    var yy;
    yy = 0;
    if (index == 0){
      yy = firstCirclePadding + firstR[index];
      return yy;
    }
    else{
      yy = firstCirclePadding + firstR[index];
      for (var j = 0; j < index; j++){
      // console.log(firstR[j]);
      yy += 2*firstR[j] + firstCirclePadding;
      }
      return yy;
    }
    console.log(yy);
  }
