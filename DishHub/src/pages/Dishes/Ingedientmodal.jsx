import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ApiCall } from "../../services/ApiCall";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Dropdown from "react-bootstrap/Dropdown";

const IngedientModal = ({ isOpen, onClose, dish }) => {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientQuantity, setIngredientQuantity] = useState({});
  const [cookingStarted, setCookingStarted] = useState(false); // Track if cooking has started

  const fetchAllIngredients = async () => {
    const response = await ApiCall("get", "/ing");
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  const fetchIngredients = async (dishId) => {
    console.log("Fetching ingredients...");
    const response = await ApiCall("get", `/dish/${dishId}`);
    if (response.status) {
      return response.data;
    } else {
      throw new Error("Error fetching dish ingredients");
    }
  };

  const isAnyIngredientUnavailable = () => {
    if (!ingredientsData?.ingredients) return true;
    
    return ingredientsData.ingredients.some(({ ingredient }) => {
      return !ingredient || ingredient.stockQuantity == null || ingredient.stockQuantity <= 0;
    });
  };

  const {
    data: allIngredientsData,
    isLoading: isAllIngredientsLoading,
    error: allIngredientsError,
  } = useQuery({
    queryKey: ["allIngredients"],
    queryFn: fetchAllIngredients,
    enabled: isOpen,
  });

  const {
    data: ingredientsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dishIngredients", dish?._id],
    queryFn: () => fetchIngredients(dish._id),
    enabled: !!dish?._id && isOpen,
  });

  const handleAddIngredient = async () => {
    if (!selectedIngredient || !ingredientQuantity) {
      Swal.fire(
        "Error",
        "Please select an ingredient and enter a quantity.",
        "error"
      );
      return;
    }

    try {
      const response = await ApiCall("put", `/dishes/${dish._id}/add-ing`, {
        ingredients: [
          {
            ingredientId: selectedIngredient._id,
            newQuantity: parseInt(ingredientQuantity, 10),
          },
        ],
      });

      if (response.status) {
        Swal.fire("Success", "Ingredient added successfully!", "success");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error adding ingredient:", error);
      Swal.fire("Error", "Failed to add ingredient.", "error");
    }
  };

  const handleDeleteIngredient = (dishId, ingredientId) => {
    Swal.fire({
      title: "Are you sure you want to delete this ingredient?",
      text: "You will not be able to recover this ingredient.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        ApiCall("delete", `/dishes/${dishId}/ingredients/${ingredientId}`)
          .then(() => {
            Swal.fire("Deleted!", "The ingredient has been removed.", "success");
          })
          .catch((error) => {
            Swal.fire("Error", "Failed to delete the ingredient.", "error");
          });
      }
    });
  };

  const handleStartCooking = () => {
    if (isAnyIngredientUnavailable()) {
      Swal.fire("Error", "Some ingredients are unavailable.", "error");
      return;
    }

    Swal.fire("Success", "Cooking started!", "success");
    setCookingStarted(true); // Set cooking as started
  };

  const handleStopCooking = () => {
    Swal.fire("Success", "Cooking stopped!", "success");
    setCookingStarted(false); // Set cooking as stopped
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">
        Error loading dishes: {error.message}
      </div>
    );

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isLoading ? "Loading..." : ingredientsData?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && <p>Loading ingredients...</p>}
        {error && (
          <p className="text-danger">
            Error fetching ingredients: {error.message}
          </p>
        )}
        {ingredientsData && (
          <>
            <h5>Ingredients:</h5>
            <ul className="list-group">
              {ingredientsData.ingredients?.map(
                ({ _id, ingredient, stockQuantity }) => (
                  <li
                    key={_id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      {ingredient ? (
                        <>
                          <span>{ingredient.name}</span>
                          <span> ({ingredient.stockQuantity || stockQuantity} g)</span>
                        </>
                      ) : (
                        <span>Ingredient is unavailable</span>
                      )}
                    </div>

                    {/* Conditionally render the delete button */}
                    {!cookingStarted ? (
                      <span
                        onClick={() =>
                          handleDeleteIngredient(dish._id, ingredient._id)
                        }
                        style={{
                          cursor: "pointer",
                          color: "red",
                          marginLeft: "10px",
                        }}
                      >
                        X
                      </span>
                    ) : (
                      <span
                        style={{
                          cursor: "not-allowed",
                          color: "gray",
                          marginLeft: "10px",
                        }}
                        title="Cannot delete ingredient while cooking"
                      >
                        X
                      </span>
                    )}
                  </li>
                )
              )}
            </ul>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>

        {/* Toggle cooking button */}
        {cookingStarted ? (
          <button
            onClick={handleStopCooking}
            className="btn btn-sm btn-outline-danger"
          >
            Stop Cooking
          </button>
        ) : (
          <button
            onClick={handleStartCooking}
            disabled={isAnyIngredientUnavailable()}
            className="btn btn-sm btn-outline-primary"
          >
            Start Cooking
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default IngedientModal;
