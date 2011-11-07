#!/usr/bin/env coffee
MirrFtp = require '../lib/ftp'
Mirr = require '../lib/mirr'

mirr = new Mirr.Mirr()

opts = {
	queue_debug: true,
	debug: true,
	ftp_debug: true
}

mirrors = [ 'ftp.openbsd.org', 'obsd.cec.mtu.edu' ]
mirror = mirrors[ mirr.rand( mirrors.length ) ]

ftp = new MirrFtp.MirrFtp( mirror, 'anonymous', 'anonymous', opts )

ftp.getNewFiles '/pub/OpenBSD/snapshots/i386', '2011-10-01', ( list ) ->
	console.log list
