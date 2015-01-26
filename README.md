# express-websocket

Access express routes using a [Primus](https://github.com/primus/primus) websocket connection.


### Installation
```
npm install psi-4ward/express-websocket
```


### Server
```javascript
// Init express
var app = require('express')();
app.get('/hello', function(req, res) {
  // identify / access websocket within routes / middlewares
  if(req.isWebsocket) {
    console.log('request from spark id', req.spark.id);
  }

  res.send('Hello World!')
});
var httpServer = app.listen(3000);

// attach express-websocket
var expressWebsocket = require('express-websocket');
expressWebsocket(app, httpServer, { /* primus options */ });
```

In addition to primus options you can pass a `beforeExpress: function(req, res, cb) {...} ` property to hook in right befor the
 data goes out to express router. 


### Client
```html
// primus serves its client lib via /primus/primus.js
<script src="http://localhost:3000/primus/primus.js"></script>


var primus = Primus('http://localhost:3000');
var jsonWebRequest = {
  type: 'json-web-request',
  method: 'GET',
  url: '/hello'
};
primus.writeAndWait(jsonWebRequest,  console.info.bind(console));
```

## License

  [MIT](LICENSE)