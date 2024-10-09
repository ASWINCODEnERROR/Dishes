import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";
import Ingedientmodal from "./Ingedientmodal";
import { useState } from "react";
import Ingredients from "../Ingredients/Ingredients";
import EditDish from "./EditDish";
import CreateDish from "./CreateDish";
import { Link } from "react-router-dom";
const Dishes = () => {
  const fetchDishes = async () => {
    const response = await ApiCall("get", "/dishes");
    console.log("Fetching dishes...");
    if (response.status) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [createDishModalOpen, setCreateDishModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const handleDishClick = (dish) => {
    setSelectedDish(dish);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDish(null);
  };

  const handleEditClick = (dishId) => {
    setSelectedDish(dishId);
    setEditModalOpen(true);
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["dishes"],
    queryFn: fetchDishes,
  });

  if (isLoading) return <div className="text-center text-lg">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-red-500">
        Error loading dishes: {error.message}
      </div>
    );

  if (!data || !Array.isArray(data))
    return <div className="text-center text-gray-500">No dishes available</div>;
  return (
    <>
      <div className="section search-result-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center">
              <div className="heading">Category: Dishes</div>
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
              <ul className="space-y-4">
                {/* <div className="blog-entry d-flex blog-entry-search-item"> */}
                {data.map((dish) => (
                  <div
                    key={dish._id}
                    className="blog-entry d-flex blog-entry-search-item"
                  >
                    <a
                      href={`single.html?dishId=${dish._id}`}
                      className="img-link me-4"
                    >
                      {/* <img src={dish.image || 'default_image.jpg'} alt={dish.name} className="img-fluid" /> */}
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
                            Add Ingredient
                          </button>
                        </p>
                        <p className="mb-0">
                          <button
                            onClick={() => handleEditClick(dish._id)}
                            // onClick={() => console.log(dish)}
                            className="btn btn-sm mt-2 btn-outline-secondary"
                          >
                            Edit
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ul>

              <div className="row text-start pt-5 border-top">
                <div className="col-md-12">
                  <div className="custom-pagination">
                    <span>1</span>
                    <a href="#">2</a>
                    <a href="#">3</a>
                    <a href="#">4</a>
                    <span>...</span>
                    <a href="#">15</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Ingedientmodal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        dish={selectedDish}
      />
      {editModalOpen && selectedDish && (
        <EditDish
          show={editModalOpen}
          onHide={handleCloseModal}
          dishId={selectedDish}
        />
      )}
      <CreateDish
        show={createDishModalOpen}
        onHide={() => setCreateDishModalOpen(false)}
      />
    </>
  );
};

export default Dishes;
