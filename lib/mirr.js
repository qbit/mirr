var Colors, Fs, Mirr, Nconf;
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
Nconf = require('nconf');
Fs = require('fs');
Colors = require('colors');
Mirr = (function() {
  function Mirr() {
    this.version = "0.1.0";
    this.config = "" + __dirname + "/../db/mirr.json";
    this.nconf = Nconf;
    this.nconf.add('file', {
      file: this.config
    });
  }
  Mirr.prototype.save = function() {
    return this.nconf.save(__bind(function(err) {
      return Fs.readFile(this.config, __bind(function(err, data) {
        return console.dir(JSON.parse(data.toString()));
      }, this));
    }, this));
  };
  Mirr.prototype.set = function(key, val) {
    return this.nconf.set(key, val);
  };
  Mirr.prototype.add = function(str) {
    var arch, parts;
    parts = str.split(':');
    arch = parts[2].split(',');
    this.set("" + parts[0] + ":url", parts[1]);
    this.set("" + parts[0] + ":arch", arch);
    this.set("" + parts[0] + ":packages", parts[3]);
    this.set("" + parts[0] + ":lastupdate", 'never');
    this.set("" + parts[0] + ":active", parts[4]);
    return this.save();
  };
  Mirr.prototype.rm = function(key) {
    this.nconf.clear(key);
    return this.save();
  };
  Mirr.prototype.pretty = function(obj) {
    var active, arch, last, output, pkgs, url, ver;
    output = '\nRelease\tURL\t\tArch(es)\tGet Packages\tLast Update\tActive\n'.bold;
    obj = JSON.parse(obj.toString());
    for (ver in obj) {
      url = obj[ver].url;
      arch = obj[ver].arch.join(', ');
      pkgs = obj[ver].packages;
      last = obj[ver].lastupdate;
      active = obj[ver].active;
      output = output + ("" + ver + "\t" + url + "\t" + arch + "\t" + pkgs + "\t\t" + last + "\t\t" + active + "\n");
    }
    return output;
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