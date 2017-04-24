// initialization
var tp = require('tedious-promises')        // library
var dbConfig = require('./config.json')     // config file
var TYPES = require('tedious').TYPES        // TYPES
tp.setConnectionConfig(dbConfig)            // apply config
Promise.prototype.fail = Promise.prototype.catch // copy catch to fail for consistency

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

function getLocations() {
	return getSqlTable("*", "LOCATION")
	.then(function(r){
		return Promise.resolve(r)
	})
	.fail(function(e){
		return Promise.reject(e)
	})
}

function exists(o) {
	return (typeof o !== 'undefined' && o !== null && o !== '')
}

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

function getRouteIDs(o) {

    var query = getRouteIDsQuery(o)

	return tp
	.sql(query)
	.execute()
	.then((r) => {
		return Promise.resolve(r)
	})
	.fail((e) => {
		return Promise.reject(e)
	})
    
}

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

function getDriverNames(admin) {
var query = `
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

module.exports = {
	getSqlTable,
	getLocations,
	getRouteIDs,
	getResultsInRoute,
	getDriverNames
}
