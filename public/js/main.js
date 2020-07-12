const chatform = document.getElementById("chat-form");
const chatmessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// catching roomname and username using qs library
const {username , room} = Qs.parse(location.search,{
  ignoreQueryPrefix: true
});

const socket = io();

// join chatroom
socket.emit("joinRoom",{username , room});

// get room and users in sidebar
socket.on('roomUsers',({room,users}) =>{
  outputRoomName(room);
  outputUsers(users);
});

// displaying the message
socket.on("message",message=>{
  // console.log(message);
  outputMessage(message);

  // scrooling down always
  chatmessages.scrollTop = chatmessages.scrollHeight;
});

// message submit
chatform.addEventListener("submit", (e) =>{
  e.preventDefault();

  //getting message text 
  const msg = e.target.elements.msg.value;
  // console.log(msg)

  // emmiting to the server
  socket.emit("chatMessage",msg);

  // clearing the input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// op fn to Dom
function outputMessage(message){
  // creatint a div
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}