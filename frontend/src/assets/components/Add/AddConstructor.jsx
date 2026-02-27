import { Block, BlockHeader } from "../Block"


const AddConstructor = ({ idName, blockName, children }) => {
    return (
        <Block id={idName} className={"add-coustructor"}>
            <BlockHeader>{blockName}</BlockHeader>
            {children}
        </Block>
    )
}


export default AddConstructor
