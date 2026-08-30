export type STTResult = { text: string; final: boolean };
export type VoiceProvider = 'openai' | 'pollinations' | 'local';

export function createSpeechRecognition(onResult: (result: STTResult) => void, onError?: (error: string) => void) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  const recognition = new SpeechRecognition();
  recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
  recognition.onresult = (event: any) => { let text = ''; let final = false; for (let i = event.resultIndex; i < event.results.length; i++) { text += event.results[i][0].transcript; final ||= event.results[i].isFinal; } onResult({ text, final }); };
  recognition.onerror = (event: any) => onError?.(event.error || 'speech recognition failed');
  return recognition;
}

export function speak(text: string, preferred = 'Samantha') {
  if (!('speechSynthesis' in window)) return false;
  window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices(); utterance.voice = voices.find(v => v.name.toLowerCase().includes(preferred.toLowerCase())) || voices.find(v => v.lang.startsWith('en')) || null;
  utterance.rate = 0.98; utterance.pitch = 1; window.speechSynthesis.speak(utterance); return true;
}

export async function createBrowserCall(onLevel: (level: number) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const context = new AudioContext(); const analyser = context.createAnalyser(); const source = context.createMediaStreamSource(stream); source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount); let active = true;
  const tick = () => { if (!active) return; analyser.getByteTimeDomainData(data); onLevel(Math.max(...data.map(v => Math.abs(v - 128))) / 128); requestAnimationFrame(tick); }; tick();
  return { stream, stop: () => { active = false; stream.getTracks().forEach(track => track.stop()); context.close(); } };
}

export async function infer(prompt: string, provider: VoiceProvider = 'pollinations') {
  if (provider === 'pollinations') { const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`); if (!response.ok) throw new Error('Pollinations inference failed'); return response.text(); }
  if (provider === 'openai') throw new Error('Configure a server-side OpenAI proxy; never put an API key in the browser.');
  return prompt;
}