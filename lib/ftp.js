var Fs, Ftp, MirrFtp, Path;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Ftp = require('ftp');

Fs = require('fs');

Path = require('path');

MirrFtp = (function() {

  function MirrFtp(server, login, pass, opts, fn) {
    var _this = this;
    this.server = server;
    this.login = login;
    this.pass = pass;
    this.opts = opts;
    this.fn = fn;
    this.getNewFiles = __bind(this.getNewFiles, this);
    this.connLimit = __bind(this.connLimit, this);
    this.processPending = __bind(this.processPending, this);
    this.opts = this.opts || {};
    this.conn = new Ftp({
      host: this.server,
      debug: function(msg) {
        if (_this.opts.ftp_debug) return console.log("FTP VERBOSE: " + msg);
      }
    });
    this.filePending = [];
    this.maxConn = this.opts.maxConn || 1;
    this.finished = null;
    this.currentConn = 0;
  }

  MirrFtp.prototype.log = function(type, msg) {
    if (this.opts.debug) return console.log(type + ': ' + msg);
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
          if (!exists) return Fs.mkdir(previousPath, 0755);
        });
      })(path));
    }
    return _results;
  };

  MirrFtp.prototype.processPending = function() {
    var fn;
    var _this = this;
    if (this.filePending.length > 0) {
      if (this.opts.queue_debug) {
        this.log('QUEUE', "jobs pending: " + this.filePending.length);
      }
      fn = this.filePending.shift();
      this.currentConn++;
      return fn((function() {
        _this.currentConn--;
        return process.nextTick(_this.processPending);
      }));
    } else {
      if (this.opts.queue_debug) this.log('QUEUE', "no pending jobs");
      return this.finished();
    }
  };

  MirrFtp.prototype.connLimit = function(fn) {
    var _this = this;
    if (this.currentConn < this.maxConn) {
      this.currentConn++;
      return fn((function() {
        _this.currentConn--;
        return process.nextTick(_this.processPending);
      }));
    } else {
      return this.filePending.push(fn);
    }
  };

  MirrFtp.prototype.dateCompare = function(date1, date2) {
    if (date1 > date2) return true;
    if (date1 < date2) return false;
  };

  MirrFtp.prototype.getNewFiles = function(path, date, cb) {
    var d, dstPath;
    var _this = this;
    if (date === 'never') date = new Date();
    if (date === 'never') {
      d = new Date().getTime();
      date = new Date(d - 60480000).toGMTString();
    }
    dstPath = __dirname + '/public' + path;
    dstPath = dstPath.replace(/\/src|\/lib/, '');
    this.mkdir(dstPath);
    this.log('FILES', "getting files newer than '" + date + "' from " + this.server + ":" + path);
    date = new Date(date);
    this.conn.connect();
    return this.conn.on('connect', function() {
      return _this.conn.auth(_this.login, _this.pass, function(e) {
        var files;
        if (e) throw e;
        _this.log('FTP', "connected to " + _this.server);
        files = [];
        return _this.conn.list(path, function(e, iter) {
          if (e) throw e;
          iter.on('entry', function(entry) {
            var fileDate, fo;
            d = entry.date;
            fileDate = new Date(d.year + '-' + d.month + '-' + d.date).getTime();
            if (_this.dateCompare(fileDate, date && entry.type === '-')) {
              if (_this.opts.debug) _this.log("FTP", "need to get " + entry.name);
              fo = {
                name: path + '/' + entry.name,
                date: fileDate,
                dst: dstPath + '/' + entry.name
              };
              return files.push(fo);
            }
          });
          iter.on('success', function() {
            var file, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = files.length; _i < _len; _i++) {
              file = files[_i];
              _results.push((function(file) {
                if (_this.currentConn === 0) {
                  _this.finished = function() {
                    _this.conn.end();
                    return cb(files);
                  };
                }
                return _this.connLimit(function(done) {
                  return _this.conn.get(file.name, function(e, stream) {
                    if (e) throw e;
                    if (stream) {
                      if (_this.opts.debug) {
                        _this.log('FTP', "fetching: " + file.name);
                      }
                      stream.pipe(Fs.createWriteStream(file.dst));
                      stream.on('error', function(error) {
                        if (error) throw error;
                      });
                      return stream.on('success', function() {
                        if (_this.opts.debug) {
                          _this.log('FTP', "successfully wrote '" + file.dst + "'");
                        }
                        return done();
                      });
                    } else {
                      _this.log('ERROR', "no stream for '" + file.name + "'");
                      return done();
                    }
                  });
                });
              })(file));
            }
            return _results;
          });
          return iter.on('error', function(e) {
            if (e) throw e;
          });
        });
      });
    });
  };

  return MirrFtp;

})();

exports.MirrFtp = MirrFtp;
