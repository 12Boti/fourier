
import { ReactiveMap } from "@solid-primitives/map";
import { pb, UserRecord, getAvatar } from './pocketbase';
import { linspace } from "./Editor";
import { UnsubscribeFunc } from "pocketbase";
import { createMemo, For, Index, onCleanup } from "solid-js";
import Complex from "complex.js";
import { PlotSvg } from "./Svg";

export let userSumFunc: ((x: number) => number) | null = null;

export const PlaySlides = () => {
  const userMap = new ReactiveMap<string, UserRecord & {avatar: string}>();
  const users = createMemo(() => [...userMap.values()]);
  const shouldScroll = () => users().length >= 3;

  let unsubscribe: UnsubscribeFunc | null = null;
  const subscribe = async () => {
    unsubscribe = await pb.collection('users').subscribe<UserRecord>('*', async function (e) {
      userMap.set(e.record.id, {...e.record, avatar: getAvatar(e.record.id)});
    });
  };
  subscribe();
  onCleanup(() => { if (unsubscribe) unsubscribe() });

  const userFunc =
    ({frequency, phase, frequency2, phase2, scale2}: UserRecord) =>
      (x: number) =>
        Math.sin((x*frequency + phase)*Math.PI*2)/2 +
        scale2*Math.sin((x*frequency2 + phase2)*Math.PI*2)/2;
  
  userSumFunc = (x: number) => users().map(userFunc).reduce((acc, y) => acc+y(x), 0)/users().length;

  return <>
    <section>
      <div classList={{"scrolling-grid": shouldScroll()}} class="absolute top-0 w-full">
        <Index each={shouldScroll() ? users().concat(users()) : users()}>
          {(user) => (
            <div class="w-full flex flex-row">
              <img src={user().avatar} class="w-50"></img>
              <div class="w-full">
                <PlotSvg
                  func={userFunc(user())}
                  min={Complex(-3, -1.1)} max={Complex(3, 1.1)}
                  xlabel="" ylabel="" />
              </div>
            </div>
          )}
        </Index>
      </div>
    </section>
    <section>
      <PlotSvg
        func={userSumFunc}
        min={Complex(-3, -1.1)} max={Complex(3, 1.1)}
        xlabel="" ylabel="" />
    </section>
  </>;
}
