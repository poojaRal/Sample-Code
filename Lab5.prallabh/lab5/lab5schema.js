var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
  title:  { type: String, required: true },
  options: [{ type: Schema.ObjectId, ref: 'Option' }],
  answers: [{ type: Schema.ObjectId, ref: 'Answer' }]
});

var optionSchema = new Schema({
    "title": String
});

var userSchema = new Schema({
    "username": String
});

var answerSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    username: String,
    option: { type: Schema.ObjectId, ref: 'Option' },
    question: { type: Schema.ObjectId, ref: 'Question' },
    option_text: String
});

var Question = mongoose.model('Question', questionSchema);
var Option = mongoose.model('Option', optionSchema);
var User = mongoose.model('User', userSchema);
var Answer = mongoose.model('Answer', answerSchema);

// export the models
module.exports = {
  "QuestionModel": Question,
  "OptionModel": Option,
  "UserModel": User,
  "AnswerModel": Answer
}