import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import * as io from 'socket.io-client';

@Component({
    templateUrl: '/app/home/index.component.html',
    styleUrls: ['app/home/index.component.css'],
    directives: [ROUTER_DIRECTIVES]
})
export class WelcomeComponent {
    public pageTitle: string = 'Welcome';

    socket = null;

    constructor(){
        this.socket = io.connect('http://localhost:3000');
        // on every message received
        this.socket.on('notification', function (data) {
            this.messages.push({
                "subject":data.subject,
                "body":data.body,
                "from":data.from[0].address,
                "tags":data.tags
            });
            this.selectMessage(this.messages.length-1);
        }.bind(this));
    }

    latest = {
        "subject":"Subject",
        "body":"Body",
        "from":"From",
        "tags":[
            "a",
            "b",
            "c"
        ]
    }

    messages = []

    selectMessage = function(i){
        this.latest = this.messages[i];
    }
}