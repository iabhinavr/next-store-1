'use client';

import { useState } from "react";

export default function CategoryForm({ initialCategories }) {

    const [id, setId] = useState('');
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');

    const [categories, setCategories] = useState(initialCategories);

    const [formAlert, setFormAlert] = useState(false);

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
        console.log(formData?.get('_id'));
        const method = formData?.get('_id') ? 'PUT' : 'POST';
        console.log(method);

        let response = await fetch("/api/category", {
            method: method,
            body: formData
        });

        let result = await response.json();
        console.log(result);

        if(result.status === 'success') {
            setId('');
            setTitle('');
            setSlug('');
            setDescription('');
            
            if(method === 'POST') {
                setFormAlert('New category added');
                let newCategories = [result.category, ...categories];
                setCategories(newCategories);
            }
            
        }
   
    }

    async function handleCategoryEdit(ev) {
        ev.preventDefault();

        const _id = ev.target.getAttribute('data-id');

        const response = await fetch(`/api/category?_id=${_id}`);
        const result = await response.json();

        if(result?.category) {
            const category = result.category;

            setId(category._id);
            setTitle(category.title);
            setSlug(category.slug);
            setDescription(category.description);
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

        if(result.status === 'success') {
            let response = await fetch(`/api/category`);
            let result = await response.json();
            
            setCategories(result.categories);
        }
    }

    return (
        <>
            <h2 className="py-2 text-xl border-b border-b-slate-500">Add New Category</h2>
            
            <form onSubmit={categoryFormOnSubmit} action="" className="admin-form product-form">
                <input type="hidden" name="category-id" value={id} />
                <label htmlFor="category-title">Title</label>
                <input type="text" name="category-title" id="category-title" onChange={titleChange} value={title} />

                {slug && <div className="py-2">
                    Category slug: <span className="text-yellow-300">{slug}</span>
                </div>}

                <input type="hidden" name="category-slug" value={slug} />

                <label htmlFor="category-description">Description</label>
                <textarea name="category-description" id="category-description" value={description} onChange={(ev) => setDescription(ev.target.value)}></textarea>

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