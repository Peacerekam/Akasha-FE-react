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
  DashboardPage,
  UIDSearchPage,
} from "./pages";

import { Footer, Navbar, NavbarTabs, NotificationBar } from "./components";

const App = () => {
  return (
    <LastProfilesContextProvider>
      <HashRouter>
        <NotificationBar />
        <Navbar />
        <NavbarTabs />
        <div className="content-wrapper">
          <HoverElementContextProvider>
            <Routes>
              <Route path="/" element={<DashboardPage />} />

              <Route path="/artifacts" element={<ArtifactsPage />} />
              <Route path="/builds" element={<BuildsPage />} />

              {/* @TODO: /auth ? */}
              {/* <Route path="/auth" element={<>nothing here yet.</>} /> */}

              {/* @TODO: /users ? */}
              {/* <Route path="/users" element={<>nothing here</>} /> */}

              {/* @TODO: /profile ? */}
              <Route path="/profile" element={<UIDSearchPage />} />

              <Route path="/profile/:uid" element={<ProfilePage />} />

              <Route path="/leaderboards" element={<CategorySelectionPage />} />
              <Route
                path="/leaderboards/:calculationId"
                element={<LeaderboardsPage />}
              />

              <Route path="*" element={"nope."} />
            </Routes>
          </HoverElementContextProvider>
          <Footer />
        </div>
      </HashRouter>
    </LastProfilesContextProvider>
  );
};

export default App;
