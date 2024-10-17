import React, { useState } from "react";
import { ApiCall } from "../../services/ApiCall";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const formatDate = (dateString) => {
  return format(new Date(dateString), "MMMM dd, yyyy - HH:mm");
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`; // Format the time as "Xm Ys"
};

const History = () => {
  const fetchHistory = async () => {
    const response = await ApiCall("get", `/dishes/history`);
    console.log("From the API response:", response);
    return response.data; 
  };

  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 2;

  const {
    data: historyData = {}, 
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dishHistory", page],
    queryFn: fetchHistory,
    keepPreviousData: true,
  });

  console.log("History Data:", historyData);

  const dishes = historyData?.history || [];

  const handleNextPage = () => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      queryClient.prefetchQuery(["dishHistory", nextPage], fetchHistory);
      return nextPage;
    });
  };

  const handlePrevPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (isError) return <p className="text-danger text-center">Something went wrong: {error.message}</p>;

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Time sheet</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-light">
            <tr>
              <th scope="col">Date</th>
              <th>Dish</th>
              <th>Ingredients</th>
              <th>Qnty</th> {/* Inputted Quantity */}
              <th>Total Time</th> {/* Total Cooking Time */}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((dish, index) => (
              <tr key={index}>
                <td>{formatDate(dish.updatedAt)}</td>
                <td>{dish.name}</td>
                <td>
                  {dish.ingredients.map((ingredientObj) => (
                    <div key={ingredientObj._id}>
                      {ingredientObj.ingredient.name} (Quantity: {ingredientObj.quantity})
                    </div>
                  ))}
                </td>
                <td>{dish.inputedQuantity || 0} g</td> {/* Display Inputted Quantity */}
                <td>{formatTime(dish.totalCookingTime || 0)}</td> {/* Display Total Cooking Time */}
                <td>{dish.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between mt-3">
        <button
          className={`btn btn-primary ${page === 1 ? "disabled" : ""}`}
          onClick={handlePrevPage}
          disabled={page === 1}
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          className="btn btn-primary"
          onClick={handleNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default History;
