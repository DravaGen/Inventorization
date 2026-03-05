import { useState, useMemo, useRef} from "react"

import ManagerContent from "./ManagerContent"
import { BlockSearch } from "../Block"


const ManagerContentItems = ({
    elements,
    elementName,
    Component,  // eslint-disable-line no-unused-vars
    useIndexInKey=false,
    useSearchInput=()=>[false, ""],
    setSelectedList=()=>{},
    ...props
}) => {

    const source = useRef(new Date().getTime())
    const [search, setSearch] = useState("")
    const [enableSearch, keySearch] = useSearchInput()

    const showElements = useMemo(() => {
        if (!search.trim()) return elements

        return elements.filter(element => {
            const searchValue = search.toLowerCase()
            return (
                element[keySearch].toLowerCase().startsWith(searchValue)
                || (element?.id ?? "").toLowerCase().startsWith(searchValue)
            )
        })
    }, [search, keySearch, elements])

    return (
        <ManagerContent>
            {enableSearch && <BlockSearch
                search={search}
                setSearch={setSearch}
                source={source}
            />}
            {showElements.map(
                (element, index) => {
                    const key = useIndexInKey ? `${element.id}-${index}` : element.id
                    return <Component
                        key={key}
                        {...props}
                        {...{ [elementName]: element }}
                        updateSelected={() => [setSelectedList, key]}
                    />
            })}
        </ManagerContent>
    )
}


export default ManagerContentItems
