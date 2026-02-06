import "./index.css"

const InlineGrop = ({ children, className='', ...props }) => {
    return <div className={`inline-group ${className}`}>{children}</div>
}

export default InlineGrop