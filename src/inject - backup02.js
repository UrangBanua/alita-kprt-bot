function pretty(ob, lvl = 0) {

  let temp = [];

  if(typeof ob === "object"){
    for(let x in ob) {
      if(ob.hasOwnProperty(x)) {
        temp.push( getTabs(lvl+1) + x + ":" + pretty(ob[x], lvl+1) );
      }
    }
    return "{\n"+ temp.join(",\n") +"\n" + getTabs(lvl) + "}";
  }
  else {
    return ob;
  }

}

function getTabs(n) {
  let c = 0, res = "";
  while(c++ < n)
    res+="\t";
  return res;
}

WAPI.waitNewMessages(false, (data) => {
    //window.log(data)
    async data.forEach((message) => {
		message.labels = 'bot_api';
		await console.log(pretty(JSON.stringify(message)));
		await window.log(pretty(message));		
		
		
        //window.log(`Message from ${message.from.user} checking..`);
        window.log(`Message from ${message.sender.pushname} checking..`);
        if (intents.blocked.indexOf(message.from.user) >= 0) {
            window.log("number is blocked by BOT. no reply");
            return;
        }
        if (message.type == "chat") {
						
            //message.isGroupMsg to check if this is a group
            if (message.isGroupMsg == true && intents.appconfig.isGroupReply == false) {
                window.log("Message received in group and group reply is off. so will not take any actions.");
                return;
            }

            var exactMatch = await intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                //response = exactMatch.response;
                window.log(`Replying with ${exactMatch.response}`);
            } else {
                response = intents.noMatch;
                console.log("No exact match found");
            }
            var PartialMatch = await intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
			
			if (PartialMatch == undefined && exactMatch == undefined && message.isGroupMsg == false) {
			
				/////////////POST dialogflow personal///////////////
					await fetch('http://localhost:3000/dialogflow/autobot-252413', {
						method: 'post',
						body:    JSON.stringify(message),
						headers: { 'Content-Type': 'application/json' }
					})
					.then(res => res.json())
					.then(res => {
										window.log('PersonalRespon: ' + res.dfRespon);
										window.log('PersonalIntent: ' + res.dfIntent);
										if (res.dfRespon != "") {
											//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.dfRespon);
											response = '👩🏻 '+res.dfRespon;
											//WAPI.sendImage('foto', message.from._serialized, res.file);
										} else {
											//WAPI.sendMessage2(message.from._serialized, '👩🏻 hasil analisa dialog terkait ['+res.dfIntent+'], belum bisa saya respon untuk hal ini');
											response = '👩🏻 hasil analisa dialog terkait ['+res.dfIntent+'], belum bisa saya respon untuk hal ini';
										}
																			
								  }).catch((error) => {
										window.log("Error Webhook DF Personal ! :" + error);
								  });	 
				/////////////END POST dialogflow personal///////////
				
			} else if (PartialMatch == undefined && exactMatch == undefined && message.isGroupMsg == true) {
			
				/////////////POST dialogflow group///////////////
					await fetch('http://localhost:3000/dialogflow/autobot-252413', {
						method: 'post',
						body:    JSON.stringify(message),
						headers: { 'Content-Type': 'application/json' }
					})
					.then(res => res.json())
					.then(res => {
										window.log('GroupRespon: ' + res.dfRespon);
										window.log('GroupIntent: ' + res.dfIntent);
										//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.response);
										//WAPI.sendImage('foto', message.from._serialized, res.file);
																			
								  }).catch((error) => {
										window.log("Error Webhook DF Group ! :" + error);
								  });	 
				/////////////END POST dialogflow group///////////
				
			} else
			
            if (PartialMatch != undefined && PartialMatch.mode == "post") {
				message.content = 'post';
						window.log('Module: '+PartialMatch.module+', Mode:'+PartialMatch.mode+', Command:'+message.body.toLowerCase());
				/////////////POST///////////////
				await fetch(PartialMatch.response, {
					method: 'post',
					body:    JSON.stringify(message),
					headers: { 'Content-Type': 'application/json' }
				})
				.then(res => res.json())
				.then(res => {
									//WAPI.sendSeen(message.from._serialized);
									window.log(res.response);
									//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.response);
									response = '👩🏻 '+res.response;
									//WAPI.sendImage('foto', message.from._serialized, res.file);
									
									if ((res.file != undefined)) {
										window.getFile(res.file).then(base64Data => {
											//console.log(file);
											WAPI.sendImage(base64Data, message.from._serialized, res.file);
										}).catch((error) => {
											window.log("Error in sending file\n" + error);
										})
									}
									
							  }).catch((error) => {
									window.log("Error Webhook ! :" + error);
							  });	 
				/////////////END POST///////////
            } else if (PartialMatch != undefined && PartialMatch.mode == "get") {
						message.content = 'get';
						if (PartialMatch.module == 'HELP') {
						window.log('Module: '+PartialMatch.module+', Mode:'+PartialMatch.mode+', Command:'+message.body.toLowerCase());
						await fetch(PartialMatch.response + message.body.toLowerCase().replace('/',''))
						.then(res => res.json())
						.then(res => {
										//WAPI.sendSeen(message.from._serialized);
										console.log(res);
										//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.data.commands);
										response = '👩🏻 '+res.data.commands;
										//WAPI.sendImage('foto', message.from._serialized, res.file);
										
										if ((res.data.file != undefined)) {
											window.getFile(res.file).then(base64Data => {
												//console.log(file);
												WAPI.sendImage(base64Data, message.from._serialized, res.data.file);
											}).catch((error) => {
												window.log("Error in sending file\n" + error);
											})
										}
										
								  }).catch((error) => {
										window.log("Error Webhook ! :" + error);
								  });
						} else {
						window.log('Module: '+PartialMatch.module+', Mode:'+PartialMatch.mode+', Command:'+message.body.toLowerCase());
						await fetch(PartialMatch.response + message.body.toLowerCase().replace('/',''))
						.then(res => res.json())
						.then(res => {
										//WAPI.sendSeen(message.from._serialized);
										console.log(res);
										//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.data.result);
										response = '👩🏻 '+res.data.result;
										//WAPI.sendImage('foto', message.from._serialized, res.file);
										
										if ((res.data.file != undefined)) {
											window.getFile(res.file).then(base64Data => {
												//console.log(file);
												WAPI.sendImage(base64Data, message.from._serialized, res.data.file);
											}).catch((error) => {
												window.log("Error in sending file\n" + error);
											})
										}
										
								  }).catch((error) => {
										window.log("Error Webhook ! :" + error);
								  });
						}
			} else if (PartialMatch.module == 'GOMBAL') {
					//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+PartialMatch.response+' 🤗');
					window.log("GOMBAL message");
					response = '👩🏻 '+PartialMatch.response+' 🤗';
					//WAPI.ReplyMessageWithQuote(message.id, '👩🏻 '+PartialMatch.response+' 🤗');
			} else if (PartialMatch != undefined) {
				
                console.log("No partial match found");
            }
			
			// read message chat
			window.log("read message");
            await WAPI.sendSeen(message.from._serialized);
			
			// respon message chat
			window.log("response: " + response);			
            await WAPI.sendMessage2(message.from._serialized, response);
			
			console.log();
			
			console.log(message.id);
			window.log('-------------------------');
			window.log('');
					
					if ((exactMatch || PartialMatch).file != undefined) {
						window.getFile((exactMatch || PartialMatch).file).then((base64Data) => {
							console.log(file);
							WAPI.sendImage(base64Data, message.from._serialized, (exactMatch || PartialMatch).file);
						}).catch((error) => {
							window.log("Error in sending file\n" + error);
						})
					}
			
        } 	
		
    });
});

WAPI.addOptions = function () {
    var suggestions = "";
    intents.smartreply.suggestions.map((item) => {
        suggestions += `<button style="background-color: #eeeeee;
                                margin: 5px;
                                padding: 5px 10px;
                                font-size: inherit;
                                border-radius: 50px;" class="reply-options">${item}</button>`;
    });
    var div = document.createElement("DIV");
    div.style.height = "40px";
    div.style.textAlign = "center";
    div.style.zIndex = "5";
    div.innerHTML = suggestions;
    div.classList.add("grGJn");
    var mainDiv = document.querySelector("#main");
    var footer = document.querySelector("footer");
    footer.insertBefore(div, footer.firstChild);
    var suggestions = document.body.querySelectorAll(".reply-options");
    for (let i = 0; i < suggestions.length; i++) {
        const suggestion = suggestions[i];
        suggestion.addEventListener("click", (event) => {
            console.log(event.target.textContent);
            window.sendMessage(event.target.textContent).then(text => console.log(text));
        });
    }
    mainDiv.children[mainDiv.children.length - 5].querySelector("div > div div[tabindex]").scrollTop += 100;
}