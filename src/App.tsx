import { useEffect, useState } from "react";
import "./App.css";

import { install } from '@pixi/unsafe-eval';
import { config, Live2DModel } from 'pixi-live2d-display/cubism4';

import { HiArrowPath, HiOutlineArrowsRightLeft, HiOutlineArrowsUpDown, HiOutlineCog6Tooth, HiOutlineGlobeAlt, HiOutlineMagnifyingGlassPlus } from "react-icons/hi2";
import NumChange from "./comp/NumChange";
import { listen } from "@tauri-apps/api/event";
import { Store } from "tauri-plugin-store-api";
import { join, resourceDir } from "@tauri-apps/api/path";
import { openSettings } from "./comp/Settings";

import * as PIXI from 'pixi.js';

install(PIXI);
const resourceDirPath = await resourceDir();
const path = await join(resourceDirPath, 'data', 'data_src.bin');
const store = new Store(path);

var refreshedTime = Date.now() - 5000;
var justStart = true;
var modelURL = "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";

(window as any).PIXI = PIXI;

let unlisten: any = null;
let modelListen: any = null;

function App() {
  var modelAdded = false;

  // const [modelVis, setModelVis] = useState(true);
  const [refresh, refreshModel] = useState(false);
  const [canvasCenter, setCanvasCenter] = useState({ top: 300, left: 300 });

  const app = new PIXI.Application({
    view: document.getElementById("canvas") as HTMLCanvasElement,
    autoStart: true,
    resizeTo: window,
    backgroundColor: 0x00ffffff,
    backgroundAlpha: 0,
    useContextAlpha: 'notMultiplied'
  });
  // https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json
  // https://asset.localhost/live2d/buleisite_2/buleisite_2.model3.json

  const model = Live2DModel.fromSync(modelURL);
  model.scale.set(0.1);
  var theScale = 0.1;

  async function getSettings() {
    const modelX = await store.get("model_x");
    const modelY = await store.get("model_y");
    const modelScale = await store.get("model_s");
    console.log("modelX: ", modelX, "modelY: ", modelY, "modelScale: ", modelScale);

    const valmodelX = modelX as number;
    const valmodelY = modelY as number;
    const valModelScale = modelScale as number;
    model.x = valmodelX;
    model.y = valmodelY;
    model.scale.set(valModelScale);
  }

  async function setLice2dModel() {
    const modelUrl = await store.get("model_url");
    const url = modelUrl as string;
    modelURL = url;
    model.destroy();
    refreshModel(!refresh);
  }

  async function setSettings(key: string, val: number) {
    await store.set(key, val);
    await store.save();
    console.log("setSettings: ", val);
  }

  const startListen = () => {
    if (unlisten != null && modelListen != null) {
      console.log("already listen");
      return;
    }

    const start_listen = async () => {
      //注意event名称要与后端保持一致
      return await listen('model_voice', (event) => {
        console.log('listen model_voice: ', event.payload as boolean);

        config.sound = event.payload as boolean;
      });
    };
    const model_listen = async () => {
      //注意event名称要与后端保持一致
      return await listen('model_url', (event) => {
        const url = event.payload as string;
        console.log('listen model_url: ', url);
        modelURL = url;
        model.destroy();
        refreshModel(!refresh);
      });
    };
    unlisten = start_listen();
    modelListen = model_listen();
  };

  useEffect(() => {
    console.log("useEffect useEffect useEffect useEffect");
    const modelCanvas = document.getElementById("canvas") as HTMLCanvasElement;
    const rect = modelCanvas.getBoundingClientRect();
    setCanvasCenter({
      top: rect.top + (rect.bottom - rect.top) / 2,
      left: rect.left + (rect.right - rect.left) / 2
    });
    console.log(canvasCenter);

    startListen();
  }, []);

  // 在这里可以更新模型的 json 数据
  model.once('settingsJSONLoaded', (json) => {
    // e.g. customize the layout before it's applied to the model
    json.layout = {
      ...json.layout,
      width: 2,
      height: 2,
    };
    console.log("settingsJSONLoaded");
  });

  model.once('ready', () => {
    // now it's safe to display the model, though not recommended because
    // it's likely to look weird due to missing optional resources
    if (!modelAdded) {
      app.stage.addChild(model);
      modelAdded = true;

      getSettings();

      model.pivot.set(canvasCenter.top, canvasCenter.left);
      // 交互
      model.on("hit", (hitAreas) => {
        if (hitAreas.includes("Body")) {
          model.motion("Tap");
        }

        if (hitAreas.includes("Head")) {
          model.expression();
        }
      });
    }
    if (justStart) {
      setLice2dModel();
      justStart = false;
    }
  });

  return (
    <div className="w-full h-full static border border-gray-100 border-dashed">
      <canvas id="canvas" className="w-full h-full" />
      {/* <div className="w-full h-full bg-pink-400" /> */}
      <ul className="absolute flex flex-col inset-y-0 right-0 mx-4 my-8 space-y-4">
        <li
          onClick={() => {
            const now = Date.now();
            if (now - refreshedTime > 5000) {
              refreshModel(!refresh)
              refreshedTime = now;
            }
          }}
          className="w-8 h-8"
        >
          <HiArrowPath className="icon-menu" />
        </li>
        {
          // modelVis ? (
          // <li className="w-8 h-8" >
          //   <HiOutlineEye onClick={() => { setModelVis(false) }} className="icon-menu" />
          // </li>) : (
          // <li className="w-8 h-8" >
          //   <HiOutlineEyeSlash onClick={() => { setModelVis(true) }} className="icon-menu" />
          // </li>)
        }

        <li className="w-8 h-8 group/scale" >
          <HiOutlineMagnifyingGlassPlus className="icon-menu" />
          <NumChange visGroup="group-hover/scale:visible"
            onPlus={() => {
              theScale += 0.002;
              model.scale.set(theScale);
              console.log("scale plus 0.02");
            }}
            onMinus={() => {
              theScale -= 0.002;
              model.scale.set(theScale);
              console.log("scale minus 0.02");
            }}
            storeValue={() => { setSettings("model_s", theScale) }}
            styles={{ top: 50, left: -45 }} />

          {/* 本来是按照滑块设计的，有内存泄漏问题。先放着，不要移除。 */}
          {/* <div className="scroll-bg group-hover/scale:visible">
            <input onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              // setTheS(Number(event.target.value));
              // greet();
            }} type="range" min={0.1} max="5" step={0.1} value={theS} className="range range-xs rotate-180 mx-4" />
          </div> */}
        </li>
        <li className="w-8 h-8 group/rl" onClick={() => { }}>
          <HiOutlineArrowsRightLeft className="icon-menu" />


          <NumChange visGroup="group-hover/rl:visible"
            onPlus={() => {
              model.x += 10;
              console.log("x plus 10");
            }}
            onMinus={() => {
              model.x -= 10;
              console.log("x minus 10");
            }}
            storeValue={() => { setSettings("model_x", model.x) }}
            styles={{ top: 96, left: -45 }} />

          {/* 本来是按照滑块设计的，有内存泄漏问题。先放着，不要移除。 */}
          {/* <div className="scroll-bg group-hover/rl:visible">
            <input onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const x = Number(event.target.value)
              // setTheX(Number(event.target.value));
            }} type="range" min={-5000} max="10000" value={theX} className="range range-xs rotate-180 mx-4" />
          </div> */}
        </li>
        <li className=" w-8 h-8 group/tb">
          <HiOutlineArrowsUpDown className="icon-menu" />
          <NumChange visGroup="group-hover/tb:visible"
            onPlus={() => {
              model.y += 10;
              console.log("y plus 10");
            }}
            onMinus={() => {
              model.y -= 10;
              console.log("y minus 10");
            }}
            storeValue={() => { setSettings("model_y", model.y) }}
            styles={{ top: 142, left: -45 }} />
        </li>
        <li className="w-8 h-8" onClick={() => { openSettings() }}>
          <HiOutlineCog6Tooth className="icon-menu" />
        </li>
        <li data-tauri-drag-region className="w-8 h-8">
          <HiOutlineGlobeAlt data-tauri-drag-region className="icon-menu" />
        </li>
      </ul>

    </div>
  );
}

export default App;
