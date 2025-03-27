import { useState, useEffect, useRef } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";
import Table from "../components/Table";
import Modal from "../components/Modal";
import {
    getLeaves,
    updateLeaveStatus,
    createLeave,
    deleteLeave,
} from "../api/leaveApi";

import { searchEmployees } from "../api/employeeApi";

export function Leave() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [date, setDate] = useState(new Date());
    const [leaveData, setLeaveData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [newLeave, setNewLeave] = useState({
        employeeId: "",
        name: "",
        employeeId: "",
        designation: "",
        leaveDate: "",
        reason: "",
        document: null
    });
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
    const [employeeResults, setEmployeeResults] = useState([]);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch leaves from API
    useEffect(() => {
        fetchLeaves();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowEmployeeDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Search employees when search term changes
    useEffect(() => {
        if (employeeSearchTerm.trim() === "") {
            setEmployeeResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            try {
                const results = await searchEmployees(employeeSearchTerm);
                setEmployeeResults(results.data || []);
                setShowEmployeeDropdown(true);
            } catch (error) {
                console.error("Error searching employees:", error);
                setEmployeeResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [employeeSearchTerm]);

    const fetchLeaves = async (selectedDate = null) => {
        setIsLoading(true);
        try {
            const data = await getLeaves(selectedDate);
            setLeaveData(data.data || []);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            // Optimistic UI update
            setLeaveData(prevData =>
                prevData.map(leave =>
                    leave._id === id ? { ...leave, status: newStatus } : leave
                )
            );

            // API call to update status
            await updateLeaveStatus(id, newStatus);
        } catch (error) {
            console.error("Error updating leave status:", error);
            fetchLeaves(); // Revert to original data if error occurs
        }
    };

    const handleDeleteLeave = async (id) => {
        if (window.confirm("Are you sure you want to delete this leave record?")) {
            try {
                await deleteLeave(id);
                setLeaveData(prevData => prevData.filter(leave => leave._id !== id));
            } catch (error) {
                console.error("Error deleting leave:", error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setNewLeave(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleEmployeeSearchChange = (e) => {
        setEmployeeSearchTerm(e.target.value);
        if (e.target.value === "") {
            setNewLeave(prev => ({
                ...prev,
                employeeName: "",
                employeeId: "",
                designation: ""
            }));
        }
    };

    const handleEmployeeSelect = (employee) => {
        console.log(employee)
        setNewLeave(prev => ({
            ...prev,
            employeeName: employee.name,
            employeeId: employee._id,
        }));
        setEmployeeSearchTerm(employee.name);
        setShowEmployeeDropdown(false);
    };

    const clearEmployeeSelection = () => {
        setEmployeeSearchTerm("");
        setNewLeave(prev => ({
            ...prev,
            employeeName: "",
            employeeId: "",
            designation: ""
        }));
        setEmployeeResults([]);
    };

    const uploadToCloudinary = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error("Error uploading resume:", error);
            throw error;
        }
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        try {
            // Upload document to Cloudinary if it exists
            let documentUrl = null;
            if (newLeave.document) {
                documentUrl = await uploadToCloudinary(newLeave.document);
            }

            // Prepare the data to send to your API
            const leaveData = {
                employeeName: newLeave.employeeName,
                employeeId: newLeave.employeeId,
                designation: newLeave.designation,
                date: newLeave.leaveDate,
                reason: newLeave.reason,
                docs: documentUrl // This will be the Cloudinary URL or null
            };

            // Send the data to your API
            const response = await createLeave(leaveData);

            // Update state and reset form
            // setLeaveData(prev => [...prev, response.data]);
            setIsModalOpen(false);
            setNewLeave({
                name: "",
                employeeId: "",
                designation: "",
                leaveDate: "",
                reason: "",
                document: null
            });
            setEmployeeSearchTerm("");
        } catch (error) {
            console.error("Error creating leave:", error);
            // You might want to add error handling here (e.g., show a toast notification)
        }
    };


    const columns = [
        {
            header: "Employee",
            accessor: "employeeId",
            render: (employee) => (
                (!employee)?
                     <p></p>
                :
                <div className="flex items-center">
                    <img
                        src={employee.profile}
                        alt={employee.name}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.department}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Date",
            accessor: "date",
            render: (date) => new Date(date).toLocaleDateString()
        },
        { header: "Reason", accessor: "reason" },
        {
            header: "Status",
            accessor: "status",
            render: (status, row) => (
                <select
                    value={status}
                    onChange={(e) => handleStatusChange(row._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${status === "Pending" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        status === "Approved" ? "bg-green-100 text-green-800 border-green-300" :
                            "bg-red-100 text-red-800 border-red-300"
                        }`}
                >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            ),
        },
        {
            header: "Document",
            accessor: "docs",
            render: (doc) => (
                doc ? (
                    <a
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                        View
                    </a>
                ) : null
            )
        },
        {
            header: "Actions",
            accessor: "_id",
            render: (id) => (
                <button
                    onClick={() => handleDeleteLeave(id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                >
                    Delete
                </button>
            )
        }
    ];

    return (
        <div className="p-8">
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Leave">
                <form onSubmit={handleSubmitLeave} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 relative" ref={dropdownRef}>
                        <label className="block text-sm text-purple-700">Employee*</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={employeeSearchTerm}
                                onChange={handleEmployeeSearchChange}
                                className="w-full border rounded px-3 py-2 outline-purple-500 pr-10"
                                placeholder="Search employee..."
                                required
                                onFocus={() => employeeSearchTerm && setShowEmployeeDropdown(true)}
                            />
                            {employeeSearchTerm ? (
                                <button
                                    type="button"
                                    onClick={clearEmployeeSelection}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FiX />
                                </button>
                            ) : (
                                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            )}
                        </div>
                        {showEmployeeDropdown && employeeResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                {employeeResults.map(employee => (
                                    <div
                                        key={employee.id}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                        onClick={() => handleEmployeeSelect(employee)}
                                    >
                                        <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                                            {employee.name?.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-medium">{employee.name}</div>
                                            <div className="text-xs text-gray-500">{employee.designation}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-purple-700">Designation*</label>
                        <input
                            type="text"
                            name="designation"
                            value={newLeave.designation}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700">Leave Date*</label>
                        <input
                            type="date"
                            name="leaveDate"
                            value={newLeave.leaveDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2 mt-1 outline-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Document</label>
                        <div className="mt-1 flex items-center">
                            <input
                                type="file"
                                name="document"
                                onChange={handleInputChange}
                                className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-purple-50 file:text-purple-700
                                            hover:file:bg-purple-100"
                            />
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm text-purple-700">Reason*</label>
                        <textarea
                            name="reason"
                            value={newLeave.reason}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                            required
                            rows={3}
                        />
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800 transition-colors"
                        >
                            Submit Leave
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Rest of your component remains the same */}
            <h2 className="text-2xl font-bold">Leaves</h2>
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="px-4 py-2 w-full border border-gray-400 rounded-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-purple-800 transition-colors"
                    >
                        Add Leave
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading leave data...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {leaveData.length === 0 ? (
                        <div className="lg:col-span-2 text-center py-8 lg:col-span-3">No leave records found</div>
                    ) : (
                        <div className="lg:col-span-2">
                            <Table columns={columns} data={leaveData} />
                        </div>
                    )}

                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <Calendar
                                onChange={(newDate) => {
                                    setDate(newDate);
                                    fetchLeaves(newDate);
                                }}
                                value={date}
                                className="border-0 w-full"
                            />
                        </div>

                        <div className="bg-white rounded-lg shadow p-4">
                            <h2 className="text-lg font-semibold mb-2">Approved Leaves</h2>
                            {leaveData
                                .filter(leave => leave.status === "Approved")
                                .slice(0, 3)
                                .map(leave => (
                                    <div key={leave.id} className="flex items-center space-x-3 p-3 border-b">
                                        <img src={leave.employeeId.profile} className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center"/>
                                          
                                        <div>
                                            <div className="font-medium">{leave.employeeId.name}</div>
                                            <div className="text-sm text-gray-500">{new Date(leave.date).toDateString()} </div>
                                            <div className="text-sm text-gray-500">{leave.name}</div>
                                        </div>
                                    </div>
                                ))
                            }
                            <button className="mt-3 text-blue-500 text-sm font-medium">
                                View All Leaves
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}