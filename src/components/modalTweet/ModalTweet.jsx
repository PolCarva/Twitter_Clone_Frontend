import React, { useEffect, useState } from "react";
import TweetInput from "../tweetInput/tweetInput";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RepeatIcon from "@mui/icons-material/Repeat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const ModalTweet = ({
  isOpen,
  onClose,
  tweet,
  retweets,
  comments,
  likes,
  tweetId,
  isLiked,
  onToggleLike,
}) => {
  if (!isOpen) return null;

  const handleLike = () => {
    onToggleLike(tweetId);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white w-full md:w-1/2 xl:w-1/3 md:max-h-[70vh] rounded-lg overflow-y-auto shadow-lg">
        {/* Header del Modal */}
        <div className="flex justify-between items-center border-b p-4">
          <span className="font-bold text-lg">Tweet</span>
          <button
            onClick={onClose}
            className="text-blue-500 hover:text-blue-600"
          >
            Close
          </button>
        </div>

        {/* Tweet */}
        <div className="p-4 border-b">
          <div className="flex space-x-3">
            <img
              src={tweet.profile || "defaultProfileImg.png"}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold">{tweet.full_name}</span>
                <span className="text-gray-500">{tweet.username}</span>
              </div>
              <p>{tweet.content}</p>
            </div>
          </div>
        </div>
        {/* Icons */}
        <div className="flex gap-x-10 mt-2 ml-5 text-slate-400">
          <div className="flex gap-1">
            <ChatBubbleOutlineIcon
              className="cursor-pointer hover:text-blue-500 max-w-[18px]"
              onClick={() => {}}
            />
            <span>{comments.length}</span>
          </div>
          <div className="flex gap-1">
            <RepeatIcon className="cursor-pointer hover:text-green-500 max-w-[18px]" />
            <span>{retweets.length}</span>
          </div>
          <div className="flex gap-1">
            {isLiked ? (
              <FavoriteIcon
                className="cursor-pointer text-red-500 max-w-[18px]"
                onClick={(e) => handleLike()}
              />
            ) : (
              <FavoriteBorderIcon
                className="cursor-pointer hover:text-red-500 max-w-[18px]"
                onClick={(e) => handleLike()}
              />
            )}

            <span>{isLiked ? likes + 1 : likes}</span>
          </div>
        </div>

        {/* Comentarios */}
        {comments.map((comment, index) => (
          <div key={index} className="p-4 border-b">
            <div className="flex space-x-3">
              <img
                src={comment.profile || "defaultProfileImg.png"}
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold">{comment.User.full_name}</span>
                  <span className="text-gray-500">{comment.User.username}</span>
                </div>
                <p>{comment.comment}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Reply Input */}
        <TweetInput isComment={true} tweetId={tweetId} />
      </div>
    </div>
  );
};

export default ModalTweet;
