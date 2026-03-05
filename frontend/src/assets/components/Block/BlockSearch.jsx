import { useEffect, useContext } from "react"

import { SearchInput } from "../Input"
import { ButtonQR } from "../Button"
import { InlineGroup } from "../InlineGroup"
import AppContext from "../../AppContext"


const BlockSearch = ({ search, setSearch, source={current: false} }) => {

    const {
        dataQrCodeReader,
        setDataQrCodeReader,
    } = useContext(AppContext)

    useEffect(() => {
        if (!dataQrCodeReader) return
        if (dataQrCodeReader.source.current != source.current) return
        setSearch(dataQrCodeReader.text)
        setDataQrCodeReader(null)
    }, [dataQrCodeReader])

    return (
        <InlineGroup className={"block-search"}>
            <SearchInput
                value={search}
                onChange={(e) => {setSearch(e.target.value)}}
            />
            <ButtonQR source={source}/>
        </InlineGroup>
    )
}


export default BlockSearch