if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 // some code..
 window.location.href = "http://p.udn.com.tw/upf/newmedia/2015_data/20150209_travelspot_11/udntravelspot_mobile/index.html";

}

dataPath = 'data/';
dataFile = 'travel_spot_mod_final.json';
dataUrl = dataPath + dataFile;

regiondataFile = 'travel_spot_mod_final_region.json';
regiondataUrl = dataPath + regiondataFile;

document.getElementById("popup").style.visibility = "hidden";

/*$("#popup").mouseout(function(){
  document.getElementById("popup").style.visibility = "hidden";
});*/

var parent = document.getElementById("popup");
document.addEventListener('click',makeMouseOutFn(parent),true);

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

var x_padding = 100;
var search_anything = 0;

var tip_x, tip_y;

var map = {};
d3.csv("data/spots_mapping.csv", function(mapping_data){ 
  for (var i in mapping_data){
    map[mapping_data[i]['觀光遊憩區']] = mapping_data[i]['縮名'];
  }
});



d3.json(dataUrl, function(error, root) {
	// console.log(classes(root));
	//console.debug(JSON.stringify(root));
  _root = root;
  data_class = root.slice();
  var names = [];
  var text_x = [];
  var text_y = [];

  node = svg.selectAll(".node")
      .data(bubble.nodes(classes(root, default_yr, default_mn))
      .filter(function(d) { return !d.children; }))
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        if(d.value > 200000){
          names.push(d.spotName);
          text_x.push(d.x);
          text_y.push(d.y);
        }
        return "translate(" + (d.x + x_padding) + "," + d.y + ")"; 
      })
      .on("mouseover", function(d){
        // console.log(d);
        var tip_region_str;
        var r = d.region;
        var regs = [];
        // console.log(modNum(d.value.toString()));
        $("#tip-date").text(now_yr + " 年 " + now_mn + " 月");
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(modNum(d.value.toString()) + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類型：" + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類型：" + d.Class);
        }

        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市：" + modRegionName(regs[0]) + "、" + modRegionName(regs[1]));
        }
        else{
          $("#tip-region").text("縣市：" + modRegionName(r));
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20 + x_padding;
        tip_y = d.y + 10;
        if(tip_x + 300 > 1200)
          tip_x = tip_x - 300;
        if(tip_y + 140 > 700)
          tip_y = tip_y - 140;
        d3.select(this).select("circle").style("stroke-width", "3px");
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);

        ga("send", {
          "hitType": "event",
          "eventCategory": "chart",
          "eventAction": "hover",
          "eventLabel": "mainpage"
        });
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

    /*node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { 
        if (d.value >= 200000)
          return d.spotName.substring(0, d.r / 3); 
        else return null;
      });*/
    for(var i = 0; i < names.length; i++){
      d3.select("svg").append("text")
        .attr("class", "overall-text")
        .attr("x", text_x[i] - ((map[names[i]].length/5) * 30) + x_padding)
        .attr("y", text_y[i] + 4)
        .text(map[names[i]])
        .attr("class", "draw-text-overall");
    }

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

$( "#date-display" ).text("2014 年 12 月");

$(function() {
  $( "#slider" ).noUiSlider({
    start: 119,
    step: 1,
    range:{
      'min':0,
      'max':119
    }
  });
});

$("#slider").on('slide', function(){
  
  var val = $(this).val();
  // console.log(val);
  now_yr = (Math.floor(val / 12)) + 2005;
  now_mn = (Math.floor(val / 12) == 0)? (val % 12) + 1 :(val % 12) + 1;
  $( "#date-display" ).text( now_yr + " 年 " + now_mn + " 月" );
  if(filter_now == 1) drawOverall();
  else if(filter_now == 2) drawByClass();
  else if(filter_now == 3) drawByRegion();
  else if(filter_now == 4) drawBySearch();

  ga("send", {
          "hitType": "event",
          "eventCategory": "slider",
          "eventAction": "slide",
          "eventLabel": "main&search"
        });
  
});

