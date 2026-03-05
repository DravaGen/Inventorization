import {
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect,
    useMemo,
    useCallback
} from "react"
import { BlockSearch } from "../Block"


const Select = forwardRef((
    {
        children,
        value,
        onChange = () => {},
        updateForm = () => {return [() => {}, ""]},
        visibleCount = 3,
        small = false,
        searchInput = false
    },
    ref
) => {

    const containerRef = useRef(null)
    const itemRefs = useRef({})
    const hoveredRef = useRef(null)
    const source = useRef(new Date().getTime())

    const items = useMemo(() => Array.from(children), [children]);
    const [search, setSearch] = useState("")

    const getInitial = () => value ?? items[0]?.props.value

    const [selected, setSelected] = useState(getInitial)
    const [hovered, setHovered] = useState(getInitial)

    const showItems = useMemo(() => {
        if (!search.trim()) return items

        return items.filter(item =>
            item?.props.children
                .toLowerCase()
                .startsWith(search.toLowerCase())
        )
    }, [search, items])

    useEffect(() => {
        hoveredRef.current = hovered
    }, [hovered])

    const scrollToHovered = useCallback((val) => {
        const el = itemRefs.current[val]
        const container = containerRef.current
        if (!el || !container) return

        const index = showItems.findIndex(
            item => item.props.value === val
        )

        const containerHeight = container.clientHeight
        const elHeight = el.offsetHeight
        const elTop = el.offsetTop

        if (index === 0) {
            container.scrollTop = 0
            return
        }

        if (index === showItems.length - 1) {
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
    }, [showItems])

    useEffect(() => {

        const container = containerRef.current
        if (!container) return

        const wheelHandler = (e) => {
            e.preventDefault()

            if (!showItems.length) return

            const current = hoveredRef.current
            const index = showItems.findIndex(
                item => item.props.value === current
            )

            if (index === -1) return

            let nextHover = current

            if (e.deltaY > 0 && index < showItems.length - 1) {
                nextHover = showItems[index + 1].props.value
            }

            if (e.deltaY < 0 && index > 0) {
                nextHover = showItems[index - 1].props.value
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

    }, [scrollToHovered, showItems])

    useEffect(() => {
        if (showItems.length > 0) {
            const stillExists = showItems.some(item => item.props.value === hovered);
            if (!stillExists) {
                setHovered(showItems[0].props.value);
            }
        } else {
            setHovered(null);
        }
    }, [showItems, hovered]);

    useEffect(() => {
    if (value !== undefined && value !== selected) {
        setSelected(value);
        setHovered(value);
        scrollToHovered(value);
    }
    }, [value, selected, scrollToHovered]);

    const selectHeight = `calc(
        ${visibleCount} * var(--option-height)
        + ${(visibleCount - 1)} * var(--option-margin-bottom)
        + 2 * var(--select-padding-block)
    )`

    const logicSelect = useCallback((value, isChange=false) => {
        setSelected(value)
        setHovered(value)
        scrollToHovered(value)
        isChange && onChange({target: {value}})

        const [setForm, key] = updateForm()
        setForm(prev => ({...prev, [key]: value}))
    }, [
        setSelected, setHovered, scrollToHovered,
        onChange, updateForm
    ])

    useImperativeHandle(ref, () => ({
        get value() {
            return selected ?? null
        },
        set value(val) {
            logicSelect(val)
        },
        clear() {
            logicSelect(null)
        }
    }))

    useEffect(() => {
        if (selected) {
            scrollToHovered(selected);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            className={`select ${small ? "small" : ""}`}
            style={{ height: selectHeight }}
        >
            {searchInput && <BlockSearch
                search={search}
                setSearch={setSearch}
                source={source}
            />}
            {showItems.map((child) => {
                const val = child.props.value
                const isHover = hovered === val
                const isFocus = selected === val

                return (
                    <div
                        key={val}
                        ref={el => (itemRefs.current[val] = el)}
                        className={`option ${isHover ? "hover" : ""} ${isFocus ? "focus" : ""}`}
                        onClick={() => logicSelect(val, true)}
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
