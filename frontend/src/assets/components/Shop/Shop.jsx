import "./index.css"
import Block from "../Block/Block"
import BlockHeader from "../Block/BlockHeader"


const Shop = ({ id, name, address }) => {


    return (
        <div className="shop">
            <Block>
                <BlockHeader>
                    <h3>{name}</h3>
                    <p>{address}</p>
                    <p>{id}</p>
                </BlockHeader>

            </Block>
        </div>
    )
}

export default Shop