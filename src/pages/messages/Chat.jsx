import React, { useEffect } from "react";
import ChatMessage from "./ChatMessage";
import { useState } from "react";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useSelector } from "react-redux";
import { useRef } from "react";

const Chat = ({
  socket,
  user_id,
  username,
  fullname,
  profile_photo = "/defaultProfileImg.png",
  chatId,
}) => {
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const user = useSelector((state) => state.user);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const connectedUsers = useSelector((state) => state.connectedUsers);

  const [isOnline, setIsOnline] = useState(
    connectedUsers.some((user) => user.userId === user_id)
  );

  useEffect(() => {
    setIsOnline(connectedUsers.some((user) => user.userId === user_id));
  }, [connectedUsers]);

  const sendMessage = () => {
    // Manda mensaje al server
    const userId = user.id;
    socket.emit("send message", message, userId, chatId);

    // Clear input
    setMessage("");
  };

  useEffect(() => {
    socket.emit("join chat", chatId);
  }, [chatId]);

  useEffect(() => {
    socket.on("get messages", (messages) => {
      const newMessagesList = messages.map((message) => ({
        text: message.message,
        isOwnMessage: message.user_id === user.id,
        createdAt: message.createdAt,
        readed: message.readed,
        userId: message.user_id,
      }));

      setMessagesList(newMessagesList);
    });

    return () => {
      socket.off("get messages");
    };
  }, [messagesList]);

  useEffect(() => {
    // Suscribe a get new message
    socket.on("get new message", (msg) => {
      if (msg.newMessage.chat_id !== chatId) return;
      const newMessage = {
        text: msg.newMessage.message,
        isOwnMessage: msg.newMessage.user_id === user.id,
        createdAt: msg.newMessage.createdAt,
        readed: msg.newMessage.readed,
        userId: msg.newMessage.user_id,
      };

      setMessagesList((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("get new message");
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleTyping = () => {
    socket.emit("is typing", user.username, chatId);
  };

  useEffect(() => {
    socket.on("is typing", ({ chatId: chat_id }) => {
      if (chat_id !== chatId) return;
      scrollToBottom();
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 5000);
    });

    return () => {
      socket.off("is typing");
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messagesList]);

  if (!username || username === "") {
    return (
      <div className="flex-1 p-2 sm:p-6 justify-between flex flex-col h-[calc(100vh-5rem)]">
        <div className="flex sm:items-center justify-between py-3 border-gray-200">
          <h1 className="text-center w-full text-slate-400 mt-5">
            Entra a un chat para ver su contenido
          </h1>
        </div>

        <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-5 bg-gray-200 rounded-md py-3"
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
                socket.emit("is typing", user.username);
              }}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-600 focus:outline-none"
                onClick={sendMessage}
              >
                <span className="font-bold">Send</span>
                <SendRoundedIcon className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 sm:p-6 justify-between flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-2 mx-auto md:mx-0">
          <div className="relative scale-75">
            <span
              className={`absolute ${
                isOnline ? "text-green-500" : "text-gray-400"
              } right-0 bottom-0`}
            >
              <svg width={20} height={20}>
                <circle cx={8} cy={8} r={8} fill="currentColor" />
              </svg>
            </span>
            <img
              src={
                profile_photo?.includes("undefined")
                  ? "/defaultProfileImg.png"
                  : profile_photo
              }
              onError={(e) => {
                console.log(e);
                e.target.src = "/defaultProfileImg.png";
              }}
              alt={username}
              className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <div className="text-2xl mt-1 flex items-center">
              <span className="text-gray-700 mr-3">{fullname}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        id="messages"
        className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
      >
        {messagesList.map((message, index) => (
          <ChatMessage
            key={index}
            isOwnMessage={message.isOwnMessage}
            text={message.text}
            profile_photo={
              profile_photo?.includes("undefined")
                ? "/defaultProfileImg.png"
                : profile_photo
            }
            user={username}
            createdAt={message.createdAt}
            readed={message.readed}
          />
        ))}
        {isTyping && <p className="text-gray-400 text-sm">Escribiendo...</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
        <div className="relative flex">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-5 bg-gray-200 rounded-md py-3"
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
              handleTyping();
            }}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-600 focus:outline-none"
              onClick={sendMessage}
            >
              <span className="font-bold">Send</span>
              <SendRoundedIcon className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
