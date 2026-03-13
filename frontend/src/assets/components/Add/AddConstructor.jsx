import { useCallback, useState } from "react"
import { Block, BlockHeader } from "../Block"


const AddConstructor = ({
    idName,
    blockName,
    children,
    addStyle = true,
    defaultShow = false
}) => {
    const [showChildrens, setShowChildrens] = useState(defaultShow)

    const toggleShowChildrens = useCallback(() => {
        setShowChildrens(prev => !prev)
    }, [setShowChildrens])

    return (
        <Block
            id={idName}
            className={addStyle ? "add-coustructor" : ""}
        >
            <BlockHeader
                className={"can-clicked"}
                onClick={toggleShowChildrens}
            >{blockName}</BlockHeader>
            {showChildrens && children}
        </Block>
    )
}


export default AddConstructor
