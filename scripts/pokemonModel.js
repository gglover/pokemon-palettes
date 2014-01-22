var PokemonModel = Backbone.Model.extend({


	initialize: function() {

		//Initialize 96 x 96 2D array to carry pixel color information.
		
		for (var i = 0; i < globals.SPRITE_HEIGHT; i++) {
			this.get('spriteData')[i] = [];
		}

		var reqPokemon = _.indexOf(globals.ALL_POKEMON, location.hash.substr(1, location.hash.length)) + 1;
		if (reqPokemon < 1) {
			this.set('number', Math.ceil(Math.random() * globals.TOTAL_POKEMON));
		} else {
			this.set('number', reqPokemon);
		}

		this.setPokemon(this.get('number'));
	},


	/*Example format of a calculated pokemon. The only real required initialization
		field is number; the rest is calculated. */
	defaults: {
		name: "bulbasaur",
		number: 1,
		aggregateColors: {/*'#0F0': 50, '#1F1': 20*/},
		aggregateArray: [],
		spriteData: []
	},


	/*We have to draw the image on a separate canvas in order to access the color values
		for individual pixels... Might be better functionality more fit for the backend but
		you get what you pay for hehe. */
	setPokemon: function(number) {

		canvas = document.getElementById('processing-canvas');
		context = canvas.getContext('2d');

		this.set("number", number);
		this.set("name", globals.ALL_POKEMON[number - 1]);
		this.set("aggregateColors", {}); 
		
		context.clearRect(0, 0, canvas.width, canvas.height);
		var pokeImg = new Image();
		
		pokeImg.src = 'images/sprites/poke/bw/' + number + '.png';
		

		//Wait for the image to load and draw before processing
		var _this = this;
		pokeImg.onload = function() {
			context.drawImage(pokeImg, 0, 0, globals.SPRITE_HEIGHT, globals.SPRITE_HEIGHT, 
				                       0, 0, globals.SPRITE_HEIGHT, globals.SPRITE_HEIGHT);
			_this._getSpriteData(canvas, context);

		}
	},


	_getSpriteData: function(canvas, context) {
		var imgData = context.getImageData(0, 0, canvas.width, canvas.height).data;
		
		for (var x = 0; x < globals.SPRITE_HEIGHT; ++x){
			for (var y = 0; y < globals.SPRITE_HEIGHT; ++y){
					
				//Test color values
				var i = (y * canvas.width + x) * 4;

				var hexColor = (imgData[i + 3] ? this._rgbToHex({ r: imgData[i], b: imgData[i + 1], g: imgData[i + 2] }) : null);
				
				//Index the color
				this.get('spriteData')[x][y] = hexColor;

				var colors = this.get('aggregateColors');
				if (hexColor && hexColor != "#101010" && hexColor != "#000000" && hexColor != "#181818") {
					colors[hexColor] ? colors[hexColor]++ : colors[hexColor] = 1;
				}
			}		
		}
		this.set('aggregateArray', _.sortBy(_.pairs(this.get('aggregateColors')), function(el) { return el[1] * -1; }));
		this.trigger('loadedPokemon');
	},


	//Converts an object with rgb values to a hex string representation of the color
	_rgbToHex: function(rgbObj) {
		r = rgbObj.r.toString(16);
		g = rgbObj.g.toString(16);
		b = rgbObj.b.toString(16);
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

});