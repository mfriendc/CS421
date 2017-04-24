loc_select = document.getElementsByClassName("locations");

var locations = {
  1: "Mooheau Bus Terminal",
  2: "Aupuni Center",
  3: "Hilo Shopping Center",
  4: "UH Hilo",
  5: "Hawaii CC",
  6: "Prince Kuhio Plaza",
  7: "Kilauea Haihai",
  8: "Haihai Ainaola",
  9: "Waiakea Uka Gym",
  10: "Life Care Center",
  11: "Banyan Drive",
  12: "Hilo Airport",
  13: "Keaukaha Market",
  14: "Baker Krauss St",
  15: "Seaside Restaurant",
  16: "Kings Landing",
  17: "Richardson",
  18: "Onekahakaha",
  19: "Oceanfront Kitchen",
  20: "Ocean View Park and Ride",
  21: "Waiohinu",
  22: "Naalehu",
  23: "Punaluu",
  24: "Pahala",
  25: "Volcano National Park",
  26: "Volcano Village",
  27: "Mountain View",
  28: "Fern Acres",
  29: "Kurtistown",
  30: "Keaau",
  31: "St Joseph School",
  32: "Hilo Library",
  33: "Hilo Medical Center",
  34: "Ainako Kaumana",
  35: "Chong Kaumana",
  36: "Kaumana Terrace",
  37: "Gentry Subdivision",
  38: "Kaumana City",
  39: "Kawaena Lapaau",
  40: "Pohoiki",
  41: "Seaview Estates",
  42: "Leilani Estates",
  43: "Nanawale",
  44: "Pahoa",
  45: "Hawaiian Beaches",
  46: "Ainaloa",
  47: "Hawaiian Paradise Park",
  48: "Honokaa",
  49: "Paauilo",
  50: "Laupahoehoe",
  51: "Hakalau",
  52: "Honomu",
  53: "Papaikou",
  54: "Kamuela View Estates",
  55: "Waimea"
};

for (var j = 0; j < loc_select.length; j++) {
  for (var k in locations) {
    if (locations.hasOwnProperty(k)) {
      console.log(k, locations[k]);
      var temp = document.createElement("option");
      temp.setAttribute("value", String(k));
      temp.appendChild(document.createTextNode(locations[k]));
      loc_select[j].appendChild(temp);
    }
  }
}
