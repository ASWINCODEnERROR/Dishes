import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";
import Swal from "sweetalert2";
import EditInc from "./EditInc";

const ITEMS_PER_PAGE = 5;

const Ingredients = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState({});
  console.log(selectedIngredient, "///////////////////////////////////////");

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this ingredient?",
      text: `You are about to delete ${name}. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCall("delete", `/ing/${id}`);
        if (response.status) {
          queryClient.invalidateQueries(["ingredients"]);
          queryClient.invalidateQueries(["dishes"]);
          Swal.fire("Deleted!", `${name} has been deleted.`, "success");
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error("Error deleting ingredient", error.message);
        Swal.fire(
          "Error!",
          `Failed to delete ${name}: ${error.message}`,
          "error"
        );
      }
    }
  };

  const handleUpdate = (ingredient) => {
    setEditModalVisible(true);
    console.log("Updating ingredient:", ingredient);
    setSelectedIngredient(ingredient);
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
    queryKey: ["ingredients"], 
    queryFn: fetchIngredients, 
  });

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-danger">An error occurred: {error.message}</div>
    );
  }

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="section search-result-wrap">
      <div className="container">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div className="heading">Category: Ingredients</div>
            <div>
              <button
                
                onClick={() => handleUpdate()}
                className="btn btn-sm mb-5 btn-outline-primary"
              >
                Add Ingredient
              </button>
            </div>
          </div>
        </div>
        <div className="row posts-entry">
          <div className="col-lg-8">
            <div className="container mx-auto mt-5">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr className="bg-light">
                    <th scope="col" className="py-2 px-4">
                      Name
                    </th>
                    <th scope="col" className="py-2 px-4">
                      Stock Quantity
                    </th>
                    <th scope="col" className="py-2 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((ingredient) => (
                    <tr key={ingredient.id || ingredient._id}>
                      <td className="py-2 px-4">{ingredient.name}</td>
                      <td className="py-2 px-4">{ingredient.stockQuantity}</td>
                      <td className="py-2 px-4">
                        <button
                          className="btn btn-primary btn-sm  " 
                          style={{ marginRight: '8px' }} 
                          onClick={() => handleUpdate(ingredient)} 
                        >
                          <i className="fas fa-edit"> Edit</i>
                        </button>
                        <button
                          className="btn btn-danger btn-sm ml-10"
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

             
              <div className="mt-4 d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
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
                  className="btn btn-secondary"
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

        <EditInc
          show={editModalVisible}
          onHide={() => {
            setEditModalVisible(false);
            setSelectedIngredient(null);
          }}
          ingredientId={selectedIngredient?._id || ""}
          ingredientDatas={selectedIngredient}
        />
      </div>
    </div>
  );
};

export default Ingredients;
