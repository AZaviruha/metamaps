function SocketIoConnection(config) {
    this.connection = io.connect(config.url, config.socketio);
}

SocketIoConnection.prototype.on = function (ev, fn) {
    this.connection.on(ev, fn);
};

SocketIoConnection.prototype.emit = function () {
    this.connection.emit.apply(this.connection, arguments);
};

SocketIoConnection.prototype.removeAllListeners = function () {
    this.connection.removeAllListeners();
};

SocketIoConnection.prototype.getSessionid = function () {
    return this.connection.socket.sessionid;
};

SocketIoConnection.prototype.disconnect = function () {
    return this.connection.disconnect();
};