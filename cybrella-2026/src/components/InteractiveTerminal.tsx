"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Zap, Activity, ShieldAlert, Cpu, Globe, MapPin, Calendar, Clock } from "lucide-react";

const BOOT_LOGS = [
	"INITIALIZING_SOCIETAL_CORE...",
	">> LOADING_MODULE: ETHICAL_COMPETITION_V3",
	">> SECURITY_CHECK: SYSTEM_DISCIPLINE [VALID]",
	">> UPLINKING_TO_REGIONAL_NODES: MANIPUR_SERVER_01",
	">> CONNECTION_STABLE: 12ms_LATENCY",
	">> AUTH_LEVEL: INSTITUTIONAL_GUEST",
	">> COMMANDS: 'help' | 'branding' | 'date' | 'location'",
	">> SYSTEM_READY_FOR_INPUT."
];

const EVENT_SCHEDULE: Record<string, string> = {
	"valorant": "FEB 23 | 10:00 AM - TACTICAL OPS",
	"fifa": "FEB 24 | 02:00 PM - VIRTUAL PITCH",
	"tekken": "FEB 25 | 11:00 AM - IRON FIST",
	"cosplay": "FEB 27 | 04:00 PM - GRAND FINALE",
};

const EVENTS_LIST = ["VALORANT PRO SERIES", "FIFA ULTIMATE LEAGUE", "TEKKEN 8 ARENA", "COSPLAY CHAMPIONSHIP"];
const SPONSORS_LIST = ["ZENITH COMPUTERS", "TITAN ENERGY CORP", "QUANTUM NETWORKS", "NEXUS STUDIOS"];

const CYBRELLA_ASCII_2 = `

`;

