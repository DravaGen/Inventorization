import "./index.css"
import Block from "../Block/Block"
import BlockHeader from "../Block/BlockHeader"


const Shop = ({ id, name, address }) => {

    const h3Style = {
        margin: 0,
        padding: 0
    }

    const pStyle = {
        fontSize: 14,
        fontWeight: "lighter",
        margin: "10px 0 0 0",
    }

    return (
        <div className="shop">
            <Block>
                <BlockHeader>
                    <h3 style={h3Style}>{name}</h3>
                    <p style={pStyle}>{address}</p>
                    <p style={pStyle}>{id}</p>
                </BlockHeader>

            </Block>
        </div>
    )
}

export default Shop