var express 	  =     require('express')
var exphbs        =     require('express-handlebars')
var app 		  =     express()
var bodyParser	  =     require('body-parser')
var datetime      =     require('node-datetime')
const query = require("./sqlquery.js")

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

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

app.get('/routes', (req, res) => {
	query.getRouteIDs({})
	.then((r) => {
		console.log(r)
		res.set('Content-Type', 'application/json')
		res.send(r)
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/hb', (req, res) => {
	query.getLocations()
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('test', {layout:false, locs: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/rir', (req, res) => {
	res.send(query.getResultsInRoute())
})

app.post('/form', (req, res) => {
	console.log(req.body)
})

app.get('/drivera', (req, res) => {
	query.getDriverNames(true)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('tabletest', {layout:false, table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/driver', (req, res) => {
	query.getDriverNames(false)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('tabletest', {layout:false, table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

const port = 3000
app.listen(port, function(e) {
	console.log("Listening on port " + port)
})
