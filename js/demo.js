
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
var data_class = 0;
var data_region = 0;
var firstCirclePadding = 10;
var firstR = [];
var firstR_region = [];

d3.json(dataUrl, function(error, root) {
	// console.log(classes(root));
	//console.debug(JSON.stringify(root));
  _root = root;
  data_class = root.slice();
  data_region = root.slice();
  node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root, default_yr, default_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "5px");
      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
      });

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
			// console.log(data);  
			for(var obj in data) { 

        classname = getClassName(data[obj]['Class']);

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
    d3.select("#slider").transition().style("opacity", 1).style("pointer-events", "auto");
    d3.select("#icons").transition().style("opacity", 1);
  }
});

$("#class-btn").click(function(){
  if (filter_now == 2);
  else{
    filter_now = 2;
    d3.select("#icons").transition().style("opacity", 0);
    // d3.select("svg").transition().style("opacity", 0).remove();
    d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    // console.log(_root);
    drawByClass();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
});

$("#region-btn").click(function(){
  if (filter_now == 3);
  else{
    filter_now = 3;
    d3.select("#icons").transition().style("opacity", 0);
    d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    drawByRegion();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
});

function drawOverall(){
      d3.select("svg").remove();

      svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");

      // console.log(_root);

      node = svg.selectAll(".node")
      .data(bubble.nodes(classes(_root, now_yr.toString(), now_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "5px");
      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
      });

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
  d3.select("svg").remove();

  var yr = now_yr.toString();
  var idx = now_mn - 1;
  var para = 2;
  // var textx_before = 50;
  // var textr_before = 0;
  // var cx_before = 50;
  // var r_before = 0;
  var cx_classify = [];
  var r_classify = [];
  var counter = [];  

  var w = 1050, h = 0, padding = 0;
  // var classNum = [];

  data_class.sort(function(a,b){return b[yr][idx] - a[yr][idx] });

  var Rmax = d3.max(data_class, function(d){return d[yr][idx]}),
    Rmin = d3.min(data_class, function(d){return d[yr][idx]});

  var rScale = d3.scale.linear()
        .domain([Rmin, Rmax])
        .range([4 , 150]);

  for (var i = 0; i < 10; i ++){
    cx_classify[i] = 50;
    r_classify[i] = 0;
    counter[i] = 0;
    firstR[i] = 0;
    // classNum[i] = 0;
    h += firstCirclePadding + 2 * (rScale(data_class[i][yr][idx])/para);
  }

  if (h < 900) h = 900; // svg height at least 900px

  // for (var i in data_class){
  //   if (data_class[i][yr][idx] != -1){ 
  //     var c = data_class[i]['Class'];
  //     classNum[getClassIdx(c)]++;
  //   }
  // }
  // console.log(classNum);

  var svg_class = d3.select('#chart').append('svg').attr({'width': w, 'height': h});

  var n = svg_class.selectAll('.node').data(data_class).enter()
          .append('g')
          .attr('class', 'node')
          .on("mouseover", function(d){
            d3.select(this).select("circle").style("stroke-width", "5px");
          })
          .on("mouseout", function(d){
            d3.select(this).select("circle").style("stroke-width", "1px");
          });

    n.append("title")
    .text(function(d) { return d['Scenic_Spots'] + ": " + format(d[yr][idx]); });

    n.append('circle')
    .attr({
      'cx': function(d){ 
        if (d[yr][idx] == -1) return ;
        else {
          /*var x = getClassIdx(d['Class']);
          counter[x]++;
                if (counter[x] != 1) return 40 + firstR[x] + (counter[x] - 1) * ((w - padding)/classNum[x]);
                else {
                  firstR[x] = rScale(d[yr][idx])/para;
                  return 40 + firstR[x];
                }*/
          var x = getClassIdx(d['Class']);
          var r_now = rScale(d[yr][idx]);
          counter[x]++;
                if (counter[x] != 1) cx_classify[x] = cx_classify[x] + r_classify[x] + r_now/para;
                else {
                  firstR[x] = r_now/para;
                  cx_classify[x] = cx_classify[x] + r_now/para;
                }
                r_classify[x] = r_now/para;
                  return cx_classify[x];
          
        }
      },

      'cy': function(d){ 
          var str = d['Class'];
          var classIndex = getClassIdx(str);
          
          return getYY(classIndex);
      },

      'r': function(d){
        if (d[yr][idx] == -1 || d[yr][idx] == 0) return 0; 
        else { return rScale(d[yr][idx])/para; }
      },

      'class': function(d){
        var classname = getClassName(d['Class']);
        return classname;
      }
    });
    
}

function drawByRegion(){
  d3.select("svg").remove();

  var yr = now_yr.toString();
  var idx = now_mn - 1;
  var para = 2;
  var w = 1050, h = 0, padding = 0;

  var cx_region = [];
  var r_region = [];
  var counter = []; 

  data_region.sort(function(a,b){return b[yr][idx] - a[yr][idx] });

  var Rmax = d3.max(data_region, function(d){return d[yr][idx]}),
    Rmin = d3.min(data_region, function(d){return d[yr][idx]});

  var rScale = d3.scale.linear()
        .domain([Rmin, Rmax])
        .range([4 , 150]);

  for (var i = 0; i < 22; i ++){
    cx_region[i] = 50;
    r_region[i] = 0;
    counter[i] = 0;
    firstR_region[i] = 0;
    // classNum[i] = 0;
    h += firstCirclePadding + 2 * (rScale(data_region[i][yr][idx])/para);
  }

  console.log(h);

  if (h < 900) h = 900;

  var svg_region = d3.select('#chart').append('svg').attr({'width': w, 'height': h});

  var n = svg_region.selectAll('.node').data(data_region).enter()
          .append('g')
          .attr('class', 'node')
          .on("mouseover", function(d){
            d3.select(this).select("circle").style("stroke-width", "5px");
          })
          .on("mouseout", function(d){
            d3.select(this).select("circle").style("stroke-width", "1px");
          });

      n.append("title")
      .text(function(d) { return d['Scenic_Spots'] + ": " + format(d[yr][idx]); });

      n.append("circle")
      .attr({
        'cx': function(d){
          if (d[yr][idx] == -1) return ;
          else {
          /*var x = getClassIdx(d['Class']);
          counter[x]++;
                if (counter[x] != 1) return 40 + firstR[x] + (counter[x] - 1) * ((w - padding)/classNum[x]);
                else {
                  firstR[x] = rScale(d[yr][idx])/para;
                  return 40 + firstR[x];
                }*/
            var x = getRegionIdx(d['region']);
            console.log(x);
            var r_now = rScale(d[yr][idx]);
            counter[x]++;
                if (counter[x] != 1) cx_region[x] = cx_region[x] + r_region[x] + r_now/para;
                else {
                  firstR_region[x] = r_now/para;
                  cx_region[x] = cx_region[x] + r_now/para;
                }
                r_region[x] = r_now/para;
                return cx_region[x];
          
          }
        },

        'cy': function(d){

        },

        'r': function(d){
          if (d[yr][idx] == -1 || d[yr][idx] == 0) return 0; 
          else { return rScale(d[yr][idx])/para; }
        },

        'class': function(d){
          var classname = getClassName(d['Class']);
          return classname;
        }
      });

}

function getClassName(str){
  switch(str) {
    case "公營遊憩區":
      return 'aa';
      break;
    case "民營遊憩區":
      return 'bb';
      break;
    case "海水浴場":
      return 'cc';
      break;
    case "古蹟、歷史建物":
      return 'dd';
      break;
    case "寺廟":
      return 'ee';
      break;
    case "國家公園":
      return 'ff';
      break;
    case "國家風景區":
      return 'gg';
      break;
    case "森林遊樂區":
      return 'hh';
      break;
    case "縣級風景特定區":
      return 'ii';
      break;
    case "其他":
      return 'jj';
      break;
    default:
      return 'jj'
  }
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
    // console.log(yy);
  }

  function getRegionIdx(str){
    console.log(str);
    switch(str) {

    case "臺北市":
        return 0;
        break;
    case "新北市":
        return 1;
        break;
    case "桃園縣":
        return 2;
        break;
    case "臺中市":
        return 3;
        break;
    case "臺南市":
        return 4;
        break;
    case "高雄市":
        return 5;
        break;
    case "宜蘭縣":
        return 6;
        break;
    case "新竹縣":
        return 7;
        break;
    case "苗栗縣":
        return 8;
        break;
    case "彰化縣":
        return 9;
        break;
    case "南投縣":
        return 10;
        break;
    case "雲林縣":
        return 11;
        break;
    case "嘉義縣":
        return 12;
        break;
    case "屏東縣":
        return 13;
        break;
    case "花蓮縣":
        return 14;
        break;
    case "臺東縣":
        return 15;
        break;
    case "基隆市":
        return 16;
        break;
    case "新竹市":
        return 17;
        break;
    case "嘉義市":
        return 18;
        break;
    case "澎湖縣":
        return 19;
        break;
    case "金門縣":
        return 20;
        break;
    case "連江縣":
        return 21;
        break;
    default:
        return ;
    }
  }
