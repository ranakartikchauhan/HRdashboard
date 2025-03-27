import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { getEmployees, deleteEmployee, createEmployee } from "../api/employeeApi";

export function Employee() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employeeData, setEmployeeData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [positionFilter, setPositionFilter] = useState("All");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        dateOfJoining: "",
        profile: null
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setIsLoading(true);
        try {
            const { data } = await getEmployees();
            setEmployeeData(data || []);
        } catch (error) {
            console.error("Error fetching employees:", error);
        } finally {
            setIsLoading(false);
        }
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
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            try {
                await deleteEmployee(id);
                setEmployeeData(prevData => prevData.filter(employee => employee._id !== id));
            } catch (error) {
                console.error("Error deleting employee:", error);
            }
        }
    };

    const handleEdit = (employee) => {
        setFormData({
            id: employee.id,
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            position: employee.position,
            department: employee.department,
            dateOfJoining: employee.dateOfJoining.split('T')[0], // Format date for input
            profile: null,
            profileUrl: employee.profile
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            profile: e.target.files[0],
            profileUrl: "" // Clear previous URL when new file is selected
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Upload image to Cloudinary first if a new file was selected
            let profileUrl = formData.profileUrl;
            if (formData.profile) {
                profileUrl = await uploadToCloudinary(formData.profile);
            }

            // Prepare employee data
            const employeePayload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                department: formData.department,
                dateOfJoining: formData.dateOfJoining,
                profile: profileUrl
            };

            // Either create or update employee
            let response;
            if (formData.id) {
                response = await updateEmployee(formData.id, employeePayload);
                setEmployeeData(prev => prev.map(emp =>
                    emp.id === formData.id ? response.data : emp
                ));
            } else {
                response = await createEmployee(employeePayload);
                // setEmployeeData(prev => [...prev, response.data]);
            }

            // Reset form and close modal
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving employee:", error);
            alert("Failed to save employee. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            email: "",
            phone: "",
            position: "",
            department: "",
            dateOfJoining: "",
            profile: null,
            profileUrl: ""
        });
    };


    const actions = [
        { label: "Edit", handler: handleEdit },
        { label: "Delete", handler :(row)=> handleDelete(row._id) }
    ];

    const columns = [
        {
            header: "Profile",
            accessor: "profile",
            render: (value) => (
                value ? (
                    <img
                        src={typeof value === 'string' ? value : URL.createObjectURL(value)}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs">No Image</span>
                    </div>
                )
            )
        },
        { header: "Employee Name", accessor: "name" },
        { header: "Email Address", accessor: "email" },
        { header: "Phone Number", accessor: "phone" },
        { header: "Position", accessor: "position" },
        { header: "Department", accessor: "department" },
        {
            header: "Date of Joining",
            accessor: "dateOfJoining",
            render: (value) => new Date(value).toLocaleDateString()
        },
    ];

    const filteredEmployees = employeeData.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPosition = positionFilter === "All" || employee.position === positionFilter;

        return matchesSearch && matchesPosition;
    });

    return (
        <div className="p-8">
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        position: "",
                        department: "",
                        dateOfJoining: "",
                        profile: null
                    });
                }}
                title={formData.id ? "Edit Employee" : "Add New Employee"}
            >
                <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                    <div className="col-span-2">
                        <label className="block text-sm text-purple-700">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Full Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Email Address*</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Phone Number*</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Position*</label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        >
                            <option value="">Select Position</option>
                            <option value="Intern">Intern</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Team Lead">Team Lead</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Department*</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Date of Joining*</label>
                        <input
                            type="date"
                            name="dateOfJoining"
                            value={formData.dateOfJoining}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                required
                                className="accent-purple-700"
                            />
                            <span className="text-sm text-gray-600">
                                I hereby declare that the above information is true to the best of my knowledge and belief.
                            </span>
                        </label>
                    </div>
                    <div className="col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Processing..." : "Submit"}
                        </button>
                    </div>
                </form>
            </Modal>

            <h2 className="text-2xl font-bold mb-6">Employees</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8"
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                        >
                            <option value="All">All Positions</option>
                            <option value="Intern">Intern</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Junior">Junior</option>
                            <option value="Senior">Senior</option>
                            <option value="Team Lead">Team Lead</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Search by name, email or position..."
                            className="px-4 py-2 w-full border border-gray-400 rounded-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FiSearch className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-purple-800 transition-colors whitespace-nowrap"
                    >
                        Add Employee
                    </button>
                </div>
            </div>

            {isLoading && !employeeData.length ? (
                <div className="text-center py-8">Loading employees...</div>
            ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">No employees found</div>
            ) : (
                <Table
                    columns={columns}
                    data={filteredEmployees}
                    actions={actions}
                />
            )}
        </div>
    );
}