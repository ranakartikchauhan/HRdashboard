import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Table from "../components/Table";
import Modal from "../components/Modal";
import { getCandidates, createCandidate ,changeCandidateStatus, deleteCandidate} from "../api/candidateApi";

export function Candidate() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [candidateData, setCandidateData] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [positionFilter, setPositionFilter] = useState("All");

    // Fetch candidates from API
    useEffect(() => {
        const fetchCandidates = async () => {
            setIsLoading(true);
            try {
                const data = await getCandidates();
                setCandidateData(data.data || []);
            } catch (error) {
                console.error("Error fetching candidates:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCandidates();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await changeCandidateStatus(id, newStatus); // Call API to update status
            setCandidateData(prevData =>
                prevData.map(candidate =>
                    candidate._id === id ? { ...candidate, status: newStatus } : candidate
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status. Please try again.");
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
            console.error("Error uploading resume:", error);
            throw error;
        }
    };

    const handleAddCandidate = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(event.target);

            // Upload resume first
            let resumeUrl = null;
            if (resumeFile) {
                resumeUrl = await uploadToCloudinary(resumeFile);
            }

            const newCandidate = {
                name: formData.get("name"),
                email: formData.get("email"),
                phone: formData.get("phone"),
                position: formData.get("position"),
                experience: formData.get("experience"),
                status: "New",
                resume: resumeUrl,
            };

            const savedCandidate = await createCandidate(newCandidate);
            setCandidateData(prev => [...prev, savedCandidate]);
            setIsModalOpen(false);
            setResumeFile(null);
            event.target.reset(); // Reset the form
        } catch (error) {
            console.error("Error adding candidate:", error);
            alert("Failed to add candidate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCandidate = async (id) => {
        if (window.confirm("Are you sure you want to delete this candidate?")) {
            try {
                await deleteCandidate(id)
            } catch (error) {
                console.error("Error deleting candidate:", error);
            }
        }
    };

    const handleDownloadResume = (candidate) => {
        if (!candidate.resume) {
            alert("No resume available for this candidate");
            return;
        }
        window.open(candidate.resume, "_blank");
    };

    const actions = [
        {
            label: "Download Resume",
            handler: (resume) => handleDownloadResume(resume)
        },
        {
            label: "Delete Candidate",
            handler: (row) => handleDeleteCandidate(row._id)
        }
    ];

    const columns = [
        { header: "Sr No.", accessor: "id" },
        { header: "Candidate Name", accessor: "name" },
        { header: "Email Address", accessor: "email" },
        { header: "Phone Number", accessor: "phone" },
        { header: "Position", accessor: "position" },
        {
            header: "Status",
            accessor: "status",
            render: (value, row) => (
                <select
                    value={value}
                    onChange={(e) => handleStatusChange(row._id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${value === "New" ? "bg-blue-100 text-blue-800 border-blue-300" :
                            value === "Selected" ? "bg-green-100 text-green-800 border-green-300" :
                                "bg-red-100 text-red-800 border-red-300"
                        }`}
                >
                    <option value="New">New</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                </select>
            ),
        },
        { header: "Experience", accessor: "experience", render: (value) => `${value} years` },
    ];

    // Filter candidates based on search term and filters
    const filteredCandidates = candidateData.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.position.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || candidate.status === statusFilter;
        const matchesPosition = positionFilter === "All" || candidate.position === positionFilter;

        return matchesSearch && matchesStatus && matchesPosition;
    });

    return (
        <div className="p-8">
            {/* Add Candidate Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Candidate">
                <form className="grid grid-cols-2 gap-4" onSubmit={handleAddCandidate}>
                    <div>
                        <label className="block text-sm text-purple-700">Full Name*</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Email Address*</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Phone Number*</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Position*</label>
                        <input
                            type="text"
                            name="position"
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Experience (years)*</label>
                        <input
                            type="number"
                            name="experience"
                            min="0"
                            step="0.5"
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-purple-700">Resume*</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setResumeFile(e.target.files[0])}
                            required
                            className="w-full border rounded px-3 py-2 outline-purple-500"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" required className="accent-purple-700" />
                            <span className="text-sm text-gray-600">
                                I hereby declare that the above information is true to the best of my knowledge and belief.
                            </span>
                        </label>
                    </div>
                    <div className="col-span-2 text-right">
                        <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded-full disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </form>
            </Modal>

            <h2 className="text-2xl font-bold mb-6">Candidates</h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-2 pr-8"
                            value={positionFilter}
                            onChange={(e) => setPositionFilter(e.target.value)}
                        >
                            <option value="All">All Positions</option>
                            <option value="Designer">Designer</option>
                            <option value="Developer">Developer</option>
                            <option value="Human Resource">Human Resource</option>
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
                        className="bg-primary text-white px-4 py-2 rounded-full whitespace-nowrap"
                    >
                        Add Candidate
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            {isLoading ? (
                <div className="text-center py-8">Loading candidates...</div>
            ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8">No candidates found</div>
            ) : (
                <Table
                    columns={columns}
                    data={filteredCandidates}
                    actions={actions}
                />
            )}
        </div>
    );
}