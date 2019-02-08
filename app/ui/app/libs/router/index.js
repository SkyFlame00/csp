const app = require('csp-app/state.js');
const MainController = require('csp-app/components/root/MainController.js');

const Router = {
    paths: {},
    setPaths: function(paths) {this.paths = paths;},
    // pathExists: function(parts) {
    //     let paths = this.paths;
    //     for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
    //         if (!paths || !this.paths[part]) return false;
    //         const params = paths[part].parameters;
    //         if (params && params.length > 0 && i !== parts.length) {
    //             if (parts.length-i < params.length) return false;
    //             i = i + params.length;
    //         }
    //         paths = paths[part].children;
    //     }
    //     return true;
    // },
    pathExists: function(parts) {
        let paths = this.paths;
        for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
            if (!paths || !this.paths[part]) return false;
            const params = paths[part].parameters;
            if (params && params.length > 0) {
                if (parts[i+1]) {
                    const partsAvailable = parts.length-i;
                    if (partsAvailable < params.length) {
                        return false;
                    }
                    else if (partsAvailable > params.length) {
                        i = i + params.length;
                        paths = paths[part].children;
                    }
                    else if (partsAvailable === params.length) {
                        if (!paths[part].children['__defaultWithParams']) return false;
                    }
                }
                else {
                    if (!paths[part].children['__default']) return false;
                    // After that we get out of the cycle as there are no more parts
                }
            }
            else {
                if (parts[i+1]) {
                    paths = paths[part].children;
                }
                else {
                    if (!paths[part].children['__default']) return false;
                }
            }
        }
        return true;
    },
    // makeComponentsObjects: function(parts) {
    //     let componentsObjects = [];
    //     let paths = this.paths;
    //     for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
    //         const pathParams = paths[part].parameters;
    //         let params;
    //         if (pathParams && pathParams.length > 0 && i !== parts.length) {
    //             params = parts.slice(i+1, i+1+pathParams.length);
    //             i = i + params.length;
    //         }
    //         componentsObjects.push({
    //             path: part,
    //             component: paths[part].component,
    //             params: params || null
    //         })
    //         paths = paths[part].children;
    //     }
    //     return componentsObjects;
    // },
    makeComponentsObjects: function(parts) {
        let componentsObjects = [];
        let paths = this.paths;
        for (let i = 0, part; i < parts.length, part = parts[i]; i++) {
            const pathParams = paths[part].parameters;
            let params, component;
            if (pathParams && pathParams.length > 0) {
                if (parts[i+1]) {
                    params = parts.slice(i+1, i+1+pathParams.length);
                    i = i + params.length;

                    const partsAvailable = parts.length-i;
                    if (partsAvailable > params.length) {
                        paths[parts[++i]]
                    }
                    else if (partsAvailable === params.length) {
                        if (!paths[part].children['__defaultWithParams']) return false;
                    }
                }
                else {

                }
            }
            else {

            }
        }
        return componentsObjects;
    },
    // For instance, in case if need to render modal including it into routing
    checkIfSpecialCase: function(parts) {

    },
    navigate: function(link) {
        let parts = ['/'];

        if (link !== '/') {
            link = link[0]               === '/' ? link.substring(1)              : link;
            link = link[link.length - 1] === '/' ? link.substring(0, link.length) : link;
            parts = parts.concat(link.split('/'));
        }
        
        if (!this.pathExists(parts)) {
            // display error
            console.log('The current path does not exist')
        }

        const componentsObjects = this.makeComponentsObjects(parts);

        try {
            MainController.render(componentsObjects);
            // add state
            history.pushState({}, '', link);
            console.log('Navigated to ' + link)
        }
        catch(e) {

        }
    }
};

module.exports = Router;