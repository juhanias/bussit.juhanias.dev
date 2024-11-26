$(document).ready(function () {
    const resizableDiv = document.getElementById('stopDisplayContainer');

    const swipeResizer = new SwipeResizer(resizableDiv, {
        snapPoints: [0.2, 0.45, 0.9], // Snap points at 16%, 50%, and 100% of window height
        minHeight: 100, // Minimum height 100px
        maxHeight: window.innerHeight, // Max height set to window height
        transitionDuration: '0.2s' // Smooth transition duration
    });

    swipeResizer.init();
});

$(document).on('touchmove', function (e) {
    // Prevent the default scroll behavior when at the top
    e.preventDefault();
});