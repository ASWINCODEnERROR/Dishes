import React, { useState, useEffect } from "react";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";
import Ingedientmodal from "./IngedientModal";
import EditDish from "./EditDish";
import CreateDish from "./CreateDish";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="loading-spinner-container">
    <div className="spinner"></div>
  </div>
);

const Dishes = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [createDishModalOpen, setCreateDishModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [params, setParams] = useState({});

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 100); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchDishes = async () => {
    try {
      const response = await ApiCall("get", `/dishes`, {}, { ...params, searchQuery: debouncedSearchTerm });
  
      if (!response.status) {
        throw new Error(response.message || "Unexpected error occurred");
      }
  
      return response.data || [];
    } catch (error) {
      console.error("Error fetching dishes:", error);
      if (error.response && error.response.status === 404) {
        return []; 
      }
      throw new Error("Failed to fetch dishes.");
    }
  };
  
  

  const { data, error, isLoading } = useQuery({
    queryKey: ["dishes", params, debouncedSearchTerm],
    queryFn: fetchDishes,
    onError: (err) => {
      // Set a message immediately when an error occurs
      setNoDishesMessage('No matching dishes found. Please try a different search.');
    },
  });

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditModalOpen(false);
    setSelectedDish(null);
  };

  const handleEditClick = (dishId) => {
    setSelectedDish(dishId);
    setEditModalOpen(true);
  };

  const handleDeleteDish = async (id, name) => {
    const result = await Swal.fire({
      title: "Are you sure you want to delete this dish?",
      text: `Do you want to delete ${name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await ApiCall("delete", `/dish/${id}`);
        if (response && response.status) {
          queryClient.invalidateQueries(["dishes"]);
          Swal.fire("Deleted!", `${name} has been deleted.`, "success");
        } else {
          throw new Error(response.message || "Failed to delete the dish.");
        }
      } catch (error) {
        Swal.fire("Error!", `Failed to delete ${name}: ${error.message}`, "error");
      }
    }
  };

  return (
    <>
      <div className="section search-result-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="heading">
                Category: Dishes
                <form
                  action="#"
                  className="search-form d-none d-lg-inline-block"
                  style={{ position: "relative", width: "fit-content" }}
                >
                  <input
                    type="text"
                    className="search-form"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value.trimStart());
                      setParams({
                        ...params,
                        page: 1,
                      });
                    }}
                    style={{
                      border: "1px solid gray",
                      color: "black",
                      margin: "10px 15px",
                      paddingLeft: "35px",
                      paddingRight: "10px",
                      height: "40px",
                      borderRadius: "5px",
                    }}
                  />
                  <span
                    className="bi bi-search"
                    style={{
                      color: "gray",
                      position: "absolute",
                      left: "25px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />
                </form>
              </div>
              <div>
                <button
                  onClick={() => setCreateDishModalOpen(true)}
                  className="btn btn-sm mb-5 btn-outline-primary "
                >
                  Add Dish
                </button>
                <Link
                  to="/ingredients"
                  className="btn btn-sm mb-5 btn-outline-primary ms-2"
                >
                  Ingredients
                </Link>
              </div>
            </div>
          </div>

          <div className="row posts-entry">
            <div className="col-lg-8">
              {/* Show loading spinner only in the container */}
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                // Error block only if there's an error from API
                <div className="error-message">
                  The dish is unavailable
                </div>
              ) : data?.length === 0 ? (
                // Empty dishes message for search with no result
                <div className="no-dishes-message ">
                                   The dish is unavailable
                </div>
              ) : (
                <ul className="space-y-4">
                  {data.map((dish) => (
                    <div
                      key={dish._id}
                      className="blog-entry d-flex blog-entry-search-item"
                    >
                      <a
                        href={`single.html?dishId=${dish._id}`}
                        className="img-link me-4"
                      >
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIibPbOeDQQscm9g-fDNdCvROokQJukg8nYQ&s"
                          alt={dish.name}
                          className="img-fluid"
                        />
                      </a>
                      <div>
                        <h2>
                          <a href={`single.html?dishId=${dish._id}`}>
                            {dish.name}
                          </a>
                        </h2>
                        <p>
                          Lorem ipsum dolor sit amet consectetur adipisicing elit.
                          Unde, nobis ea quis inventore vel voluptas.
                        </p>
                        <div className="d-flex align-items-center">
                          <p className="mb-0 me-2">
                            <button
                              onClick={() => handleDishClick(dish)}
                              className="btn btn-sm mt-2 btn-outline-primary"
                            >
                              Set qty
                            </button>
                          </p>
                          <p className="mb-0 me-2">
                            <button
                              onClick={() => handleEditClick(dish._id)}
                              className="btn btn-sm mt-2 btn-outline-secondary"
                            >
                              Edit
                            </button>
                          </p>
                          <p className="mb-0">
                            <button
                              onClick={() => handleDeleteDish(dish._id, dish.name)}
                              className="btn btn-sm mt-2 btn-outline-secondary"
                            >
                              Delete
                            </button>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && selectedDish && (
        <Ingedientmodal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          dish={selectedDish}
        />
      )}
      {editModalOpen && selectedDish && (
        <EditDish
          show={editModalOpen}
          onHide={handleCloseModal}
          dishId={selectedDish}
        />
      )}
      {createDishModalOpen && (
        <CreateDish
          show={createDishModalOpen}
          onHide={() => setCreateDishModalOpen(false)}
        />
      )}
    </>
  );
};

export default Dishes;
