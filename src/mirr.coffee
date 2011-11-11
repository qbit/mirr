Nconf = require 'nconf'
Fs = require 'fs'
Cron = require 'cron'
Colors = require 'colors'
Table = require 'cli-table'

class Mirr
    constructor: ( ) ->
        @version = "0.1.0"
        @config = "#{__dirname}/../db/mirr.json"
        @nconf = Nconf
        @nconf.add 'file', { file: @config }

    log: ( msg ) ->
        console.log msg

    _save: ->
        @nconf.save ( err ) =>
            Fs.readFile @config, ( err, data ) =>
                throw err if err

    _set: ( key, val ) ->
        @nconf.set( key, val )

    reload: ( ) ->
        @_set( 'cmd', 'reload' )
        @_save()

    dump: ( fn ) ->
        Fs.readFile @config, ( err, data ) ->
            fn( err, JSON.parse data.toString() )

    add: ( str ) ->
        parts = str.split ':'
        arch = parts[2].split ','

        @_set "#{parts[0]}:server", parts[1]
        @_set "#{parts[0]}:arch", arch
        @_set "#{parts[0]}:packages", parts[3]
        @_set "#{parts[0]}:lastupdate", 'never'
        @_set "#{parts[0]}:schedule", '30,1,*,*,*'
        @_set "#{parts[0]}:active", parts[4]

        @_save()

    rmKey: ( key ) ->
        @nconf.clear( key )
        @_save()

    _restart: ( jobs, fn ) ->
        for j in jobs
            j.stop()
            delete j
        fn()

    pretty: ( obj ) ->
        head =
            [ 'Release', 'Server', 'Sched', 'Arch(es)', 'Packages', 'Updated', 'Active' ]

        colWidths=
            [ 16, 21, 15, 25, 10, 10, 10 ]

        table = new Table { head: head, colWidths: colWidths }

        for ver of obj
            server = obj[ver].server
            arch = obj[ver].arch.join( ',' )
            sch = obj[ver].schedule
            pkgs = obj[ver].packages
            last = obj[ver].lastupdate
            active = obj[ver].active

            table.push [ ver, server, sch, arch, pkgs, last, active ]

        return table

    rand: ( max ) ->
        return Math.floor( Math.random() * max )

exports.Mirr = Mirr
