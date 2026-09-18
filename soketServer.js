let onlineUsers = [];

export const socketHandler = (socket, io) => {
  // when user joins
  socket.on("user joins", (userId) => {
    socket.join(userId);

    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({ userId: userId, socketId: socket.id });

      //send back online users
      io.emit("get-online-users", onlineUsers);
    }
  });

  socket.on("joinGroupChat", (groupId) => {
    socket.join(groupId);
    console.log("GroupChatjoined");
  });

  // offline
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  // logout
  socket.on("logout", (userId) => {
    onlineUsers = onlineUsers.filter(
      (u) => !(u.userId === userId && u.socketId === socket.id),
    );

    // notify frontend
    io.emit("get-online-users", onlineUsers);
  });

  //listen for the chat messages
  // socket.on("sendMessage", (message) => {
  //   console.log(message);
  //   const users = message.chat.users;
  //   const senderId = message.sender._id;
  //   const receiver = users.filter((user) => {
  //     if (user._id !== senderId) {
  //       return user._id;
  //     }
  //   })[0]._id;

  //   socket.to(receiver).emit("receiveMessage", message);
  // });

  socket.on("sendMessage", (message) => {
    const { chat, sender } = message;
    console.log(message);

    // 🔹 1. Notify all *other* users (for sidebar update)
    chat.users.forEach((user) => {
      console.log("suuupeer", user);
      if (user._id !== sender._id) {
        socket.to(user._id).emit("receiveMessage", message);

        console.log("sent");
      }
    });

    // 🔹 2. Send to the active chat room
    io.to(chat._id).emit("receiveMessage", message);
  });
};
