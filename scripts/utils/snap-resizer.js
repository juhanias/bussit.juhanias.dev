class SwipeResizer {
    constructor(element, options = {}) {
        this.element = element;
        this.snapPoints = options.snapPoints || [0.16, 0.5, 1]; // Default snap points: 16%, 50%, 100%
        this.minHeight = options.minHeight || 100; // Minimum height
        this.maxHeight = options.maxHeight || window.innerHeight; // Maximum height
        this.transitionDuration = options.transitionDuration || '0.3s'; // Transition speed
        this.moveThreshold = options.moveThreshold || 10; // Minimum movement (in pixels) to detect a swipe

        // Initial properties
        this.startY = 0;
        this.startHeight = 0;
        this.currentHeight = 0;
        this.isDragging = false;

        // Apply initial transition to element (but it will be disabled during snap)
        this.element.style.transition = 'none';
    }

    init() {
        // Add touch event listeners on the resizable element itself
        this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.element.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.element.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Handle touch move event for internal scrollable elements
        this.element.addEventListener('touchmove', this.handleTouchMoveOnElement.bind(this), { passive: false });
    }

    onTouchStart(e) {
        // Detect if the touch is on the resizable container (not a scrollable element)
        if (this.isTouchOnResizableElement(e.target)) {
            this.startY = e.touches[0].clientY;
            this.startHeight = this.element.offsetHeight;
            this.isDragging = false; // Reset dragging state
            // Disable transition while dragging
            this.element.style.transition = 'none';
        }
    }

    onTouchMove(e) {
        if (!this.isTouchOnResizableElement(e.target)) return;

        const currentY = e.touches[0].clientY;
        const diffY = this.startY - currentY;

        // Detect if movement exceeds the threshold to start dragging
        if (!this.isDragging && Math.abs(diffY) > this.moveThreshold) {
            this.isDragging = true; // Start resizing
        }

        if (this.isDragging) {
            // Prevent default behavior for resizing container only
            e.preventDefault();

            this.currentHeight = this.startHeight + diffY;

            // Clamp height within the min/max range
            this.currentHeight = Math.max(this.minHeight, Math.min(this.maxHeight, this.currentHeight));
            this.element.style.height = `${this.currentHeight}px`;
        }
    }

    onTouchEnd() {
        if (this.isDragging) {
            // Disable transition during the snap to a defined point
            this.element.style.transition = `height ${this.transitionDuration} ease`;

            // Snap to the closest snap point after the swipe ends
            const snapHeight = this.getClosestSnapPoint(this.currentHeight);
            this.element.style.height = `${snapHeight}px`;
        }

        // Reset dragging state
        this.isDragging = false;
    }

    handleTouchMoveOnElement(e) {
        // Allow touch scrolling for inner scrollable elements (e.g., #stopLines)
        const scrollableElement = e.target.closest('.scrollable');
        if (scrollableElement) {
            // Let inner scrollable elements handle the scroll by not preventing the default event
            return;
        }
        // Else, prevent default behavior to enable resizing logic
        e.preventDefault();
    }

    isTouchOnResizableElement(target) {
        // Check if the touch is directly on the resizable container, not on a scrollable element
        return !target.closest('.scrollable');
    }

    getClosestSnapPoint(currentHeight) {
        const windowHeight = window.innerHeight;
        const snappedHeight = this.snapPoints.reduce((closest, point) => {
            const snapHeight = point * windowHeight;
            return Math.abs(currentHeight - snapHeight) < Math.abs(currentHeight - closest) ? snapHeight : closest;
        }, this.snapPoints[0] * windowHeight);
        return snappedHeight;
    }

    setSnapPoints(snapPoints) {
        this.snapPoints = snapPoints;
    }

    setTransitionDuration(duration) {
        this.transitionDuration = duration;
    }

    destroy() {
        // Remove all event listeners
        this.element.removeEventListener('touchstart', this.onTouchStart);
        this.element.removeEventListener('touchmove', this.onTouchMove);
        this.element.removeEventListener('touchend', this.onTouchEnd);
        this.element.removeEventListener('touchmove', this.handleTouchMoveOnElement);
    }
}
