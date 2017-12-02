
function init() {
  var url = document.domain;
  var socket = io.connect(url);
  var sId = '';
  function updateParticipants(mem) {
   $('#participants').html('');
   for (var i = 0; i < mem.length; i++) {
      $('#participants').append('<span id = \'' + mem[i].id + '\'>' +
        mem[i].name + ' ' + (mem[i].id === sId ? '(You)' : '') + '<br> </span>');
    }
  }

  socket.on('connect', function () {
    sId = socket.io.engine.id;
    console.log('Connected ' + sId);
    socket.emit('newUser', {id: sId, name: $('#name').val()});
  });

  socket.on('newConnection', function (data) {    
    updateParticipants(data.participants);
    $('#messages').prepend('<br> New user joined <hr>');
  });

  socket.on('userDisconnected', function(data) {
  	var name = data.name;
    $('#messages').prepend(name +'<br> has been disconnected<hr>');
    $('#' + data.id).remove();
  });

  socket.on('nameChanged', function (data) {
    $('#' + data.id).html(data.name + ' ' + (data.id === sId ? '(You)' : '') + '<br> ');
  });

  socket.on('incomingMessage', function (data) {
    var message = data.message;
    var name = data.name;
    $('#messages').prepend('<b>' + name + '</b><br>' + message + '<hr>');
  });

  socket.on('error', function (reason) {
    console.log('Unable to connect to server', reason);
  });

  function sendMsg() {
    var outgoingMessage = $('#outgoingMessage').val();
    var name = $('#name').val();
    $.ajax({
      url:  '/message',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({message: outgoingMessage, name: name})
    });
  }

  function msgKeyDown(event) {
    if (event.which == 13) {
      event.preventDefault();
      if ($('#outgoingMessage').val().trim().length <= 0) {
        return;
      }
      sendMsg();
      $('#outgoingMessage').val('');
    }
  }
  function msgKeyUp() {
    var outgoingMessageValue = $('#outgoingMessage').val();
    $('#send').attr('disabled', (outgoingMessageValue.trim()).length > 0 ? false : true);
  }

  function focusName() {
    var name = $('#name').val();
    socket.emit('nameChange', {id: sId, name: name});
  }

  $('#outgoingMessage').on('keydown', msgKeyDown);
  $('#outgoingMessage').on('keyup', msgKeyUp);
  $('#name').on('focusout', focusName);
  $('#send').on('click', sendMsg);

}

$(document).on('ready', init);