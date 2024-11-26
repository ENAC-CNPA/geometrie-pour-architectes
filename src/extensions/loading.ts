// loadingIcon.ts

// Function to create the loading icon
export function createLoadingIcon() {
    // Check if the loading icon already exists
    if (document.getElementById('loading-icon')) {
        return;
    }

    // Create a container for the loading icon
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-icon';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100vw';
    loadingContainer.style.height = '100vh';
    loadingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.zIndex = '500';

    // Create the actual loading spinner
    const spinner = document.createElement('div');
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.border = '5px solid #f3f3f3';
    spinner.style.borderTop = '5px solid #3498db';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';

    // Append spinner to the container
    loadingContainer.appendChild(spinner);

    // Append the loading container to the body
    document.body.appendChild(loadingContainer);

    // Add spinner animation using keyframes
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Function to show the loading icon (in case it's hidden)
export function showLoadingIcon() {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = 'flex';
    }
}

// Function to hide the loading icon
export function hideLoadingIcon() {
    const loadingIcon = document.getElementById('loading-icon');
    if (loadingIcon) {
        loadingIcon.style.display = 'none';
    }
}
