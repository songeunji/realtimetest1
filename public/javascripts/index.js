$(document).ready(function () {
  var timeData = [],
    speedVGData = [],
    speedLGData = [];
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Speed VG',
        yAxisID: 'Speed_VG',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: speedVGData
      },
      {
        fill: false,
        label: 'Speed LG',
        yAxisID: 'Speed_LG',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: speedLGData
      }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Speed VG & Speed LG Real-time Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Speed_VG',
        type: 'linear',
        scaleLabel: {
          labelString: 'Speed VG',
          display: true
        },
        position: 'left',
      }, {
          id: 'Speed_LG',
          type: 'linear',
          scaleLabel: {
            labelString: 'Speed LG',
            display: true
          },
          position: 'left'
        }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  var ws = new WebSocket('wss://' + location.host);

  
  var wsOpen = function (message) {
    console.log(message);
  };
  var wsRcvMsg = function (message) {
    console.log(message.data);
    try {

      var strSplit = message.data.split(",");
      var strFilter = [];

      strSplit.forEach(function (val) {
        var str = val.indexOf("TIME_STAMP");
        if(str != -1) strFilter.push(val);
        
        str = val.indexOf("SPEED_VG");
        if(str != -1) strFilter.push(val);
        
        str = val.indexOf("SPEED_LG");
        if(str != -1) strFilter.push(val);
      });

      var idx = strFilter[0].indexOf(":");
      strFilter[0] = strFilter[0].substring(idx+1, strFilter[0].length);
      strFilter[1] = parseFloat(strFilter[1].split(":")[1]);
      strFilter[2] = parseFloat(strFilter[2].split(":")[1]);

      timeData.push(strFilter[0]);
      speedVGData.push(strFilter[1]);

      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        speedVGData.shift();
      }
      if (strFilter[2]) {
        speedLGData.push(strFilter[2]);
      }
      if (speedLGData.length > maxLen) {
        speedLGData.shift();
      }
      console.log(strFilter[0], strFilter[1], strFilter[2]);
      myLineChart.update();

      // var obj = JSON.parse(message.data);
      // if(!obj.time || !obj.temperature) {
      //   return;
      // }
      // timeData.push(obj.time);
      // speedVGData.push(obj.temperature);
      // // only keep no more than 50 points in the line chart
      // const maxLen = 50;
      // var len = timeData.length;
      // if (len > maxLen) {
      //   timeData.shift();
      //   speedVGData.shift();
      // }

      // if (obj.humidity) {
      //   speedLGData.push(obj.humidity);
      // }
      // if (speedLGData.length > maxLen) {
      //   speedLGData.shift();
      // }

      // myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  };

  
  ws.onopen = wsOpen;
  ws.onclose = function (message) {
    console.log(message);
    ws = new WebSocket('wss://' + location.host);
    ws.onopen = wsOpen;
    ws.onmessage = wsRcvMsg;
  };
  ws.onerror = function (message) {
    console.log(message);
  };

  ws.onmessage = wsRcvMsg;
  
});
