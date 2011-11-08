Nconf = require 'nconf'
Fs = require 'fs'
Colors = require 'colors'

class Mirr
	constructor: ( ) ->
		@version = "0.1.0"
		@config = "#{__dirname}/../db/mirr.json"
		Nconf.add 'file', { file: @config }

	save: ->
		Nconf.save ( err ) ->
			throw err if err

	add: ( key, val ) ->
		Nconf.set( key, val )

	rm: ( key ) ->
		Nconf.clear( key )

	get: ( key ) ->
		return Nconf.get( key )

	pretty: ( obj ) ->
		output = '\nVersion\tArch(es)\tGet Packages\tLast Update\tActive\n'.bold
		obj = JSON.parse obj.toString()
		for ver of obj
			if obj[ver]
				url = obj[ver].url
				arch = obj[ver].arch.join( ', ' )
				pkgs = obj[ver].packages
				last = obj[ver].lastupdate
				active = obj[ver].active

				output = output + "#{ver}\t#{arch}\t#{pkgs}\t\t#{last}\t#{active}\n"
		return output


	dump: ( fn ) ->
		return Fs.readFile @config, ( err, data ) ->
			fn( err, data )

	add: ( ) ->


	rand: ( max ) ->
		return Math.floor( Math.random() * max )

exports.Mirr = Mirr
