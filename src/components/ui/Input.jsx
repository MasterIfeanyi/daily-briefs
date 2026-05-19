'use client'

import React from 'react'
import Image from 'next/image'
import PropTypes from 'prop-types';

const Input = ({
    id,
    label,
    type = "text",
    disabled,
    placeholder = "",
    required = false,
    onChange,
    value,
    className="",
    icon = false,
    imgSrc,
    ...rest
  }) => {

  return (
    <div>
      {label && <label htmlFor={id} className={`text-sm text-blackDark font-medium`}>
        {label}
      </label>}
      <input 
        id={id}
        type={type}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
        className="w-full px-4 py-2 h-10 text-sm font-light mt-2 bg-white border rounded outline-none transition disabled:opacity-70 disabled:cursor-not-allowed pl-4 border-grey focus:border-primary"
      />
      {icon && <Image src={imgSrc} alt="icon" className="absolute right-3 bottom-2 w-6 h-6" />}
    </div>
  )
}

Input.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  icon: PropTypes.bool,
  imgSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
}

export default Input