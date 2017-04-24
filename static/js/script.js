$(document)
	.ready(function(){
		var vm ={};
		var locations = new Bloodhound({
			datumTokenizer: Bloodhound.tokenizer.obj.whitspace('name'),
			queryTokenizer: Bloodhound.tokenizer.whitspace,
			remote: {
				url: 'api/locationsApi?query=%QUERY',
				wildcard: '%QUERY'
			}
		});

	$('#location')
	.typehead({
		minLength: 3,
		highlight: true
	},
	{
		name: 'locations',
		display: 'name',
		source: locations
	}).on("typehead:select", function(e, location){
		vm.locationID = from.id;
	});
});





function myFunction() {
    var x = document.getElementById("myDate").value;
    document.getElementById("demo").innerHTML = x; 
}

 function sartTimeFunction() {
    document.getElementById("startTime").value = "00:00:00";
}

 function finishTmeFunction() {
    document.getElementById("finishTime").value = "00:00:00";
}
