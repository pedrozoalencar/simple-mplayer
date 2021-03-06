/**
 * node-simple-mplayer
 * Javascript simple mplayer wrapper for Node.js
 *
 * @author Jonathan Blanchet (@jblanchefr)
 * Copyright 2012 Jonathan Blanchet @ Lab212.
 *
 * MIT License
 */

var exec = require('child_process').exec,
    events = require('events'),
    util = require('util');

module.exports = function Media(filename) {
    events.EventEmitter.call(this);
    this.filename = filename;
    this.params = {};
};

util.inherits(module.exports, events.EventEmitter);

module.exports.prototype.play = function (options) {
    this.stopped = false;
    var args = [this.filename]
      , argsString = '';

    for(var prop in options) {
        if(options.hasOwnProperty(prop)){
            args.unshift('-'+prop, options[prop] );
        }
    }

    args.forEach(function ( arg ) {
        argsString += ' ' + arg;
    });

    this.process = exec('mplayer' + argsString, {encoding: 'binary', maxBuffer: 5000*1024});
    this.process.on('exit', function (code, sig) {
        if (code !== null && sig === null) {
            this.emit('complete');
        }
    }.bind(this));
};

module.exports.prototype.download = function (params) {
    this.stopped = false;
    this.params = params;
    var addArgs = ''; 
    for ( prop in params.options ) {
        addArgs = addArgs + ' -' + prop + ' ' + params.options[prop];
    }


    var argString = 'mplayer -dumpstream ' + this.filename + ' -dumpfile ' + params.newfilename + addArgs;
    console.log('argString to exec: '+ argString);

    this.process = exec(argString, {encoding: 'binary', maxBuffer: 5000*1024});
    this.process.on('exit', function (code, sig) {
        console.log('code: '+ code);
        console.log('sig: '+ sig);
        if (code !== null && sig === null) {
            this.emit('complete', params);
        }
    }.bind(this));
};

module.exports.prototype.stop = function () {
    this.stopped = true;
    if(this.process){
        this.process.kill('SIGTERM');
    }
    this.emit('stop');
};
module.exports.prototype.pause = function () {
    if (this.stopped) return;
    if(this.process){
        this.process.kill('SIGSTOP');
    }
    this.emit('pause');
};
module.exports.prototype.resume = function () {
    if (this.stopped) return this.play();
    if(this.process){
        this.process.kill('SIGCONT');
    }
    this.emit('resume');
};