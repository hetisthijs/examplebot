"use strict";
var Twit = require('twit');
var T = new Twit(require('./config.js'));

function startSearch() {
    T.get('statuses/user_timeline', {count: 100, screen_name: 'spamdatabase'}, function(error, data) {
        let since_id = 0;
        data.forEach(function (status) {
            if(status.id > since_id)
                since_id = status.id;
        });

        executeSearch('valse email', since_id);
        executeSearch('valse mail', since_id);
        //executeSearch('phishing email', since_id, 'nl');
        executeSearch('neppe email', since_id);
        executeSearch('nepmail', since_id);
        executeSearch('neppe mail', since_id);
    });
}

function executeSearch(q, since_id, locale) {
    let parameters = {q: q, count: 100, result_type: "recent", since_id: since_id};
    if (locale) {
        parameters['locale'] = locale;
    }
    T.get('search/tweets', parameters, function (error, data) {
        if (data) {
            data.statuses.forEach(function (status) { //for all statuses
                if (status.in_reply_to_status_id_str) { //probably answer from helpdesk, respond to original tweet!
                    sendTweet(status.in_reply_to_status_id_str);
                } else {
                    sendTweet(status.id_str);
                }
            });
        } else {
            console.log('There was an error with the search:', error);
        }
    });
}

function sendTweet(status_id) {
    T.get('statuses/show/'+status_id, {}, function (error, data) {
        if (data && data['user']['screen_name']) {
            let user = data.user.screen_name;
            T.post('statuses/update', {
                status: '@' + user + ' ' + getTweetText(),
                in_reply_to_status_id: status_id
            }, function (error, response) {
                if (response) {
                    console.log('Tweeted to '+user);
                }
                if (error) {
                    console.log('There was an error with Twitter:', error);
                }
            })
        } else {
            console.log('There was an error with status lookup:', error);
        }
    });
}

function getTweetText() {
    let text = [
        'Gelieve de valse mail door te sturen naar meld@spamdatabase.nl!',
        'Gelieve de valse mail door te sturen naar meld@spamdatabase.nl. Bedankt!',
        'Valse mail ontvangen? Stuur deze door naar meld@spamdatabase.nl!',
        'Spam mail ontvangen? Forward deze naar meld@spamdatabase.nl! Dank!'
        ];
    return text[Math.floor(Math.random() * text.length)];
}

startSearch();
setInterval(startSearch, 1000 * 60 * 60); //every hour repeat
