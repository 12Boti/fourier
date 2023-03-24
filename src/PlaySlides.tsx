
import { ReactiveMap } from "@solid-primitives/map";
import { pb, UserRecord, getAvatar } from './pocketbase';
import { linspace } from "./Editor";
import { UnsubscribeFunc } from "pocketbase";
import { createMemo, For, onCleanup } from "solid-js";

export const PlaySlides = () => {
  const userMap = new ReactiveMap<string, UserRecord & {avatar: string}>();
  const users = createMemo(() => [...userMap.values()]);

  let unsubscribe: UnsubscribeFunc | null = null;
  (async () => {
    unsubscribe = await pb.collection('users').subscribe<UserRecord>('*', async function (e) {
      userMap.set(e.record.id, {...e.record, avatar: getAvatar(e.record.id)});
    });
  })();
  onCleanup(() => { if (unsubscribe) unsubscribe() });

  return <>
    <section>
      <div class="grid-container">
        <For each={users().concat(users())}>
          {(user) => (
            <div class="grid-row">
              <img src={user.avatar} class="grid-item"></img>
              <div class="grid-item-func">
                <Plot points={() => linspace(-8, 8, 1000).map((x) => [x, Math.sin(x/Math.PI*user.number)])} minX={-7.5} maxX={7.5} minY={-1.1} maxY={1.1} />
              </div>
            </div>
          )}
        </For>
      </div>
    </section>
  </>;
}
