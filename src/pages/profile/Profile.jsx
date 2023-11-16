import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import CONFIG from "../../constants/config";
import FollowBtn from "../../components/followBtn/FollowBtn";
import TweetContainer from "../../components/tweetContainer/TweetContainer";

const Profile = ({ socket }) => {
  const [profileData, setProfileData] = useState(null);
  const [followers, setFollowers] = useState(0);
  const [isOnline, setIsOnline] = useState(false);

  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const connectedUsers = useSelector((state) => state.connectedUsers);

  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get user id", id);
  }, [id]);

  useEffect(() => {
    // Verifica si el id del usuario del perfil está en la lista de usuarios conectados
    setIsOnline(
      connectedUsers
        ? connectedUsers.some((user) => user.userId === parseInt(id))
        : false
    );
  }, [connectedUsers, id]);

  useEffect(() => {
    axios
      .get(`${CONFIG.BASE_URL}/perfilusuario/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        let correctedData = { ...response.data.data };

        correctedData.isFollowing = correctedData.FollowingList.Following.some(
          (e) => e.id === user.id
        );

        // Intercambio de Seguidores y Seguidos
        correctedData.CorrectedFollowers =
          correctedData.FollowingList?.Following || [];
        correctedData.CorrectedFollowing =
          correctedData.FollowersList?.Follower || [];

        setProfileData(correctedData);
        setFollowers(correctedData.CorrectedFollowers.length);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [id, user, navigate]);

  if (!profileData) {
    return (
      <div className="flex flex-col items-center p-8 bg-white min-h-screen">
        <div>Loading Data...</div>
      </div>
    );
  }

  const mergeAndSortByDate = (array1, array2) => {
    // Unir los dos arrays
    const combinedArray = array1
      ?.filter(
        // Filtramos los tweets que el usuario no haya retuiteado
        (post) => !array2.some((retweet) => retweet.id === post.id)
      )
      .concat(array2);

    // Ordenar por la fecha de creación
    const sortedArray = combinedArray.sort((a, b) => {
      const dateA = new Date(a.created_at || a.retweeted_at);
      const dateB = new Date(b.retweeted_at || b.created_at); // Usamos 'retweeted_at' si está presente, de lo contrario, 'created_at'
      return dateA - dateB;
    });

    return sortedArray.reverse();
  };

  const handleClickFollow = (newIsFollowing) => {
    newIsFollowing ? setFollowers(followers + 1) : setFollowers(followers - 1);
  };
  const handleCreateChat = () => {
    axios
      .post(
        `${CONFIG.BASE_URL}/crearchat/${profileData?.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        navigate("/messages");
      });
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen">
      <div className="relative rounded-full w-32 h-32">
        <img
          src={profileData?.profile_photo || "/defaultProfileImg.png"}
          onError={(e) => (e.target.src = "/defaultProfileImg.png")}
          alt={`${profileData?.full_name}'s profile`}
          className="border-4 border-gray-300 rounded-full w-32 h-32 object-cover"
        />
        <div
          className={`w-5 h-5 rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }  absolute bottom-2 right-3`}
        ></div>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mt-4">{profileData?.full_name}</h1>
        <p className="text-gray-500">{profileData?.username}</p>
        <p className="text-gray-500 text-base">{profileData?.bio || ""}</p>
      </div>
      <div className="flex gap-2">
        {profileData?.id !== user.id && (
          <FollowBtn
            profileData={profileData}
            isFollowing={profileData?.isFollowing}
            onClick={(newIsFollowing) => handleClickFollow(newIsFollowing)}
          />
        )}
        {profileData?.id !== user.id && (
          <div className="mt-4">
            <button
              onClick={handleCreateChat}
              className={`px-4 py-2 hover:bg-blue-600 hover:border-blue-600 hover:text-white  border-blue-500 text-blue-500"
             rounded-full border-2 duration-200 transition-colors`}
            >
              Chat
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 flex space-x-8">
        <div className="flex flex-col justify-center items-center">
          <p className="text-xl font-semibold">{followers}</p>
          <span>Seguidores</span>
        </div>
        <div className="flex flex-col justify-center items-center">
          <p className="text-xl font-semibold">
            {profileData.CorrectedFollowing?.length || 0}
          </p>
          <span>Seguidos</span>
        </div>
      </div>
      <div className="mt-8 w-full">
        <TweetContainer
          tweets={mergeAndSortByDate(profileData.Posts, profileData.Retweets)}
          onClick={handleClickFollow}
          isUserProfile={profileData?.id === user.id}
        />
      </div>
    </div>
  );
};

export default Profile;
