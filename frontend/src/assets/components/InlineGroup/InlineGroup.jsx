

const InlineGroup = ({ children, className='', ...props }) => {
    return <div className={`inline-group ${className}`} {...props}>{children}</div>
}


export default InlineGroup
