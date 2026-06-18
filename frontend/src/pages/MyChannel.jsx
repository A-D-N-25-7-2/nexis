import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

const MyChannel = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (currentUser?.username) {
      navigate(`/channel/${currentUser.username}`, { replace: true });
    }
  }, [currentUser]);

  return null;
};

export default MyChannel;
