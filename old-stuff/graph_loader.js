var pokeData = {};
var color_graph = {};
var SHADE_RELATION = .06; //Based on percentage difference, shouldn't be more than about .1
var NUMERICAL_SHADE_GAP = 60;	//max gap between RGB values to still be considered shades
var MIN_SHADE_VALUE = .7;
var TOTAL_POKEMON = 649;
//var COLOR_MATCH_BONUS = .1; //To give respect to many matching colors being a plus
var size = 96;
var POKEMON = 410;


/*Load the data of every pokemon from the image analysis script*/
$(document).ready(startItUp);

function startItUp() {
	$.getJSON('http://localhost/pokemon/pokemon_info.json', function(data) { pokeData = data; createGraph()});
}

/*Pretty much a main function, creates a map from pokemon to pokemon they lok like*/
function createGraph() {
	
	//Aggregate every color array
	for (pokeNum in pokeData) {
		pokeData[pokeNum].colors = aggregateColors(pokeData[pokeNum].colors);
	}
	
	//Compare every pokemon to every other pokemon
	//for (pokeNum1 in pokeData) {
		pokeNum1 = POKEMON;
		var compareList = new Array();
		for (pokeNum2 in pokeData) {
			if (pokeNum1 != pokeNum2) {
				compareList.push({number : pokeNum2, value : comparePokemon(pokeData[pokeNum1].colors, pokeData[pokeNum2].colors) });
			}
		}
		compareList.sort( function(a, b) { return a.value - b.value } );
		color_graph[pokeNum1] = compareList;
	//}
	console.log(color_graph);
	console.log(pokeData);
	generatePokemon();
}

/*Combine colors that are shades of eachother, this should isolate the main few
  colors of the pokemon sprite
  
  @effects colors, removes all shaded values*/
function aggregateColors(colors) {
	for (var i = 0; i < colors.length; i++) {
		for (var j = i + 1; j < colors.length; j++) {
			if (getShades(colors[i].color, colors[j].color) < MIN_SHADE_VALUE) {
				colors[i].count += colors[j].count;
				colors.splice(j, 1);
				j--;
			}
		}
	}
	
	//Select only the most prominent 3 colors
	colors.splice(3, colors.length - 3);
	return colors;
}

/*Returns double representing the r, g and b values' closeness between the two colors
	
	@return a double representation*/
function getShades(c1, c2) {
	var c1Percentages = getPercentageColor(c1);
	var c2Percentages = getPercentageColor(c2);
	var perMatch =  (Math.abs(c1Percentages.red - c2Percentages.red) +
									 Math.abs(c1Percentages.green - c2Percentages.green) +
									 Math.abs(c1Percentages.blue - c2Percentages.blue));
	var numerMatch = (Math.abs(c1.red - c2.red) + Math.abs(c1.green - c2.green) + Math.abs(c1.blue - c2.blue)) / 255.0;
  return perMatch + numerMatch;

}

/*Converts straight integer rbg values into doubles that represent the percentage of the total color values
  that that portion of the color makes up
  
  @return a color percentage object {red : double, green : double, blue : double} */
function getPercentageColor(c) {
	var totalColor = c.red + c.green + c.blue;
	var redPer = (c.red * 1.0) / totalColor;
	var greenPer = (c.green * 1.0) / totalColor;
	var bluePer = (c.blue * 1.0) / totalColor;
	return {red : redPer, green : greenPer, blue : bluePer};
}

/*Determines a double value for the similarity of two pokemon based on aggregate shades.
	Should always be called after prepping the raw pokemon data.
	
	@return a double value*/
function comparePokemon(p1, p2) {
	/*console.log(pokeData[p1]);
	console.log(p2);
	p1 = pokeData[p1].colors;
	p2 = pokeData[p2].colors;*/
	
	//get the total pixels in the pokemon so we can work with percentages
	var p1Total = 0.0;
	var p2Total = 0.0;
	for (var i = 0; i < p1.length; i++) {
		p1Total += p1[i].count;
	}
	for (var i = 0; i < p2.length; i++) {
		p2Total += p2[i].count;
	}
	
	var result = 0.0;
	for (var i = 0; i < p1.length; i++) {
		for (var j = 0; j < p2.length; j++) {
			//result += getShades(p1[i].color, p2[j].color);
			
				//Average between the percentage make-ups of the two matching shades
				result += Math.sqrt(getShades(p1[i].color, p2[j].color)) * (((p1[i].count * 1.0) / p1Total + (p2[j].count * 1.0) / p2Total) / 2.0);
		}
	}
	return result;
}


function generatePokemon() {
	$('#pokemon').css({margin : '0px'});
	var canvas = document.getElementById('pokemon');
	var context = canvas.getContext('2d');
	var pokeImg = new Image();
	pokeImg.src = 'all_pokemon.png';
	pokeImg.onload = function() {
		var myX = (POKEMON - 1) % 31;
		var myY = (POKEMON - myX) / 31;
		context.drawImage(pokeImg, size * myX, size * myY, size, size, 0, 0, 50, 50);
		var index = 0;
		for (var n = 0; n < 20; n++) {
			var num = color_graph[POKEMON][n].number;
			var x = (num - 1) % 31;
			var y = (num - x) / 31;
			context.drawImage(pokeImg, size * x, size * y, size, size, 14 * index, 50, 20, 20);
			index++;
		}
	}
}