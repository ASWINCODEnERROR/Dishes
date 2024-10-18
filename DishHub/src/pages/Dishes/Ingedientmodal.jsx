import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { ApiCall } from "../../services/ApiCall";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

const IngredientModal = ({ isOpen, onClose, dish }) => {
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [cookingStarted, setCookingStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalCookingTime, setTotalCookingTime] = useState(0);

  const fetchIngredients = async (dishId) => {
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

  const { data: ingredientsData, isLoading, error } = useQuery({
    queryKey: ["dishIngredients", dish?._id],
    queryFn: () => fetchIngredients(dish._id),
    enabled: !!dish?._id && isOpen,
  });

  const handleQuantityChange = (ingredientId, newQuantity) => {
    setIngredientQuantities((prevQuantities) => ({
      ...prevQuantities,
      [ingredientId]: newQuantity,
    }));
  };

  const handleStartCooking = async () => {
    if (isAnyIngredientUnavailable()) {
      Swal.fire("Error", "Some ingredients are unavailable.", "error");
      return;
    }

    const updatedIngredients = ingredientsData.ingredients.map(({ ingredient }) => {
      const requestedQuantity = ingredientQuantities[ingredient._id] || 0;

      if (requestedQuantity <= 0) {
        Swal.fire("Error", "You must select a quantity for each ingredient.", "error");
        throw new Error("Invalid quantity");
      }

      if (requestedQuantity > ingredient.stockQuantity) {
        Swal.fire("Error", "You don't have enough stock for this ingredient.", "error");
        throw new Error("Insufficient stock");
      }

      return {
        ingredientId: ingredient._id,
        newQuantity: requestedQuantity,
      };
    });

    try {
      const response = await ApiCall("put", `/dishes/${dish._id}/start`, {
        ingredients: updatedIngredients,
      });
      if (response.status) {
        Swal.fire("Success", "Cooking started!", "success");
        setCookingStarted(true);
        setElapsedTime(0);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to start cooking.", "error");
    }
  };

  const handleStopCooking = async () => {
    const updatedIngredients = ingredientsData.ingredients.map(({ ingredient }) => ({
      ingredientId: ingredient._id,
      newQuantity: ingredientQuantities[ingredient._id] || ingredient.stockQuantity,
    }));

    try {
      const response = await ApiCall("put", `/dishes/${dish._id}/stop`, {
        ingredients: updatedIngredients,
      });

      if (response.status) {
        Swal.fire("Success", "Cooking stopped!", "success");
        setCookingStarted(false);
        setTotalCookingTime((prevTime) => prevTime + elapsedTime);
        setElapsedTime(0);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to stop cooking.", "error");
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
          .catch(() => {
            Swal.fire("Error", "Failed to delete the ingredient.", "error");
          });
      }
    });
  };

  useEffect(() => {
    let timer;
    if (cookingStarted) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cookingStarted]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return (
      <div className="text-center text-danger">
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
              {ingredientsData.ingredients?.map(({ _id, ingredient }) => (
                <li key={_id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {ingredient ? (
                      <>
                        <span>{ingredient.name}</span>
                        <span> ({ingredient.stockQuantity || 0} g)</span>
                      </>
                    ) : (
                      <span>Ingredient is unavailable</span>
                    )}
                  </div>

                  {!cookingStarted ? (
                    <input
                      type="number"
                      className="form-control"
                      value={ingredientQuantities[ingredient._id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(ingredient._id, parseInt(e.target.value, 10))
                      }
                      min="0"
                      placeholder=" qty"
                      style={{ width: "70px", marginLeft: "20px" }}
                      required
                    />
                  ) : (
                    <span>{ingredientQuantities[ingredient._id] || ingredient.stockQuantity} g</span>
                  )}

                  {!cookingStarted ? (
                    <span
                      onClick={() => handleDeleteIngredient(dish._id, ingredient._id)}
                      style={{ cursor: "pointer", color: "red", marginLeft: "10px" }}
                    >
                      X
                    </span>
                  ) : (
                    <span
                      style={{ cursor: "not-allowed", color: "gray", marginLeft: "10px" }}
                      title="Cannot delete ingredient while cooking"
                    >
                      X
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {cookingStarted && (
              <div style={{ marginTop: "20px" }}>
                <strong>Current Cooking Time: {formatTime(elapsedTime)}</strong>
              </div>
            )}
            {!cookingStarted && totalCookingTime > 0 && (
              <div style={{ marginTop: "10px" }}>
                <strong>Total Cooking Time: {formatTime(totalCookingTime)}</strong>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>

        {cookingStarted ? (
          <button onClick={handleStopCooking} className="btn btn-sm btn-outline-danger">
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

export default IngredientModal;
















// import React, { useState, useEffect } from "react";
// import Modal from "react-bootstrap/Modal";
// import { ApiCall } from "../../services/ApiCall";
// import { useQuery } from "@tanstack/react-query";
// import Swal from "sweetalert2";

// const IngredientModal = ({ isOpen, onClose, dish }) => {
//   const [ingredientQuantities, setIngredientQuantities] = useState({});
//   const [cookingStarted, setCookingStarted] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0); // Timer for the current session
//   const [totalCookingTime, setTotalCookingTime] = useState(0);    

//   const fetchIngredients = async (dishId) => {
//     const response = await ApiCall("get", `/dish/${dishId}`);
//     if (response.status) {
//       return response.data;
//     } else {
//       throw new Error("Error fetching dish ingredients");
//     }
//   };

//   const isAnyIngredientUnavailable = () => {
//     if (!ingredientsData?.ingredients) return true;

//     return ingredientsData.ingredients.some(({ ingredient }) => {
//       return !ingredient || ingredient.stockQuantity == null || ingredient.stockQuantity <= 0;
//     });
//   };

//   const { data: ingredientsData, isLoading, error } = useQuery({
//     queryKey: ["dishIngredients", dish?._id],
//     queryFn: () => fetchIngredients(dish._id),
//     enabled: !!dish?._id && isOpen,
//   });

//   const handleQuantityChange = (ingredientId, newQuantity) => {
//     setIngredientQuantities((prevQuantities) => ({
//       ...prevQuantities,
//       [ingredientId]: newQuantity,
//     }));
//   };

//   const handleStartCooking = async () => {
//     if (isAnyIngredientUnavailable()) {
//       Swal.fire("Error", "Some ingredients are unavailable.", "error");
//       return;
//     }

//     for (const {ingredient} of ingredientsData.ingredients){
//       const  requestedQuantity = ingredientQuantities[ingredient._id]||0;

//       if (requestedQuantity <= 0){
//         Swal.fire("Error", "You must select a quantity for each ingredient.", "error");
//         return;
//       }
//     }
//     if (requestedQuantity > ingredient.stockQuantity){
//       Swal.fire("Error", "You don't have enough stock for this ingredient.", "error");
//       return;
//     }
//   };
//   const updatedIngredients = ingredientsData.ingredents.map(({ ingredient })=>({
//     ingredientId:ingredient._id,
//     newQuantity:ingredientQuantities[ingredient._id] || ingredient.stockQuantity,
//   }));

//   try{
//     const response = await ApiCall("put", `/dishes/${dish._id}/start`,{
//       ingredients:updatedIngredients,
//     });
//     if (response.status) {
//       Swal.fire("Success", "Cooking started!", "success");
//       setCookingStarted(true);
//       setElapsedTime(0); 
//     } else {
//       throw new Error(response.message);
//     }
//   } catch (error) {
//     Swal.fire("Error", "Failed to start cooking.", "error");
//   }

//   const handleStopCooking = async () => {
//     const updatedIngredients = ingredientsData.ingredients.map(({ ingredient }) => ({
//       ingredientId: ingredient._id,
//       newQuantity: ingredientQuantities[ingredient._id] || ingredient.stockQuantity,
//     }));

//     try {
//       const response = await ApiCall("put", `/dishes/${dish._id}/stop`, {
//         ingredients: updatedIngredients,
//       });

//       if (response.status) {
//         Swal.fire("Success", "Cooking stopped!", "success");
//         setCookingStarted(false);
//         setTotalCookingTime((prevTime) => prevTime + elapsedTime); 
//         setElapsedTime(0); 
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (error) {
//       Swal.fire("Error", "Failed to stop cooking.", "error");
//     }
//   };

//   const handleDeleteIngredient = (dishId, ingredientId) => {
//     Swal.fire({
//       title: "Are you sure you want to delete this ingredient?",
//       text: "You will not be able to recover this ingredient.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         ApiCall("delete", `/dishes/${dishId}/ingredients/${ingredientId}`)
//           .then(() => {
//             Swal.fire("Deleted!", "The ingredient has been removed.", "success");
//           })
//           .catch((error) => {
//             Swal.fire("Error", "Failed to delete the ingredient.", "error");
//           });
//       }
//     });
//   };

//   useEffect(() => {
//     let timer;
//     if (cookingStarted) {
//       timer = setInterval(() => {
//         setElapsedTime((prevTime) => prevTime + 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [cookingStarted]);

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}m ${secs}s`;
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error)
//     return (
//       <div className="text-center text-red-500">
//         Error loading dishes: {error.message}
//       </div>
//     );

//   return (
//     <Modal show={isOpen} onHide={onClose} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {isLoading ? "Loading..." : ingredientsData?.name}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {isLoading && <p>Loading ingredients...</p>}
//         {error && (
//           <p className="text-danger">
//             Error fetching ingredients: {error.message}
//           </p>
//         )}
//         {ingredientsData && (
//           <>
//             <h5>Ingredients:</h5>
//             <ul className="list-group">
//               {ingredientsData.ingredients?.map(({ _id, ingredient }) => (
//                 <li key={_id} className="list-group-item d-flex justify-content-between align-items-center">
//                   <div>
//                     {ingredient ? (
//                       <>
//                         <span>{ingredient.name}</span>
//                         <span> ({ingredient.stockQuantity || 0} g)</span>
//                       </>
//                     ) : (
//                       <span>Ingredient is unavailable</span>
//                     )}
//                   </div>

//                   {!cookingStarted ? (
//                     <>
//                       <span style={{ marginRight: "20px" }}></span>
//                       <input
//                         type="number"
//                         className="form-control"
//                         value={ingredientQuantities[ingredient._id] || ""}
//                         onChange={(e) =>
//                           handleQuantityChange(ingredient._id, parseInt(e.target.value, 10))
//                         }
//                         min="0"
//                         placeholder=" qty"
//                         style={{ width: "70px", marginLeft: "100px" }}
//                         required
//                       />
//                     </>
//                   ) : (
//                     <span>{ingredientQuantities[ingredient._id] || ingredient.stockQuantity} g</span>
//                   )}

//                   {!cookingStarted ? (
//                     <span
//                       onClick={() =>
//                         handleDeleteIngredient(dish._id, ingredient._id)
//                       }
//                       style={{
//                         cursor: "pointer",
//                         color: "red",
//                         marginLeft: "10px",
//                       }}
//                     >
//                       X
//                     </span>
//                   ) : (
//                     <span
//                       style={{
//                         cursor: "not-allowed",
//                         color: "gray",
//                         marginLeft: "10px",
//                       }}
//                       title="Cannot delete ingredient while cooking"
//                     >
//                       X
//                     </span>
//                   )}
//                 </li>
//               ))}
//             </ul>
//             {cookingStarted && (
//               <div style={{ marginTop: "20px" }}>
//                 <strong>Current Cooking Time: {formatTime(elapsedTime)}</strong>
//               </div>
//             )}
//             {!cookingStarted && totalCookingTime > 0 && (
//               <div style={{ marginTop: "10px" }}>
//                 <strong>Total Cooking Time: {formatTime(totalCookingTime)}</strong>
//               </div>
//             )}
//           </>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <button className="btn btn-secondary" onClick={onClose}>
//           Close
//         </button>

//         {cookingStarted ? (
//           <button
//             onClick={handleStopCooking}
//             className="btn btn-sm btn-outline-danger"
//           >
//             Stop Cooking
//           </button>
//         ) : (
//           <button
//             onClick={handleStartCooking}
//             disabled={isAnyIngredientUnavailable()}
//             className="btn btn-sm btn-outline-primary"
//           >
//             Start Cooking
//           </button>
//         )}
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default IngredientModal;
