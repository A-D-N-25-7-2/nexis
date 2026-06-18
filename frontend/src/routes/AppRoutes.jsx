import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";
import Watch from "../pages/Watch";
import History from "../pages/History";
import Channel from "../pages/Channel";
import MyChannel from "../pages/MyChannel";
import Dashboard from "../pages/Dashboard";
import LikedVideos from "../pages/LikedVideos";
import Subscriptions from "../pages/Subscriptions";
import SavedVideos from "../pages/SavedVideos";
import PlaylistView from "../components/playlist/PlaylistView";

const ProtectedLayout = ({children}) => (
  <ProtectedRoute>
    <Layout > {children} </Layout>
  </ProtectedRoute>
);


const AppRoutes = () => {
  
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Home />
            </ProtectedLayout>
          }
        />
        <Route
          path="/watch/:videoId"
          element={
            <ProtectedLayout>
              <Watch />
            </ProtectedLayout>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedLayout>
              <History />
            </ProtectedLayout>
          }
        />
        <Route
          path="/channel/:username"
          element={
            <ProtectedLayout>
              <Channel />
            </ProtectedLayout>
          }
        />
        // also add my-channel route that reads current user's username
        <Route
          path="/my-channel"
          element={
            <ProtectedLayout>
              <MyChannel />
            </ProtectedLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedLayout>
              <Subscriptions />
            </ProtectedLayout>
          }
        />
        <Route
          path="/liked-videos"
          element={
            <ProtectedLayout>
              <LikedVideos />
            </ProtectedLayout>
          }
        />
        <Route
          path="/saved-videos"
          element={
            <ProtectedLayout>
              <SavedVideos />
            </ProtectedLayout>
          }
        />
        <Route
          path="/playlists/:playlistId"
          element={
            <ProtectedLayout>
              <PlaylistView />
            </ProtectedLayout>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
}

export default AppRoutes;
