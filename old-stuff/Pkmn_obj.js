function Pokemon(name, number) {
	this.number = number;
	this.name = name;
	this.colors = {};
}

Pokemon.prototype.addColor = function(color, amount) {
	colors[color] = amount;
}