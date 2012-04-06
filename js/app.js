var firebase, Message, message, MessageList, messages;
firebase = new Firebase('http://gamma.firebase.com/populist/');
Message = Backbone.Model.extend({});
MessageList = Backbone.Collection.extend({
  model: Message
});
messages = new MessageList();
firebase.child('messages').on('child_added', function(snapshot) {
  messages.add(snapshot.val());
});