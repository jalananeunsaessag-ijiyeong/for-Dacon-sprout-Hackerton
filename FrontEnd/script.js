document.getElementById("start-button").addEventListener("click", function () {
  document.getElementById("slide1").style.display = "none";
  document.getElementById("chat-container").style.display = "flex";
  document.getElementById("end-button-container").classList.remove("hidden");
  document.getElementById("title1").style.display = "none";
});

document.getElementById("info-button").addEventListener("click", function() {
  document.getElementById("slide1").style.display = "none";
  document.getElementById("info-container").style.display = "block";
  document.getElementById("title1").innerHTML = '<span class="emoji">♥</span> <div class="title-text">당신의 아픔에 공감하는<br> 포유와 함께 이야기를 나눠요</div>';
  document.getElementById("title1").style.display = "flex"; // title1을 다시 표시
});

document.getElementById("back-button-info").addEventListener("click", function() {
  document.getElementById("info-container").style.display = "none";
  document.getElementById("slide1").style.display = "flex";
  document.getElementById("title1").innerHTML = '<span class="emoji">♥</span> <div class="title-text">당신의 아픔에 공감하는<br> 포유와 함께 이야기를 나눠요</div>';
  document.getElementById("title1").style.display = "flex"; // title1을 다시 표시
});

// 상담 종료 버튼 클릭 시
document.getElementById("end-button-chat").addEventListener("click", function() {
  document.getElementById("chat-container").style.display = "none";
  document.getElementById("end-button-container").classList.add("hidden");
  document.getElementById("end-page").style.display = "flex"; // 상담 종료 페이지를 표시
});

// 홈으로 돌아가기 버튼 클릭 시
document.getElementById("home-button").addEventListener("click", function() {
  window.location.href = "index.html"; // 홈 페이지로 리디렉션
});

// // 다시 시작하기 버튼 클릭 시
// document.getElementById("restart-button").addEventListener("click", function() {
//   document.getElementById("end-page").style.display = "none";
//   document.getElementById("slide1").style.display = "flex"; // 상담 시작 화면을 다시 표시
//   document.getElementById("title1").style.display = "flex"; // 제목 다시 표시
//   // 필요에 따라 추가 초기화 작업을 수행할 수 있습니다.
// });

// 도움 요청 버튼 클릭 시
document.getElementById("info-button-end").addEventListener("click", function() {
  document.getElementById("end-page").style.display = "none";
  document.getElementById("info-container").style.display = "block"; // 정보 페이지를 표시
  document.getElementById("title1").innerHTML = '<span class="emoji">♥</span> <div class="title-text">당신의 아픔에 공감하는<br> 포유와 함께 이야기를 나눠요</div>';
  document.getElementById("title1").style.display = "flex"; // 제목 다시 표시
});


const socket = io();

document.getElementById("send-button").addEventListener("click", sendMessage);
document.getElementById("user-message").addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
  const userMessage = document.getElementById("user-message").value;
  if (userMessage.trim() !== "") {
    const userMessageDiv = document.createElement("div");
    userMessageDiv.classList.add("message", "user-message");
    userMessageDiv.textContent = userMessage;

    document.getElementById("chat-box").appendChild(userMessageDiv);
    document.getElementById("user-message").value = "";
    document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;

    // 서버로 메시지 전송
    socket.emit("chat message", userMessage);
  }
}

socket.on("bot message", function (msg) {
  const botMessageDiv = document.createElement("div");
  botMessageDiv.classList.add("message", "bot-message");

  console.log("Received bot message:", msg); // 디버그 메시지 출력
  try {
    botMessageDiv.innerHTML = marked(msg); // 메시지를 HTML로 변환하여 추가
  } catch (error) {
    console.error("Error parsing Markdown:", error);
    botMessageDiv.textContent = msg; // 문제가 발생하면 원본 메시지를 표시
  }

  document.getElementById("chat-box").appendChild(botMessageDiv);
  document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
});
