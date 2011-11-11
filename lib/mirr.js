var Colors, Cron, Fs, Mirr, Nconf, Table;

Nconf = require('nconf');

Fs = require('fs');

Cron = require('cron');

Colors = require('colors');

Table = require('cli-table');

Mirr = (function() {

  function Mirr() {
    this.version = "0.1.0";
    this.config = "" + __dirname + "/../db/mirr.json";
    this.nconf = Nconf;
    this.nconf.add('file', {
      file: this.config
    });
  }

  Mirr.prototype.log = function(msg) {
    return console.log(msg);
  };

  Mirr.prototype._save = function() {
    var _this = this;
    return this.nconf.save(function(err) {
      return Fs.readFile(_this.config, function(err, data) {
        if (err) throw err;
      });
    });
  };

  Mirr.prototype._set = function(key, val) {
    return this.nconf.set(key, val);
  };

  Mirr.prototype.reload = function() {
    this._set('cmd', 'reload');
    return this._save();
  };

  Mirr.prototype.dump = function(fn) {
    return Fs.readFile(this.config, function(err, data) {
      return fn(err, JSON.parse(data.toString()));
    });
  };

  Mirr.prototype.add = function(str) {
    var arch, parts;
    parts = str.split(':');
    arch = parts[2].split(',');
    this._set("" + parts[0] + ":server", parts[1]);
    this._set("" + parts[0] + ":arch", arch);
    this._set("" + parts[0] + ":packages", parts[3]);
    this._set("" + parts[0] + ":lastupdate", 'never');
    this._set("" + parts[0] + ":schedule", '30,1,*,*,*');
    this._set("" + parts[0] + ":active", parts[4]);
    return this._save();
  };

  Mirr.prototype.rmKey = function(key) {
    this.nconf.clear(key);
    return this._save();
  };

  Mirr.prototype._restart = function(jobs, fn) {
    var j, _i, _len;
    for (_i = 0, _len = jobs.length; _i < _len; _i++) {
      j = jobs[_i];
      j.stop();
      delete j;
    }
    return fn();
  };

  Mirr.prototype.pretty = function(obj) {
    var active, arch, colWidths, head, last, pkgs, sch, server, table, ver;
    head = ['Release', 'Server', 'Sched', 'Arch(es)', 'Packages', 'Updated', 'Active'];
    colWidths = [16, 21, 15, 25, 10, 10, 10];
    table = new Table({
      head: head,
      colWidths: colWidths
    });
    for (ver in obj) {
      server = obj[ver].server;
      arch = obj[ver].arch.join(',');
      sch = obj[ver].schedule;
      pkgs = obj[ver].packages;
      last = obj[ver].lastupdate;
      active = obj[ver].active;
      table.push([ver, server, sch, arch, pkgs, last, active]);
    }
    return table;
  };

  Mirr.prototype.rand = function(max) {
    return Math.floor(Math.random() * max);
  };

  return Mirr;

})();

exports.Mirr = Mirr;
