import { useEffect, useRef, useState } from "react";

export default function ProductSearch({ filters, setFilters }) {

    const [searchTerm, setSearchTerm] = useState(filters?.searchTerm || "");

    /**
     * The purpose of this component is to delay invoking search
     * to once in every 1.5s if the input is changed. So, it won't
     * occur everytime input is changed, thereby preventing frequent db calls.
     * ------------------------------------------------------------
     * Refs are mutable ojects
     * Can be accessed immediately inside setinterval()
     * Ref values are not used during rendering
     */

    const timerHandler = useRef(null);

    const searchTermRef = useRef("");
    const prevSearchTerm = useRef("");
    const searchBegin = useRef(true);
    const noChangeCount = useRef(0);

    /**
     * start the timer function when first time the searchTerm is changed,
     * that is when searchBegin.current is true,
     * then set it to false,
     * so that there won't be multiple timers going on
     */

    useEffect(() => {

        if(searchBegin.current) {
            timerHandler.current = setInterval(filterTimer, 1500);
            searchBegin.current = false;
        }

    }, [searchTerm])

    /**
     * The timer func executes every 1.5s.
     * If there is a change in the searchTerm, set it to filters state object,
     * which in turn will invoke fetchProducts() in the parent component, updating
     * the product list.
     * Otherwise, increment noChangeCount.
     * If there is no change for 4 consecutive intervals,
     * clear the timer
     */

    function filterTimer() {

        console.log(searchTermRef.current);

        if(prevSearchTerm.current != searchTermRef.current) {
            
            setFilters({searchTerm: searchTermRef.current});
            prevSearchTerm.current = searchTermRef.current;
            noChangeCount.current = 0;
        }
        else {
            noChangeCount.current++;
        }

        if(noChangeCount.current > 3) {
            clearInterval(timerHandler.current);
            searchBegin.current = true;
        }
        
    }

    /**
     * When the input changes,
     * set it to the state variable, because it is required during render.
     * Also set it to searchTermRef, because it is required inside setInterval()
     */

    function searchTermOnChange(e) {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
        searchTermRef.current = inputValue;
    }

    return (
        <form action="">
            <input type="text" name="search" id="product-search" placeholder="search" className=" outline-none bg-transparent border-2 border-slate-400 rounded-md py-1 px-2 focus:border-slate-200" value={searchTerm} onChange={searchTermOnChange} />
        </form>
    )
}