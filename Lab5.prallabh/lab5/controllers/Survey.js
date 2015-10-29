var format = require('util').format,
    Models = require('../lab5schema.js'),
    QuestionModel = Models.QuestionModel,
    OptionModel = Models.OptionModel,
    UserModel = Models.UserModel,
    AnswerModel = Models.AnswerModel;

module.exports = {
    name: "Survey",
    getEndpoints: function(req, res){

        var enpoints = [
            {
                "method": "GET",
                "url": "http://localhost:8008/question/{id}"
            },
            {
                "method": "POST",
                "url": "http://localhost:8008/question/{id}"
            },
            {
                "method": "DELETE",
                "url": "http://localhost:8008/question/{id}"
            },
            {
                "method": "POST",
                "url": "http://localhost:8008/user"
            },
            {
                "method": "HEAD",
                "url": "http://localhost:8008/user/{username}"
            },
            {
                "method": "PUT",
                "url": "http://localhost:8008/answer"
            }
        ];

        res.send(enpoints);

    },
    getQuestion: function(req, res){


        var qid = req.params.id;
        var user = req.query.username;
        
        var question = QuestionModel.find({});
        question = question.populate('options','id title')
                    .select("-__v")

        if(user){
            question = question.populate('answers','option option_text username');
        }else{
            question = question.select("-answers");
        }                        

        question.exec(function (err, questions) {

            if(err){
                throw err;
            }

            var response = {};


            // if questions exist
            if(questions.length){
                var questionObj = {};
             
                // if no question id is given
                // show the first question
                if(!qid){

                    questionObj._id = questions[0].id;
                    questionObj.title = questions[0].title;
                    questionObj.options = questions[0].options;

                    // if user exists
                    // find the users answer
                    // and add it to the response object                    
                    if(user){
                        
                        var answers = questions[0].answers;
                        
                        for (var i = 0; i < answers.length; i++) {
                            
                            if(user == answers[i].username){
                                questionObj.answer = answers[i];
                            }

                        }
                    }
                     
                    response.question = questionObj;
                    response.prev = null;

                    if(questions.length > 1){
                          response.next = "http://"+req.hostname+":8008/question/"+questions[1]._id;
                          //response.next = questions[1]._id;
                    }else{
                        response.next = null;
                    }

                }else{
                     
                    for (var i = 0; i < questions.length; i++) {
                        
                        if(questions[i]._id == qid){
                            
                            questionObj._id = questions[i].id;
                            questionObj.title = questions[i].title;
                            questionObj.options = questions[i].options;

                            // if user exists
                            // find the users answer
                            // and add it to the response object
                            if(user){
                                var answers = questions[i].answers;
                                
                                for (var j = 0; j < answers.length; j++) {
                                    
                                    if(user == answers[j].username){
                                        questionObj.answer = answers[j];
                                    }

                                }
                            }

                            // check if next index exists
                            if(i+1 < questions.length){
                                response.next = "http://"+req.hostname+":8008/question/"+questions[i+1]._id;
                               //response.next = questions[i+1]._id;
                            }else{
                                response.next = null;
                            }

                            response.question = questionObj;

                            if(i-1 > -1){
                                response.prev = "http://"+req.hostname+":8008/question/"+questions[i-1]._id;
                               // response.prev = questions[i-1]._id;
                            }else{
                                response.prev = null;
                            }
                            break;
                        }
                    
                    }    
                }

            }

            if(user){
                
                if(response.next != null){
                    response.next = response.next+"?username="+user;
                }
                if(response.prev != null){
                    response.prev = response.prev+"?username="+user;
                }    
            }
            

            if(Object.keys(response).length){
                res.send(response);    
            }else{
                res.status(404).send({"msg":"Not found"});
            }            

        });

    },
    postQuestion: function(req, res){

        // check for application json content type
        if(req.headers["content-type"] != 'application/json'){

            res.status(400).send({"msg": "Bad Request! Requires application/json content type."});

            return false;

        }

        var title = req.body.title;
        var options = req.body.options;
        var count = 0;
        var optionIdArr = [];

        // loop through all the options first and save them
        options.forEach(function (item) {

            var option = new OptionModel(item);
                    
            option.save(function(err) {                
                if(err){
                    throw err;
                }

                count++;

                optionIdArr.push(option._id); // keep track of the option ids
                
                // if lengths are equal
                // proceed to saving the question
                if (count === options.length) {

                    var question = new QuestionModel({
                        title: title,
                        options: optionIdArr
                    });

                    // save question model
                    // with all the options
                    question.save(function(err) {

                        if(err){
                            throw err;
                        }

                        res.send({"msg":"Question submitted successfully"});

                    });
                }

            });
        });

    },
    headUser: function(req, res){

        var username = req.params.username;

        // check for existing user with the same name
        UserModel.find({"username" : username}, function (err, users) {

            if(users.length){
                res.status(200).send();
            }else{
                res.status(404).send();
            }

        });

    },
    postUser: function(req, res){

        var username = req.params.username;

        // check for existing user with the same name
        UserModel.find({"username" : username}, function (err, users) {

            if(users.length){
                res.send({"msg":"User already exists"});
            }else{
                
                // create the user
                var user = new UserModel({username: username});
                user.save(function(err) {

                    if(err){
                        throw err;
                    }

                    res.status(201).send({"msg":"User created successfully"});

                });

            }

        }); // user model

    },
    putAnswer: function(req, res){
        
        var aid = req.body.answer;
        var username = req.body.username;
        var qid = req.body.question;

        if(aid && username && qid){

            // check whether question exists
            QuestionModel.findOne({"_id": qid}, function (err, question) {

                if(err){
                    throw err;
                }

                if(question != null){

                    // check if option exists
                    OptionModel.findOne({"_id": aid}, function (err, option) {
                        if(err){
                            throw err;
                        }

                        if(option != null){

                            // check if user exists
                            UserModel.findOne({"username" : username}, function (err, user) {

                                if(err){
                                    throw err;
                                }

                                if(user != null){

                                    var answerObj = {
                                        user: user._id,
                                        username: user.username,
                                        option: aid,
                                        option_text: option.title,
                                        question: qid
                                    }

                                    // find the answer
                                    AnswerModel.findOne({ $and: [ { question: qid }, { user: user._id } ] }, function (err, object) {

                                                if(err){
                                                    throw err;
                                                }
                                                
                                                // if answer record exists
                                                // update the answer
                                                if(object != null){

                                                    // associate it
                                                    addToQuestion(question, object, res, aid);
                                                   
                                                }else{
                                                        
                                                    // create a new answer
                                                    var answer = new AnswerModel(answerObj);
                                                    answer.save(function (err) {

                                                        // associate it
                                                        addToQuestion(question, answer, res, aid);

                                                    });

                                                }

                                            });

                                }else{
                                
                                    res.status(400).send("User does not exist");
                                }

                            }); // user model

                        }else{
                            res.status(400).send("Option does not exist");
                        }

                    }); // option model


                }else{

                    res.status(400).send("Question does not exist");

                }

            }); // user model

        }else{
            res.status(400).send({"msg":"Bad request. Some required parameters are missing"});
        }

    },
    getMatches: function(req, res){

        var username = req.params.username;
        var matches = [];

        // check if username is part of the request
        if(username){

            // get all the answers for the given user
            AnswerModel.find({"username": username})
                .exec(function (err, userAnswers) {

                    if(err){
                        throw err;
                    }

                    // if no answer found, send empty matches
                    if(userAnswers.length < 1){
                        res.status(400)
                            .send(matches);
                    
                    }else{

                        // find all the answers by other users
                        AnswerModel.find({username: {$nin: [username]}})
                            .exec(function (err, answers) {

                                if(err){
                                    throw err;
                                }

                                var answersObj = [];

                                // go through all the users
                                for (var i = 0; i < userAnswers.length; i++) {
                                    
                                    for (var j = 0; j < answers.length; j++) {
                                        var matchFound = false;
                                        if(userAnswers[i].option_text == answers[j].option_text){

                                            // increment the count if doesn't exist
                                            for(var k = 0; k < answersObj.length; k++){
                                                if(answersObj[k].name == answers[j].username){
                                                    answersObj[k].cnt++;
                                                    matchFound = true;
                                                    break;
                                                }
                                            }
                                            if(!matchFound){
                                                answersObj[answersObj.length] 
                                                = {
                                                    "name":answers[j].username,
                                                    "cnt":"1"
                                                };
                                            }                                                                          
                                                                                                                                  
                                        }

                                    } // answers for end
                                    
                                } // user answers for end

                                res.send(answersObj);

                            });

                    }

                });
            

        }else{
            res.status(404)
                .send({"msg":"Not found"});
        }
    },
    deleteQuestion: function(req, res){
        var qid = req.params.id;

        if(qid){

            QuestionModel.findOne({'_id': qid})
                .exec(function (err, question) {
                    if(err){
                        throw err;
                    }

                    // question exists
                    if(question != null){

                        question.pre('remove', function(next) {

                            AnswerModel.find({'question': question.id})
                                .exec(function (err, answers) {
                                    
                                    var count = 0;

                                    if(answers.length){

                                        // remove all answers by looping through
                                        // answers object and removing
                                        answers.forEach( function (answer) {

                                            AnswerModel.find({'_id': answer._id}).remove(function(err){

                                                count++;
                                        
                                                // if lengths are equal
                                                // proceed to saving the question
                                                if (count === answers.length) {

                                                    next();

                                                }

                                            });
                                            
                                        });

                                    }else{
                                        next();
                                    }

                                });

                        });

                        question.remove(function (err) {
                           
                            if(err){
                                throw err;
                            }

                            res.send({"msg":"Question deleted successfully"});

                        });

                    }else{

                        res.status(400).send({"msg":"No question found"});

                    }

                });

        }else{
            res.status(400).send({"msg":"Bad request. Question id missing"});
        }

    }
}


var addToQuestion = function(question, object, res, option_id){
    
    // add answer to the question
    var answers = question.answers;
    answerIndex = answers.indexOf(object._id);

    OptionModel.findOne({"_id": option_id}, function (err, opt) {
        if(err){
            throw err;
        }     

        object.option = option_id;
        object.option_text = opt.title;
        object.markModified('option_text');

        object.save(function (err) {
            if(err){
                throw err;
            }       
        
            if(answerIndex > -1){
                answers[answerIndex] = object._id;
            }else{
                answers.push(object._id);
            }

            question.answers = answers;    
            question.markModified('answers');
            question.save( function (err) {
                if(err){
                    throw err;
                }

                res.send({"mgs":"Answer added/updated successfully"});
            });

        });

    });   

}