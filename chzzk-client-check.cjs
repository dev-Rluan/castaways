const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{constructor(){this.textContent='';this.hidden=false;this.disabled=false;this.open=false;this.listeners={};}addEventListener(name,fn){this.listeners[name]=fn;}showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}}
const elements=new Map(),el=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id);},events={},calls=[];let fakeSocket,modes=[],chats=[],ready=true;
const context=vm.createContext({console,URLSearchParams,location:{search:'',pathname:'/'},history:{replaceState(){}},document:{getElementById:el,querySelector:()=>el('badge')},state:{phase:'ready',paused:false},liveMode:false,liveChannel:null,render(){},addMessage(){},setTimeout:()=>1,clearTimeout(){},setLiveMode(channel){modes.push(channel);context.liveMode=Boolean(channel);context.liveChannel=channel;},handleLiveChat(event){chats.push(event);},fetch:async(url,options)=>{calls.push({url,options});if(url.endsWith('/status'))return Response.json({configured:ready,connected:ready,channel:ready?{channelId:'a'.repeat(32),channelName:'방송인'}:null,redirectUri:'https://example.test/api/chzzk/return'});if(url.endsWith('/session'))return Response.json({url:'https://ssio08.nchat.naver.com?auth=temporary'});return Response.json({ok:true});},window:{addEventListener(){},io:{connect(){fakeSocket={on(name,fn){events[name]=fn;},removeAllListeners(){for(const key of Object.keys(events))delete events[key];},disconnect(){}};return fakeSocket;}}}});
vm.runInContext(fs.readFileSync('public/chzzk.js','utf8'),context);
(async()=>{
 await el('chzzkButton').onclick();assert.equal(el('chzzkSetup').hidden,true);assert.equal(el('chzzkListen').hidden,false);
 await el('chzzkListen').onclick();await events.SYSTEM(JSON.stringify({type:'connected',data:{sessionKey:'session-key'}}));assert.ok(calls.some(c=>c.url.endsWith('/subscribe')));
 await events.SYSTEM({type:'subscribed',data:{eventType:'CHAT',channelId:'a'.repeat(32)}});assert.equal(modes.length,1);assert.equal(el('badge').textContent,'● 치지직 채팅 연결됨');
 events.CHAT(JSON.stringify({content:'!참가'}));assert.equal(chats.length,1);
 context.state.phase='choosing';events.disconnect();assert.equal(context.state.paused,true);assert.equal(el('badge').textContent,'● 치지직 연결 끊김');
 await el('chzzkListen').onclick();await events.SYSTEM({type:'connected',data:{sessionKey:'second-session'}});await events.SYSTEM({type:'subscribed',data:{eventType:'CHAT',channelId:'a'.repeat(32)}});assert.equal(modes.length,1,'reconnect preserves game');
 el('chzzkDemo').onclick();assert.equal(modes.at(-1),null);assert.equal(context.liveMode,false);
 await el('chzzkDisconnect').onclick();assert.ok(calls.some(c=>c.url.endsWith('/disconnect')));
 el('chzzkDialog').close();ready=false;await el('chzzkButton').onclick();assert.equal(el('chzzkSetup').hidden,false);assert.equal(el('chzzkLogin').hidden,true);
 console.log('PASS: connection UI, socket handshake, chat subscription, event parsing, disconnect pause, reconnect preserves game, demo switch, account disconnect, setup gating.');
})().catch(error=>{console.error(error);process.exitCode=1;});
