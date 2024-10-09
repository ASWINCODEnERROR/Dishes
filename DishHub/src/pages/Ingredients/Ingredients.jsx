import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";
import Createinc from "./Createinc";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 5;

const Ingredients = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this ingredient?",
      text: `You are about to delete ${name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel it!',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await ApiCall("delete", `/ing/${id}`);
        if (response.status) {
          queryClient.invalidateQueries(["ingredients"]);
          Swal.fire('Deleted!', `${name} has been deleted.`, 'success'); // Show success message
          console.log(`Deleted ingredient with name: ${name}`);
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting ingredient", error.message);
        Swal.fire('Error!', `Failed to delete ${name}: ${error.message}`, 'error'); // Show error message
      }
    }
  };
  

  const handleUpdate = async () => {
    try {
      const response = await ApiCall("put", `/ing/${ingredient._id}`, {
        stockQuantity,
      });
      if (response.status) {
        onclose();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("updateing ingredient", error.message);
    }
  };

  const fetchIngredients = async () => {
    console.log("Fetching ingredients...");
    const response = await ApiCall("get", "/ing");
    if (response.status) {
      console.log("THE RESPONSE DATA", response?.data);
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["ingredients"], // Unique key for the query
    queryFn: fetchIngredients, // Function to fetch data
  });

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">An error occurred: {error.message}</div>
    );
  }

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // const handleDelete = (id) => {
  //   console.log(`Delete ingredient with ID: ${id}`);
  // };

  return (
    <div className="section search-result-wrap">
      <div className="container">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div className="heading">Category: Ingredients</div>
            <div>
              <button
                onClick={() => setModalVisible(true)}
                className="btn btn-sm mb-5 btn-outline-primary "
              >
                Add Ingredient
              </button>
            </div>
          </div>
        </div>
        <div className="row posts-entry">
          <div className="col-lg-12 borde red 1px">
            <div className="container mx-auto mt-5">
              <table className="table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Name
                    </th>
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Stock Quantity
                    </th>
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((ingredient) => (
                    <tr
                      key={ingredient.id || ingredient._id}
                      className="hover:bg-gray-100"
                    >
                      <td className="py-2 px-4 border border-gray-300">
                        {ingredient.name}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        {ingredient.stockQuantity}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                          onClick={() => handleUpdate(ingredient)} // Pass the whole ingredient object
                        >
                          <i className="fas fa-edit text-black">edit</i>
                        </button>
                        <button
                          className="bg-red-500 text-black px-3 py-1 rounded"
                          onClick={() =>
                            handleDelete(ingredient.id || ingredient._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <Createinc show={modalVisible} onHide={() => setModalVisible(false)} />
      </div>
    </div>
  );
};

export default Ingredients;
