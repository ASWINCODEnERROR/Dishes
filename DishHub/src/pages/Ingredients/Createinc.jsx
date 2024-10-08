import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";

const Createinc = ({ show, onHide }) => {
  const queryClient = useQueryClient();

  // Updated state for the new ingredient with stockQuantity
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    stockQuantity: 0, // New field for stock quantity
  });

  // Function to create a new ingredient using mutation
  const createIngredient = async (ingredient) => {
    const response = await ApiCall("post", "/ing", ingredient);
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  // Mutation hook for creating the ingredient
  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients"]); // Invalidate the query to refresh ingredient list
      onHide(); // Close the modal after success
      setNewIngredient({ name: "", stockQuantity: 0 }); // Reset form
    },
  });

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    createIngredientMutation.mutate(newIngredient);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Ingredient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, name: e.target.value })
              }
              className="form-control"
              required
            />
          </div>

          {/* New field for stockQuantity */}
          <div className="mb-3">
            <label>Stock Quantity</label>
            <input
              type="number"
              value={newIngredient.stockQuantity}
              onChange={(e) =>
                setNewIngredient({
                  ...newIngredient,
                  stockQuantity: parseInt(e.target.value, 10) || 0, // Prevent NaN
                })
              }
              className="form-control"
              required
              min="0" // Ensure stock quantity cannot be negative
            />
          </div>

          {/* Submit button inside the form */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createIngredientMutation.isLoading} // Disable button while loading
          >
            {createIngredientMutation.isLoading ? "Saving..." : "Save Ingredient"}
          </button>
        </form>
        {createIngredientMutation.isError && (
          <p className="text-danger">Error: {createIngredientMutation.error.message}</p>
        )}
        {createIngredientMutation.isSuccess && (
          <p className="text-success">Ingredient created successfully!</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default Createinc;
