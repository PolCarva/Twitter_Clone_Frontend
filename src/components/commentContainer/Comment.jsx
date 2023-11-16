import React, { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import CONFIG from "../../constants/config";

const Comment = ({ comment }) => {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const isLikedByCurrentUser = comment.Likes?.some(
    (like) => like.user_id === user.id
  );

  const [isLiked, setIsLiked] = useState(isLikedByCurrentUser);
  const [localLikes, setLocalLikes] = useState(comment.Likes?.length);

  const handleLike = () => {
    if (!isLiked) {
      axios
        .post(
          `${CONFIG.BASE_URL}/like/Comentario/${comment.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setIsLiked(true);
          setLocalLikes(localLikes + 1);
        })
        .catch((e) => {
          console.log(e);
          toast.error("Error al Likear Comentario");
        });
    } else {
      const likeId = comment.Likes.find((like) => like.user_id === user.id)?.id;
      if (likeId) {
        axios
          .post(
            `${CONFIG.BASE_URL}/removelike/${likeId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .then((response) => {
            setIsLiked(false);
            setLocalLikes(localLikes - 1);
          })
          .catch((e) => {
            console.log(e);
            toast.error("Error al quitar el like al comentario");
          });
      } else {
        toast.error("No se encontró el like para eliminar");
      }
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex space-x-3">
        <img
          src={comment.User.profile_photo?.includes("undefined") ? "/defaultProfileImg.png" : comment.User.profile_photo || "/defaultProfileImg.png"}
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
      <div className="flex gap-1 text-slate-500">
        {isLiked ? (
          <FavoriteIcon
            className="cursor-pointer text-red-500 max-w-[18px]"
            onClick={(e) => handleLike(comment.id)}
          />
        ) : (
          <FavoriteBorderIcon
            className="cursor-pointer hover:text-red-500 max-w-[18px]"
            onClick={(e) => handleLike(comment.id)}
          />
        )}

        <span>{localLikes}</span>
      </div>
    </div>
  );
};

export default Comment;
