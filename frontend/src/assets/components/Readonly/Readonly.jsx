

const Readonly = ({ children, className='', ...props }) => {
    return <div className={`readonly ${className}`} {...props}>{children}</div>
}


export default Readonly
