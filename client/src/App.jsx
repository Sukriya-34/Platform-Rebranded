import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
function App() {
  // 1. We look at the web browser's search bar to see what the path is
  const currentPath = window.location.pathname;
  //set up a variable to hold the page we want to show
  let CurrentPage;

  // We check the URL and assign the correct page component
  if (currentPath === "/login") {
    CurrentPage = Login;
  } else if (currentPath === "/forgot-password") {
    CurrentPage = ForgotPassword;
  } else {
    CurrentPage = Signup;
  }
  return (
    <div className="w-full h-full">
      {/* {currentPath === "/login" ? <Login /> : <Signup />} */}
      <CurrentPage />
    </div>
  );
}

export default App;
