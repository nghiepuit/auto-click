let selectedElement = null;
let clickInterval = null;
let highlightOverlay = null;

function createHighlightOverlay(element) {
    const rect = element.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '10000';
    overlay.style.border = '2px solid #2196F3';
    overlay.style.backgroundColor = 'rgba(33, 150, 243, 0.2)';
    overlay.style.pointerEvents = 'none';
    overlay.style.transition = 'all 0.2s ease';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = '3px';
    return overlay;
}

function startElementSelection() {
    // Thêm custom cursor
    const cursorStyle = document.createElement('style');
    cursorStyle.id = 'custom-cursor-style';
    cursorStyle.textContent = `
        .custom-cursor {
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: %232196F3;"><circle cx="12" cy="12" r="11" fill="white" stroke="%232196F3" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="%232196F3"/></svg>') 12 12, crosshair !important;
        }
    `;
    document.head.appendChild(cursorStyle);
    document.body.classList.add('custom-cursor');

    // Thêm style cho hover effect
    const style = document.createElement('style');
    style.id = 'selector-style';
    style.textContent = `
        .element-hover {
            outline: 2px solid #2196F3 !important;
            outline-offset: 2px !important;
            background-color: rgba(33, 150, 243, 0.1) !important;
            transition: all 0.2s ease !important;
            position: relative;
        }

        .element-hover::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(
                circle at var(--mouse-x, 0) var(--mouse-y, 0),
                rgba(33, 150, 243, 0.2),
                transparent 100px
            );
            pointer-events: none;
            z-index: 10000;
        }

        .element-hover::after {
            content: '🎯 Click để chọn';
            position: absolute;
            background-color: #2196F3;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 10001;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);

    function handleMouseOver(e) {
        e.target.classList.add('element-hover');
    }

    function handleMouseOut(e) {
        e.target.classList.remove('element-hover');
    }

    function handleMouseMove(e) {
        const hoveredElement = document.querySelector('.element-hover');
        if (hoveredElement) {
            hoveredElement.style.setProperty('--mouse-x', e.clientX + 'px');
            hoveredElement.style.setProperty('--mouse-y', e.clientY + 'px');
        }
    }

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mousemove', handleMouseMove);

    function handleClick(e) {
        e.preventDefault();
        selectedElement = e.target;
        
        // Cleanup
        document.removeEventListener('mouseover', handleMouseOver);
        document.removeEventListener('mouseout', handleMouseOut);
        document.removeEventListener('mousemove', handleMouseMove);
        document.body.classList.remove('custom-cursor');
        
        const styleElements = ['selector-style', 'custom-cursor-style'];
        styleElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });

        document.querySelectorAll('.element-hover').forEach(el => {
            el.classList.remove('element-hover');
        });

        // Tạo highlight cho element được chọn
        if (highlightOverlay) {
            highlightOverlay.remove();
        }
        highlightOverlay = createHighlightOverlay(selectedElement);
        document.body.appendChild(highlightOverlay);

        // Animation cho element được chọn
        highlightOverlay.style.animation = 'select-pulse 2s infinite';
        const pulseStyle = document.createElement('style');
        pulseStyle.textContent = `
            @keyframes select-pulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
                }
            }
        `;
        document.head.appendChild(pulseStyle);

        alert('Element đã được chọn!');
        chrome.runtime.sendMessage({ type: 'ELEMENT_SELECTED' });
    }

    document.addEventListener('click', handleClick, { once: true });
}

function startAutoClicking(interval) {
    if (!selectedElement) {
        alert('Vui lòng chọn element trước!');
        return;
    }
    
    clickInterval = setInterval(() => {
        selectedElement.click();
        
        // Thêm hiệu ứng flash khi click
        const flashOverlay = createHighlightOverlay(selectedElement);
        flashOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        flashOverlay.style.border = 'none';
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
            flashOverlay.remove();
        }, 100);
    }, interval);
}

function stopAutoClicking() {
    if (clickInterval) {
        clearInterval(clickInterval);
        clickInterval = null;
    }
}

// Cập nhật vị trí highlight khi scroll
window.addEventListener('scroll', () => {
    if (highlightOverlay && selectedElement) {
        const rect = selectedElement.getBoundingClientRect();
        highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
        highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
    }
}); 