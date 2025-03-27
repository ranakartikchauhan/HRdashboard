import { FiSearch, FiUsers, FiClock, FiCalendar, FiLogOut } from "react-icons/fi";
import { Outlet ,Link} from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader"
import { logout } from "../api/authApi";

export function Dashboard() {
    return (
        <div className="font-sans">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-64  text-text-2 p-4 border-r border-gray-400">
                    <h1 className="text-2xl font-bold mb-8">Logo</h1>
                    <nav className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="px-4 py-2 w-full border border-gray-400 rounded-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                            />
                            <FiSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                        </div>

                        {/* Candidates Section */}
                        <div>
                            <h2 className="text-sm uppercase tracking-wider text-text-1 mb-2">Candidates</h2>
                            <ul className="ml-2 space-y-2">
                                <Link to="/dashboard" className="py-2 px-3 rounded  flex items-center gap-2 active:text-primary">
                                    <FiUsers className="h-5 w-5" />
                                    Candidates
                                </Link>
                            </ul>
                        </div>

                        {/* Employees Section */}
                        <div>
                            <h2 className="text-sm uppercase tracking-wider text-text-1 mb-2">Employees</h2>
                            <ul className="ml-2 space-y-2">
                                <li className="py-2 px-3 rounded flex items-center gap-2 hover:bg-gray-100">
                                    <FiUsers className="h-5 w-5" />
                                    <Link to="/dashboard/employees" className="w-full">Employees</Link>
                                </li>
                                <li className="py-2 px-3 rounded flex items-center gap-2 hover:bg-gray-100">
                                    <FiClock className="h-5 w-5" />
                                    <Link to="/dashboard/attendance" className="w-full">Attendance</Link>
                                </li>
                                <li className="py-2 px-3 rounded flex items-center gap-2 hover:bg-gray-100">
                                    <FiCalendar className="h-5 w-5" />
                                    <Link to="/dashboard/leaves" className="w-full">Leaves</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Logout */}
                        <div className="pt-8">
                        <h2 className="text-sm uppercase tracking-wider text-text-1 mb-2">Others</h2>
                            <button onClick={()=>logout()} className="py-2 px-3 rounded hover:bg-primary flex items-center gap-2 cursor-pointer">
                                <FiLogOut className="h-5 w-5" />
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <DashboardHeader/>
                    <Outlet />
                </div>
            </div>

        </div>
    )
}