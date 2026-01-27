import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./Main.css";

type Fruit = {
  value: number;
  name: string;
  className: string;
  color: string;
  softColor: string;
  tooltipTextColor?: string;
  labelColor?: string;
  linkShadow?: string;
  icon?: string;
  label?: string;
};

const numberToWords = (value: number) => {
  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen"
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety"
  ];

  if (value < 20) {
    return ones[value];
  }
  if (value < 100) {
    const tenValue = Math.floor(value / 10);
    const oneValue = value % 10;
    if (oneValue === 0) {
      return tens[tenValue];
    }
    return `${tens[tenValue]}-${ones[oneValue]}`;
  }
  if (value === 100) {
    return "one hundred";
  }
  return String(value);
};

const capitalize = (word: string) =>
  word.length ? `${word[0].toUpperCase()}${word.slice(1)}` : word;

const fruits: Fruit[] = [
  {
    value: 1,
    name: "Watermelon",
    className: "watermelon",
    color: "#4e8c3a",
    softColor: "rgba(78, 140, 58, 0.18)",
    icon: "\uD83C\uDF49"
  },
  {
    value: 2,
    name: "Tomato",
    className: "tomato",
    color: "#ff5e4d",
    softColor: "rgba(255, 94, 77, 0.18)",
    icon: "\uD83C\uDF45"
  },
  {
    value: 3,
    name: "Tangerine",
    className: "tangerine",
    color: "#f2a146",
    softColor: "rgba(242, 161, 70, 0.2)",
    tooltipTextColor: "#2b1b00",
    labelColor: "#1e3a8a",
    icon: "\uD83C\uDF4A"
  },
  {
    value: 4,
    name: "Fig",
    className: "fig",
    color: "#5a2a5e",
    softColor: "rgba(90, 42, 94, 0.18)",
    icon: "\uD83D\uDFE3"
  },
  {
    value: 5,
    name: "Farkleberry",
    className: "farkleberry",
    color: "#2f3b6e",
    softColor: "rgba(47, 59, 110, 0.18)",
    icon: "\uD83C\uDF47"
  },
  {
    value: 6,
    name: "Strawberry",
    className: "strawberry",
    color: "#e93d52",
    softColor: "rgba(233, 61, 82, 0.18)",
    icon: "\uD83C\uDF53"
  },
  {
    value: 7,
    name: "Starfruit",
    className: "starfruit",
    color: "#f2c33c",
    softColor: "rgba(242, 195, 60, 0.2)",
    tooltipTextColor: "#2b1b00",
    labelColor: "#1e3a8a",
    icon: "\u2B50"
  },
  {
    value: 8,
    name: "Elderberry",
    className: "elderberry",
    color: "#2c1c33",
    softColor: "rgba(44, 28, 51, 0.2)",
    icon: "\uD83E\uDED0"
  },
  {
    value: 9,
    name: "Nectarine",
    className: "nectarine",
    color: "#f2ad6a",
    softColor: "rgba(242, 173, 106, 0.22)",
    tooltipTextColor: "#2b1b00",
    labelColor: "#1e3a8a",
    icon: "\uD83C\uDF4F"
  },
  {
    value: 10,
    name: "Tangelo",
    className: "tangelo",
    color: "#f2a347",
    softColor: "rgba(242, 163, 71, 0.22)",
    tooltipTextColor: "#2b1b00",
    labelColor: "#1e3a8a",
    icon: "\uD83D\uDFE0"
  }
];

const makeFruit = (fruit: Fruit, key: number) => (
  <span
    key={key}
    className={`fruit ${fruit.className} ${fruit.label ? "label" : ""}`}
    aria-label={fruit.name}
  >
    {fruit.icon ?? fruit.label}
  </span>
);

