widget = {
  //runs when we receive data from the job
  onData: function (el, data) {
    window.socketio = data.url;
  }
};