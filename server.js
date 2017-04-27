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

/*
	Utility Functions
*/
function exists(o) {
	return (typeof o !== 'undefined' && o !== null && o !== '')
}

function parseTime(time) {
	return datetime.create(time).offsetInHours(10)
}

function day(d) {
	var days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday"
	]
	return days[new Date(d.getTime()).getDay()]
}

function parseDate(date) {
	return datetime.create(date)
}



/*
	Page Handlers
*/
// Index Page
app.get('/', (req, res) => {
	res.render('index')
})

// Submit the Search Form
app.post('/form', (req, res) => {
	var data = req.body
	console.log(data)
	if (exists(data.target_date)) {
		query.getRIDsQuery(data)
		query.getResults(data)
		.then((r) => {
			console.log("results\n--------\n", r, "\n--------\nresults")
		})
		.fail((e) => {
			console.log("error\n--------\n", e, "\n--------\nerror")
		})
		console.log(data.target_date)
		console.log(day(dt))
		var dt = datetime.create(data.target_date + ' 00:00')
	}
})



/*
	Navigation
*/
app.get('/nav-admin', (req, res) => {
	res.render('admin')
})

app.get('/nav-buses', (req, res) => {
	query.getBuses(false)
	.then((r) => {
		console.log(r)
		res.render('results_table', {title:'Buses', subtitle: 'List of our Buses', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/nav-drivers', (req, res) => {
	query.getDriverNames(false)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('results_table', {title:'Drivers', subtitle: 'Drivers driving each bus', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/nav-holidays', (req, res) => {
	query.getHolidays(false)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('results_table', {title:'Holidays', subtitle: 'Observed Holidays (no bus service)', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})



/*
	Admin Options
*/
app.get('/admin-buses', (req, res) => {
	query.getBuses(true)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('results_table', {title:'Bus Status', subtitle: 'Status of all buses on each Route effected', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/admin-drivers', (req, res) => {
	query.getDriverNames(true)
	.then((r) => {
		console.log(r)
		console.log("got")
		res.render('results_table', {title:'Drivers', subtitle: 'Drivers driving each bus', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/admin-maint', (req, res) => {
	query.getMaint()
	.then((r) => {
		console.log(r)
		res.render('results_table', {title:'Buses', subtitle: 'List of our Buses', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})

app.get('/admin-hours', (req, res) => {
	query.getHours()
	.then((r) => {
		console.log(r)
		res.render('results_table', {title:'Hours', subtitle: 'Employee Hours Driven', table: r})
	})
	.fail((e) => {
		res.send(e)
	})
})



/*
	Fetch Utilities
*/
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



/*
	Tests
*/
app.get('/test', (req, res) => {
	res.sendfile('./test.png')
})

app.get('/itest', (req, res) => {
	res.sendfile('./index.html')
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

app.get('/rir', (req, res) => {
	res.send(query.getResultsInRoute())
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



/*
	Start Server
*/
const port = 3000
app.listen(port, function(e) {
	console.log("Listening on port " + port)
})
