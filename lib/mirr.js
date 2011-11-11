var Colors, Fs, Mirr, Nconf, Table;

Nconf = require('nconf');

Fs = require('fs');

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
    ({
      log: function(msg) {
        return console.log(msg);
      }
    });
  }

  Mirr.prototype._save = function() {
    var _this = this;
    this.nconf.save(function(err) {});
    return Fs.readFile(this.config, function(err, data) {
      return console.dir(JSON.parse(data.toString()));
    });
  };

  Mirr.prototype._set = function(key, val) {
    return this.nconf.set(key, val);
  };

  Mirr.prototype.add = function(str) {
    var arch, parts;
    parts = str.split(':');
    arch = parts[2].split(',');
    this._set("" + parts[0] + ":url", parts[1]);
    this._set("" + parts[0] + ":arch", arch);
    this._set("" + parts[0] + ":packages", parts[3]);
    this._set("" + parts[0] + ":lastupdate", 'never');
    this._set("" + parts[0] + ":schedule", '30,1,*,*,*');
    this._set("" + parts[0] + ":active", parts[4]);
    return this._save();
  };

  Mirr.prototype._rm = function(key) {
    this.nconf.clear(key);
    return this._save();
  };

  Mirr.prototype.rm = function(key) {
    return this._rm(key);
  };

  Mirr.prototype.pretty = function(obj) {
    var active, arch, colWidths, head, last, pkgs, sch, table, url, ver;
    head = ['Release', 'URL', 'Sched', 'Arch(es)', 'Packages', 'Updated', 'Active'];
    colWidths = [16, 21, 15, 25, 10, 10, 10];
    table = new Table({
      head: head,
      colWidths: colWidths
    });
    obj = JSON.parse(obj.toString());
    for (ver in obj) {
      url = obj[ver].url;
      arch = obj[ver].arch.join(',');
      sch = obj[ver].schedule;
      pkgs = obj[ver].packages;
      last = obj[ver].lastupdate;
      active = obj[ver].active;
      table.push([ver, url, sch, arch, pkgs, last, active]);
    }
    return table;
  };

  Mirr.prototype.dump = function(fn) {
    return Fs.readFile(this.config, function(err, data) {
      return fn(err, data);
    });
  };

  Mirr.prototype.rand = function(max) {
    return Math.floor(Math.random() * max);
  };

  return Mirr;

})();

exports.Mirr = Mirr;