export function MainPage() {
  const [activeTable, setActiveTable] = useState<number | null>(null);
  const [currentRow, setCurrentRow] = useState(1);
  const [mode, setMode] = useState<"study" | "practice">("study");
  const [answerInput, setAnswerInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "error";
    message: string;
  } | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [kudosByRow, setKudosByRow] = useState<Record<number, string>>({});
  const [revealedByTable, setRevealedByTable] = useState<
    Record<number, Record<number, boolean>>
  >({});
  const [productRowByTable, setProductRowByTable] = useState<
    Record<number, number>
  >({});
  const [tooltipRowByTable, setTooltipRowByTable] = useState<
    Record<number, number>
  >({});
  const [equalsTooltipRowByTable, setEqualsTooltipRowByTable] = useState<
    Record<number, number>
  >({});
  const [shuffledOptions, setShuffledOptions] = useState<number[]>([]);
  const [optionsKey, setOptionsKey] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [externalMenuActive, setExternalMenuActive] = useState(false);
  const [externalOptions, setExternalOptions] = useState<number[]>([]);
  const [swapOrder, setSwapOrder] = useState(false);
  const [closeFlash, setCloseFlash] = useState(false);
  const [fruitySpeech, setFruitySpeech] = useState("");
  const [fruitySpeaking, setFruitySpeaking] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fruityEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allowEqualsByTable, setAllowEqualsByTable] = useState<
    Record<number, number>
  >({});
  const [lastSpokenRowByTable, setLastSpokenRowByTable] = useState<
    Record<number, number>
  >({});
  const [equalsSpokenByTable, setEqualsSpokenByTable] = useState<
    Record<number, number>
  >({});
  const [optionsMenuStyle, setOptionsMenuStyle] = useState<
    React.CSSProperties | undefined
  >(undefined);
  const [externalMenuStyle, setExternalMenuStyle] = useState<
    React.CSSProperties | undefined
  >(undefined);
  const lastSpokenRef = useRef<string | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fruityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const answerEntryRef = useRef<HTMLDivElement | null>(null);
  const optionsMenuRef = useRef<HTMLDivElement | null>(null);
  const singleRowMenuActiveRef = useRef(false);
  const activeTableRef = useRef<number | null>(null);
  const currentRowRef = useRef(1);
  const lastOptionsOpenRef = useRef(0);
  const externalMenuActiveRef = useRef(false);
  const showOptionsRef = useRef(false);

  const activeFruit = fruits.find((fruit) => fruit.value === activeTable) ?? null;
  const activeFruitIndex =
    activeTable === null ? -1 : fruits.findIndex((fruit) => fruit.value === activeTable);
  const previousFruitValue =
    activeFruitIndex === -1
      ? null
      : fruits[(activeFruitIndex - 1 + fruits.length) % fruits.length].value;
  const nextFruitValue =
    activeFruitIndex === -1 ? null : fruits[(activeFruitIndex + 1) % fruits.length].value;
  const isComplete = currentRow > 10;
  const singleRowMenuActive =
    showOptions && activeTable !== null && activeTable >= 4 && currentRow >= 9;
  const shouldShowExternalMenu =
    mode === "practice" &&
    showOptions &&
    activeFruit !== null &&
    activeFruit.value >= 4 &&
    currentRow >= 9;
  const externalOptionsForActiveRow =
    shouldShowExternalMenu && activeFruit
      ? shuffledOptions.length
        ? shuffledOptions
        : Array.from(
            { length: activeFruit.value + 1 },
            (_, optionIndex) => (currentRow - 1) * activeFruit.value + optionIndex
          )
      : [];
  const externalMenuPortal =
    shouldShowExternalMenu &&
    externalOptionsForActiveRow.length &&
    typeof document !== "undefined"
      ? createPortal(
          <div
            className="options-menu options-menu--single-row options-menu--external"
            style={externalMenuStyle}
            onClick={(event) => event.stopPropagation()}
          >
            {externalOptionsForActiveRow.map((option) => (
              <button
                key={`${option}-${optionsKey}-external`}
                type="button"
                className="options-item"
                onClick={() => {
                  applyAnswerInput(String(option), currentRow, activeFruit.value);
                  setShowOptions(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>,
          document.body
        )
      : null;
  const positiveMessages = [
    "Correct!",
    "Right!",
    "Way to go!",
    "Good job!"
  ];

  useEffect(() => {
    singleRowMenuActiveRef.current = singleRowMenuActive;
  }, [singleRowMenuActive]);

  useEffect(() => {
    externalMenuActiveRef.current = externalMenuActive;
  }, [externalMenuActive]);

  useEffect(() => {
    activeTableRef.current = activeTable;
  }, [activeTable]);

  useEffect(() => {
    currentRowRef.current = currentRow;
  }, [currentRow]);

  useEffect(() => {
    showOptionsRef.current = showOptions;
  }, [showOptions]);

  useEffect(() => {
    if (activeTable !== null) {
      inputRef.current?.focus();
    }
  }, [activeTable, currentRow]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleViewportChange = () => {
      window.requestAnimationFrame(() => {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
          viewportMeta.setAttribute(
            "content",
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"
          );
        }
        // Force a tiny reflow to help Safari settle after orientation changes.
        document.body.getBoundingClientRect();
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    };
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    if (activeFruit) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeFruit]);

  useEffect(() => {
    setShowOptions(false);
    setExternalMenuActive(false);
    setExternalOptions([]);
  }, [activeTable, currentRow, mode]);

  useEffect(() => {
    if (!showOptions || typeof window === "undefined") {
      return;
    }

    const margin = 12;
    const menuOffset = 8;

    const updateMaxWidth = () => {
      const entryRect = answerEntryRef.current?.getBoundingClientRect();
      if (!entryRect) {
        setOptionsMenuStyle(undefined);
        setExternalMenuStyle(undefined);
        return;
      }
      if (singleRowMenuActive) {
        const availableWidth = Math.floor(window.innerWidth - margin * 2);
        const estimatedHeight = optionsMenuRef.current?.offsetHeight ?? 64;
        const desiredTop = entryRect.bottom + menuOffset;
        const maxTop = window.innerHeight - estimatedHeight - margin;
        const clampedTop = Math.max(margin, Math.min(desiredTop, maxTop));
        const top = Math.floor(clampedTop);
        const left = Math.floor(window.innerWidth / 2);
        setOptionsMenuStyle(
          availableWidth > 0
            ? {
                position: "fixed",
                top: `${top}px`,
                left: `${left}px`,
                transform: "translateX(-50%)",
                maxWidth: `${availableWidth}px`
              }
            : undefined
        );
        if (shouldShowExternalMenu) {
          setExternalMenuStyle(
            availableWidth > 0
              ? {
                  position: "fixed",
                  left: `${left}px`,
                  transform: "translateX(-50%)",
                  maxWidth: `${availableWidth}px`,
                  top: `${top}px`,
                  bottom: "auto"
                }
              : undefined
          );
        } else {
          setExternalMenuStyle(undefined);
        }
        return;
      }
      const availableWidth = Math.floor(window.innerWidth - entryRect.left - margin);
      setOptionsMenuStyle(
        availableWidth > 0 ? { maxWidth: `${availableWidth}px` } : undefined
      );
      setExternalMenuStyle(undefined);
    };

    const rafId = window.requestAnimationFrame(updateMaxWidth);
    window.addEventListener("resize", updateMaxWidth);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, [showOptions, optionsKey, singleRowMenuActive, shouldShowExternalMenu]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent | TouchEvent) => {
      // Disable outside-close while the menu is open to avoid race conditions.
      if (showOptionsRef.current) {
        return;
      }
      // Ignore the click/tap that just opened the menu.
      if (Date.now() - lastOptionsOpenRef.current < 250) {
        return;
      }
      const isRowTenSingleRowMenu =
        activeTableRef.current !== null &&
        activeTableRef.current >= 4 &&
        currentRowRef.current >= 9;
      // For 9 x n and 10 x n, never auto-close on outside clicks.
      if (
        isRowTenSingleRowMenu ||
        singleRowMenuActiveRef.current ||
        externalMenuActiveRef.current
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const clickedInsideEntry = answerEntryRef.current?.contains(target);
      const clickedInsideMenu = optionsMenuRef.current?.contains(target);
      if (!clickedInsideEntry && !clickedInsideMenu) {
        setShowOptions(false);
      }
    };
    document.addEventListener("click", handleOutside);
    document.addEventListener("touchend", handleOutside);
    return () => {
      document.removeEventListener("click", handleOutside);
      document.removeEventListener("touchend", handleOutside);
    };
  }, []);


  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const handleOpenTable = (value: number) => {
    setActiveTable(value);
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    setSwapOrder(false);
    setMode("study");
  };

  const handleCloseTable = () => {
    setActiveTable(null);
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    setSwapOrder(false);
    setMode("study");
  };

  const handleStartOver = () => {
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    clearRevealed();
  };

  const handleNextTable = (nextMode?: "study" | "practice") => {
    if (activeTable === null) {
      return;
    }
    const currentIndex = fruits.findIndex((fruit) => fruit.value === activeTable);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % fruits.length;
    const nextValue = fruits[nextIndex].value;
    setActiveTable(nextValue);
    setMode(nextMode ?? mode);
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    clearRevealed();
  };

  const handlePreviousTable = (nextMode?: "study" | "practice") => {
    if (activeTable === null) {
      return;
    }
    const currentIndex = fruits.findIndex((fruit) => fruit.value === activeTable);
    const nextIndex =
      currentIndex === -1
        ? 0
        : (currentIndex - 1 + fruits.length) % fruits.length;
    const nextValue = fruits[nextIndex].value;
    setActiveTable(nextValue);
    setMode(nextMode ?? mode);
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    clearRevealed();
  };

  const handleStartPractice = () => {
    setMode("practice");
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
  };

  const clearInput = () => {
    if (answerInput) {
      setAnswerInput("");
    }
    if (feedback) {
      setFeedback(null);
    }
  };

  const shuffleOptions = (options: number[]) => {
    const next = [...options];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    return next;
  };

  const reshuffleActiveOptions = (rangeStart: number, rangeEnd: number) => {
    const options = Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, optionIndex) => rangeStart + optionIndex
    );
    const shuffled = shuffleOptions(options);
    setShuffledOptions(shuffled);
    setOptionsKey((prev) => prev + 1);
    return shuffled;
  };

  const openOptionsMenu = (rangeStart: number, rangeEnd: number) => {
    const shuffled = reshuffleActiveOptions(rangeStart, rangeEnd);
    // Update refs synchronously so outside-click logic sees the latest row/table.
    activeTableRef.current = activeTable;
    currentRowRef.current = currentRow;
    singleRowMenuActiveRef.current =
      activeTable !== null && activeTable >= 4 && currentRow >= 9;
    const shouldUseExternalMenu =
      activeTable !== null && activeTable >= 4 && currentRow >= 9;
    externalMenuActiveRef.current = shouldUseExternalMenu;
    setExternalMenuActive(shouldUseExternalMenu);
    setExternalOptions(shouldUseExternalMenu ? shuffled : []);
    lastOptionsOpenRef.current = Date.now();
    showOptionsRef.current = true;
    setShowOptions(true);
  };

  const handleMeetFruity = () => {
    lastSpokenRef.current = null;
    const message =
      "Hi Ellie, my name is Trudy Fruity! Math is fun! Let me help you with your times tables. Click any one of the fruits you see next to me or at the top of the page to get started.";
    if (fruityTimerRef.current) {
      clearInterval(fruityTimerRef.current);
      fruityTimerRef.current = null;
    }
    if (fruityEndTimerRef.current) {
      clearTimeout(fruityEndTimerRef.current);
      fruityEndTimerRef.current = null;
    }
    setFruitySpeech("");
    setFruitySpeaking(true);

    const finishFruitySpeech = () => {
      setFruitySpeech(message);
      if (fruityEndTimerRef.current) {
        clearTimeout(fruityEndTimerRef.current);
      }
      fruityEndTimerRef.current = setTimeout(() => {
        setFruitySpeaking(false);
      }, 2000);
    };

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      const words = message.split(" ");
      let index = 0;
      fruityTimerRef.current = setInterval(() => {
        setFruitySpeech(words.slice(0, index + 1).join(" "));
        index += 1;
        if (index >= words.length) {
          if (fruityTimerRef.current) {
            clearInterval(fruityTimerRef.current);
            fruityTimerRef.current = null;
          }
          finishFruitySpeech();
        }
      }, 120);
      return;
    }

    const isIOS =
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/i.test(navigator.userAgent);

    const words = message.split(" ");
    window.speechSynthesis.cancel();
    const voice = pickYoungFemaleVoice();

    if (isIOS) {
      const chunkSize = 4;
      let wordIndex = 0;
      const speakChunk = () => {
        if (wordIndex >= words.length) {
          finishFruitySpeech();
          return;
        }
        const chunkWords = words.slice(wordIndex, wordIndex + chunkSize);
        const chunkText = chunkWords.join(" ");
        const utterance = new SpeechSynthesisUtterance(chunkText);
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = 0.95;
        utterance.pitch = 1.25;
        utterance.onstart = () => {
          if (fruityTimerRef.current) {
            clearInterval(fruityTimerRef.current);
          }
          let localIndex = 0;
          const baseInterval = Math.round(230 / utterance.rate);
          fruityTimerRef.current = setInterval(() => {
            const nextCount = Math.min(wordIndex + localIndex + 1, words.length);
            setFruitySpeech(words.slice(0, nextCount).join(" "));
            localIndex += 1;
            if (localIndex >= chunkWords.length) {
              if (fruityTimerRef.current) {
                clearInterval(fruityTimerRef.current);
                fruityTimerRef.current = null;
              }
            }
          }, baseInterval);
        };
        utterance.onend = () => {
          if (fruityTimerRef.current) {
            clearInterval(fruityTimerRef.current);
            fruityTimerRef.current = null;
          }
          wordIndex += chunkWords.length;
          setFruitySpeech(words.slice(0, wordIndex).join(" "));
          speakChunk();
        };
        window.speechSynthesis.speak(utterance);
      };
      speakChunk();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.25;
    let hasBoundary = false;
    utterance.onstart = () => {
      setFruitySpeech(words[0] ?? "");
      let index = 1;
      const baseInterval = Math.round(240 / utterance.rate);
      fruityTimerRef.current = setInterval(() => {
        if (hasBoundary) {
          if (fruityTimerRef.current) {
            clearInterval(fruityTimerRef.current);
            fruityTimerRef.current = null;
          }
          return;
        }
        setFruitySpeech(words.slice(0, index + 1).join(" "));
        index += 1;
        if (index >= words.length) {
          if (fruityTimerRef.current) {
            clearInterval(fruityTimerRef.current);
            fruityTimerRef.current = null;
          }
        }
      }, baseInterval);
    };
    utterance.onboundary = (event) => {
      if (event.name !== "word") {
        return;
      }
      hasBoundary = true;
      const nextSpace = message.indexOf(" ", event.charIndex);
      const endIndex = nextSpace === -1 ? message.length : nextSpace;
      setFruitySpeech(message.slice(0, endIndex));
    };
    utterance.onend = () => {
      finishFruitySpeech();
      if (fruityTimerRef.current) {
        clearInterval(fruityTimerRef.current);
        fruityTimerRef.current = null;
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const clearRevealed = () => {
    setRevealedByTable({});
    setAllowEqualsByTable({});
    setLastSpokenRowByTable({});
    setEqualsSpokenByTable({});
    setProductRowByTable({});
    setTooltipRowByTable({});
    setEqualsTooltipRowByTable({});
    lastSpokenRef.current = null;
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
    if (fruityTimerRef.current) {
      clearInterval(fruityTimerRef.current);
      fruityTimerRef.current = null;
    }
    if (fruityEndTimerRef.current) {
      clearTimeout(fruityEndTimerRef.current);
      fruityEndTimerRef.current = null;
    }
    setFruitySpeech("");
    setFruitySpeaking(false);
  };

  const flashCloseButton = () => {
    setCloseFlash(true);
    setTimeout(() => setCloseFlash(false), 1200);
  };

  const revealUpToRow = (tableValue: number, upToRow: number) => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
    }
    setRevealedByTable((prev) => ({
      ...prev,
      [tableValue]: {}
    }));
    setAllowEqualsByTable((prev) => ({
      ...prev,
      [tableValue]: 0
    }));
    setProductRowByTable((prev) => ({
      ...prev,
      [tableValue]: 0
    }));
    setTooltipRowByTable((prev) => ({
      ...prev,
      [tableValue]: 0
    }));

    const revealStep = (step: number) => {
      setRevealedByTable((prev) => {
        const next = { ...(prev[tableValue] ?? {}) };
        for (let rowIndex = 0; rowIndex < upToRow; rowIndex += 1) {
          const value = rowIndex * tableValue + 1 + step;
          if (value <= (rowIndex + 1) * tableValue) {
            next[value] = true;
          }
        }
        return {
          ...prev,
          [tableValue]: next
        };
      });
    };

    let step = 1;
    revealStep(0);

    revealTimerRef.current = setInterval(() => {
      revealStep(step);
      step += 1;
      if (step >= tableValue) {
        if (revealTimerRef.current) {
          clearInterval(revealTimerRef.current);
          revealTimerRef.current = null;
        }
        setAllowEqualsByTable((prev) => ({
          ...prev,
          [tableValue]: upToRow
        }));
        setTooltipRowByTable((prev) => ({
          ...prev,
          [tableValue]: upToRow
        }));
      }
    }, 20);
  };

  const pickYoungFemaleVoice = () => {
    const voices = voicesRef.current;
    if (!voices.length) {
      return null;
    }
    const preferred = voices.find((voice) =>
      /female|woman|girl|samantha|victoria|karen|moira|tessa|serena|jenny|emma/i.test(
        voice.name
      )
    );
    return preferred ?? voices[0];
  };

  const speakPhrase = (
    phrase: string,
    onStart?: () => void,
    onEnd?: () => void
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onStart) {
        onStart();
      }
      return;
    }
    if (lastSpokenRef.current === phrase) {
      return;
    }
    lastSpokenRef.current = phrase;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    const voice = pickYoungFemaleVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.25;
    if (onStart) {
      utterance.onstart = onStart;
    }
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  };

  const speakEquationWithProduct = (
    equationPhrase: string,
    equalsPhrase: string,
    onStart?: () => void,
    onEqualsStart?: () => void,
    onEnd?: () => void
  ) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onStart) {
        onStart();
      }
      if (onEqualsStart) {
        onEqualsStart();
      }
      return;
    }
    window.speechSynthesis.cancel();
    const voice = pickYoungFemaleVoice();
    const first = new SpeechSynthesisUtterance(equationPhrase);
    const second = new SpeechSynthesisUtterance(equalsPhrase);
    if (voice) {
      first.voice = voice;
      second.voice = voice;
    }
    first.rate = 0.95;
    second.rate = 0.95;
    first.pitch = 1.25;
    second.pitch = 1.25;
    if (onStart) {
      first.onstart = onStart;
    }
    second.onstart = onEqualsStart ?? null;
    if (onEnd) {
      second.onend = onEnd;
    }
    first.onend = () => {
      window.speechSynthesis.speak(second);
    };
    window.speechSynthesis.speak(first);
  };

  const handleCorrectAnswer = () => {
    const message =
      positiveMessages[Math.floor(Math.random() * positiveMessages.length)];
    const finalMessage = "You did it!";
    setKudosByRow((prev) => ({
      ...prev,
      [currentRow]: currentRow >= 10 ? finalMessage : message
    }));
    if (currentRow >= 10) {
      setCurrentRow(11);
      setCompletionMessage(null);
    } else {
      setCurrentRow((prev) => prev + 1);
    }
    setAnswerInput("");
    setFeedback(null);
  };

  const isAnswerCorrect = (value: string) => {
    if (activeTable === null || isComplete) {
      return false;
    }
    const expected = activeTable * currentRow;
    const guess = Number(value.trim());
    return Number.isFinite(guess) && guess === expected;
  };

  const applyAnswerInput = (
    value: string,
    multiplicand: number,
    fruitValue: number
  ) => {
    const nextValue = value.replace(/[^0-9]/g, "");
    setAnswerInput(nextValue);
    const expectedValue = multiplicand * fruitValue;
    const expectedText = String(expectedValue);
    const isCorrect = nextValue === expectedText;
    const isPrefixOfExpected =
      nextValue.length > 0 &&
      nextValue.length < expectedText.length &&
      expectedText.startsWith(nextValue);

    if (isCorrect || isAnswerCorrect(nextValue)) {
      handleCorrectAnswer();
      return;
    }
    // Suppress errors while the learner is still typing a valid prefix
    // of the correct answer (e.g., "1" on the way to "10" or "100").
    if (isPrefixOfExpected) {
      setFeedback(null);
      return;
    }
    if (nextValue.trim()) {
      setFeedback({
        type: "error",
        message: `${multiplicand} x ${fruitValue} = ${nextValue} is incorrect. Please try again.`
      });
    } else {
      setFeedback(null);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (activeTable === null || isComplete) {
      return;
    }
    if (isAnswerCorrect(answerInput)) {
      handleCorrectAnswer();
      return;
    }
    setFeedback({
      type: "error",
      message: `${currentRow} x ${activeTable} = ${answerInput} is incorrect. Please try again.`
    });
  };

  const renderQuizRows = (fruit: Fruit) =>
    Array.from({ length: 10 }, (_, index) => {
      const multiplicand = index + 1;
      const answer = multiplicand * fruit.value;
      const leftValue = swapOrder ? fruit.value : multiplicand;
      const rightValue = swapOrder ? multiplicand : fruit.value;
      const isRowVisible = multiplicand <= Math.min(currentRow, 10);
      const isActiveRow = multiplicand === currentRow && !isComplete;
      const isCompleteRow = multiplicand < currentRow || isComplete;
      const rowKudos = kudosByRow[multiplicand];
      const showFinalKudos = rowKudos === "You did it!";
      const showFinalBalloons = true;
      const rangeStart = (multiplicand - 1) * fruit.value;
      const rangeEnd = multiplicand * fruit.value;
      const useSingleRowMenu = fruit.value >= 4 && multiplicand >= 9;
      const useExternalMenuForRow = fruit.value >= 4 && multiplicand >= 9;
      const options =
        isActiveRow && shuffledOptions.length
          ? shuffledOptions
          : Array.from(
              { length: rangeEnd - rangeStart + 1 },
              (_, optionIndex) => rangeStart + optionIndex
            );
      if (!isRowVisible) {
        return null;
      }

      return (
        <div className="row" key={multiplicand}>
          <div className="equation">
            {leftValue} x {rightValue}
          </div>
          <div className="fruit-line">
            {Array.from({ length: fruit.value }, (_, count) => (
              <span
                key={count}
                className={`fruit ${fruit.className} ${
                  fruit.label ? "label" : ""
                }`}
                style={
                  fruit.labelColor
                    ? ({ "--label-color": fruit.labelColor } as React.CSSProperties)
                    : undefined
                }
                aria-label={fruit.name}
              >
                <span className="fruit-icon">{fruit.icon ?? fruit.label}</span>
              </span>
            ))}
          </div>
          <div className={`answer ${isActiveRow ? "answer-input" : ""}`}>
            {isActiveRow ? (
              <>
                <div className="answer-entry" ref={answerEntryRef}>
                  <span className="answer-equals">=</span>
                  <input
                    ref={inputRef}
                    className="answer-field"
                    type="text"
                    inputMode="numeric"
                    value={answerInput}
                    onFocus={clearInput}
                    onMouseDown={clearInput}
                    onClick={() => openOptionsMenu(rangeStart, rangeEnd)}
                    onChange={(event) => {
                      applyAnswerInput(event.target.value, multiplicand, fruit.value);
                    }}
                    aria-label={`Answer for ${multiplicand} x ${fruit.value}`}
                  />
                  <button
                    className="dropdown-hint"
                    type="button"
                    onClick={() => {
                      inputRef.current?.focus();
                      openOptionsMenu(rangeStart, rangeEnd);
                    }}
                    aria-label="Show answer choices"
                  >
                    v
                  </button>
                  {showOptions && isActiveRow && !useExternalMenuForRow ? (
                    <div
                      className={`options-menu ${
                        useSingleRowMenu ? "options-menu--single-row" : ""
                      }`}
                      style={optionsMenuStyle}
                      ref={optionsMenuRef}
                      key={optionsKey}
                    >
                      {options.map((option) => (
                        <button
                          key={`${option}-${optionsKey}`}
                          type="button"
                          className="options-item"
                          onClick={() => {
                            applyAnswerInput(String(option), multiplicand, fruit.value);
                            setShowOptions(false);
                            setExternalMenuActive(false);
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                = <span className="answer-pad">0</span>
                <span className="answer-inline">
                  {answer}
                  {isCompleteRow ? (
                    <span className="status-icon success" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </span>
                {isCompleteRow && rowKudos ? (
                  <span
                    className={`kudos-text ${showFinalKudos ? "kudos-text-final" : ""}`}
                  >
                    {rowKudos}
                    {showFinalKudos && showFinalBalloons ? (
                      <span className="kudos-balloons" aria-hidden="true">
                        <span className="balloon balloon-1" />
                        <span className="balloon balloon-2" />
                        <span className="balloon balloon-3" />
                        <span className="balloon balloon-4" />
                        <span className="balloon balloon-5" />
                        <span className="balloon balloon-6" />
                        <span className="balloon balloon-7" />
                        <span className="balloon balloon-8" />
                        <span className="balloon balloon-9" />
                        <span className="balloon balloon-10" />
                        <span className="balloon balloon-11" />
                        <span className="balloon balloon-12" />
                        <span className="balloon balloon-13" />
                        <span className="balloon balloon-14" />
                        <span className="balloon balloon-15" />
                        <span className="balloon balloon-16" />
                        <span className="balloon balloon-17" />
                        <span className="balloon balloon-18" />
                        <span className="balloon balloon-19" />
                        <span className="balloon balloon-20" />
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </>
            )}
          </div>
          {isActiveRow && feedback ? (
            <div className="row-feedback">
              <p className={`quiz-feedback inline ${feedback.type}`}>
                {feedback.message}
              </p>
            </div>
          ) : null}
        </div>
      );
    });

  const renderStaticRows = (fruit: Fruit) =>
    Array.from({ length: 10 }, (_, index) => {
      const multiplicand = index + 1;
      const answer = multiplicand * fruit.value;
      const leftValue = swapOrder ? fruit.value : multiplicand;
      const rightValue = swapOrder ? multiplicand : fruit.value;
      const totalOffset = (multiplicand - 1) * fruit.value;
      const revealedForTable = revealedByTable[fruit.value] ?? {};
      const leftWord = capitalize(numberToWords(leftValue));
      const rightWord = numberToWords(rightValue);
      const answerWord = numberToWords(answer);
      const answerText = String(answer);
      const rowPhrase = `${numberToWords(leftValue)} times ${numberToWords(
        rightValue
      )}`;
      const equalsPhrase = `equals ${answerText}`;
      const isEqualsAllowed =
        (allowEqualsByTable[fruit.value] ?? 0) >= multiplicand &&
        (lastSpokenRowByTable[fruit.value] ?? 0) === multiplicand;
      const isProductVisible =
        (productRowByTable[fruit.value] ?? 0) === multiplicand;
      const isLastRowComplete =
        (productRowByTable[fruit.value] ?? 0) >= 10;
      const showTooltips =
        (tooltipRowByTable[fruit.value] ?? 0) === multiplicand;
      const showEqualsTooltip =
        isProductVisible &&
        (equalsTooltipRowByTable[fruit.value] ?? 0) === multiplicand;
      return (
        <div
          className="row row-speak"
          key={multiplicand}
          data-phrase={rowPhrase}
        >
          <div
            className={`equation ${showTooltips ? "show-tooltip" : ""}`}
            data-phrase={rowPhrase}
            onClick={() =>
              speakEquationWithProduct(
                rowPhrase,
                equalsPhrase,
                () => {
                  setLastSpokenRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: multiplicand
                  }));
                  setRevealedByTable((prev) => ({
                    ...prev,
                    [fruit.value]: {}
                  }));
                  setTooltipRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: multiplicand
                  }));
                  setEqualsTooltipRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: 0
                  }));
                  if (tooltipTimerRef.current) {
                  clearTimeout(tooltipTimerRef.current);
                  }
                  setTimeout(() => {
                    revealUpToRow(fruit.value, multiplicand);
                  }, 150);
                },
                () => {
                  setProductRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: multiplicand
                  }));
                  setEqualsTooltipRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: multiplicand
                  }));
                  setEqualsSpokenByTable((prev) => ({
                    ...prev,
                    [fruit.value]: multiplicand
                  }));
                  tooltipTimerRef.current = setTimeout(() => {
                    setTooltipRowByTable((prev) => ({
                      ...prev,
                      [fruit.value]: 0
                    }));
                    setEqualsTooltipRowByTable((prev) => ({
                      ...prev,
                      [fruit.value]: 0
                    }));
                    tooltipTimerRef.current = null;
                  }, 1800);
                },
                undefined
              )
            }
          >
            <span className="hover-word" data-word={leftWord}>
              {leftValue}
            </span>
            <span className="hover-word" data-word="times">
              x
            </span>
            <span className="hover-word" data-word={rightWord}>
              {rightValue}
            </span>
          </div>
          <div className="fruit-line">
            {Array.from({ length: fruit.value }, (_, count) => {
              const displayNumber = totalOffset + count + 1;
              const isRevealed = revealedForTable[displayNumber];
              return (
                <span
                  key={count}
                  className={`fruit ${fruit.className} ${
                    fruit.label ? "label" : ""
                  } ${isRevealed ? "revealed" : ""}`}
                  style={
                    fruit.labelColor
                      ? ({ "--label-color": fruit.labelColor } as React.CSSProperties)
                      : undefined
                  }
                  aria-label={`${fruit.name} ${displayNumber}`}
                >
                  <span className="fruit-icon">
                    {fruit.icon ?? fruit.label}
                  </span>
                  <span className="fruit-number">{displayNumber}</span>
                </span>
              );
            })}
          </div>
          <div className="answer">
            <span
              className={`equals-tooltip ${
                isEqualsAllowed ? "equals-allowed" : ""
              }`}
              data-word={`equals ${answerText}`}
              onMouseLeave={() => {
                const spokenRow = equalsSpokenByTable[fruit.value] ?? 0;
                if (spokenRow === multiplicand) {
                  setRevealedByTable((prev) => ({
                    ...prev,
                    [fruit.value]: {}
                  }));
                  setAllowEqualsByTable((prev) => ({
                    ...prev,
                    [fruit.value]: 0
                  }));
                  setLastSpokenRowByTable((prev) => ({
                    ...prev,
                    [fruit.value]: 0
                  }));
                  setEqualsSpokenByTable((prev) => ({
                    ...prev,
                    [fruit.value]: 0
                  }));
                }
              }}
            >
              =
              <span className="answer-pad">0</span>
              <span
                className={`answer-product ${
                  showEqualsTooltip ? "show-tooltip" : ""
                }`}
                data-word={`equals ${answerText}`}
                data-visible={isProductVisible}
              >
                {isProductVisible ? answer : ""}
              </span>
            </span>
          </div>
        </div>
      );
    });

  const leftFruits = fruits.filter((fruit) => fruit.value <= 5);
  const rightFruits = fruits.filter((fruit) => fruit.value >= 6);

  const handleSwapToggle = () => {
    setSwapOrder((prev) => !prev);
    setCurrentRow(1);
    setAnswerInput("");
    setFeedback(null);
    setCompletionMessage(null);
    setKudosByRow({});
    setShowOptions(false);
    setExternalMenuActive(false);
    setExternalOptions([]);
    showOptionsRef.current = false;
    clearRevealed();
  };

  return (
    <main className={`page ${activeTable ? "is-practicing" : ""}`}>
      <nav className="legend-links" aria-label="Fruit table links">
        {fruits.map((fruit) => (
          <button
            className={`legend-link ${
              activeTable === fruit.value ? "active" : ""
            }`}
            key={fruit.value}
            type="button"
            onClick={() => handleOpenTable(fruit.value)}
            style={
              {
                "--active-fruit": fruit.color,
                "--active-fruit-soft": fruit.softColor,
                "--tooltip-text": fruit.tooltipTextColor ?? "#fff7e8",
                "--link-text": fruit.labelColor ?? "#1e4fa3",
                "--link-shadow": fruit.linkShadow ?? "none"
              } as React.CSSProperties
            }
          >
              <span
                className={`fruit ${fruit.className} ${
                  fruit.label ? "label" : ""
                }`}
                style={
                  fruit.labelColor
                    ? ({ "--label-color": fruit.labelColor } as React.CSSProperties)
                    : undefined
                }
                aria-hidden="true"
              >
                {fruit.icon ?? fruit.label}
              </span>
            <span>
              {fruit.name} {fruit.value} times table
            </span>
          </button>
        ))}
      </nav>

      <section className="hero">
        <div>
          <h1 className="title">
            {[
              "F",
              "R",
              "U",
              "I",
              "T",
              "I",
              "P",
              "L",
              "I",
              "C",
              "A",
              "T",
              "I",
              "O",
              "N"
            ].map((letter, index) => (
              <span className={`title-letter letter-${index}`} key={index}>
                {letter}
              </span>
            ))}
          </h1>
        </div>
      </section>

      <section className="fruity-stage">
        <div className="fruity-column">
          {leftFruits.map((fruit) => (
            <button
              key={fruit.value}
              className="fruit-choice"
              type="button"
              style={
                {
                  "--active-fruit": fruit.color,
                  "--active-fruit-soft": fruit.softColor,
                  "--link-text": fruit.labelColor ?? "#1e4fa3",
                  "--link-shadow": fruit.linkShadow ?? "none"
                } as React.CSSProperties
              }
              onClick={() => handleOpenTable(fruit.value)}
            >
              <span
                className={`fruit ${fruit.className} ${
                  fruit.label ? "label" : ""
                }`}
                style={
                  fruit.labelColor
                    ? ({ "--label-color": fruit.labelColor } as React.CSSProperties)
                    : undefined
                }
                aria-hidden="true"
              >
                <span className="fruit-icon">{fruit.icon ?? fruit.label}</span>
              </span>
              <span className="fruit-choice-label">
                {fruit.name} {fruit.value} times table
              </span>
            </button>
          ))}
        </div>

        <div className="fruity-center">
          <button className="meet-button" type="button" onClick={handleMeetFruity}>
            Meet Trudy Fruity
          </button>
          <div className="fruity-avatar" aria-hidden="true">
            <div className="fruity-head">
              <span className="fruity-bow" />
              <span className="fruity-hair" />
              <span className="fruity-eye left" />
              <span className="fruity-eye right" />
              <span className="fruity-smile" />
            </div>
            <div className="fruity-body">
              <span className="fruity-arm left" />
              <span className="fruity-arm right" />
              <span className="fruity-dress" />
              <span className="fruity-leg left" />
              <span className="fruity-leg right" />
              <span className="fruity-hand left" />
              <span className="fruity-hand right" />
              <span className="fruity-foot left" />
              <span className="fruity-foot right" />
            </div>
          </div>
          {fruitySpeech ? (
            <div className={`fruity-bubble ${fruitySpeaking ? "active" : ""}`}>
              {fruitySpeech}
            </div>
          ) : null}
        </div>

        <div className="fruity-column">
          {rightFruits.map((fruit) => (
            <button
              key={fruit.value}
              className="fruit-choice"
              type="button"
              style={
                {
                  "--active-fruit": fruit.color,
                  "--active-fruit-soft": fruit.softColor,
                  "--link-text": fruit.labelColor ?? "#1e4fa3",
                  "--link-shadow": fruit.linkShadow ?? "none"
                } as React.CSSProperties
              }
              onClick={() => handleOpenTable(fruit.value)}
            >
              <span
                className={`fruit ${fruit.className} ${
                  fruit.label ? "label" : ""
                }`}
                aria-hidden="true"
              >
                <span className="fruit-icon">{fruit.icon ?? fruit.label}</span>
              </span>
              <span className="fruit-choice-label">
                {fruit.name} {fruit.value} times table
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeFruit ? (
        <div
          className="table-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Times table for ${activeFruit.value}`}
          onClick={flashCloseButton}
        >
            <div
              className="overlay-card"
              style={
                {
                  "--active-fruit": activeFruit.color,
                  "--active-fruit-soft": activeFruit.softColor,
                  "--tooltip-text": activeFruit.tooltipTextColor ?? "#fff7e8",
                  "--button-text": activeFruit.labelColor ?? activeFruit.color
                } as React.CSSProperties
              }
              onClick={(event) => event.stopPropagation()}
            >
            <div className="overlay-header">
              <h2
                className={`overlay-title ${
                  mode === "practice" ? "overlay-title-quiz" : ""
                } ${activeFruit.name.length > 9 ? "overlay-title-long" : ""}`}
              >
                {mode === "practice"
                  ? `${activeFruit.name} ${activeFruit.value} quiz`
                  : `${activeFruit.name} ${activeFruit.value} times table`}
              </h2>
              <div className="overlay-controls">
                <button
                  className="swap-toggle"
                  type="button"
                  onClick={handleSwapToggle}
                >
                  {swapOrder
                    ? `Swap to n × ${activeFruit.value}`
                    : `Swap to ${activeFruit.value} × n`}
                </button>
                {mode === "practice" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={() => {
                      setMode("study");
                      clearRevealed();
                    }}
                  >
                    Study again with Trudy!
                  </button>
                ) : (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={clearRevealed}
                  >
                    Refresh
                  </button>
                )}
                {mode === "study" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={handleStartPractice}
                  >
                    Go to quiz
                  </button>
                ) : null}
                {mode === "practice" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={handleStartOver}
                  >
                    Restart
                  </button>
                ) : null}
                {mode === "practice" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={() => handlePreviousTable("practice")}
                  >
                    {previousFruitValue ? `Redo ${previousFruitValue}s quiz` : "Previous quiz"}
                  </button>
                ) : null}
                {mode === "practice" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={() => handleNextTable("practice")}
                  >
                    {nextFruitValue ? `Do ${nextFruitValue}s quiz` : "Next quiz"}
                  </button>
                ) : null}
                {mode === "study" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={() => handlePreviousTable("study")}
                  >
                    Previous table
                  </button>
                ) : null}
                {mode === "study" ? (
                  <button
                    className="overlay-close"
                    type="button"
                    onClick={() => handleNextTable("study")}
                  >
                    Next table
                  </button>
                ) : null}
                <button
                  className={`overlay-close ${
                    closeFlash ? "flash" : ""
                  }`}
                  type="button"
                  onClick={handleCloseTable}
                >
                  Close
                </button>
              </div>
            </div>
            {mode === "study" ? (
              <div className="quiz">
                <p className="study-instructions">
                  <span className="instruction-label">Instructions:</span> Click
                  each left-hand-side of equations below, one at a time (touch
                  or tap on an IPAD, tablet, or a smartphone), then listen to
                  Trudy and repeat after her. (Keep in mind that hearing
                  yourself say it will help you remember it better!) When you
                  have completed the exercise, click "Quiz yourself" at the
                  bottom of the page.
                </p>
                <div className="table-card table-card-large overlay-table study-table">
                  {renderStaticRows(activeFruit)}
                </div>
                {(productRowByTable[activeFruit.value] ?? 0) >= 10 ? (
                  <button
                    className="quiz-link"
                    type="button"
                    onClick={handleStartPractice}
                  >
                    Quiz yourself
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                <form className="quiz" onSubmit={handleSubmit}>
                  <div className="table-card table-card-large overlay-table">
                    {renderQuizRows(activeFruit)}
                  </div>
                </form>
              </>
            )}
          </div>
          {externalMenuPortal}
        </div>
      ) : null}
    </main>
  );
}
export default MainPage
