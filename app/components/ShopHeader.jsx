import Link from "next/link";

export default function ShopHeader({ cartCount = 0 }) {
    return (
        <header className="py-3">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="logo">
                        <Link href="/">
                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="30" fill="#FF5733" />
                            <text x="40" y="40" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="white">Logo</text>
                            </svg>
                        </Link>                      
                    </div>
                    <div className="flex">
                        <ul className="nav flex me-3 gap-4">
                            <li className="nav-item">
                                <Link className="nav-link" href="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" href="/api/auth/signout">Signout</Link>
                            </li>
                        </ul>
                        <div className="cart flex gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bi bi-cart" width="24" height="24">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.488 6.972L10.5 16h11m-2.978-4H10.5" />
                            </svg>
                            <span className="cart-count bg-red-500 text-white px-2 py-1 rounded-full text-sm">{cartCount}</span>
                        </div>
                    </div>
                </div>
            </header>
    );
}