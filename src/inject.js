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
    data.forEach((message) => {
		message.labels = 'bot_api';
		console.log(pretty(JSON.stringify(message)));
		window.log(pretty(message));
        /* fetch(intents.appconfig.webhook, {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify(message),
        }).then((resp) => resp.json()).then(data => (function (data) {
            //response/data received from server
            window.log(data);
            WAPI.sendSeen(message.from._serialized);
            //replying to the user based on data
            WAPI.sendMessage2(message.from._serialized, data.response);
            //sending files if there is any 
            if (data.files.length > 0) {
                data.files.forEach((file) => {
                    WAPI.sendImage(file.file, data.From, file.name);
                })
            } 
        }).catch(function (error) {
            window.log(error);
        }); */
		
		
		/* function postData(data) {
            //response/data received from server
            console.log(data);
            WAPI.sendSeen(message.from._serialized);
            //replying to the user based on data
            WAPI.sendMessage2(message.from._serialized, data.value[0].response);
            //sending files if there is any 
            if (data.value[0].file.length > 0) {
                data.value[0].file.forEach((file) => {
                    WAPI.sendImage(file.file, message.from._serialized, file.name);
                })
            } 
        }).catch(function (error) {
            console.log(error);
        }); */
		
		/* var jMessage = {
			id: message.id._serialized,
			body: message.body,
			type: message.type,
			t: message.t,
			notifyName: message.notifyName,
			from: message.from,
			to: message.to,
			self: message.self,
			ack: message.ack,
			invis: message.invis,
			isNewMsg: message.,
			star: message.,
			recvFresh: message.,
			broadcast: message.,
			mentionedJidList: '',
			isForwarded: message.,
			labels: message.,
			sender: '',
			timestamp: message.,
			content: message.,
			isGroupMsg: message.,
			isMMS: message.,
			isMedia: message.,
			isNotification: message.,
			isPSA: message.,
			chat: '',
			chatId: message.,
			quotedMsgObj: '',
			mediaData: ''
		} */
		
		
		
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

            var exactMatch = intents.bot.find(obj => obj.exact.find(ex => ex == message.body.toLowerCase()));
            var response = "";
            if (exactMatch != undefined) {
                response = exactMatch.response;
                window.log(`Replying with ${exactMatch.response}`);
            } else {
                response = intents.noMatch;
                console.log("No exact match found");
            }
            var PartialMatch = intents.bot.find(obj => obj.contains.find(ex => message.body.toLowerCase().search(ex) > -1));
			
			if (PartialMatch == undefined && exactMatch == undefined) {
			
				/////////////POST dialogflow///////////////
					fetch('http://localhost:3000/dialogflow/autobot-252413', {
						method: 'post',
						body:    JSON.stringify(message),
						headers: { 'Content-Type': 'application/json' }
					})
					.then(res => res.json())
					.then(res => {
										//WAPI.sendSeen(message.from._serialized);
										window.log(res.dfRespon);
										//WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.response);
										//WAPI.sendImage('foto', message.from._serialized, res.file);
																			
								  }).catch((error) => {
										window.log("Error Webhook ! :" + error);
								  });	 
				/////////////END POST dialogflow///////////
				
			} else	
			
            if (PartialMatch != undefined && PartialMatch.mode == "post") {
				message.content = 'post';
						window.log('Module: '+PartialMatch.module+', Mode:'+PartialMatch.mode+', Command:'+message.body.toLowerCase());
				/////////////POST///////////////
				fetch(PartialMatch.response, {
					method: 'post',
					body:    JSON.stringify(message),
					headers: { 'Content-Type': 'application/json' }
				})
				.then(res => res.json())
				.then(res => {
									//WAPI.sendSeen(message.from._serialized);
									window.log(res.response);
									WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.response);
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
						fetch(PartialMatch.response + message.body.toLowerCase().replace('/',''))
						.then(res => res.json())
						.then(res => {
										//WAPI.sendSeen(message.from._serialized);
										console.log(res);
										WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.data.commands);
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
						fetch(PartialMatch.response + message.body.toLowerCase().replace('/',''))
						.then(res => res.json())
						.then(res => {
										//WAPI.sendSeen(message.from._serialized);
										console.log(res);
										WAPI.sendMessage2(message.from._serialized, '👩🏻 '+res.data.result);
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
					WAPI.sendMessage2(message.from._serialized, '👩🏻 '+PartialMatch.response+' 🤗');
					//WAPI.ReplyMessageWithQuote(message.id, '👩🏻 '+PartialMatch.response+' 🤗');
			} else if (PartialMatch != undefined) {
				
                console.log("No partial match found");
            }
								
			WAPI.sendSeen(message.from._serialized);
			
			console.log(message.id);
			window.log('-------------------------');
			window.log('');
					
					if ((exactMatch || PartialMatch).file != undefined) {
						window.getFile((exactMatch || PartialMatch).file).then((base64Data) => {
							//console.log(file);
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