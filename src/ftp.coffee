Ftp = require 'ftp'
Fs = require 'fs'
Path = require 'path'

class MirrFtp
	constructor: ( @server, @login, @pass, @opts, @fn ) ->

		@conn = new Ftp( { host: @server, debug: ( msg ) =>
			console.log "FTP VERBOSE: #{msg}" if @opts.ftp_debug
		})

		@pending = []
		@maxConn = @opts.maxConn || 1
		@finished = null
		@currentConn = 0


	log: ( type, msg ) ->
		console.log type + ': ' + msg if @opts.debug

	mkdir: ( paths ) ->
		paths = paths.replace( /\/src|\/lib/, '' )
		parts = paths.split( '/' )

		parts[0] = '/'
		previousPath = ''

		count = 0
		for path in parts
			do ( path ) ->
				Path.exists previousPath, (exists) ->
					if count < 2
						previousPath = previousPath + path
					else
						previousPath = previousPath + '/' + path
					count++
					if ! exists
						Fs.mkdir previousPath, 0755

	processPending: =>
		if @pending.length > 0
			@log 'QUEUE', "jobs pending: #{@pending.length}" if @opts.queue_debug
			fn = @pending.shift()
			@currentConn++
			fn ( =>
				@currentConn--
				process.nextTick( @processPending )
			)
		else
			@log 'QUEUE', "no pending jobs" if @opts.queue_debug
			@finished()

	connLimit: ( fn ) =>
		if @currentConn < @maxConn
			@currentConn++
			fn ( =>
				@currentConn--
				process.nextTick( @processPending )
			)
		else
			@pending.push fn

	dateCompare: ( date1, date2 ) ->
		return true if date1 > date2
		return false if date1 < date2


	getNewFiles: ( path, date ) =>
		dstPath = __dirname + '/public' + path
		dstPath = dstPath.replace( /\/src|\/lib/, '' )
		@mkdir( dstPath )

		@log 'FILES', "getting files newer than '#{date}' from #{@server}:#{path}"
		date = new Date date
		@conn.connect()
		@conn.on 'connect', () =>
			@conn.auth @login, @pass, ( e ) =>
				throw e if e
				@log 'FTP', "connected to #{@server}"
				files = []
				@conn.list path, ( e, iter ) =>
					throw e if e
					iter.on 'entry', ( entry ) =>
						d = entry.date
						fileDate = new Date( d.year + '-' + d.month + '-' + d.date ).getTime()
						if @dateCompare fileDate, date && entry.type == '-'
							@log "FTP", "need to get #{entry.name}" if @opts.debug
							fo = {
								name:  path + '/' + entry.name,
								dst: dstPath + '/' + entry.name
							}

							files.push fo


					iter.on 'success', ( ) =>
						for file in files
							do ( file ) =>
								if @currentConn == 0
									@finished = ( ) =>
										@conn.end()
										@fn( files )

								@connLimit ( done ) =>
									@conn.get file.name, ( e, stream, tater ) =>
										console.log tater
										throw e if e
										if stream
											@log 'FTP', "fetching: #{file.name}" if @opts.debug
											stream.pipe Fs.createWriteStream( file.dst )
											stream.on 'error', ( error ) ->
												throw error if error
											stream.on 'success', ( ) =>
												@log 'FTP', "successfully wrote '#{file.dst}'" if @opts.debug
												done()

										else
											@log 'ERROR', "no stream for '#{file.name}'"
											done()

					iter.on 'error', ( e ) ->
						throw e if e


exports.MirrFtp = MirrFtp
