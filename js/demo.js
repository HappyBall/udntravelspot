
dataPath = 'data/';
dataFile = 'travel_spot_mod_final.json';
dataUrl = dataPath + dataFile;

regiondataFile = 'travel_spot_mod_final_region.json';
regiondataUrl = dataPath + regiondataFile;

document.getElementById("popup").style.visibility = "hidden";

var default_yr = '2014';
var default_mn = 12;
var now_yr = default_yr;
var now_mn = default_mn;

var filter_now = 1;

var width = 1200,
    height = 700,
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

var tooltip ;

var node = svg.selectAll(".node");
var _root = 0;
var data_class = 0;
var data_region = 0;
var firstCirclePadding = 130;
var firstR = [];
var firstR_region = [];

var x_padding = 0;
var search_anything = 0;

var tip_x, tip_y;

d3.json(dataUrl, function(error, root) {
	// console.log(classes(root));
	//console.debug(JSON.stringify(root));
  _root = root;
  data_class = root.slice();
  node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root, default_yr, default_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + (d.x + x_padding) + "," + d.y + ")"; })
      .on("mouseover", function(d){
        // console.log(d);
        var tip_region_str;
        var r = d.region;
        var regs = [];
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(d.value.toString() + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類別/ " + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類別/ " + d.Class);
        }

        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市別/ " + regs[0] + "、" + regs[1]);
        }
        else{
          $("#tip-region").text("縣市別/ " + r);
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20;
        tip_y = d.y + 10;
        d3.select(this).select("circle").style("stroke-width", "3px");
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);
      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
        d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
      });

  /*node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });*/

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

    createToolTip(svg);
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

				newDataSet.push({className: classname, spotName: data[obj]['Scenic_Spots'], value: peoNum, Class: data[obj]['Class'], region: data[obj]['region'], Detail_Class: data[obj]['Detail_Class']});
				
			} 

			return {children: newDataSet}; 
}

d3.select(self.frameElement).style("height", height + "px");

$(function() {
  $( "#slider" ).slider({
    value:119,
    min: 0,
    max: 119,
    step: 1,
    slide: function( event, ui ) {
      // console.log(ui.value);
      var val = ui.value;
      now_yr = (Math.floor(val / 12)) + 2005;
      now_mn = (Math.floor(val / 12) == 0)? (val % 12) + 1 :(val % 12) + 1;
      $( "#date-display" ).text( now_yr + " 年 " + now_mn + " 月" );
      if(filter_now == 1)drawOverall();
      else drawBySearch();
    }
  });
  $( "#date-display" ).text("2014 年 12 月");
});

$("#overall-btn").click(function(){
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "../img/icon_triangle_down.jpg";
  d3.select("#remark").transition().style("display", "inline");

  if (filter_now == 1);
  else{
    document.getElementById(getBtnId(filter_now)).style.color = "#808080";
    filter_now = 1;
    drawOverall();
    d3.select("#slider").transition().style("opacity", 1).style("pointer-events", "auto");
    d3.select("#slider-scale").transition().style("opacity", 1);
    d3.select("#icons").transition().style("display", "inline");
  }
  document.getElementById("overall-btn").style.color = "#000000";
});

