  const refreshBtn = document.querySelector('.refresh-button');
  const modal = document.getElementById('confirmModal');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');
  
  const chatMessages = document.querySelector('.chat-messages');
  const chatContainer = document.getElementById('chatContainer');
  
  const sendBtn = document.getElementById('sendBtn');
  const chatInput = document.getElementById('chatInput');
  
  refreshBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  confirmYes.addEventListener('click', () => {
    chatMessages.innerHTML = ''; // 대화 내용 초기화
    modal.style.display = 'none';
  });

  confirmNo.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // ESC 키로 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.style.display = 'none';
  });
  
  
  
  sendBtn.addEventListener('click', () => {
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
	
	  socket.send(JSON.stringify(msg));
      
      
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight; // 자동 스크롤
    }
  });
  
// Enter 키로 메시지 전송
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
});
  
//새로고침 및 페이지 이동 경고
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

// WebSocket 연결 생성
const socket = new WebSocket('ws://'+window.location.hostname+':'+window.location.port+'/chats');

// 서버로부터 메시지 수신
socket.onmessage = (event) => {
    const message = event.data;
    const messageElement = document.createElement('div');
  	
    
    var msg = JSON.parse(message);
    
    //로그인 처리
    if(msg.type == "LOGIN"){
    	loginContainer.style.display = 'none';
      	chatContainer.style.display = 'flex';
    	sender = msg.sender;
    	roomId = msg.roomId;
    }
    //입장 메세지 일때
    if(msg.sender == "getEnter"){
		//엔터 메세지 보내기
		var msg = {
    		    type: "ENTER",
    		    roomId: roomId,
    		    sender: sender,
    		    message: "채팅방에 입장중입니다.",
    		    date: Date.now(),
    		  };
    	socket.send(JSON.stringify(msg));
	}
	else{
	    if(msg.sender == "guest"){
			//guest 인 경우(자기가 보낸 메세지 인 경우)는 안보여 준다.
  			//messageElement.classList.add('message', 'user');
		}
		else {
			//받은 메시지 일때 무조건 봇으로 처리
			messageElement.classList.add('message', 'bot');
		    messageElement.textContent = msg.message;
		    chatMessages.appendChild(messageElement);
		    chatMessages.scrollTop = chatMessages.scrollHeight; // 최신 메시지로 스크롤
		}
	}
};