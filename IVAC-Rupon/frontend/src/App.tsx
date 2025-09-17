
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./dashboard/DashboardPage";
import LoginPage from "./LoginPage";
import NotFoundPage from "./NotFoundPage";
import ProfilePage from "./dashboard/ProfilePage";
import SettingsPage from "./dashboard/SettingsPage";
import IvacUserPage from "./dashboard/IvacUserPage";

function App() {
  
    const isLogedin = true;

    const commonRuotes = [
        {path:'/', element:<LoginPage/>},
        {path:'*', element:<NotFoundPage/>}
    ]

    const protectedRoutes = [
        {path:"/dashboard", element:<DashboardPage/>},
        {path:"/settings", element:<SettingsPage/>},
        {path:"/profile", element:<ProfilePage/>},
        {path:"/ivac-user", element:<IvacUserPage/>},

    ]

    const routes = isLogedin? [...protectedRoutes, ...commonRuotes]:[...commonRuotes];

    return (
        <BrowserRouter>
            <Routes>
                {
                    routes.map(({path, element}, index)=>(
                        <Route path={path} element={element}  key={index}/>
                    ))
                }
            </Routes>
        </BrowserRouter>

    );
  
}

export default App