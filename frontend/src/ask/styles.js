/** Shared class strings + helpers for the Ask design (design_handoff_ask_support). */

export const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");

export const textareaClass =
  "w-full resize-y rounded-2xl border border-[rgba(138,111,52,0.28)] bg-[#FFFDF8] p-4 font-normal leading-[1.6] text-[#1B3328] outline-none placeholder:text-[#5A5546]/70 focus:border-[rgba(201,162,74,0.75)] focus:shadow-[0_0_0_3px_rgba(201,162,74,0.18)]";

export const primaryButtonClass =
  "cursor-pointer rounded-full border-none bg-[linear-gradient(135deg,#E8CF83,#C9A24A_55%,#A8853A)] font-semibold text-[#14241C] transition-[filter] hover:brightness-105 disabled:cursor-wait disabled:opacity-70";
