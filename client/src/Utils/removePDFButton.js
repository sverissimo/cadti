//Work around para tirar a opção "Export as PDF" do material-table, que não funciona direito.
const mo = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((addedNode) => {
            if (addedNode.nodeType === Node.ELEMENT_NODE) {
                const element = addedNode;
                if (element.classList.contains('MuiPopover-root')) {
                    Array.from(
                        element.getElementsByClassName('MuiMenuItem-root'),
                    ).forEach((menuItem) => {
                        if (menuItem.textContent === 'Export as PDF') {
                            menuItem.remove();
                        }
                    });
                }
            }
        });
    });
});

const removePDF = remove => {
    if (!remove)
        return mo.observe(document.body, { childList: true })
    else
        return mo.disconnect()
}

export default removePDF