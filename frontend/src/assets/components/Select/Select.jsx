import {
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react"


const Select = forwardRef((
    {
        children,
        value,
        onChange = () => {},
        visibleCount = 3,
        small=false
    },
    ref
) => {
    const containerRef = useRef(null)
    const itemRefs = useRef({})
    const items = Array.from(children)

    const getInitial = () => value ?? items[0]?.props.value
    const [selected, setSelected] = useState(getInitial)
    const [hovered, setHovered] = useState(getInitial)

    useImperativeHandle(ref, () => ({
        get value() {
            return selected
        },
        set value(val) {
            setSelected(val)
            setHovered(val)
            scrollToHovered(val)
        }
    }))

    const scrollToHovered = (val) => {
        const el = itemRefs.current[val]
        if (!el) return
        el.scrollIntoView({ block: "nearest" })
    }

    useEffect(() => {
        scrollToHovered(hovered)
    }, [])

    const handleWheel = (e) => {
        if (items.length === 0) return

        const index = items.findIndex(item => item.props.value === hovered)
        let nextHover = hovered

        if (e.deltaY > 0 && index < items.length - 1) nextHover = items[index + 1].props.value
        if (e.deltaY < 0 && index > 0) nextHover = items[index - 1].props.value

        setHovered(nextHover)
        scrollToHovered(nextHover)
    }

    const select_height = `calc(
        ${visibleCount} * var(--option-height)
        + ${(visibleCount - 1)} * var(--option-margin-bottom)
        + 2 * var(--select-padding-block)
    )`

    return (
        <div
            ref={containerRef}
            className={`select ${small ? "small" : ""}`}
            onWheel={handleWheel}
            style={{height: select_height}}
        >
            {items.map((child) => {
                const val = child.props.value
                const isHover = hovered === val
                const isFocus = selected === val

                return (
                    <div
                        key={val}
                        ref={el => (itemRefs.current[val] = el)}
                        className={`option ${isHover ? 'hover' : ''} ${isFocus ? 'focus' : ''}`}
                        onClick={() => {
                            setSelected(val)
                            setHovered(val)
                            scrollToHovered(val)
                            onChange({ target: { value: val } })
                        }}
                        onMouseEnter={() => setHovered(val)}
                    >
                        {child.props.children}
                    </div>
                )
            })}
        </div>
    )
})


export default Select
