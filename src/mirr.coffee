Nconf = require 'nconf'
Fs = require 'fs'
Colors = require 'colors'

class Mirr
	constructor: ( ) ->
		@version = "0.1.0"
		@config = "#{__dirname}/../db/mirr.json"
		@nconf = Nconf
		@nconf.add 'file', { file: @config }

	save: ->
		@nconf.save ( err ) =>
			Fs.readFile @config, ( err, data ) =>
				console.dir JSON.parse data.toString()

	set: ( key, val ) ->
		@nconf.set( key, val )

	add: ( str ) ->
		# Save a mirr obj into the nconf stuff .. build obj from string
		# here
		parts = str.split ':'
		arch = parts[2].split ','

		@set "#{parts[0]}:url", parts[1]
		@set "#{parts[0]}:arch", arch
		@set "#{parts[0]}:packages", parts[3]
		@set "#{parts[0]}:lastupdate", 'never'
		@set "#{parts[0]}:active", parts[4]

		@save()

	rm: ( key ) ->
		@nconf.clear( key )
		@save()

	pretty: ( obj ) ->
		output = '\nRelease\tURL\t\tArch(es)\tGet Packages\tLast Update\tActive\n'.bold
		obj = JSON.parse obj.toString()
		for ver of obj
			url = obj[ver].url
			arch = obj[ver].arch.join( ', ' )
			pkgs = obj[ver].packages
			last = obj[ver].lastupdate
			active = obj[ver].active

			output = output + "#{ver}\t#{url}\t#{arch}\t#{pkgs}\t\t#{last}\t\t#{active}\n"
		return output

	dump: ( fn ) ->
		Fs.readFile @config, ( err, data ) ->
			fn( err, data )

	rand: ( max ) ->
		return Math.floor( Math.random() * max )

exports.Mirr = Mirr
