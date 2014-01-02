/*Load all pokemon and their associated colors into a JSON object to store and parse later
	this will make it so that you don't have to analyze the image everytime. This also forces me to
	keep the site up to date*/

var name_map = {};
var TOTAL_POKEMON = {'BW' : 649, 'DP' : 493, 'FRLG' : 151, 'HGSS' : 251, 'RS' : 386, 'RB' : 151, 'Y' : 151, 'G' : 151};
var colors = {};
var currentPokemon = 0;
var size = 96;
var sorted_colors = new Array();

/*4452 colors*/

var global_pokemon = {}; /*A map from number to properties of all pokemon */

window.onload = function() {
	loadNames();
	setTimeout(generatePokemon, 100);
}

function generatePokemon() {

	currentPokemon++;
	//reseteverything...
	var x = (currentPokemon - 1) % 31;
	var y = (currentPokemon - x) / 31;
	var canvas = document.getElementById('pokemon');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	var img1 = new Image();
	img1.src = 'all_pokemon.png';
	img1.onload = function() {
		context.drawImage(img1, size * x, size * y, size, size, 0, 0, size, size);
		processImageData();
		if (currentPokemon < TOTAL_POKEMON) {
			generatePokemon();
		} else {
			console.log(JSON.stringify(global_pokemon));
		}
	}
}

function processImageData() {
	var canvas = document.getElementById('pokemon');
	var context = canvas.getContext('2d');
	var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
	
	//Enlarge the pokemon by a scale factor
	
	//Clear the sample pokemon
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	//Log stats about color values

	colors = {};
	
	for (var x = 0; x < size; ++x){
		for (var y = 0; y < size; ++y){
			
			//Test color values
			var i = (y * canvas.width + x) * 4;
			var r = imgData[i];
			var g = imgData[i + 1];
			var b = imgData[i + 2];
			
			//log color
			var hash = colorHash({red : r, green : g, blue : b});
			if (hash in colors) {
				colors[hash] = colors[hash] + 1;
			} else {
				colors[hash] = 1;
			}
		}
	}
	sorted_colors = new Array();
	delete colors['#000000'];
	delete colors['#101010'];
	for (c in colors) {
		sorted_colors.push({color : getRGBValues(c), count : colors[c]});
	}
	sorted_colors.sort( function(a, b) { return b.count - a.count } );
	
	global_pokemon[currentPokemon] = {};
	global_pokemon[currentPokemon].colors = sorted_colors;
	global_pokemon[currentPokemon].name = name_map[currentPokemon];
}


function loadNames() {
	$.get('pokenegros.txt', function(data) {
    data = data.split(/\n/);
    for (var i = 0; i < data.length - 1; i += 2) {
	    name_map[data[i]] = data[i + 1].toLowerCase();
    }
  });
}

function getRGBValues(c) {
	var r = c.substring(1, 3);
	var g = c.substring(3, 5);
	var b = c.substring(5, 7);
	r = parseInt(r, 16);
	g = parseInt(g, 16);
	b = parseInt(b, 16);
	var color = {red : r, green : g, blue : b};
	return color;
}

function colorHash(color) {
	r = color.red.toString(16);
	g = color.blue.toString(16);
	b = color.green.toString(16);
	var result = '';
	if (r.length == 1) {
		r = '0' + r;
	}
	if (g.length == 1) {
		g = '0' + g;
	}
	if (b.length == 1) {
		b = '0' + b;
	}
	return '#' + r + g + b;
}