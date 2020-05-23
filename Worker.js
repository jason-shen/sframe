import {Context} from "./lib/Context.js";

let context; 

onmessage = async (event) => {
	//Get data
	const {transId,cmd,args} = event.data;
	
	try {
		let result = true;
		
		//Depending on the cmd
		switch(event.data.cmd)
		{
			case "init":
			{
				//Get info
				const {senderId, config} = args;
				//Crate context
				context = new Context(senderId, config);
				break;
			}
			case "encrypt":
			{
				//Get event data
				const{id, kind, readableStream, writableStream} = event.data;
				//Create transform stream foo encrypting
				const transform = new TransformStream({
					transform: async ()=>{
						//encrypt
						const encrypted = await context.encrypt(kind, id, chunk.data);
						//Set back encrypted payload
						chunk.data = encrypted;
						//write back
						controller.enqueue(chunk);
					}
				});
				//Encrypt
				readableStream
					.pipeThrough(transform)
					.pipeTo(writableStream);
				break;
			}
			case "decrypt":
			{
				//Get event data
				const{id, kind, readableStream,writableStream} = args;
				//Create transform stream for encrypting
				const transform = new TransformStream({
					transform: async ()=>{
						//decrypt
						const decrypted = await context.decrypt(kind, id, chunk.data);
						//Set back decrypted payload
						chunk.data = decrypted;
						//write back
						controller.enqueue(chunk);
					}
				});
				//Decrypt
				readableStream
					.pipeThrough(transform)
					.pipeTo(writableStream);
				break;
			}
			default:
				//Excute "cmd" method on context
				result = await context[cmd](...args || []);
		}
		//Send result back
		postMessage ({transId,result});
	} catch (error) {
		console.error(error);
		//Send error back
		postMessage({transId,error});
	}
};
