import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import TweetContainer from "../../components/tweetContainer/TweetContainer";
import CONFIG from "../../constants/config";
import { useSelector } from "react-redux";

const Home = () => {
  const [tweets, setTweets] = useState([]);
  const [isHome, setIsHome] = useState(true);
  const token = useSelector((state) => state.token);
  const location = useLocation();

  useEffect(() => {
    const fetchPostsData = async () => {
      try {
        const response = await axios.get(`${CONFIG.BASE_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const postsArray = response.data.data[0].posts;
        const retweetsArray = response.data.data[1].retweets;
        const retweetPostIds = retweetsArray.map((retweet) => retweet.post_id);
        const filteredPosts = postsArray?.filter(
          (post) => !retweetPostIds?.includes(post.id)
        ) || [];

        const mergeAndSortByDate = (array1, array2) => {
          const combinedArray = [...array1, ...array2];
          const sortedArray = combinedArray.sort((a, b) => {
            let dateA = a.created_at;
            let dateB = b.created_at;
            return new Date(dateA) - new Date(dateB);
          });

          return sortedArray.reverse();
        };

        const combinedData = mergeAndSortByDate(filteredPosts, retweetsArray);
        setTweets(combinedData);
      } catch (error) {
        console.error("Error fetching data", error);
        location.pathname = "/login";
      }
    };

    fetchPostsData();
  }, [token]);

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      setIsHome(false);
    } else {
      setIsHome(true);
    }
  }, [location]);

  return <div>{isHome ? <TweetContainer tweets={tweets} /> : null}</div>;
};

export default Home;
