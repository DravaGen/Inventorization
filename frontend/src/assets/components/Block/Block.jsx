import "./index.css"

const Block = ({ children, ...props }) => {
    return <div className="block" {...props}>{children}</div>
}

export default Block