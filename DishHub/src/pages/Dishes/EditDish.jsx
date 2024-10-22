import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { ApiCall } from "../../services/ApiCall";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";


const EditDish = ({ show, onHide, dishId }) => {
  const queryClient = useQueryClient();

  const [updatedDish, setUpdatedDish] = useState({
    name: "",
    ingredients: [{ ingredient: ""}],
  });

  const fetchIngredients = async () => {
    const response = await ApiCall("get", "/ing");
    return response.data;
  };

  const fetchDishById = async () => {
    const response = await ApiCall("get", `/dish/${dishId}`);
    return response.data;
  };

  const { data: ingredientData, isLoading: ingredientsLoading } = useQuery({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const {
    data: dishData,
    isLoading: dishLoading,
    error: dishError,
  } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: fetchDishById,
    enabled: !!dishId,
  });
   useEffect(()=>{
    if(dishData){
      console.log("gett the data of dish......",dishData);
      setUpdatedDish({
         name:dishData.name,
         ingredients: dishData.ingredients.map((ing) => ({
          ingredient:ing.ingredient._id,
         })),
        });
    }
   
  },[dishData]);
 
  const updateDishMutation = useMutation({
    mutationFn: async (dish) => {
      const response = await ApiCall("put", `/dish/${dishId}`, dish);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["dishes"]);
      Swal.fire({
        title: 'Success!',
        text: 'Dish updated successfully!',
        icon: 'success',
      });
      onHide();
    },
    onError: (error) => {
      Swal.fire({
        title: 'Error!',
        text: `Failed to update dish: ${error.message}`,
        icon: 'error',
      });
    },
  });

  const handleFormChange = (e, index) => {
    const { name, value } = e.target;
    const updatedIngredients = [...updatedDish.ingredients];
    updatedIngredients[index][name] = value;
    setUpdatedDish({ ...updatedDish, ingredients: updatedIngredients });
  };
  const validateForm = () => {
    if (!updatedDish.name.trim()) {
      Swal.fire("Error", "Dish name is required!", "error");
      return false;
    }
  
    const hasValidIngredients = updatedDish.ingredients.some(
      (ingredient) => ingredient.ingredient
    );
  
    if (!hasValidIngredients) {
      Swal.fire("Error", "You must add at least one valid ingredient!", "error");
      return false;
    }
  
    return true;
  };

  const handleFormSubmit = () => {
    if(validateForm()){
    updateDishMutation.mutate(updatedDish);
    }
  };

  

  if (dishLoading || ingredientsLoading) return <div>Loading...</div>;
  if (dishError) return <div>Error loading dish data</div>;

  const selectedIngredientIds = updatedDish.ingredients.map(ing => ing.ingredient);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Dish</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={updatedDish.name}
            onChange={(e) =>
              setUpdatedDish({ ...updatedDish, name: e.target.value })
            }
            className="form-control mb-3"
            required
          />
        </div>

        <label>Ingredients</label>

        {updatedDish.ingredients.map((ingredient, index) => (
          <div key={index} className=" align-items-center mb-3 remove">
            <select
              name="ingredient"
              value={ingredient.ingredient}
              onChange={(e) => handleFormChange(e, index)}
              className="form-control me-2"
            >
              <option value="">Select Ingredient</option>
              {ingredientData &&
                ingredientData.map((ing) => (
                  <option key={ing._id} value={ing._id} disabled={selectedIngredientIds.includes(ing._id) && ingredient.ingredient !== ing._id} >
                    {ing.name}
                  </option>
                ))}
            </select>

            

            <button
              onClick={() => {
                const updatedIngredients = [...updatedDish.ingredients];
                updatedIngredients.splice(index, 1);
                setUpdatedDish({
                  ...updatedDish,
                  ingredients: updatedIngredients,
                });
              }}
              className="btn btn-danger btn-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setUpdatedDish({
              ...updatedDish,
              ingredients: [
                ...updatedDish.ingredients,
                { ingredient: "", quantity: 0 },
              ],
            })
          }
          className="btn btn-secondary mb-3"
        >
          Add Ingredient
        </button>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" type="button" onClick={onHide}>
          Close
        </button>
        <button className="btn btn-primary" onClick={handleFormSubmit}>
          Save Changes
        </button>
        {updateDishMutation.isLoading && <p>Updating dish...</p>}
        {updateDishMutation.isError && <p>Error updating dish</p>}
        {updateDishMutation.isSuccess && <p>Dish updated successfully!</p>}
      </Modal.Footer>
    </Modal>
  );
};

export default EditDish;
