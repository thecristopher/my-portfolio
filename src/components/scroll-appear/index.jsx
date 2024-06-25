import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export const ScrollAppear = (props) => {

    const [isVisible, setIsVisible] = useState(false);

    const textRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries;
            setIsVisible(entry.isIntersecting);
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });

        if (textRef.current) {
            observer.observe(textRef.current)
        }
        return () => {
            if (textRef.current) {
                observer.unobserve(textRef.current);
            }
        };
    }, []);
    return (
        <div>
            <div ref={textRef} style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s linear' }}>
                {props.children}
            </div>
        </div>
    )
}

ScrollAppear.propTypes = {
    children: PropTypes.node.isRequired
}