import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/userSlice";
import axios from "axios";
import CONFIG from "../../constants/config";
import toast from "react-hot-toast";
import { format } from "date-fns";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const today = format(new Date(), "yyyy-MM-dd");

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    axios
      .get(`${CONFIG.BASE_URL}/perfilusuario/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProfileData(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, [user, token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData((prevData) => ({ ...prevData, [name]: "@" + value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file); // Set the file object directly
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prevData) => ({
          ...prevData,
          profile_photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("username", profileData.username);
      formData.append("fullName", profileData.full_name);
      formData.append("bio", profileData.bio);

      // Solo adjuntar la foto si profilePhoto no es null y no es la imagen predeterminada
      if (profilePhoto && profilePhoto !== "/defaultProfileImg.png") {
        formData.append("file", profilePhoto);
      }

      const response = await axios.post(
        `${CONFIG.BASE_URL}/actualizarperfil`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Usuario actualizado");
        setIsLoading(false);

        dispatch(setUser(response.data.newUser || user));
      }
    } catch (e) {
      toast.error("Error al actualizar datos");
      setIsLoading(false);
      console.log(e);
    }
  };
  const handleNameChange = (event) => {
    const { value } = event.target;
    setProfileData((prevData) => ({ ...prevData, full_name: value }));
  };

  const handleBioChange = (event) => {
    const { value } = event.target;
    setProfileData((prevData) => ({ ...prevData, bio: value }));
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white min-h-screen">
      <div className="mb-8 flex flex-col justify-center items-center">
        <img
          src={
            profileData?.profile_photo ||
            profilePhoto ||
            "/defaultProfileImg.png"
          }
          onError={(e) => {
            console.log(e);
            e.target.src = "/defaultProfileImg.png";
          }}
          alt={`${profileData?.full_name}'s profile`}
          className="rounded-full object-cover w-32 h-32 border-4 border-gray-300 mb-4"
        />
        <div className="flex flex-col md:flex-row gap-5">
          <label className="block text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Subir Foto
            <input
              type="file"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          <button
            className="block text-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
            type="button"
            onClick={() => {
              setProfilePhoto(null);
              setProfileData((prevData) => ({
                ...prevData,
                profile_photo: null,
              }));
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
      <input
        type="text"
        name="full_name"
        value={profileData.full_name || ""}
        onChange={handleNameChange}
        placeholder="Full Name"
        className="border border-gray-300 p-2 mb-4 w-full rounded"
      />
      <div className="flex items-center border border-gray-300 p-2 mb-4 w-full rounded">
        <span className="text-gray-600">@</span>
        <input
          type="text"
          name="username"
          value={profileData.username?.replace(/^@/, "") || ""} // Quitamos el '@' del inicio si es que lo tiene
          onChange={handleInputChange}
          placeholder="Username"
          className="ml-2 flex-1 focus:outline-none"
        />
      </div>

      <div className="flex items-center border border-gray-300 p-2 mb-4 w-full rounded">
        <textarea
          value={profileData.bio || ""}
          type="text"
          name="bio"
          onChange={handleBioChange}
          placeholder="Bio"
          className="ml-2 flex-1 focus:outline-none h-10 resize-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded w-full"
      >
        {!isLoading ? "Guardar Cambios" : "Cargando..."}
      </button>
    </div>
  );
};

export default EditProfile;
