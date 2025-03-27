import React, { useState, useEffect, useRef } from "react";

const Table = ({ columns, data, actions }) => {
  const [openRowIndex, setOpenRowIndex] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenRowIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-primary">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions?.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
                {actions?.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                    {/* Three dots button */}
                    <button
                      onClick={() => setOpenRowIndex(openRowIndex === rowIndex ? null : rowIndex)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      ⋮
                    </button>

                    {/* Dropdown Menu */}
                    {openRowIndex === rowIndex && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 mt-2 w-44 bg-white rounded divide-y divide-gray-100 shadow z-10"
                        style={{
                          transform: "translate3d(0px, 10px, 0px)", // Adjusts dropdown positioning
                        }}
                      >
                        <ul className="py-1 text-sm text-gray-700">
                          {actions.map((action, actionIndex) => (
                            <li key={actionIndex}>
                              <button
                                onClick={() => {
                                  action.handler(row);
                                  setOpenRowIndex(null);
                                }}
                                className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                              >
                                {action.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
