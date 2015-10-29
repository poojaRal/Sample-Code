var mongoose = require('mongoose'),
    format = require('util').format,
    Models = require('./lab5schema.js'),
    QuestionModel = Models.QuestionModel,
    OptionModel = Models.OptionModel,
    UserModel = Models.UserModel,
    AnswerModel = Models.AnswerModel;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;

var LINE_SIZE = 120;

console.log("Connecting to " + host + ":" + port);
var mongoose = require('mongoose');
var conn = mongoose.connect('mongodb://localhost/rbparekh_prallabh_lab5');

console.log("Connected!");
console.log("Clearing existing collections");

OptionModel.remove(function(err) {

    if (err) {
        mongoose.disconnect();
        throw err;
    }

    UserModel.remove(function(err) {
        if (err) {
            mongoose.disconnect();
            throw err;
        }

        AnswerModel.remove(function(err) {

            if (err) {
                mongoose.disconnect();
                throw err;
            }

            QuestionModel.remove(function(err) {
                
                if (err) {
                    mongoose.disconnect();
                    throw err;
                }


                var users = ["rahul","pooja"];

                var counter = 0;
                users.forEach( function(user) {

                    var newUser = new UserModel({"username": user })
                    newUser.save(function (err, user) {
                        if(err){
                            throw err;
                            mongoose.disconnect();
                        }

                        counter++;

                        if(users.length == counter){

                            var options = ["Lancelot","Arthur","Guineviere"];

                            var count = 0, optionArr = [];
                            options.forEach( function(option) {

                                var newOption = new OptionModel({"title": option })
                                newOption.save(function (err, option) {
                                    if(err){
                                        throw err;
                                        mongoose.disconnect();
                                    }

                                    count++;

                                    optionArr.push(option._id);

                                    if(options.length == count){

                                        var question = new QuestionModel({"title":"What is your name?",options:optionArr});
                                        question.save(function(err){
                                            
                                            if(err){
                                                throw err;
                                            }

                                            var options = ["To find the Grail","To slay the rabbit","To find the Knights who say Ni!"];

                                            var counter2 = 0, optionArr = [];
                                            options.forEach( function(option) {

                                                var newOption = new OptionModel({"title": option })
                                                newOption.save(function (err, option) {
                                                    if(err){
                                                        throw err;
                                                        mongoose.disconnect();
                                                    }

                                                    counter2++;

                                                    optionArr.push(option._id);

                                                    if(options.length == counter2){

                                                        var question = new QuestionModel({"title":"What is your quest?",options:optionArr});
                                                        question.save(function(err){
                                                            
                                                            if(err){
                                                                throw err;
                                                            }

                                                            mongoose.disconnect();

                                                        })
                                                    }

                                                });

                                            });

                                        });

                                    }

                                });

                            });

                        }

                    });

                });

            }); // Questions Model

        }); // Answers Model

    }); // Users Model

}); // Options Model