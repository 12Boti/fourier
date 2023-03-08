// Based on Daniel Shiffman's code.
// https://thecodingtrain.com/CodingChallenges/130.1-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.2-fourier-transform-drawing.html
// https://thecodingtrain.com/CodingChallenges/130.3-fourier-transform-drawing.html
// https://youtu.be/7_vKzcgpfvU




import { Component, createSignal, onMount , createEffect, on, Context } from 'solid-js';
import {Complex} from 'complex.js';
import {normalized, fft, dft} from './fourier';
import {train} from './codingtrain';

let x = [];
let fourierX: {z: Complex,freq: number}[];
let time = 0;
let path: Complex[] = [];
let drawing: Complex[] = [];
let userDrawing = false;


function epicycles(x:number, y: number, rotation: number, fourier: {z: Complex,freq: number}[], context: CanvasRenderingContext2D) {
  for (let i = 0; i < fourier.length; i++) {
    let prevx = x;
    let prevy = y;
    let freq = fourier[i].freq;
    let radius = fourier[i].z.abs();
    let phase =  fourier[i].z.arg();
    x += radius * Math.cos(freq * time + phase + rotation);
    y += radius * Math.sin(freq * time + phase + rotation);
    context.beginPath();
    context.strokeStyle = "rgba(255, 165, 250, 0.5)";
    context.moveTo(prevx+radius, prevy);
    context.ellipse(prevx, prevy, radius, radius, 0, 0, 2 * Math.PI);
    
    context.beginPath();
    context.strokeStyle = "#FCFC05";
    context.moveTo(prevx, prevy);
    context.lineTo(x,y);
  }
  context.stroke();
  return new Complex(x,y);
}

function floorPowerOfTwo(n: number): number {
  return Math.pow(2, Math.floor(Math.log2(n)));
}


const Draw: Component = () => {
  const handleDown = (event: MouseEvent | TouchEvent) => {
    userDrawing = true;
    drawing = [];
    x = [];
    time = 0;
    path = [];

    const canvas : HTMLCanvasElement | null = document.getElementById("canvas");
    if (canvas != null) {
      const context = canvas.getContext('2d');
      if (context != null) {
        
        context.beginPath();
        context.strokeStyle = "#05d3fc";
  
        let xCoord: number = 0 , yCoord: number = 0;
        if (event instanceof MouseEvent) {
          xCoord = event.offsetX;
          yCoord = event.offsetY;
        } else if (event instanceof TouchEvent) {
          const touch = event.touches[0];
          xCoord = touch.clientX;
          yCoord = touch.clientY;
        }
        context.moveTo(xCoord, yCoord);

        const handleMove = (event: MouseEvent | TouchEvent) => {
          
          event.preventDefault();
          let xCoord: number = 0, yCoord: number = 0;
          if (event instanceof MouseEvent) {
            xCoord = event.offsetX;
            yCoord = event.offsetY;
          } else if (event instanceof TouchEvent) {
            const touch = event.touches[0];
            xCoord = touch.clientX;
            yCoord = touch.clientY;
          }
          context.lineTo(xCoord, yCoord);
          drawing.push(new Complex(xCoord - canvas.width/2, yCoord-canvas.height/2));
          context.stroke();
        };
  
        function animation() {
          if(context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            path.push(epicycles(canvas.width / 2, canvas.height / 2, 0, fourierX, context));
            context.moveTo(path[0].re, path[0].im);
            context.beginPath();
            context.strokeStyle = "#05d3fc";
            for (let i = 0; i < path.length; i++) {
              context.lineTo(path[i].re, path[i].im);
            }
            context.stroke();
            const dt = 2*Math.PI / (fourierX.length);
            time += dt;
            if (time > 2*Math.PI) {
              time = 0;
              path = [];
            }
            if(!userDrawing) {
              window.requestAnimationFrame(animation);
            }
            else {
              context.clearRect(0, 0, canvas.width, canvas.height);
            }
          }
          
        }
  
        const handleUp = () => {
          canvas.removeEventListener('mousemove', handleMove);
          canvas.removeEventListener('mouseup', handleUp);
          canvas.removeEventListener('touchmove', handleMove);
          canvas.removeEventListener('touchend', handleUp);
/*           drawing = [];
          for(let i = 0; i < train.length; i++) {
            drawing.push(Complex(train[i].x, train[i].y));
          } */
          const signallium = drawing.filter((_, k) => (k+1)%Math.floor(drawing.length/(drawing.length-floorPowerOfTwo(drawing.length))) !== 0 || k>(drawing.length-floorPowerOfTwo(drawing.length))*Math.floor(drawing.length/(drawing.length-floorPowerOfTwo(drawing.length))));
          console.log(signallium.length, floorPowerOfTwo(drawing.length), drawing.length, Math.ceil(drawing.length/(drawing.length-floorPowerOfTwo(drawing.length))));
          const t1 = Date.now();
          fourierX = normalized(fft(signallium)).map((z, freq) => ({z, freq}));
          const t2 = Date.now();
          //const fourierY = normalized(dft(drawing)).map((z, freq) => ({z, freq}));
          const t3 = Date.now();
          console.log(t2-t1, t3-t2);
          //console.log(drawing.length);
          fourierX.sort((a, b) => b.z.abs() - a.z.abs());
          userDrawing = false;
          window.requestAnimationFrame(animation);
        };
  
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('mouseup', handleUp);
        canvas.addEventListener('touchmove', handleMove, { passive: false });
        canvas.addEventListener('touchend', handleUp);
      }

      
    }


  };

  return (
    <div>
      <canvas
        id="canvas"
        width= {window.innerWidth}
        height={window.innerHeight}
        onmousedown={handleDown}
        ontouchstart={handleDown}
      ></canvas>
    </div>
  );
};

export default Draw;
