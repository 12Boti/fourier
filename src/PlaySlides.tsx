
import { ReactiveMap } from "@solid-primitives/map";
import { pb, UserRecord, getAvatar } from './pocketbase';
import { linspace } from "./Editor";
import { UnsubscribeFunc } from "pocketbase";
import { createMemo, For, Index, onCleanup } from "solid-js";
import Complex from "complex.js";
import { PlotSvg } from "./Svg";

export const PlaySlides = () => {
  const userMap = new ReactiveMap<string, UserRecord & {avatar: string}>();
  const users = createMemo(() => [...userMap.values()]);
  const shouldScroll = () => users().length >= 3;

  let unsubscribe: UnsubscribeFunc | null = null;
  (async () => {
    unsubscribe = await pb.collection('users').subscribe<UserRecord>('*', async function (e) {
      userMap.set(e.record.id, {...e.record, avatar: getAvatar(e.record.id)});
    });
  })();
  onCleanup(() => { if (unsubscribe) unsubscribe() });

  return <>
    <section>
      <div classList={{"scrolling-grid": shouldScroll()}} class="absolute top-0 w-full">
        <Index each={shouldScroll() ? users().concat(users()) : users()}>
          {(user) => (
            <div class="w-full flex flex-row">
              <img src={user().avatar} class="w-50"></img>
              <div class="w-full">
                <PlotSvg
                  func={x => Math.sin((x*user().frequency + user().phase)*Math.PI*2)/2 + user().scale2*Math.sin((x*user().frequency2 + user().phase2)*Math.PI*2)/2}
                  min={Complex(-3, -1.1)} max={Complex(3, 1.1)}
                  xlabel="" ylabel="" />
              </div>
            </div>
          )}
        </Index>
      </div>
    </section>
  </>;
}
