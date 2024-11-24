'use client';

import { DateReadable } from "@/app/lib/utils";
import { useState, useEffect } from "react";
import MediaUploadForm from "./MediaUploadForm";

export default function MediaList() {

    const [images, setImages] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [progressBar, setProgressBar] = useState([]);

    async function deleteMedia(ev) {
        ev.preventDefault();

        const mediaId = ev.target.getAttribute('data-media-id');

        setDeleteId(mediaId);

        const data = {
            mediaId
        }

        const response = await fetch(`/api/images`, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === 'success') {
            let newImages = images.filter((image) => image._id !== mediaId);
            setImages(newImages);
            setDeleteId('');
        }

    }

    useEffect(() => {
        async function fetchImages() {
            const limit = 25;

            const response = await fetch(`/api/images?limit=${limit}`);
            const result = await response.json();

            const images = result?.images;

            if (!images) {
                return false;
            }

            const imagesSimple = images.map((m) => (
                {
                    _id: m._id.toString(),
                    origPath: m.origPath,
                    webpPath: m.webpPath,
                    createdAt: m.createdAt
                }
            ));

            setImages(imagesSimple);
        }

        fetchImages();
    }, [])

    return (
        <main className="p-4 flex-1 bg-slate-700 rounded-xl">

            <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                <h1 className="text-2xl mr-3">Media</h1>

            </div>

            <MediaUploadForm progressBar={progressBar} setProgressBar={setProgressBar} images={images} setImages={setImages} />

            <table className="my-3">

                <thead>
                    <tr>
                        <th>Thumbnail</th>
                        <th>Id</th>
                        <th>Date Uploaded</th>
                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>

                    {
                        progressBar.map((p) => (
                            <tr key={p.key}>
                                <td>
                                    <img src={p.imagePreview} className="w-20 h-20 rounded-md object-cover" />
                                </td>
                                <td colSpan={3}>
                                    <div className="w-full h-full flex justify-start items-center progress-bar-wrapper">
                                        <div className="relative flex justify-center items-center progress-bar bg-slate-300 overflow-clip w-40 h-6 rounded-md">
                                            <span className="relative z-10 text-slate-900">
                                                {parseInt((p.uploaded / (p.total || 1)) * 100)}%
                                            </span>
                                            <div className=" absolute left-0 top-0 bg-emerald-400 progress-slider h-full" style={{ width: `${parseInt((p.uploaded / (p.total || 1)) * 100)}%` }}></div>
                                        </div>
                                        <div className="ml-2">
                                            <span className="font-mono text-yellow-500">
                                                {p.key}
                                            </span>
                                            {
                                                p?.message &&
                                                <span className="ml-2 font-mono text-sm italic text-slate-400">{p.message}</span>
                                            }
                                        </div>
                                    </div>

                                </td>
                            </tr>
                        ))
                    }
                    {
                        images.map((m) => {

                            return (
                                <tr key={m._id}>
                                    <td className="relative">
                                        <div className="relative w-28 h-28">
                                            <div className="absolute inset-0 w-full h-full bg-slate-600/50">
                                                <svg width="112" height="112" viewBox="-25 -25 150 150">
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="50"
                                                        fill="none"
                                                        stroke="rgb(52 211 153)"
                                                        strokeWidth={6}
                                                        strokeLinecap="round"
                                                        strokeDasharray={`125.6,188.4`}
                                                        strokeDashoffset={`78.5`}
                                                    />
                                                </svg>
                                                <div className="absolute flex justify-center items-center inset-0 w-full h-full">40%</div>
                                            </div>
                                            <img src={`https://garden-store.blr1.cdn.digitaloceanspaces.com/${m.webpPath}`} alt="" className="w-28 h-28 rounded-md object-cover" />
                                        </div>


                                    </td>
                                    <td>
                                        {m._id}
                                    </td>

                                    <td>
                                        {DateReadable(m.createdAt)}
                                    </td>
                                    <td>
                                        <button data-media-id={m._id} onClick={deleteMedia} className="btn-danger" disabled={m._id === deleteId ? true : false}>{m._id === deleteId ? 'Deleting...' : 'Delete'}</button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>

            </table>
        </main>
    )
}