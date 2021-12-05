#USE YARN. NOT NPM.

##Some metamask/web3 docs:
- https://docs.metamask.io/guide/ethereum-provider.html
- https://docs.metamask.io/guide/rpc-api.html#table-of-contents
- https://eth.wiki/json-rpc/API#json-rpc-methods
 

# Debugging with IntelliJ
## Ensure running from yarn
In the project settings (ctrl-alt-s) in **"Languages & Frameworks" -> "Node.js and NPM"** there is an option to set the Package Manager. Set this to yarn.
## Set browser and profile
Once a browser/profile is open, debuggers cannot connect to it (it must be launched with flags).

The steps are:
- Make sure the "start" run configuration is selected
- Click the debug icon to start debugging
- Wait for the **"Process Console | Scripts" > "Process Console"** to settle down
- (If a tab opened in a "normal" chrome window, you can close it)
- **CTRL+SHIFT+Click** on the "Local" link to connect. This opens the dev profile (You may have to install Metamask to this profile too)

It also turns out that you can re-connect to the opened browser window (like if restarting the debug process after adding a new dependency)


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
