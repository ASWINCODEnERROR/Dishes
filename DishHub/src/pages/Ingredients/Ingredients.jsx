import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiCall } from "../../services/ApiCall";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import Createinc from "./Createinc";


const ITEMS_PER_PAGE = 5; 

const Ingredients = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);




  const fetchIngredients = async () => {
    console.log("Fetching ingredients...");
    const response = await ApiCall("get", "/ing");
    if (response.status) {
      console.log("THE RESPONSE DATA",response?.data )
      return response.data;
    } else {
      throw new Error(response.message);
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["ingredients"], // Unique key for the query
    queryFn: fetchIngredients, // Function to fetch data
  });

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600">An error occurred: {error.message}</div>
    );
  }

  
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = (id) => {
    console.log(`Delete ingredient with ID: ${id}`);
  };

  const handleUpdate = (id) => {
    console.log(`Update ingredient with ID: ${id}`);
  };

  return (
    <div className="section search-result-wrap">
      <div className="container">
        <div className="row">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div className="heading">Category: Ingredients</div>
            <div>
              <button 
              onClick={()=>setModalVisible(true)}
              className="btn btn-sm mb-5 btn-outline-primary ">
                
                Add Ingredient
              </button>
            </div>
          </div>
        </div>
        <div className="row posts-entry">
          <div className="col-lg-12 borde red 1px">
            <div className="container mx-auto mt-5">
              <table className="table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Name
                    </th>
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Stock Quantity
                    </th>
                    <th className="py-2 px-4 border border-gray-300 text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((ingredient) => (
                    <tr
                      key={ingredient.id || ingredient._id}
                      className="hover:bg-gray-100"
                    >
                      <td className="py-2 px-4 border border-gray-300">
                        {ingredient.name}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        {ingredient.stockQuantity}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                          onClick={() =>
                            handleUpdate(ingredient.id || ingredient._id)
                          }
                        >
                          <i className="fas fa-edit text-black"></i>
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={() =>
                            handleDelete(ingredient.id || ingredient._id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        <Createinc show={modalVisible} onHide={() => setModalVisible(false)} />
      </div>
    </div>
  );
};

export default Ingredients;






















// import React, { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { ApiCall } from "../../services/ApiCall";
// import Createinc from "./Createinc";
// import CreateDish from "../Dishes/CreateDish";
// import {
//   useTable,
 

// } from '@tanstack/react-table';


// const ITEMS_PER_PAGE = 5; 

// const Ingredients = () => {
//   const [modalVisible, setModalVisible] = useState(false);
  
//   const fetchIngredients = async () => {
//     const response = await ApiCall("get", "/ing");
//     if (response.status) {
//       return response.data;
//     } else {
//       throw new Error(response.message);
//     }
//   };

//   const { data, error, isLoading } = useQuery({
//     queryKey: ["ingredients"],
//     queryFn: fetchIngredients,
//   });

//   if (isLoading) {
//     return <div className="text-center">Loading...</div>;
//   }

//   if (error) {
//     return (
//       <div className="text-red-600">An error occurred: {error.message}</div>
//     );
//   }

//   // Define columns for the table
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: "Name",
//         accessor: "name", // accessor is the "key" in the data
//       },
//       {
//         Header: "Stock Quantity",
//         accessor: "stockQuantity",
//       },
//       {
//         Header: "Actions",
//         Cell: ({ row }) => (
//           <div>
//             <button
//               className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
//               onClick={() => handleUpdate(row.original.id || row.original._id)}
//             >
//               <i className="fas fa-edit text-black"></i>
//             </button>
//             <button
//               className="bg-red-500 text-white px-3 py-1 rounded"
//               onClick={() => handleDelete(row.original.id || row.original._id)}
//             >
//               Delete
//             </button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//     page,
//     canPreviousPage,
//     canNextPage,
//     pageOptions,
//     gotoPage,
//     nextPage,
//     previousPage,
//     setPageSize,
//   } = useTable(
//     {
//       columns,
//       data,
//       initialState: { pageSize: ITEMS_PER_PAGE }, // Set initial page size
//     },
    
    
//   );

//   return (
//     <div className="section search-result-wrap">
//       <div className="container">
//         <div className="row">
//           <div className="col-12 d-flex justify-content-between align-items-center">
//             <div className="heading">Category: Ingredients</div>
//             <button 
//               onClick={() => setModalVisible(true)}
//               className="btn btn-sm mb-5 btn-outline-primary">
//               Add Ingredient
//             </button>
//           </div>
//         </div>
//         <div className="row posts-entry">
//           <div className="col-lg-12 borde red 1px">
//             <div className="container mx-auto mt-5">
//               <table {...getTableProps()} className="table-auto">
//                 <thead>
//                   {headerGroups.map(headerGroup => (
//                     <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-200">
//                       {headerGroup.headers.map(column => (
//                         <th {...column.getHeaderProps(column.getSortByToggleProps())} className="py-2 px-4 border border-gray-300 text-left">
//                           {column.render('Header')}
//                           <span>
//                             {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
//                           </span>
//                         </th>
//                       ))}
//                     </tr>
//                   ))}
//                 </thead>
//                 <tbody {...getTableBodyProps()}>
//                   {page.map(row => {
//                     prepareRow(row);
//                     return (
//                       <tr {...row.getRowProps()} className="hover:bg-gray-100">
//                         {row.cells.map(cell => (
//                           <td {...cell.getCellProps()} className="py-2 px-4 border border-gray-300">
//                             {cell.render('Cell')}
//                           </td>
//                         ))}
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {/* Pagination Controls */}
//               <div className="mt-4 flex justify-between">
//                 <button
//                   onClick={() => previousPage()}
//                   disabled={!canPreviousPage}
//                   className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
//                 >
//                   Previous
//                 </button>
//                 <span className="self-center">
//                   Page {pageOptions.length} of {pageOptions.length}
//                 </span>
//                 <button
//                   onClick={() => nextPage()}
//                   disabled={!canNextPage}
//                   className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Createinc show={modalVisible} onHide={() => setModalVisible(false)} />
//       </div>
//     </div>
//   );
// };

// export default Ingredients;
