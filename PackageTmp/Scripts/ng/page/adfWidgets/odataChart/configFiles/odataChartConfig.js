{
    "chartArea": {
       "height":500,
       "margin":
        {
            "bottom": 50
        }
    },
   "legend":{
      "labels":{
            "font":"12px Arial,Helvetica,sans-serif",
            "color":"#333333"
     },
     "inactiveItems":{
         "labels":{
             "color":"#999999"
         },
         "markers":{
             "color":"#9A9A9A"
         }
     },
     "visible":true,
     "position":"bottom"      
   },
   "legendPosition": "bottom",
   "seriesDefaults":{
      "type":"line",
      "labels":{
         "visible":true,
         "format":"{0}",
         "background":"transparent"
      }
   },
   "series":[
      {
         "field":"Tier",
         "name":"Status",
         "type":"column",
         "aggregate":"count",
         "categoryField":"Tier",
         "overlay":{
             "gradient":"none"
         }
      }
   ],
   "theme": "bootstrap",
   "title":{
        "font":"16px Arial,Helvetica,sans-serif",
        "color":"#333333"
    },
   "tooltip": {
      "color": "#ffffff",
      "font": "12px Arial,Helvetica,sans-serif",
      "template": "#= series.name || category # - #= value #",
      "visible": true

   },
   "valueAxis":{
      "labels":{
         "format":"{0}"
      },
      "line":{
         "visible":true
      }
   },
   "categoryAxis":{
      "baseUnit":"fit",
      "majorGridLines":{
         "visible":true
      },
      "labels": {
         "rotation": {
            "angle": "auto"
         }
      }
   },
   "seriesColors":[
      "#4183D7",
      "#D24D57",
      "#2ECC71",
      "#F5D76E",
      "#D2527F",
      "#913D88",
      "#F89406",
      "#5C97BF",
      "#D91E18",
      "#26A65B",
      "#F7CA18",
      "#E08283",
      "#663399",
      "#E67E22",
      "#81CFE0",
      "#EF4836",
      "#90C695",
      "#F4D03F",
      "#8E44AD",
      "#D35400",
      "#2C3E50",
      "#CF000F",
      "#87D37C",
      "#F5AB35",
      "#E26A6A",
      "#913D88",
      "#F39C12",
      "#446CB3",
      "#96281B",
      "#1E824C",
      "#FDE3A7",
      "#F62459",
      "#AEA8D3",
      "#F9690E",
      "#336E7B",
      "#4DAF7C",
      "#F9BF3B",
      "#EB9532"
   ]
}