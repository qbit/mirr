Nconf = require 'nconf'
Fs = require 'fs'
Colors = require 'colors'
Table = require 'cli-table'

class Mirr
	constructor: ( ) ->
		@version = "0.1.0"
		@config = "#{__dirname}/../db/mirr.json"
		@nconf = Nconf
		@nconf.add 'file', { file: @config }

	_save: ->
		@nconf.save ( err ) =>
		Fs.readFile @config, ( err, data ) =>
				console.dir JSON.parse data.toString()

	_set: ( key, val ) ->
		@nconf.set( key, val )

	add: ( str ) ->
		parts = str.split ':'
		arch = parts[2].split ','

		@_set "#{parts[0]}:url", parts[1]
		@_set "#{parts[0]}:arch", arch
		@_set "#{parts[0]}:packages", parts[3]
		@_set "#{parts[0]}:lastupdate", 'never'
		@_set "#{parts[0]}:schedule", '30,1,*,*,*'
		@_set "#{parts[0]}:active", parts[4]

		@_save()

	_rm: ( key ) ->
		@nconf.clear( key )
		@_save()

	rm: ( key ) ->
		@_rm key

	pretty: ( obj ) ->
		head =
			[ 'Release', 'URL', 'Sched', 'Arch(es)', 'Packages', 'Updated', 'Active' ]

		# colWidths=
		#  	[ 16, 21, 25, 20, 10, 10, 10 ]

		# table = new Table { head: head, colWidths: colWidths }
		table = new Table { head: head }

		obj = JSON.parse obj.toString()
		for ver of obj

			url = obj[ver].url
			arch = obj[ver].arch.join( ',' )
			sch = obj[ver].schedule
			pkgs = obj[ver].packages
			last = obj[ver].lastupdate
			active = obj[ver].active

			table.push [ ver, url, sch, arch, pkgs, last, active ]

		return table

	dump: ( fn ) ->
		Fs.readFile @config, ( err, data ) ->
			fn( err, data )

	rand: ( max ) ->
		return Math.floor( Math.random() * max )

exports.Mirr = Mirr

# vim:ft=coffee ts=2 sw=2 et :