const CYBRELLA_ASCII = `
                              ::::::::  :::   :::  :::::::::  :::::::::   ::::::::::  :::         :::             ::::
                            :+:    :+: :+:   :+: :+:    :+:  :+:    :+:  :+:         :+:         :+:            :+: :+:
                           +:+         +:+ +:+  +:+    +:+  +:+    +:+  +:+         +:+         +:+           +:+   +:+
                          +#+          +#++:   +#++:++#+   +#++:++#:   +#++:++#    +#+         +#+          +#++:++#++: 
                         +#+           +#+    +#+    +#+  +#+    +#+  +#+         +#+         +#+          +#+     +#+ 
                        #+#    #+#    #+#    #+#    #+#  #+#    #+#  #+#    #+#  #+#         #+#         #+#     #+# 
                        ########     ###    #########   ###    ###  ##########  ##########  ##########  ###     ###
                                               @%
                                             @@@(       @@/
                                           *@@@@(   &@@@&   @@@@@@@@@@@@@@@@@@@@@@@@@@@@&#*
                                    .(&@@@@@@@@@%   @@@(  *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*
                           ,#@@@@@@@@@@@@@@@@@@@@   ,@%  ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*
                    *@@@@@@@@@@@@@@@@@@@@@@@@@@@@.      .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(
              #@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%.
        *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/    .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(
   *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(
*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*
 /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/   &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@   (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/
  /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ./@@@@@@@@@@@@@@/   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&  &@@@&&@@@@@@@@@@,  .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,
   .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  (@@@@@@@@@@@@@@@@.  .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&
    #@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  .@@@@@@@@@@@@@@@@@*   %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.  @@@@@@@@@@@@@@@@@@/   ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,
      @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%   &@@@@@@@@@@@@@@@@@@    /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#
      .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(    /@@@@@@@@@@@@@@@@@     *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&
       *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*     .@@@@@@@@@@@@@@@#      &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%     /@@@@@@@@@@@@@@@@.      .&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
         (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(     @@@@@@@@@@@@@@@@@@@@/ *@*     *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,    .@@@@@@@@@@@@@@@@@@@@@@@( *@@@@(      .%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
           *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     %@@@@@@@@@@@@@@@@@@@@@@@@@@%  @@@@@@@@@#         ,(&@@@@@@&/,  ,@@@@@@@@@@
            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  &@@@@@@@@@@@@@@@%#/,,.,/#%@@@@@@@@@@@@@@&
              @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*    /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#
               &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@ &@@@@@@@@@@@@@@@@@@@@@@@@@@@   #@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@,
                /@@@@@@@@@@@@@@@@@@@@@@@@@@&    ,@@@@@@@@@@#   *@@@@@@@@@@@@@@@@@@@@@@@@@@@@    ,@@@@@@@@@@@@@@@@@@@@@@@@@@
                  @@@@@@@@@@@@@@@@@@@@@@@@,    %@@@@@@@@@@@   ,@@@@@@@@@@@@@&..#@@@@@@@@@@@     /@@@@@@@@@@@@@@@@@@@@@@@@%
                   %@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@.  @@@@@@@@@@@@@@@@@@@@@%.  .,      .@@@@@@@@@@@@@@@@@@@@@@@@@.
                    .@@@@@@@@@@@@@@@@@@#    /@@@@@@@@@@@@/  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@/*(@@@@@@@@@@@@@@@@@@@@@@@@@@&
                      #@@@@@@@@@@@@@@@.    @@@@@@@@@@@@@&  %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
                        @@@@@@@@@@@@&    .@@@@@@@@@@@@@@  .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(
                         .@@@@@@@@@*    &@@@@@@@@@@@@@@&  &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&
                           /@@@@@@     @@@@@@@@@@@@@@@@/  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                             *@@/    %@@@@@@@@@@@@@@@@@,  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                                    @@@@@@@@@@@@@@@@@@@(  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                                   %@@@@@@@@@@@@@@@@@@@&  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                                    @@@@@@@@@@@@@@@@@@@@  (@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&
                                     .@@@@@@@@@@@@@@@@@@%  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#
                                        @@@@@@@@@@@@@@@@@  *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
                                          (@@@@@@@@@@@@@@@  %@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&
                                             @@@@@@@@@@@@@#  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
                                               ,@@@@@@@@@@@*  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@(
                                                  *@@@@@@@@@   @@@@@@@@@@@@@@@@@@@@@@@@@#
                                                     .@@@@@@@   @@@@@@@@@@@@@@@@@@@@@(
                                                         &@@@@.  @@@@@@@@@@@@@@@@@*
                                                            *@@(  &@@@@@@@@@@@@
                                                                (  .@@@@@@@/
                                                                     &@(



                       ::::::::  :::   :::  :::::::::  :::::::::   ::::::::::  :::         :::             ::::
                     :+:    :+: :+:   :+: :+:    :+:  :+:    :+:  :+:         :+:         :+:            :+: :+:
                    +:+         +:+ +:+  +:+    +:+  +:+    +:+  +:+         +:+         +:+           +:+   +:+
                   +#+          +#++:   +#++:++#+   +#++:++#:   +#++:++#    +#+         +#+          +#++:++#++: 
                  +#+           +#+    +#+    +#+  +#+    +#+  +#+         +#+         +#+          +#+     +#+ 
                 #+#    #+#    #+#    #+#    #+#  #+#    #+#  #+#    #+#  #+#         #+#         #+#     #+# 
                 ########     ###    #########   ###    ###  ##########  ##########  ##########  ###     ###

@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@(  #@@@@@@# ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    %@@%*   @@@                       .,/#&@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%.         /@@%  .@@*                                       .%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@#.                   @@@. @@/                                                 ,%@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@(                           &@@@@@&                                                          %@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@/                                  @@@@@                                                                 %@@@@@@@@@@@@@
@@@@@@&.                                       /@@@@                                                                      /@@@@@@@@
@@,                                             #@@@                                                                           @@@@
@@#                                              (@@@                                                                         #@@@@
@@@                                               ,@@@                                                                        @@@@@
@@@(                                                @@@.                                                                     (@@@@@
@@@@                                 .@@%,           ,@@@                                                                    @@@@@@
@@@@%                                 .@@              /@@&                                                                 %@@@@@@
@@@@@,                                  @@               *@@@                                                              .@@@@@@@
@@@@@@                                   @@(               .@@@/                                                           @@@@@@@@
@@@@@@&                                   &@@.                @@@@                                                        &@@@@@@@@
@@@@@@@#                                    @@@@                &@@@@                                                    (@@@@@@@@@
@@@@@@@@*                                     /@@@@@/             ,@@@@@*                                               *@@@@@@@@@@
@@@@@@@@@,                                       @@@@@(              %@@@@@@,                                          .@@@@@@@@@@@
@@@@@@@@@@,                                     @@@@@                  *@/ #@@@@&.                                    .@@@@@@@@@@@@
@@@@@@@@@@@,                                   @@@@&                     ,@(    *@@@@@@@@@@#.       /@@@@@#          ,@@@@@@@@@@@@@
@@@@@@@@@@@@/                                /@@@@.                         @@            *#@@@@@@@@**              *@@@@@@@@@@@@@@
@@@@@@@@@@@@@&                              &@@@@                             &@*                                  %@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@                            @@@@*                                ,@@*                              @@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@                         /@@@@         *@@                         ,@@@/                         @@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@#                      @@@@#          @@@%           &(            @@@@@                      /@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@                    @@@@           @@@                  ,@@@%,&@@@@@.                      @@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@(                #@@@&           (@@                          ((.                       *@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@              @@@@,            @@                                                    @@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@&          *@@@@             @@(                                                  %@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@(       @@@@#              @@                                                 *@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@/   *@@@@               *@@                                               ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@/@@@@%                ,@@                                              @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%                  @@                                           ,@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                  @@                                         /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&                 @@                                      &@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@               @@/                                   @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*             @@                                #@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@           .@@                            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@&         /@@                         @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@       %@@                     @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.    (@@                .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%  .@@            /@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*@@#      .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
`;

