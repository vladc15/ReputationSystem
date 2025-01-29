import React from "react";

import Path from "./path";
import { Main } from "../components/Main";
import Feedback from "../components/Feedback";         // New component for feedback
import AddProduct from "../components/AddProduct";     // New component for adding products
import ProductPage from '../components/ProductPage';

const routes = [
    { path: Path.MAIN, element: <Main /> },
    { path: Path.FEEDBACK, element: <Feedback /> },   
    { path: '/product/:productId', element: <ProductPage /> },      // New route
    { path: Path.ADD_PRODUCT, element: <AddProduct /> }   // New route
];

export default routes;
