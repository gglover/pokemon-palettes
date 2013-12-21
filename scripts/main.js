var poke = new PokemonModel({ number : Math.ceil(Math.random() * globals.TOTAL_POKEMON) });

var PokeView = new PokemonView({model : poke});