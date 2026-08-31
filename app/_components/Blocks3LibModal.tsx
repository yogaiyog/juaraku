"use client";

import { useState, useMemo, useEffect } from "react";
import Blocks3Renderer from "./Blocks3Renderer";

export type BlockItem = {
  id: string;
  category: string;
  name: string;
  nameId: string;
  code: string;
  description?: string;
};

const CATEGORIES = [
  { id: "all", label: "Semua Blok", icon: "✨", color: "text-zinc-700 dark:text-zinc-200" },
  { id: "events", label: "Events", icon: "🟡", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  { id: "motion", label: "Motion", icon: "🔵", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
  { id: "looks", label: "Looks", icon: "🟣", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30" },
  { id: "sound", label: "Sound", icon: "🟪", color: "text-pink-500", bg: "bg-pink-500/10 border-pink-500/30" },
  { id: "control", label: "Control", icon: "🟠", color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/30" },
  { id: "sensing", label: "Sensing", icon: "🔷", color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/30" },
  { id: "operators", label: "Operators", icon: "🟢", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30" },
  { id: "variables", label: "Variables", icon: "🔴", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/30" },
  { id: "lists", label: "Lists", icon: "🟧", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30" },
  { id: "pen", label: "Pen Extension", icon: "✏️", color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/30" },
  { id: "recipes", label: "Code Recipes", icon: "🚀", color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/30" },
];

const BLOCKS_DATA: BlockItem[] = [
  // --- EVENTS ---
  {
    id: "when-flag",
    category: "events",
    name: "when green flag clicked",
    nameId: "Ketika bendera hijau diklik",
    code: "when green flag clicked",
    description: "Memulai skrip saat game dijalankan.",
  },
  {
    id: "when-key",
    category: "events",
    name: "when space key pressed",
    nameId: "Ketika tombol spasi ditekan",
    code: "when [space v] key pressed",
    description: "Merespons saat tombol keyboard tertentu ditekan.",
  },
  {
    id: "when-sprite-clicked",
    category: "events",
    name: "when this sprite clicked",
    nameId: "Ketika sprite ini diklik",
    code: "when this sprite clicked",
    description: "Merespons saat pemain mengeklik sprite ini.",
  },
  {
    id: "when-backdrop-switches",
    category: "events",
    name: "when backdrop switches to backdrop1",
    nameId: "Ketika latar belakang berganti",
    code: "when backdrop switches to [backdrop1 v]",
  },
  {
    id: "broadcast-message",
    category: "events",
    name: "broadcast message1",
    nameId: "Kirim pesan siaran (broadcast)",
    code: "broadcast [message1 v]",
    description: "Mengirim sinyal pesan ke sprite lain.",
  },
  {
    id: "broadcast-wait",
    category: "events",
    name: "broadcast message1 and wait",
    nameId: "Kirim pesan siaran dan tunggu",
    code: "broadcast [message1 v] and wait",
  },
  {
    id: "when-receive",
    category: "events",
    name: "when I receive message1",
    nameId: "Ketika saya menerima pesan",
    code: "when I receive [message1 v]",
    description: "Menerima pesan siaran untuk menjalankan kode.",
  },

  // --- MOTION ---
  {
    id: "move-steps",
    category: "motion",
    name: "move 10 steps",
    nameId: "Gerak 10 langkah",
    code: "move (10) steps",
    description: "Menggerakkan sprite maju sesuai arah hadap.",
  },
  {
    id: "turn-right",
    category: "motion",
    name: "turn right 15 degrees",
    nameId: "Putar ke kanan 15 derajat",
    code: "turn right (15) degrees",
  },
  {
    id: "turn-left",
    category: "motion",
    name: "turn left 15 degrees",
    nameId: "Putar ke kiri 15 derajat",
    code: "turn left (15) degrees",
  },
  {
    id: "go-to-xy",
    category: "motion",
    name: "go to x: 0 y: 0",
    nameId: "Pergi ke koordinat x, y",
    code: "go to x: (0) y: (0)",
    description: "Menempatkan sprite di posisi koordinat tertentu.",
  },
  {
    id: "go-to-random",
    category: "motion",
    name: "go to random position",
    nameId: "Pergi ke posisi acak / mouse",
    code: "go to [random position v]",
  },
  {
    id: "glide-xy",
    category: "motion",
    name: "glide 1 secs to x: 0 y: 0",
    nameId: "Meluncur selama 1 detik ke x, y",
    code: "glide (1) secs to x: (0) y: (0)",
  },
  {
    id: "point-direction",
    category: "motion",
    name: "point in direction 90",
    nameId: "Mengarah ke sudut 90 derajat",
    code: "point in direction (90)",
  },
  {
    id: "point-towards",
    category: "motion",
    name: "point towards mouse-pointer",
    nameId: "Menghadap ke penunjuk mouse",
    code: "point towards [mouse-pointer v]",
  },
  {
    id: "change-x",
    category: "motion",
    name: "change x by 10",
    nameId: "Ubah posisi x sebesar 10",
    code: "change x by (10)",
  },
  {
    id: "set-x",
    category: "motion",
    name: "set x to 0",
    nameId: "Atur posisi x ke 0",
    code: "set x to (0)",
  },
  {
    id: "change-y",
    category: "motion",
    name: "change y by 10",
    nameId: "Ubah posisi y sebesar 10 (naik/turun)",
    code: "change y by (10)",
  },
  {
    id: "set-y",
    category: "motion",
    name: "set y to 0",
    nameId: "Atur posisi y ke 0",
    code: "set y to (0)",
  },
  {
    id: "if-on-edge-bounce",
    category: "motion",
    name: "if on edge, bounce",
    nameId: "Jika di pinggir, pantulkan",
    code: "if on edge, bounce",
  },
  {
    id: "set-rotation-style",
    category: "motion",
    name: "set rotation style left-right",
    nameId: "Atur gaya rotasi kiri-kanan",
    code: "set rotation style [left-right v]",
  },

  // --- LOOKS ---
  {
    id: "say-for-secs",
    category: "looks",
    name: "say Hello! for 2 seconds",
    nameId: "Katakan Halo! selama 2 detik",
    code: "say [Hello!] for (2) seconds",
  },
  {
    id: "say-text",
    category: "looks",
    name: "say Hello!",
    nameId: "Katakan Halo!",
    code: "say [Hello!]",
  },
  {
    id: "switch-costume",
    category: "looks",
    name: "switch costume to costume2",
    nameId: "Ganti kostum ke costume2",
    code: "switch costume to [costume2 v]",
  },
  {
    id: "next-costume",
    category: "looks",
    name: "next costume",
    nameId: "Kostum berikutnya",
    code: "next costume",
  },
  {
    id: "switch-backdrop",
    category: "looks",
    name: "switch backdrop to backdrop1",
    nameId: "Ganti latar ke backdrop1",
    code: "switch backdrop to [backdrop1 v]",
  },
  {
    id: "change-size",
    category: "looks",
    name: "change size by 10",
    nameId: "Ubah ukuran sebesar 10",
    code: "change size by (10)",
  },
  {
    id: "set-size",
    category: "looks",
    name: "set size to 100 %",
    nameId: "Atur ukuran ke 100%",
    code: "set size to (100) %",
  },
  {
    id: "change-color-effect",
    category: "looks",
    name: "change color effect by 25",
    nameId: "Ubah efek warna sebesar 25",
    code: "change [color v] effect by (25)",
  },
  {
    id: "clear-graphic-effects",
    category: "looks",
    name: "clear graphic effects",
    nameId: "Hapus efek grafis",
    code: "clear graphic effects",
  },
  {
    id: "show-sprite",
    category: "looks",
    name: "show",
    nameId: "Tampilkan sprite",
    code: "show",
  },
  {
    id: "hide-sprite",
    category: "looks",
    name: "hide",
    nameId: "Sembunyikan sprite",
    code: "hide",
  },
  {
    id: "go-to-front-layer",
    category: "looks",
    name: "go to front layer",
    nameId: "Pergi ke lapisan paling depan",
    code: "go to [front v] layer",
  },

  // --- SOUND ---
  {
    id: "play-sound-until-done",
    category: "sound",
    name: "play sound pop until done",
    nameId: "Mainkan suara pop sampai selesai",
    code: "play sound [pop v] until done",
  },
  {
    id: "start-sound",
    category: "sound",
    name: "start sound pop",
    nameId: "Mulai suara pop",
    code: "start sound [pop v]",
  },
  {
    id: "stop-all-sounds",
    category: "sound",
    name: "stop all sounds",
    nameId: "Hentikan semua suara",
    code: "stop all sounds",
  },
  {
    id: "change-volume",
    category: "sound",
    name: "change volume by -10",
    nameId: "Ubah volume sebesar -10",
    code: "change volume by (-10)",
  },
  {
    id: "set-volume",
    category: "sound",
    name: "set volume to 100 %",
    nameId: "Atur volume ke 100%",
    code: "set volume to (100) %",
  },

  // --- CONTROL ---
  {
    id: "wait-secs",
    category: "control",
    name: "wait 1 seconds",
    nameId: "Tunggu 1 detik",
    code: "wait (1) seconds",
  },
  {
    id: "repeat-loop",
    category: "control",
    name: "repeat 10",
    nameId: "Ulangi 10 kali",
    code: "repeat (10)\n  move (10) steps\nend",
  },
  {
    id: "forever-loop",
    category: "control",
    name: "forever",
    nameId: "Ulangi selamanya (forever)",
    code: "forever\n  move (10) steps\n  if on edge, bounce\nend",
  },
  {
    id: "if-then",
    category: "control",
    name: "if ... then",
    nameId: "Jika ... maka",
    code: "if <touching [mouse-pointer v]?> then\n  say [Aww!] for (1) seconds\nend",
  },
  {
    id: "if-then-else",
    category: "control",
    name: "if ... then ... else",
    nameId: "Jika ... maka ... jika tidak",
    code: "if <(score) > (10)> then\n  say [You Win!] for (2) seconds\nelse\n  say [Keep going!]\nend",
  },
  {
    id: "wait-until",
    category: "control",
    name: "wait until",
    nameId: "Tunggu sampai kondisi terpenuhi",
    code: "wait until <key [space v] pressed?>",
  },
  {
    id: "repeat-until",
    category: "control",
    name: "repeat until",
    nameId: "Ulangi sampai kondisi terpenuhi",
    code: "repeat until <touching [edge v]?>\n  move (5) steps\nend",
  },
  {
    id: "stop-all",
    category: "control",
    name: "stop all",
    nameId: "Hentikan semua skrip",
    code: "stop [all v]",
  },
  {
    id: "when-clone-start",
    category: "control",
    name: "when I start as a clone",
    nameId: "Ketika saya mulai sebagai klon",
    code: "when I start as a clone\nshow\ngo to [random position v]",
  },
  {
    id: "create-clone",
    category: "control",
    name: "create clone of myself",
    nameId: "Buat klon dari diri sendiri",
    code: "create clone of [myself v]",
  },
  {
    id: "delete-clone",
    category: "control",
    name: "delete this clone",
    nameId: "Hapus klon ini",
    code: "delete this clone",
  },

  // --- SENSING ---
  {
    id: "touching-sprite",
    category: "sensing",
    name: "touching mouse-pointer?",
    nameId: "Menyentuh penunjuk mouse / sprite?",
    code: "<touching [mouse-pointer v]?>",
  },
  {
    id: "touching-color",
    category: "sensing",
    name: "touching color?",
    nameId: "Menyentuh warna tertentu?",
    code: "<touching color [#ff0000]?>",
  },
  {
    id: "ask-and-wait",
    category: "sensing",
    name: "ask What's your name? and wait",
    nameId: "Tanyakan dan tunggu jawaban",
    code: "ask [What's your name?] and wait\nsay (answer)",
  },
  {
    id: "key-pressed",
    category: "sensing",
    name: "key space pressed?",
    nameId: "Tombol keyboard ditekan?",
    code: "<key [space v] pressed?>",
  },
  {
    id: "mouse-down",
    category: "sensing",
    name: "mouse down?",
    nameId: "Tombol mouse ditekan?",
    code: "<mouse down?>",
  },
  {
    id: "distance-to",
    category: "sensing",
    name: "distance to mouse-pointer",
    nameId: "Jarak ke penunjuk mouse",
    code: "(distance to [mouse-pointer v])",
  },
  {
    id: "reset-timer",
    category: "sensing",
    name: "reset timer",
    nameId: "Atur ulang pengatur waktu (timer)",
    code: "reset timer",
  },

  // --- OPERATORS ---
  {
    id: "math-add",
    category: "operators",
    name: "addition +",
    nameId: "Penjumlahan (+)",
    code: "((1) + (1))",
  },
  {
    id: "pick-random",
    category: "operators",
    name: "pick random 1 to 10",
    nameId: "Pilih angka acak dari 1 sampai 10",
    code: "(pick random (1) to (10))",
  },
  {
    id: "op-greater",
    category: "operators",
    name: "greater than >",
    nameId: "Lebih besar dari (>)",
    code: "<(score) > (50)>",
  },
  {
    id: "op-equals",
    category: "operators",
    name: "equals =",
    nameId: "Sama dengan (=)",
    code: "<(lives) = (0)>",
  },
  {
    id: "op-and",
    category: "operators",
    name: "and",
    nameId: "Logika DAN (and)",
    code: "<<key [space v] pressed?> and <(ammo) > (0)>>",
  },
  {
    id: "op-or",
    category: "operators",
    name: "or",
    nameId: "Logika ATAU (or)",
    code: "<<touching [obstacle 1 v]?> or <touching [obstacle 2 v]?>>",
  },
  {
    id: "op-not",
    category: "operators",
    name: "not",
    nameId: "Logika TIDAK (not)",
    code: "<not <touching [edge v]?>>",
  },
  {
    id: "join-text",
    category: "operators",
    name: "join apple banana",
    nameId: "Gabungkan teks",
    code: "(join [Skor: ] (score))",
  },

  // --- VARIABLES ---
  {
    id: "set-variable",
    category: "variables",
    name: "set my variable to 0",
    nameId: "Atur nilai variabel ke 0",
    code: "set [score v] to [0]",
  },
  {
    id: "change-variable",
    category: "variables",
    name: "change my variable by 1",
    nameId: "Ubah variabel sebesar 1",
    code: "change [score v] by (1)",
  },
  {
    id: "show-variable",
    category: "variables",
    name: "show variable",
    nameId: "Tampilkan variabel di layar",
    code: "show variable [score v]",
  },
  {
    id: "hide-variable",
    category: "variables",
    name: "hide variable",
    nameId: "Sembunyikan variabel dari layar",
    code: "hide variable [score v]",
  },

  // --- LISTS ---
  {
    id: "add-to-list",
    category: "lists",
    name: "add thing to list",
    nameId: "Tambahkan item ke daftar (list)",
    code: "add [apple] to [inventory v]",
  },
  {
    id: "delete-of-list",
    category: "lists",
    name: "delete 1 of list",
    nameId: "Hapus item ke-1 dari daftar",
    code: "delete (1) of [inventory v]",
  },
  {
    id: "delete-all-list",
    category: "lists",
    name: "delete all of list",
    nameId: "Hapus semua item dari daftar",
    code: "delete all of [inventory v]",
  },
  {
    id: "item-of-list",
    category: "lists",
    name: "item 1 of list",
    nameId: "Item ke-1 dari daftar",
    code: "(item (1) of [inventory v])",
  },

  // --- PEN EXTENSION ---
  {
    id: "pen-erase-all",
    category: "pen",
    name: "erase all",
    nameId: "Hapus semua goresan pena",
    code: "erase all",
  },
  {
    id: "pen-down",
    category: "pen",
    name: "pen down",
    nameId: "Turunkan pena (mulai menggambar)",
    code: "pen down",
  },
  {
    id: "pen-up",
    category: "pen",
    name: "pen up",
    nameId: "Angkat pena (berhenti menggambar)",
    code: "pen up",
  },
  {
    id: "set-pen-color",
    category: "pen",
    name: "set pen color to color",
    nameId: "Atur warna pena",
    code: "set pen color to [#0066ff]",
  },
  {
    id: "change-pen-size",
    category: "pen",
    name: "change pen size by 1",
    nameId: "Ubah ukuran ketebalan pena",
    code: "change pen size by (1)",
  },

  // --- RECIPES ---
  {
    id: "recipe-movement",
    category: "recipes",
    name: "4-Way Arrow Key Movement",
    nameId: "Template Gerakan Karakter 4 Arah",
    code: `when green flag clicked
forever
  if <key [right arrow v] pressed?> then
    point in direction (90)
    change x by (5)
  end
  if <key [left arrow v] pressed?> then
    point in direction (-90)
    change x by (-5)
  end
  if <key [up arrow v] pressed?> then
    change y by (5)
  end
  if <key [down arrow v] pressed?> then
    change y by (-5)
  end
end`,
    description: "Skrip kontrol gerakan karakter menggunakan tombol panah kanan, kiri, atas, bawah.",
  },
  {
    id: "recipe-jump",
    category: "recipes",
    name: "Jump & Gravity System",
    nameId: "Sistem Lompat & Gravitasi Sederhana",
    code: `when green flag clicked
forever
  change y by (-3)
  if <touching color [#4c97ff]?> then
    set y to (0)
  end
  if <key [space v] pressed?> then
    repeat (10)
      change y by (8)
    end
  end
end`,
    description: "Mekanisme lompat dengan tombol spasi dan efek gravitasi jatuh ke tanah.",
  },
  {
    id: "recipe-walk-animation",
    category: "recipes",
    name: "Walk Animation",
    nameId: "Animasi Jalan Berulang",
    code: `when green flag clicked
forever
  move (5) steps
  next costume
  wait (0.1) seconds
  if on edge, bounce
end`,
    description: "Karakter berjalan mondar-mandir dan berganti kostum setiap langkah.",
  },
  {
    id: "recipe-coin-collect",
    category: "recipes",
    name: "Coin Collect & Score",
    nameId: "Mengambil Koin & Menambah Skor",
    code: `when green flag clicked
show
forever
  if <touching [Player v]?> then
    start sound [pop v]
    change [score v] by (1)
    hide
    wait (3) seconds
    go to [random position v]
    show
  end
end`,
    description: "Koin bertambah saat disentuh pemain, bunyi suara pop, lalu muncul lagi di tempat acak.",
  },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
};

export default function Blocks3LibModal({ isOpen, onClose, onInsert }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "code">("builder");

  // Sequence state (staged block codes)
  const [sequence, setSequence] = useState<string[]>([]);
  const [customCode, setCustomCode] = useState<string>("");

  // Combined sequence code
  const combinedCode = useMemo(() => {
    if (activeTab === "code") return customCode;
    return sequence.join("\n");
  }, [sequence, customCode, activeTab]);

  // Sync customCode when sequence changes in builder tab
  useEffect(() => {
    if (activeTab === "builder") {
      setCustomCode(sequence.join("\n"));
    }
  }, [sequence, activeTab]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredBlocks = useMemo(() => {
    return BLOCKS_DATA.filter((b) => {
      const matchCat = selectedCategory === "all" || b.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.nameId.toLowerCase().includes(q) ||
        b.code.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Add block to sequence stack
  const handleAddToSequence = (code: string) => {
    setSequence((prev) => [...prev, code.trim()]);
  };

  // Remove block from sequence by index
  const handleRemoveFromSequence = (index: number) => {
    setSequence((prev) => prev.filter((_, i) => i !== index));
  };

  // Move block up in sequence
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSequence((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Move block down in sequence
  const handleMoveDown = (index: number) => {
    if (index === sequence.length - 1) return;
    setSequence((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  // Clear sequence
  const handleClearSequence = () => {
    setSequence([]);
    setCustomCode("");
  };

  // Instant insert single block
  const handleInsertSingle = (code: string) => {
    const formatted = `\`\`\`blocks3\n${code.trim()}\n\`\`\``;
    onInsert(formatted);
    onClose();
  };

  // Insert full combined sequence into editor
  const handleInsertSequence = () => {
    const codeToInsert = activeTab === "code" ? customCode : sequence.join("\n");
    if (!codeToInsert.trim()) return;
    const formatted = `\`\`\`blocks3\n${codeToInsert.trim()}\n\`\`\``;
    onInsert(formatted);
    onClose();
  };

  // Insert sequence as a complete task block
  const handleInsertSequenceAsTask = () => {
    const codeToInsert = activeTab === "code" ? customCode : sequence.join("\n");
    if (!codeToInsert.trim()) return;
    const formatted = `--- task ---\n1. **Susun kode blok berikut:**\n\n\`\`\`blocks3\n${codeToInsert.trim()}\n\`\`\`\n\n--- /task ---`;
    onInsert(formatted);
    onClose();
  };

  // Copy sequence code
  const handleCopySequence = () => {
    const codeToCopy = activeTab === "code" ? customCode : sequence.join("\n");
    if (!codeToCopy.trim()) return;
    navigator.clipboard.writeText(`\`\`\`blocks3\n${codeToCopy.trim()}\n\`\`\``);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3.5 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-scratch-blue text-lg text-white shadow-xs">
              🧩
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Pustaka & Penyusun Blok Scratch 3.0
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Sequence Builder
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Klik <strong>+ Tambah</strong> pada blok untuk menyusun urutan skrip, lihat preview langsungnya, lalu tempel ke editor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
            title="Tutup (Esc)"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (3 Columns: Categories | Block Picker | Sequence Builder & Live Preview) */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Column 1: Categories Sidebar */}
          <div className="w-48 shrink-0 border-r border-zinc-200 bg-zinc-50/50 p-2.5 overflow-y-auto dark:border-zinc-800 dark:bg-zinc-900/40 hidden md:block">
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Kategori Blok
            </p>
            <nav className="flex flex-col gap-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition-all ${
                      isActive
                        ? "bg-scratch-blue text-white shadow-xs font-semibold"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="flex-1 truncate">{cat.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Column 2: Block Picker List */}
          <div className="flex flex-1 flex-col border-r border-zinc-200 bg-zinc-100/30 dark:border-zinc-800 dark:bg-zinc-950/20 overflow-hidden min-w-[320px]">
            {/* Search Input */}
            <div className="border-b border-zinc-200 p-3 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari blok (flag, move, say, color, repeat, forever)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 pl-9 pr-4 text-xs text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-scratch-blue focus:bg-white focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:bg-zinc-800"
                />
              </div>
            </div>

            {/* Block Cards Grid */}
            <div className="flex-1 overflow-y-auto p-3.5">
              {filteredBlocks.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <span className="text-2xl mb-1">🔍</span>
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Tidak ada blok yang cocok
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="group flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3 shadow-xs transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    >
                      {/* Name & Badge */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {block.nameId}
                        </span>
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 uppercase tracking-wider">
                          {block.category}
                        </span>
                      </div>

                      {/* Mini Visual Preview */}
                      <div className="my-1 rounded-lg bg-zinc-50/80 p-2 overflow-x-auto dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-start min-h-[44px]">
                        <Blocks3Renderer code={block.code} />
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-2 flex items-center justify-between gap-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => handleInsertSingle(block.code)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
                          title="Langsung tempel 1 blok ini saja ke editor"
                        >
                          ⚡ Tempel 1 Blok
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddToSequence(block.code)}
                          className="flex items-center gap-1 rounded-lg bg-scratch-blue/10 px-2.5 py-1 text-xs font-bold text-scratch-blue hover:bg-scratch-blue hover:text-white transition-all shadow-2xs"
                          title="Tambahkan blok ini ke susunan skrip di sebelah kanan"
                        >
                          <span>➕</span> Tambah ke Susunan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Sequence Builder & Live Preview */}
          <div className="flex w-[420px] shrink-0 flex-col bg-white dark:bg-zinc-900 overflow-hidden">
            {/* Sequence Workspace Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  📦 Susunan Skrip Kamu
                </span>
                <span className="rounded-full bg-scratch-blue px-2 py-0.5 text-[10px] font-bold text-white">
                  {sequence.length} blok
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "builder" ? "code" : "builder")}
                  className="rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                  title="Beralih ke mode edit teks/kode"
                >
                  {activeTab === "builder" ? "📝 Edit Kode" : "👁️ Visual"}
                </button>

                {sequence.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSequence}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Kosongkan susunan"
                  >
                    🗑️ Reset
                  </button>
                )}
              </div>
            </div>

            {/* Sequence Content / Live Preview */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col gap-4">
              {/* LIVE VISUAL PREVIEW OF ASSEMBLED SCRIPT */}
              <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <span>✨</span> Pratinjau Visual Nyata (Live Preview)
                  </span>
                  {combinedCode.trim() && (
                    <button
                      type="button"
                      onClick={handleCopySequence}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                    >
                      {copied ? "✓ Tersalin" : "📋 Salin"}
                    </button>
                  )}
                </div>

                <div className="min-h-[120px] max-h-[260px] overflow-auto rounded-lg bg-zinc-50/80 p-3 dark:bg-zinc-950/80 border border-zinc-100 dark:border-zinc-800/80 flex items-start justify-start">
                  {combinedCode.trim() ? (
                    <Blocks3Renderer code={combinedCode} />
                  ) : (
                    <div className="flex h-24 w-full flex-col items-center justify-center text-center text-zinc-400">
                      <span className="text-2xl mb-1">👈</span>
                      <p className="text-xs">Klik <strong>+ Tambah ke Susunan</strong> pada blok di samping</p>
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: Staged Sequence Items List */}
              {activeTab === "builder" ? (
                <div className="flex-1">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Urutan Blok ({sequence.length})
                  </p>

                  {sequence.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-zinc-400 dark:border-zinc-700">
                      Belum ada blok yang ditambahkan. Pilih blok dari daftar di sebelah kiri untuk mulai merangkai skrip.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {sequence.map((codeItem, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white p-2 text-xs shadow-2xs dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800">
                              {idx + 1}
                            </span>
                            <code className="truncate font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                              {codeItem.split("\n")[0]}
                            </code>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
                              title="Geser ke atas"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === sequence.length - 1}
                              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-30 dark:hover:bg-zinc-800"
                              title="Geser ke bawah"
                            >
                              ▼
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromSequence(idx)}
                              className="rounded p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              title="Hapus blok ini"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* TAB 2: Text / Code Editor */
                <div className="flex flex-1 flex-col">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Editor Kode Blocks3 (Kustomisasi Angka/Teks)
                  </p>
                  <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Tulis kode Scratch di sini..."
                    rows={8}
                    className="w-full flex-1 rounded-xl border border-zinc-200 bg-white p-3 font-mono text-xs text-zinc-900 outline-none focus:border-scratch-blue focus:ring-1 focus:ring-scratch-blue dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            {/* Sequence Footer Action Buttons */}
            <div className="flex flex-col gap-2 border-t border-zinc-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={handleInsertSequence}
                disabled={!combinedCode.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-scratch-blue py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-600 disabled:opacity-40 disabled:hover:bg-scratch-blue transition-all cursor-pointer"
              >
                <span>➕</span> Tempel Susunan ke Editor
              </button>

              <button
                type="button"
                onClick={handleInsertSequenceAsTask}
                disabled={!combinedCode.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-40 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
              >
                <span>📋</span> Tempel sebagai Tugas (Task Card)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
