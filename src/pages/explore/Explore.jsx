import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FollowBtn from "../../components/followBtn/FollowBtn";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import CONFIG from "../../constants/config";

const Explore = () => {
  const [username, setUsername] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(allUsers);

  useEffect(() => {
    try {
      axios
        .get(`${CONFIG.BASE_URL}/usuarios`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          const usersData = response.data.data.map((user) => ({
            id: user.id,
            display: user.username.slice(1),
            username: user.username,
            img: user.profile_photo,
          }));

          setAllUsers(usersData);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  
  const handleSearch = (value) => {
    setUsername(value);
    const filtered = allUsers?.filter((user) =>
      user.display.toLowerCase()?.includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <div className="mt-5 px-8 md:pl-10 lg:p-0">
      <h2 className="text-2xl font-bold mb-5 text-center">Buscar Usuarios</h2>
      <div className="flex items-center">
        <div className="relative w-full flex-1">
          <SearchIcon className="absolute left-3 top-2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar Usuarios"
            className="border rounded-full w-full px-2 pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500"
            value={username}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <ul className="mt-4 overflow-y-auto max-h-[55vh]">
        {filteredUsers.length === 0 ? (
          <p className="text-slate-400 text-center">
            No se encontraron usuarios
          </p>
        ) : (
          filteredUsers.map((user) => (
            <li
              key={user.id}
              className="flex items-center justify-between p-4 border-b hover:bg-gray-50 transition-colors duration-200"
            >
              <Link to={`/profile/${user.id}`} className="flex items-center">
                <img
                  src={user.img || "/defaultProfileImg.png"}
                  onError={(e) => {
                    console.log(e);
                    e.target.src = "/defaultProfileImg.png";
                  }}
                  alt={user.display}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <div className="flex items-center flex-1">
                    <span className="font-bold text-sm mr-1">
                      {user.display}
                    </span>
                  </div>
                  <span className="text-gray-500 text-sm">{user.username}</span>
                </div>
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="bg-blue-500 transition-all text-white py-2 px-4 rounded-full hover:bg-blue-600"
              >
                Ver Perfil
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Explore;
