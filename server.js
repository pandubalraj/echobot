var restify = require('restify');
var builder = require('botbuilder');
// var sourceFile = require('./sourceFile');

//luis ai app model for TATA SKY
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=3441c805-65b1-4cc0-8b5e-e6c92b747ca8&subscription-key=c9ad898006c6426d95251f015167aaa1&q=');
var dialog  = new builder.IntentDialog({ recognizers: [recognizer] });

// Get secrets from server environment
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
// // // Setup Restify Server
var server = restify.createServer();
// Handle Bot Framework messages
server.post('/api/messages', connector.listen());
// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port|| process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

var carRegNo;
var name;
var carModel;
var carCost;

// Create bot root dialog
bot.dialog('/', [
   function (session) {
    session.send("Welcome to Auto Insurance Bot !!!");
    builder.Prompts.text(session, "May I have your name please| Hi! What is your name ?");
   },
    function (session, results) {
    if (results.response) {
        name = results.response;
        session.send("Welcome %s...",name)
        session.send("Please answer following few questions, so we can quickly get a quote that suits you!");
        session.beginDialog('/getModel');
        }
    }
]);


bot.dialog('/getModel', [
    function (session) {
        builder.Prompts.choice(session, 'What is the model of you car?',["Audi","BWM","Maruti Suzuki","Porsche","Lexus","Ford","Honda","Hyundai","Tata"], {listStyle: builder.ListStyle["button"]});
    },
    function (session, results) {
        if (results.response) {
            carModel = results.response['entity'];
            // session.send("Wow !!! You have %s ... Its a nice car", carModel);
            session.beginDialog('/getCost');
        } else {
            session.send('Please prompt valid car model...');
            session.beginDialog('/getModel');
        }
    }
]);

bot.dialog('/getCost', [
    function (session, args) {
        builder.Prompts.number(session,'What is the price of your car?', {retryPrompt:"How much you spend on buying a car!"});
    },
    function (session, results) {
        if (results.response) {
            carCost =  results.response;
        }
        session.beginDialog('/getRegNo');
    }
]);

bot.dialog('/getRegNo', [
    function (session) {
        session.send("Please share your vehicle RTO number");
        session.send("Please find below sample image from which you can find your RTO number");
        var msg = new builder.Message(session)
            .attachments([{
                contentType: "image/jpeg",
                contentUrl: "http://www.team-bhp.com/forum/attachments/indian-car-scene/164039d1248451018t-high-security-registration-plates-hsrp-india-dsc_6975.jpg"
            }]);
        session.send(msg);
        builder.Prompts.number(session,'Your RTO number please...');
    },    
    function (session, results) {
        if (results.response) {
            carRegNo = results.response;
            session.beginDialog('/getClaim');
        }
    }
]);

bot.dialog('/getClaim', [
    function (session) {
        builder.Prompts.confirm(session,'Did you do any claim last year.');
    },    
    function (session, results) {
        if(results.response == 2 )
        {
        session.send('Good you have not claimed till now.')
        session.send('Find your details here \n\n Car Model: %s \n\n Cost of your Car: %s \n\n Car Reg No: %s',carModel,carCost,carRegNo);
        }
        else {
        session.send('Find your details here \n\n Car Model: %s \n\n Cost of your Car: %s \n\n Car Reg No: %s',carModel,carCost,carRegNo);
        }
    }
]);

