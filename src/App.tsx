import React from "react";
import { Routes, Route, HashRouter } from "react-router-dom";

import {
  ArtifactsPage,
  ProfilePage,
  BuildsPage,
  LeaderboardsPage,
  CategorySelectionPage,
  DashboardPage,
} from "./pages";

import { Footer, Navbar, NavbarTabs } from "./components";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";

const App = () => {
  return (
    <LastProfilesContextProvider>
      <HashRouter>
        <Navbar />
        <NavbarTabs />
        <div className="content-wrapper">
          <Routes>
            {/* Dashboard? */}
            <Route
              path="/"
              element={<DashboardPage />}
            />

            <Route path="/artifacts" element={<ArtifactsPage />} />
            <Route path="/builds" element={<BuildsPage />} />

            {/* @TODO: /auth ? */}
            {/* <Route path="/auth" element={<>nothing here yet.</>} /> */}

            {/* @TODO: /users ? */}
            {/* <Route path="/users" element={<>nothing here</>} /> */}

            {/* @TODO: /profile ? */}
            {/* <Route path="/profile" element={<>nothing here yet.</>} /> */}

            <Route path="/profile/:uid" element={<ProfilePage />} />

            <Route path="/leaderboards" element={<CategorySelectionPage />} />
            <Route
              path="/leaderboards/:calculationId"
              element={<LeaderboardsPage />}
            />

            <Route path="*" element={"nope."} />
          </Routes>
          <Footer />
        </div>
      </HashRouter>
    </LastProfilesContextProvider>
  );
};

export default App;
