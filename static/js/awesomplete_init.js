$(document).ready(function() {
	console.log("loaded")
	var inputs = document.getElementsByClassName("location");
	var list = [];

	$.get("/locations").then((locations) => {
		console.log("locations", locations)
	    for (var k in locations) {
			if (locations.hasOwnProperty(k)) {
				list[k] = {label: locations[k].L_Name, value: String(locations[k].L_ID)}
			}
		}
		console.log(list, inputs)
		var i = 0;
		for (i = 0; i < inputs.length; i++) {
			console.log(new Awesomplete(inputs[i], {list: list}))
		}
	})
	
	
	
})
