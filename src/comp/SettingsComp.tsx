import { Store } from "tauri-plugin-store-api";
import { join, resourceDir } from "@tauri-apps/api/path";
import "../App.css"
import { HiOutlineArrowPath, HiOutlineArrowUpTray, HiOutlineCursorArrowRays, HiOutlineRocketLaunch, HiOutlineSpeakerWave } from "react-icons/hi2";
import { useEffect, useState } from "react";
import { enable, disable } from "tauri-plugin-autostart-api";
import { WebviewWindow } from '@tauri-apps/api/window';
import { FileEntry, readDir } from "@tauri-apps/api/fs";

const resourceDirPath = await resourceDir();
const path = await join(resourceDirPath, 'data', 'data_src.bin');
const store = new Store(path);
const allModels:string[] = [];


function SettingsComp() {
  const [modelVoice, setModelVoice] = useState(true);
  const [clickThrough, setClickThrough] = useState(false);
  const [stayTop, setStayTop] = useState(true);
  const [autoStart, setAutoStart] = useState(true);
  const [live2dModels] = useState(["haru_greeter_t03.model3.json"]);
  const [currModel, setCurrModels] = useState("");
  const [refresh, setRefresh] = useState(false);

  async function getSettings() {
    const sModelVoice = await store.get("model_voice");
    const sClickThroughe = await store.get("click_through");
    const sStayTop = await store.get("stay_top");
    const sAutoStart = await store.get("auto_start");
    const modelUrl = await store.get("model_url");

    setModelVoice(sModelVoice as boolean);
    setClickThrough(sClickThroughe as boolean);
    setStayTop(sStayTop as boolean);
    setAutoStart(sAutoStart as boolean);
    const sCurrModel = modelUrl === null ? "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json" : modelUrl as  string;

    console.log("sCurrModel", sCurrModel);
    
    allModels.push(sCurrModel);
    const lastSlash = (sCurrModel.startsWith("http") || sCurrModel.startsWith("/")) ? sCurrModel.lastIndexOf("/") : sCurrModel.lastIndexOf("\\");
    const modelName = sCurrModel.substring(lastSlash + 1);
    console.log("modelName", modelName);
    
    setCurrModels(modelName);
  }

  async function setSettings(key: string, val: any) {
    console.log("setSettings-", key, ": ", val);
    if (key !== "model_url") {
      await store.set(key, val);
    }
    const mainWindow = WebviewWindow.getByLabel('main')

    switch (key) {
      case "model_voice": {
        setModelVoice(val);
        console.log("model_voice: ", val);

        if (val) {
          mainWindow?.emit('model_voice', true);
        } else {
          mainWindow?.emit('model_voice', false);
        }
        break;
      }
      case "click_through": {
        console.log("click_through: ", val);
        setClickThrough(val);
        if (val) {
          mainWindow?.setIgnoreCursorEvents(true);
        } else {
          mainWindow?.setIgnoreCursorEvents(false);
        }
        break;
      }
      case "stay_top": {
        console.log("stay_top: ", val);
        setStayTop(val);
        if (val) {
          mainWindow?.setAlwaysOnTop(true);
        } else {
          mainWindow?.setAlwaysOnTop(false);
        }
        break;
      }
      case "auto_start": {
        console.log("auto_start: ", val);
        if (val) {
          enable();
        } else {
          disable();
        }
        setAutoStart(val);
        break;
      }
      case "model_url": {
        console.log(allModels);
        var foundURL = allModels.find(
          (element) => {
            const path = element.replace(/\\/g, "/");
            console.log("path: ", path);
            console.log("contains: ", path.indexOf(val) !== -1);
            
            return path.indexOf(val) !== -1;
          }
        );
        if (foundURL !== undefined) {
          const http = foundURL.replace(resourceDirPath, "https://asset.localhost/");
          const url = http.replace(/\\/g, "/");
          console.log("foundURL: ", url);
          await store.set(key, url);
          mainWindow?.emit('model_url', url);
        }
        break;
      }
      default: { }
    }

    await store.save();
  }

  async function refreshLive2dModels() {
    const modelPath = await join(resourceDirPath, 'live2d');
    const entries = await readDir(modelPath, { recursive: true });
    findLive2dModels(entries);
    setRefresh(!refresh);
  }

  async function findLive2dModels(models: FileEntry[]) {
    for (const model of models) {
      // console.log(`Entry: ${model.path}`);

      if (model.children) {
        findLive2dModels(model.children)
      } else {
        if (model.name?.endsWith(".model3.json") || model.name?.endsWith(".model.json")) {
          if (live2dModels.indexOf(model.name) === -1) {
            allModels.push(model.path);
            console.log(model.path);
            live2dModels.push(model.name);
          }
        }
      }
    }
  }

  useEffect(() => {
    refreshLive2dModels();
    getSettings();
  }, []);

  return (
    <div className="w-full h-full bg-gray-100">
      <div className="basis-1/5 w-full h-20 grid grid-cols-2 grid-rows-2">
        <button className="flex h-full items-center mx-4 px-4 space-x-3">
          <HiOutlineSpeakerWave className=" w-6 h-6" />
          <span className="w-28 text-left">Model Voice</span>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={modelVoice}
            onChange={() => {
              setSettings("model_voice", !modelVoice);
            }}
          />
        </button>
        <button className="flex h-full items-center mx-4 px-4 space-x-3">
          <HiOutlineCursorArrowRays className=" w-6 h-6" />
          <span className="w-28 text-left">Click Through</span>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={clickThrough}
            onChange={() => {
              setSettings("click_through", !clickThrough);
            }}
          />
        </button>
        <button className="flex h-full items-center mx-4 px-4 space-x-3">
          <HiOutlineArrowUpTray className=" w-6 h-6" />
          <span className="w-28 text-left">Stay at top</span>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={stayTop}
            onChange={() => {
              setSettings("stay_top", !stayTop);
            }}
          />
        </button>
        <button className="flex h-full items-center mx-4 px-4 space-x-3">
          <HiOutlineRocketLaunch className=" w-6 h-6" />
          <span className="w-28 text-left">Start at launch</span>
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={autoStart}
            onChange={() => {
              setSettings("auto_start", !autoStart);
            }}
          />
        </button>
      </div>
      <div className="basis-4/5 px-4 w-full bg-gray-300 mb-8">
        <div className="flex w-full justify-between items-center">
          <h2 className=" px-4 py-2">Choose live2d model: </h2>

          <button className="flex" onClick={() => { refreshLive2dModels(); }}>
            <HiOutlineArrowPath className=" w-6 h-6 mx-4" />
          </button>
        </div>

        <div className="h-72 space-y-2 overflow-y-auto">
          {live2dModels.map((live2dModel) => (
            <div className={ live2dModel === currModel ? "flex flex-row items-center justify-between border-2 rounded-xl mx-4 hover:mx-0 border-green-300" :
             "flex flex-row items-center justify-between border-2 rounded-xl mx-4 hover:mx-0 border-gray-400"} onClick={() => { 
              setSettings("model_url", live2dModel);setCurrModels(live2dModel); }}>
            {/* <div className="flex flex-row items-center justify-between border-2 rounded-xl mx-4 hover:mx-0 border-green-300"> */}
              <h2 className={live2dModel === currModel ? "w-4/5 px-2 py-2 truncate rounded-l-md bg-green-300": "w-4/5 px-2 py-2 truncate rounded-l-md bg-gray-400"}>{live2dModel}</h2>
              <input
                type="checkbox"
                className="w-5 h-5 mx-4"
                checked={ live2dModel === currModel }
                onChange={() => {
                  setSettings("model_url", live2dModel);
                  setCurrModels(live2dModel);
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SettingsComp;
