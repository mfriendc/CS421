// initialization
var tp = require('tedious-promises')        // sql library
var datetime = require('node-datetime')		// parse dates
var dbConfig = require('./config.json')     // config file
var TYPES = require('tedious').TYPES        // TYPES
tp.setConnectionConfig(dbConfig)            // apply config
Promise.prototype.fail = Promise.prototype.catch // copy catch to fail for consistency



/*
	Utility Functions
*/
function exists(o) {
	return (typeof o !== 'undefined' && o !== null && o !== '')
}

function parseTime(time) {
	return datetime.create(time).offsetInHours(10)
}

function dateToDay(d) {
	var t = datetime.create(d + ' 00:00')
	return new Date(t.getTime()).getDay()
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

function month(d) {
	var months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	]
	return months[new Date(d.getTime()).getDay()]
}



/*
	Main Query Functions
*/
/*
	manually get a specific table and attributes
	mostly for debug
*/
function getSqlTable(attribs, table) {
	return tp
	.sql("SELECT " + attribs + " FROM " + table)
	.execute()
	.then(function(results){
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}

/*
	Get all location names and ids, used for the selections
*/
function getLocations() {
	return getSqlTable("*", "LOCATION")
	.then(function(r){
		return Promise.resolve(r)
	})
	.fail(function(e){
		return Promise.reject(e)
	})
}

/*
	gets the query that matches the R_IDs that
	are within the limits of the search query object
*/
function getRIDsQuery(o) {
	// ===== Initialize Variables =====
	var loc_check_start = ''
	var loc_check_end = ''
	var time_offset = 0
	var time_check_start = ''
	var time_check_end = ''
	var day_check = ''

	// ===== Location Checks =====
	// Location Start
	if (exists(o.loc_start)) {
		// start location exists, so we can specify the start segment
		console.log('adding start location to query')
		loc_check_start = 
`
-- pair start name and id
AND (s.L_Name = '${o.loc_start}')
`
	} else {
		// start location does not exist
		console.log('no start loc')
		loc_check_start =
`
-- make sure start location matches its named id
AND (s.L_ID = a.L_ID)
`
	}

	// Location End
	if (exists(o.loc_end)) {
		// end location exists
		console.log('adding end location to query')
		loc_check_end =
`
-- pair end name and id
AND (e.L_Name = '${o.loc_end}')
`
	} else {
		// end location does not exist
		console.log('no end loc')
		loc_check_end =
`
-- make sure end location matches its named id
AND (e.L_ID = b.L_ID)
`
	}

	// ===== Time Checks =====
	// Time Threshold
	if (exists(o.time_range)) {
		// time threshold exists
		if (parseInt(o.time_range) !== 0) {
			// MAYBE WE'LL DO SOMETHING HERE BUT IM WORRIED ABOUT THE EFFORT
		}
	} else {
		// time threshold does not exist
	}

	// Time Start
	if (exists(o.time_start)) {
		// start time exists
		console.log('adding start time to query')
		time_check_start =
`
-- make sure start time above or equal to given
AND (a.TIME >= '${o.time_start}')
`
	} else {
		// start time does not exist
		console.log('no start time')
	}

	// Time End
	if (exists(o.time_end)) {
		// end time exists
		console.log('adding end time to query')
		time_check_end =
`
-- make sure end time below or equal to given
AND (b.TIME <= '${o.time_end}')
`
	} else {
		// end time does not exist
		console.log('no end time')
	}

	// ===== Date Checks =====
	if (exists(o.target_date)) {
		// date exists, get the weekday and convert it to a route type
		console.log('adding date to query')
		var tday = dateToDay(o.target_date)
		// any route can use daily
		var tlist = `'DL'`
		if (tday == 6) {
			// sunday is only weekend but our implementation is weird so
			// saturday can also be weekend
			tlist += `, 'WE'`
		}
		if (tday >= 1 && tday <= 5) {
			// mon to fri is weekday
			tlist += `, 'WD'`
		}
		if (tday >= 1 && tday <= 6) {
			// mon to sat is ms
			tlist += `, 'MS'`
		}
		day_check =
`
AND r.R_Type IN (${tlist})
`		
	} else {
		// date does not exist
		console.log('no target date')
	}

	var query =
`
SELECT DISTINCT a.R_ID
FROM HAS a, HAS b, LOCATION s, LOCATION e, ROUTE r
-- join has to has, limit to relevant routes
WHERE (a.R_ID = b.R_ID)
AND (a.R_ID = r.R_ID)
-- make sure location names are bound to location IDs
AND (a.L_ID = s.L_ID)
AND (b.L_ID = e.L_ID)
-- make sure a is the "start" and b is the "end"
AND (a.TIME < b.TIME)
-- and make sure the start and end location are not the same
AND (s.L_Name <> e.L_Name)

${loc_check_start}
${loc_check_end}
${time_check_start}
${time_check_end}
${day_check}
GROUP BY a.R_ID
`
	console.log("getRIDsQuery:", "\n", query)
	return query
}

/*
	get the query for the main search

	separated for readability
*/
function getResultsQuery(o) {
	var query =
`
SELECT r.R_ID, r.R_Name, h.TIME, l.L_ID, l.L_Name
FROM ROUTE r, HAS h, LOCATION l
WHERE r.R_ID IN (${getRIDsQuery(o)})
AND (r.R_ID = h.R_ID)
AND (h.L_ID = l.L_ID)
ORDER BY r.R_ID, h.TIME
`
	console.log("getResultsQuery:", "\n", query)
	return query
}

/*
	Most important function, gets our beloved search datas and wraps it in
	a nice object for the template to use

	Object Signature:
	[
	R_ID: {
		R_Name: "",
		locations: [
			L_ID: "",
			L_Name: "",
			TIME: "",
		]
		}
	]
*/
function getResults(o) {
	var query = getResultsQuery(o)

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		// create routes object
		var routes = {}
		for (i in results) if (results.hasOwnProperty(i)) {
			// get current route
			var r = results[i]
			// get the current id for easy access
			var id = r.R_ID
			// create the current route instance if it doesn't exist
			if (!exists(routes[id]))
				routes[id] = {}
			// set the id if it doesn't already exist
			if (!exists(routes[id].R_ID))
				routes[id].R_ID = r.R_ID
			// set the name if it doesn't already exist
			if (!exists(routes[id].R_Name))
				routes[id].R_Name = r.R_Name
			// create the locations array if it doesn't exist
			if (!exists(routes[id].locations))
				routes[id].locations = []
			// push the next entry to the locations array
			// get the time offst properly for hawaii
			//var time_s = datetime.create(r.TIME).offsetInHours(10)
			var time_s = (datetime.create(r.TIME, ''))
			time_s.offsetInHours(10)
			var pm = (parseInt(time_s.format("H")) >= 12)
			var time_12 = time_s.format("I:M") + " " + (pm ? "PM" : "AM")
			var time_24 = time_s.format("H:M")
			var chosen = ""
			if (exists(o.loc_start) && (o.loc_start == r.L_Name))
				chosen = "start"
			if (exists(o.loc_end) && (o.loc_end == r.L_Name))
				chosen = "end"
			
			routes[id].locations.push({
				"L_ID": r.L_ID,
				"L_Name": r.L_Name,
				"TIME_12": time_12,
				"TIME_24": time_24,
				"Chosen": chosen
			})
		}
		return Promise.resolve(routes)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}



/*
	Side Queries
*/

/*
	get all driver names
	
	admin: 
		true: for admin, get full driver info
		false: for users, only get first name
*/
function getDriverNames(admin) {
	var query =
`
SELECT FName${(admin ? ', LName' : '')}
FROM DRIVER
ORDER BY ${(admin ? 'Lname, ' : '')}FName
`

	if (admin) query = 'SELECT * FROM DRIVER'

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}

/*
	get all of the observed holidays
*/
function getHolidays() {
	var query =
`
SELECT NAME, DATE
FROM HOLIDAY
`

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		for (item in results) {
			console.log(results[item])
			if (results.hasOwnProperty(item)) {
				if (exists(results[item].DATE)) {
					results[item].DATE = datetime.create(results[item].DATE, 'f d').format()
				}
			}
		}
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}

/*
	get information about buses

	admin:
		true: for admins, get all information about bus status
		false: for users, only get buses and their routes
*/
function getBuses(admin) {
	var query =
`
SELECT DISTINCT b.B_ID, b.Type, b.Status, r.R_Name
FROM BUS b, ROUTE r, ROUTE_ASSIGNED a
WHERE (b.B_ID = a.B_ID)
AND (r.R_ID = a.R_ID)
`

	if (!(admin)) query = 'SELECT * FROM BUS'

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}

/*
	get the status and reason for buses in maintenance
*/
function getMaint() {
	var query =
`
SELECT b.B_ID, b.Type, s.Job_ID, s.Date, m.Description
FROM BUS b, MAINTENANCE m, SCHEDULED s
WHERE (b.B_ID = s.B_ID)
AND (s.Job_ID = m.Job_ID)
`

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		for (i in results) if (results.hasOwnProperty(i)) {
			if (exists(results[i].Date)) results[i].Date = datetime.create(results[i].Date, 'f d, Y').format()
		}
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}

/*
	Get the driver's names and hours
*/
function getHours() {
	var query =
`
SELECT d.FName, d.LName, d.Hrs_driven
FROM DRIVER d
`

	return tp
	.sql(query)
	.execute()
	.then(function(results){
		return Promise.resolve(results)
	}) // follow up on the results
	.fail(function(err) {
		return Promise.reject(err)
	}) // or do something if it errors
}



/*
	Activate Exports
*/
module.exports = {
	getSqlTable,
	getLocations,
	getRIDsQuery,
	getResultsQuery,
	getResults,
	getDriverNames,
	getHolidays,
	getBuses,
	getMaint,
	getHours
}
