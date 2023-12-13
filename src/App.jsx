import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate,
  Link,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { useMediaQuery } from "react-responsive";
import io from "socket.io-client";

import { setConnectedUsers } from "./redux/connectedUsersSlice";

import NavBar from "./components/navBar/NavBar";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Explore from "./pages/explore/Explore";
import Error from "./pages/error/Error";
import Saved from "./pages/saved/Saved";
import Login from "./pages/login/Login";
import RegisterPage from "./pages/register/RegisterPage";
import Notifications from "./pages/notis/Notifications";
import SidebarRight from "./components/sidebarRight/SidebarRight";
import SidebarLeft from "./components/sidebarLeft/SidebarLeft";
import Messages from "./pages/messages/Messages";
import Settings from "./pages/settings/Settings";
import EmailConfirm from "./pages/emailConfirm/emailConfirm";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword";

const token = localStorage.getItem("token");

const socket = io("https://backtwclone-production.up.railway.app/", {
  auth: {
    token: `Bearer ${token}`,
  },
});

const Layout = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const isDesktopOrLaptop = useMediaQuery({
    query: "(min-device-width: 1224px)",
  });

  const isTabletOrLarger = useMediaQuery({
    query: "(min-device-width: 768px)",
  });


  return (
    <div className="mx-auto">
      <NavBar />
      {user && (
        <div>
          <div className="container mx-auto mt-16">
            <div className="flex">
              {isDesktopOrLaptop && (
                <div className="w-1/4 px-2">
                  <SidebarLeft />
                </div>
              )}
              <div className="flex-1">
                <Outlet />
              </div>
              {/* El componente de la ruta específica se renderizará aquí */}
              {isTabletOrLarger && (
                <div className="w-1/4 px-2">
                  <SidebarRight />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const [isMessageOpen, setIsMessageOpen] = useState(true);

  return (
    <Provider store={store}>
      <div className="overflow-x-hidden">
        <div
          className={`w-full md:w-1/4 h-fit text-white fixed bottom-0 md:bottom-2 left-0 md:left-2 rounded-md bg-red-500 ${
            isMessageOpen ? "block" : "hidden"
          }`}
        >
          <div className="relative  p-5">
            <button
              className="absolute top-1 right-3"
              onClick={() => setIsMessageOpen(false)}
            >
              x
            </button>
            La base de datos no está activa debido a la falta de presupuesto. Si
            quieres ver el proyecto, contacta a:<br />
            <a href="https://www.linkedin.com/in/pablo-carvalho-gimenez/" target="_blank">@pablo-carvalho-gimenez</a>
          </div>
        </div>
        <SocketProvider socket={socket}>
          <Toaster />

          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route
                  path="/profile/:id"
                  element={<Profile socket={socket} />}
                />
                <Route path="/explore" element={<Explore />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="/messages" element={<Messages socket={socket} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/emailConfirmation" element={<EmailConfirm />} />
              <Route path="*" element={<Error />} />
            </Routes>
          </Router>
        </SocketProvider>
      </div>
    </Provider>
  );
}

const SocketProvider = ({ children, socket }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Conecta con websocket
    socket.connect();

    // Se desuscribe cuando se desmonta el componente
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    socket.on("users connected", (data) => {
      dispatch(setConnectedUsers(data));
    });
  }, [dispatch, socket]);

  return children;
};

export default App;
