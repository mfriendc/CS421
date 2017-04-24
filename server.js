var express 	  =     require('express')
var app 		  =     express()
var bodyParser	  =     require('body-parser')
var datetime      =     require('node-datetime')
const query = require("./sqlquery.js")

// middle-wares
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/', (req, res) => {
	res.sendfile('./static/index_main.html')
//	res.sendfile('./index.html')
})

app.get('/test', (req, res) => {
	res.sendfile('./test.png')
})

app.get('/itest', (req, res) => {
	res.sendfile('./index.html')
})

app.get('/locations', (req, res) => {
	console.log(res != null && typeof res !== 'undefined')
	query.getLocations()
	.then((r) => {
		console.log(r)
		res.set('Content-Type', 'application/json')
		res.send(r)
	})
	.fail((e) => {
		res.send(e)
	})
})

app.post('/form', (req, res) => {
	console.log(req)
	console.log("===========")
	console.log(req.body)
})

const port = 3000
app.listen(port, function(e) {
	console.log("Listening on port " + port)
})
