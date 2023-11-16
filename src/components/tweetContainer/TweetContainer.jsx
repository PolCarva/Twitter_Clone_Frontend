import React, { useState, useEffect } from "react";
import TweetInput from "../tweetInput/TweetInput";
import Tweet from "../tweet/Tweet";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const TweetContainer = ({ tweets = [], isUserProfile }) => {
  const [likes, setLikes] = useState({});
  const [retweets, setRetweets] = useState([]);
  const [isProfile, setIsProfile] = useState(false);

  const user = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("/profile/")) {
      setIsProfile(true);
    } else {
      setIsProfile(false);
    }
  }, [location]);

  useEffect(() => {
    const initialLikes = {};
    tweets.forEach((tweet) => {
      const currentTweet = tweet.Post || tweet; // Considera el caso del rt
      initialLikes[currentTweet.id] = currentTweet.Likes.some(
        (like) => like.user_id === user.id
      );
    });
    setLikes(initialLikes);
  }, [tweets, user.id]);

  const toggleLike = (tweetId) => {
    setLikes({
      ...likes,
      [tweetId]: !likes[tweetId],
    });
  };

  useEffect(() => {
    const initialRetweets = {};
    tweets.forEach((tweet) => {
      const currentTweet = tweet.Post || tweet;
      initialRetweets[currentTweet.id] = currentTweet.Retweets?.some(
        (retweet) => retweet.user_id === user.id
      );
    });
    setRetweets(initialRetweets);
  }, [tweets, user.id]);

  const filterUniqueRetweets = (tweets) => {
    const seen = new Set();
    return tweets??.filter((tweet) => {
      const currentTweet = tweet.Post || tweet; // Considera el caso del retweet
      if (tweet.Post) {
        // Si es un retweet
        if (seen.has(currentTweet.id)) {
          return false; // Si el tweet original ya ha sido retuiteado, lo ignoro
        }
        seen.add(currentTweet.id);
      }
      return true;
    });
  };

  // Función para ordenar los tweets por fecha de creación en orden descendente
  const sortByNewest = (a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB - dateA;
  };

  // Ordena los tweets antes de renderizarlos
  const sortedTweets = tweets.sort(sortByNewest);

  const uniqueTweets = filterUniqueRetweets(sortedTweets);

  if (tweets.length === 0 || !tweets)
    return (
      <div className="flex-1 px-2 text-center mb-10">
        {!isProfile && <TweetInput />}
        {isProfile ? (
          <p className="mt-10 text-slate-400">Este usuario no tiene Tweets</p>
        ) : (
          <p className="mt-10 text-slate-400">
            No hay tweets disponibles.
            <br />
            Sigue a otros usuarios para ver sus twits.
          </p>
        )}
      </div>
    );

  return (
    <div className="flex-1 px-2 mb-10">
      {!isProfile && <TweetInput />}
      {uniqueTweets.map((tweet) => {
        const isRetweet = Boolean(tweet.Post);
        const currentTweet = isRetweet ? tweet.Post : tweet;
        return (
          <Tweet
            isSavedParam={tweet.SavedPostsLists?.some(
              (save) => save.user_id === user.id
            )}
            retweetUser={isRetweet ? tweet.User?.username : null}
            retweetUserId={isRetweet ? tweet.User?.id : null}
            tweetId={currentTweet.id}
            key={currentTweet.id + "user" + currentTweet.User.id}
            content={currentTweet.text}
            file={currentTweet.file}
            profile={currentTweet.User.profile_photo}
            fullName={currentTweet.User.full_name}
            user={currentTweet.User.username}
            userId={currentTweet.User.id}
            likes={currentTweet.Likes}
            comments={currentTweet.PostComments}
            isLiked={likes[currentTweet.id]}
            onToggleLike={() => toggleLike(currentTweet.id)}
            isRetweet={isRetweet}
            retweets={currentTweet.Retweets}
            isUserProfile={isUserProfile && !isRetweet}
          />
        );
      })}
    </div>
  );
};

export default TweetContainer;
