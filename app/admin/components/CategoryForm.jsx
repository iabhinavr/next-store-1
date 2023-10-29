'use client';

import { useState, useRef } from "react";

export default function CategoryForm({ initialCategories }) {

    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');

    const [categories, setCategories] = useState(initialCategories);
    const [categoryAttributes, setCategoryAttributes] = useState([]);

    const [formAlert, setFormAlert] = useState(false);

    const formRef = useRef(null);

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

        if (id === '' && await isSlugExists(processedSlug)) {
            let randomSring = generateUniqueRandomString();
            return processedSlug + randomSring;
        }

        return processedSlug;
    }

    async function isSlugExists(slug) {

        const response = await fetch("/api/category?slug=" + slug);
        const result = await response.json();

        console.log(result);

        if (result.category) {
            console.log('category exists');
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

    async function categoryFormOnSubmit(ev) {
        ev.preventDefault();

        const formData = new FormData(ev.target);
        console.log(formData?.get('category-id'));
        const method = formData?.get('category-id') ? 'PUT' : 'POST';
        console.log(method);

        let response = await fetch("/api/category", {
            method: method,
            body: formData
        });

        let result = await response.json();
        console.log(result);

        if (result.status === 'success') {
            setId('');
            setTitle('');
            setSlug('');
            setDescription('');
            setCategoryAttributes([]);

            if (method === 'POST') {
                setFormAlert('New category added');
                let newCategories = [result.category, ...categories];
                setCategories(newCategories);
            }
            else {
                setFormAlert('Changes saved');
            }

        }

    }

    async function handleCategoryEdit(ev) {
        ev.preventDefault();

        const _id = ev.target.getAttribute('data-id');

        const response = await fetch(`/api/category?_id=${_id}`);
        const result = await response.json();

        if (result?.category) {
            const category = result.category;

            setId(category._id);
            setTitle(category.title);
            setSlug(category.slug);
            setDescription(category.description);
            setCategoryAttributes(category.attributes);

            formRef.current.scrollIntoView();
        }
    }

    async function handleCategoryDelete(ev) {
        ev.preventDefault();
        const _id = ev.target.getAttribute('data-id');

        const formData = new FormData();
        formData.append('category-id', _id);

        const response = await fetch(`/api/category`, {
            method: 'DELETE',
            body: formData,
        });

        const result = await response.json();

        if (result.status === 'success') {
            let response = await fetch(`/api/category`);
            let result = await response.json();

            setCategories(result.categories);
        }
    }

    async function addCategoryAttribute(ev) {
        ev.preventDefault();

        const newAttribute = {
            attr_key: "",
            attr_name: "",
        }

        setCategoryAttributes([...categoryAttributes, newAttribute]);
    }

    async function attrChange(ev) {
        const attrField = ev.target.getAttribute('data-attr-field');
        const attrIndex = ev.target.getAttribute('data-attr-index');

        const categoryAttributesTemp = [...categoryAttributes];

        switch (attrField) {
            case 'name':
                categoryAttributesTemp[attrIndex].attr_name = ev.target.value;
                break;
            case 'key':
                categoryAttributesTemp[attrIndex].attr_key = ev.target.value;
                break;
        }

        setCategoryAttributes(categoryAttributesTemp);
    }

    async function attrItemClose(ev) {

        ev.preventDefault();

        const attrIndex = ev.currentTarget.getAttribute('data-attr-index');
        console.log(attrIndex);

        const categoryAttributesTemp = [...categoryAttributes];

        const newCategoryAttributesTemp = categoryAttributesTemp.filter((item, index) => index !== parseInt(attrIndex));

        setCategoryAttributes(newCategoryAttributesTemp);
    }

    return (
        <>
            <h2 className="py-2 text-xl border-b border-b-slate-500">
                {
                    id ? "Edit Category" : "Adde New Category"
                }
            </h2>

            <form ref={formRef} onSubmit={categoryFormOnSubmit} action="" className="admin-form product-form">
                <input type="hidden" name="category-id" value={id} />
                <label htmlFor="category-title">Title</label>
                <input type="text" name="category-title" id="category-title" onChange={titleChange} value={title} />

                {slug && <div className="py-2">
                    Category slug: <span className="text-yellow-300">{slug}</span>
                </div>}

                <input type="hidden" name="category-slug" value={slug} />

                <label htmlFor="category-description">Description</label>
                <textarea name="category-description" id="category-description" value={description} onChange={(ev) => setDescription(ev.target.value)}></textarea>

                <h3 className="py-2 text-lg border-b border-b-slate-500">Add Attributes</h3>

                <input type="hidden" name="category-attributes" value={JSON.stringify(categoryAttributes)} />

                {
                    categoryAttributes.map((attr, index) => (
                        <div key={index} className="category-attributes flex items-center">
                            <input type="text" name={`attr_${index}_name`} data-attr-field="name" data-attr-index={index} value={categoryAttributes[index].attr_name} onChange={attrChange} placeholder="name - eg: Frame Rate" />

                            <input type="text" name={`attr_${index}_key`} data-attr-field="key" data-attr-index={index} value={categoryAttributes[index].attr_key} onChange={attrChange} placeholder="key - eg: frame_rate" />

                            <button data-attr-index={index} onClick={attrItemClose}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                                </svg>
                            </button>
                        </div>

                    ))
                }

                <button className="btn-primary my-3 flex items-center gap-2" onClick={addCategoryAttribute}>Add attribute<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg></button>

                <button className="btn-primary my-4" type="submit">Submit</button>

            </form>

            {
                formAlert &&
                <div className="py-4 font-bold text-green-400">
                    {formAlert}
                </div>
            }

            <h2 className="py-2 text-xl border-b border-b-slate-500">Edit Categories</h2>
            <table className="my-3">

                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Manage</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        categories.map((c) => (
                            <tr key={c._id}>
                                <td>{c.title}</td>
                                <td>{c.slug}</td>
                                <td>
                                    <button onClick={handleCategoryEdit} data-id={c._id} className="btn-primary mr-2">Edit</button>
                                    <button onClick={handleCategoryDelete} data-id={c._id} className="btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>

            </table>
        </>


    )
}