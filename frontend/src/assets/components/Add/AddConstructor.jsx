import { Block, BlockHeader } from "../Block"


const AddConstructor = ({
    idName,
    blockName,
    children,
    addStyle = true
}) => {
    return (
        <Block
            id={idName}
            className={addStyle ? "add-coustructor" : ""}
        >
            <BlockHeader>{blockName}</BlockHeader>
            {children}
        </Block>
    )
}


export default AddConstructor
