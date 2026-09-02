"use client";

/**
 * Emoji picker and quick-reaction bar for the WhatsApp console.
 *
 * A curated set rather than a dependency: the full Unicode table plus search
 * indexes is ~1 MB of JS for a feature that, here, is "put a face in a reply or
 * react to a message". These are the emoji people actually send in business
 * chats, grouped the way WhatsApp groups them.
 */

import { useState } from "react";

export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const GROUPS: { key: string; label: string; icon: string; emoji: string[] }[] = [
  {
    key: "smileys",
    label: "Smileys & people",
    icon: "🙂",
    emoji: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩",
      "😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐",
      "😐","😑","😶","😏","😒","🙄","😬","😮","😯","😲","🥺","😢","😭","😤","😠","😡",
      "🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤝","🙏","👏","👍","👎","👊",
      "✊","🤛","🤜","🤞","✌️","🤟","🤘","👌","🤌","🤏","👈","👉","👆","👇","☝️","✋",
      "🖐️","🖖","👋","🤙","💪","🙌","👐","🤲","🙋","🙆","🙅","💁","🤦","🤷","👨‍💻","👩‍💻",
    ],
  },
  {
    key: "hearts",
    label: "Hearts & symbols",
    icon: "❤️",
    emoji: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖",
      "💘","💝","💯","💢","💥","💫","💦","💨","🕳️","💬","🗯️","💭","💤","✅","❌","❓",
      "❗","⚠️","🔥","⭐","🌟","✨","⚡","🎉","🎊","🏆","🥇","🎯","🔔","🔕","📌","📍",
    ],
  },
  {
    key: "work",
    label: "Work & objects",
    icon: "💼",
    emoji: [
      "💼","📁","📂","📄","📃","📑","📊","📈","📉","🗂️","📅","📆","🗓️","📇","📋","📝",
      "✏️","🖊️","🖋️","🔍","🔎","🔐","🔒","🔓","🔑","🗝️","💻","🖥️","⌨️","🖱️","🖨️","📱",
      "☎️","📞","📟","📠","📧","📨","📩","📤","📥","📦","🧾","💳","💰","💵","💸","🪙",
      "⏰","⏳","⌛","🕐","📢","📣","🔊","🔗","⚙️","🛠️","🧰","🔧","🚀","💡","🧭","🗺️",
    ],
  },
  {
    key: "food",
    label: "Food & drink",
    icon: "☕",
    emoji: [
      "☕","🍵","🧋","🥤","🧃","🍺","🍻","🥂","🍷","🍸","🥃","🍾","🍽️","🍴","🥄","🍕",
      "🍔","🍟","🌭","🥪","🌮","🌯","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🍚","🍞","🥐",
      "🥖","🧇","🥞","🍩","🍪","🎂","🍰","🧁","🍫","🍬","🍭","🍦","🍎","🍌","🍇","🍓",
    ],
  },
  {
    key: "travel",
    label: "Travel & places",
    icon: "✈️",
    emoji: [
      "✈️","🛫","🛬","🚗","🚕","🚙","🚌","🚑","🚒","🚚","🚛","🏍️","🚲","🛴","🚂","🚆",
      "🚇","🚊","⛵","🚤","🛳️","⚓","🏠","🏡","🏢","🏬","🏭","🏗️","🌆","🌃","🌉","🗼",
      "🗽","🕌","🕋","⛰️","🏔️","🌋","🏝️","🏖️","🌊","🌴","🌵","🌲","🌳","🌍","🌎","🌏",
    ],
  },
  {
    key: "time",
    label: "Nature & weather",
    icon: "☀️",
    emoji: [
      "☀️","🌤️","⛅","🌥️","☁️","🌦️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","🌪️","🌫️","🌈",
      "🌙","🌛","🌜","🌚","🌝","🌞","⭐","🌠","🌌","🪐","💐","🌸","🌷","🌹","🌺","🌻",
      "🌼","🍀","🍁","🍂","🍃","🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐨","🦁","🐯","🐮",
    ],
  },
];

export function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const [active, setActive] = useState(GROUPS[0].key);
  const group = GROUPS.find((g) => g.key === active) ?? GROUPS[0];

  return (
    <>
      {/* Click-away shield */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute bottom-full left-0 z-40 mb-2 w-[330px] overflow-hidden rounded-lg bg-white"
        style={{ boxShadow: "0 4px 20px rgba(11,20,26,0.2)" }}
        role="dialog"
        aria-label="Emoji picker"
      >
        <div className="flex border-b" style={{ borderColor: "#e9edef" }}>
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActive(g.key)}
              className="flex-1 py-2 text-[17px] transition"
              style={{
                background: g.key === active ? "#f0f2f5" : "transparent",
                borderBottom: g.key === active ? "2px solid #00a884" : "2px solid transparent",
              }}
              title={g.label}
              aria-label={g.label}
              aria-pressed={g.key === active}
            >
              {g.icon}
            </button>
          ))}
        </div>
        <div className="max-h-[220px] overflow-y-auto p-2">
          <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#8696a0" }}>
            {group.label}
          </p>
          <div className="grid grid-cols-8 gap-0.5">
            {group.emoji.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => onPick(emoji)}
                className="flex h-9 w-9 items-center justify-center rounded text-[21px] leading-none transition hover:bg-black/5"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
