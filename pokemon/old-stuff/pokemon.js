var name_map = {};					//Maps pokemon numbers to names for easy access
var BAR_SCALAR = 1.8;				//Resiszes graph bars to better fit the screen
var TOTAL_POKEMON = 649;		
var sizes = {'BW' : 96, 'DP' : 80, 'FRLG' : 64, 'HGSS' : 80, 'RB' : 56, 'Y' : 56, 'G' : 56};
var version = 'BW';
var zoom = 2;
var graphOut = true;
var currentPokemon;
var pokeData;
/*31 X  21*/

$(document).ready(startItUp);


function startItUp() {
	loadNames();
	
	$.get('http://localhost/pokemon/pokemon_info.json', function(data) { pokeData = data;});
  
  $('#search_box').fadeIn(1000);
  
	$('#input_container')
		.mouseover( function() { $('#buttons').slideDown({easing : 'linear', duration : 100});})
		.mouseleave( function() { $('#buttons').slideUp({easing : 'linear', duration : 100});});
	
	$('input')
		.keydown(
			function(event){
		    if(event.keyCode == 13){
		        $("#search_box img").click();      
		    };
		   }
		 )				
	  .click( function() { $(this).select(); });
	  
	$('#search_box img')
		.bind('click', 
			function() {
				var text = $('input').val();
				if (text.toLowerCase() in name_map) {
					generatePokemon(name_map[text.toLowerCase()]);
				}
				else if (text.match(/[0-9]/)) {
					generatePokemon(text);
				} else {
					$('input').val('');
				}
			}
		);
			
	$('#left')
		.click( function() {
			if (currentPokemon == 1) {
				currentPokemon = TOTAL_POKEMON + 1;
			}
			generatePokemon(currentPokemon - 1); }
		);
	$('#right').click( function() {generatePokemon((currentPokemon + 1) % TOTAL_POKEMON); });
	
	//create the first pokemon
	setTimeout(function() { generatePokemon(Math.ceil(Math.random() * 600));}, 200);
}


//Creates a map from name to number of pokemon
function loadNames() {
	console.log(Date.now());
	$.get('http://localhost/pokemon/pokenegros.txt', function(data) {
    data = data.split(/\n/);
    for (var i = 0; i < data.length - 1; i += 2) {
	    name_map[data[i + 1].toLowerCase()] = data[i];
    }
    console.log(Date.now());
  });
  
}


function generatePokemon(num) {
	$('input').val(pokeData[num].name);
	currentPokemon = parseInt(num);
	//reseteverything...
	graphOut = true;
	$('.color_bar').remove();
	color_array = new Array();
	
	var canvas = document.getElementById('pokemon');
	var context = canvas.getContext('2d');
	$(canvas).hide();
	context.clearRect(0, 0, canvas.width, canvas.height);
	var pokeImg = new Image();
	
	pokeImg.src = 'sprites/poke/bw/' + num + '.png';
	pokeImg.onload = function() {
		context.drawImage(pokeImg, 0, 0, sizes[version], sizes[version], 0, 0, sizes[version], sizes[version]);
	}
	setTimeout(processImageData, 60);
}


function processImageData() {
	var canvas = document.getElementById('pokemon');
	var context = canvas.getContext('2d');
	var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
	
	//Enlarge the pokemon by a scale factor
	
	//Clear the sample pokemon
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	$(canvas).show();
	console.log(imgData);
	for (var x = 0; x < 96; ++x){
		for (var y = 0; y < 96; ++y){
				
			//Test color values
			var i = (y * canvas.width + x)*4;
			var r = imgData[i  ];
			var g = imgData[i+1];
			var b = imgData[i+2];
			var a = imgData[i+3];
		
			drawPixel(r, g, b, a, x, y);	
		}		
	}
	displayColors();
}

function drawPixel(r, g, b, a, x, y) {
	var delay = Math.floor((Math.random() + 1.2) * (sizes[version] - y) * 4);
	setTimeout(
		function() { 
			var context = document.getElementById('pokemon').getContext('2d');
			//create model rectangle
			context.fillStyle = "rgba("+r+","+g+","+b+","+(a/255)+")";	
			context.fillRect(x * zoom, y * zoom, zoom, zoom);
		}, 
		delay
	);
}


function displayColors() {
	var color_list = pokeData[currentPokemon].colors;
	for (var i = 0; i < color_list.length; i++) {
		createColorBar(i);
	}
	
	//remove bar with most common color (clash with the bg color)
	$('.color_bar').filter( function() { return $(this).data('sizes[version]') == color_list[0].count * BAR_SCALAR }).remove();
	$('body').animate( { 'backgroundColor': colorHash(color_list[0].color) }, 300 );
	setTimeout(function() { $('.color_bar:last').click();}, 600);
}


//Creates a color bar based on the index of the current pokemon's color breakdown
function createColorBar(i) {
	var color_array = pokeData[currentPokemon].colors;
	var height = $(window).height() / ((color_array.length - 1) * 1.0);
	height = height / ($(window).height() * 1.0)
	height = height * 100;
	var bar = $('<div class="color_bar"></div>').css('background-color', colorHash(color_array[i].color)).data('sizes[version]', color_array[i].count * BAR_SCALAR).click(
		function() {
			if (graphOut) {
				$('.color_bar').each(function() { $(this).animate( { 'width' : $(this).data('sizes[version]') + 20}) } );
				graphOut = false;
			} else {
				$('.color_bar').each(function() { $(this).animate( { 'width' : 175}) } );
				graphOut = true;
			}
		}).height(height + '%');
	$('#color_graph').append(bar);
	createSearchBar();
}


function createSearchBar() {
	var color_array = pokeData[currentPokemon].colors;
	$('input').css({'border-color' : colorHash(color_array[1].color), 'color' : colorHash(color_array[0].color)});
	$('#search_box').css({'background-color' : colorHash(color_array[2].color)});
	
	//Use black arrows if the background is too light to permit others
	if (isLight(color_array[0].color)) {
		$('#right').attr( {src : 'right_dark.png'} );
		$('#left').attr( {src : 'left_dark.png'} );
		$('input').css( {'color' : colorHash(color_array[1].color)} );
	} else {
		$('#right').attr( {src : 'right.png'} );
		$('#left').attr( {src : 'left.png'} );
	}
	if (isLight(color_array[1].color)) {
		$('input').css( {'border-color' : colorHash(color_array[3].color)} );
	}
}


function colorHash(color) {
	r = color.red.toString(16);
	g = color.green.toString(16);
	b = color.blue.toString(16);
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
	return '#' + r + b + g;
}

function isLight(color) {
	return parseInt(color.red) + parseInt(color.blue) + parseInt(color.green) > 240 * 3;
}
