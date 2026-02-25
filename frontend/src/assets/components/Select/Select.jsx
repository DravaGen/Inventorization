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
        small = false
    },
    ref
) => {

    const containerRef = useRef(null)
    const itemRefs = useRef({})
    const hoveredRef = useRef(null)

    const items = Array.from(children)

    const getInitial = () => value ?? items[0]?.props.value

    const [selected, setSelected] = useState(getInitial)
    const [hovered, setHovered] = useState(getInitial)

    useEffect(() => {
        hoveredRef.current = hovered
    }, [hovered])

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
        const container = containerRef.current
        if (!el || !container) return

        const index = items.findIndex(
            item => item.props.value === val
        )

        const containerHeight = container.clientHeight
        const elHeight = el.offsetHeight
        const elTop = el.offsetTop

        if (index === 0) {
            container.scrollTop = 0
            return
        }

        if (index === items.length - 1) {
            container.scrollTop =
                container.scrollHeight - containerHeight
            return
        }

        const containerTop = container.scrollTop
        const containerBottom = containerTop + containerHeight
        const elBottom = elTop + elHeight

        if (elTop < containerTop) {
            container.scrollTop = elTop
        } else if (elBottom > containerBottom) {
            container.scrollTop = elBottom - containerHeight
        }
    }

    useEffect(() => {

        const container = containerRef.current
        if (!container) return

        const wheelHandler = (e) => {
            e.preventDefault()

            if (!items.length) return

            const current = hoveredRef.current
            const index = items.findIndex(
                item => item.props.value === current
            )

            if (index === -1) return

            let nextHover = current

            if (e.deltaY > 0 && index < items.length - 1) {
                nextHover = items[index + 1].props.value
            }

            if (e.deltaY < 0 && index > 0) {
                nextHover = items[index - 1].props.value
            }

            if (nextHover !== current) {
                setHovered(nextHover)
                scrollToHovered(nextHover)
            }
        }

        container.addEventListener("wheel", wheelHandler, { passive: false })

        return () => {
            container.removeEventListener("wheel", wheelHandler)
        }

    }, [items])

    const select_height = `calc(
        ${visibleCount} * var(--option-height)
        + ${(visibleCount - 1)} * var(--option-margin-bottom)
        + 2 * var(--select-padding-block)
    )`

    return (
        <div
            ref={containerRef}
            className={`select ${small ? "small" : ""}`}
            style={{ height: select_height }}
        >
            {items.map((child) => {
                const val = child.props.value
                const isHover = hovered === val
                const isFocus = selected === val

                return (
                    <div
                        key={val}
                        ref={el => (itemRefs.current[val] = el)}
                        className={`option ${isHover ? "hover" : ""} ${isFocus ? "focus" : ""}`}
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
