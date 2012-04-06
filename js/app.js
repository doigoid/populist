var firebase, Message, message, MessageList, messages;
firebase = new Firebase('http://gamma.firebase.com/populist/');
Message = Backbone.Model.extend({});
MessageList = Backbone.Collection.extend({
  model: Message
});
messages = new MessageList();
firebase.child('messages').on('child_added', function(snapshot) {
  message = snapshot.val();
  message.id = snapshot.name();
  messages.add(message);
});
firebase.child('messages').on('child_removed', function(snapshot) {
  messages.remove(messages.where({id: snapshot.name()}));
});