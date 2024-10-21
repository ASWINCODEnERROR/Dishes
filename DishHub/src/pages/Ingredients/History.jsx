import React, { useState } from "react";
import { ApiCall } from "../../services/ApiCall";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Spinner from "react-bootstrap/Spinner"; 
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const formatDate = (dateString) => {
  return format(new Date(dateString), "MMMM dd, yyyy - HH:mm");
};

const History = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  
  // State for search criteria
  const [searchDishName, setSearchDishName] = useState('');
  const [searchDate, setSearchDate] = useState(null);
  const [searchStatus, setSearchStatus] = useState('');

  const fetchHistory = async () => {
    // Constructing the query parameters based on search inputs
    const params = new URLSearchParams();
    if (searchDishName) params.append('name', searchDishName);
    if (searchDate) params.append('date', format(searchDate, "yyyy-MM-dd")); // Format date to yyyy-MM-dd
    if (searchStatus) params.append('status', searchStatus);
    params.append('page', page); // Include pagination
    params.append('limit', limit); // Include limit

    const response = await ApiCall("get", `/dishes/history?${params.toString()}`);
    console.log("From the API response:", response);
    return response.data;
  };

  const { data: historyData = {}, isLoading, isError, error } = useQuery({
    queryKey: ["dishHistory", searchDishName, searchDate, searchStatus, page, limit],
    queryFn: fetchHistory,
    keepPreviousData: true,
  });

  const dishes = historyData?.history || [];
  const totalPages = historyData?.totalPages || 1;

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
    queryClient.prefetchQuery(["dishHistory", searchDishName, searchDate, searchStatus, page + 1, limit], fetchHistory);
  };

  const handlePrevPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1); 
  };

  // Improved filtering logic for date
  const filteredDishes = dishes.filter(dish => {
    const matchesDishName = dish.name.toLowerCase().includes(searchDishName.toLowerCase());
    const matchesDate = searchDate ? new Date(dish.updatedAt).toDateString() === searchDate.toDateString() : true; // Check if date matches
    const matchesStatus = searchStatus ? dish.status.toLowerCase().includes(searchStatus.toLowerCase()) : true; // Check if status matches
    return matchesDishName && matchesDate && matchesStatus;
  });

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Time sheet</h2>

      {/* Search Fields */}
      <div className="mb-4 d-flex align-items-center">
  <input
    type="text"
    className="form-control me-3 flex-fill history"
    placeholder="Search by dish name..."
    value={searchDishName}
    onChange={(e) => setSearchDishName(e.target.value)}
  />
  <select
    className="form-control me-3 flex-fill style history"
    value={searchStatus}
    onChange={(e) => setSearchStatus(e.target.value)}
  >
    <option value="">Select Status...</option>
    <option value="cooking started">Cooking Started</option>
    <option value="cooking ended">Cooking Ended</option>
  </select>
  <DatePicker
    selected={searchDate}
    onChange={(date) => setSearchDate(date)}
    className="form-control flex-fill history"
    placeholderText="Select a date..."
    dateFormat="MMMM d, yyyy"
    
  />
</div>


      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center">
          <thead className="table-light">
            <tr>
              <th scope="col">Date</th>
              <th>Dish</th>
              <th>Ingredients</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center">
                  <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : filteredDishes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredDishes.map((dish, index) => (
                <tr key={index}>
                  <td>{formatDate(dish.updatedAt)}</td>
                  <td className="text-truncate">{dish.name}</td>
                  <td className="text-truncate">
                    {dish.ingredients.map((ingredientObj) => (
                      <div key={ingredientObj._id}>
                        {ingredientObj.ingredient.name}
                      </div>
                    ))}
                  </td>
                  <td className="text-center align-middle">
                    <span
                      className={`badge ${
                        dish.status === "cooking started"
                          ? "bg-success"
                          : "bg-danger"
                      } p-2`}
                    >
                      {dish.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className={`btn btn-primary ${page === 1 ? "disabled" : ""}`}
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="btn btn-primary"
          onClick={handleNextPage}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default History;
