const app = require('csp-app/state.js');

const MainController = {
    root: null,
    path: [],
    render: function(componentsObjects) {
        
        // const allRoutersExist = instances.every(instance => !!instance.routerOutlet);
        // if (!allRoutersExist) throw new Error('One or more router outlets do not exist');
        
        const index = this.path.findIndex((part, i) => {
            return part.path !== componentsObjects[i].path
        });
        if (index > -1) {
            componentsObjects.splice(0, index);
            this.path.splice(index);
            this.path.concat(componentsObjects);
        }
        else {
            this.path = componentsObjects;
        }

        if (this.path.length === componentsObjects.length) {

        }
        else if () {

        }

        if (componentsObjects.length > 0) {
            let instances = componentsObjects.map(co => co.component.instantiate(co.parameters));
            // console.log('instances', instances)
            const renderedChain = instances.reverse().reduce((accumulator, instance) => {
                if (!!accumulator) instance.actions.render(accumulator.reference);
                return instance;
            }, null);
            console.log('renderedChain', renderedChain)
            MainController.root.render(renderedChain.reference);
        }
    },
    initialize: function(rootInstance) {
        this.root = rootInstance;
        document.body.innerHTML = '';
        document.body.appendChild(rootInstance.reference);
    }
};

module.exports = MainController;