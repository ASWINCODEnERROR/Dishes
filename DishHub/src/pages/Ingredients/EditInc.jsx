import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { ApiCall } from "../../services/ApiCall";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";

const EditInc = ({ show, onHide, ingredientId, ingredientDatas }) => {
  const queryClient = useQueryClient();

  const [ingredientDetails, setIngredientDetails] = useState({
    name: ingredientDatas?.name || "",
    stockQuantity: ingredientDatas?.stockQuantity || 0,
  });

  const { isLoading, error } = useQuery({
    queryKey: ["ingredient", ingredientId],
    queryFn: () => ApiCall("get", `/ing/${ingredientId}`),
    enabled: !!ingredientId,
    onSuccess: (data) => {
      if (data.status) {
        setIngredientDetails({
          name: data.data.name || "",
          stockQuantity: data.data.stockQuantity || 0,
        });
      } else {
        throw new Error(data.message);
      }
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: (updatedIngredient) =>
      ApiCall("put", `/ing/${ingredientId}`, updatedIngredient),
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients"]);
      Swal.fire("Success", "Ingredient updated successfully", "success");
      onHide(); // Close the modal
    },
    onError: (err) => {
      Swal.fire("Error", err.message || "Failed to update ingredient", "error");
    },
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateIngredientMutation.mutate(ingredientDetails);
  };

  useEffect(() => {
    if (show) {
      setIngredientDetails({
        name: ingredientDatas?.name || "",
        stockQuantity: ingredientDatas?.stockQuantity || 0,
      });
    }
  }, [show, ingredientDatas]);

  const updateIngredient = async (updatedData) => {
    // Determine if we're updating or adding based on the presence of ingredientId
    const method = ingredientId ? "put" : "post";
    const endpoint = ingredientId
      ? `/dishes/${ingredientId}/add-ing`
      : `/ing`;
  
    const response = await ApiCall(method, endpoint, {
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
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{ingredientId? "Update Ingredient":"Add Ingredient"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-danger">Error: {error.message}</p>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input
                type="text"
                value={ingredientDetails.name}
                onChange={(e) =>
                  setIngredientDetails({
                    ...ingredientDetails,
                    name: e.target.value,
                  })
                }
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label>Stock Quantity</label>
              <input
                type="number"
                value={ingredientDetails.stockQuantity || ""}
                onChange={(e) =>
                  setIngredientDetails({
                    ...ingredientDetails,
                    stockQuantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="form-control"
                required
                min="0"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateIngredientMutation.isLoading}
            >
              {updateIngredientMutation.isLoading ? "Updating..." : "Update Ingredient"}
            </button>
          </form>
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
