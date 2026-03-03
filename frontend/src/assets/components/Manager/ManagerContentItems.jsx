import { useState, useCallback, useMemo} from "react"

import ManagerContent from "./ManagerContent"
import { SearchInput } from "../Input"


const ManagerContentItems = ({
    elements,
    elementName,
    Component,  // eslint-disable-line no-unused-vars
    useIndexInKey=false,
    useSearchInput=()=>[false, ""],
    setSelectedList=()=>{},
    ...props
}) => {

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

    const setSearchValue = useCallback((e) => {
        setSearch(e.target.value)
    }, [setSearch])

    return (
        <ManagerContent>
            {enableSearch && <SearchInput
                value={search}
                onChange={setSearchValue}
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
