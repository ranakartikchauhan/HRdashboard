import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed z-50 inset-0 flex items-center justify-center  bg-opacity-10">
            <div className="bg-white w-full max-w-lg rounded-md shadow-lg  relative">
                {/* Modal Header */}
                <div className="flex justify-between rounded-t-lg items-center border-b pb-3 pt-4 bg-primary">
                    <p></p>
                    <h2 className="text-xl text-center f text-white">{title}</h2>
                    <button onClick={onClose} className="text-white pr-6 text-2xl">&times;</button>
                </div>

                {/* Modal Content */}
                <div className="py-4 p-6">{children}</div>

            </div>
        </div>
    );
};

export default Modal;
