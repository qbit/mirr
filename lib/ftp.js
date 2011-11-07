var Fs, Ftp, MirrFtp, Path;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Ftp = require('ftp');
Fs = require('fs');
Path = require('path');
MirrFtp = (function() {
  function MirrFtp(server, login, pass, opts, fn) {
    this.server = server;
    this.login = login;
    this.pass = pass;
    this.opts = opts;
    this.fn = fn;
    this.getNewFiles = __bind(this.getNewFiles, this);
    this.connLimit = __bind(this.connLimit, this);
    this.processPending = __bind(this.processPending, this);
    this.conn = new Ftp({
      host: this.server,
      debug: __bind(function(msg) {
        if (this.opts.ftp_debug) {
          return console.log("FTP VERBOSE: " + msg);
        }
      }, this)
    });
    this.pending = [];
    this.maxConn = this.opts.maxConn || 1;
    this.finished = null;
    this.currentConn = 0;
  }
  MirrFtp.prototype.log = function(type, msg) {
    if (this.opts.debug) {
      return console.log(type + ': ' + msg);
    }
  };
  MirrFtp.prototype.mkdir = function(paths) {
    var count, parts, path, previousPath, _i, _len, _results;
    paths = paths.replace(/\/src|\/lib/, '');
    parts = paths.split('/');
    parts[0] = '/';
    previousPath = '';
    count = 0;
    _results = [];
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      path = parts[_i];
      _results.push((function(path) {
        return Path.exists(previousPath, function(exists) {
          if (count < 2) {
            previousPath = previousPath + path;
          } else {
            previousPath = previousPath + '/' + path;
          }
          count++;
          if (!exists) {
            return Fs.mkdir(previousPath, 0755);
          }
        });
      })(path));
    }
    return _results;
  };
  MirrFtp.prototype.processPending = function() {
    var fn;
    if (this.pending.length > 0) {
      if (this.opts.queue_debug) {
        this.log('QUEUE', "jobs pending: " + this.pending.length);
      }
      fn = this.pending.shift();
      this.currentConn++;
      return fn((__bind(function() {
        this.currentConn--;
        return process.nextTick(this.processPending);
      }, this)));
    } else {
      if (this.opts.queue_debug) {
        this.log('QUEUE', "no pending jobs");
      }
      return this.finished();
    }
  };
  MirrFtp.prototype.connLimit = function(fn) {
    if (this.currentConn < this.maxConn) {
      this.currentConn++;
      return fn((__bind(function() {
        this.currentConn--;
        return process.nextTick(this.processPending);
      }, this)));
    } else {
      return this.pending.push(fn);
    }
  };
  MirrFtp.prototype.dateCompare = function(date1, date2) {
    if (date1 > date2) {
      return true;
    }
    if (date1 < date2) {
      return false;
    }
  };
  MirrFtp.prototype.getNewFiles = function(path, date) {
    var dstPath;
    dstPath = __dirname + '/public' + path;
    dstPath = dstPath.replace(/\/src|\/lib/, '');
    this.mkdir(dstPath);
    this.log('FILES', "getting files newer than '" + date + "' from " + this.server + ":" + path);
    date = new Date(date);
    this.conn.connect();
    return this.conn.on('connect', __bind(function() {
      return this.conn.auth(this.login, this.pass, __bind(function(e) {
        var files;
        if (e) {
          throw e;
        }
        this.log('FTP', "connected to " + this.server);
        files = [];
        return this.conn.list(path, __bind(function(e, iter) {
          if (e) {
            throw e;
          }
          iter.on('entry', __bind(function(entry) {
            var d, fileDate, fo;
            d = entry.date;
            fileDate = new Date(d.year + '-' + d.month + '-' + d.date).getTime();
            if (this.dateCompare(fileDate, date && entry.type === '-')) {
              if (this.opts.debug) {
                this.log("FTP", "need to get " + entry.name);
              }
              fo = {
                name: path + '/' + entry.name,
                dst: dstPath + '/' + entry.name
              };
              return files.push(fo);
            }
          }, this));
          iter.on('success', __bind(function() {
            var file, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push(__bind(function(file) {
                if (this.currentConn === 0) {
                  this.finished = __bind(function() {
                    this.conn.end();
                    return this.fn(files);
                  }, this);
                }
                return this.connLimit(__bind(function(done) {
                  return this.conn.get(file.name, __bind(function(e, stream, tater) {
                    console.log(tater);
                    if (e) {
                      throw e;
                    }
                    if (stream) {
                      if (this.opts.debug) {
                        this.log('FTP', "fetching: " + file.name);
                      }
                      stream.pipe(Fs.createWriteStream(file.dst));
                      stream.on('error', function(error) {
                        if (error) {
                          throw error;
                        }
                      });
                      return stream.on('success', __bind(function() {
                        if (this.opts.debug) {
                          this.log('FTP', "successfully wrote '" + file.dst + "'");
                        }
                        return done();
                      }, this));
                    } else {
                      this.log('ERROR', "no stream for '" + file.name + "'");
                      return done();
                    }
                  }, this));
                }, this));
              }, this)(file));
            }
            return _results;
          }, this));
          return iter.on('error', function(e) {
            if (e) {
              throw e;
            }
          });
        }, this));
      }, this));
    }, this));
  };
  return MirrFtp;
})();
exports.MirrFtp = MirrFtp;