$("#class-btn").click(function(){
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "../img/icon_triangle_down.jpg";
  d3.select("#remark").transition().style("display", "none");
  if (filter_now == 2);
  else{
    document.getElementById(getBtnId(filter_now)).style.color = "#808080";
    filter_now = 2;
    d3.select("#icons").transition().style("display", "none");
    // d3.select("svg").transition().style("opacity", 0).remove();
    d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    d3.select("#slider-scale").transition().style("opacity", 0);
    // console.log(_root);
    drawByClass();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("class-btn").style.color = "#000000";
});

$("#region-btn").click(function(){
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "../img/icon_triangle_down.jpg";
  d3.select("#remark").transition().style("display", "none");
  if (filter_now == 3);
  else{
    document.getElementById(getBtnId(filter_now)).style.color = "#808080";
    filter_now = 3;
    d3.select("#icons").transition().style("display", "none");
    d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    d3.select("#slider-scale").transition().style("opacity", 0);
    drawByRegion();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("region-btn").style.color = "#000000";
});

$("#search-btn").click(function(){
  d3.select("#remark").transition().style("display", "inline");
  if (filter_now == 4){
    if (document.getElementById("popup").style.visibility == "hidden")
      document.getElementById("popup").style.visibility = "visible";
    else document.getElementById("popup").style.visibility = "hidden";
  }
  else{
    document.getElementById(getBtnId(filter_now)).style.color = "#808080";
    filter_now = 4;
    drawBySearch();
    d3.select("#slider").transition().style("opacity", 1).style("pointer-events", "auto");
    d3.select("#slider-scale").transition().style("opacity", 1);
    d3.select("#icons").transition().style("display", "inline");
    // d3.select("#icons").transition().style("opacity", 0);
    // d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
      document.getElementById("popup").style.visibility = "visible";
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("search-btn").style.color = "#000000";
  if(document.getElementById("popup").style.visibility == "visible")
    document.getElementById("search-triangle").src = "../img/icon_triangle_up.jpg";
  else
    document.getElementById("search-triangle").src = "../img/icon_triangle_down.jpg";

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
      .attr("transform", function(d) { return "translate(" + (d.x + x_padding) + "," + d.y + ")"; })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "3px");
        var tip_region_str;
        var r = d.region;
        var regs = [];
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(d.value.toString() + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類別/ " + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類別/ " + d.Class);
        }
        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市別/ " + regs[0] + "、" + regs[1]);
        }
        else{
          $("#tip-region").text("縣市別/ " + r);
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20;
        tip_y = d.y + 10;
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);
      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
        d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
      });

      /*node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });*/

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

      createToolTip(svg);
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
  var counter_y = [];
  var firstX = [];

  var w = 1200, h = 0, padding = 0;
  var classNum = 0;
  var allX = {};
  var allY = {};

  var biggestClasses = [];
  var counter_names = [];
  var allClasses = [];

  data_class.sort(function(a,b){return b[yr][idx] - a[yr][idx] });

  var Rmax = d3.max(data_class, function(d){return d[yr][idx]}),
    Rmin = d3.min(data_class, function(d){return d[yr][idx]});

  var rScale = d3.scale.linear()
        .domain([Rmin, Rmax])
        .range([4 , 150]);

  for (var i = 0; i < 27; i ++){
    cx_classify[i] = 50;
    r_classify[i] = 0;
    counter[i] = 0;
    firstR[i] = 0;
    counter_y[i] = 0;
    firstX[i] = 0;
    biggestClasses[i] = 0;
    counter_names[i] = 0;
    allClasses[i] = 0;
    // classNum[i] = 0;
    h += firstCirclePadding + 2 * (rScale(data_class[i][yr][idx])/para);
  }

   h -= 100;

  if (h < 900) h = 900; // svg height at least 900px

  for (var i in data_class){
    if (data_class[i][yr][idx] != -1){ 
      if(data_class[i]['Class'] == "公營遊憩區")
        classNum++;
    }

    var s = data_class[i]['Class'];
    var x;
    if(s == "國家公園" || s == "國家風景區"){
      x = getClassIdx_forClass(data_class[i]['Detail_Class']);
      if(counter_names[x] == 0){
        biggestClasses[x] = data_class[i]['Detail_Class'];
        allClasses[x] = s;
        counter_names[x] ++;
      }
    }
    else{
      x = getClassIdx_forClass(data_class[i]['Class']);
      if(counter_names[x] == 0){
        biggestClasses[x] = data_class[i]['Class'];
        allClasses[x] = s;
        counter_names[x] ++;
      }
    }
    // console.log(biggestClasses);
    // console.log(counter_names);
  }

  // console.log (biggestClasses);
  // console.log(classNum);

  var svg_class = d3.select('#chart').append('svg').attr({'width': w, 'height': h});

  var n = svg_class.selectAll('.node').data(data_class).enter()
          .append('g')
          .attr('class', 'node')
          .on("mouseover", function(d){
            // console.log(d);
            d3.select(this).select("circle").style("stroke-width", "3px");
            var tip_region_str;
            var r = d['region'];
            var regs = [];
            var spot = d['Scenic_Spots']
            $("#tip-spot-name").text(spot);
            $("#tip-tour-number").text(d[now_yr][now_mn - 1].toString() + "位遊客") ;
            if (d['Class'] == "國家公園" || d['Class'] == "國家風景區"){
              $("#tip-class").text("類別/ " + d['Detail_Class']);
            }
            else{
              $("#tip-class").text("類別/ " + d['Class']);
            }
            if (r.length == 6){
              regs[0] = r.substr(0,3);
              regs[1] = r.substr(3,3);
              $("#tip-region").text("縣市別/ " + regs[0] + "、" + regs[1]);
            }
            else{
              $("#tip-region").text("縣市別/ " + r);
            }
            // $("#risetip-sum-bo").text("地區：" +  d["region"]);
            tip_x = allX[spot] + 20;
            tip_y = allY[spot] + 10;
            // console.log(tip_x);
            if(tip_x + 250 > 1200)
              tip_x = tip_x - 250;
            d3.select(".tool_tip").transition()
              .attr("transform", function(){
                return "translate(" + tip_x + "," + tip_y + ")";
              })
              .style("display", "inline")
              .duration(500);
            })
            .on("mouseout", function(d){
              d3.select(this).select("circle").style("stroke-width", "1px");
              d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
            });
  var nnn = svg_class.selectAll('.class-text').data(data_class).enter()
                  .append('g').attr('class', 'class-text');
    /*n.append("title")
    .text(function(d) { return d['Scenic_Spots'] + ": " + format(d[yr][idx]); });*/
    
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
          var x;
          if(d['Class'] == "國家公園" || d['Class'] == "國家風景區")
            x = getClassIdx_forClass(d['Detail_Class']);
          else
            x = getClassIdx_forClass(d['Class']);
          var r_now = rScale(d[yr][idx]);
          counter[x]++;
                if (counter[x] != 1) {
                  if(x == 0){
                    cx_classify[x] = 2* firstR[x] + (counter[x] - 1) * ( w / (classNum+1));
                  }
                  else
                    cx_classify[x] = cx_classify[x] + r_classify[x] + r_now/para;
                }
                else {
                  firstR[x] = r_now/para;
                  cx_classify[x] = cx_classify[x] + r_now/para;
                  firstX[x] = cx_classify[x];
                }
                r_classify[x] = r_now/para;
                allX[d['Scenic_Spots']] = cx_classify[x];
                return cx_classify[x] + x_padding;
          
        }
      },

      'cy': function(d){ 
          var str = d['Class'];
          var classIndex;
          // var str_text;
          // var attr_class;
          
          if(str == "國家公園" || str == "國家風景區"){
            classIndex = getClassIdx_forClass(d['Detail_Class']);
            // str_text = d['Detail_Class'];
            // attr_class = "draw-text-class-uniq"
          }
          else{
            classIndex = getClassIdx_forClass(d['Class']);
            // str_text = d['Class'];
            // attr_class = "draw-text-class"
          }

          /*counter_y[classIndex]++;
          if (counter_y[classIndex] == 1) 
            if(classIndex == 5 || classIndex == 11){
              nnn.append("text")
               .attr("x", firstX[classIndex] - firstR[classIndex])
               .attr("y", getYY(classIndex) - firstR[classIndex] - 20)
               .text(str_text)
               .attr("class", attr_class);

              nnn.append("text")
               .attr("x", firstX[classIndex] - firstR[classIndex])
               .attr("y", getYY(classIndex) - firstR[classIndex] - 60)
               .text(str)
               .attr("class", "draw-text-class");
            }
            else{
              nnn.append("text")
               .attr("x", firstX[classIndex] - firstR[classIndex])
               .attr("y", getYY(classIndex) - firstR[classIndex] - 20)
               .text(str_text)
               .attr("class", attr_class);
            }*/
          allY[d['Scenic_Spots']] = getYY(classIndex);
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
    // console.log(biggestClasses);
    for(var i = 0; i < 27; i++){
      var ss;
      if(allClasses[i] == "國家公園" || allClasses[i] == "國家風景區")
        ss = "draw-text-class-uniq";
      else
        ss = "draw-text-class"

      if(i == 5){
        d3.select("svg").append("text")
          .attr("class", "class-text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", "draw-text-class-uniq");

        d3.select("svg").append("text")
          .attr("class", "class-text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 60)
          .text("國家公園")
          .attr("class", "draw-text-class");
      }
      else if(i == 11){
        d3.select("svg").append("text")
          .attr("class", "class-text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", "draw-text-class-uniq");

        d3.select("svg").append("text")
          .attr("class", "class-text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 60)
          .text("國家風景區")
          .attr("class", "draw-text-class");
      }
      else{
        // console.log(biggestClasses[i]);

        d3.select("svg").append("text")
          .attr("class", "class-text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", ss);
      }
    }

    createToolTip_Class(svg_class);
/*    console.log(allX);
    console.log(allY);*/
}

function drawByRegion(){
  d3.json(regiondataUrl, function(error, data_region) {

  d3.select("svg").remove();

  var yr = now_yr.toString();
  var idx = now_mn - 1;
  var para = 2;
  var w = 1200, h = 0, padding = 0;

  var cx_region = [];
  var r_region = [];
  var counter = []; 
  var counter_y = [];
  var firstX_region = [];

  var allX = {};
  var allY = {};

  var biggestNames = [];
  var counter_names = [];
  var biggestRegions = [];

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
    counter_y[i] = 0;
    firstX_region[i] = 0;
    counter_names[i] = 0;
    biggestRegions[i] = 0;
    // classNum[i] = 0;
    h += firstCirclePadding + 2 * (rScale(data_region[i][yr][idx])/para);
  }

  for (var i in data_region){
    var x = getRegionIdx(data_region[i]['region']);
    if(counter_names[x] == 0){
      biggestRegions[x] = data_region[i]['region'];
      counter_names[x] ++;
    }
  }

  // console.log(biggestNames);

  // console.log(h);

  if (h < 900) h = 900;

  var svg_region = d3.select('#chart').append('svg').attr({'width': w, 'height': h});

  var n = svg_region.selectAll('.node').data(data_region).enter()
          .append('g')
          .attr('class', 'node')
          .on("mouseover", function(d){
            d3.select(this).select("circle").style("stroke-width", "3px");
            var tip_region_str;
            var r = d['region'];
            var regs = [];
            var spot = d['Scenic_Spots']
            $("#tip-spot-name").text(spot);
            $("#tip-tour-number").text(d[now_yr][now_mn - 1].toString() + "位遊客") ;
            if (d['Class'] == "國家公園" || d['Class'] == "國家風景區"){
              $("#tip-class").text("類別/ " + d['Detail_Class']);
            }
            else{
              $("#tip-class").text("類別/ " + d['Class']);
            }
            if (r.length == 6){
              regs[0] = r.substr(0,3);
              regs[1] = r.substr(3,3);
              $("#tip-region").text("縣市別/ " + regs[0] + "、" + regs[1]);
            }
            else{
              $("#tip-region").text("縣市別/ " + r);
            }
            // $("#risetip-sum-bo").text("地區：" +  d["region"]);
            tip_x = allX[spot] + 20;
            tip_y = allY[spot] + 10;
            d3.select(".tool_tip").transition()
              .attr("transform", function(){
                return "translate(" + tip_x + "," + tip_y + ")";
              })
              .style("display", "inline")
              .duration(500);
          })
          .on("mouseout", function(d){
            d3.select(this).select("circle").style("stroke-width", "1px");
            d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
          });

    /*var nnn = svg_region.selectAll('.region-text').data(data_region).enter()
                  .append('g').attr('class', 'region-text');*/
      /*n.append("title")
      .text(function(d) { return d['Scenic_Spots'] + ": " + format(d[yr][idx]); });*/

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

            // console.log(x);
            var r_now = rScale(d[yr][idx]);
            counter[x]++;
                if (counter[x] != 1) cx_region[x] = cx_region[x] + r_region[x] + r_now/para;
                else {
                  firstR_region[x] = r_now/para;
                  cx_region[x] = cx_region[x] + r_now/para;
                  firstX_region[x] = cx_region[x];
                }
                r_region[x] = r_now/para;
                allX[d['Scenic_Spots']] = cx_region[x];
                return cx_region[x] + x_padding;
          
          }
        },

        'cy': function(d){
          var s = d['region'];
          var classIndex = getRegionIdx(s);
          // var ss = modRegionName(s);

          /*counter_y[classIndex]++;
          if (counter_y[classIndex] == 1) 
             nnn.append("text")
             .attr("x", firstX_region[classIndex] - firstR_region[classIndex])
             .attr("y", getRegionYY(classIndex) - firstR_region[classIndex] - 20)
             .text(ss)
             .attr("class", "draw-text-region");*/
          allY[d['Scenic_Spots']] = getRegionYY(classIndex);
          return getRegionYY(classIndex);
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

      for(var i = 0; i < 22; i++){
        d3.select("svg").append("text")
          .attr("class", "region-text")
          .attr("x", firstX_region[i] - firstR_region[i])
          .attr("y", getRegionYY(i) - firstR_region[i] - 20)
          .text(biggestRegions[i])
          .attr("class", "draw-text-region");
      }

      createToolTip_Class(svg_region);
  // console.log(counter);
  });
}

