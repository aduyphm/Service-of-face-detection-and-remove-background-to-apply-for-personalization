import * as facemesh from '@tensorflow-models/facemesh';
import Stats from 'stats.js';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { drawMesh, calculateFaceAngle } from "./utilities";

import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

tfjsWasm.setWasmPath(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/tfjs-backend-wasm.wasm`);

function isMobile() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isAndroid || isiOS;
}

let model, ctx, videoWidth, videoHeight, video, canvas;
const VIDEO_SIZE = 500;
const mobile = isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.
const stats = new Stats();
const state = {
  backend: 'wasm',
  maxFaces: 1,
  triangulateMesh: true,
  headPoseEstimation: true
};

function setupDatGui() {
  const gui = new dat.GUI();
  gui.add(state, 'backend', ['wasm', 'webgl', 'cpu'])
      .onChange(async backend => {
        await tf.setBackend(backend);
      });

  gui.add(state, 'maxFaces', 1, 20, 1).onChange(async val => {
    model = await facemesh.load({maxFaces: val});
  });

  gui.add(state, 'triangulateMesh');
  gui.add(state, 'headPoseEstimation');

}

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      // Only setting the video to a specified size in order to accommodate a
      // point cloud, so on mobile devices accept the default size.
      width: mobile ? undefined : VIDEO_SIZE,
      height: mobile ? undefined : VIDEO_SIZE
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

const getBBox = (prediction) => {
  const scaledMesh = prediction.scaledMesh;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity
  let maxY = -Infinity

  scaledMesh.forEach(p => {
      minX = Math.min(minX, p[0])
      maxX = Math.max(maxX, p[0])
      minY = Math.min(minY, p[1])
      maxY = Math.max(maxY, p[1])
  })
  return {
      width: Math.round(maxX - minX),
      height: Math.round(maxY - minY),
      x: minX,
      y: minY
  }
}

async function renderPrediction() {
  stats.begin();

  const predictions = await model.estimateFaces(video);
  ctx.drawImage(
      video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

  // if (predictions.length > 0) {
    // predictions.forEach(prediction => {
    //   const keypoints = prediction.scaledMesh;
    //   const bbox = getBBox(prediction);
    //   ctx.beginPath();
    //   ctx.rect(bbox.x, bbox.y, bbox.width, bbox.height);
    //   ctx.stroke();
    // });
  // }

  if (predictions.length > 0) {
    predictions.forEach(prediction => {
      const angle = calculateFaceAngle(prediction.scaledMesh);
      drawMesh(prediction, angle, videoHeight, videoWidth, ctx, state);
      
      ctx.save();
      ctx.translate(videoWidth / 2, 50);
      ctx.scale(-1, 1);

      ctx.fillStyle = 'black';
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      let yaw = Math.round(angle['yaw'] * 180 / Math.PI);
      let pitch = Math.round(angle['pitch'] * 180 / Math.PI);
      let roll = Math.round(angle['roll'] * 180 / Math.PI);
      ctx.fillText(roll, 0, 0);

      ctx.restore();
    });
  }

  stats.end();
  requestAnimationFrame(renderPrediction);
};

async function main() {
  await tf.setBackend(state.backend);
  setupDatGui();

  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);

  await setupCamera();
  video.play();
  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  canvas = document.getElementById('output');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  const canvasContainer = document.querySelector('.canvas-wrapper');
  canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

  ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;

  model = await facemesh.load({maxFaces: state.maxFaces});
  renderPrediction();
};

main();
