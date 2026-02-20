const refreshBtn = document.querySelector('.refresh-button');
const modal = document.getElementById('confirmModal');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const chatMessages = document.querySelector('.chat-messages');
const chatContainer = document.getElementById('chatContainer');

const sendBtn = document.getElementById('sendBtn');
const chatInput = document.getElementById('chatInput');
const voiceBtn = document.getElementById('voiceBtn'); // 음성 버튼

// --- [TTS: 음성 합성 기능] ---
const synth = window.speechSynthesis;
function speak(text) {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    synth.speak(utterance);
}

// --- [STT: 음성 인식 성능 최적화 버전] ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

let recognition;
let isRecording = false;
let silenceTimer; // 무음 감지 타이머

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = true; // 실시간 결과 확인
    recognition.continuous = true;    // 연속 인식 모드
    
    // [성능 향상 1] 최대 대안 설정: 브라우저가 가장 적합한 문맥을 찾도록 돕습니다.
    recognition.maxAlternatives = 3; 

    // [성능 향상 2] 문법 리스트 추가: 자주 쓰이는 단어의 인식률을 높입니다.
    if (SpeechGrammarList) {
        const grammar = '#JSGF V1.0; grammar keywords; public <keyword> = 안녕하세요 | 도와주세요 | 상담 | 종료 | 초기화 | 예 | 아니오 ;';
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);
        recognition.grammars = speechRecognitionList;
    }

    recognition.onstart = () => {
        isRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.textContent = '🛑'; 
        chatInput.placeholder = "듣고 있습니다... 말씀해 주세요.";
        console.log(">>> [시스템] 최적화된 음성 인식 시작");
        resetSilenceTimer(3000); // 초기 무음 타이머 3초
    };

    recognition.onresult = (event) => {
        resetSilenceTimer(3000); // 소리가 들릴 때마다 타이머 리셋

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            // [성능 향상 3] 신뢰도 기반 필터링: 신뢰도가 너무 낮은 결과는 무시하거나 보정합니다.
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                finalTranscript += transcript;
                console.log(`>>> [확정] 결과: ${transcript} (신뢰도: ${result[0].confidence.toFixed(2)})`);
            } else {
                interimTranscript += transcript;
            }
        }

        // 입력창에 실시간 반영 (가장 확률 높은 결과 표시)
        chatInput.value = finalTranscript || interimTranscript;

        // 문장이 확정(Final)된 경우, 더 빠른 전송을 위해 타이머 단축
        if (finalTranscript !== '') {
            resetSilenceTimer(1500); // 문장 종료 후 1.5초 무음 시 자동 전송
        }
    };

    recognition.onend = () => {
        isRecording = false;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = '🎤';
        chatInput.placeholder = "메시지를 입력하세요...";
        
        // 인식이 종료될 때 입력값이 있으면 전송
        if (chatInput.value.trim() !== '') {
            sendMessage();
        }
        clearTimeout(silenceTimer);
        console.log(">>> [시스템] 음성 인식 종료 및 자동 전송 체크");
    };

    recognition.onerror = (event) => {
        console.error(">>> [에러] 발생:", event.error);
        if (event.error === 'no-speech') {
            console.warn("음성이 감지되지 않았습니다.");
        }
        recognition.stop();
    };
}

// 무음 감지 타이머 함수
function resetSilenceTimer(time) {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
        if (isRecording) {
            console.log(`>>> [시스템] ${time/1000}초간 무음으로 인한 자동 종료`);
            recognition.stop();
        }
    }, time);
}

// 마이크 버튼 클릭 핸들러
voiceBtn.addEventListener('click', () => {
    if (!recognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        return;
    }
    if (isRecording) {
        recognition.stop();
    } else {
        chatInput.value = ''; 
        recognition.start();
    }
});

// --- 메시지 전송 공통 로직 ---
function sendMessage() {
    const messageText = chatInput.value.trim();
    if (messageText !== '') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user');
        messageElement.textContent = messageText;
        chatMessages.appendChild(messageElement);
        
        var msg = {
            type: "TALK",
            roomId: roomId,
            sender: sender,
            message: messageText,
            date: Date.now(),
        };

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(msg));
        }
        
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight; 
    }
}

// --- 기존 UI 및 WebSocket 로직 유지 ---
refreshBtn.addEventListener('click', () => { modal.style.display = 'block'; });
confirmYes.addEventListener('click', () => { chatMessages.innerHTML = ''; modal.style.display = 'none'; });
confirmNo.addEventListener('click', () => { modal.style.display = 'none'; });

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.style.display = 'none';
});

sendBtn.addEventListener('click', () => { sendMessage(); });

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') { sendMessage(); }
});

window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = '';
});  

function getParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var roomId = getParameter("roomId");
var sender = "guest";

const socket = new WebSocket('ws://'+window.location.hostname+':'+window.location.port+'/chats');

socket.onmessage = (event) => {
    const message = event.data;
    var msg = JSON.parse(message);
    
    if(msg.type == "LOGIN"){
        if (typeof loginContainer !== 'undefined') loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        sender = msg.sender;
        roomId = msg.roomId;
    }
    if(msg.sender == "getEnter"){
        var enterMsg = { type: "ENTER", roomId: roomId, sender: sender, message: "입장 중...", date: Date.now() };
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(enterMsg));
    } else {
        if(msg.sender !== "guest" && msg.sender !== sender){
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'bot');
            messageElement.textContent = msg.message;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            speak(msg.message); // TTS 실행
        }
    }
};

// TTS 상태 관리
let isTTSEnabled = true;
const ttsToggleBtn = document.getElementById('ttsToggleBtn');

ttsToggleBtn.addEventListener('click', () => {
    isTTSEnabled = !isTTSEnabled;
    ttsToggleBtn.textContent = isTTSEnabled ? '🔊' : '🔇';
    ttsToggleBtn.title = isTTSEnabled ? '음성 읽기 ON' : '음성 읽기 OFF';
    if (!isTTSEnabled && synth.speaking) synth.cancel();
});

// 봇 메시지 생성 시 재생 버튼 포함
function createBotMessage(text) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('message', 'bot');

    const textEl = document.createElement('span');
    textEl.textContent = text;

    const playBtn = document.createElement('button');
    playBtn.classList.add('tts-play-btn');
    playBtn.textContent = '▶';
    playBtn.title = '이 메시지 읽기';
    playBtn.addEventListener('click', () => speak(text));

    wrapper.appendChild(textEl);
    wrapper.appendChild(playBtn);
    chatMessages.appendChild(wrapper);
}