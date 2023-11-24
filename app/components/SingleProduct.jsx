'use client';

import { useState } from "react";
import ShopHeader from "./ShopHeader";
import ShopFooter from "./ShopFooter";
import ProductContent from "./ProductContent";

export default function SingleProduct({ productData }) {

    const [cartCount, setCartCount] = useState(0);
    return (
        <>
            <ShopHeader />
            <ProductContent productData={productData} cartCount={cartCount} setCartCount={setCartCount} />
            <ShopFooter />
        </>
    )
}