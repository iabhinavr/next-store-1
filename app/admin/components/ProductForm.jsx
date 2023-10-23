"use client";

import { useState } from "react";
import ImageModal from "./ImageModal";

export default function ProductForm() {

    const [productAttributes, setProductAttributes] = useState([]);
    const [showImageModal, setShowImageModal] = useState(false);

    async function addProductAttribute(ev) {
        ev.preventDefault();

        const newAttribute = {
            attr_key: "",
            attr_name: "",
            attr_value: ""
        }

        setProductAttributes([...productAttributes, newAttribute]);
    }

    async function attrChange(ev) {
        const attrField = ev.target.getAttribute('data-attr-field');
        const attrIndex = ev.target.getAttribute('data-attr-index');

        const productAttributesTemp = [...productAttributes];

        switch (attrField) {
            case 'name':
                productAttributesTemp[attrIndex].attr_name = ev.target.value;
                break;
            case 'key':
                productAttributesTemp[attrIndex].attr_key = ev.target.value;
                break;
            case 'value':
                productAttributesTemp[attrIndex].attr_value = ev.target.value;
                break;
        }

        setProductAttributes(productAttributesTemp);
    }

    async function attrItemClose(ev) {

        ev.preventDefault();

        const attrIndex = ev.currentTarget.getAttribute('data-attr-index');
        console.log(attrIndex);

        const productAttributesTemp = [...productAttributes];

        const newProductAttributesTemp = productAttributesTemp.filter((item, index) => index !== parseInt(attrIndex));

        setProductAttributes(newProductAttributesTemp);
    }

    async function addImageModalOnClick(ev) {
        ev.preventDefault();

        setShowImageModal(true);
    }

    return (
        <>
            <form action="" className="product-form" encType="multipart/form-data">
                <h2 className="py-2 text-xl border-b border-b-slate-500">Basic Details</h2>
                <label htmlFor="product-category">Select Category:</label>
                <select name="product-category" id="product-category">
                    <option value="">Select Category</option>
                </select>
                <label htmlFor="product-title">Title:</label>
                <input type="text" name="product-title" id="product-title" placeholder="enter a product title" />

                <button onClick={addImageModalOnClick} className="btn-primary mt-3">Add Images</button>
                <label htmlFor="product-price">Price:</label>
                <input type="number" name="product-price" id="product-price" placeholder="enter price" />
                <label htmlFor="product-price-discounted">Offer Price:</label>
                <input type="number" name="product-price-discounted" id="product-price-discounted" placeholder="enter offer price" />
                <label htmlFor="product-description">Short description:</label>
                <textarea name="product-description" id="product-description"></textarea>


                <h2 className="py-2 mb-2 text-xl border-b border-b-slate-500">Additional Attributes</h2>

                <input type="hidden" name="product-attributes" value={JSON.stringify(productAttributes)} />

                {
                    productAttributes.map((attr, index) => (
                        <div key={index} className="product-attributes flex items-center">
                            <input type="text" name={`attr_${index}_name`} data-attr-field="name" data-attr-index={index} value={productAttributes[index].attr_name} onChange={attrChange} placeholder="name - eg: Frame Rate" />

                            <input type="text" name={`attr_${index}_key`} data-attr-field="key" data-attr-index={index} value={attr.attr_key} onChange={attrChange} placeholder="key - eg: frame_rate" />

                            <input type="text"  name={`attr_${index}_value`} data-attr-field="value" data-attr-index={index} onChange={attrChange} value={attr.attr_value} placeholder="value - eg: 60Hz" />
                            <button data-attr-index={index} onClick={attrItemClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                                </svg>
                            </button>
                        </div>

                    ))
                }

                <button className="btn-primary my-3 flex items-center gap-2" onClick={addProductAttribute}>Add attribute<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg></button>

                <button type="submit" className="btn-primary mt-4 block">Save</button>

            </form>
            <ImageModal showImageModal={showImageModal} setShowImageModal={setShowImageModal} />
        </>
    )
}