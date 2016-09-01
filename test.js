var inbox = require("inbox");
var client = inbox.createConnection(false, "imap.gmail.com", {
    secureConnection: true,
    auth:{
        user: "groupama@slamby.com",
        pass: "Hello99!"
    }
});
client.connect();
client.on("connect", function(){
    client.openMailbox("INBOX", function(error, info){
        if(error) throw error;
        console.log("Message count in INBOX: " + info.count);
    });
});