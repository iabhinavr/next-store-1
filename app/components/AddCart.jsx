export default function AddCart({ cartCount, setCartCount }) {

    const addCartOnClick = (event) => {
        event.preventDefault();

        console.log('add cart clicked');
        setCartCount(cartCount+1);
    }

    return (
        <div className="flex items-center mt-4">
            <input type="number" className="w-32 py-2 px-3 border rounded-md" placeholder="Quantity" />
            <button className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md" onClick={addCartOnClick}>Add to Cart</button>
        </div>
    );
}