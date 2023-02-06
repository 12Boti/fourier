import { Component, createSignal, For } from "solid-js";
import { Svg, Arrow } from './Svg';
import { Complex } from 'complex.js';
import AsciiMath from './AsciiMath';
import { createAnimation, createSequence } from './animation';
import { pb, UserRecord, getAvatar } from './pocketbase';

function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x);
}

async function fetchUsers(): Promise<(UserRecord & {avatar: string})[]> {
  const raw = await pb.collection('users').getFullList<UserRecord>(200 /* batch size */, {
    sort: '-created',
  });
  let r = [];
  for (let i = 0; i < raw.length; i++) {
    r.push({...raw[i], avatar: await getAvatar(raw[i].id)});
  }
  return r;
}

const Slides: Component = () => {
  const [x, setX] = createSignal(0);
  const anim = createSequence([
    {update: setX, from: 0,    to: 0.25, easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 0.25, to: 1,    easing: easeOutQuad, duration: 2, delay: 1},
    {update: setX, from: 1,    to: 0.75, easing: easeOutQuad, duration: 2, delay: 1},
  ]);
  const [users, setUsers] = createSignal<(UserRecord & {avatar: string})[]>([]);

  (async () => setUsers(await fetchUsers()))();

  pb.collection('users').subscribe('*', async function (e) {
    setUsers(await fetchUsers());
  });

  /*
  let double_users: any[] = users();
  double_users.concat(users());
  console.log(users());
  */
  return <>
    <section><h1>Fourier-transzformáció</h1></section>
    <section>
      <AsciiMath>hat(f)(xi) = int_-oo^oo f(x)e^(-i2pi xi x)dx</AsciiMath>
    </section>
    <section on:reveal={anim.start}>
      <div class="flex items-center justify-center">
        <AsciiMath>{`e^(-i2pi*${x().toFixed(2)})`}</AsciiMath>
        <Svg min={Complex(-1.2, -1.2)} max={Complex(1.2, 1.2)} class="w-60%">
          <Arrow from={Complex(0,0)} to={Complex({arg: -2*Math.PI*x(), abs: 1})} />
        </Svg>
      </div>
    </section>
    <section>
      <div class="grid grid-rows-3" style="grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr);">
        <For each={users()}>
          {(user) => (
            <div>
              <img src={user.avatar} class="max-w-xs max-h-xs"></img>
              <h3>{user.number}</h3>
            </div>
          )}
        </For>
      </div>
    </section>
    <section>
      <div class="grid-container">
        <For each={users().concat(users())}>
          {(user) => (
            <div class="grid-row">
              <img src={user.avatar} class="grid-item"></img>
              <h3 class="grid-item">{user.number}</h3>
            </div>
          )}
        </For>
      </div>
    </section>
  </>;
};

export default Slides;
