import axios from "axios";
import React, { useEffect } from "react";
import { Routes, Route, HashRouter, BrowserRouter } from "react-router-dom";
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

// @TODO: env variables later on...
const urls = {
  prod: "https://www.mimee.ovh",
  ovh: "http://146.59.86.233:5033",
  localhost: "http://localhost:5033",
  localhost80: "http://localhost:80",
  virmach: "http://149.57.165.73:5033",
  proxy: "http://localhost:3100/akasha",
  heroku: "https://akasha-backend.herokuapp.com",
};

axios.defaults.baseURL = urls["prod"];
axios.defaults.withCredentials = true;

const domainRedirect = () => {
  const _from = "peacerekam.github.io";
  const _to = "mimee.ovh";
  const currentHref = window.location.href;
  if (currentHref.includes(_from)) {
    const newHref = currentHref
      .replace(_from, _to) // change domain
      .replace("/#/", "/"); // HashRouter to BrowserRouter
    window.location.href = newHref;
  }
};

export const BASENAME = "/akasha";

const App = () => {
  useEffect(() => {
    domainRedirect();
  }, []);

  return (
    <LastProfilesContextProvider>
      <SessionDataContextProvider>
        <BrowserRouter basename={BASENAME}>
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
                  path="/leaderboards/:calculationId/:variant"
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
        </BrowserRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
  );
};

export default App;
