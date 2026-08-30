import { useEffect, useRef, useState } from 'react';
import { createSpeechRecognition, speak, infer, createBrowserCall } from './lib/voice';
import { saveLeafRecord } from './lib/supabase';
import './style.css';

type Tab = 'Chat' | 'Calls' | 'Contacts' | 'Memory' | 'Automations' | 'Settings';
function Calls() {
 const [active,setActive]=useState(false), [elapsed,setElapsed]=useState(0), [level,setLevel]=useState(0), [status,setStatus]=useState('Ready to call');
 const call=useRef<{stop:()=>void}|null>(null), timer=useRef<number>();
 const end=()=>{call.current?.stop();call.current=null;if(timer.current)window.clearInterval(timer.current);setActive(false);setStatus('Call ended');setElapsed(0);setLevel(0);};
 const start=async()=>{try{window.speechSynthesis.cancel();setStatus('Requesting microphone…');call.current=await createBrowserCall(setLevel);setActive(true);setStatus('Live · listening');timer.current=window.setInterval(()=>setElapsed(x=>{if(x>=179){end();return 180;}return x+1;}),1000);}catch{setStatus('Microphone permission is required');}};
 useEffect(()=>()=>end(),[]);
 const interrupt=()=>{window.speechSynthesis.cancel();setStatus('Interrupted · listening');};
 return <section className="panel call-panel"><h2>Calls</h2><div className={active?'call-state live':'call-state'}><div className="orb" style={{transform:`scale(${1+level*.35})`}}>●</div><h3>{active?'Leaf is listening':'Browser voice call'}</h3><p>{status}</p>{active&&<><strong>{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')} / 3:00</strong><div className="levels">{[1,2,3,4,5,6,7,8].map(i=><i key={i} style={{height:`${8+level*45*i/8}px`}}/> )}</div><button onClick={interrupt}>Interrupt / barge in</button><button className="danger" onClick={end}>End call</button></>}{!active&&<button onClick={start}>Start browser call</button>}</div><p className="hint">Calls use your browser microphone. They stop automatically at the three-minute hard cutoff.</p></section>;
}
export default function App(){
 const [tab,setTab]=useState<Tab>('Chat'),[text,setText]=useState(''),[messages,setMessages]=useState<string[]>(['Hey Tanner. I’m ready when you are.']),[listening,setListening]=useState(false);const recognition=useRef<any>(null);
 const toggle=()=>{if(listening){recognition.current?.stop();setListening(false);return;}window.speechSynthesis.cancel();recognition.current=createSpeechRecognition(r=>setText(r.text),e=>setText(`Speech error: ${e}`));if(!recognition.current){setText('Speech recognition is unavailable. Try Chrome or Edge.');return;}recognition.current.start();setListening(true);};
 const send=async()=>{if(!text.trim())return;const prompt=text.trim();setMessages(m=>[...m,prompt]);setText('');try{const answer=await infer(prompt);setMessages(m=>[...m,answer]);speak(answer);await saveLeafRecord('chat',{role:'user',content:prompt});}catch{setMessages(m=>[...m,'I couldn’t reach the free inference provider right now.']);}};
 useEffect(()=>()=>recognition.current?.stop(),[]);
 return <div className="app"><aside><h1>✦ Leaf</h1><p className="muted">Tanner’s personal workspace</p>{(['Chat','Calls','Contacts','Memory','Automations','Settings'] as Tab[]).map(x=><button className={tab===x?'nav active':'nav'} onClick={()=>setTab(x)} key={x}>{x}</button>)}</aside><main><header><span>{tab.toUpperCase()}</span><b className="status">● All systems operational</b></header>{tab==='Chat'?<section className="chat"><div className="messages">{messages.map((m,i)=><div className={i%2?'bubble user':'bubble'} key={i}><small>{i%2?'You':'Leaf'}</small><div>{m}</div></div>)}</div><div className="composer"><button onClick={toggle}>{listening?'◼':'🎙'}</button><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={listening?'Listening…':'Message Leaf…'}/><button onClick={send}>Send</button></div><p className="hint">Web Speech API · native browser voice · Pollinations inference</p></section>:tab==='Calls'?<Calls/>:<section className="panel"><h2>{tab}</h2><p>Connected to Supabase for Leaf data and settings.</p></section>}</main></div>;
}