function drawBySearch(){
  d3.select("svg").remove();

  var class_checked_list = [];
  var region_checked_list = [];
  var toggleallclass_boxes = document.getElementsByName('check-all-class');
  var toggleallregion_boxes = document.getElementsByName('check-all-region');
  var classcheckboxes = document.getElementsByName('check-class');
  var regioncheckboxes = document.getElementsByName('check-region');
  var count_check_class = 0;
  var count_check_region = 0;

  for (var i = 0; i < 10; i ++){
    class_checked_list[i] = 0;
  }

  for (var i = 0, n = classcheckboxes.length; i < n; i++) {
    if (classcheckboxes[i].checked) {
      var x = getClassIdx(classcheckboxes[i].value);
      class_checked_list[x] = 1;
    }
    else{
      count_check_class++;
      toggleallclass_boxes[0].checked = false;
    }

    if(count_check_class == 0) toggleallclass_boxes[0].checked = true;
  }

  for (var i = 0; i < 22; i ++){
    region_checked_list[i] = 0;
  }

  for (var i = 0, n = regioncheckboxes.length; i < n; i++) {
    if (regioncheckboxes[i].checked) {
      var x = getRegionIdx(regioncheckboxes[i].value);
      region_checked_list[x] = 1;
    }
    else{
      count_check_region++;
      toggleallregion_boxes[0].checked = false;
    }

    if(count_check_region == 0) toggleallregion_boxes[0].checked = true;
  }

  // console.log (region_checked_list);

  svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");

  node = svg.selectAll(".node")
      .data(bubble.nodes(classes_search(_root, now_yr.toString(), now_mn, class_checked_list, region_checked_list))
      .filter(function(d) { return !d.children; }));

      if (search_anything == 0) return;

  node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + (d.x + x_padding) + "," + d.y + ")"; })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "3px");
        var tip_region_str;
        var r = d.region;
        var regs = [];
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(d.value.toString() + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類別/ " + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類別/ " + d.Class);
        }
        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市別/ " + regs[0] + "、" + regs[1]);
        }
        else{
          $("#tip-region").text("縣市別/ " + r);
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20;
        tip_y = d.y + 10;
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);
      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
        d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
      });

  /*node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });*/

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
  createToolTip(svg);
}

