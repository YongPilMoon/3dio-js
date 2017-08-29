import runtime from './core/runtime.js'
import checkDependencies from './a-frame/check-dependencies.js'
import Data3dView from './a-frame/three/data3d-view.js'
import getData3d from './a-frame/three/get-data3d.js'
import data3dComponent from './a-frame/component/data3d.js'
import furnitureComponent from './a-frame/component/furniture.js'

// initialize aframe components

checkDependencies({
  three: false,
  aFrame: true,
  onError: function (){
    // show aframe dependency warning, since it is unexpected to run aframe on server
    if (runtime.isBrowser) console.log('AFRAME library not found: related features will be disabled.')
  }
}, function registerComponents () {
  AFRAME.registerComponent('io3d-data3d', data3dComponent)
  AFRAME.registerComponent('io3d-furniture', furnitureComponent)
})

// export

var aFrame = {
  three: {
    Data3dView: Data3dView,
    getData3d: getData3d,
  },
  getData3d: function getData3dFromComponent(selector){
    runtime.assertBrowser()

    var object3d = document.querySelector(selector || 'a-scene').object3D
    return getData3d(object3d)
  }
}

export default aFrame