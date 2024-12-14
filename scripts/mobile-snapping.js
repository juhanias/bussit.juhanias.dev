$(document).ready(function () {
    const resizableDiv = document.getElementById('stopDisplayContainer');

    const swipeResizer = new SwipeResizer(resizableDiv, {
        snapPoints: [0.2, 0.45, 0.9, 1.0], // Snap points at 20%, 45%, and 90% of window height
        minHeight: 100, // Minimum height 100px
        maxHeight: window.innerHeight, // Max height set to window height
        transitionDuration: '0.2s' // Smooth transition duration
    });

    swipeResizer.init();
});