/*function whenToggleAll(){
  var check = document.getElementsByName('check-all');
  var classcheckboxes = document.getElementsByName('check-class');
  var regioncheckboxes = document.getElementsByName('check-region');

  if (check[0].checked) {
    for (var i = 0, n = classcheckboxes.length; i < n; i++) {
      if (!classcheckboxes[i].checked) {
        classcheckboxes[i].checked = true;
      }
    }
    for (var i = 0, n = regioncheckboxes.length; i < n; i++) {
      if (!regioncheckboxes[i].checked) {
        regioncheckboxes[i].checked = true;
      }
    }
    drawBySearch();
  }

  else{
    for (var i = 0, n = classcheckboxes.length; i < n; i++) {
      if (classcheckboxes[i].checked) {
        classcheckboxes[i].checked = false;
      }
    }
    for (var i = 0, n = regioncheckboxes.length; i < n; i++) {
      if (regioncheckboxes[i].checked) {
        regioncheckboxes[i].checked = false;
      }
    }
    d3.select("svg").remove();
    svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");
  }
  
  

}*/

function ToggleAllClass(){
  var check = document.getElementsByName('check-all-class');
  var classcheckboxes = document.getElementsByName('check-class');
  if (check[0].checked) {
    for (var i = 0, n = classcheckboxes.length; i < n; i++) {
      if (!classcheckboxes[i].checked) {
        classcheckboxes[i].checked = true;
      }
    }
    drawBySearch();
  }
  else{
    for (var i = 0, n = classcheckboxes.length; i < n; i++) {
      if (classcheckboxes[i].checked) {
        classcheckboxes[i].checked = false;
      }
    }
    d3.select("svg").remove();
    svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");
  }
}

