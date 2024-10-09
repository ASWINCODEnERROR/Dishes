import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ApiCall } from "../../services/ApiCall";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import Dropdown from "react-bootstrap/Dropdown";

const IngedientModal = ({ isOpen, onClose, dish }) => {
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [ingredientQuantity, setIngredientQuantity] = useState({});

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
    console.log("Dish ID:::::::::::::::::::", dishId);
    console.log("Ingredient ID:::::::::::::", ingredientId);

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
        ApiCall("delete", `/dishes/${dishId}/ingredients/${ingredientId}`);
        console.log(
          `Deleting ingredient from URL: /dishes/${dishId}/ingredients/${ingredientId}`
        );

        console
          .log("00000000000")
          .then(() => {
            Swal.fire(
              "Deleted!",
              "The ingredient has been removed.",
              "success"
            );
            console.log(
              dish._id,
              ingredientId,
              "asdfasdasdfasdfasdfasddfadfafa"
            );
          })
          .catch((error) => {
            if (error.response) {
              console.error("API Error:", error.response.data);
            } else {
              console.error("Error:", error.message);
            }
            Swal.fire("Error", "Failed to delete the ingredient.", "error");
          });
      }
    });
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
                      {/* Check if the ingredient exists before rendering */}
                      {ingredient ? (
                        <>
                          <span>{ingredient.name}</span>
                          <span>
                            ({ingredient.stockQuantity || stockQuantity} g)
                          </span>
                        </>
                      ) : (
                        <span>ingredient is available</span>
                      )}
                    </div>
                    {/* <div> */}
                    {/* <span>{ingredient.name}</span> */}
                    {/* <span>({stockQuantity} g)</span> */}
                    {/* <span>({ingredient.stockQuantity}g)</span> */}
                    {/* {item.name} ({item.stockQuantity} g) */}
                    {/* <span>{stockQuantity} g</span> */}
                    {/* </div> */}

                    <input
                      type="number"
                      // value={cartQty[_id] || ""}
                      // onChange={(e) => handleCartQtyChange(_id, e.target.value)}
                      placeholder="qty"
                      style={{ width: "50px", marginRight: "10px" }}
                    />
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

        <button
          onClick={() => {
            ingredientsData.ingredients.forEach(({ _id, quantity }) => {
              handleCartQtySubmit(_id, quantity);
              
            });
          }}
          disabled={isAnyIngredientUnavailable()}
          className="btn btn-sm btn-outline-primary"
        >
          start cooking
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default IngedientModal;
