import React from 'react'
import productpic from '../../images/Samplelang.png'

const ProductCard = () => {
  return (
    <div className="">
      <img className="cursor-pointer transition-transform hover:scale-105" src={productpic} alt="Product" />
      
    </div>
  )
}

export default ProductCard