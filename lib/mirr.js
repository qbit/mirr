var Colors, Fs, Mirr, Nconf;
Nconf = require('nconf');
Fs = require('fs');
Colors = require('colors');
Mirr = (function() {
  function Mirr() {
    this.version = "0.1.0";
    this.config = "" + __dirname + "/../db/mirr.json";
    Nconf.add('file', {
      file: this.config
    });
  }
  Mirr.prototype.save = function() {
    return Nconf.save(function(err) {
      if (err) {
        throw err;
      }
    });
  };
  Mirr.prototype.add = function(key, val) {
    return Nconf.set(key, val);
  };
  Mirr.prototype.rm = function(key) {
    return Nconf.clear(key);
  };
  Mirr.prototype.get = function(key) {
    return Nconf.get(key);
  };
  Mirr.prototype.pretty = function(obj) {
    var active, arch, last, output, pkgs, url, ver;
    output = '\nVersion\tArch(es)\tGet Packages\tLast Update\tActive\n'.bold;
    obj = JSON.parse(obj.toString());
    for (ver in obj) {
      if (obj[ver]) {
        url = obj[ver].url;
        arch = obj[ver].arch.join(', ');
        pkgs = obj[ver].packages;
        last = obj[ver].lastupdate;
        active = obj[ver].active;
        output = output + ("" + ver + "\t" + arch + "\t" + pkgs + "\t\t" + last + "\t" + active + "\n");
      }
    }
    return output;
  };
  Mirr.prototype.dump = function(fn) {
    return Fs.readFile(this.config, function(err, data) {
      return fn(err, data);
    });
  };
  Mirr.prototype.add = function() {};
  Mirr.prototype.rand = function(max) {
    return Math.floor(Math.random() * max);
  };
  return Mirr;
})();
exports.Mirr = Mirr;