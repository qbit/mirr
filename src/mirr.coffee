class Mirr
	constructor: ->
		@version = "0.1.0"
		@config = null

	loadConfig: ->

	rand: ( max ) ->
		return Math.floor( Math.random() * max )

exports.Mirr = Mirr
