

const BlockHeader = ({ children, className="", ...props }) => {
    return <div className={`block-header ${className}`} {...props}>{children}</div>
}


export default BlockHeader
