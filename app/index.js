import Login from './auth/Login';
import Dashboard from './dashboard/Dashboard';
import StaffDashboard from './dashboard/StaffDashboard';
import getProfile from '../hook/getProfile';
import { ROLES } from '../constants';

const App = () => {

    // Check Session
    const session = getProfile();

    return session.profile && session.profile.role ? (session.profile.role == ROLES.customer ? <Dashboard/> : <StaffDashboard/>) : <Login/>;
}

export default App;