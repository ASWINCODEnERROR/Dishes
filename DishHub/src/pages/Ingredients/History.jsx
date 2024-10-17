import React, { useState } from "react";
import { ApiCall } from "../../services/ApiCall";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import Spinner from "react-bootstrap/Spinner"; 

const formatDate = (dateString) => {
  return format(new Date(dateString), "MMMM dd, yyyy - HH:mm");
};

const History = () => {
  const fetchHistory = async ({ page, limit }) => {
    const response = await ApiCall("get", `/dishes/history`);
    console.log("From the API response:", response);
    return response.data;
  };

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); 
  const {
    data: historyData = {},
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dishHistory", page, limit],
    queryFn: () => fetchHistory({ page, limit }),
    keepPreviousData: true,
  });

  const dishes = historyData?.history || [];
  const totalPages = historyData?.totalPages || 1;

  const handleNextPage = () => {
    setPage((prevPage) => Math.min(prevPage + 1, totalPages));
    queryClient.prefetchQuery(["dishHistory", page + 1, limit], () => fetchHistory({ page: page + 1, limit }));
  };

  const handlePrevPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1); 
  };

  if (isLoading)
    return (
      <div className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );

  if (isError)
    return (
      <p className="text-danger text-center">
        Something went wrong: {error.message}
      </p>
    );

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Time sheet</h2>

      {/* Page size control */}
      {/* <div className="d-flex justify-content-end mb-3">
        <label className="me-2">Records per page:</label>
        <select value={limit} onChange={handleLimitChange} className="form-select w-auto">
          <option value="2">2</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div> */}

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
            {dishes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No records found.
                </td>
              </tr>
            ) : (
              dishes.map((dish, index) => (
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
