var PokemonView = Backbone.View.extend({

	BAR_SCALAR: 1.8,
	UNIFORM_BAR_WIDTH: 200,
	ZOOM: 8,
	RENDER_STYLES: ['sorted', 'sorted-uniform', 'grouped', 'grouped-uniform'],

	initialize: function() {
		//pick a pokemon at random to start

		this.listenTo(this.model, "loadedPokemon", this.renderPokemon);
		this.listenTo(this.model, "loadedPokemon", this.renderControls);
		this.listenTo(this.model, "loadedPokemon", this.renderBars);
		this.listenTo(this.model, "loadedPokemon", this.updateInformation);
		this.$input           = $('input');
		this.bars             = $('.bar');
		this.$search_box      = $('#search_box');
		this.$input_container = $('#input_container');
		this.$info            = $('#information a');

	},

	el: "body",

	events: {
		"click #search_button": "search",
		"click .bar": "changeBarRenderStyle",
		"click .left": "prevPokemon",
		"click .right": "nextPokemon",
		"keypress input": "searchOnEnter",
		"keydown": "navigateLeftRight",
		"mouseover #input_container": "displayArrows",
		"mouseleave #input_container": "hideArrows"
	},

	currentRenderStyle: 'sorted',

	search: function() {
		var number = this.getInput();
		var _this = this;

		//Flash red if the search is not found.
		if (number > globals.LAST_POKEMON || number <= 0) {
			var prevColor = this.$input.css('color');
			this.$input.css({ 'color' : 'red' });
			setTimeout(function () { _this.$input.css({ 'color' : prevColor }); }, 200);
		} else {
			document.activeElement = this.el;
			this.model.setPokemon(number);
		}
	},

	searchOnEnter: function(e) {
		if (e.which == 13) {
			this.search();
		}
	},

	navigateLeftRight: function(e) {
		if (document.activeElement.nodeName != "BODY") { return; }
		if (e.keyCode == 39) {
			this.nextPokemon();
		} else if (e.keyCode == 37) {
			this.prevPokemon();
		}
	},

	nextPokemon: function() {
		var next = (this.model.get("number") % globals.TOTAL_POKEMON) + 1;
		this.model.setPokemon(next);
	},

	prevPokemon: function() {
		var prev = this.model.get("number") - 1 || globals.TOTAL_POKEMON;
		this.model.setPokemon(prev);
	},

	changeBarRenderStyle: function() {
		curIndex = _.indexOf(this.RENDER_STYLES, this.currentRenderStyle);
		this.currentRenderStyle = this.RENDER_STYLES[(curIndex + 1) % this.RENDER_STYLES.length];
		this.renderBars();
	},

	displayArrows: function() {
		$('#buttons').slideDown(
			{easing : 'linear', duration : 50}
		);
	},

	hideArrows: function() {
		$('#buttons').slideUp(
			{easing : 'linear', duration : 50}
		);
	},

	getInput: function() {
		var data = this.$input.val();
		return (parseInt(data) ? parseInt(data) : (_.indexOf(globals.ALL_POKEMON, data) + 1));
	},

	renderPokemon: function() {
		
		/*** Draw the Pokemon itself ***/
		var spriteData = this.model.get("spriteData");
		var canvas = document.getElementById('pokemon');
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);

		for (var i = 0; i < globals.SPRITE_HEIGHT; i++) {
			for (var j = 0; j < globals.SPRITE_HEIGHT; j++) {
				context.fillStyle = (spriteData[i][j] || "rgba(0,0,0,0.0)");
				context.fillRect(i * this.ZOOM, j * this.ZOOM, this.ZOOM, this.ZOOM);
			}
		}
	},

	renderBars: function() {
		var colors = this.model.get("aggregateArray");
		var style  = this.currentRenderStyle;
		var isUniform = (style.indexOf('uniform') == -1);
			
		if (style.indexOf('grouped') != -1) {
			//////////////////////////_.sort////////////////////////////////////
		}

		for (var i = 1; i < colors.length; i++) {
			$(this.bars[i]).animate({
				'height'          : 100.0 / (colors.length - 1.0) + '%',
				'width'           : (isUniform ? colors[i][1] * this.BAR_SCALAR : this.UNIFORM_BAR_WIDTH) + 'px'
			}, {
				'easing'          : 'linear',
				'duration'        : 100
			})
			.text(colors[i][0])
			.css({ 'background-color': colors[i][0] });
		}
	},

	renderControls: function() {
		this.$search_box.show();

		var colors = this.model.get("aggregateArray");
		
		//Input: se black arrows if the background is too light to permit others
		var light = this.isLight(colors[0][0]);
		var vibrance = (light ? 'light' : 'dark');
		this.$input.css({
			'color'       : colors[0 + light][0],
			'border-color': colors[1 + light][0]
		})
		.val( globals.ALL_POKEMON[this.model.get('number') - 1] );

		this.$input_container.removeClass("dark light").addClass(vibrance);

		this.$search_box.css({
			'background-color': colors[2 + light][0]
		});

		//Dark search icon if background is light
		light = this.isLight(colors[2 + light][0]);
		var src = light ? 'images/search_dark.png' : 'images/search_new	.png';
		this.$search_box.find('img').attr({'src' : src });

		//Background color
		$('#app').css({ 'background-color': colors[0][0] });

	},

	updateInformation: function() {
		this.$info.text(
			this.model.get("aggregateArray")[0][0] + "\t#" + this.model.get("number")
		);
		this.$info.attr({
			'href': "http://bulbapedia.bulbagarden.net/wiki/" + this.model.get("name") 
		});
	},

	isLight: function(color) {
		var col =  parseInt(color.substr(1, 2), 16) + parseInt(color.substr(3, 2), 16) + parseInt(color.substr(5, 2), 16);
		return col > 240 * 3;
	}
});