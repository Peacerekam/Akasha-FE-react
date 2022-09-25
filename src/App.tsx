import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  ArtifactsPage,
  ProfilePage,
  BuildsPage,
  LeaderboardsPage,
  CategorySelectionPage,
} from "./pages";

import { Footer, Navbar, NavbarTabs } from "./components";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <NavbarTabs />
        <div className="content-wrapper">
          <Routes>

            {/* Dashboard? */}
            <Route
              path="/"
              element={
                <>Working tabs: Artifacts, Builds, Leaderboards, My Profile</>
              }
            />

            <Route path="/artifacts" element={<ArtifactsPage />} />
            <Route path="/builds" element={<BuildsPage />} />

            {/* @KM: @TODO: /auth ? */}
            {/* <Route path="/auth" element={<>nothing here</>} /> */}

            {/* @KM: @TODO: /users ? */}
            {/* <Route path="/users" element={<>nothing here</>} /> */}

            {/* @KM: @TODO: /profile ? */}
            {/* <Route path="/profile" element={<>nothing here</>} /> */}
            <Route path="/profile/:uid" element={<ProfilePage />} />

            <Route path="/leaderboards" element={<CategorySelectionPage />} />
            <Route
              path="/leaderboards/:calculationId"
              element={<LeaderboardsPage />}
            />

            <Route path="*" element={"404"} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
