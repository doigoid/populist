var firebase, Message, Messages, messages, User, Users, users;
firebase = new Firebase('http://gamma.firebase.com/populist/');
Message = Backbone.Model.extend({});
Messages = Backbone.Collection.extend({
  model: Message
});
User = Backbone.Model.extend({});
Users = Backbone.Collection.extend({
  model: User
});
users = new Users();
messages = new Messages();

firebase.child('messages').on('child_added', function(snapshot) {
  message = snapshot.val();
  message._id = snapshot.name();
  messages.add(message);
});
firebase.child('messages').on('child_removed', function(snapshot) {
  messages.remove(messages.where({_id: snapshot.name()}));
});    
