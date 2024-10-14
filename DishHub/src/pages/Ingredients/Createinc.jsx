import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";

const EditInc = ({ show, onHide, ingredientId }) => {
  const queryClient = useQueryClient();
  
  
  const [ingredientData, setIngredientData] = useState({
    ingredientId: ingredientId,
    newQuantity: 0,
  });

 
  const fetchIngredient = async () => {
    const response = await ApiCall("get", `/ing/${ingredientId}`);
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  
  const { data, error, isLoading } = useQuery({
    queryKey: ["ingredient", ingredientId],
    queryFn: fetchIngredient,
    enabled: show,
    onSuccess: (data) => {
      
      setIngredientData({
        ingredientId: data._id,
        newQuantity: data.stockQuantity,
      });
    },
  });

  
  const updateIngredient = async (updatedData) => {
    const response = await ApiCall("put", `/dishes/${ingredientId}/add-ing`, {
      ingredients: [
        {
          ingredientId: updatedData.ingredientId,
          newQuantity: updatedData.newQuantity,
        },
      ],
    });
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  
  const updateIngredientMutation = useMutation({
    mutationFn: updateIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients"]); // Invalidate the query to refresh the ingredient list
      onHide();
      setIngredientData({ ingredientId: ingredientId, newQuantity: 0 }); // Reset form
    },
  });

  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateIngredientMutation.mutate(ingredientData);
  };

  
  const handleInputChange = (e) => {
    setIngredientData({
      ...ingredientData,
      newQuantity: parseInt(e.target.value, 10) || 0, 
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Ingredient</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <p>Loading ingredient data...</p>
        ) : error ? (
          <p className="text-danger">Error: {error.message}</p>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label>Ingredient ID</label>
              <input
                type="text"
                value={ingredientData.ingredientId}
                className="form-control"
                readOnly // ID is read-only
              />
            </div>

            <div className="mb-3">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={ingredientData.newQuantity}
                onChange={handleInputChange}
                className="form-control"
                required
                min="0" // Ensure stock quantity cannot be negative
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateIngredientMutation.isLoading} // Disable button while loading
            >
              {updateIngredientMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {updateIngredientMutation.isError && (
          <p className="text-danger">
            Error: {updateIngredientMutation.error.message}
          </p>
        )}
        {updateIngredientMutation.isSuccess && (
          <p className="text-success">Ingredient updated successfully!</p>
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

export default EditInc;
