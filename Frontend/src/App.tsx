import "./App.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import JoinRoom from "./components/JoinRoom/JoinRoom";
import SignInPage from "./components/SignIn/SignInPage";
import SignUpPage from "./components/SignUp/SignupPage";
import ForgotPasswordPage from "./components/ForgetPassword/ForgotPasswordPage";
import ValidateResetPasswordCode from "./components/ValidateCode/ValidateCode";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import HomePage from "./components/HomePage/HomePage";
import TempPageForActivation from "./components/TempPageForActivation/TempPageForActivation";
import ProblemList from "./components/ProblemList/ProblemList";
import PendingStartRoom from "./components/PendingStartRoom/PendingStartRoom";
import PlayerNamePendingPage from "./components/PlayerNamePendingPage/PlayerNamePendingPage";
import GamePage from "./components/GamePage/GamePage";
import ResultPage from "./components/ResultPage/ResultPage";
import HistoryPage from "./components/HistoryPage/HistoryPage";
import HistoryRecord from "./components/HistoryRecordDetail/HistoryRecordPage";
import UserProfilePage from "./components/UserPorfilePage/UserProfilePage";
import { UserProvider } from "./context/UserContext";
import ProtectedLayers from "./components/ProtectedLayers/ProtectedLayers";
import ProtectResetLayers from "./components/ProtectedLayers/ProtectResetLayers";


function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          {/* PUBLIC ROUTES (No UserProvider, No Cookie Validation Required) */}
          <Route path="/" element={<JoinRoom />} />
          <Route path="/SignIn" element={<SignInPage />} />
          <Route path="/SignUp" element={<SignUpPage />} />
          <Route path="/ActivationTempPage" element={<TempPageForActivation />} />
          <Route path="/ForgotPassword" element={<ForgotPasswordPage />} />
          <Route path="/PlayerNamePendingPage/:roomId" element={<PlayerNamePendingPage />} />
          <Route path="/PendingStartRoom/:userId/:username/:roomId/:problem_set_id" element={<PendingStartRoom />} />
          <Route path="/GamePage/:userId/:username/:roomId/:problem_set_id" element={<GamePage />} />
          <Route path="/ResultPage/:userId/:username/:roomId" element={<ResultPage />} />
          {/* PROTECT PASSWORD RESET PAGES */}
          <Route element={<ProtectResetLayers />}>
            <Route path="/ValidateResetPasswordCode" element={<ValidateResetPasswordCode />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
          </Route>
          {/* PROTECTED ROUTES (Automatically Wrapped in UserProvider) */}
          <Route element={<ProtectedLayers />}>
            <Route path="/Home" element={<HomePage />} />
            <Route path="/ProblemList/:problem_set_id" element={<ProblemList />} />
            <Route path="/HistoryPage/:userId" element={<HistoryPage />} />
            <Route path="/HistoryRecord/:recordId/:snapShotId" element={<HistoryRecord />} />
            <Route path="/UserProfilePage/:userId" element={<UserProfilePage />} />
          </Route>
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App