import React from "react";
import { useSelector } from "react-redux";

const ChatMessage = ({
  text,
  profile_photo = "/defaultProfileImg.png",
  user,
  isOwnMessage,
  createdAt,
  readed,
}) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const globalUser = useSelector((state) => state.user);

  if (isOwnMessage) {
    return (
      <div className="chat-message">
        <div className="flex items-end justify-end">
          <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
            <div>
              <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">
                {text}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-500">{formatDate(createdAt)} </span>
              {readed ? (
                <span className="mx-1 !text-blue-500 font-bold tracking-[-0.3rem]">
                  ✓✓
                </span>
              ) : (
                <span className="mx-1 font-bold tracking-[-0.3rem]">✓</span>
              )}
            </div>
          </div>
          <img
            src={
              globalUser.profile_photo?.includes("undefined")
                ? "/defaultProfileImg.png"
                : globalUser.profile_photo
            }
            onError={(e) => {
              console.log(e);
              e.target.src = "/defaultProfileImg.png";
            }}
            alt="My profile"
            className="w-8 h-8 rounded-full order-2  object-cover"
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="chat-message">
        <div className="flex items-end">
          <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
            <div>
              <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                {text}
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              {formatDate(createdAt)}{" "}
            </div>
          </div>
          <img
            src={profile_photo || "/defaultProfileImg.png"}
            onError={(e) => {
              console.log(e);
              e.target.src = "/defaultProfileImg.png";
            }}
            alt={user}
            className="w-8 h-8 rounded-full order-1 object-cover"
          />
        </div>
      </div>
    );
  }
};

export default ChatMessage;
