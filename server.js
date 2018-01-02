const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const moment = require('moment');
const path = require('path');
const iotHubClient = require('./IoTHub/iot-hub.js');
const app = express();

//__dirname : server.js가 실행되는 현재 경로
// path의 join 함수를 써서 현재 위치와 public 폴더 위치를 합쳐 경로 설정
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(function (req, res/*, next*/) {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', function connection(ws) {
    console.log(ws);
    ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log('sending data ' + data);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

var iotHubReader = new iotHubClient('HostName=SpmsMQTest.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=4VDeYeXXS4IJ542lWvFL4l6Pcb7nKZnFHGxKnUNGqFc=', 'webfrontend');
console.log(process.env['Azure.IoT.IoTHub.ConnectionString']);

iotHubReader.startReadMessage(function (obj, date) {
  try {
    console.log(date);
    date = date || Date.now()
    wss.broadcast(JSON.stringify(Object.assign(obj, { time: moment.utc(date).format('YYYY:MM:DD[T]hh:mm:ss') })));
  } catch (err) {
    console.log(obj);
    console.error(err);
  }
});

var port = normalizePort(process.env.PORT || '3000');
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