export default function InteractiveTerminal() {
	const [logs, setLogs] = useState<string[]>([]);
	const [input, setInput] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const [bootSequenceFinished, setBootSequenceFinished] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	useEffect(() => {
		let delay = 0;
		BOOT_LOGS.forEach((log, index) => {
			delay += Math.random() * 400 + 100;
			setTimeout(() => {
				setLogs((prev) => [...prev, log]);
				if (index === BOOT_LOGS.length - 1) setBootSequenceFinished(true);
			}, delay);
		});
	}, []);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [logs]);

	const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			const fullCmd = input.trim().toLowerCase();
			const [cmd, arg] = fullCmd.split(" --");

			setLogs((prev) => [...prev, `SYS_USER@CYBRELLA:~$ ${input.toUpperCase()}`]);

			switch (cmd) {
				case "help":
					setLogs((prev) => [...prev,
						">> AVAILABLE_PROTOCOLS:",
						"BRANDING :: CORE MISSION STATEMENT",
						"CYBRELLA :: DISPLAY SYSTEM IDENTITY",
						"EVENTS :: LIST ALL ACTIVE COMPETITIONS",
						"SPONSORS :: VIEW STRATEGIC PARTNERS",
						"DATE :: EVENT SCHEDULE WINDOW",
						"LOCATION :: GEOSPATIAL COORDINATES",
						"TIME --[NAME] :: SPECIFIC EVENT TIMING",
						"LS :: LIST ACTIVE MODULES",
						"CLEAR :: FLUSH_CONSOLE_BUFFER",
						"CYBRELLA --ADMIN :: SECURE_GATEWAY_ACCESS"
					]);
					break;

				case "branding":
					setLogs((prev) => [...prev, ">> MISSION: IMPACT OF ESPORTS IN SOCIETY."]);
					break;

				case "cybrella":
					if (arg === "admin") {
						setLogs((prev) => [...prev, ">> ACCESS_GRANTED. REDIRECTING_TO_AUTH_GATEWAY..."]);
						setTimeout(() => router.push("/login"), 1000);
					} else {
						// Splits the ASCII string by newlines and adds them to logs

						setLogs((prev) => [...prev, CYBRELLA_ASCII]);
					}
					break;

				case "date":
					setLogs((prev) => [...prev, ">> EVENT_WINDOW: FEB 23-27, 2026."]);
					break;

				case "events":
					setLogs((prev) => [...prev, ">> ACCESSING_EVENT_REGISTRY...", ...EVENTS_LIST.map(e => `>> [ACTIVE] ${e}`)]);
					break;

				case "sponsors":
					setLogs((prev) => [...prev, ">> RETRIEVING_PARTNER_DATA...", ...SPONSORS_LIST.map(s => `>> ${s}`)]);
					break;

				case "location":
					setLogs((prev) => [...prev, ">> COORDINATES: WILL BE HELD AT XYZ COLLEGE MAIN ARENA."]);
					break;

				case "time":
					if (!arg) {
						setLogs((prev) => [...prev, ">> ERROR: SPECIFY EVENT. USAGE: time --valorant", ">> OPTIONS: VALORANT, FIFA, TEKKEN, COSPLAY"]);
					} else if (EVENT_SCHEDULE[arg]) {
						setLogs((prev) => [...prev, `>> SCHEDULE_${arg.toUpperCase()}: ${EVENT_SCHEDULE[arg]}`]);
					} else {
						setLogs((prev) => [...prev, `>> ERROR: '${arg}' NOT FOUND IN SCHEDULE.`]);
					}
					break;

				case "ls":
					setLogs((prev) => [...prev, "MODULES: [ARENA_CONTROL] [USER_AUTH] [EVENT_DATABASE] [SOCIETAL_IMPACT_V1]"]);
					break;

				case "whoami":
					setLogs((prev) => [...prev, ">> IDENTITY: GUEST_STAKEHOLDER", ">> STATUS: MONITORING_ONLY"]);
					break;

				case "clear":
					setLogs([]);
					break;

				case "":
					break;

				default:
					setLogs((prev) => [...prev, `>> ERROR: '${cmd.toUpperCase()}'_INVALID_INSTRUCTION.`]);
			}
			setInput("");
		}
	};

	return (
		<div className="relative w-full max-w-2xl mx-auto font-montserrat text-sm group">
			{/* Institutional CPU Load Sticker */}
			<motion.div
				initial={{ y: -20, opacity: 0 }}
				animate={{ y: -45, opacity: 1, rotate: -2 }}
				className="w-fit absolute -top-10 -right-4 md:-right-8 z-20 bg-[#990000] text-white border-2 border-black p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1 w-36 hidden md:flex"
			>
				<div className="flex justify-between items-center gap-1 border-b border-white/30 pb-1 mb-1 w-fit">
					<span className="font-medium text-[12px] uppercase tracking-tighter">PROCESSOR_LOAD</span>
					<Zap className="w-4 h-4 text-white" />
				</div>
				<div className="w-full h-1.5 bg-black/40 border border-black/20 overflow-hidden">
					<motion.div
						animate={{ width: ["10%", "95%", "30%", "85%", "20%", "45%", "10%"] }}
						transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
						className="h-full bg-[#08cc00]"
					/>
				</div>
			</motion.div>

			{/* Main Institutional Terminal Window */}
			<div
				className="bg-[#000000] border-4 border-black rounded-sm shadow-[20px_20px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden relative z-10"
				onClick={() => inputRef.current?.focus()}
			>
				{/* Header */}
				<div className="bg-[#263901] border-b-2 border-black p-3 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex gap-1.5">
							<div className="w-2.5 h-2.5 bg-[#990000] border border-black" />
							<div className="w-2.5 h-2.5 bg-[#08cc00] border border-black" />
						</div>
						<span className="text-[10px] font-black text-white/80 tracking-widest uppercase">
							Terminal_Session: 02_2026
						</span>
					</div>
					<div className="text-[10px] text-white/40 flex items-center gap-2 font-bold uppercase">
						<Terminal className="w-3 h-3" /> system_v3.0
					</div>
				</div>

				{/* Content Area */}
				<div
					ref={scrollRef}
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
					className="h-[560px] overflow-y-scroll p-8 pb-2 font-montserrat text-[#08cc00] selection:bg-[#08cc00] selection:text-black"
				>
					<div className="space-y-2">
						{logs.map((log, i) => {
							// Detect if the log is an ASCII block (like the text or the heart)
							const isAscii = log.includes("@@@") || log.includes(":::");

							return (
								<div key={i}>
									{isAscii ? (
										<pre 
											className="font-mono text-[6px] md:text-[8px] leading-[1.1] text-white whitespace-pre tracking-normal py-2 overflow-x-visible"
											style={{ 
												fontVariantLigatures: 'none',
												fontFamily: 'monospace' 
											}}
										>
											{log}
										</pre>
									) : (
										<div className="font-bold tracking-tight uppercase text-xs">
											{log.startsWith("SYS_USER") ? (
												<span className="text-[#08cc00]">{log}</span>
											) : log.startsWith(">>") ? (
												<span className="text-white/60">
													<span className="text-[#08cc00] mr-1">{" >> "}</span>
													{log.replace(">>", "").trim()}
												</span>
											) : (
												<span className={log.includes("ERROR") ? "text-[#990000]" : "text-white"}>
													{log}
												</span>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Input Line */}
					{bootSequenceFinished && (
						<div className="flex items-center mt-4">
							<span className="text-[#08cc00] mr-3 font-black text-xs uppercase shrink-0">SYS_USER@CYBRELLA:~$</span>
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleCommand}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="bg-transparent border-none outline-none flex-1 text-white text-xs uppercase"
								autoComplete="off"
								autoFocus
							/>
							{isFocused && (
								<motion.span
									animate={{ opacity: [1, 0] }}
									transition={{ repeat: Infinity, duration: 0.6 }}
									className="w-2.5 h-4 bg-[#08cc00] -ml-1"
								/>
							)}
						</div>
					)}
				</div>

				{/* Status Footer */}
				<div className="bg-[#111111] border-t-2 border-black p-3 px-6 flex justify-between items-center text-[9px] font-black text-white/30 uppercase tracking-widest">
					<span className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 bg-[#08cc00] rounded-full animate-pulse" />
						INTEGRITY_VERIFIED
					</span>
					<div className="flex gap-4">
						<span className="flex items-center gap-1.5">
							<Globe className="w-3 h-3" /> GLOBAL_UPLINK
						</span>
						<span className="flex items-center gap-1.5">
							<Activity className="w-3 h-3" /> SENSORS: ACTIVE
						</span>
					</div>
				</div>
			</div>

			{/* Floating System Alert */}
			<AnimatePresence>
				{bootSequenceFinished && (
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5 }}
						className="absolute -bottom-16 -left-6 md:-left-10 bg-white text-black border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-30 max-w-[220px]"
					>
						<div className="flex items-center gap-2 text-[10px] font-black text-[#990000] uppercase mb-2">
							<ShieldAlert className="w-4 h-4" /> System_Integrity
						</div>
						<div className="text-[11px] font-bold leading-none tracking-tight">
							DISCIPLINED ACCESS ONLY. UNRECOGNIZED PROTOCOLS WILL BE TERMINATED.
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* Hint Arrow and Text */}
			<AnimatePresence>
				{bootSequenceFinished && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.5, duration: 0.8 }}
						className="absolute -bottom-22 right-0 md:right-10 flex flex-col items-center z-0"
					>
						<motion.div
							animate={{ y: [0, -8, 0] }}
							transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
						>
							<svg width="50" height="50" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
								<rect width="30" height="30" fill="" />
								<path
									d="M 65 85 C 60 80 45 75 45 55 C 45 25 85 25 85 45 C 85 65 55 65 45 45 L 20 20 M 35 20 H 20 V 35"
									stroke="white"
									strokeWidth="8"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</motion.div>
						<span className="text-[#08cc00] font-bold text-xl italic tracking-tighter drop-shadow-[0_0_8px_rgba(8,204,0,0.6)]">
							TYPE &quot;HELP&quot;
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}