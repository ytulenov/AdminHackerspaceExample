"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.NumberFormat("en-US",{
    style: "currency",
    currency: "USD"
});

interface CurrencyProps{
    value?: string | number;
    quantity?: string | number;
}

const TotalPrice: React.FC<CurrencyProps> = ({
    value,
    quantity
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
            Total: {formatter.format(Number(value)*Number(quantity))}
        </div>
    );
  }

export default TotalPrice;