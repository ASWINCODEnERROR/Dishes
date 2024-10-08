import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { ApiCall } from "../../services/ApiCall"; 
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Swal from 'sweetalert2'


const CreateDish = ({ show, onHide }) => {
  const queryClient = useQueryClient();
  const [newDish, setNewDish] = useState({
    name: "",
    ingredients: [{ ingredient: ""}],
  });

  const fetchIngredients = async () => {
    const response = await ApiCall("get", "/ing");
    return response.data;
  };

  const {
    data: ingredientData,
    isLoading: ingredientsLoading,
    error: ingredientsError,
  } = useQuery({
    queryKey: ["ingredients"],
    queryFn: fetchIngredients,
  });

  const createDish = async (dish) => {
    const response = await ApiCall("post", "/dish", dish);
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  const createDishMutation = useMutation({
    mutationFn: createDish,
    onSuccess: () => {
      queryClient.invalidateQueries(["dishes"]);
      onHide();
      setNewDish({ name: "", ingredients: [{ ingredient: ""}] });

      Swal.fire({
        icon:'success',
        title:'created succesfully...',
        showConfirmButton: true,
      });
    },
    onError:(error) =>{
      Swal.fire({
        icon:'error',
        title:'error',
        showConfirmButton:true,
      })
    }
  });

  const handleFormChange = (e, index) => {
    const { name, value } = e.target;
    const updatedIngredients = [...newDish.ingredients];
    updatedIngredients[index][name] = value;
    setNewDish({ ...newDish, ingredients: updatedIngredients });
  };

  const handleFormSubmit = () => {
    createDishMutation.mutate(newDish);
  };
  if (ingredientsLoading) return <div>Loading...</div>;
  if (ingredientsError) return <div>Error loading ingredients</div>;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Dish</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={newDish.name}
            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
            className="form-control mb-3"
          />
        </div>
        {newDish.ingredients.map((ingredient, index) => (
          <div key={index} className="d-flex align-items-center mb-3">
            <select
              name="ingredient"
              value={ingredient.ingredient}
              onChange={(e) => handleFormChange(e, index)}
              className="form-control me-2"
            >
              <option value="">Select Ingredient</option>
              {ingredientData &&
                ingredientData.map((ing) => (
                  <option key={ing._id} value={ing._id}>
                    {ing.name}
                  </option>
                ))}
            </select>
            
       
            <button
              onClick={() => {
                const updatedIngredients = [...newDish.ingredients];
                updatedIngredients.splice(index, 1);
                setNewDish({ ...newDish, ingredients: updatedIngredients });
              }}
              className="btn btn-danger btn-sm"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            setNewDish({
              ...newDish,
              ingredients: [
                ...newDish.ingredients,
                { ingredient: "" },
              ],
            })
          }
          className="btn btn-secondary mb-3"
        >
          Add Ingredient
        </button>
        
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          Close
        </button>
        <button className="btn btn-primary" onClick={handleFormSubmit}>
          Save Dish
        </button>
        {createDishMutation.isLoading && <p>Creating dish...</p>}
        {/* {createDishMutation.isError && <p>Error creating dish</p>}
        {createDishMutation.isSuccess && <p>Dish created successfully!</p>} */}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateDish;
