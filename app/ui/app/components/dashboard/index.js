const Dashboard = {
    html: `
        <div id="dashboard">
            <h1>Hello world!</h1>
            <a data-route="test">Go to Test component</a>
        </div>
    `,
    instantiate: function() {
        const temp = document.createElement('div');
        temp.innerHTML = this.html;
        const element = temp.firstElementChild
        
        return {
            reference: element,
            actions: {
                render: function(DOMTree) {
                    element.innerHTML = '';
                    element.appendChild(DOMTree);
                }
            }
        }
    }
};

module.exports = Dashboard;