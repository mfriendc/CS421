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
	return module.exports.getSqlTable("*", "LOCATION")
	.then(function(r){
		return Promise.resolve(r)
	})
	.fail(function(e){
		return Promise.reject(e)
	})
}

function getRouteIDs(o) {
    var a = 'aaa'
    var query = `
SELECT a.R_ID
FROM HAS a, HAS b, LOCATION c, LOCATION d
WHERE a.R_ID = b.R_ID
AND c.L_ID=a.L_ID
AND d.L_ID=b.L_ID
AND c.L_Name = startLoc
AND d.L_Name = endLoc
AND a.TIME < b.TIME
`
    
}

module.exports = {getSqlTable, getLocations}
