"use client";

import { useEffect, useState, useRef } from "react";
import ImageModal from "./ImageModal";
import { Reorder } from "framer-motion";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function ProductForm({ productId = false }) {

    const [showImageModal, setShowImageModal] = useState(false);

    const [categories, setCategories] = useState([]);

    const [id, setId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [productImages, setProductImages] = useState([]);
    const [price, setPrice] = useState(0);
    const [offerPrice, setOfferPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [mainAttributes, setMainAttributes] = useState([]);
    const [extraAttributes, setExtraAttributes] = useState([]);

    const [formAlert, setFormAlert] = useState(false);

    const formRef = useRef(null);
    const router = useRouter();

    function generateUniqueRandomString() {

        const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomString = '';

        while (randomString.length < 8) {
            const randomIndex = Math.floor(Math.random() * randomChars.length);
            randomString += randomChars.charAt(randomIndex);
        }

        return randomString;
    }

    async function processSlug(input) {
        let processedSlug = input.replace(/\s/g, '-').replace(/[^a-zA-Z0-9\s-]/g, '').toLowerCase();

        if (await isSlugExists(processedSlug)) {
            let randomSring = generateUniqueRandomString();
            return processedSlug + randomSring;
        }

        return processedSlug;
    }

    async function isSlugExists(slug) {

        const response = await fetch("/api/product?slug=" + slug);
        const result = await response.json();

        if (result.product) {
            return true;
        }
        return false;
    }

    async function titleChange(ev) {
        const newTitle = ev.target.value;
        setTitle(newTitle);
        const slug = await processSlug(newTitle);
        setSlug(slug);
    }

    useEffect(() => {

        async function fetchCategories() {
            let response = await fetch(`/api/category`);
            let result = await response.json();

            setCategories(result.categories);
        }

        fetchCategories();

    }, [])

    useEffect(() => {

        async function fetchProduct(productId) {
            let response = await fetch(`/api/product?_id=${productId}`);
            let result = await response.json();

            if (!result?.product) {
                return;
            }

            let c = categories.filter((category) => category._id === result.product.category);

            if (!c?.length) {
                return;
            }

            setId(result.product._id);
            setSelectedCategory(c[0]);
            setTitle(result.product.title);
            setSlug(result.product.slug);
            setPrice(result.product?.price);
            setOfferPrice(result.product?.offerPrice);
            setProductImages(result.product?.images);
            setDescription(result.product?.description);


            /**
             * some attributes may be added to the category later
             * so we need to find them and add to mainAttributes
             */

            let missingAttributes = c[0].attributes.filter((catAttr) => {

                if (!result?.product?.mainAttributes) {
                    return true;
                }

                let isIncluded = result?.product?.mainAttributes.some((mainAttr) => mainAttr.attr_key === catAttr.attr_key);

                return !isIncluded;

            });

            /**
             * now we need to add attr_value to each missing category.attribute
             * before appending to product.mainAttributes
             */

            let allMainAttributes = result?.product?.mainAttributes;

            missingAttributes.forEach((missingAttr) => {

                let newAttribute = {
                    attr_key: missingAttr.attr_key,
                    attr_name: missingAttr.attr_name,
                    attr_value: ''
                }

                allMainAttributes = [...allMainAttributes, newAttribute];

            })

            setMainAttributes(allMainAttributes);

            setExtraAttributes(result.product?.extraAttributes);

        }

        if (categories?.length > 0 && productId) {
            fetchProduct(productId);
        }

    }, [categories])

    async function addProductAttribute(ev) {
        ev.preventDefault();

        const newAttribute = {
            attr_key: "",
            attr_name: "",
            attr_value: ""
        }

        setExtraAttributes([...extraAttributes, newAttribute]);
    }

    async function mainAttrChange(ev) {
        const attrIndex = ev.target.getAttribute('data-attr-index');

        const mainAttributesTemp = [...mainAttributes];

        mainAttributesTemp[attrIndex].attr_value = ev.target.value;

        setMainAttributes(mainAttributesTemp);
    }

    async function attrChange(ev) {
        const attrField = ev.target.getAttribute('data-attr-field');
        const attrIndex = ev.target.getAttribute('data-attr-index');

        const extraAttributesTemp = [...extraAttributes];

        switch (attrField) {
            case 'name':
                extraAttributesTemp[attrIndex].attr_name = ev.target.value;
                break;
            case 'key':
                extraAttributesTemp[attrIndex].attr_key = ev.target.value;
                break;
            case 'value':
                extraAttributesTemp[attrIndex].attr_value = ev.target.value;
                break;
        }

        setExtraAttributes(extraAttributesTemp);
    }

    async function attrItemClose(ev) {

        ev.preventDefault();

        const attrIndex = ev.currentTarget.getAttribute('data-attr-index');

        const extraAttributesTemp = [...extraAttributes];

        const newExtraAttributesTemp = extraAttributesTemp.filter((item, index) => index !== parseInt(attrIndex));

        setExtraAttributes(newExtraAttributesTemp);
    }

    async function addImageModalOnClick(ev) {
        ev.preventDefault();

        setShowImageModal(true);
    }


    async function productFormOnSubmit(ev) {

        ev.preventDefault();

        const formData = new FormData(ev.target);
        formData.append('product-images', JSON.stringify(productImages));

        const method = formData.get('product-id') ? 'PUT' : 'POST';

        const response = await fetch('/api/product', {
            method: method,
            body: formData
        });

        const result = await response.json();

        if (result.status === 'success') {
            if (!id) {
                setFormAlert('Product added.');
                setId(result.product._id);

                router.push(`/admin/products/${result.product._id}`);
            }
            else {
                setFormAlert('Changes saved.');
            }


        }

    }

    async function categoryOnChange(ev) {

        let c = categories.filter((category) => category._id === ev.target.value);

        let attrs = c[0]?.attributes;

        let newMainAttributes = [];

        attrs.forEach((a) => {

            let newAttr = {
                attr_key: a.attr_key,
                attr_name: a.attr_name,
                attr_value: "",
            }

            newMainAttributes.push(newAttr);
        })

        setMainAttributes(newMainAttributes);
    }

    return (
        <>
            {
                id &&
                <h1 className="text-2xl py-2 mb-3 border-b border-b-slate-500">Editing <span className="text-green-500">"{title}"</span></h1>
            }

            <form ref={formRef} onSubmit={productFormOnSubmit} action="" className="admin-form" encType="multipart/form-data">
                <input type="hidden" name="product-id" value={id} onChange={(ev) => setId(ev.target.value)} />
                <h2 className="py-2 text-xl border-b border-b-slate-500">Basic Details</h2>

                {
                    id === '' ?
                    <>
                        <label htmlFor="product-category">Select Category:</label>
                        <select name="product-category" id="product-category" value={selectedCategory?._id} onChange={categoryOnChange}>
                            <option value="">Select Category</option>
                            {
                                categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))
                            }
                        </select>
                    </>
                    : 
                    <>
                        <div className="p-4 bg-slate-600 max-w-[50vw] mt-2 rounded-md">Category: {selectedCategory.title}</div>
                        <input type="hidden" name="product-category" id="product-category" value={selectedCategory?._id} />
                    </>
                    
                }
                
                <label htmlFor="product-title">Title:</label>
                <input onChange={titleChange} value={title} type="text" name="product-title" id="product-title" placeholder="enter a product title" />

                <label htmlFor="product-slug">Slug</label>
                <input type="text" name="product-slug" onChange={(ev) => { setSlug(ev.target.value) }} value={slug} />

                <button onClick={addImageModalOnClick} className="btn-primary mt-3">Add Images</button>

                <div className="overflow-x-scroll max-w-[50vw]">
                    <Reorder.Group axis="x" values={productImages} onReorder={setProductImages} className="py-4 flex gap-2">
                        {productImages.map((image) => (
                            <Reorder.Item key={image.id} value={image}>
                                <div style={{ backgroundImage: `url(https://mediacdn.codingreflections.com/thumbnails/${image.url})` }} className=" bg-cover bg-no-repeat bg-center w-40 h-40 rounded-md">
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                <label htmlFor="product-price">Price:</label>
                <input type="number" name="product-price" id="product-price" placeholder="enter price" value={price} onChange={(ev) => setPrice(ev.target.value)} />
                <label htmlFor="product-offer-price">Offer Price:</label>
                <input type="number" name="product-offer-price" id="product-offer-price" placeholder="enter offer price" value={offerPrice} onChange={(ev) => setOfferPrice(ev.target.value)} />
                <label htmlFor="product-description">Short description:</label>
                <textarea name="product-description" id="product-description" value={description} onChange={(ev) => setDescription(ev.target.value)}></textarea>

                <h2 className="py-2 mb-2 text-xl border-b border-b-slate-500">Attributes</h2>

                <input type="hidden" name="main-attributes" value={JSON.stringify(mainAttributes)} />

                {
                    mainAttributes.map((attr, index) => (
                        <div key={index} className="main-attributes grid grid-cols-5 items-center max-w-[50vw]">

                            <div className="col-span-1">
                                <label htmlFor="">{mainAttributes[index].attr_name}</label>
                            </div>

                            <div className="col-span-4">
                                <input type="text" name={`mainattr-${index}-value`} id={`mainattr-${index}-value`} data-attr-index={index} value={mainAttributes[index].attr_value} onChange={mainAttrChange} />
                            </div>

                        </div>

                    ))
                }


                <h2 className="py-2 mb-2 text-xl border-b border-b-slate-500">Additional Attributes</h2>

                <input type="hidden" name="extra-attributes" value={JSON.stringify(extraAttributes)} />

                {
                    extraAttributes.map((attr, index) => (
                        <div key={index} className="product-attributes flex items-center">
                            <input type="text" name={`attr_${index}_name`} data-attr-field="name" data-attr-index={index} value={extraAttributes[index].attr_name} onChange={attrChange} placeholder="name - eg: Frame Rate" />

                            <input type="text" name={`attr_${index}_key`} data-attr-field="key" data-attr-index={index} value={attr.attr_key} onChange={attrChange} placeholder="key - eg: frame_rate" />

                            <input type="text" name={`attr_${index}_value`} data-attr-field="value" data-attr-index={index} onChange={attrChange} value={attr.attr_value} placeholder="value - eg: 60Hz" />
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

                <button type="submit" className="btn-primary mt-4 block">
                    {
                        id ? "Update" : "Add"
                    }
                </button>

            </form>

            {
                formAlert &&
                <div className="py-4 font-bold text-green-400">
                    {formAlert}
                </div>
            }

            <ImageModal showImageModal={showImageModal} setShowImageModal={setShowImageModal} productImages={productImages} setProductImages={setProductImages} />
        </>
    )
}