$("#overall-btn").click(function(){
  
  $("#springframe").css("display", "none");
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
  d3.select("#remark").transition().style("display", "inline");
  $("#icons-region").css("display", "none");
  $("#text-content").css("display", "table");

  if (filter_now == 1);
  else{

    if(filter_now == 5){
      $("#date-display").css("display", "block");
      $("#chart-container").css("display", "block");
      document.getElementById(getBtnId(filter_now)).style.color = "#f47373";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    else{
      document.getElementById(getBtnId(filter_now)).style.color = "#808080";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    filter_now = 1;
    drawOverall();
    $("#slider").css("display", "inline");
    // d3.select("#slider").transition().style("opacity", 1).style("pointer-events", "auto");
    $("#slider-scale").css("display", "block");
    d3.select("#icons").transition().style("display", "inline");
  }
  document.getElementById("overall-btn").style.color = "#000000";
  document.getElementById("overall-btn").style.background = "#b6f2d0";
  ga("send", {
          "hitType": "event",
          "eventCategory": "button",
          "eventAction": "click",
          "eventLabel": "overall-btn"
        });
});

$("#class-btn").click(function(){

  $("#springframe").css("display", "none");
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
  d3.select("#remark").transition().style("display", "none");
  $("#icons-region").css("display", "none");
  $("#text-content").css("display", "none");
  if (filter_now == 2);
  else{

    if(filter_now == 5){
      $("#date-display").css("display", "block");
      $("#chart-container").css("display", "block");
      document.getElementById(getBtnId(filter_now)).style.color = "#f47373";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    else{
      document.getElementById(getBtnId(filter_now)).style.color = "#808080";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    filter_now = 2;
    d3.select("#icons").transition().style("display", "none");
    // d3.select("svg").transition().style("opacity", 0).remove();
    $("#slider").css("display", "inline");
    // d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    $("#slider-scale").css("display", "block");
    // console.log(_root);
    drawByClass();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("class-btn").style.color = "#000000";
  document.getElementById("class-btn").style.background = "#b6f2d0";
  ga("send", {
          "hitType": "event",
          "eventCategory": "button",
          "eventAction": "click",
          "eventLabel": "class-btn"
        });
});

$("#region-btn").click(function(){

  $("#springframe").css("display", "none");
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
  d3.select("#remark").transition().style("display", "none");
  $("#icons-region").css("display", "block");
  $("#text-content").css("display", "none");
  if (filter_now == 3);
  else{
    if(filter_now == 5){
      $("#date-display").css("display", "block");
      $("#chart-container").css("display", "block");
      document.getElementById(getBtnId(filter_now)).style.color = "#f47373";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    else{
      document.getElementById(getBtnId(filter_now)).style.color = "#808080";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    filter_now = 3;
    d3.select("#icons").transition().style("display", "none");
    $("#slider").css("display", "inline");
    // d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
    $("#slider-scale").css("display", "block");
    drawByRegion();
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("region-btn").style.color = "#000000";
  document.getElementById("region-btn").style.background = "#b6f2d0";
  ga("send", {
          "hitType": "event",
          "eventCategory": "button",
          "eventAction": "click",
          "eventLabel": "region-btn"
        });
});

$("#search-btn").click(function(){

  $("#springframe").css("display", "none");
  d3.select("#remark").transition().style("display", "inline");
  $("#icons-region").css("display", "none");
  $("#text-content").css("display", "none");
  if (filter_now == 4){
    if (document.getElementById("popup").style.visibility == "hidden")
      document.getElementById("popup").style.visibility = "visible";
    else document.getElementById("popup").style.visibility = "hidden";
  }
  else{

    if(filter_now == 5){
      $("#date-display").css("display", "block");
      $("#chart-container").css("display", "block");
      document.getElementById(getBtnId(filter_now)).style.color = "#f47373";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    else{
      document.getElementById(getBtnId(filter_now)).style.color = "#808080";
      document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    }
    filter_now = 4;
    drawBySearch();
    $("#slider").css("display", "inline");
    // d3.select("#slider").transition().style("opacity", 1).style("pointer-events", "auto");
    $("#slider-scale").css("display", "block");
    d3.select("#icons").transition().style("display", "inline");
    // d3.select("#icons").transition().style("opacity", 0);
    // d3.select("#slider").transition().style("opacity", 0).style("pointer-events", "none");
      document.getElementById("popup").style.visibility = "visible";
    // d3.select("svg").transition().style("opacity", 0).remove();
  }
  document.getElementById("search-btn").style.color = "#000000";
  document.getElementById("search-btn").style.background = "#b6f2d0";
  if(document.getElementById("popup").style.visibility == "visible")
    document.getElementById("search-triangle").src = "img/icon_triangle_up.png";
  else
    document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
  ga("send", {
          "hitType": "event",
          "eventCategory": "button",
          "eventAction": "click",
          "eventLabel": "search-btn"
        });

});

$("#spring-btn").click(function(){
  document.getElementById("popup").style.visibility = "hidden";
  document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
  $("#text-content").css("display", "none");
  if(filter_now == 5);
  else{
    document.getElementById(getBtnId(filter_now)).style.color = "#808080";
    document.getElementById(getBtnId(filter_now)).style.background = "#FFFFFF";
    filter_now = 5;
    $("#date-display").css("display", "none");
    $("#icons-region").css("display", "none");
    $("#slider").css("display", "none");
    $("#slider-scale").css("display", "none");
    $("#chart-container").css("display", "none");
    $("#remark").css("display", "none");
    $("#springframe").css("display", "table");
  }

  document.getElementById("spring-btn").style.color = "#FFFFFF";
  document.getElementById("spring-btn").style.background = "#f47373";

  ga("send", {
          "hitType": "event",
          "eventCategory": "button",
          "eventAction": "click",
          "eventLabel": "spring-btn"
        });

});

function drawOverall(){
      d3.select("svg").remove();

      var dataforTable = _root.slice();
      dataforTable.sort(function(a,b){return b[now_yr][now_mn - 1] - a[now_yr][now_mn - 1] });      
      var ranklist = [];
      for(var i = 0; i < 3; i++){
        ranklist[i] = {};
        ranklist[i]['spotName'] = dataforTable[i]['Scenic_Spots'];
        ranklist[i]['now_tourNum'] = dataforTable[i][now_yr][now_mn - 1];
        if(now_mn - 2 < 0){
          if(now_yr - 1 < 2005){
            ranklist[i]['lastmn_tourNum'] = -1;
          }
          else{
            ranklist[i]['lastmn_tourNum'] = dataforTable[i][now_yr - 1][11];
          }
        }
        else{
          ranklist[i]['lastmn_tourNum'] = dataforTable[i][now_yr][now_mn - 2]
        }
        if(now_yr - 1 < 2005){
          ranklist[i]['lastyr_tourNum'] = -1;
        }
        else{
          ranklist[i]['lastyr_tourNum'] = dataforTable[i][now_yr - 1][now_mn - 1];
        }
      }

      for (var i = 0; i < 3; i++){
        var id_idx = getRankId(i);
        var iconUp = '↑';
        var iconDown = '↓';
        var travelspot = ranklist[i]['spotName'];
        var nowNum = ranklist[i]['now_tourNum'];
        var lastyrNum = ranklist[i]['lastyr_tourNum'];
        var lastmnNum = ranklist[i]['lastmn_tourNum'];

        $('#' + id_idx + '-2-1').text(map[travelspot]);
        $('#' + id_idx + '-2-2').text(modNum(nowNum.toString()) + "位");
        if(lastmnNum == -1){
          $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-1').attr("class", "table-details");
        }
        else{
          if(nowNum >= lastmnNum){
            var frac = ((nowNum - lastmnNum)/lastmnNum) * 100;
            $('#' + id_idx + '-3-1').text(iconUp + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-1').attr("class", "increasing");
          }
          else{
            var frac = ((lastmnNum - nowNum)/lastmnNum) * 100;
            $('#' + id_idx + '-3-1').text(iconDown + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-1').attr("class", "decreasing");
          }
        }
        if(lastyrNum == -1){
          $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-2').attr("class", "table-details");
        }
        else{ 
          if(nowNum >= lastyrNum){
            var frac = ((nowNum - lastyrNum)/lastyrNum)*100;
            $('#' + id_idx + '-3-2').text(iconUp + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-2').attr("class", "increasing");
          }
          else{
            var frac = ((lastyrNum - nowNum)/lastyrNum)*100;
            $('#' + id_idx + '-3-2').text(iconDown + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-2').attr("class", "decreasing");
          }
        }

      }

      var names = [];
      var text_x = [];
      var text_y = [];

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
      .attr("transform", function(d) { 
        if(d.value > 200000){
          names.push(d.spotName);
          text_x.push(d.x);
          text_y.push(d.y);
        }
        return "translate(" + (d.x + x_padding) + "," + d.y + ")"; 
      })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "3px");
        var tip_region_str;
        var r = d.region;
        var regs = [];
        $("#tip-date").text(now_yr + " 年 " + now_mn + " 月");
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(modNum(d.value.toString()) + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類型：" + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類型：" + d.Class);
        }
        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市：" + modRegionName(regs[0]) + "、" + modRegionName(regs[1]));
        }
        else{
          $("#tip-region").text("縣市：" + modRegionName(r));
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20 + x_padding;
        tip_y = d.y + 10;
        if(tip_x + 300 > 1200)
          tip_x = tip_x - 300;
        if(tip_y + 140 > 700)
          tip_y = tip_y - 140;
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);

        ga("send", {
          "hitType": "event",
          "eventCategory": "chart",
          "eventAction": "hover",
          "eventLabel": "main"
        });
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

      /*node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { 
        if (d.value >= 200000)
          return d.spotName.substring(0, d.r / 3); 
        else return null;
      });*/

      for(var i = 0; i < names.length; i++){
      d3.select("svg").append("text")
        .attr("class", "overall-text")
        .attr("x", text_x[i] - ((map[names[i]].length/5) * 30) + x_padding)
        .attr("y", text_y[i] + 4)
        .text(map[names[i]])
        .attr("class", "draw-text-overall");
      }

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
  var biggestNames = [];

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
    biggestNames[i] = {};
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
        biggestNames[x]['spotName'] = data_class[i]['Scenic_Spots'];
        biggestNames[x]['tourNum'] = data_class[i][now_yr][now_mn - 1];
        allClasses[x] = s;
        counter_names[x] ++;
      }
    }
    else{
      x = getClassIdx_forClass(data_class[i]['Class']);
      if(counter_names[x] == 0){
        biggestClasses[x] = data_class[i]['Class'];
        biggestNames[x]['spotName'] = data_class[i]['Scenic_Spots'];
        biggestNames[x]['tourNum'] = data_class[i][now_yr][now_mn - 1];
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
            $("#tip-date").text(now_yr + " 年 " + now_mn + " 月");
            $("#tip-spot-name").text(spot);
            $("#tip-tour-number").text(modNum(d[now_yr][now_mn - 1].toString()) + "位遊客") ;
            if (d['Class'] == "國家公園" || d['Class'] == "國家風景區"){
              $("#tip-class").text("類型：" + d['Detail_Class']);
            }
            else{
              $("#tip-class").text("類型：" + d['Class']);
            }
            if (r.length == 6){
              regs[0] = r.substr(0,3);
              regs[1] = r.substr(3,3);
              $("#tip-region").text("縣市：" + modRegionName(regs[0]) + "、" + modRegionName(regs[1]));
            }
            else{
              $("#tip-region").text("縣市：" + modRegionName(r));
            }
            // $("#risetip-sum-bo").text("地區：" +  d["region"]);
            tip_x = allX[spot] + 20;
            tip_y = allY[spot] + 10;
            // console.log(tip_x);
            if(tip_x + 300 > 1200)
              tip_x = tip_x - 300;
            d3.select(".tool_tip").transition()
              .attr("transform", function(){
                return "translate(" + tip_x + "," + tip_y + ")";
              })
              .style("display", "inline")
              .duration(500);

            ga("send", {
              "hitType": "event",
              "eventCategory": "chart",
              "eventAction": "hover",
              "eventLabel": "class"
              });
              
            })
            .on("mouseout", function(d){
              d3.select(this).select("circle").style("stroke-width", "1px");
              d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
            });
  /*var nnn = svg_class.selectAll('.class-text').data(data_class).enter()
                  .append('g').attr('class', 'class-text');*/
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
                    cx_classify[x] = firstR[x] + ((counter[x] - 1) * ( (w - 80) / (classNum+3))) + 50;
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
                return cx_classify[x] ;
          
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
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", "draw-text-class-uniq");

        d3.select("svg").append("text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 60)
          .text("國家公園")
          .attr("class", "draw-text-class");
      }
      else if(i == 11){
        d3.select("svg").append("text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", "draw-text-class-uniq");

        d3.select("svg").append("text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 60)
          .text("國家風景區")
          .attr("class", "draw-text-class");
      }
      else{
        // console.log(biggestClasses[i]);

        d3.select("svg").append("text")
          .attr("x", firstX[i] - firstR[i])
          .attr("y", getYY(i) - firstR[i] - 20)
          .text(biggestClasses[i])
          .attr("class", ss);

      }

      d3.select("svg").append("text")
          .attr("x", 350)
          .attr("y", getYY(i) - firstR[i] - 20)
          .text("最夯：" + biggestNames[i]['spotName'] + " " + modNum(biggestNames[i]['tourNum'].toString()) + "位遊客")
          .attr("class", "draw-text-biggest");
        
      d3.select("svg").append("line")
        .attr("x1", 0)
        .attr("y1", getYY(i))
        .attr("x2", 1200)
        .attr("y2", getYY(i))
        .attr("class", "draw_lines");

      d3.select("svg").append("line")
        .attr("x1", 0)
        .attr("y1", getYY(i) + firstR[i])
        .attr("x2", 0)
        .attr("y2", getYY(i) - firstR[i])
        .attr("class", "draw_lines");

      d3.select("svg").append("line")
        .attr("x1", 1199)
        .attr("y1", getYY(i) + firstR[i])
        .attr("x2", 1199)
        .attr("y2", getYY(i) - firstR[i])
        .attr("class", "draw_lines");
    }

    d3.select("svg").append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 1200)
        .attr("y2", 0)
        .style("stroke", "black");

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
    biggestNames[i] = {};
    regions_storage = {};
    // classNum[i] = 0;
    h += firstCirclePadding + 2 * (rScale(data_region[i][yr][idx])/para);
  }

  for (var i in data_region){
    if (data_region[i]['Scenic_Spots'] in regions_storage) {
      regions_storage[data_region[i]['Scenic_Spots']].push(data_region[i]['region']);
    }
    else{
      regions_storage[data_region[i]['Scenic_Spots']] = [];
      regions_storage[data_region[i]['Scenic_Spots']].push(data_region[i]['region']);
    }
    var x = getRegionIdx(data_region[i]['region']);
    if(counter_names[x] == 0){
      biggestRegions[x] = data_region[i]['region'];
      biggestNames[x]['spotName'] = data_region[i]['Scenic_Spots'];
      biggestNames[x]['tourNum'] = data_region[i][now_yr][now_mn - 1];
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
            $("#tip-date").text(now_yr + " 年 " + now_mn + " 月");
            $("#tip-spot-name").text(spot);
            $("#tip-tour-number").text(modNum(d[now_yr][now_mn - 1].toString()) + "位遊客") ;
            if (d['Class'] == "國家公園" || d['Class'] == "國家風景區"){
              $("#tip-class").text("類型：" + d['Detail_Class']);
            }
            else{
              $("#tip-class").text("類型：" + d['Class']);
            }
            
            if(regions_storage[d['Scenic_Spots']].length != 1){
              var r1 = regions_storage[d['Scenic_Spots']][0];
              var r2 = regions_storage[d['Scenic_Spots']][1];
              $("#tip-region").text("縣市：" + modRegionName(r1) + "、" + modRegionName(r2));
              if((spot + '_' + r) in allX){
                console.log(spot);
                tip_x = allX[(spot + '_' + r)] + 20;
                tip_y = allY[(spot + '_' + r)] + 10;
              }
              else{
                tip_x = allX[spot] + 20;
                tip_y = allY[spot] + 10;
              }
            }
            else{
              $("#tip-region").text("縣市：" + modRegionName(r));
              tip_x = allX[spot] + 20;
              tip_y = allY[spot] + 10;
            }
            
            // $("#risetip-sum-bo").text("地區：" +  d["region"]);
            
            d3.select(".tool_tip").transition()
              .attr("transform", function(){
                return "translate(" + tip_x + "," + tip_y + ")";
              })
              .style("display", "inline")
              .duration(500);
            ga("send", {
              "hitType": "event",
              "eventCategory": "chart",
              "eventAction": "hover",
              "eventLabel": "region"
            });

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
                if (d['Scenic_Spots'] in allX){
                  // console.log(d['Scenic_Spots']);
                  // console.log(d['region']);
                  allX[(d['Scenic_Spots'] + "_" + d['region'])] = cx_region[x];
                }
                else{
                  allX[d['Scenic_Spots']] = cx_region[x];
                }

                return cx_region[x] ;
          
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
          if (d['Scenic_Spots'] in allY){
            allY[(d['Scenic_Spots'] + "_" + d['region'])] = getRegionYY(classIndex);
          }
          else{
            allY[d['Scenic_Spots']] = getRegionYY(classIndex);
          }

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
          .attr("x", firstX_region[i] - firstR_region[i])
          .attr("y", getRegionYY(i) - firstR_region[i] - 20)
          .text(modRegionName(biggestRegions[i]))
          .attr("class", "draw-text-region");

        d3.select("svg").append("text")
          .attr("x", 250)
          .attr("y", getRegionYY(i) - firstR_region[i] - 20)
          .text("最夯：" + biggestNames[i]['spotName'] + " " + modNum(biggestNames[i]['tourNum'].toString()) + "位遊客")
          .attr("class", "draw-text-biggest");

        d3.select("svg").append("line")
          .attr("x1", 0)
          .attr("y1", getRegionYY(i))
          .attr("x2", 1200)
          .attr("y2", getRegionYY(i))
          .attr("class", "draw_lines");

        d3.select("svg").append("line")
          .attr("x1", 0)
          .attr("y1", getRegionYY(i) + firstR_region[i])
          .attr("x2", 0)
          .attr("y2", getRegionYY(i) - firstR_region[i])
          .attr("class", "draw_lines");

        d3.select("svg").append("line")
          .attr("x1", 1199)
          .attr("y1", getRegionYY(i) + firstR_region[i])
          .attr("x2", 1199)
          .attr("y2", getRegionYY(i) - firstR_region[i])
          .attr("class", "draw_lines");  

      }

      d3.select("svg").append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 1200)
        .attr("y2", 0)
        .style("stroke", "black");

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
  var names = [];
  var text_x = [];
  var text_y = [];
  var count_text = 0;
  var dataforTable = [];

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
      .data(bubble.nodes(classes_search(_root, now_yr.toString(), now_mn, class_checked_list, region_checked_list, names, dataforTable))
      .filter(function(d) { return !d.children; }));

      if (search_anything == 0){
        for (var i = 0; i < 3; i++){
          var id_idx = getRankId(i);
          $('#' + id_idx + '-2-1').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-2-1').attr("class", "table-details");
          $('#' + id_idx + '-2-2').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-2-2').attr("class", "table-details");
          $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-1').attr("class", "table-details");
          $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-2').attr("class", "table-details");
        }
        return;
      }

  node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        if(d.spotName == names[count_text]){
          text_x[count_text] = d.x;
          text_y[count_text] = d.y;
          count_text ++;
        }
        return "translate(" + (d.x + x_padding) + "," + d.y + ")"; 
      })
      .on("mouseover", function(d){
        d3.select(this).select("circle").style("stroke-width", "3px");
        var tip_region_str;
        var r = d.region;
        var regs = [];
        $("#tip-date").text(now_yr + " 年 " + now_mn + " 月");
        $("#tip-spot-name").text(d.spotName);
        $("#tip-tour-number").text(modNum(d.value.toString()) + "位遊客") ;
        if (d.Class == "國家公園" || d.Class == "國家風景區"){
          $("#tip-class").text("類型：" + d.Detail_Class);
        }
        else{
          $("#tip-class").text("類型：" + d.Class);
        }
        if (r.length == 6){
          regs[0] = r.substr(0,3);
          regs[1] = r.substr(3,3);
          $("#tip-region").text("縣市：" + modRegionName(regs[0]) + "、" + modRegionName(regs[1]));
        }
        else{
          $("#tip-region").text("縣市：" + modRegionName(r));
        }
        // $("#risetip-sum-bo").text("地區：" +  d["region"]);
        tip_x = d.x + 20 + x_padding;
        tip_y = d.y + 10;
        if(tip_x + 300 > 1200)
          tip_x = tip_x - 300;
        if(tip_y + 140 > 700)
          tip_y = tip_y - 140;
        d3.select(".tool_tip").transition()
          .attr("transform", function(){
            return "translate(" + tip_x + "," + tip_y + ")";
          })
          .style("display", "inline")
          .duration(500);
        ga("send", {
          "hitType": "event",
          "eventCategory": "chart",
          "eventAction": "hover",
          "eventLabel": "search"
        });

      })
      .on("mouseout", function(d){
        d3.select(this).select("circle").style("stroke-width", "1px");
        d3.select(".tool_tip").transition().style("display", "none").duration(1000).delay(500);
      });

  // console.log(names);

  /*node.append("title")
      .text(function(d) { return d.spotName + ": " + format(d.value); });*/

  node.append("circle")
      .attr("r", function(d) { return d.r; })
      .attr("class", function(d) { return d.className; });

  /*node.append("text")
      .attr("dy", ".3em")
      .style("text-anchor", "middle")
      .text(function(d) { 
        if (d.value >= 200000)
          return d.spotName.substring(0, d.r / 3); 
        else return null;
      });*/
  for(var i = 0; i < names.length; i++){
      d3.select("svg").append("text")
        .attr("class", "overall-text")
        .attr("x", text_x[i] - ((map[names[i]].length/5) * 30) + x_padding)
        .attr("y", text_y[i] + 4)
        .text(map[names[i]])
        .attr("class", "draw-text-overall");
      }

  dataforTable.sort(function(a,b){return b[now_yr][now_mn - 1] - a[now_yr][now_mn - 1] });      
    var ranklist = [];
    for(var i = 0; i < dataforTable.length; i++){
      ranklist[i] = {};
      ranklist[i]['spotName'] = dataforTable[i]['Scenic_Spots'];
      ranklist[i]['now_tourNum'] = dataforTable[i][now_yr][now_mn - 1];
      if(now_mn - 2 < 0){
        if(now_yr - 1 < 2005){
          ranklist[i]['lastmn_tourNum'] = -1;
        }
        else{
          ranklist[i]['lastmn_tourNum'] = dataforTable[i][now_yr - 1][11];
        }
      }
      else{
        ranklist[i]['lastmn_tourNum'] = dataforTable[i][now_yr][now_mn - 2]
      }
      if(now_yr - 1 < 2005){
        ranklist[i]['lastyr_tourNum'] = -1;
      }
      else{
        ranklist[i]['lastyr_tourNum'] = dataforTable[i][now_yr - 1][now_mn - 1];
      }
    }

      for (var i = 0; i < dataforTable.length; i++){
        var id_idx = getRankId(i);
        var iconUp = '↑';
        var iconDown = '↓';
        var travelspot = ranklist[i]['spotName'];
        var nowNum = ranklist[i]['now_tourNum'];
        var lastyrNum = ranklist[i]['lastyr_tourNum'];
        var lastmnNum = ranklist[i]['lastmn_tourNum'];

        $('#' + id_idx + '-2-1').text(map[travelspot]);
        $('#' + id_idx + '-2-2').text(modNum(nowNum.toString()) + "位");
        if(lastmnNum == -1){
          $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-1').attr("class", "table-details");
        }
        else{
          if(nowNum >= lastmnNum){
            var frac = ((nowNum - lastmnNum)/lastmnNum) * 100;
            $('#' + id_idx + '-3-1').text(iconUp + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-1').attr("class", "increasing");
          }
          else{
            var frac = ((lastmnNum - nowNum)/lastmnNum) * 100;
            $('#' + id_idx + '-3-1').text(iconDown + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-1').attr("class", "decreasing");
          }
        }
        if(lastyrNum == -1){
          $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
          $('#' + id_idx + '-3-2').attr("class", "table-details");
        }
        else{ 
          if(nowNum >= lastyrNum){
            var frac = ((nowNum - lastyrNum)/lastyrNum)*100;
            $('#' + id_idx + '-3-2').text(iconUp + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-2').attr("class", "increasing");
          }
          else{
            var frac = ((lastyrNum - nowNum)/lastyrNum)*100;
            $('#' + id_idx + '-3-2').text(iconDown + ' ' + formatFloat(frac) + '%');
            $('#' + id_idx + '-3-2').attr("class", "decreasing");
          }
        }

      }

      for(var i = 2; i >= dataforTable.length; i--){
        var id_idx = getRankId(i);
        $('#' + id_idx + '-2-1').text('\xa0\xa0' + "------");
        $('#' + id_idx + '-2-1').attr("class", "table-details");
        $('#' + id_idx + '-2-2').text('\xa0\xa0' + "------");
        $('#' + id_idx + '-2-2').attr("class", "table-details");
        $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
        $('#' + id_idx + '-3-1').attr("class", "table-details");
        $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
        $('#' + id_idx + '-3-2').attr("class", "table-details");
      }

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
    for (var i = 0; i < 3; i++){
      var id_idx = getRankId(i);
      $('#' + id_idx + '-2-1').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-2-1').attr("class", "table-details");
      $('#' + id_idx + '-2-2').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-2-2').attr("class", "table-details");
      $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-3-1').attr("class", "table-details");
      $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-3-2').attr("class", "table-details");
    }
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
    for (var i = 0; i < 3; i++){
      var id_idx = getRankId(i);
      $('#' + id_idx + '-2-1').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-2-1').attr("class", "table-details");
      $('#' + id_idx + '-2-2').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-2-2').attr("class", "table-details");
      $('#' + id_idx + '-3-1').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-3-1').attr("class", "table-details");
      $('#' + id_idx + '-3-2').text('\xa0\xa0' + "------");
      $('#' + id_idx + '-3-2').attr("class", "table-details");
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

function classes_search(data, yr_str, mn_int, array_class, array_region, array_names, data_Table) {
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
      data_Table.push(data[obj]);
      
      classname = getClassName(data[obj]['Class']);

      if(data[obj][yr_str][mn_int - 1] != -1) peoNum = data[obj][yr_str][mn_int - 1];
      else peoNum = 0;
      if(data[obj][yr_str][mn_int - 1] > 200000)
        array_names.push(data[obj]['Scenic_Spots']);
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
    case 5:
      return "spring-btn";
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
      .attr("transform", "translate(300,100)");

  tooltip.append("rect")
      .attr("id", "tip-frame")
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "white")
      .attr("width", 280)
      .attr("height", 120)
      .attr("transform", "translate(0,0)");

  tooltip.append("text")
      .attr("id", "tip-date")
      .text("日期")
      .attr("transform", "translate(15,25)");

  tooltip.append("text")
      .attr("id", "tip-spot-name")
      .text("景點名稱")
      .attr("transform", "translate(15,45)");

  tooltip.append("text")
      .attr("id", "tip-tour-number")
      .text("遊客人數")
      .attr("transform", "translate(15,65)");

  tooltip.append("text")
      .attr("id", "tip-region")
      .text("縣市")
      .attr("transform", "translate(15,85)");

  tooltip.append("text")
      .attr("id", "tip-class")
      .text("類型")
      .attr("transform", "translate(15,105)");
}

function createToolTip_Class( _svg ){
  tooltip = _svg.append("g")
      .attr("class","tool_tip")
      .style("display", "none")
      .attr("transform", "translate(0,0)");

  tooltip.append("rect")
      .attr("id", "tip-frame")
      .attr("stroke-width", 1)
      .attr("stroke", "black")
      .attr("fill", "white")
      .attr("width", 280)
      .attr("height", 120)
      .attr("transform", "translate(0,0)");

  tooltip.append("text")
      .attr("id", "tip-date")
      .text("日期")
      .attr("transform", "translate(15,25)");

  tooltip.append("text")
      .attr("id", "tip-spot-name")
      .text("景點名稱")
      .attr("transform", "translate(15,45)");

  tooltip.append("text")
      .attr("id", "tip-tour-number")
      .text("遊客人數")
      .attr("transform", "translate(15,65)");

  tooltip.append("text")
      .attr("id", "tip-region")
      .text("縣市")
      .attr("transform", "translate(15,85)");

  tooltip.append("text")
      .attr("id", "tip-class")
      .text("類型")
      .attr("transform", "translate(15,105)");
}

function makeMouseOutFn(elem){
    var list = traverseChildren(elem);
    return function onclick(event) {

        var e = event.target;
        if (~list.indexOf(e) || e == document.getElementById("search-btn")) {
            return;
        }
        document.getElementById("popup").style.visibility = "hidden";
        document.getElementById("search-triangle").src = "img/icon_triangle_down.png";
        // handle mouse event here!
    };
}

function traverseChildren(elem){
    var children = [];
    var q = [];
    q.push(elem);
    while (q.length > 0) {
      var elem = q.pop();
      children.push(elem);
      pushAll(elem.children);
    }
    function pushAll(elemArray){
      for(var i=0; i < elemArray.length; i++) {
        q.push(elemArray[i]);
      }
    }
    return children;
}

function modNum(str){
  var str1, str2, str3;
  var finalStr;
  if(str.length > 6){
    str1 = str.substr(str.length - 3, 3);
    str2 = str.substr(str.length - 6, 3);
    str3 = str.substr(0, str.length - 6);
    finalStr = str3 + ',' + str2 + ',' + str1;
  }
  else if (str.length > 3){
    str1 = str.substr(str.length - 3, 3);
    str2 = str.substr(0, str.length - 3);
    finalStr = str2 + ',' + str1;
  }
  else{
    finalStr = str;
  } 

  return finalStr; 
}

function getRankId(i){
  switch(i){
    case 0:
      return "rank1";
    case 1:
      return "rank2";
    case 2:
      return "rank3";
  }
}

function formatFloat(num){
  var size = Math.pow(10, 2);
  return Math.round(num*size) / size;
}

function src_click(){
  $("#src-link").css("color", "#808080");
}

  $('#highcharts_01').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: '102年 主題樂園遊客總人數排名'
        },
        subtitle: {
            text: ' '
        },
        xAxis: {
            categories: ['劍湖山世界', '九族文化村', '小人國主題樂園', '六福村主題遊樂園', '麗寶樂園', '頑皮世界', '遠雄海洋公園', '8大森林樂園', '東勢林場遊樂區', '杉林溪森林生態渡假園區', '泰雅渡假村', '香格里拉樂園', '雲仙樂園', '尖山埤江南渡假村', '西湖渡假村'],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '人數',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            pointFormat: '{series.name}:<b>{point.y}',
            valueSuffix: '人次'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true,
            enabled: false,
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '旅客人數',
            color:'#56d8a0',
            data: [128526, 122695, 87674, 86938, 76877,57814,45041,37499,35652,32384,29835,20201,18464,17853,16746]
        }]
  });

  $('#highcharts_02').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: '103年 主題樂園遊客總人數排名'
        },
        subtitle: {
            text: ' '
        },
        xAxis: {
            categories: ['小人國主題樂園', '六福村主題遊樂園', '麗寶樂園', '劍湖山世界', '頑皮世界', '九族文化村', '遠雄海洋公園', '8大森林樂園', '東勢林場遊樂區', '泰雅渡假村', '雲仙樂園', '杉林溪森林生態渡假園區', '西湖渡假村', '尖山埤江南渡假村', '野柳海洋世界'],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '人數',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            pointFormat: '{series.name}:<b>{point.y}',
            valueSuffix: '人次'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true,
            enabled: false,
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '旅客人數',
            color:'#6ad399',
            data: [108750, 93743, 67417, 66136,54995,51482,33400,30021,22010,18212,15647,15324,14458,12919,12266]
        }]
  });

  $('#highcharts_03').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: '102年 遊憩景點旅遊人數排名'
        },
        xAxis: {
            categories: ['義大世界','2013花在彰化','市立動物園','旗津海岸公園','蓮池潭','走馬瀨農場','中正紀念堂','貓空纜車','瑞芳風景特定區','國父紀念館','烏來風景特定區','淡水金色水岸','國立傳統藝術中心','礁溪*','壽山動物園',],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '人數',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            pointFormat: '{series.name}:<b>{point.y}',
            valueSuffix: '人次'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true,
            enabled: false,
        },
        credits: {
            enabled: false
        },
       series: [{
            name: '旅客人數',
            color:'#d89216',
            data:[660000,406670,286825,254711,215270,210931,185318,184921,170895,152989,137057,133016,130188,124927,114005]
        }]
  });

  $('#highcharts_04').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: '103年 遊憩景點旅遊人數排名'
        },
        xAxis: {
            categories: ['義大世界','基隆黃色小鴨旅遊景點','2014花在彰化','市立動物園','旗津海岸公園','宜蘭及南方澳地區','瑞芳風景特定區','蓮池潭','中正紀念堂','日月潭環潭','貓空纜車','烏來風景特定區','國立傳統藝術中心','東石漁人碼頭','石門水庫',],
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: '人數',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            pointFormat: '{series.name}:<b>{point.y}',
            valueSuffix: '人次'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 0,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true,
            enabled: false,
        },
        credits: {
            enabled: false
        },
        series: [{
            name: '旅客人數',
            color:'#f9b84e',
            data: [460432,437760,401744,252410,167848,161259,157038,152312,136414,128416,121986,113044,90747,88606,84636]
        }]
  });
