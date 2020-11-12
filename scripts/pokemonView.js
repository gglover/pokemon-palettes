var PokemonView = Backbone.View.extend({

	BAR_SCALAR: 1.8,
	UNIFORM_BAR_WIDTH: 200,
	ZOOM: 8,
	RENDER_STYLES: ['sorted', 'sorted-uniform', 'grouped', 'grouped-uniform'],

	initialize: function() {
		
		// Manual binds... outside scope of events hash
		this.calculateCanvasZoom();
		 $(window).bind("resize.app", _.bind(this.calculateCanvasZoom, this));


		this.listenTo(this.model, "loadedPokemon", this.renderPokemon);
		this.listenTo(this.model, "loadedPokemon", this.renderControls);
		this.listenTo(this.model, "loadedPokemon", this.renderBars);
		this.listenTo(this.model, "loadedPokemon", this.renderStripes);
		this.listenTo(this.model, "loadedPokemon", this.renderBoxes );
		this.listenTo(this.model, "loadedPokemon", this.updateInformation);
		this.$input           = $('input');
		this.bars             = $('.bar');
		this.$search_box      = $('#search_box');
		this.$input_container = $('#input_container');
		this.$info            = $('#information a');
		this.$copied          = $('#copied');

		// Enable swiping on touch devices
		if ('ontouchstart' in window || 'onmsgesturechange' in window) {
			$("body").swipe( {
		        swipeLeft: _.bind(this.nextPokemon, this),
		        swipeRight: _.bind(this.prevPokemon, this) 
		    });
		}

	},

	el: "body",

	events: {
		"blur input":           "search",
		"click canvas":         "changeBarRenderStyle",
		"keypress input":       "searchOnEnter",
		"keydown":              "navigateLeftRight",
		"focus input":          "prepSearch",
		"click #main_button":   "changeModeMain",
		"click #bars_button":   "changeModeBars",
		"click #boxes_button":  "changeModeBoxes",
		"click .next_color":    "nextElementColor"
	},

	currentRenderStyle: 'sorted',

	//Used as a count of write locks for the animation bars
	isDrawing: false,

	search: function() {
		var number = this.getInput();
		var _this = this;

		//Flash red if the search is not found.
		if (number > globals.TOTAL_POKEMON || number <= 0) {
			var prevColor = this.$input.css('color');
			this.$input.css({ 'color' : 'red' });
			setTimeout(function () { _this.$input.css({ 'color' : prevColor }); }, 100);
		} else {
			this.setPokemon(number);
		}
	},

	calculateCanvasZoom: function() {
		this.ZOOM = Math.min(
			Math.floor($(document).height() / 90), 
			Math.floor($(document).width() / 60)
		);
		this.renderPokemon();
	},

	searchOnEnter: function(e) {
		if (e.which == 13) {
			this.search();
		}
	},

	navigateLeftRight: function(e) {
		if (document.activeElement.nodeName != "BODY") { return; }
		if (e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 32) {
			this.nextPokemon();
		} else if (e.keyCode == 37 || e.keyCode == 40) {
			this.prevPokemon();
		}
	},

	currentMode: "main",

	changeModeMain: function() {
		if (this.currentMode != 'main') {
			this.$el.removeClass();
			this.currentMode = 'main';
		}
	},

	changeModeBoxes: function() {
		if (this.currentMode != 'boxes') {
			this.$el.removeClass();
			this.$el.addClass('full-screen boxes');
			this.currentMode = 'boxes';
		}
	},

	changeModeBars: function() {
		if (this.currentMode != 'bars') {
			this.$el.removeClass();
			this.$el.addClass('full-screen bars');
			this.currentMode = 'bars';
		}
	},

	currentColorIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9],
	nextElementColor: function(e) {
		e.stopPropagation();
		var $parColor = $(e.currentTarget).closest('.box, .stripe')
		var stripeNum = $parColor.data('num');
		var colors = this.model.get('aggregateArray');
		this.currentColorIndices[stripeNum]++;
		$parColor.css({
			'background': colors[this.currentColorIndices[stripeNum] % colors.length][0] 
		})

		// Change the text node without deleting the button
		.get(0).lastChild.nodeValue = colors[this.currentColorIndices[stripeNum] % colors.length][0];
	},

	prepSearch: function() {
		this.$input.val('');
	},

	resetName: function() {
		this.$input.val( globals.ALL_POKEMON[this.model.get('number') - 1] );
	},

	nextPokemon: function() {
		var next = (this.model.get("number") % globals.TOTAL_POKEMON) + 1;
		this.setPokemon(next);
	},

	prevPokemon: function() {
		var prev = this.model.get("number") - 1 || globals.TOTAL_POKEMON;
		this.setPokemon(prev);
	},

	changeBarRenderStyle: function() {
		curIndex = _.indexOf(this.RENDER_STYLES, this.currentRenderStyle);
		this.currentRenderStyle = this.RENDER_STYLES[(curIndex + 1) % this.RENDER_STYLES.length];
		this.renderBars();
	},

	getInput: function() {
		var data = this.$input.val().toLowerCase();
		return (parseInt(data) ? parseInt(data) : (_.indexOf(globals.ALL_POKEMON, data) + 1));
	},

	setPokemon: function(num) {
		if (!this.isDrawing) {
			this.isDrawing = true;
			this.model.setPokemon(num);
			location.replace('#' + this.model.get('name'));
		}
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

			$(this.bars[i])
			.text(colors[i][0])

			.css({ 'background-color': colors[i][0] })
			.animate({
				'height'          : 100.0 / (colors.length - 1.0) + '%',
				'width'           : (isUniform ? colors[i][1] * this.BAR_SCALAR : this.UNIFORM_BAR_WIDTH) + 'px'
			}, {
				'easing'          : 'linear',
				'duration'        : 100
			});
			
		}
		
		var _this = this;
		setTimeout(
			function() {
				_this.isDrawing = false;
			}, 150
		);
	},

	renderStripes: function() {
		var colors = this.model.get("aggregateArray");
		var stripes = $('.stripe');
		for (var i = 0; i < 3; i++) {
			$(stripes[i]).css('background', colors[i + 1][0])
			.get(0).lastChild.nodeValue = colors[i + 1][0];
		}
	},

	renderBoxes: function() {
		var colors = this.model.get("aggregateArray");
		var boxes = $('.box');

		// SHUFFLE THE ARRAY //
		for(var j, x, i = boxes.length; i; j = Math.floor(Math.random() * i), x = boxes[--i], boxes[i] = boxes[j], boxes[j] = x);
		
		for (var i = 0; i < 9; i++) {
			$(boxes[i])
				.css('background', colors[i % colors.length][0])
				.get(0).lastChild.nodeValue = colors[i % colors.length][0];
			this.currentColorIndices[i] = i % colors.length;
		}
	},

	renderControls: function() {
		this.$search_box.show();

		var colors = this.model.get("aggregateArray");
		
		//Input: se black arrows if the background is too light to permit others
		var light = this.isLight(colors[0][0]);
		this.$input.css({
			'color'       : colors[0 + light][0],
			'border-color': colors[1 + light][0]
		});
		this.resetName();
		

		this.$search_box.css({
			'background-color': colors[2 + light][0]
		});

		//Dark search icon if background is light
		light = this.isLight(colors[2 + light][0]);
		var src = light ? 'images/search_dark.png' : 'images/search_new.png';
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