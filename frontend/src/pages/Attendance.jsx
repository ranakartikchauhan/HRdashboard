import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Table from "../components/Table";
import { getEmployeesWithAttendance } from "../api/employeeApi";
import { updateAttendance, deleteAttendance, TaskAndAttendance } from "../api/attendanceApi";

export function Attendance() {
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [tempTasks, setTempTasks] = useState({});

    // Status color mapping
    const statusColors = {
        Present: {
            bg: "bg-green-100",
            text: "text-green-800",
            border: "border-green-300"
        },
        Absent: {
            bg: "bg-red-100",
            text: "text-red-800",
            border: "border-red-300"
        },
        "Medical Leave": {
            bg: "bg-blue-100",
            text: "text-blue-800",
            border: "border-blue-300"
        },
        "Work from Home": {
            bg: "bg-purple-100",
            text: "text-purple-800",
            border: "border-purple-300"
        },
        Late: {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            border: "border-yellow-300"
        },
        Holiday: {
            bg: "bg-indigo-100",
            text: "text-indigo-800",
            border: "border-indigo-300"
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const fetchAttendanceData = async () => {
        setIsLoading(true);
        try {
            const data = await getEmployeesWithAttendance();
            setAttendanceData(data || []);
            
            // Initialize tempTasks with current task values from backend
            const initialTasks = {};
            data.forEach(employee => {
                initialTasks[employee._id] = employee.attendance?.task || "";
            });
            setTempTasks(initialTasks);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const currentTask = tempTasks[id] || "";
            
            // Update local state
            setAttendanceData(prevData =>
                prevData.map(employee =>
                    employee._id === id
                        ? { 
                            ...employee, 
                            attendance: { 
                                ...(employee.attendance || {}), 
                                status: newStatus,
                                task: currentTask
                            } 
                        }
                        : employee
                )
            );

            // Save to API
            await TaskAndAttendance({
                employeeId: id,
                task: currentTask,
                status: newStatus
            });
        } catch (error) {
            console.error("Error updating attendance status:", error);
            fetchAttendanceData(); // Revert to original data on error
        }
    };

    const handleTaskChange = (id, newTask) => {
        // Only update the temporary task state
        setTempTasks(prev => ({
            ...prev,
            [id]: newTask
        }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            try {
                await deleteAttendance(id);
                setAttendanceData(prevData => prevData.filter(employee => employee._id !== id));
                setTempTasks(prev => {
                    const newTasks = {...prev};
                    delete newTasks[id];
                    return newTasks;
                });
            } catch (error) {
                console.error("Error deleting attendance record:", error);
            }
        }
    };

    const handleView = (employee) => {
        console.log("View employee details:", employee);
    };

    const getStatusClasses = (status) => {
        const defaultStatus = statusColors.Present;
        const selectedStatus = statusColors[status] || defaultStatus;
        return `${selectedStatus.bg} ${selectedStatus.text} ${selectedStatus.border}`;
    };

    const columns = [
        {
            header: "Profile",
            accessor: "profile",
            render: (value) => (
                <img src={value} alt="Profile" className="w-8 h-8 rounded-full" />
            ),
        },
        { header: "Employee Name", accessor: "name" },
        { header: "Position", accessor: "position" },
        { header: "Department", accessor: "department" },
        {
            header: "Task",
            accessor: "attendance.task",
            render: (value, row) => (
                <input
                    type="text"
                    value={tempTasks[row._id] || ""}
                    onChange={(e) => handleTaskChange(row._id, e.target.value)}
                    className="px-2 py-1 border rounded w-full"
                    placeholder="Assign task..."
                />
            ),
        },
        {
            header: "Status",
            accessor: "attendance.status",
            render: (value, row) => {
                const currentStatus = row.attendance.status || "Present";
                return (
                    <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(row._id, e.target.value)}
                        className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusClasses(currentStatus)}`}
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Medical Leave">Medical Leave</option>
                        <option value="Work from Home">Work from Home</option>
                        <option value="Late">Late</option>
                        <option value="Holiday">Holiday</option>
                    </select>
                );
            },
        },
    ];

    const actions = [
        { label: "View Details", handler: (employee) => handleView(employee) },
        { label: "Delete", handler: (employee) => handleDelete(employee._id) },
    ];

    const filteredEmployees = attendanceData.filter((employee) => {
        const matchesSearch =
            employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department?.toLowerCase().includes(searchTerm.toLowerCase());

        const currentStatus = employee.attendance?.status || "Present";
        const matchesStatus = statusFilter === "All" || currentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Attendance</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <select
                        className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        {Object.keys(statusColors).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="relative w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search by name or department..."
                        className="px-4 py-2 w-full border border-gray-400 rounded-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {isLoading && !attendanceData.length ? (
                <div className="text-center py-8">Loading attendance data...</div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">No attendance records found</div>
            ) : (
                <Table 
                    columns={columns} 
                    data={filteredEmployees.map(emp => ({
                        ...emp,
                        attendance: emp.attendance || { status: "Present", task: "" }
                    }))} 
                    actions={actions} 
                />
            )}
        </div>
    );
}