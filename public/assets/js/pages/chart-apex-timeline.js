var dataColors=$("#basic-timeline").data("colors"),options=(dataColors&&(colors=dataColors.split(",")),{series:[{data:[{x:"Code",y:[new Date("2019-03-02").getTime(),new Date("2019-03-04").getTime()]},{x:"Test",y:[new Date("2019-03-04").getTime(),new Date("2019-03-08").getTime()]},{x:"Validation",y:[new Date("2019-03-08").getTime(),new Date("2019-03-12").getTime()]},{x:"Deployment",y:[new Date("2019-03-12").getTime(),new Date("2019-03-18").getTime()]}]}],chart:{height:350,type:"rangeBar",toolbar:{show:!1}},colors:colors,plotOptions:{bar:{horizontal:!0}},xaxis:{type:"datetime",axisBorder:{show:!1}}}),chart=new ApexCharts(document.querySelector("#basic-timeline"),options),colors=(chart.render(),["#ce7e7e","#6ac75a","#fa5c7c","#6c757d","#39afd1"]),options=((dataColors=$("#distributed-timeline").data("colors"))&&(colors=dataColors.split(",")),{series:[{data:[{x:"Analysis",y:[new Date("2019-02-27").getTime(),new Date("2019-03-04").getTime()],fillColor:colors[0]},{x:"Design",y:[new Date("2019-03-04").getTime(),new Date("2019-03-08").getTime()],fillColor:colors[1]},{x:"Coding",y:[new Date("2019-03-07").getTime(),new Date("2019-03-10").getTime()],fillColor:colors[2]},{x:"Testing",y:[new Date("2019-03-08").getTime(),new Date("2019-03-12").getTime()],fillColor:colors[3]},{x:"Deployment",y:[new Date("2019-03-12").getTime(),new Date("2019-03-17").getTime()],fillColor:colors[4]}]}],chart:{height:350,type:"rangeBar",toolbar:{show:!1}},plotOptions:{bar:{horizontal:!0,distributed:!0,dataLabels:{hideOverflowingLabels:!1}}},dataLabels:{enabled:!0,formatter:function(e,t){var t=t.w.globals.labels[t.dataPointIndex],a=moment(e[0]),e=moment(e[1]).diff(a,"days");return t+": "+e+(1<e?" days":" day")},style:{colors:["#f3f4f5","#fff"]}},xaxis:{type:"datetime",axisBorder:{show:!1}},yaxis:{show:!0}}),colors=((chart=new ApexCharts(document.querySelector("#distributed-timeline"),options)).render(),["#ce7e7e","#6ac75a","#fa5c7c","#6c757d","#39afd1"]),options=((dataColors=$("#multi-series-timeline").data("colors"))&&(colors=dataColors.split(",")),{series:[{name:"Bob",data:[{x:"Design",y:[new Date("2019-03-05").getTime(),new Date("2019-03-08").getTime()]},{x:"Code",y:[new Date("2019-03-08").getTime(),new Date("2019-03-11").getTime()]},{x:"Test",y:[new Date("2019-03-11").getTime(),new Date("2019-03-16").getTime()]}]},{name:"Joe",data:[{x:"Design",y:[new Date("2019-03-02").getTime(),new Date("2019-03-05").getTime()]},{x:"Code",y:[new Date("2019-03-06").getTime(),new Date("2019-03-09").getTime()]},{x:"Test",y:[new Date("2019-03-10").getTime(),new Date("2019-03-19").getTime()]}]}],chart:{height:350,type:"rangeBar",toolbar:{show:!1}},plotOptions:{bar:{horizontal:!0}},dataLabels:{enabled:!0,formatter:function(e){var t=moment(e[0]),e=moment(e[1]).diff(t,"days");return e+(1<e?" days":" day")}},fill:{type:"gradient",gradient:{shade:"light",type:"vertical",shadeIntensity:.25,gradientToColors:void 0,inverseColors:!0,opacityFrom:1,opacityTo:1,stops:[50,0,100,100]}},colors:colors,xaxis:{type:"datetime",axisBorder:{show:!1}},legend:{position:"top"}}),colors=((chart=new ApexCharts(document.querySelector("#multi-series-timeline"),options)).render(),["#ce7e7e","#6ac75a","#fa5c7c","#6c757d","#39afd1"]),options=((dataColors=$("#advanced-timeline").data("colors"))&&(colors=dataColors.split(",")),{series:[{name:"Bob",data:[{x:"Design",y:[new Date("2019-03-05").getTime(),new Date("2019-03-08").getTime()]},{x:"Code",y:[new Date("2019-03-02").getTime(),new Date("2019-03-05").getTime()]},{x:"Code",y:[new Date("2019-03-05").getTime(),new Date("2019-03-07").getTime()]},{x:"Test",y:[new Date("2019-03-03").getTime(),new Date("2019-03-09").getTime()]},{x:"Test",y:[new Date("2019-03-08").getTime(),new Date("2019-03-11").getTime()]},{x:"Validation",y:[new Date("2019-03-11").getTime(),new Date("2019-03-16").getTime()]},{x:"Design",y:[new Date("2019-03-01").getTime(),new Date("2019-03-03").getTime()]}]},{name:"Joe",data:[{x:"Design",y:[new Date("2019-03-02").getTime(),new Date("2019-03-05").getTime()]},{x:"Test",y:[new Date("2019-03-06").getTime(),new Date("2019-03-16").getTime()],goals:[{name:"Break",value:new Date("2019-03-10").getTime(),strokeColor:"#CD2F2A"}]},{x:"Code",y:[new Date("2019-03-03").getTime(),new Date("2019-03-07").getTime()]},{x:"Deployment",y:[new Date("2019-03-20").getTime(),new Date("2019-03-22").getTime()]},{x:"Design",y:[new Date("2019-03-10").getTime(),new Date("2019-03-16").getTime()]}]},{name:"Dan",data:[{x:"Code",y:[new Date("2019-03-10").getTime(),new Date("2019-03-17").getTime()]},{x:"Validation",y:[new Date("2019-03-05").getTime(),new Date("2019-03-09").getTime()],goals:[{name:"Break",value:new Date("2019-03-07").getTime(),strokeColor:"#CD2F2A"}]}]}],chart:{height:350,type:"rangeBar",toolbar:{show:!1}},plotOptions:{bar:{horizontal:!0,barHeight:"80%"}},xaxis:{type:"datetime",axisBorder:{show:!1}},stroke:{width:1},colors:colors,fill:{type:"solid",opacity:.6},legend:{position:"top",horizontalAlign:"left"}}),colors=((chart=new ApexCharts(document.querySelector("#advanced-timeline"),options)).render(),["#ce7e7e","#6ac75a","#fa5c7c","#6c757d","#39afd1"]),options=((dataColors=$("#group-rows-timeline").data("colors"))&&(colors=dataColors.split(",")),{series:[{name:"George Washington",data:[{x:"President",y:[new Date(1789,3,30).getTime(),new Date(1797,2,4).getTime()]}]},{name:"John Adams",data:[{x:"President",y:[new Date(1797,2,4).getTime(),new Date(1801,2,4).getTime()]},{x:"Vice President",y:[new Date(1789,3,21).getTime(),new Date(1797,2,4).getTime()]}]},{name:"Thomas Jefferson",data:[{x:"President",y:[new Date(1801,2,4).getTime(),new Date(1809,2,4).getTime()]},{x:"Vice President",y:[new Date(1797,2,4).getTime(),new Date(1801,2,4).getTime()]},{x:"Secretary of State",y:[new Date(1790,2,22).getTime(),new Date(1793,11,31).getTime()]}]},{name:"Aaron Burr",data:[{x:"Vice President",y:[new Date(1801,2,4).getTime(),new Date(1805,2,4).getTime()]}]},{name:"George Clinton",data:[{x:"Vice President",y:[new Date(1805,2,4).getTime(),new Date(1812,3,20).getTime()]}]},{name:"John Jay",data:[{x:"Secretary of State",y:[new Date(1789,8,25).getTime(),new Date(1790,2,22).getTime()]}]},{name:"Edmund Randolph",data:[{x:"Secretary of State",y:[new Date(1794,0,2).getTime(),new Date(1795,7,20).getTime()]}]},{name:"Timothy Pickering",data:[{x:"Secretary of State",y:[new Date(1795,7,20).getTime(),new Date(1800,4,12).getTime()]}]},{name:"Charles Lee",data:[{x:"Secretary of State",y:[new Date(1800,4,13).getTime(),new Date(1800,5,5).getTime()]}]},{name:"John Marshall",data:[{x:"Secretary of State",y:[new Date(1800,5,13).getTime(),new Date(1801,2,4).getTime()]}]},{name:"Levi Lincoln",data:[{x:"Secretary of State",y:[new Date(1801,2,5).getTime(),new Date(1801,4,1).getTime()]}]},{name:"James Madison",data:[{x:"Secretary of State",y:[new Date(1801,4,2).getTime(),new Date(1809,2,3).getTime()]}]}],chart:{height:350,type:"rangeBar",toolbar:{show:!1}},plotOptions:{bar:{horizontal:!0,barHeight:"50%",rangeBarGroupRows:!0}},colors:colors,fill:{type:"solid"},xaxis:{type:"datetime",axisBorder:{show:!1}},legend:{position:"right"}});(chart=new ApexCharts(document.querySelector("#group-rows-timeline"),options)).render();