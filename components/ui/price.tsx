"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.NumberFormat("en-US",{
    style: "currency",
    currency: "USD"
});

interface CurrencyProps{
    value?: string | number;
}

const Priceperunit: React.FC<CurrencyProps> = ({
    value
}) => {
    const [isMounted, setIsMounted] = useState(false);
  
    useEffect(() => {
        setIsMounted(true);
      }, []);    

    if (!isMounted){
        return null; 
    }

    return(
        <div
            className = "font-semibold"
        >
            Price Per Unit: {formatter.format(Number(value))}
        </div>
    );
  }

export default Priceperunit;