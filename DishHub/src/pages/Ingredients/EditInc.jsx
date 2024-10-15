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

  // Fetch ingredient details if ingredientId is present
  const { isLoading, error } = useQuery({
    queryKey: ["ingredient", ingredientId],
    queryFn: () => ApiCall("get", `/ing/${ingredientId}`),
    enabled: !!ingredientId, // Run only if ingredientId is provided
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

  // Mutation for adding or updating ingredient
  const updateIngredientMutation = useMutation({
    mutationFn: (updatedIngredient) =>
      ApiCall(
        ingredientId ? "put" : "post",
        `/ing/${ingredientId || ""}`,
        updatedIngredient
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["ingredients"]); // Invalidate the ingredients list
      Swal.fire("Success", "Ingredient updated successfully", "success");
      onHide(); // Close modal on success
    },
    onError: (err) => {
      Swal.fire(
        "Error",
        err?.message || "Failed to update ingredient",
        "error"
      );
    },
  });

  // Form submit handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    updateIngredientMutation.mutate(ingredientDetails); // Trigger mutation
  };

  // Reset ingredient details on show
  useEffect(() => {
    if (show) {
      setIngredientDetails({
        name: ingredientDatas?.name || "",
        stockQuantity: ingredientDatas?.stockQuantity || 0,
      });
    }
  }, [show, ingredientDatas, ingredientId]); // Reset when modal is shown

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {ingredientId ? "Update Ingredient" : "Add Ingredient"}
        </Modal.Title>
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
                    stockQuantity: isNaN(parseInt(e.target.value, 10))
                      ? 0
                      : parseInt(e.target.value, 10),
                  })
                }
                className="form-control"
                required
                min="0"
              />
            </div>
            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateIngredientMutation.isLoading}
              >
                {updateIngredientMutation.isLoading
                  ? ingredientId
                    ? "Updating..."
                    : "Adding..."
                  : ingredientId
                  ? "Update Ingredient"
                  : "Add Ingredient"}
              </button>
              <button className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            </div>
          </form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditInc;
