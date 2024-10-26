import SingleProduct from "@/app/components/SingleProduct"
import { findProduct } from "@/app/lib/product"

export default async function Product({ params }) {

    const slug = params.productSlug;

    const productData = await findProduct(slug);

    const productDataSimple = {
        title: productData?.title,
        slug: productData?.slug,
        images: productData?.images,
        price: productData?.price,
        offerPrice: productData?.offerPrice,
        description: productData?.description,
        attributes: productData?.attributes
    }

    return (
        <>
        <SingleProduct productData={productDataSimple} />
        </>
    )
}