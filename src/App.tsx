import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";
import { HoverElementContextProvider } from "./context/HoverElement/HoverElementContext";

import {
  ArtifactsPage,
  ProfilePage,
  BuildsPage,
  LeaderboardsPage,
  CategorySelectionPage,
  // DashboardPage,
  UIDSearchPage,
} from "./pages";

import { Footer, Navbar, NavbarTabs, NotificationBar } from "./components";
import { SessionDataContextProvider } from "./context/SessionData/SessionDataContext";
import axios from "axios";

// @TODO: env variables later on...
const urls = {
  prod: "https://www.mimee.ovh",
  ovh: "http://146.59.86.233:5033",
  localhost: "http://localhost:5033",
  virmach: "http://149.57.165.73:5033",
  proxy: "http://localhost:3100/akasha",
  heroku: "https://akasha-backend.herokuapp.com",
};

axios.defaults.baseURL = urls["prod"];
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <LastProfilesContextProvider>
      <SessionDataContextProvider>
        <HashRouter>
          <NotificationBar />
          <Navbar />
          <NavbarTabs />
          <div className="content-wrapper">
            <HoverElementContextProvider>
              <Routes>
                {/* @TODO: later use dashboard page instead */}
                {/* <Route path="/" element={<DashboardPage />} /> */}
                <Route path="/" element={<UIDSearchPage />} />

                <Route path="/artifacts" element={<ArtifactsPage />} />
                <Route path="/builds" element={<BuildsPage />} />

                {/* @TODO: /auth ? */}
                {/* <Route path="/auth" element={<>nothing here yet.</>} /> */}

                {/* @TODO: /users ? */}
                {/* <Route path="/users" element={<>nothing here</>} /> */}

                {/* @TODO: /profile ? */}
                <Route path="/profile" element={<UIDSearchPage />} />

                <Route path="/profile/:uid" element={<ProfilePage />} />

                <Route
                  path="/leaderboards"
                  element={<CategorySelectionPage />}
                />
                <Route
                  path="/leaderboards/:calculationId"
                  element={<LeaderboardsPage />}
                />

                <Route
                  path="*"
                  element={
                    "404. Looks like there are things that even Akasha does not know about"
                  }
                />
              </Routes>
            </HoverElementContextProvider>
            <Footer />
          </div>
        </HashRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
  );
};

export default App;
