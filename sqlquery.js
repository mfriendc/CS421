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
	Query Functions
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
	get the query for the main search

	separated for readability
*/
function getRouteIDsQuery(o) {
var query = 
`
SELECT DISTINCT a.R_ID
FROM HAS a, HAS b, LOCATION c, LOCATION d
WHERE (a.R_ID = b.R_ID)
AND (c.L_ID=a.L_ID)
AND (d.L_ID=b.L_ID)
${(false?'AND c.L_Name = startLoc':'')}
${(false?'AND d.L_Name = endLoc':'')}
AND (a.TIME < b.TIME)
GROUP BY a.R_ID
`

return query;
}

/*
	Most important function, gets our beloved search datas and wraps it in
	a nice object for the template to use

	in progress
*/
function getResultsInRoute(o) {
	var query = 
`
SELECT r.R_ID, r.R_NAME, l.L_Name, h.TIME
FROM ROUTE r, LOCATION l, HAS h
WHERE (r.R_ID IN (${getRouteIDsQuery(o)}))
AND (r.R_ID = h.R_ID)
AND (l.L_ID = h.L_ID)
ORDER BY r.R_ID, h.TIME
`

	return query
}

/*
	get all driver names
	
	admin: 
		true: for admin, get full driver names
		false: for users, only get first name
*/
function getDriverNames(admin) {
	var query =
`
SELECT FName${(admin ? ', LName' : '')}
FROM DRIVER
ORDER BY ${(admin ? 'Lname, ' : '')}FName
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
SELECT DISTINCT b.Type, r.R_Name
FROM BUS b, ROUTE r, ROUTE_ASSIGNED a
WHERE (b.B_ID = a.B_ID)
AND (r.R_ID = a.R_ID)
AND (r.R_ID < 100)
`

	if (admin) query = 'SELECT * FROM BUS'

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
	getResultsInRoute,
	getDriverNames,
	getHolidays,
	getBuses
}
