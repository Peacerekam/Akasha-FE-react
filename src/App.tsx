import {
  AccountsPage,
  ArtifactsPage,
  BuildsPage,
  CategorySelectionPage,
  DashboardPage,
  FAQPage,
  LeaderboardsPage,
  ProfilePage,
} from "./pages";
import {
  AdsComponentManager,
  Footer,
  Navbar,
  NavbarTabs,
  PageMessage,
} from "./components";
import { BASENAME, IS_PRODUCATION, MAINTENANCE_MODE } from "./utils/maybeEnv";
// import CookieConsent from "react-cookie-consent";
// import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React, { useEffect } from "react";

import { AdProviderContextProvider } from "./context/AdProvider/AdProviderContext";
import { ContentWrapper } from "./components/ContentWrapper";
import { HoverElementContextProvider } from "./context/HoverElement/HoverElementContext";
import { LastProfilesContextProvider } from "./context/LastProfiles/LastProfilesContext";
import { NotificationsContextProvider } from "./context/Notifications/NotificationsContext";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicy";
import { SessionDataContextProvider } from "./context/SessionData/SessionDataContext";
import { SettingsContextProvider } from "./context/SettingsProvider/SettingsProvider";
import { SettingsPage } from "./pages/SettingsPage";
import { TitleContextProvider } from "./context/TitleProvider/TitleProviderContext";
import { TranslationContextProvider } from "./context/TranslationProvider/TranslationProviderContext";
import axios from "axios";
import { domainRedirect } from "./utils/helpers";

// @TODO: env variables later on...
const urls = {
  "prod-mimee-ovh": "https://mimee.ovh",
  "prod-akasha-cv": "https://akasha.cv",
  localhost5033: "http://localhost:5033",
  localhost80: "http://localhost:80",
  // "game-rise-ovh": "http://54.39.29.82",
};

const getApiBaseURL = () => {
  if (IS_PRODUCATION) {
    return urls["prod-akasha-cv"];
  }

  return urls["localhost80"];
};

axios.defaults.baseURL = getApiBaseURL();
axios.defaults.withCredentials = true;

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  // console.log(config.url)
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  console.log(response.config.url, response.status, response.statusText)
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  const response = error.response;
  if (response) {
    console.log(response.config.url, response.status, response.statusText)
  }
  return Promise.reject(error);
});

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 30, // 30s
//     },
//   },
// });

const appRoutes: {
  path: string;
  Element: React.FC<any>;
  props?: any;
}[] = [
  { path: "/", Element: DashboardPage },
  { path: "/faq", Element: FAQPage },
  { path: "/artifacts", Element: ArtifactsPage },
  { path: "/builds", Element: BuildsPage },
  { path: "/profiles", Element: AccountsPage },
  { path: "/profile/:uid", Element: ProfilePage },
  { path: "/leaderboards", Element: CategorySelectionPage },
  { path: "/leaderboards/:calculationId", Element: LeaderboardsPage },
  { path: "/leaderboards/:calculationId/:variant", Element: LeaderboardsPage },
  { path: "/settings", Element: SettingsPage },
  { path: "/privacy-policy", Element: PrivacyPolicyPage },
  {
    path: "*",
    Element: PageMessage,
    props: { message: "404. Page not found." },
  },
];

const App = () => {
  useEffect(() => {
    domainRedirect();
  }, []);

  if (MAINTENANCE_MODE) {
    return (
      <LastProfilesContextProvider>
        <BrowserRouter basename={BASENAME}>
          <div id="top-of-the-page">
            {/* <NotificationBar /> */}
            <Navbar />
          </div>
          <NavbarTabs />

          <ContentWrapper>
            <HoverElementContextProvider>
              <Routes>
                <Route
                  path="*"
                  element={
                    <PageMessage message="Akasha is under maintenance right now.\nThis might take few hours." />
                  }
                />
              </Routes>
            </HoverElementContextProvider>
          </ContentWrapper>

          <Footer />
        </BrowserRouter>
      </LastProfilesContextProvider>
    );
  }

  return (
    // <QueryClientProvider client={queryClient}>
    <LastProfilesContextProvider>
      <SessionDataContextProvider>
        <BrowserRouter basename={BASENAME}>
          <NotificationsContextProvider>
            <AdProviderContextProvider>
              <TitleContextProvider>
                <TranslationContextProvider>
                  <div id="top-of-the-page">
                    {/* <NotificationBar /> */}
                    <Navbar />
                  </div>
                  <NavbarTabs />

                  <div className="flex-special-container mt-10">
                    <AdsComponentManager
                      adType="LeaderboardATF"
                      dataAdSlot="6204085735"
                      hybrid="desktop"
                    />
                  </div>

                  <ContentWrapper>
                    <SettingsContextProvider>
                      <HoverElementContextProvider>
                        <Routes>
                          {appRoutes.map((route) => {
                            const { Element, path } = route;

                            return (
                              <Route
                                key={path}
                                path={path}
                                element={<Element {...route?.props} />}
                              />
                            );
                          })}
                        </Routes>
                      </HoverElementContextProvider>
                    </SettingsContextProvider>

                    <div className="flex-special-container">
                      <AdsComponentManager
                        adType="LeaderboardBTF"
                        dataAdSlot="6204085735"
                        hybrid="mobile"
                      />
                      <AdsComponentManager adType="RichMedia" />
                    </div>
                  </ContentWrapper>

                  <Footer />
                </TranslationContextProvider>
              </TitleContextProvider>
            </AdProviderContextProvider>
          </NotificationsContextProvider>
        </BrowserRouter>
      </SessionDataContextProvider>
    </LastProfilesContextProvider>
    // </QueryClientProvider>
  );
};

export default App;
