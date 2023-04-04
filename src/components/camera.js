import { useState, useEffect, useRef } from "react";
import classnames from "classnames";
import { Camera } from "react-camera-pro";
import {
  CameraIcon,
  ArrowPathIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";

import { useSpeechSynthesis } from "react-speech-kit";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function CameraView() {
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { speak, voices } = useSpeechSynthesis();

  const speakSound = (answer) => {
    let voice = voices.find((o) => o.name === "Eddy" && o.lang === "en-US");
    speak({ text: answer, voice: voice });
  };

  useEffect(() => {
    console.log("camera is loaded");
    console.log(voices);
  }, [voices]);

  useEffect(() => {
    const fetchData = async (output) => {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: output,
        }),
      });

      const data = await res.json();
      console.log(data.answer);
      // console.log(voices[30]);
      speakSound(data.answer);

      // if ("speechSynthesis" in window) {
      //   console.log("Speech Synthesis is supported 🎉");
      // } else {
      //   console.log("Speech Synthesis is not Supported 😞 ");
      // }
      //speak({ text: data.answer });
      setLoading(false);
      return data;
    };

    if (prediction?.output && loading) {
      const output = prediction?.output;
      console.log(output);

      fetchData(output);
    } else {
      console.log("Prediction still loading...");
    }
  }, [prediction]);

  const getPrediction = async () => {
    console.log("getPrediction");

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caption: true,
        image: image,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
      //getChatGpt();
    }
  };

  useEffect(() => {
    if (image && loading) getPrediction();
  }, [image]);

  const handleClick = async (e) => {
    e.preventDefault();
    //setLoading(true);
    //await sleep(2000);
    //setLoading(false);

    setImage(camera.current.takePhoto());
    setLoading(true);
  };

  return (
    <div className="App">
      <Camera ref={camera} numberOfCamerasCallback={setNumberOfCameras} />
      <div className="absolute z-100 bottom-0 w-full p-8 flex items-center">
        <div className="w-10">
          {/* <button className="no-border">
            <Square3Stack3DIcon className="h-10 w-10 text-white " />
          </button> */}
        </div>
        <div className="flex-1 justify-center flex">
          <button
            onClick={handleClick}
            disabled={loading}
            className={classnames(
              "w-20 h-20 rounded-full hover:bg-red-500 flex text-black hover:text-white justify-center align-center transition-all items-center no-border",
              loading && "bg-red-500 animate-ping",
              !loading && "bg-white"
            )}
          >
            {/* <CameraIcon className="h-14 w-14" /> */}
          </button>
        </div>
        <div className="flex align-items">
          <button
            disabled={numberOfCameras <= 1}
            className="no-border"
            onClick={() => {
              camera.current.switchCamera();
            }}
          >
            <ArrowPathIcon className="h-10 w-10 text-white " />
          </button>
        </div>
      </div>
    </div>
  );
}