function ToggleAllRegion(){
  var check = document.getElementsByName('check-all-region');
  var regioncheckboxes = document.getElementsByName('check-region');
  if (check[0].checked) {
    for (var i = 0, n = regioncheckboxes.length; i < n; i++) {
      if (!regioncheckboxes[i].checked) {
        regioncheckboxes[i].checked = true;
      }
    }
    drawBySearch();
  }
  else{
    for (var i = 0, n = regioncheckboxes.length; i < n; i++) {
      if (regioncheckboxes[i].checked) {
        regioncheckboxes[i].checked = false;
      }
    }
    d3.select("svg").remove();
    svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "bubble");
  }
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

function getClassIdx_forClass(str){
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
    case "墾丁國家公園":
        return 5;
        break;
    case "玉山國家公園":
        return 6;
        break;
    case "陽明山國家公園":
        return 7;
        break;
    case "太魯閣國家公園":
        return 8;
        break;
    case "雪霸國家公園":
        return 9;
        break;
    case "金門國家公園":
        return 10;
        break;
    case "東北角暨宜蘭海岸國家風景區":
        return 11;
        break;
    case "東部海岸國家風景區":
        return 12;
        break;
    case "澎湖國家風景區":
        return 13;
        break;
    case "大鵬灣國家風景區":
        return 14;
        break;
    case "花東縱谷國家風景區":
        return 15;
        break;
    case "馬祖國家風景區":
        return 16;
        break;
    case "日月潭國家風景區":
        return 17;
        break;
    case "參山國家風景區":
        return 18;
        break;
    case "阿里山國家風景區":
        return 19;
        break;
    case "茂林國家風景區":
        return 20;
        break;
    case "北海岸及觀音山國家風景區":
        return 21;
        break;
    case "雲嘉南濱海國家風景區":
        return 22;
        break;
    case "西拉雅國家風景區":
        return 23;
        break;    
    case "森林遊樂區":
        return 24;
        break;
    case "縣級風景特定區":
        return 25;
        break;
    case "其他":
        return 26;
        break;
    default:
        return 26;
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

  function getRegionYY(index){
    var yy = 0;
    if (index == 0){
      yy = firstCirclePadding + firstR_region[index] ;
      return yy;
    }
    else{
      yy = firstCirclePadding + firstR_region[index];
      for (var j = 0; j < index; j++){
      // console.log(firstR[j]);
      yy += 2*firstR_region[j] + firstCirclePadding;
      }
      return yy;
    }
  }

  function getRegionIdx(str){
    // console.log(str);
    switch(str) {

    case "台北市":
        return 0;
        break;
    case "新北市":
        return 1;
        break;
    case "桃園縣":
        return 2;
        break;
    case "台中市":
        return 3;
        break;
    case "台南市":
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
    case "台東縣":
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

function classes_search(data, yr_str, mn_int, array_class, array_region) {
  var newDataSet = []; 
  var classname ;
  var peoNum ;
  search_anything = 0;
  
  // console.log(data);  
  for(var obj in data) { 
    var x = getClassIdx(data[obj]['Class']);
    var r = data[obj]['region'];
    var regs = [];
    var regionornot = 0;
    
    if (r.length == 6){
      regs[0] = r.substr(0,3);
      regs[1] = r.substr(3,3);
      var rx1 = getRegionIdx(regs[0]);
      var rx2 = getRegionIdx(regs[1]);
      if (array_region[rx1] == 1 || array_region[rx2] == 1)
        regionornot = 1;
    }
    else{
      var rx = getRegionIdx(r);
      if (array_region[rx] == 1)
        regionornot = 1;
    }

    if (array_class[x] == 1 && regionornot == 1 ){
      
      classname = getClassName(data[obj]['Class']);

      if(data[obj][yr_str][mn_int - 1] != -1) peoNum = data[obj][yr_str][mn_int - 1];
      else peoNum = 0;

      // if (peoNum != 0){ 
        search_anything ++;
        newDataSet.push({className: classname, spotName: data[obj]['Scenic_Spots'], value: peoNum, Class: data[obj]['Class'], region: data[obj]['region'], Detail_Class: data[obj]['Detail_Class']});
      // }
    }    
  } 
  // console.log(newDataSet);
  return {children: newDataSet}; 
}

function getBtnId(i){
  switch(i) {
    case 1:
      return "overall-btn";
    case 2:
      return "class-btn";
    case 3:
      return "region-btn";
    case 4:
      return "search-btn";
  }
}

function modRegionName(s){
  if(s[0] == '台')
    return ('臺' + s[1] + s[2]);
  else if (s == "桃園縣")
    return "桃園市"
  else return s;
}

function createToolTip( _svg ){
  tooltip= _svg.append("g")
      .attr("class","tool_tip")
      .style("display", "none")
      .attr("transform", "translate(150,100)");

  tooltip.append("rect")
      .attr("id", "tip-frame")
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "white")
      .attr("width", 220)
      .attr("height", 90)
      .attr("transform", "translate(0,0)");

  tooltip.append("text")
      .attr("id", "tip-spot-name")
      .text("景點名稱")
      .attr("transform", "translate(10,20)");

  tooltip.append("text")
      .attr("id", "tip-tour-number")
      .text("遊客人數")
      .attr("transform", "translate(10,40)");

  tooltip.append("text")
      .attr("id", "tip-region")
      .text("縣市別")
      .attr("transform", "translate(10,60)");

  tooltip.append("text")
      .attr("id", "tip-class")
      .text("類型")
      .attr("transform", "translate(10,80)");
}

function createToolTip_Class( _svg ){
  tooltip= _svg.append("g")
      .attr("class","tool_tip")
      .style("display", "none")
      .attr("transform", "translate(0,0)");

  tooltip.append("rect")
      .attr("id", "tip-frame")
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "white")
      .attr("width", 220)
      .attr("height", 90)
      .attr("transform", "translate(0,0)");

  tooltip.append("text")
      .attr("id", "tip-spot-name")
      .text("景點名稱")
      .attr("transform", "translate(10,20)");

  tooltip.append("text")
      .attr("id", "tip-tour-number")
      .text("遊客人數")
      .attr("transform", "translate(10,40)");

  tooltip.append("text")
      .attr("id", "tip-region")
      .text("縣市別")
      .attr("transform", "translate(10,60)");

  tooltip.append("text")
      .attr("id", "tip-class")
      .text("類型")
      .attr("transform", "translate(10,80)");
}
